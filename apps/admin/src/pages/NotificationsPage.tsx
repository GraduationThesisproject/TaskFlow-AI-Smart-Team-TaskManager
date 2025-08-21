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
  Switch,
  Select,
  Textarea
} from '@taskflow/ui';
import { 
  MegaphoneIcon, 
  EnvelopeIcon, 
  BellIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface SystemAnnouncement {
  id: string;
  title: string;
  message: string;
  targetAudience: string;
  timestamp: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
  usageCount: number;
}

interface PushNotification {
  id: string;
  type: string;
  description: string;
  isEnabled: boolean;
}

const mockAnnouncements: SystemAnnouncement[] = [
  {
    id: '1',
    title: 'New Dashboard Features',
    message: 'Enhanced analytics and reporting capabilities now available. Check out the new insights panel and improved data visualization tools.',
    targetAudience: 'All Users',
    timestamp: '2 hours ago'
  },
  {
    id: '2',
    title: 'Maintenance Schedule',
    message: 'System maintenance scheduled for this weekend. Expected downtime: 2 hours on Saturday from 2-4 AM EST.',
    targetAudience: 'All Users',
    timestamp: '1 day ago'
  }
];

const mockEmailTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Welcome Onboarding',
    description: 'Welcome new team members to the platform',
    status: 'Active',
    usageCount: 24
  },
  {
    id: '2',
    name: 'Task Reminder',
    description: 'Remind users about pending tasks',
    status: 'Active',
    usageCount: 156
  },
  {
    id: '3',
    name: 'Project Update',
    description: 'Weekly project status updates',
    status: 'Active',
    usageCount: 89
  }
];

const mockPushNotifications: PushNotification[] = [
  {
    id: '1',
    type: 'Task Assignments',
    description: 'Notify users when assigned new tasks',
    isEnabled: true
  },
  {
    id: '2',
    type: 'Project Updates',
    description: 'Send updates about project milestones',
    isEnabled: true
  },
  {
    id: '3',
    type: 'Due Date Reminders',
    description: 'Alert users about approaching deadlines',
    isEnabled: false
  }
];

const NotificationsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>(mockAnnouncements);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(mockEmailTemplates);
  const [pushNotifications, setPushNotifications] = useState<PushNotification[]>(mockPushNotifications);
  
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    targetAudience: 'All Users'
  });

  const [showCreateAnnouncement, setShowCreateAnnouncement] = useState(false);

  const handleCreateAnnouncement = () => {
    if (!newAnnouncement.title || !newAnnouncement.message) return;

    const announcement: SystemAnnouncement = {
      id: Date.now().toString(),
      title: newAnnouncement.title,
      message: newAnnouncement.message,
      targetAudience: newAnnouncement.targetAudience,
      timestamp: 'Just now'
    };

    setAnnouncements(prev => [announcement, ...prev]);
    setNewAnnouncement({ title: '', message: '', targetAudience: 'All Users' });
    setShowCreateAnnouncement(false);
  };

  const handleTogglePushNotification = (notificationId: string) => {
    setPushNotifications(prev => prev.map(notification => 
      notification.id === notificationId 
        ? { ...notification, isEnabled: !notification.isEnabled }
        : notification
    ));
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success' as const;
      case 'Inactive':
        return 'default' as const;
      default:
        return 'default' as const;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <Typography variant="heading-xl" className="text-foreground mb-2">
          Notifications & Communication
        </Typography>
        <Typography variant="body-large" className="text-muted-foreground">
          Manage system announcements, email templates, and push notifications
        </Typography>
      </div>

      {/* System Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Announcement */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>System Announcements</CardTitle>
              <Typography variant="body-small" className="text-muted-foreground">
                Optional Feature
              </Typography>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Announcement Title
              </label>
              <Input
                placeholder="e.g., New AI features released!"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Message Content
              </label>
              <Textarea
                placeholder="Write your announcement message here..."
                value={newAnnouncement.message}
                onChange={(e) => setNewAnnouncement(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Target Audience
              </label>
              <Select
                value={newAnnouncement.targetAudience}
                onChange={(value) => setNewAnnouncement(prev => ({ ...prev, targetAudience: value }))}
                options={[
                  { value: 'All Users', label: 'All Users' },
                  { value: 'Admins Only', label: 'Admins Only' },
                  { value: 'Managers', label: 'Managers' },
                  { value: 'Specific Teams', label: 'Specific Teams' }
                ]}
              />
            </div>
            
            <Button 
              variant="default" 
              onClick={handleCreateAnnouncement}
              disabled={!newAnnouncement.title || !newAnnouncement.message}
              className="w-full"
            >
              Send
            </Button>
          </CardContent>
        </Card>

        {/* Recent Announcements */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <Typography variant="heading-small" className="text-foreground">
                      {announcement.title}
                    </Typography>
                    <Badge variant="outline" className="text-xs">
                      {announcement.targetAudience}
                    </Badge>
                  </div>
                  <Typography variant="body-medium" className="text-muted-foreground mb-2">
                    {announcement.message}
                  </Typography>
                  <Typography variant="body-small" className="text-muted-foreground">
                    {announcement.timestamp}
                  </Typography>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Templates */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Email Templates</CardTitle>
            <div className="flex space-x-2">
              <Typography variant="body-small" className="text-muted-foreground">
                Optional Feature
              </Typography>
              <Button variant="default" size="sm">
                <PlusIcon className="w-4 h-4 mr-2" />
                New Template
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {emailTemplates.map((template) => (
              <div key={template.id} className="p-4 border border-border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <EnvelopeIcon className="w-5 h-5 text-blue-500" />
                    <Typography variant="heading-small" className="text-foreground">
                      {template.name}
                    </Typography>
                  </div>
                  <Button variant="ghost" size="sm">
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                </div>
                <Typography variant="body-medium" className="text-muted-foreground mb-3">
                  {template.description}
                </Typography>
                <div className="flex items-center justify-between">
                  <Badge variant={getStatusBadgeVariant(template.status)}>
                    {template.status}
                  </Badge>
                  <Typography variant="body-small" className="text-muted-foreground">
                    Used {template.usageCount} times
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Push Notifications Configuration</CardTitle>
              <Typography variant="body-small" className="text-muted-foreground">
                Optional Feature
              </Typography>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pushNotifications.map((notification) => (
                <div key={notification.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <Typography variant="body-medium" className="text-foreground">
                      {notification.type}
                    </Typography>
                    <Typography variant="body-small" className="text-muted-foreground">
                      {notification.description}
                    </Typography>
                  </div>
                  <Switch
                    checked={notification.isEnabled}
                    onChange={(e) => handleTogglePushNotification(notification.id)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Preview Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Preview Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 border border-border rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <BellIcon className="w-4 h-4 text-blue-500" />
                  <Typography variant="body-medium" className="text-foreground font-medium">
                    New Task Assigned
                  </Typography>
                </div>
                <Typography variant="body-small" className="text-muted-foreground">
                  You have been assigned 'Update project documentation'
                </Typography>
              </div>
              
              <div className="p-3 border border-border rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <BellIcon className="w-4 h-4 text-green-500" />
                  <Typography variant="body-medium" className="text-foreground font-medium">
                    Project Milestone
                  </Typography>
                </div>
                <Typography variant="body-small" className="text-muted-foreground">
                  'Website Redesign' has reached 75% completion
                </Typography>
              </div>
              
              <div className="p-3 border border-border rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <BellIcon className="w-4 h-4 text-orange-500" />
                  <Typography variant="body-medium" className="text-foreground font-medium">
                    Due Date Reminder
                  </Typography>
                </div>
                <Typography variant="body-small" className="text-muted-foreground">
                  Task 'Review mockups' is due in 2 hours
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20 mx-auto mb-3 w-fit">
              <MegaphoneIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <Typography variant="heading-large" className="text-foreground mb-1">
              {announcements.length}
            </Typography>
            <Typography variant="body-medium" className="text-muted-foreground">
              Active Announcements
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20 mx-auto mb-3 w-fit">
              <EnvelopeIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <Typography variant="heading-large" className="text-foreground mb-1">
              {emailTemplates.length}
            </Typography>
            <Typography variant="body-medium" className="text-muted-foreground">
              Email Templates
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20 mx-auto mb-3 w-fit">
              <BellIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <Typography variant="heading-large" className="text-foreground mb-1">
              {pushNotifications.filter(n => n.isEnabled).length}
            </Typography>
            <Typography variant="body-medium" className="text-muted-foreground">
              Active Notifications
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20 mx-auto mb-3 w-fit">
              <Typography variant="heading-large" className="text-orange-600 dark:text-orange-400">
                📊
              </Typography>
            </div>
            <Typography variant="heading-large" className="text-foreground mb-1">
              98.5%
            </Typography>
            <Typography variant="body-medium" className="text-muted-foreground">
              Delivery Success Rate
            </Typography>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationsPage;
