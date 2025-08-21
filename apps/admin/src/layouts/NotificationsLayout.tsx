import React, { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { 
  Card, 
  CardContent,
  Typography,
  Badge,
  Button,
  Input,
  Container,
  Grid
} from '@taskflow/ui';
import { 
  BellIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const NotificationsLayout: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    refreshNotifications 
  } = useNotifications();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Filter notifications based on search and filters
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = !searchTerm || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || notification.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || notification.priority === selectedPriority;
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'unread' ? !notification.isRead : notification.isRead);
    
    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const handleDeleteNotification = (notificationId: string) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      deleteNotification(notificationId);
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



  return (
    <Container size="7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="heading-large" className="text-foreground mb-2">
              Real-Time Notifications
            </Typography>
            <Typography variant="body-medium" className="text-muted-foreground">
              Live system notifications and alerts via Socket.IO
            </Typography>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={refreshNotifications}>
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                // Send test notification
                fetch('/api/notifications/test', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                  },
                  body: JSON.stringify({
                    recipientId: 'current-user', // This will be replaced with actual user ID
                    title: 'Test Real-Time Notification',
                    message: 'This notification was sent via Socket.IO and should appear instantly!',
                    type: 'info',
                    priority: 'medium',
                    category: 'system'
                  })
                });
              }}
            >
              Send Test Notification
            </Button>
            {unreadCount > 0 && (
              <Button onClick={markAllAsRead}>
                Mark All Read
              </Button>
            )}
          </div>
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
                  {notifications.filter(n => n.priority === 'high' || n.priority === 'critical').length}
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
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="all">All Categories</option>
              <option value="system">System</option>
              <option value="user">User</option>
              <option value="security">Security</option>
              <option value="maintenance">Maintenance</option>
              <option value="task">Task</option>
              <option value="workspace">Workspace</option>
            </select>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="all">All Statuses</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <Card key={notification._id} className={`hover:shadow-md transition-shadow ${
            !notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
          }`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="text-2xl">{getTypeIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Typography variant="body-medium" className={`font-medium ${
                        !notification.isRead ? 'text-gray-900' : 'text-gray-600'
                      }`}>
                        {notification.title}
                      </Typography>
                      {getTypeBadge(notification.type)}
                      {getCategoryBadge(notification.category)}
                      {getPriorityBadge(notification.priority)}
                      {!notification.isRead && (
                        <Badge variant="secondary">Unread</Badge>
                      )}
                    </div>
                    <Typography variant="body-medium" className="text-muted-foreground mb-3">
                      {notification.message}
                    </Typography>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Created: {new Date(notification.createdAt).toLocaleString()}</span>
                      {notification.sender && (
                        <span>From: {notification.sender.name}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <div className="flex space-x-1">
                    {!notification.isRead && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification._id)}
                        title="Mark as read"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteNotification(notification._id)}
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
