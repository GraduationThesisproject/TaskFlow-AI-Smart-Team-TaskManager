import React, { useEffect, useMemo, useState } from 'react';
import TemplateCard  from './TemplateCard';
import { EmptyState, Button, Input, Typography } from '@taskflow/ui';
import { FileText, Grid, List, Search } from 'lucide-react';
import type { TemplateCardItem } from '../../../types/dash.types';
import { useTemplates } from '../../../hooks/useTemplates';
import { useAppSelector } from '../../../store';
import { selectUserBasic } from '../../../store/slices/authSlice';
import { CATEGORY_OPTIONS } from '../../../types/dash.types';

// Category options for template filtering

const TemplatesList: React.FC = () => {
  const { items: storeItems, loading, error, load, incrementViews, toggleLike } = useTemplates();
  const userBasic = useAppSelector(selectUserBasic) as any;
  const [templates, setTemplates] = useState<TemplateCardItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<'all' | string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'name'>('newest');
  // Track which templates this user has already viewed in this session to avoid multiple increments
  const [locallyViewed, setLocallyViewed] = useState<Record<string, boolean>>({});

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
            : (
                // Fallback: if createdBy is an id matching the current user, use current user's basic info
                (() => {
                  const uid = String((userBasic as any)?._id || (userBasic as any)?.id || '');
                  const createdById = String((t as any)?.createdBy || '');
                  if (uid && createdById && uid === createdById) {
                    return (userBasic as any)?.displayName || (userBasic as any)?.name || (userBasic as any)?.email;
                  }
                  return undefined;
                })()
              ))
          || 'Unknown',
        // Pass creator avatar if available when createdBy is populated; else fallback to current user's avatar when createdBy equals current user id
        avatar: (typeof (t as any)?.createdBy === 'object' && (t as any).createdBy?.avatar)
          ? (t as any).createdBy.avatar
          : (() => {
              const uid = String((userBasic as any)?._id || (userBasic as any)?.id || '');
              const createdById = String((t as any)?.createdBy || '');
              if (uid && createdById && uid === createdById) {
                return (userBasic as any)?.avatar;
              }
              return undefined;
            })(),
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
    // Initialize counts for each category
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
    const uid = String((userBasic as any)?._id || (userBasic as any)?.id || '');
    const alreadyViewedServer = Array.isArray((t as any)?.viewedBy)
      ? (t as any).viewedBy.some((u: any) => String(u?._id) === uid)
      : false;
    const alreadyViewedLocal = !!locallyViewed[t.id];

    // Only count one view per user: skip if already viewed
    if (!alreadyViewedServer && !alreadyViewedLocal) {
      setTemplates(prev => prev.map(item => (
        item.id === t.id ? { ...item, views: (item.views ?? 0) + 1 } : item
      )));
      setLocallyViewed(prev => ({ ...prev, [t.id]: true }));
      // Sync with backend (server should also ensure uniqueness)
      incrementViews(t.id);
    }

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
          <EmptyState
            icon={<FileText className="h-12 w-12" />}
            title="No templates found"
            description={
              searchQuery
                ? `No templates match "${searchQuery}". Try adjusting your search.`
                : 'No templates available yet.'
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
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} onClick={handleTemplateClick} onLike={handleLike} />
            ))}
          </div>
        )
      )}
    </>
  );
};

export default TemplatesList;