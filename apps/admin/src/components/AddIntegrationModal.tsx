import React, { useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalContent,
  ModalFooter,
  Button,
  Input,
  TextArea,
  Select,
  Alert,
  Switch,
  Typography
} from '@taskflow/ui';
import { Spinner } from '@taskflow/ui';
import { 
  PuzzlePieceIcon, 
  KeyIcon, 
  GlobeAltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import integrationService, { CreateIntegrationData } from '../services/integrationService';

interface AddIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddIntegrationModal: React.FC<AddIntegrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<CreateIntegrationData>({
    name: '',
    description: '',
    category: 'communication',
    apiKey: '',
    config: {},
    isEnabled: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showApiKey, setShowApiKey] = useState(false);

  const categories = integrationService.getCategories();

  const handleInputChange = (field: keyof CreateIntegrationData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate form data
    const validation = integrationService.validateIntegrationData(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setLoading(false);
      return;
    }

    try {
      await integrationService.createIntegration(formData);
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        name: '',
        description: '',
        category: 'communication',
        apiKey: '',
        config: {},
        isEnabled: false
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create integration');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'communication':
        return <GlobeAltIcon className="h-5 w-5" />;
      case 'storage':
        return <PuzzlePieceIcon className="h-5 w-5" />;
      case 'analytics':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'development':
        return <KeyIcon className="h-5 w-5" />;
      case 'marketing':
        return <GlobeAltIcon className="h-5 w-5" />;
      default:
        return <PuzzlePieceIcon className="h-5 w-5" />;
    }
  };

  const getIntegrationTemplate = (name: string) => {
    const templates: Record<string, Partial<CreateIntegrationData>> = {
      'GitHub': {
        name: 'GitHub',
        description: 'Connect to GitHub repositories for code management and issue tracking',
        category: 'development',
        config: {
          repositories: [],
          webhookEnabled: false,
          syncIssues: true,
          syncPullRequests: true
        }
      },
      'Google Drive': {
        name: 'Google Drive',
        description: 'Connect to Google Drive for file storage and document collaboration',
        category: 'storage',
        config: {
          syncFolders: [],
          autoBackup: true,
          fileTypes: ['document', 'spreadsheet', 'presentation']
        }
      },
      'Slack': {
        name: 'Slack',
        description: 'Connect to Slack for team communication and notifications',
        category: 'communication',
        config: {
          defaultChannel: '#general',
          notificationsEnabled: true,
          syncMessages: false
        }
      }
    };
    return templates[name] || {};
  };

  const handleTemplateSelect = (templateName: string) => {
    const template = getIntegrationTemplate(templateName);
    setFormData(prev => ({
      ...prev,
      ...template
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent className="max-w-2xl">
        <ModalHeader>
          <ModalTitle className="flex items-center space-x-2">
            <PlusIcon className="h-5 w-5" />
            <span>Add New Integration</span>
          </ModalTitle>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 p-6">
            {/* Error Alert */}
            {error && (
              <Alert variant="error">
                <ExclamationTriangleIcon className="h-4 w-4" />
                {error}
              </Alert>
            )}

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <Alert variant="error">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <div>
                  <Typography variant="body-medium" className="font-medium mb-1">
                    Please fix the following errors:
                  </Typography>
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </div>
              </Alert>
            )}

            {/* Quick Templates */}
            <div>
              <Typography variant="body-medium" className="font-medium mb-3">
                Quick Setup Templates
              </Typography>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['GitHub', 'Google Drive', 'Slack'].map((template) => (
                  <button
                    key={template}
                    type="button"
                    onClick={() => handleTemplateSelect(template)}
                    className="p-3 border border-border rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {getCategoryIcon(getIntegrationTemplate(template).category || 'communication')}
                      <Typography variant="body-medium" className="font-medium">
                        {template}
                      </Typography>
                    </div>
                    <Typography variant="body-small" className="text-muted-foreground">
                      {getIntegrationTemplate(template).description}
                    </Typography>
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <Typography variant="body-medium" className="font-medium">
                Integration Details
              </Typography>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Integration Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., GitHub, Google Drive"
                    required
                  />
                </div>
                
                                 <div>
                   <label className="block text-sm font-medium mb-2">
                     Category *
                   </label>
                   <Select
                     value={formData.category}
                     onValueChange={(value) => handleInputChange('category', value)}
                     options={categories.map((category) => ({
                       value: category.value,
                       label: category.label
                     }))}
                   />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description *
                </label>
                               <TextArea
                 value={formData.description}
                 onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                 placeholder="Describe what this integration does..."
                 rows={3}
                 required
               />
              </div>
            </div>

            {/* API Configuration */}
            <div className="space-y-4">
              <Typography variant="body-medium" className="font-medium">
                API Configuration
              </Typography>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  API Key / Token
                </label>
                <div className="relative">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={formData.apiKey}
                    onChange={(e) => handleInputChange('apiKey', e.target.value)}
                    placeholder="Enter your API key or access token"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showApiKey ? (
                      <EyeSlashIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <Typography variant="body-small" className="text-muted-foreground mt-1">
                  Your API key will be encrypted and stored securely
                </Typography>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <Typography variant="body-medium" className="font-medium">
                Settings
              </Typography>
              
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body-medium">Enable Integration</Typography>
                  <Typography variant="body-small" className="text-muted-foreground">
                    Automatically test and activate the integration
                  </Typography>
                </div>
                <Switch
                  checked={formData.isEnabled}
                  onCheckedChange={(checked) => handleInputChange('isEnabled', checked)}
                />
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Integration
                </>
              )}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default AddIntegrationModal;
