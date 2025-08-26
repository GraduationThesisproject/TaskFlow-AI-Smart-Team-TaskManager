import React, { useEffect, useMemo, useState } from 'react';
import TemplateCard  from './TemplateCard';
import { EmptyState, Button, Input, Typography } from '@taskflow/ui';
import { FileText, Grid, List, Search, Plus } from 'lucide-react';
import type { TemplateCardItem } from '../../../types/dash.types';
import { useTemplates } from '../../../hooks/useTemplates';
import { useAppSelector } from '../../../store';
import { selectUserBasic } from '../../../store/slices/authSlice';
import { CATEGORY_OPTIONS } from '../../../types/dash.types';
import { CreateTemplateModal } from './modals/CreateTemplateModal';

// Category options are sourced from Create Template modal options

const TemplatesList: React.FC = () => {
  const { items: storeItems, loading, error, load, incrementViews, toggleLike } = useTemplates();
  const userBasic = useAppSelector(selectUserBasic) as any;
  const [templates, setTemplates] = useState<TemplateCardItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<'all' | string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'name'>('newest');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Load templates on mount
  useEffect(() => {
    // Show public templates from all users
    load({ isPublic: true, status: 'active' });
  }, [load]);

  // Map store model -> UI card model
  useEffect(() => {
    const safeItems = Array.isArray(storeItems) ? storeItems : [];
    const mapped: TemplateCardItem[] = safeItems.map((t) => ({
      id: t._id,
      title: t.name,
      description: t.description ?? '',
      type: (t as any)?.type,
      category: t.category ?? 'General',
      author: {
        name:
          // Prefer populated creator info if available (displayName is a virtual)
          (typeof (t as any)?.createdBy === 'object'
            ? (
                (t as any).createdBy.displayName
                || (t as any).createdBy.name
                || (t as any).createdBy.email
              )
            : undefined)
          // If not populated, avoid attributing to the current user; use a neutral placeholder
          || 'Unknown',
      },
      views: (t as any)?.views ?? 0,
      // Prefer server numeric likes; fallback to likedBy length
      likes: typeof (t as any)?.likes === 'number'
        ? (t as any).likes
        : Array.isArray((t as any)?.likedBy)
          ? (t as any).likedBy.length
          : 0,
      downloads: 0,
      tags: t.tags ?? [],
      createdAt: t.createdAt ?? new Date().toISOString(),
      updatedAt: t.updatedAt ?? new Date().toISOString(),
      // handle both ObjectId[] and populated user[]
      userLiked: Array.isArray((t as any)?.likedBy) && (t as any).likedBy.some((u: any) => {
        const uid = String((userBasic as any)?._id || (userBasic as any)?.id || '');
        if (!uid) return false;
        return typeof u === 'string' || typeof u === 'number'
          ? String(u) === uid
          : String(u?._id) === uid;
      }),
      // pass through for tooltips (names populated by backend when available)
      likedBy: Array.isArray((t as any)?.likedBy)
        ? (t as any).likedBy.map((u: any) => (
            typeof u === 'string' || typeof u === 'number'
              ? { _id: String(u) }
              : { _id: String(u?._id), name: u?.name, displayName: u?.displayName }
          ))
        : [],
      viewedBy: Array.isArray((t as any)?.viewedBy)
        ? (t as any).viewedBy.map((u: any) => (
            typeof u === 'string' || typeof u === 'number'
              ? { _id: String(u) }
              : { _id: String(u?._id), name: u?.name, displayName: u?.displayName }
          ))
        : [],
    }));
    setTemplates(mapped);
    
  }, [storeItems, userBasic]);

  const categories = useMemo(() => {
    // Initialize counts for each category from Create Template options
    const counts: Record<string, number> = CATEGORY_OPTIONS.reduce((acc, opt) => {
      acc[opt.value] = 0;
      return acc;
    }, {} as Record<string, number>);

    for (const t of templates) {
      if (t.category && counts.hasOwnProperty(t.category)) {
        counts[t.category] += 1;
      }
    }

    return CATEGORY_OPTIONS.map(opt => ({
      key: opt.value,
      label: opt.label,
      // keep icons optional; undefined renders nothing
      icon: undefined,
      count: counts[opt.value] ?? 0,
    }));
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    let filtered = [...templates];

    if (activeCategory !== 'all') {
      filtered = filtered.filter((t) => t.category === activeCategory);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular': {
          const score = (t: typeof a) => (t.likes ?? 0) * 3 + (t.views ?? 0);
          return score(b) - score(a);
        }
        case 'name':
          return a.title.localeCompare(b.title);
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }, [templates, activeCategory, searchQuery, sortBy]);

  const handleTemplateClick = (t: TemplateCardItem) => {
    // Explicitly increment views (unique per user) on open
    incrementViews(t.id);
    // Optionally fetch details if needed elsewhere
    // fetchOne(t.id);
    console.log('Template clicked:', t);
  };

  const handleLike = (t: TemplateCardItem) => {
    toggleLike(t.id);
  };

  return (
    <>
      {/* Search and Filters */}
      <div className="mb-6 space-y-4 rounded-lg p-4 backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_16px_hsl(var(--accent)/0.12)]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory('all')}
            >
              All ({templates.length})
            </Button>
            {categories.map((c) => (
              <Button
                key={c.key}
                variant={activeCategory === c.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(c.key)}
                className="flex items-center gap-2"
              >
                {c.icon}
                {c.label} ({c.count})
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'popular' | 'name')}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
            >
              <option value="newest">Newest</option>
              <option value="popular">Most Popular</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading / Error States */}
      {loading && (
        <div className="py-10 text-center">
          <Typography variant="body-medium">Loading templates...</Typography>
        </div>
      )}
      {error && !loading && (
        <div className="py-10 text-center">
          <Typography variant="body-medium">{error}</Typography>
        </div>
      )}

      {/* Templates Grid/List */}
      {!loading && !error && filteredTemplates.length === 0 ? (
        <div className="space-y-6">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="flex h-24 w-full max-w-md items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span className="text-sm">Create new template</span>
              </div>
            </button>
          </div>
          <EmptyState
            icon={<FileText className="h-12 w-12" />}
            title="No templates found"
            description={
              searchQuery
                ? `No templates match "${searchQuery}". Try adjusting your search.`
                : 'No templates available yet. Create your first template to get started.'
            }
            action={
              searchQuery
                ? { label: 'Clear Search', onClick: () => setSearchQuery(''), variant: 'outline' }
                : undefined
            }
          />
        </div>
      ) : (
        !loading && !error && (
          <>
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {viewMode === 'grid' && (
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(true)}
                  className="flex h-24 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span className="text-sm">Create new template</span>
                  </div>
                </button>
              )}

              {filteredTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} onClick={handleTemplateClick} onLike={handleLike} />
              ))}
            </div>
          </>
        )
      )}
      {/* Modal mount (always available) */}
      <CreateTemplateModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </>
  );
};

export default TemplatesList;
