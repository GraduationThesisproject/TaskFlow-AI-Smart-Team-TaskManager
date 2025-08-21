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
  Grid,
  Switch
} from '@taskflow/ui';
import { 
  BellIcon, 
  EnvelopeIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'system' | 'user' | 'security' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'unread' | 'read' | 'archived';
  createdAt: string;
  isEnabled: boolean;
  recipients: string[];
}

const NotificationsLayout: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'System Maintenance Scheduled',
      message: 'Scheduled maintenance will begin at 2:00 AM UTC. Expected downtime: 30 minutes.',
      type: 'info',
      category: 'maintenance',
      priority: 'medium',
      status: 'unread',
      createdAt: '2 hours ago',
      isEnabled: true,
      recipients: ['all_users']
    },
    {
      id: '2',
      title: 'New User Registration',
      message: 'User john.doe@example.com has successfully registered.',
      type: 'success',
      category: 'user',
      priority: 'low',
      status: 'read',
      createdAt: '4 hours ago',
      isEnabled: true,
      recipients: ['admins']
    },
    {
      id: '3',
      title: 'Security Alert',
      message: 'Multiple failed login attempts detected from IP 192.168.1.100',
      type: 'warning',
      category: 'security',
      priority: 'high',
      status: 'unread',
      createdAt: '6 hours ago',
      isEnabled: true,
      recipients: ['security_team', 'admins']
    },
    {
      id: '4',
      title: 'Database Performance Issue',
      message: 'Database response time has increased by 200ms in the last hour.',
      type: 'error',
      category: 'system',
      priority: 'high',
      status: 'read',
      createdAt: '8 hours ago',
      isEnabled: true,
      recipients: ['devops', 'admins']
    },
    {
      id: '5',
      title: 'API Rate Limit Warning',
      message: 'API usage is approaching the rate limit threshold.',
      type: 'warning',
      category: 'system',
      priority: 'medium',
      status: 'unread',
      createdAt: '12 hours ago',
      isEnabled: true,
      recipients: ['developers', 'admins']
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || notification.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || notification.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || notification.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  const handleToggleNotification = (notificationId: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, isEnabled: !notification.isEnabled }
        : notification
    ));
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, status: 'read' as const }
        : notification
    ));
  };

  const handleArchiveNotification = (notificationId: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, status: 'archived' as const }
        : notification
    ));
  };

  const handleDeleteNotification = (notificationId: string) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      setNotifications(notifications.filter(notification => notification.id !== notificationId));
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'info':
        return <Badge variant="secondary">Info</Badge>;
      case 'success':
        return <Badge variant="success">Success</Badge>;
      case 'warning':
        return <Badge variant="warning">Warning</Badge>;
      case 'error':
        return <Badge variant="error">Error</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'system':
        return <Badge variant="secondary">System</Badge>;
      case 'user':
        return <Badge variant="success">User</Badge>;
      case 'security':
        return <Badge variant="error">Security</Badge>;
      case 'maintenance':
        return <Badge variant="warning">Maintenance</Badge>;
      default:
        return <Badge variant="secondary">{category}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium</Badge>;
      case 'high':
        return <Badge variant="error">High</Badge>;
      case 'critical':
        return <Badge variant="error">Critical</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unread':
        return <Badge variant="secondary">Unread</Badge>;
      case 'read':
        return <Badge variant="secondary">Read</Badge>;
      case 'archived':
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <BellIcon className="h-5 w-5 text-blue-500" />;
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter(n => n.status === 'unread').length;
  const highPriorityCount = notifications.filter(n => n.priority === 'high' || n.priority === 'critical').length;

  return (
    <Container size="7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="heading-large" className="text-foreground mb-2">
        Notifications
      </Typography>
      <Typography variant="body-medium" className="text-muted-foreground">
              Manage system notifications and communication settings
            </Typography>
          </div>
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Notification
          </Button>
        </div>
      </div>

      {/* Stats */}
      <Grid cols={3} className="mb-6 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <BellIcon className="h-8 w-8 text-primary" />
              <div>
                <Typography variant="heading-large" className="text-foreground">
                  {notifications.length}
                </Typography>
                <Typography variant="body-small" className="text-muted-foreground">
                  Total Notifications
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-8 w-8 text-warning" />
              <div>
                <Typography variant="heading-large" className="text-foreground">
                  {unreadCount}
                </Typography>
                <Typography variant="body-small" className="text-muted-foreground">
                  Unread
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-8 w-8 text-error" />
              <div>
                <Typography variant="heading-large" className="text-foreground">
                  {highPriorityCount}
                </Typography>
                <Typography variant="body-small" className="text-muted-foreground">
                  High Priority
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </Grid>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="all">All Categories</option>
              <option value="system">System</option>
              <option value="user">User</option>
              <option value="security">Security</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="all">All Statuses</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <Card key={notification.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {getTypeIcon(notification.type)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Typography variant="body-medium" className="font-medium">
                        {notification.title}
                      </Typography>
                      {getTypeBadge(notification.type)}
                      {getCategoryBadge(notification.category)}
                      {getPriorityBadge(notification.priority)}
                      {getStatusBadge(notification.status)}
                    </div>
                    <Typography variant="body-medium" className="text-muted-foreground mb-3">
                      {notification.message}
                    </Typography>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Created: {notification.createdAt}</span>
                      <span>Recipients: {notification.recipients.join(', ')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Switch
                    checked={notification.isEnabled}
                    onCheckedChange={() => handleToggleNotification(notification.id)}
                  />
                  <div className="flex space-x-1">
                    {notification.status === 'unread' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        title="Mark as read"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                      </Button>
                    )}
                    {notification.status !== 'archived' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleArchiveNotification(notification.id)}
                        title="Archive"
                      >
                        <ClockIcon className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteNotification(notification.id)}
                      title="Delete"
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredNotifications.length === 0 && (
        <Card className="mt-6">
          <CardContent className="text-center py-12">
            <BellIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <Typography variant="heading-large" className="text-muted-foreground mb-2">
              No notifications found
            </Typography>
            <Typography variant="body-medium" className="text-muted-foreground">
              Try adjusting your search criteria or create a new notification
      </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default NotificationsLayout;
