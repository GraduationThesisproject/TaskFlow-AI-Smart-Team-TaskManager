import React, { useState, useEffect } from 'react';
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
  DropdownItem
} from '@taskflow/ui';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  DocumentTextIcon,
  FolderIcon,
  UserGroupIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  PaintBrushIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { 
  adminService, 
  ProjectTemplate, 
  TaskTemplate, 
  AIPrompt, 
  BrandingAsset 
} from '../services/adminService';
import AdminTemplateManager from '../components/templates/AdminTemplateManager';
import TemplateForm from '../components/templates/TemplateForm';
import { ConfirmationDialog } from '../components/common';
import { useTranslation } from '../hooks/useTranslation';

const TemplatesLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState('projects');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedItemType, setSelectedItemType] = useState<string>('');
  
  // Template data
  const [projectTemplates, setProjectTemplates] = useState<ProjectTemplate[]>([]);
  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>([]);
  const [aiPrompts, setAiPrompts] = useState<AIPrompt[]>([]);
  const [brandingAssets, setBrandingAssets] = useState<BrandingAsset[]>([]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreateTemplate = () => {
    console.log('🚀 Create Template button clicked');
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleEditItem = (item: any, type: string) => {
    setSelectedItem(item);
    setSelectedItemType(type);
    setShowEditModal(true);
  };

  const handleDeleteItem = (item: any, type: string) => {
    setSelectedItem(item);
    setSelectedItemType(type);
    setShowDeleteModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedItem(null);
    setSelectedItemType('');
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedItem(null);
    setSelectedItemType('');
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem || !selectedItemType) return;
    
    try {
      // For now, we'll just remove from local state
      // TODO: Implement actual API calls when backend endpoints are available
      switch (selectedItemType) {
        case 'project':
          setProjectTemplates(prev => prev.filter(t => t.id !== selectedItem.id));
          break;
        case 'task':
          setTaskTemplates(prev => prev.filter(t => t.id !== selectedItem.id));
          break;
        case 'ai-prompt':
          setAiPrompts(prev => prev.filter(p => p.id !== selectedItem.id));
          break;
        case 'branding':
          setBrandingAssets(prev => prev.filter(b => b.id !== selectedItem.id));
          break;
      }
      handleCloseDeleteModal();
    } catch (error) {
      console.error('Failed to delete item:', error);
      // You might want to show an error toast here
    }
  };

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [projects, tasks, prompts, branding] = await Promise.all([
        adminService.getProjectTemplates(),
        adminService.getTaskTemplates(),
        adminService.getAIPrompts(),
        adminService.getBrandingAssets()
      ]);
      
      // Ensure we have valid arrays even if API returns null/undefined
      setProjectTemplates(Array.isArray(projects) ? projects : []);
      setTaskTemplates(Array.isArray(tasks) ? tasks : []);
      setAiPrompts(Array.isArray(prompts) ? prompts : []);
      setBrandingAssets(Array.isArray(branding) ? branding : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
      console.error('Templates fetch error:', err);
      // Set empty arrays on error to prevent further issues
      setProjectTemplates([]);
      setTaskTemplates([]);
      setAiPrompts([]);
      setBrandingAssets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredTemplates = () => {
    try {
      const term = (searchTerm || '').toLowerCase();
      switch (activeTab) {
        case 'projects':
          return (projectTemplates || []).filter(template => 
            template && template.name && template.description && template.category &&
            (template.name.toLowerCase().includes(term) ||
            template.description.toLowerCase().includes(term) ||
            template.category.toLowerCase().includes(term))
          );
        case 'tasks':
          return (taskTemplates || []).filter(template => 
            template && template.name && template.description && template.category &&
            (template.name.toLowerCase().includes(term) ||
            template.description.toLowerCase().includes(term) ||
            template.category.toLowerCase().includes(term))
          );
        case 'ai-prompts':
          return (aiPrompts || []).filter(prompt => 
            prompt && prompt.name && prompt.prompt && prompt.category &&
            (prompt.name.toLowerCase().includes(term) ||
            prompt.prompt.toLowerCase().includes(term) ||
            prompt.category.toLowerCase().includes(term))
          );
        case 'branding':
          return (brandingAssets || []).filter(asset => 
            asset && asset.name && asset.type &&
            (asset.name.toLowerCase().includes(term) ||
            asset.type.toLowerCase().includes(term))
          );
        default:
          return [];
      }
    } catch (error) {
      console.error('Error filtering templates:', error);
      return [];
    }
  };

  // Type-safe filtered templates for each tab
  const getFilteredProjectTemplates = () => {
    try {
      const term = (searchTerm || '').toLowerCase();
      return (projectTemplates || []).filter(template => 
        template && template.name && template.description && template.category &&
        (template.name.toLowerCase().includes(term) ||
        template.description.toLowerCase().includes(term) ||
        template.category.toLowerCase().includes(term))
      );
    } catch (error) {
      console.error('Error filtering project templates:', error);
      return [];
    }
  };

  const getFilteredTaskTemplates = () => {
    try {
      const term = (searchTerm || '').toLowerCase();
      return (taskTemplates || []).filter(template => 
        template && template.name && template.description && template.category &&
        (template.name.toLowerCase().includes(term) ||
        template.description.toLowerCase().includes(term) ||
        template.category.toLowerCase().includes(term))
      );
    } catch (error) {
      console.error('Error filtering task templates:', error);
      return [];
    }
  };

  const getFilteredAIPrompts = () => {
    try {
      const term = (searchTerm || '').toLowerCase();
      return (aiPrompts || []).filter(prompt => 
        prompt && prompt.name && prompt.prompt && prompt.category &&
        (prompt.name.toLowerCase().includes(term) ||
        prompt.prompt.toLowerCase().includes(term) ||
        prompt.category.toLowerCase().includes(term))
      );
    } catch (error) {
      console.error('Error filtering AI prompts:', error);
      return [];
    }
  };

  const getFilteredBrandingAssets = () => {
    try {
      const term = (searchTerm || '').toLowerCase();
      return (brandingAssets || []).filter(asset => 
        asset && asset.name && asset.type &&
        (asset.name.toLowerCase().includes(term) ||
        asset.type.toLowerCase().includes(term))
      );
    } catch (error) {
      console.error('Error filtering branding assets:', error);
      return [];
    }
  };

  const getStatusBadge = (isActive: boolean | undefined) => (
    <Badge variant={isActive === true ? 'success' : 'secondary'}>
      {isActive === true ? 'Active' : 'Inactive'}
    </Badge>
  );

  if (isLoading) {
    return (
      <Container size="7xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="7xl">
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <Typography variant="heading-large" className="text-red-600 mb-2">
            Error Loading Templates
          </Typography>
          <Typography variant="body-medium" className="text-muted-foreground mb-4">
            {error}
          </Typography>
          <Button 
            variant="outline" 
            onClick={fetchTemplates}
          >
            Retry
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container size="7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex-1 min-w-0">
            <Typography variant="heading-large" className="text-foreground mb-2">
              Templates & Assets
            </Typography>
            <Typography variant="body-medium" className="text-muted-foreground">
              Manage project templates, task templates, AI prompts, and branding assets
            </Typography>
          </div>
          <Button onClick={handleCreateTemplate} className="flex-shrink-0">
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Grid cols={5} className="gap-6 mb-6">
        <Button
          variant="outline"
          onClick={() => setActiveTab('projects')}
          className={`flex-1 min-w-0 ${activeTab === 'projects' ? 'bg-primary text-white' : ''}`}
        >
          <FolderIcon className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">Projects ({(projectTemplates || []).length})</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 min-w-0 ${activeTab === 'tasks' ? 'bg-primary text-white' : ''}`}
        >
          <DocumentTextIcon className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">Tasks ({(taskTemplates || []).length})</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => setActiveTab('board-templates')}
          className={`flex-1 min-w-0 ${activeTab === 'board-templates' ? 'bg-primary text-white' : ''}`}
        >
          <DocumentTextIcon className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">Boards</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => setActiveTab('ai-prompts')}
          className={`flex-1 min-w-0 ${activeTab === 'ai-prompts' ? 'bg-primary text-white' : ''}`}
        >
          <SparklesIcon className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">AI ({(aiPrompts || []).length})</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => setActiveTab('branding')}
          className={`flex-1 min-w-0 ${activeTab === 'branding' ? 'bg-primary text-white' : ''}`}
        >
          <PaintBrushIcon className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">Branding ({(brandingAssets || []).length})</span>
        </Button>
      </Grid>

      {/* Project Templates */}
      {activeTab === 'projects' && (
        <>
          {console.log('🎯 Rendering project templates:', getFilteredProjectTemplates().length)}
          {getFilteredProjectTemplates().length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FolderIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <Typography variant="heading-large" className="mb-2">
                  No Project Templates Found
                </Typography>
                <Typography variant="body-medium" className="text-muted-foreground mb-4">
                  Create your first project template to get started
                </Typography>
                <Button onClick={handleCreateTemplate}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Grid cols={3} className="gap-6">
              {getFilteredProjectTemplates().map((template: ProjectTemplate) => {
                if (!template || !template.id || !template.name) return null;
                return (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        {getStatusBadge(template.isActive)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Typography variant="body-medium" className="text-muted-foreground mb-3">
                        {template.description}
                      </Typography>
                                             <div className="space-y-2">
                         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-1 sm:space-y-0">
                           <Typography variant="body-small" className="text-muted-foreground flex-shrink-0">
                             Category
                           </Typography>
                           <Badge variant="secondary" className="flex-shrink-0">{template.category}</Badge>
                         </div>
                         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-1 sm:space-y-0">
                           <Typography variant="body-small" className="text-muted-foreground flex-shrink-0">
                             Usage Count
                           </Typography>
                           <Typography variant="body-medium" className="flex-shrink-0">{template.usageCount || 0}</Typography>
                         </div>
                         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-1 sm:space-y-0">
                           <Typography variant="body-small" className="text-muted-foreground flex-shrink-0">
                             Created
                           </Typography>
                           <Typography variant="body-small" className="truncate min-w-0">
                             {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : 'N/A'}
                           </Typography>
                         </div>
                       </div>
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 min-w-0"
                          onClick={() => handleEditItem(template, 'project')}
                        >
                          <PencilIcon className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 min-w-0"
                          onClick={() => handleDeleteItem(template, 'project')}
                        >
                          <TrashIcon className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </Grid>
          )}
        </>
      )}

      {/* Task Templates */}
      {activeTab === 'tasks' && (
        <>
          {console.log('🎯 Rendering task templates:', getFilteredTaskTemplates().length)}
          {getFilteredTaskTemplates().length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <DocumentTextIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <Typography variant="heading-large" className="mb-2">
                  No Task Templates Found
                </Typography>
                <Typography variant="body-medium" className="text-muted-foreground mb-4">
                  Create your first task template to standardize workflows
                </Typography>
                <Button onClick={handleCreateTemplate}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Grid cols={3} className="gap-6">
              {getFilteredTaskTemplates().map((template: TaskTemplate) => {
                if (!template || !template.id || !template.name) return null;
                return (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        {getStatusBadge(template.isActive)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Typography variant="body-medium" className="text-muted-foreground mb-3">
                        {template.description}
                      </Typography>
                                             <div className="space-y-2">
                         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-1 sm:space-y-0">
                           <Typography variant="body-small" className="text-muted-foreground flex-shrink-0">
                             Category
                           </Typography>
                           <Badge variant="secondary" className="flex-shrink-0">{template.category}</Badge>
                         </div>
                         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-1 sm:space-y-0">
                           <Typography variant="body-small" className="text-muted-foreground flex-shrink-0">
                             Estimated Hours
                           </Typography>
                           <Typography variant="body-medium" className="flex-shrink-0">{template.estimatedHours || 0}h</Typography>
                         </div>
                         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-1 sm:space-y-0">
                           <Typography variant="body-small" className="text-muted-foreground flex-shrink-0">
                             Usage Count
                           </Typography>
                           <Typography variant="body-medium" className="flex-shrink-0">{template.usageCount || 0}</Typography>
                         </div>
                       </div>
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 min-w-0"
                          onClick={() => handleEditItem(template, 'task')}
                        >
                          <PencilIcon className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 min-w-0"
                          onClick={() => handleDeleteItem(template, 'task')}
                        >
                          <TrashIcon className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </Grid>
          )}
        </>
      )}

      {/* AI Prompts */}
      {activeTab === 'ai-prompts' && (
        <>
          {console.log('🎯 Rendering AI prompts:', getFilteredAIPrompts().length)}
          {getFilteredAIPrompts().length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <SparklesIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <Typography variant="heading-large" className="mb-2">
                  No AI Prompts Found
                </Typography>
                <Typography variant="body-medium" className="text-muted-foreground mb-4">
                  Create your first AI prompt to help users with common tasks
                </Typography>
                <Button onClick={handleCreateTemplate}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Prompt
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Grid cols={2} className="gap-6">
              {getFilteredAIPrompts().map((prompt: AIPrompt) => {
                if (!prompt || !prompt.id || !prompt.name) return null;
                return (
                  <Card key={prompt.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{prompt.name}</CardTitle>
                        {getStatusBadge(prompt.isActive)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Typography variant="body-medium" className="text-muted-foreground mb-3">
                        {prompt.prompt}
                      </Typography>
                                             <div className="space-y-2">
                         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-1 sm:space-y-0">
                           <Typography variant="body-small" className="text-muted-foreground flex-shrink-0">
                             Category
                           </Typography>
                           <Badge variant="secondary" className="flex-shrink-0">{prompt.category}</Badge>
                         </div>
                         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-1 sm:space-y-0">
                           <Typography variant="body-small" className="text-muted-foreground flex-shrink-0">
                             Usage Count
                           </Typography>
                           <Typography variant="body-medium" className="flex-shrink-0">{prompt.usageCount || 0}</Typography>
                         </div>
                       </div>
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 min-w-0"
                          onClick={() => handleEditItem(prompt, 'ai-prompt')}
                        >
                          <PencilIcon className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 min-w-0"
                          onClick={() => handleDeleteItem(prompt, 'ai-prompt')}
                        >
                          <TrashIcon className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </Grid>
          )}
        </>
      )}

      {/* Board Templates */}
      {activeTab === 'board-templates' && (
        <AdminTemplateManager />
      )}

      {/* Branding Assets */}
      {activeTab === 'branding' && (
        <>
          {console.log('🎯 Rendering branding assets:', getFilteredBrandingAssets().length)}
          {getFilteredBrandingAssets().length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <PaintBrushIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <Typography variant="heading-large" className="mb-2">
                  No Branding Assets Found
                </Typography>
                <Typography variant="body-medium" className="text-muted-foreground mb-4">
                  Create your first branding asset to customize the platform appearance
                </Typography>
                <Button onClick={handleCreateTemplate}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Asset
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Grid cols={4} className="gap-6">
              {getFilteredBrandingAssets().map((asset: BrandingAsset) => {
                if (!asset || !asset.id || !asset.name) return null;
                return (
                  <Card key={asset.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                        <CardTitle className="text-lg truncate flex-1 min-w-0">{asset.name}</CardTitle>
                        <div className="flex-shrink-0">
                          {getStatusBadge(asset.isActive)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-1 sm:space-y-0">
                          <Typography variant="body-small" className="text-muted-foreground flex-shrink-0">
                            Type
                          </Typography>
                          <Badge variant="secondary" className="flex-shrink-0">{asset.type}</Badge>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-1 sm:space-y-0">
                          <Typography variant="body-small" className="text-muted-foreground flex-shrink-0">
                            Value
                          </Typography>
                          <Typography variant="body-small" className="truncate min-w-0 max-w-24">
                            {asset.value || 'N/A'}
                          </Typography>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-1 sm:space-y-0">
                          <Typography variant="body-small" className="text-muted-foreground flex-shrink-0">
                            Created
                          </Typography>
                          <Typography variant="body-small" className="truncate min-w-0">
                            {asset.createdAt ? new Date(asset.createdAt).toLocaleDateString() : 'N/A'}
                          </Typography>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 min-w-0"
                          onClick={() => handleEditItem(asset, 'branding')}
                        >
                          <PencilIcon className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 min-w-0"
                          onClick={() => handleDeleteItem(asset, 'branding')}
                        >
                          <TrashIcon className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </Grid>
          )}
        </>
      )}

      {/* Create Template Modal */}
      {showCreateModal && (
        <TemplateForm
          mode="create"
          onClose={handleCloseCreateModal}
        />
      )}

      {/* Edit Template Modal */}
      {showEditModal && selectedItem && (
        <TemplateForm
          mode="edit"
          template={selectedItem}
          onClose={handleCloseEditModal}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedItem && (
        <ConfirmationDialog
          isOpen={showDeleteModal}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          title="Delete Template"
          description={`Are you sure you want to delete "${selectedItem.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      )}
    </Container>
  );
};

export default TemplatesLayout;
