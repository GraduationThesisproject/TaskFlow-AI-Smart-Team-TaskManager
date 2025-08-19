import React, { useState } from 'react';
// import { useAppDispatch } from '../store';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Typography,
  Badge,
  Button,
  Input,
  Select,
  Container,
  Grid
} from '@taskflow/ui';
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  FolderIcon
} from '@heroicons/react/24/outline';

// Mock data - replace with actual API calls
const mockTemplates = [
  {
    id: '1',
    name: 'Project Management',
    category: 'workflow',
    description: 'Standard project management template with tasks, milestones, and team collaboration',
    status: 'active',
    usageCount: 45,
    lastUpdated: new Date('2024-01-10T14:30:00Z'),
    version: '2.1.0'
  },
  {
    id: '2',
    name: 'Agile Sprint',
    category: 'agile',
    description: 'Agile sprint template with user stories, sprint planning, and retrospectives',
    status: 'active',
    usageCount: 32,
    lastUpdated: new Date('2024-01-08T09:15:00Z'),
    version: '1.8.2'
  },
  {
    id: '3',
    name: 'Content Creation',
    category: 'content',
    description: 'Content creation workflow with review cycles and approval processes',
    status: 'draft',
    usageCount: 18,
    lastUpdated: new Date('2024-01-05T16:45:00Z'),
    version: '1.2.1'
  }
];

const TemplatesLayout: React.FC = () => {
  // const dispatch = useAppDispatch();
  const [templates, setTemplates] = useState(mockTemplates);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || template.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleViewTemplate = (template: any) => {
    setSelectedTemplate(template);
    console.log('View template:', template);
  };

  const handleEditTemplate = (template: any) => {
    setSelectedTemplate(template);
    setShowEditModal(true);
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter(template => template.id !== templateId));
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'draft':
        return 'warning';
      case 'archived':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'workflow':
        return <DocumentTextIcon className="h-5 w-5" />;
      case 'agile':
        return <FolderIcon className="h-5 w-5" />;
      case 'content':
        return <DocumentTextIcon className="h-5 w-5" />;
      default:
        return <DocumentTextIcon className="h-5 w-5" />;
    }
  };

  return (
    <Container size="7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="heading-large" className="text-foreground mb-2">
              Templates
            </Typography>
            <Typography variant="body-medium" className="text-muted-foreground">
              Manage system templates and configurations
            </Typography>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <Grid cols={3} className="gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="workflow">Workflow</option>
              <option value="agile">Agile</option>
              <option value="content">Content</option>
            </Select>
            
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </Select>
          </Grid>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <Grid cols={3} className="gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(template.category)}
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {template.category}
                    </Badge>
                  </div>
                </div>
                <Badge variant={getStatusBadgeVariant(template.status)}>
                  {template.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Typography variant="body-medium" className="text-muted-foreground">
                {template.description}
              </Typography>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Version {template.version}</span>
                <span>{template.usageCount} uses</span>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Last updated: {template.lastUpdated.toLocaleDateString()}
              </div>
              
              <div className="flex space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewTemplate(template)}
                  className="flex-1"
                >
                  <EyeIcon className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditTemplate(template)}
                  className="flex-1"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteTemplate(template.id)}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </Grid>

      {/* Create Template Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Create New Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Typography variant="body-medium">
                Template creation form would go here...
              </Typography>
              <div className="flex space-x-2">
                <Button onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button variant="outline">
                  Create Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Template Modal Placeholder */}
      {showEditModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Edit Template: {selectedTemplate.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Typography variant="body-medium">
                Template editing form would go here...
              </Typography>
              <div className="flex space-x-2">
                <Button onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button variant="outline">
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Container>
  );
};

export default TemplatesLayout;
