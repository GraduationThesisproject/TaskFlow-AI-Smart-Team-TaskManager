import React, { useEffect, useMemo, useState } from 'react';
import TemplateCard  from './TemplateCard';
import { EmptyState, Button, Input, Typography } from '@taskflow/ui';
import { FileText, Grid, List, Search } from 'lucide-react';
import type { TemplateCardItem } from '../../../types/dash.types';
import { useTemplates } from '../../../hooks/useTemplates';
import { useAuth } from '../../../hooks/useAuth';
import { CATEGORY_OPTIONS } from '../../../types/dash.types';

// Category options are sourced from Create Template modal options

const TemplatesList: React.FC = () => {
  const { items: storeItems, loading, error, load, fetchOne, toggleLike } = useTemplates();
  const { user } = useAuth();
  const [templates, setTemplates] = useState<TemplateCardItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<'all' | string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'name'>('newest');

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
      category: t.category ?? 'General',
      author: {
        name:
          // Prefer populated creator info if available
          (typeof (t as any)?.createdBy === 'object'
            ? ((t as any).createdBy.name || (t as any).createdBy.email)
            : undefined)
          // Fallback to current authenticated user
          || ((user as any)?.displayName || user?.user?.name || user?.user?.email)
          // Generic fallback
          || 'User',
      },
      views: (t as any)?.views ?? 0,
      likes: Array.isArray((t as any)?.likedBy) ? (t as any).likedBy.length : 0,
      downloads: 0,
      tags: t.tags ?? [],
      createdAt: t.createdAt ?? new Date().toISOString(),
      updatedAt: t.updatedAt ?? new Date().toISOString(),
      userLiked: Array.isArray((t as any)?.likedBy) && (t as any).likedBy.some((u: any) => String(u) === String((user as any)?.user?._id || (user as any)?.user?.id)),
    }));
    setTemplates(mapped);
    
  }, [storeItems, user]);

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
    // Fetching the template will auto-increment views on the backend
    fetchOne(t.id);
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
        <EmptyState
          icon={<FileText className="h-12 w-12" />}
          title="No templates found"
          description={
            searchQuery
              ? `No templates match "${searchQuery}". Try adjusting your search.`
              : 'No templates available in this category.'
          }
          action={
            searchQuery
              ? { label: 'Clear Search', onClick: () => setSearchQuery(''), variant: 'outline' }
              : undefined
          }
        />
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
