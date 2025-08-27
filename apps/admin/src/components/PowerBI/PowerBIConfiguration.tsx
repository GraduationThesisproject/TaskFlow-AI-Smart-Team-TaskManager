import React, { useState } from 'react';
import { 
  Typography, 
  Button, 
  Input, 
  TextArea, 
  Card, 
  CardBody, 
  CardHeader,
  Alert
} from '@taskflow/ui';
import { CogIcon, CheckIcon, PlayIcon } from '@heroicons/react/24/outline';

const PowerBIConfiguration: React.FC = () => {
  const [config, setConfig] = useState({
    clientId: '',
    clientSecret: '',
    tenantId: '',
    defaultWorkspaceId: '',
    defaultReportId: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save configuration to backend
      const response = await fetch('/api/powerbi/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Configuration saved successfully!' });
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save configuration' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    try {
      // Test Power BI connection
      const response = await fetch('/api/powerbi/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Connection test successful!' });
      } else {
        throw new Error('Connection test failed');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Connection test failed' });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <Typography variant="h3" className="flex items-center">
          <CogIcon className="w-6 h-6 mr-2" />
          Power BI Configuration
        </Typography>
      </CardHeader>
      <CardBody>
        {message && (
          <Alert variant={message.type === 'success' ? 'success' : 'error'} className="mb-4">
            {message.text}
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Typography variant="label" className="block mb-2">
              Client ID
            </Typography>
            <Input
              type="text"
              value={config.clientId}
              onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
              placeholder="Enter Power BI Client ID"
            />
          </div>

          <div>
            <Typography variant="label" className="block mb-2">
              Client Secret
            </Typography>
            <Input
              type="password"
              value={config.clientSecret}
              onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
              placeholder="Enter Power BI Client Secret"
            />
          </div>

          <div>
            <Typography variant="label" className="block mb-2">
              Tenant ID
            </Typography>
            <Input
              type="text"
              value={config.tenantId}
              onChange={(e) => setConfig({ ...config, tenantId: e.target.value })}
              placeholder="Enter Azure Tenant ID"
            />
          </div>

          <div>
            <Typography variant="label" className="block mb-2">
              Default Workspace ID
            </Typography>
            <Input
              type="text"
              value={config.defaultWorkspaceId}
              onChange={(e) => setConfig({ ...config, defaultWorkspaceId: e.target.value })}
              placeholder="Enter default workspace ID"
            />
          </div>

          <div className="md:col-span-2">
            <Typography variant="label" className="block mb-2">
              Default Report ID
            </Typography>
            <Input
              type="text"
              value={config.defaultReportId}
              onChange={(e) => setConfig({ ...config, defaultReportId: e.target.value })}
              placeholder="Enter default report ID"
            />
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center"
          >
            <CheckIcon className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </Button>

          <Button
            variant="outline"
            onClick={handleTest}
            disabled={isTesting}
            className="flex items-center"
          >
            <PlayIcon className="w-4 h-4 mr-2" />
            {isTesting ? 'Testing...' : 'Test Connection'}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default PowerBIConfiguration;
