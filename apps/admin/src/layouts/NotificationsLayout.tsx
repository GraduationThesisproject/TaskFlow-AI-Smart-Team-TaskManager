import React, { useState } from 'react';
import { useNotificationContext } from '../contexts/NotificationContext';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Badge,
  Container,
  Grid
} from '@taskflow/ui';
import {
  BellIcon,
  CheckIcon,
  TrashIcon,
  FunnelIcon,
  Bars3Icon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const NotificationsLayout: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotificationContext();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [showRead, setShowRead] = useState(true);

  // Filter notifications based on current filter
  const filteredNotifications = notifications.filter((notification: any) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    if (filter === 'critical') return notification.priority === 'critical';
    if (filter === 'high') return notification.priority === 'high';
    return notification.priority === filter;
  });

  // Sort notifications
  const sortedNotifications = [...filteredNotifications].sort((a: any, b: any) => {
    if (sortBy === 'date') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'priority') {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
    }
    return 0;
  });

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleDeleteNotification = (notificationId: string) => {
    deleteNotification(notificationId);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'high':
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
      case 'medium':
        return <InformationCircleIcon className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

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
              Manage system notifications and communications
            </Typography>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <Typography variant="body-large" className="text-foreground font-semibold">
                {unreadCount}
              </Typography>
              <Typography variant="body-small" className="text-muted-foreground">
                Unread
              </Typography>
            </div>
            <Button onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
              <CheckIcon className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <Grid cols={4} className="gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body-small" className="text-muted-foreground">
                  Total Notifications
                </Typography>
                <Typography variant="heading-large" className="text-foreground">
                  {notifications.length}
                </Typography>
              </div>
              <BellIcon className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body-small" className="text-muted-foreground">
                  Unread
                </Typography>
                <Typography variant="heading-large" className="text-foreground">
                  {unreadCount}
                </Typography>
              </div>
              <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">{unreadCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body-small" className="text-muted-foreground">
                  High Priority
                </Typography>
                <Typography variant="heading-large" className="text-foreground">
                  {notifications.filter((n: any) => n.priority === 'high' || n.priority === 'critical').length}
                </Typography>
              </div>
              <ExclamationTriangleIcon className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body-small" className="text-muted-foreground">
                  Today
                </Typography>
                <Typography variant="heading-large" className="text-foreground">
                  {notifications.filter((n: any) => {
                    const today = new Date();
                    const notificationDate = new Date(n.createdAt);
                    return notificationDate.toDateString() === today.toDateString();
                  }).length}
                </Typography>
              </div>
              <CalendarIcon className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </Grid>

      {/* Filters and Controls */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-4 w-4 text-muted-foreground" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground"
                >
                  <option value="all">All Notifications</option>
                  <option value="unread">Unread Only</option>
                  <option value="read">Read Only</option>
                  <option value="critical">Critical Priority</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Bars3Icon className="h-4 w-4 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground"
                >
                  <option value="date">Sort by Date</option>
                  <option value="priority">Sort by Priority</option>
                </select>
              </div>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showRead}
                  onChange={(e) => setShowRead(e.target.checked)}
                  className="rounded border-border"
                />
                <Typography variant="body-small">Show read notifications</Typography>
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Typography variant="body-small" className="text-muted-foreground">
                {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {sortedNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BellIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <Typography variant="h3" className="text-muted-foreground mb-2">
                No notifications found
              </Typography>
              <Typography variant="body-medium" className="text-muted-foreground">
                {filter === 'all' ? 'You\'re all caught up!' : `No ${filter} notifications found.`}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          sortedNotifications.map((notification: any) => (
            <Card
              key={notification.id}
              className={`transition-all duration-200 hover:shadow-md ${
                !notification.isRead ? 'ring-2 ring-primary/20' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">
                      {getPriorityIcon(notification.priority)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Typography variant="h4" className="text-foreground">
                          {notification.title}
                        </Typography>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={notification.priority === 'critical' ? 'destructive' : 'secondary'}
                          >
                            {notification.priority}
                          </Badge>
                          {notification.category && (
                            <Badge variant="outline">
                              {notification.category}
                            </Badge>
                          )}
                          {!notification.isRead && (
                            <Badge variant="default" className="bg-primary text-primary-foreground">
                              New
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {notification.description && (
                        <Typography variant="body-medium" className="text-muted-foreground mb-3">
                          {notification.description}
                        </Typography>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{formatTime(notification.createdAt)}</span>
                        {notification.sender && (
                          <span>From: {notification.sender}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.isRead && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <CheckIcon className="h-4 w-4 mr-1" />
                        Mark Read
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </Container>
  );
};

export default NotificationsLayout;
