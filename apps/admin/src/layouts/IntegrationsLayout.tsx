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
import useAiTokens from '../hooks/useAiTokens';
import { CreateAiTokenData } from '../services/aiTokenService';
import { 
  CpuChipIcon,
  KeyIcon as KeyIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid
} from '@heroicons/react/24/solid';

// AiToken interface is now imported from the service

const IntegrationsLayout: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [syncing, setSyncing] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAiTokenModal, setShowAiTokenModal] = useState(false);
  const [aiTokenForm, setAiTokenForm] = useState<CreateAiTokenData>({
    name: '',
    description: '',
    token: '',
    provider: 'google',
    config: {
      model: 'gemini-1.5-flash',
      maxTokens: 2000,
      temperature: 0.3,
      timeout: 30000
    }
  });

  // Use the AI tokens hook
  const {
    tokens: aiTokens,
    loading: aiTokensLoading,
    error: aiTokensError,
    createToken,
    activateToken,
    archiveToken,
    testToken,
    clearError: clearAiTokensError
  } = useAiTokens();

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
              status: (result.status as Integration['status']) || integration.status,
              syncStatus: (result.syncStatus as Integration['syncStatus']) || integration.syncStatus
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

  const handleCreateAiToken = async () => {
    const success = await createToken(aiTokenForm);
    if (success) {
      setShowAiTokenModal(false);
      setAiTokenForm({
        name: '',
        description: '',
        token: '',
        provider: 'google',
        config: {
          model: 'gemini-1.5-flash',
          maxTokens: 2000,
          temperature: 0.3,
          timeout: 30000
        }
      });
    }
  };

  const handleCloseAiTokenModal = () => {
    setShowAiTokenModal(false);
    clearAiTokensError();
  };

  const handleActivateToken = async (tokenId: string) => {
    await activateToken(tokenId);
  };

  const handleArchiveToken = async (tokenId: string) => {
    await archiveToken(tokenId);
  };

  const handleTestToken = async (tokenId: string) => {
    await testToken(tokenId);
  };

  const getStatusBadge = (status: string) => {
    const variant = integrationService.getStatusBadgeVariant(status);
    return <Badge variant={variant}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const getCategoryBadge = (category: string) => {
    const variant = integrationService.getCategoryBadgeVariant(category);
    return <Badge variant={variant}>{category.charAt(0).toUpperCase() + category.slice(1)}</Badge>;
  };

  const getAiTokenStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'inactive':
        return <Badge variant="warning">Inactive</Badge>;
      case 'archived':
        return <Badge variant="secondary">Archived</Badge>;
      case 'invalid':
        return <Badge variant="error">Invalid</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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
          <div className="flex space-x-3">
            <Button onClick={() => setShowAiTokenModal(true)}>
              <CpuChipIcon className="h-4 w-4 mr-2" />
              Manage AI Tokens
            </Button>
            <Button onClick={() => setShowAddModal(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {(error || aiTokensError) && (
        <Alert variant="error" className="mb-6">
          {error || aiTokensError}
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
      {(loading || aiTokensLoading) && (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
          <Typography variant="body-medium" className="ml-3 text-muted-foreground">
            Loading integrations...
          </Typography>
        </div>
      )}

      {/* Integrations Grid */}
      {!loading && !aiTokensLoading && (
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
      {!loading && !aiTokensLoading && filteredIntegrations.length === 0 && (
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

      {/* AI Token Management Section */}
      <div className="mt-12">
        <div className="mb-6">
          <Typography variant="heading-large" className="text-foreground mb-2">
            AI Token Management
          </Typography>
          <Typography variant="body-medium" className="text-muted-foreground">
            Manage AI provider tokens for board generation and AI features
          </Typography>
        </div>

        {/* AI Tokens Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {aiTokens.map((token) => (
            <Card key={token.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <CpuChipIcon className="h-5 w-5 text-blue-500" />
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg truncate">{token.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{token.provider}</Badge>
                        {getAiTokenStatusBadge(token.status)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {token.description && (
                  <Typography variant="body-medium" className="text-muted-foreground mb-4">
                    {token.description}
                  </Typography>
                )}
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Typography variant="body-small" className="text-muted-foreground">
                      Token
                    </Typography>
                    <Typography variant="body-small" className="font-mono text-xs">
                      {token.maskedToken}
                    </Typography>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Typography variant="body-small" className="text-muted-foreground">
                      Model
                    </Typography>
                    <Typography variant="body-small">
                      {token.config.model}
                    </Typography>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Typography variant="body-small" className="text-muted-foreground">
                      Usage
                    </Typography>
                    <Typography variant="body-small">
                      {token.usageCount} calls
                    </Typography>
                  </div>
                  
                  {token.lastUsedAt && (
                    <div className="flex items-center justify-between">
                      <Typography variant="body-small" className="text-muted-foreground">
                        Last Used
                      </Typography>
                      <Typography variant="body-small">
                        {new Date(token.lastUsedAt).toLocaleDateString()}
                      </Typography>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
                  {!token.isActive && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 min-w-0"
                      onClick={() => handleActivateToken(token.id)}
                    >
                      <CheckCircleIconSolid className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">Activate</span>
                    </Button>
                  )}
                  
                  {token.isActive && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 min-w-0"
                      onClick={() => handleArchiveToken(token.id)}
                    >
                      <ExclamationTriangleIconSolid className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">Archive</span>
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 min-w-0"
                    onClick={() => handleTestToken(token.id)}
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Test</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No AI Tokens */}
        {aiTokens.length === 0 && (
          <Card className="mt-6">
            <CardContent className="text-center py-12">
              <CpuChipIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <Typography variant="h3" className="text-muted-foreground mb-2">
                No AI tokens configured
              </Typography>
              <Typography variant="body-medium" className="text-muted-foreground mb-4">
                Add an AI token to enable board generation and AI features
              </Typography>
              <Button onClick={() => setShowAiTokenModal(true)}>
                <CpuChipIcon className="h-4 w-4 mr-2" />
                Add AI Token
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Integration Modal */}
      <AddIntegrationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={loadIntegrations}
      />

      {/* AI Token Modal */}
      {showAiTokenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Add AI Token</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Name</label>
                <Input
                  value={aiTokenForm.name}
                  onChange={(e) => setAiTokenForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Token name"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Input
                  value={aiTokenForm.description}
                  onChange={(e) => setAiTokenForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Token description"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Provider</label>
                <select
                  value={aiTokenForm.provider}
                  onChange={(e) => setAiTokenForm(prev => ({ ...prev, provider: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="google">Google (Gemini)</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="azure">Azure OpenAI</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">API Token</label>
                <Input
                  type="password"
                  value={aiTokenForm.token}
                  onChange={(e) => setAiTokenForm(prev => ({ ...prev, token: e.target.value }))}
                  placeholder="Enter your API token"
                />
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleCloseAiTokenModal}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleCreateAiToken}
                  disabled={!aiTokenForm.name || !aiTokenForm.token}
                >
                  Add Token
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Container>
  );
};

export default IntegrationsLayout;
