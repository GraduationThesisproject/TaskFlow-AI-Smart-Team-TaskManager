import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Typography, 
  Badge, 
  Button, 
  Input, 
  Select,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@taskflow/ui';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  DocumentIcon,
  CogIcon,
  SparklesIcon,
  PaintBrushIcon
} from '@heroicons/react/24/outline';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  type: 'Kanban' | 'Scrum' | 'Bug Tracking' | 'Custom';
  stages: string[];
  createdAt: string;
}

interface TaskTemplate {
  id: string;
  name: string;
  stages: string[];
  createdAt: string;
}

interface AIPrompt {
  id: string;
  name: string;
  promptText: string;
  category: string;
  createdAt: string;
}

interface BrandingAsset {
  id: string;
  customerName: string;
  logo?: string;
  primaryColor: string;
  createdAt: string;
}

const mockProjectTemplates: ProjectTemplate[] = [
  {
    id: '1',
    name: 'Kanban Board',
    description: 'Visual project management with drag-and-drop cards across customizable columns',
    type: 'Kanban',
    stages: ['To Do', 'In Progress', 'Review', 'Done'],
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Scrum Framework',
    description: 'Agile project management with sprints, backlogs, and burndown charts',
    type: 'Scrum',
    stages: ['Backlog', 'Sprint Planning', 'In Progress', 'Testing', 'Done'],
    createdAt: '2024-01-10'
  },
  {
    id: '3',
    name: 'Bug Tracking',
    description: 'Issue management with priority levels, assignments, and resolution tracking',
    type: 'Bug Tracking',
    stages: ['Reported', 'Assigned', 'In Progress', 'Testing', 'Resolved'],
    createdAt: '2024-01-05'
  }
];

const mockTaskTemplates: TaskTemplate[] = [
  {
    id: '1',
    name: 'Basic Workflow',
    stages: ['To Do', 'In Progress', 'Review', 'Done'],
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Agile Sprint',
    stages: ['Backlog', 'Sprint Planning', 'In Progress', 'Testing', 'Done'],
    createdAt: '2024-01-10'
  },
  {
    id: '3',
    name: 'Design Process',
    stages: ['Research', 'Wireframe', 'Design', 'Review', 'Approved'],
    createdAt: '2024-01-05'
  }
];

const mockAIPrompts: AIPrompt[] = [
  {
    id: '1',
    name: 'Sprint Backlog Generator',
    promptText: 'Generate a comprehensive sprint backlog for a mobile app project with the following requirements...',
    category: 'Project Management',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Code Review Assistant',
    promptText: 'Review the following code for best practices, security vulnerabilities, and performance issues...',
    category: 'Development',
    createdAt: '2024-01-10'
  },
  {
    id: '3',
    name: 'User Story Creator',
    promptText: 'Create detailed user stories with acceptance criteria for a customer portal feature...',
    category: 'Requirements',
    createdAt: '2024-01-05'
  }
];

const mockBrandingAssets: BrandingAsset[] = [
  {
    id: '1',
    customerName: 'TechCorp Solutions',
    primaryColor: '#3B82F6',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    customerName: 'Digital Dynamics',
    primaryColor: '#10B981',
    createdAt: '2024-01-10'
  },
  {
    id: '3',
    customerName: 'InnovateLab',
    primaryColor: '#8B5CF6',
    createdAt: '2024-01-05'
  }
];

const TemplatesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('project-templates');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalType, setModalType] = useState<'project' | 'task' | 'ai' | 'branding'>('project');

  const handleCreateTemplate = (type: 'project' | 'task' | 'ai' | 'branding') => {
    setModalType(type);
    setShowCreateModal(true);
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'Kanban':
        return 'default' as const;
      case 'Scrum':
        return 'success' as const;
      case 'Bug Tracking':
        return 'error' as const;
      case 'Custom':
        return 'warning' as const;
      default:
        return 'default' as const;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <Typography variant="heading-xl" className="text-foreground mb-2">
            System Templates & Configurations
          </Typography>
          <Typography variant="body-large" className="text-muted-foreground">
            Manage project templates, task workflows, AI prompts, and branding settings
          </Typography>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="project-templates">Project Templates</TabsTrigger>
          <TabsTrigger value="task-templates">Task Templates</TabsTrigger>
          <TabsTrigger value="ai-prompts">AI Prompts</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
        </TabsList>

        {/* Project Templates Tab */}
        <TabsContent value="project-templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <Typography variant="heading-large">Project Templates</Typography>
            <Button 
              variant="default" 
              onClick={() => handleCreateTemplate('project')}
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create New
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockProjectTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-foreground">{template.name}</CardTitle>
                      <Badge variant={getTypeBadgeVariant(template.type)} className="mt-2">
                        {template.type}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Typography variant="body-medium" className="text-muted-foreground mb-4">
                    {template.description}
                  </Typography>
                  <div className="space-y-2">
                    <Typography variant="body-small" className="text-foreground font-medium">
                      Stages:
                    </Typography>
                    <div className="flex flex-wrap gap-1">
                      {template.stages.map((stage, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {stage}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Task Templates Tab */}
        <TabsContent value="task-templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <Typography variant="heading-large">Task Templates</Typography>
            <Button 
              variant="default" 
              onClick={() => handleCreateTemplate('task')}
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create New
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockTaskTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-foreground">{template.name}</CardTitle>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Typography variant="body-small" className="text-foreground font-medium">
                      Workflow Stages:
                    </Typography>
                    <div className="flex items-center space-x-2">
                      {template.stages.map((stage, index) => (
                        <React.Fragment key={index}>
                          <Badge variant="outline" className="text-xs">
                            {stage}
                          </Badge>
                          {index < template.stages.length - 1 && (
                            <span className="text-muted-foreground">→</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Prompts Tab */}
        <TabsContent value="ai-prompts" className="space-y-4">
          <div className="flex justify-between items-center">
            <Typography variant="heading-large">AI Prompt Templates</Typography>
            <Button 
              variant="default" 
              onClick={() => handleCreateTemplate('ai')}
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create New
            </Button>
          </div>
          
          <div className="space-y-4">
            {mockAIPrompts.map((prompt) => (
              <Card key={prompt.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <SparklesIcon className="w-5 h-5 text-blue-500" />
                        <Typography variant="heading-small" className="text-foreground">
                          {prompt.name}
                        </Typography>
                        <Badge variant="outline">{prompt.category}</Badge>
                      </div>
                      <Typography variant="body-medium" className="text-muted-foreground">
                        {prompt.promptText}
                      </Typography>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button variant="ghost" size="sm">
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-4">
          <div className="flex justify-between items-center">
            <Typography variant="heading-large">Customer Branding</Typography>
            <Button 
              variant="default" 
              onClick={() => handleCreateTemplate('branding')}
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add New
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockBrandingAssets.map((branding) => (
              <Card key={branding.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-foreground">{branding.customerName}</CardTitle>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <DocumentIcon className="w-6 h-6 text-gray-500" />
                      </div>
                      <div>
                        <Typography variant="body-medium" className="text-foreground">
                          Logo
                        </Typography>
                        <Typography variant="body-small" className="text-muted-foreground">
                          No logo uploaded
                        </Typography>
                      </div>
                    </div>
                    
                    <div>
                      <Typography variant="body-medium" className="text-foreground mb-2">
                        Primary Color
                      </Typography>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-6 h-6 rounded border border-border"
                          style={{ backgroundColor: branding.primaryColor }}
                        />
                        <Typography variant="body-small" className="text-muted-foreground">
                          {branding.primaryColor}
                        </Typography>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>
                Create New {modalType === 'project' ? 'Project Template' : 
                           modalType === 'task' ? 'Task Template' :
                           modalType === 'ai' ? 'AI Prompt Template' : 'Branding Asset'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {modalType === 'project' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Template Name
                    </label>
                    <Input placeholder="Enter template name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Description
                    </label>
                    <Input placeholder="Describe your template..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Template Type
                    </label>
                    <Select
                      options={[
                        { value: 'Kanban', label: 'Kanban' },
                        { value: 'Scrum', label: 'Scrum' },
                        { value: 'Bug Tracking', label: 'Bug Tracking' },
                        { value: 'Custom', label: 'Custom' }
                      ]}
                    />
                  </div>
                </>
              )}
              
              {modalType === 'task' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Template Name
                    </label>
                    <Input placeholder="Enter template name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Stages
                    </label>
                    <Input placeholder="To Do, In Progress, Done" />
                  </div>
                </>
              )}
              
              {modalType === 'ai' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Prompt Name
                    </label>
                    <Input placeholder="Enter prompt name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Prompt Text
                    </label>
                    <Input placeholder="Enter your AI prompt template here..." />
                  </div>
                </>
              )}
              
              {modalType === 'branding' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Customer Name
                    </label>
                    <Input placeholder="Enter customer name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Logo Upload
                    </label>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <DocumentIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <Typography variant="body-medium" className="text-muted-foreground mb-2">
                        Drag & drop your logo here or click to browse
                      </Typography>
                      <Button variant="outline" size="sm">
                        Choose File
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Primary Color
                    </label>
                    <Input type="color" defaultValue="#3B82F6" />
                  </div>
                </>
              )}
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    // TODO: Implement create logic
                    setShowCreateModal(false);
                  }}
                >
                  Create {modalType === 'project' ? 'Template' : 
                         modalType === 'task' ? 'Template' :
                         modalType === 'ai' ? 'Prompt' : 'Branding'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TemplatesPage;
