import React, { useState, useMemo } from "react";
import {
  Home,
  FileText,
  Star,
  Users,
  Briefcase,
  Monitor,
  Code,
  Book,
  Layers,
  Trash,
  Plus,
  Search,
  Filter,
  Grid,
  List
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Button, 
  Typography,
  Input,
  Badge,
  EmptyState,
  Avatar,
  AvatarImage,
  AvatarFallback
} from "@taskflow/ui";
import { DashboardShell } from "./DashboardShell";
import { useAppSelector } from "../../store";

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  author: {
    name: string;
    avatar?: string;
  };
  views: number;
  likes: number;
  downloads: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

type CategoryKey = 'business' | 'design' | 'marketing' | 'education' | 'development' | 'team';

const Templates: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);
  const [activeCategory, setActiveCategory] = useState<'all' | CategoryKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'name'>('newest');

  // Mock templates data - in real app this would come from API
  const templates: Template[] = useMemo(() => [
    {
      id: '1',
      title: 'Project Proposal Template',
      description: 'Professional project proposal template with customizable sections',
      category: 'business',
      author: { name: 'Sarah Wilson', avatar: 'https://i.pravatar.cc/40?img=1' },
      views: 1250,
      likes: 89,
      downloads: 234,
      tags: ['proposal', 'business', 'professional'],
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20'
    },
    {
      id: '2',
      title: 'UI Component Library',
      description: 'Complete UI component library for React applications',
      category: 'design',
      author: { name: 'Mike Johnson', avatar: 'https://i.pravatar.cc/40?img=2' },
      views: 2100,
      likes: 156,
      downloads: 567,
      tags: ['ui', 'components', 'react'],
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18'
    },
    {
      id: '3',
      title: 'Marketing Campaign Plan',
      description: 'Comprehensive marketing campaign planning template',
      category: 'marketing',
      author: { name: 'Emma Davis', avatar: 'https://i.pravatar.cc/40?img=3' },
      views: 980,
      likes: 67,
      downloads: 123,
      tags: ['marketing', 'campaign', 'planning'],
      createdAt: '2024-01-12',
      updatedAt: '2024-01-16'
    }
  ], []);

  const categories: Array<{ key: CategoryKey; label: string; icon: React.ReactNode; count: number }> = [
    { key: 'business', label: 'Business', icon: <Briefcase size={16} />, count: 12 },
    { key: 'design', label: 'Design', icon: <Monitor size={16} />, count: 8 },
    { key: 'marketing', label: 'Marketing', icon: <Star size={16} />, count: 6 },
    { key: 'education', label: 'Education', icon: <Book size={16} />, count: 4 },
    { key: 'development', label: 'Development', icon: <Code size={16} />, count: 10 },
    { key: 'team', label: 'Team', icon: <Users size={16} />, count: 5 }
  ];

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let filtered = templates;
    
    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(template => template.category === activeCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template => 
        template.title.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.views - a.views;
        case 'name':
          return a.title.localeCompare(b.title);
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    
    return filtered;
  }, [templates, activeCategory, searchQuery, sortBy]);

  const handleCreateTemplate = () => {
    // TODO: Implement template creation
    console.log('Create template');
  };

  const handleTemplateClick = (template: Template) => {
    // TODO: Navigate to template detail or open preview
    console.log('Template clicked:', template);
  };

  return (
    <DashboardShell title="Templates">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="h1" className="text-2xl font-bold">
              Templates
            </Typography>
            <Typography variant="body-medium" className="text-muted-foreground">
              Browse and use professional templates for your projects
            </Typography>
          </div>
          <Button onClick={handleCreateTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters and View Controls */}
        <div className="flex items-center justify-between">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory('all')}
            >
              All ({templates.length})
            </Button>
            {categories.map(category => (
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

          {/* View Controls */}
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

      {/* Templates Grid/List */}
      {filteredTemplates.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredTemplates.map(template => (
            <Card
              key={template.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleTemplateClick(template)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{template.title}</CardTitle>
                    <Typography variant="body-small" className="text-muted-foreground mb-3">
                      {template.description}
                    </Typography>
                  </div>
                  <Badge variant="secondary">
                    {template.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Author */}
                <div className="flex items-center gap-2 mb-3">
                  <Avatar size="sm">
                    <AvatarImage src={template.author.avatar} />
                    <AvatarFallback variant="primary" size="sm">
                      {template.author.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <Typography variant="caption" className="text-muted-foreground">
                    by {template.author.name}
                  </Typography>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {template.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.tags.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>{template.views} views</span>
                    <span>{template.likes} likes</span>
                    <span>{template.downloads} downloads</span>
                  </div>
                  <Typography variant="caption">
                    {new Date(template.updatedAt).toLocaleDateString()}
                  </Typography>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FileText className="h-12 w-12" />}
          title="No templates found"
          description={
            searchQuery 
              ? `No templates match "${searchQuery}". Try adjusting your search.`
              : "No templates available in this category."
          }
          action={
            searchQuery ? {
              label: "Clear Search",
              onClick: () => setSearchQuery(''),
              variant: "outline"
            } : undefined
          }
        />
      )}

      {/* Recent Activity */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                <Avatar size="sm">
                  <AvatarImage src={user?.user?.avatar} />
                  <AvatarFallback variant="primary" size="sm">
                    {user?.user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Typography variant="body-small">
                    <span className="font-medium">You</span> downloaded "Project Proposal Template"
                  </Typography>
                  <Typography variant="caption" className="text-muted-foreground">
                    2 hours ago
                  </Typography>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                <Avatar size="sm">
                  <AvatarImage src="https://i.pravatar.cc/40?img=4" />
                  <AvatarFallback variant="primary" size="sm">J</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Typography variant="body-small">
                    <span className="font-medium">John Smith</span> liked "UI Component Library"
                  </Typography>
                  <Typography variant="caption" className="text-muted-foreground">
                    4 hours ago
                  </Typography>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
};

export default Templates;
