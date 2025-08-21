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
  Switch
} from '@taskflow/ui';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'Connected' | 'Disconnected';
  isEnabled: boolean;
}

interface AppExtension {
  id: string;
  name: string;
  category: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedBy: string;
  icon: string;
}

const mockIntegrations: Integration[] = [
  {
    id: '1',
    name: 'Slack',
    description: 'Team communication and notifications',
    icon: '💬',
    status: 'Connected',
    isEnabled: true
  },
  {
    id: '2',
    name: 'Google Drive',
    description: 'File storage and sharing',
    icon: '☁️',
    status: 'Connected',
    isEnabled: true
  },
  {
    id: '3',
    name: 'GitHub',
    description: 'Code repository management',
    icon: '🐙',
    status: 'Disconnected',
    isEnabled: false
  }
];

const mockAppExtensions: AppExtension[] = [
  {
    id: '1',
    name: 'Calendar Power-Up',
    category: 'Productivity',
    status: 'Pending',
    requestedBy: 'John Smith',
    icon: '📅'
  },
  {
    id: '2',
    name: 'Analytics Dashboard',
    category: 'Analytics',
    status: 'Approved',
    requestedBy: 'Sarah Johnson',
    icon: '📊'
  },
  {
    id: '3',
    name: 'Document Generator',
    category: 'Automation',
    status: 'Rejected',
    requestedBy: 'Mike Davis',
    icon: '📄'
  }
];

const IntegrationsPage: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations);
  const [appExtensions, setAppExtensions] = useState<AppExtension[]>(mockAppExtensions);
  const [apiKeys, setApiKeys] = useState({
    slack: '',
    github: '',
    googleDrive: '',
    webhook: ''
  });

  const handleToggleIntegration = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, isEnabled: !integration.isEnabled }
        : integration
    ));
  };

  const handleApproveExtension = (extensionId: string) => {
    setAppExtensions(prev => prev.map(extension => 
      extension.id === extensionId 
        ? { ...extension, status: 'Approved' as const }
        : extension
    ));
  };

  const handleRejectExtension = (extensionId: string) => {
    setAppExtensions(prev => prev.map(extension => 
      extension.id === extensionId 
        ? { ...extension, status: 'Rejected' as const }
        : extension
    ));
  };

  const handleRemoveExtension = (extensionId: string) => {
    setAppExtensions(prev => prev.filter(extension => extension.id !== extensionId));
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Connected':
        return 'success' as const;
      case 'Disconnected':
        return 'error' as const;
      case 'Pending':
        return 'warning' as const;
      case 'Approved':
        return 'success' as const;
      case 'Rejected':
        return 'error' as const;
      default:
        return 'default' as const;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <Typography variant="heading-xl" className="text-foreground mb-2">
          Integration Management
        </Typography>
        <Typography variant="body-large" className="text-muted-foreground">
          Manage third-party integrations and API connections
        </Typography>
      </div>

      {/* Third-Party Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Third-Party Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {integrations.map((integration) => (
              <div key={integration.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{integration.icon}</div>
                  <div>
                    <Typography variant="heading-small" className="text-foreground">
                      {integration.name}
                    </Typography>
                    <Typography variant="body-medium" className="text-muted-foreground">
                      {integration.description}
                    </Typography>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant={getStatusBadgeVariant(integration.status)}>
                    {integration.status}
                  </Badge>
                  <Switch
                    checked={integration.isEnabled}
                    onChange={(e) => handleToggleIntegration(integration.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Keys Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>API Keys Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Slack API Key
                </label>
                <Input
                  placeholder="Enter Slack API key..."
                  value={apiKeys.slack}
                  onChange={(e) => setApiKeys(prev => ({ ...prev, slack: e.target.value }))}
                />
                <Button variant="default" size="sm" className="mt-2">
                  Save
                </Button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  GitHub API Token
                </label>
                <Input
                  placeholder="Enter GitHub API token..."
                  value={apiKeys.github}
                  onChange={(e) => setApiKeys(prev => ({ ...prev, github: e.target.value }))}
                />
                <Button variant="default" size="sm" className="mt-2">
                  Save
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Google Drive API Key
                </label>
                <Input
                  placeholder="Enter Google Drive API key..."
                  value={apiKeys.googleDrive}
                  onChange={(e) => setApiKeys(prev => ({ ...prev, googleDrive: e.target.value }))}
                />
                <Button variant="default" size="sm" className="mt-2">
                  Save
                </Button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Webhook URL
                </label>
                <Input
                  placeholder="Enter webhook URL..."
                  value={apiKeys.webhook}
                  onChange={(e) => setApiKeys(prev => ({ ...prev, webhook: e.target.value }))}
                />
                <Button variant="default" size="sm" className="mt-2">
                  Save
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Allowed Apps & Extensions */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Allowed Apps & Extensions</CardTitle>
            <Typography variant="body-small" className="text-muted-foreground">
              Optional Feature
            </Typography>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium text-muted-foreground">App Name</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Category</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Requested By</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appExtensions.map((extension) => (
                  <tr key={extension.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        <div className="text-xl">{extension.icon}</div>
                        <Typography variant="body-medium" className="text-foreground">
                          {extension.name}
                        </Typography>
                      </div>
                    </td>
                    <td className="p-3">
                      <Typography variant="body-medium" className="text-foreground">
                        {extension.category}
                      </Typography>
                    </td>
                    <td className="p-3">
                      <Badge variant={getStatusBadgeVariant(extension.status)}>
                        {extension.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Typography variant="body-medium" className="text-foreground">
                        {extension.requestedBy}
                      </Typography>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        {extension.status === 'Pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApproveExtension(extension.id)}
                              className="text-green-600"
                            >
                              <CheckIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRejectExtension(extension.id)}
                              className="text-red-600"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {extension.status === 'Approved' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveExtension(extension.id)}
                            className="text-red-600"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        )}
                        {extension.status === 'Rejected' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleApproveExtension(extension.id)}
                            className="text-green-600"
                          >
                            <CheckIcon className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Integration Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Integration Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Typography variant="body-medium">Active Integrations</Typography>
                <Typography variant="heading-large" className="text-success">
                  {integrations.filter(i => i.isEnabled).length}
                </Typography>
              </div>
              <div className="flex justify-between items-center">
                <Typography variant="body-medium">Total Integrations</Typography>
                <Typography variant="body-medium">
                  {integrations.length}
                </Typography>
              </div>
              <div className="flex justify-between items-center">
                <Typography variant="body-medium">Success Rate</Typography>
                <Typography variant="body-medium" className="text-success">
                  {Math.round((integrations.filter(i => i.status === 'Connected').length / integrations.length) * 100)}%
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>App Extensions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Typography variant="body-medium">Pending Review</Typography>
                <Typography variant="heading-large" className="text-warning">
                  {appExtensions.filter(a => a.status === 'Pending').length}
                </Typography>
              </div>
              <div className="flex justify-between items-center">
                <Typography variant="body-medium">Approved</Typography>
                <Typography variant="body-medium" className="text-success">
                  {appExtensions.filter(a => a.status === 'Approved').length}
                </Typography>
              </div>
              <div className="flex justify-between items-center">
                <Typography variant="body-medium">Rejected</Typography>
                <Typography variant="body-medium" className="text-error">
                  {appExtensions.filter(a => a.status === 'Rejected').length}
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Typography variant="body-medium">Response Time</Typography>
                <Typography variant="body-medium">142ms</Typography>
              </div>
              <div className="flex justify-between items-center">
                <Typography variant="body-medium">Success Rate</Typography>
                <Typography variant="body-medium" className="text-success">99.2%</Typography>
              </div>
              <div className="flex justify-between items-center">
                <Typography variant="body-medium">Error Rate</Typography>
                <Typography variant="body-medium" className="text-error">0.8%</Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IntegrationsPage;
