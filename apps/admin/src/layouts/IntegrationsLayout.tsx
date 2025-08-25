import React, { useState } from 'react';
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
  Switch
} from '@taskflow/ui';
import { 
  PuzzlePieceIcon, 
  KeyIcon, 
  GlobeAltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PresentationChartBarIcon
} from '@heroicons/react/24/outline';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'communication' | 'storage' | 'analytics' | 'development' | 'marketing';
  status: 'active' | 'inactive' | 'error' | 'pending';
  apiKey?: string;
  lastSync?: string;
  syncStatus: 'success' | 'warning' | 'error';
  isEnabled: boolean;
}

const IntegrationsLayout: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: '1',
      name: 'Slack',
      description: 'Team communication and notifications',
      category: 'communication',
      status: 'active',
      lastSync: '2 minutes ago',
      syncStatus: 'success',
      isEnabled: true
    },
    {
      id: '2',
      name: 'Google Drive',
      description: 'File storage and document collaboration',
      category: 'storage',
      status: 'active',
      lastSync: '5 minutes ago',
      syncStatus: 'success',
      isEnabled: true
    },
    {
      id: '3',
      name: 'GitHub',
      description: 'Code repository and version control',
      category: 'development',
      status: 'active',
      lastSync: '1 hour ago',
      syncStatus: 'warning',
      isEnabled: true
    },
    {
      id: '4',
      name: 'Stripe',
      description: 'Payment processing and billing',
      category: 'analytics',
      status: 'inactive',
      lastSync: 'Never',
      syncStatus: 'error',
      isEnabled: false
    },
    {
      id: '5',
      name: 'Mailchimp',
      description: 'Email marketing and automation',
      category: 'marketing',
      status: 'pending',
      lastSync: 'Never',
      syncStatus: 'error',
      isEnabled: false
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = 
      integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || integration.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const handleToggleIntegration = (integrationId: string) => {
    setIntegrations(integrations.map(integration => 
      integration.id === integrationId 
        ? { ...integration, isEnabled: !integration.isEnabled }
        : integration
    ));
  };

  const handleDeleteIntegration = (integrationId: string) => {
    if (window.confirm('Are you sure you want to remove this integration?')) {
      setIntegrations(integrations.filter(integration => integration.id !== integrationId));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'error':
        return <Badge variant="error">Error</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'communication':
        return <Badge variant="default">Communication</Badge>;
      case 'storage':
        return <Badge variant="secondary">Storage</Badge>;
      case 'analytics':
        return <Badge variant="success">Analytics</Badge>;
      case 'development':
        return <Badge variant="warning">Development</Badge>;
      case 'marketing':
        return <Badge variant="error">Marketing</Badge>;
      default:
        return <Badge variant="secondary">{category}</Badge>;
    }
  };

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'communication':
        return <GlobeAltIcon className="h-5 w-5" />;
      case 'storage':
        return <PuzzlePieceIcon className="h-5 w-5" />;
      case 'analytics':
        return <PresentationChartBarIcon className="h-5 w-5" />;
      case 'development':
        return <KeyIcon className="h-5 w-5" />;
      case 'marketing':
        return <GlobeAltIcon className="h-5 w-5" />;
      default:
        return <PuzzlePieceIcon className="h-5 w-5" />;
    }
  };

  return (
    <Container size="7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="heading-large" className="text-foreground mb-2">
              Integrations
            </Typography>
            <Typography variant="body-medium" className="text-muted-foreground">
              Manage third-party integrations and API connections
            </Typography>
          </div>
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Integration
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 relative">
              <PuzzlePieceIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search integrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground min-w-[140px]"
            >
              <option value="all">All Categories</option>
              <option value="communication">Communication</option>
              <option value="storage">Storage</option>
              <option value="analytics">Analytics</option>
              <option value="development">Development</option>
              <option value="marketing">Marketing</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {filteredIntegrations.map((integration) => (
          <Card key={integration.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  {getCategoryIcon(integration.category)}
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg truncate">{integration.name}</CardTitle>
                    {getCategoryBadge(integration.category)}
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                  {getStatusBadge(integration.status)}
                  <Switch
                    checked={integration.isEnabled}
                    onChange={() => handleToggleIntegration(integration.id)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Typography variant="body-medium" className="text-muted-foreground mb-4">
                {integration.description}
              </Typography>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Typography variant="body-small" className="text-muted-foreground">
                    Sync Status
                  </Typography>
                  <div className="flex items-center space-x-2">
                    {getSyncStatusIcon(integration.syncStatus)}
                    <Typography variant="body-small" className="text-muted-foreground">
                      {integration.lastSync}
                    </Typography>
                  </div>
                </div>
                
                {integration.apiKey && (
                  <div className="flex items-center justify-between">
                    <Typography variant="body-small" className="text-muted-foreground">
                      API Key
                    </Typography>
                    <Typography variant="body-small" className="font-mono text-xs">
                      {integration.apiKey.substring(0, 8)}...
                    </Typography>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1 min-w-0">
                  <PencilIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">Configure</span>
                </Button>
                <Button variant="outline" size="sm" className="flex-1 min-w-0">
                  <ClockIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">Sync Now</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDeleteIntegration(integration.id)}
                  className="text-red-600 hover:text-red-700 flex-shrink-0 sm:w-auto"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredIntegrations.length === 0 && (
        <Card className="mt-6">
          <CardContent className="text-center py-12">
            <PuzzlePieceIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <Typography variant="h3" className="text-muted-foreground mb-2">
              No integrations found
            </Typography>
            <Typography variant="body-medium" className="text-muted-foreground">
              Try adjusting your search criteria or add a new integration
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default IntegrationsLayout;
