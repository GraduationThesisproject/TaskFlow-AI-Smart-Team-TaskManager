import React from 'react';
import { Button, Input } from '@taskflow/ui';
import { Grid, List, Search } from 'lucide-react';
import type { CategoryKey, Category } from '../../../types/dash.types';

interface TemplatesFiltersProps {
  activeCategory: 'all' | CategoryKey;
  setActiveCategory: (c: 'all' | CategoryKey) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (m: 'grid' | 'list') => void;
  sortBy: 'newest' | 'popular' | 'name';
  setSortBy: (s: 'newest' | 'popular' | 'name') => void;
  templatesCount: number;
  categories: Category[];
}

const TemplatesFilters: React.FC<TemplatesFiltersProps> = ({
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  templatesCount,
  categories,
}) => {
  return (
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
            All ({templatesCount})
          </Button>
          {categories.map((category) => (
            <Button
              key={category.key}
              variant={activeCategory === category.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(category.key)}
              className="flex items-center gap-2"
            >
              {category.icon}
              {category.label} ({category.count})
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
            <option value="popular">Most Popular (likes + views)</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TemplatesFilters;
