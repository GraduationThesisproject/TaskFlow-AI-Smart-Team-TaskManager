import React from 'react';
import { BoardTemplate, PRIORITY_OPTIONS } from '../../types/boardTemplate.types';
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
  Container
} from '@taskflow/ui';
import {
  XMarkIcon,
  StarIcon,
  UsersIcon,
  CalendarIcon,
  TagIcon,
  EyeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface TemplatePreviewProps {
  template: BoardTemplate;
  onClose: () => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template, onClose }) => {
  const getPriorityColor = (priority: string) => {
    const option = PRIORITY_OPTIONS.find(opt => opt.value === priority);
    return option?.color || '#6B7280';
  };

  const getPriorityLabel = (priority: string) => {
    const option = PRIORITY_OPTIONS.find(opt => opt.value === priority);
    return option?.label || priority;
  };

  return (
    <Modal isOpen={true} onClose={onClose} size="6xl">
      <ModalHeader>
        <ModalTitle className="flex items-center space-x-2">
          <EyeIcon className="w-5 h-5" />
          <span>Template Preview: {template.name}</span>
        </ModalTitle>
      </ModalHeader>
      
      <ModalContent>
        <div className="space-y-6">
          {/* Template Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Template Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Typography variant="body-medium" className="text-muted-foreground mb-2">
                    Description
                  </Typography>
                  <Typography variant="body-medium" className="mb-4">
                    {template.description}
                  </Typography>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <TagIcon className="w-4 h-4 text-muted-foreground" />
                      <Typography variant="body-small" className="text-muted-foreground">
                        Categories:
                      </Typography>
                      <div className="flex flex-wrap gap-1">
                        {template.categories.map(category => (
                          <Badge key={category} variant="secondary" size="sm">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <DocumentTextIcon className="w-4 h-4 text-muted-foreground" />
                      <Typography variant="body-small" className="text-muted-foreground">
                        Tags:
                      </Typography>
                      <div className="flex flex-wrap gap-1">
                        {template.tags.length > 0 ? (
                          template.tags.map(tag => (
                            <Badge key={tag} variant="outline" size="sm">
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <Typography variant="body-small" className="text-muted-foreground">
                            No tags
                          </Typography>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Typography variant="body-small" className="text-muted-foreground">
                        Status
                      </Typography>
                      <Badge variant={template.isActive ? 'success' : 'secondary'}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Typography variant="body-small" className="text-muted-foreground">
                        Visibility
                      </Typography>
                      <Badge variant={template.isPublic ? 'default' : 'secondary'}>
                        {template.isPublic ? 'Public' : 'Private'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Typography variant="body-small" className="text-muted-foreground">
                        Usage Count
                      </Typography>
                      <Typography variant="body-medium">
                        {template.usageCount}
                      </Typography>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Typography variant="body-small" className="text-muted-foreground">
                        Rating
                      </Typography>
                      <div className="flex items-center space-x-1">
                        <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                        <Typography variant="body-medium">
                          {template.rating.average.toFixed(1)}
                        </Typography>
                        <Typography variant="body-small" className="text-muted-foreground">
                          ({template.rating.count})
                        </Typography>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Typography variant="body-small" className="text-muted-foreground">
                        Created
                      </Typography>
                      <Typography variant="body-small">
                        {new Date(template.createdAt).toLocaleDateString()}
                      </Typography>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Typography variant="body-small" className="text-muted-foreground">
                        Created By
                      </Typography>
                      <Typography variant="body-small">
                        {template.createdBy.name}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Board Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Board Preview</CardTitle>
              <Typography variant="body-small" className="text-muted-foreground">
                This is how the board will look when created from this template
              </Typography>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex space-x-4 overflow-x-auto pb-4">
                  {template.defaultLists.map((list) => (
                    <div
                      key={list.id}
                      className="flex-shrink-0 w-80 bg-background rounded-lg border shadow-sm"
                    >
                      {/* List Header */}
                      <div 
                        className="p-3 rounded-t-lg border-b"
                        style={{ backgroundColor: list.color + '20' }}
                      >
                        <div className="flex items-center justify-between">
                          <Typography variant="body-medium" className="font-medium">
                            {list.title}
                          </Typography>
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: list.color }}
                          />
                        </div>
                      </div>
                      
                      {/* List Cards */}
                      <div className="p-2 space-y-2 min-h-[200px]">
                        {template.defaultCards
                          .filter(card => card.listId === list.title)
                          .sort((a, b) => a.order - b.order)
                          .map((card, cardIndex) => (
                            <div
                              key={cardIndex}
                              className="p-3 bg-card border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="space-y-2">
                                <Typography variant="body-medium" className="font-medium">
                                  {card.title}
                                </Typography>
                                
                                {card.description && (
                                  <Typography variant="body-small" className="text-muted-foreground">
                                    {card.description}
                                  </Typography>
                                )}
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <div 
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: getPriorityColor(card.priority) }}
                                    />
                                    <Typography variant="body-small" className="text-muted-foreground">
                                      {getPriorityLabel(card.priority)}
                                    </Typography>
                                  </div>
                                  
                                  {card.estimatedHours > 0 && (
                                    <Typography variant="body-small" className="text-muted-foreground">
                                      {card.estimatedHours}h
                                    </Typography>
                                  )}
                                </div>
                                
                                {card.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {card.tags.map(tag => (
                                      <Badge key={tag} variant="outline" size="sm">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        
                        {template.defaultCards.filter(card => card.listId === list.title).length === 0 && (
                          <div className="flex items-center justify-center h-20 text-muted-foreground">
                            <Typography variant="body-small">
                              No cards in this list
                            </Typography>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Template Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Template Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <Grid cols={4} className="gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Typography variant="heading-large" className="text-blue-600 mb-1">
                    {template.defaultLists.length}
                  </Typography>
                  <Typography variant="body-small" className="text-blue-600">
                    Lists
                  </Typography>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Typography variant="heading-large" className="text-green-600 mb-1">
                    {template.defaultCards.length}
                  </Typography>
                  <Typography variant="body-small" className="text-green-600">
                    Cards
                  </Typography>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Typography variant="heading-large" className="text-purple-600 mb-1">
                    {template.categories.length}
                  </Typography>
                  <Typography variant="body-small" className="text-purple-600">
                    Categories
                  </Typography>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Typography variant="heading-large" className="text-yellow-600 mb-1">
                    {template.tags.length}
                  </Typography>
                  <Typography variant="body-small" className="text-yellow-600">
                    Tags
                  </Typography>
                </div>
              </Grid>
            </CardContent>
          </Card>
        </div>
      </ModalContent>
      
      <ModalFooter>
        <Button onClick={onClose}>
          Close Preview
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default TemplatePreview;
