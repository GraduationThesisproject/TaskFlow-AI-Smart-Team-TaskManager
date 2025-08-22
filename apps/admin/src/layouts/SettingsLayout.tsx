import React, { useState } from 'react';
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
  Switch,
  Select
} from '@taskflow/ui';
import { 
  CogIcon,
  ShieldCheckIcon,
  BellIcon,
  PuzzlePieceIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useLanguageContext } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import { SUPPORTED_LANGUAGES } from '../hooks/useLanguage';

const SettingsLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const { currentLanguage, changeLanguage } = useLanguageContext();
  const { t } = useTranslation();

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    companyName: 'TaskFlow AI',
    timezone: 'UTC',
    theme: 'auto',
    language: currentLanguage
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: 8,
    requireSpecialChars: true,
    requireNumbers: true,
    sessionTimeout: 30,
    enable2FA: false
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    slackNotifications: false,
    smtpServer: 'smtp.gmail.com',
    smtpPort: 587
  });

  const saveSettings = (section: string) => {
    console.log(`Saving ${section} settings...`);
    
    // If language changed, apply it immediately
    if (section === 'general' && systemSettings.language !== currentLanguage) {
      changeLanguage(systemSettings.language);
    }
    
    alert(`${section} settings saved successfully!`);
  };

  const handleLanguageChange = (language: string) => {
    setSystemSettings(prev => ({ ...prev, language: language as any }));
  };

  return (
    <Container size="7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="heading-large" className="text-foreground mb-2">
              System Settings
            </Typography>
            <Typography variant="body-medium" className="text-muted-foreground">
              Configure system preferences, security policies, and integrations
            </Typography>
          </div>
          <Button variant="outline">
            Export Settings
          </Button>
        </div>
      </div>

      {/* Settings Navigation */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === 'general'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <CogIcon className="h-4 w-4 mr-2" />
            General
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === 'security'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <ShieldCheckIcon className="h-4 w-4 mr-2" />
            Security
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === 'notifications'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <BellIcon className="h-4 w-4 mr-2" />
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`flex items-center px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === 'integrations'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <PuzzlePieceIcon className="h-4 w-4 mr-2" />
            Integrations
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === 'users'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <UserGroupIcon className="h-4 w-4 mr-2" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === 'analytics'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <ChartBarIcon className="h-4 w-4 mr-2" />
            Analytics
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* General Settings */}
        {activeTab === 'general' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CogIcon className="h-5 w-5 mr-2" />
                General System Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Grid cols={2} className="gap-6">
                <div className="space-y-2">
                  <label htmlFor="companyName" className="text-sm font-medium">Company Name</label>
                  <Input
                    id="companyName"
                    value={systemSettings.companyName}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Enter company name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="timezone" className="text-sm font-medium">Timezone</label>
                  <Select
                    value={systemSettings.timezone}
                    onValueChange={(value) => setSystemSettings(prev => ({ ...prev, timezone: value }))}
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="theme" className="text-sm font-medium">Theme</label>
                  <Select
                    value={systemSettings.theme}
                    onValueChange={(value) => setSystemSettings(prev => ({ ...prev, theme: value }))}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto (System)</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="language" className="text-sm font-medium">Language</label>
                  <Select
                    value={systemSettings.language}
                    onValueChange={handleLanguageChange}
                  >
                    <option value="en">🇺🇸 English</option>
                    <option value="es">🇪🇸 Español</option>
                    <option value="fr">🇫🇷 Français</option>
                    <option value="de">🇩🇪 Deutsch</option>
                  </Select>
                </div>
              </Grid>

              <div className="flex justify-end">
                <Button onClick={() => saveSettings('general')}>
                  Save General Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShieldCheckIcon className="h-5 w-5 mr-2" />
                Security & Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Typography variant="h3">Password Policy</Typography>
                <Grid cols={2} className="gap-6">
                  <div className="space-y-2">
                    <label htmlFor="passwordMinLength" className="text-sm font-medium">Minimum Password Length</label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      value={securitySettings.passwordMinLength}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) }))}
                      min={6}
                      max={32}
                    />
                  </div>
                </Grid>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireSpecialChars"
                      checked={securitySettings.requireSpecialChars}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, requireSpecialChars: e.target.checked }))}
                    />
                    <label htmlFor="requireSpecialChars" className="text-sm font-medium">Require special characters</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireNumbers"
                      checked={securitySettings.requireNumbers}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, requireNumbers: e.target.checked }))}
                    />
                    <label htmlFor="requireNumbers" className="text-sm font-medium">Require numbers</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enable2FA"
                      checked={securitySettings.enable2FA}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, enable2FA: e.target.checked }))}
                    />
                    <label htmlFor="enable2FA" className="text-sm font-medium">Enable Two-Factor Authentication</label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Typography variant="h3">Session Management</Typography>
                <div className="space-y-2">
                  <label htmlFor="sessionTimeout" className="text-sm font-medium">Session Timeout (minutes)</label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                    min={5}
                    max={1440}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => saveSettings('security')}>
                  Save Security Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BellIcon className="h-5 w-5 mr-2" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Typography variant="h3">Notification Channels</Typography>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="emailNotifications"
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                    />
                    <label htmlFor="emailNotifications" className="text-sm font-medium">Email Notifications</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="pushNotifications"
                      checked={notificationSettings.pushNotifications}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                    />
                    <label htmlFor="pushNotifications" className="text-sm font-medium">Push Notifications</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="slackNotifications"
                      checked={notificationSettings.slackNotifications}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, slackNotifications: e.target.checked }))}
                    />
                    <label htmlFor="slackNotifications" className="text-sm font-medium">Slack Notifications</label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Typography variant="h3">Email Configuration</Typography>
                <Grid cols={2} className="gap-6">
                  <div className="space-y-2">
                    <label htmlFor="smtpServer" className="text-sm font-medium">SMTP Server</label>
                    <Input
                      id="smtpServer"
                      value={notificationSettings.smtpServer}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, smtpServer: e.target.value }))}
                      placeholder="smtp.gmail.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="smtpPort" className="text-sm font-medium">SMTP Port</label>
                    <Input
                      id="smtpPort"
                      type="number"
                      value={notificationSettings.smtpPort}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
                      placeholder="587"
                    />
                  </div>
                </Grid>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => saveSettings('notifications')}>
                  Save Notification Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Integration Settings */}
        {activeTab === 'integrations' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PuzzlePieceIcon className="h-5 w-5 mr-2" />
                Third-Party Integrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Typography variant="h3">Slack Integration</Typography>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="slackWebhook" className="text-sm font-medium">Webhook URL</label>
                    <Input
                      id="slackWebhook"
                      placeholder="https://hooks.slack.com/services/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="slackChannel" className="text-sm font-medium">Default Channel</label>
                    <Input
                      id="slackChannel"
                      placeholder="#general"
                    />
                  </div>
                  <Button variant="outline">
                    Test Slack Connection
                  </Button>
                </div>
              </div>

                             <div className="space-y-4">
                 <Typography variant="h3">Service Integrations</Typography>
                 <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Typography variant="body-medium">Google Drive</Typography>
                      <Typography variant="body-small" className="text-muted-foreground">
                        File storage and document collaboration
                      </Typography>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Typography variant="body-medium">GitHub</Typography>
                      <Typography variant="body-small" className="text-muted-foreground">
                        Code repository and version control
                      </Typography>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Typography variant="body-medium">Stripe</Typography>
                      <Typography variant="body-small" className="text-muted-foreground">
                        Payment processing and billing
                      </Typography>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => saveSettings('integrations')}>
                  Save Integration Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Management Settings */}
        {activeTab === 'users' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserGroupIcon className="h-5 w-5 mr-2" />
                User Management & Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                             <div className="space-y-4">
                 <Typography variant="h3">Default User Settings</Typography>
                 <Grid cols={2} className="gap-6">
                   <div className="space-y-2">
                     <label htmlFor="defaultRole" className="text-sm font-medium">Default User Role</label>
                     <Select defaultValue="user">
                       <option value="admin">Administrator</option>
                       <option value="manager">Manager</option>
                       <option value="user">User</option>
                       <option value="viewer">Viewer</option>
                     </Select>
                   </div>

                   <div className="space-y-2">
                     <label htmlFor="autoApprove" className="text-sm font-medium">Auto-approve New Users</label>
                     <Select defaultValue="false">
                       <option value="true">Yes</option>
                       <option value="false">No</option>
                     </Select>
                   </div>
                 </Grid>
               </div>

               <div className="space-y-4">
                 <Typography variant="h3">Permission Matrix</Typography>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left">Permission</th>
                        <th className="px-4 py-2 text-center">Admin</th>
                        <th className="px-4 py-2 text-center">Manager</th>
                        <th className="px-4 py-2 text-center">User</th>
                        <th className="px-4 py-2 text-center">Viewer</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="px-4 py-2">View Dashboard</td>
                        <td className="px-4 py-2 text-center">✓</td>
                        <td className="px-4 py-2 text-center">✓</td>
                        <td className="px-4 py-2 text-center">✓</td>
                        <td className="px-4 py-2 text-center">✓</td>
                      </tr>
                      <tr className="border-t">
                        <td className="px-4 py-2">Create Tasks</td>
                        <td className="px-4 py-2 text-center">✓</td>
                        <td className="px-4 py-2 text-center">✓</td>
                        <td className="px-4 py-2 text-center">✓</td>
                        <td className="px-4 py-2 text-center">✗</td>
                      </tr>
                      <tr className="border-t">
                        <td className="px-4 py-2">Manage Users</td>
                        <td className="px-4 py-2 text-center">✓</td>
                        <td className="px-4 py-2 text-center">✓</td>
                        <td className="px-4 py-2 text-center">✗</td>
                        <td className="px-4 py-2 text-center">✗</td>
                      </tr>
                      <tr className="border-t">
                        <td className="px-4 py-2">System Settings</td>
                        <td className="px-4 py-2 text-center">✓</td>
                        <td className="px-4 py-2 text-center">✗</td>
                        <td className="px-4 py-2 text-center">✗</td>
                        <td className="px-4 py-2 text-center">✗</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">
                  Export Permissions
                </Button>
                <Button onClick={() => saveSettings('users')}>
                  Save User Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analytics Settings */}
        {activeTab === 'analytics' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ChartBarIcon className="h-5 w-5 mr-2" />
                Analytics & Reporting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                             <div className="space-y-4">
                 <Typography variant="h3">Data Collection</Typography>
                 <div className="space-y-3">
                   <div className="flex items-center space-x-2">
                     <Switch defaultChecked onChange={(e) => console.log('Usage analytics:', e.target.checked)} />
                     <label className="text-sm font-medium">Enable usage analytics</label>
                   </div>

                   <div className="flex items-center space-x-2">
                     <Switch defaultChecked onChange={(e) => console.log('User behavior:', e.target.checked)} />
                     <label className="text-sm font-medium">Track user behavior</label>
                   </div>

                   <div className="flex items-center space-x-2">
                     <Switch defaultChecked onChange={(e) => console.log('Performance monitoring:', e.target.checked)} />
                     <label className="text-sm font-medium">Performance monitoring</label>
                   </div>

                   <div className="flex items-center space-x-2">
                     <Switch onChange={(e) => console.log('Error tracking:', e.target.checked)} />
                     <label className="text-sm font-medium">Error tracking and reporting</label>
                   </div>
                 </div>
               </div>

               <div className="space-y-4">
                 <Typography variant="h3">Report Generation</Typography>
                 <Grid cols={2} className="gap-6">
                   <div className="space-y-2">
                     <label htmlFor="reportFrequency" className="text-sm font-medium">Default Report Frequency</label>
                     <Select defaultValue="weekly">
                       <option value="daily">Daily</option>
                       <option value="weekly">Weekly</option>
                       <option value="monthly">Monthly</option>
                       <option value="quarterly">Quarterly</option>
                     </Select>
                   </div>

                   <div className="space-y-2">
                     <label htmlFor="reportFormat" className="text-sm font-medium">Default Report Format</label>
                     <Select defaultValue="pdf">
                       <option value="pdf">PDF</option>
                       <option value="excel">Excel</option>
                       <option value="csv">CSV</option>
                       <option value="json">JSON</option>
                     </Select>
                   </div>
                 </Grid>
               </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">
                  Generate Sample Report
                </Button>
                <Button onClick={() => saveSettings('analytics')}>
                  Save Analytics Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Container>
  );
};

export default SettingsLayout;
