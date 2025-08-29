import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { 
  fetchBoardTemplates, 
  fetchBoardTemplateStats,
  setFilters,
  clearFilters,
  setShowCreateModal,
  setShowEditModal,
  setShowDeleteModal,
  setSelectedTemplate,
  deleteBoardTemplate,
  toggleTemplateStatus
} from '../../store/slices/boardTemplateSlice';
import { BoardTemplate, TEMPLATE_CATEGORIES } from '../../types/boardTemplate.types';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Typography, 
  Button, 
  Input, 
  Container, 
  Grid, 
  Badge, 
  Avatar,
  Dropdown,
  DropdownItem,
  Pagination
} from '@taskflow/ui';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  DocumentTextIcon,
  FolderIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  StarIcon,
  UsersIcon,
  CalendarIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '../../hooks/useTranslation';
import TemplateForm from './TemplateForm';
import { ConfirmationDialog } from '../common';
import TemplatePreview from './TemplatePreview';

const AdminTemplateManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  
  // Get authentication state
  const { isAuthenticated, isLoading: authLoading } = useAppSelector(state => state.admin);
  
  const {
    templates,
    stats,
    isLoading,
    error,
    filters,
    pagination,
    showCreateModal,
    showEditModal,
    showDeleteModal,
    selectedTemplate
  } = useAppSelector(state => state.boardTemplates);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    // Only fetch data when authenticated and not loading
    if (isAuthenticated && !authLoading) {
      dispatch(fetchBoardTemplates(filters));
      dispatch(fetchBoardTemplateStats());
    }
  }, [dispatch, filters, isAuthenticated, authLoading]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    dispatch(setFilters({ search: value, page: 1 }));
  };

  const handleCategoryChange = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    
    setSelectedCategories(newCategories);
    dispatch(setFilters({ categories: newCategories, page: 1 }));
  };

  const handleStatusFilter = (status: 'active' | 'inactive') => {
    dispatch(setFilters({ status, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    dispatch(setFilters({ page }));
  };

  const handleCreateTemplate = () => {
    dispatch(setShowCreateModal(true));
  };

  const handleEditTemplate = (template: BoardTemplate) => {
    dispatch(setSelectedTemplate(template));
    dispatch(setShowEditModal(true));
  };

  const handleDeleteTemplate = (template: BoardTemplate) => {
    dispatch(setSelectedTemplate(template));
    dispatch(setShowDeleteModal(true));
  };

  const handlePreviewTemplate = (template: BoardTemplate) => {
    dispatch(setSelectedTemplate(template));
    setShowPreview(true);
  };

  const handleToggleStatus = async (template: BoardTemplate) => {
    try {
      await dispatch(toggleTemplateStatus(template.id)).unwrap();
    } catch (error) {
      console.error('Failed to toggle template status:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedTemplate) {
      try {
        await dispatch(deleteBoardTemplate(selectedTemplate.id)).unwrap();
      } catch (error) {
        console.error('Failed to delete template:', error);
      }
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    dispatch(clearFilters());
  };

  const getStatusBadge = (isActive: boolean) => (
    <Badge variant={isActive ? 'success' : 'secondary'}>
      {isActive ? 'Active' : 'Inactive'}
    </Badge>
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#DC2626';
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  if (isLoading && templates.length === 0) {
    return (
      <Container size="7xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Container>
    );
  }

  return (
    <Container size="7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="heading-large" className="text-foreground mb-2">
              Board Templates
            </Typography>
            <Typography variant="body-medium" className="text-muted-foreground">
              Create and manage board templates for users to choose from
            </Typography>
          </div>
          <Button onClick={handleCreateTemplate}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <Grid cols={4} className="gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <Typography variant="body-small" className="text-muted-foreground">
                    Total Templates
                  </Typography>
                  <Typography variant="heading-large" className="text-foreground">
                    {stats.totalTemplates}
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <EyeIcon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <Typography variant="body-small" className="text-muted-foreground">
                    Active Templates
                  </Typography>
                  <Typography variant="heading-large" className="text-foreground">
                    {stats.activeTemplates}
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <UsersIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <Typography variant="body-small" className="text-muted-foreground">
                    Total Usage
                  </Typography>
                  <Typography variant="heading-large" className="text-foreground">
                    {stats.totalUsage}
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <StarIcon className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <Typography variant="body-small" className="text-muted-foreground">
                    Avg Rating
                  </Typography>
                  <Typography variant="heading-large" className="text-foreground">
                    {stats.avgRating.toFixed(1)}
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>

            {/* Category and Status Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="w-4 h-4 text-muted-foreground" />
                <Typography variant="body-small" className="text-muted-foreground">
                  Categories:
                </Typography>
              </div>
              <div className="flex flex-wrap gap-2">
                {TEMPLATE_CATEGORIES.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategories.includes(category) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Typography variant="body-small" className="text-muted-foreground">
                  Status:
                </Typography>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={filters.status === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusFilter('active')}
                >
                  Active
                </Button>
                <Button
                  variant={filters.status === 'inactive' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusFilter('inactive')}
                >
                  Inactive
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <Grid cols={3} className="gap-6 mb-6">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">{template.name}</CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusBadge(template.isActive)}
                    {template.isPublic && (
                      <Badge variant="secondary">Public</Badge>
                    )}
                  </div>
                </div>
                <Dropdown
                  trigger={
                    <Button variant="ghost" size="sm">
                      <EllipsisVerticalIcon className="w-4 h-4" />
                    </Button>
                  }
                >
                  <DropdownItem onClick={() => handlePreviewTemplate(template)}>
                    <EyeIcon className="w-4 h-4 mr-2" />
                    Preview
                  </DropdownItem>
                  <DropdownItem onClick={() => handleEditTemplate(template)}>
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownItem>
                  <DropdownItem onClick={() => handleToggleStatus(template)}>
                    {template.isActive ? (
                      <>
                        <EyeSlashIcon className="w-4 h-4 mr-2" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <EyeIcon className="w-4 h-4 mr-2" />
                        Activate
                      </>
                    )}
                  </DropdownItem>
                  <DropdownItem 
                    onClick={() => handleDeleteTemplate(template)}
                    className="text-red-600"
                  >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownItem>
                </Dropdown>
              </div>
            </CardHeader>
            <CardContent>
              <Typography variant="body-medium" className="text-muted-foreground mb-3">
                {template.description}
              </Typography>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <Typography variant="body-small" className="text-muted-foreground">
                    Categories
                  </Typography>
                  <div className="flex flex-wrap gap-1">
                    {template.categories.slice(0, 2).map(category => (
                      <Badge key={category} variant="secondary" size="sm">
                        {category}
                      </Badge>
                    ))}
                    {template.categories.length > 2 && (
                      <Badge variant="secondary" size="sm">
                        +{template.categories.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>

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
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <TagIcon className="w-4 h-4" />
                  <span>{template.tags.length} tags</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </Grid>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <Typography variant="body-medium" className="text-red-600">
            {error}
          </Typography>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <TemplateForm
          mode="create"
          onClose={() => dispatch(setShowCreateModal(false))}
        />
      )}

      {showEditModal && selectedTemplate && (
        <TemplateForm
          mode="edit"
          template={selectedTemplate}
          onClose={() => dispatch(setShowEditModal(false))}
        />
      )}

      {showDeleteModal && selectedTemplate && (
        <ConfirmationDialog
          isOpen={showDeleteModal}
          onClose={() => dispatch(setShowDeleteModal(false))}
          onConfirm={handleConfirmDelete}
          title="Delete Template"
          description={`Are you sure you want to delete "${selectedTemplate.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      )}

      {showPreview && selectedTemplate && (
        <TemplatePreview
          template={selectedTemplate}
          onClose={() => setShowPreview(false)}
        />
      )}
    </Container>
  );
};

export default AdminTemplateManager;
