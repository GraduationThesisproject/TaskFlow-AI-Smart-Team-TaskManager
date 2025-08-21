import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Typography,
  Badge,
  Button,
  Input,
  Container,
  Grid,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@taskflow/ui';
import { 
  DocumentTextIcon, 
  FolderIcon, 
  SparklesIcon,
  PaintBrushIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { 
  adminService, 
  ProjectTemplate, 
  TaskTemplate, 
  AIPrompt, 
  BrandingAsset 
} from '../services/adminService';

const TemplatesLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState('projects');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Template data
  const [projectTemplates, setProjectTemplates] = useState<ProjectTemplate[]>([]);
  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>([]);
  const [aiPrompts, setAiPrompts] = useState<AIPrompt[]>([]);
  const [brandingAssets, setBrandingAssets] = useState<BrandingAsset[]>([]);

  useEffect(() => {
    fetchTemplates();
  }, []);

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
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="heading-large" className="text-foreground mb-2">
              Templates & Assets
            </Typography>
            <Typography variant="body-medium" className="text-muted-foreground">
              Manage project templates, task templates, AI prompts, and branding assets
            </Typography>
          </div>
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
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
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="projects">
            <FolderIcon className="h-4 w-4 mr-2" />
            Project Templates ({(projectTemplates || []).length})
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            Task Templates ({(taskTemplates || []).length})
          </TabsTrigger>
          <TabsTrigger value="ai-prompts">
            <SparklesIcon className="h-4 w-4 mr-2" />
            AI Prompts ({(aiPrompts || []).length})
          </TabsTrigger>
          <TabsTrigger value="branding">
            <PaintBrushIcon className="h-4 w-4 mr-2" />
            Branding Assets ({(brandingAssets || []).length})
          </TabsTrigger>
        </TabsList>

        {/* Project Templates */}
        <TabsContent value="projects">
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
                      <div className="flex items-center justify-between">
                        <Typography variant="body-small" className="text-muted-foreground">
                          Category
                        </Typography>
                        <Badge variant="secondary">{template.category}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <Typography variant="body-small" className="text-muted-foreground">
                          Usage Count
                        </Typography>
                        <Typography variant="body-medium">{template.usageCount || 0}</Typography>
                      </div>
                      <div className="flex items-center justify-between">
                        <Typography variant="body-small" className="text-muted-foreground">
                          Created
                        </Typography>
                        <Typography variant="body-small">
                          {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </Grid>
        </TabsContent>

        {/* Task Templates */}
        <TabsContent value="tasks">
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
                      <div className="flex items-center justify-between">
                        <Typography variant="body-small" className="text-muted-foreground">
                          Category
                        </Typography>
                        <Badge variant="secondary">{template.category}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <Typography variant="body-small" className="text-muted-foreground">
                          Estimated Hours
                        </Typography>
                        <Typography variant="body-medium">{template.estimatedHours || 0}h</Typography>
                      </div>
                      <div className="flex items-center justify-between">
                        <Typography variant="body-small" className="text-muted-foreground">
                          Usage Count
                        </Typography>
                        <Typography variant="body-medium">{template.usageCount || 0}</Typography>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </Grid>
        </TabsContent>

        {/* AI Prompts */}
        <TabsContent value="ai-prompts">
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
                      <div className="flex items-center justify-between">
                        <Typography variant="body-small" className="text-muted-foreground">
                          Category
                        </Typography>
                        <Badge variant="secondary">{prompt.category}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <Typography variant="body-small" className="text-muted-foreground">
                          Usage Count
                        </Typography>
                        <Typography variant="body-medium">{prompt.usageCount || 0}</Typography>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </Grid>
        </TabsContent>

        {/* Branding Assets */}
        <TabsContent value="branding">
          <Grid cols={4} className="gap-6">
            {getFilteredBrandingAssets().map((asset: BrandingAsset) => {
              if (!asset || !asset.id || !asset.name) return null;
              return (
                <Card key={asset.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{asset.name}</CardTitle>
                      {getStatusBadge(asset.isActive)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Typography variant="body-small" className="text-muted-foreground">
                          Type
                        </Typography>
                        <Badge variant="secondary">{asset.type}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <Typography variant="body-small" className="text-muted-foreground">
                          Value
                        </Typography>
                        <Typography variant="body-small" className="truncate max-w-24">
                          {asset.value || 'N/A'}
                        </Typography>
                      </div>
                      <div className="flex items-center justify-between">
                        <Typography variant="body-small" className="text-muted-foreground">
                          Created
                        </Typography>
                        <Typography variant="body-small">
                          {asset.createdAt ? new Date(asset.createdAt).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </Grid>
        </TabsContent>
      </Tabs>
    </Container>
  );
};

export default TemplatesLayout;
