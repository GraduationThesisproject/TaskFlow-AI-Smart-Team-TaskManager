import React, { useState, useEffect } from 'react';
import { 
  Modal,
  ModalHeader,
  ModalTitle,
  ModalContent,
  ModalFooter,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Typography,
  Badge,
  Grid,
  Input,
  Select,
  SelectItem,
  Container
} from '@taskflow/ui';
import { env } from '../../config/env';
import { BoardTemplate } from '../../types/boardTemplate.types';
import {
  MagnifyingGlassIcon,
  StarIcon,
  UsersIcon,
  CalendarIcon,
  TagIcon,
  EyeIcon,
  SparklesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';



interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateSelect: (template: BoardTemplate) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ 
  isOpen, 
  onClose, 
  onTemplateSelect 
}) => {
  const [templates, setTemplates] = useState<BoardTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<BoardTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest'>('popular');

  const categories = [
    'all',
    'Business',
    'IT',
    'Personal',
    'Marketing',
    'Development',
    'Design',
    'Sales',
    'Support',
    'Operations',
    'HR',
    'Finance',
    'General',
    'Custom'
  ];

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  useEffect(() => {
    filterAndSortTemplates();
  }, [templates, searchTerm, selectedCategory, sortBy]);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${env.API_BASE_URL}/board-templates`);
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      
      const data = await response.json();
      setTemplates(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
      console.error('Error fetching templates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortTemplates = () => {
    let filtered = templates.filter(template => template.isActive && template.isPublic);

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase())) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template =>
        template.categories.includes(selectedCategory)
      );
    }

    // Sort templates
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.usageCount - a.usageCount);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating.average - a.rating.average);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    setFilteredTemplates(filtered);
  };

  const handleTemplateSelect = (template: BoardTemplate) => {
    onTemplateSelect(template);
    onClose();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#DC2626';
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgent';
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return priority;
    }
  };

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalHeader>
        <ModalTitle className="flex items-center space-x-2">
          <SparklesIcon className="w-5 h-5" />
          <span>Choose a Board Template</span>
        </ModalTitle>
      </ModalHeader>
      
      <ModalContent>
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value)}
              >
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </Select>
              
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as 'popular' | 'rating' | 'newest')}
              >
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </Select>
            </div>
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <Typography variant="body-medium" className="text-red-600">
                  {error}
                </Typography>
              </div>
            )}
          </div>

          {/* Templates Grid */}
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <SparklesIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <Typography variant="heading-large" className="text-muted-foreground mb-2">
                No templates found
              </Typography>
              <Typography variant="body-medium" className="text-muted-foreground">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'No board templates are available at the moment'
                }
              </Typography>
            </div>
          ) : (
            <Grid cols={3} className="gap-6">
              {filteredTemplates.map((template) => (
                <Card 
                  key={template.id} 
                  className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02]"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate mb-2">
                          {template.name}
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" size="sm">
                            {template.categories[0]}
                          </Badge>
                          {template.categories.length > 1 && (
                            <Badge variant="outline" size="sm">
                              +{template.categories.length - 1}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                        <Typography variant="body-small">
                          {template.rating.average.toFixed(1)}
                        </Typography>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <Typography variant="body-medium" className="text-muted-foreground mb-4">
                      {template.description}
                    </Typography>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <Typography variant="body-small" className="text-muted-foreground">
                          Lists
                        </Typography>
                        <Typography variant="body-medium">
                          {template.defaultLists.length}
                        </Typography>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Typography variant="body-small" className="text-muted-foreground">
                          Cards
                        </Typography>
                        <Typography variant="body-medium">
                          {template.defaultCards.length}
                        </Typography>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Typography variant="body-small" className="text-muted-foreground">
                          Usage
                        </Typography>
                        <Typography variant="body-medium">
                          {template.usageCount}
                        </Typography>
                      </div>
                    </div>
                    
                    {/* Preview of lists */}
                    <div className="space-y-2">
                      <Typography variant="body-small" className="text-muted-foreground">
                        Lists:
                      </Typography>
                      <div className="flex flex-wrap gap-1">
                        {template.defaultLists.slice(0, 3).map((list) => (
                          <div
                            key={list.id}
                            className="flex items-center space-x-1 px-2 py-1 rounded text-xs"
                            style={{ backgroundColor: list.color + '20' }}
                          >
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: list.color }}
                            />
                            <span className="text-xs">{list.title}</span>
                          </div>
                        ))}
                        {template.defaultLists.length > 3 && (
                          <Badge variant="outline" size="sm">
                            +{template.defaultLists.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Preview of sample cards */}
                    {template.defaultCards.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <Typography variant="body-small" className="text-muted-foreground">
                          Sample Cards:
                        </Typography>
                        <div className="space-y-1">
                          {template.defaultCards.slice(0, 2).map((card, index) => (
                            <div key={index} className="p-2 bg-muted/30 rounded text-xs">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium truncate">{card.title}</span>
                                <div 
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: getPriorityColor(card.priority) }}
                                />
                              </div>
                              {card.description && (
                                <Typography variant="body-small" className="text-muted-foreground truncate">
                                  {card.description}
                                </Typography>
                              )}
                            </div>
                          ))}
                          {template.defaultCards.length > 2 && (
                            <div className="text-center text-xs text-muted-foreground">
                              +{template.defaultCards.length - 2} more cards
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-4">
                      <div className="flex items-center space-x-1">
                        <UsersIcon className="w-3 h-3" />
                        <span>{template.createdBy.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="w-3 h-3" />
                        <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </Grid>
          )}
        </div>
      </ModalContent>
      
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default TemplateSelector;
