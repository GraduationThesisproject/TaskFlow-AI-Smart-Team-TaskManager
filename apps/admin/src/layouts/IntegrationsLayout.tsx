import React, { useState, useEffect } from 'react';
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
  Switch,
  Alert,
  Spinner
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
import integrationService, { Integration } from '../services/integrationService';
import AddIntegrationModal from '../components/AddIntegrationModal';

const IntegrationsLayout: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [syncing, setSyncing] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredIntegrations = (integrations || []).filter(integration => {
    const matchesSearch = 
      integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || integration.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Load integrations on component mount
  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await integrationService.getIntegrations({
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        search: searchTerm || undefined
      });
      setIntegrations(response.integrations || []);
    } catch (err) {
      setError('Failed to load integrations');
      console.error('Error loading integrations:', err);
      setIntegrations([]); // Ensure it's always an array
    } finally {
      setLoading(false);
    }
  };

  const handleToggleIntegration = async (integrationId: string) => {
    try {
      const response = await integrationService.toggleIntegration(integrationId);
      setIntegrations((integrations || []).map(integration => 
        integration.id === integrationId 
          ? response.integration
          : integration
      ));
    } catch (err) {
      setError('Failed to toggle integration');
      console.error('Error toggling integration:', err);
    }
  };

  const handleDeleteIntegration = async (integrationId: string) => {
    if (window.confirm('Are you sure you want to remove this integration?')) {
      try {
        await integrationService.deleteIntegration(integrationId);
        setIntegrations((integrations || []).filter(integration => integration.id !== integrationId));
      } catch (err) {
        setError('Failed to delete integration');
        console.error('Error deleting integration:', err);
      }
    }
  };

  const handleSyncIntegration = async (integrationId: string) => {
    try {
      setSyncing(integrationId);
      const result = await integrationService.syncIntegration(integrationId);
      
      // Update the integration with new sync status
      setIntegrations((integrations || []).map(integration => 
        integration.id === integrationId 
          ? { ...integration, lastSync: result.lastSync || integration.lastSync }
          : integration
      ));

      if (!result.success) {
        setError(`Sync failed: ${result.message}`);
      }
    } catch (err) {
      setError('Failed to sync integration');
      console.error('Error syncing integration:', err);
    } finally {
      setSyncing(null);
    }
  };

  const handleTestConnection = async (integrationId: string) => {
    try {
      setTesting(integrationId);
      const result = await integrationService.testConnection(integrationId);
      
      // Update the integration with new status
      setIntegrations((integrations || []).map(integration => 
        integration.id === integrationId 
          ? { 
              ...integration, 
              status: result.status || integration.status,
              syncStatus: result.syncStatus || integration.syncStatus
            }
          : integration
      ));

      if (!result.success) {
        setError(`Connection test failed: ${result.message}`);
      }
    } catch (err) {
      setError('Failed to test connection');
      console.error('Error testing connection:', err);
    } finally {
      setTesting(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = integrationService.getStatusBadgeVariant(status);
    return <Badge variant={variant}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const getCategoryBadge = (category: string) => {
    const variant = integrationService.getCategoryBadgeVariant(category);
    return <Badge variant={variant}>{category.charAt(0).toUpperCase() + category.slice(1)}</Badge>;
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
          <Button onClick={() => setShowAddModal(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Integration
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

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

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
          <Typography variant="body-medium" className="ml-3 text-muted-foreground">
            Loading integrations...
          </Typography>
        </div>
      )}

      {/* Integrations Grid */}
      {!loading && (
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
                    onCheckedChange={() => handleToggleIntegration(integration.id)}
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 min-w-0"
                  onClick={() => handleTestConnection(integration.id)}
                  disabled={testing === integration.id}
                >
                  {testing === integration.id ? (
                    <Spinner size="sm" className="mr-2" />
                  ) : (
                    <CheckCircleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                  )}
                  <span className="truncate">Test</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 min-w-0"
                  onClick={() => handleSyncIntegration(integration.id)}
                  disabled={syncing === integration.id}
                >
                  {syncing === integration.id ? (
                    <Spinner size="sm" className="mr-2" />
                  ) : (
                    <ClockIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                  )}
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
      )}

      {/* No Results */}
      {!loading && filteredIntegrations.length === 0 && (
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

      {/* Add Integration Modal */}
      <AddIntegrationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={loadIntegrations}
      />
    </Container>
  );
};

export default IntegrationsLayout;
