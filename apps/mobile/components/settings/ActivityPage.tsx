import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface ActivityItem {
  id: string;
  type: 'task' | 'workspace' | 'template' | 'user' | 'system';
  action: string;
  description: string;
  timestamp: Date;
  user?: string;
  icon: string;
  color: string;
}

const ActivityPage: React.FC = () => {
  const colors = useThemeColors();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'task' | 'workspace' | 'template' | 'user' | 'system'>('all');

  // Mock data - in a real app, this would come from an API
  const mockActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'task',
      action: 'completed',
      description: 'Completed task "Design new dashboard layout"',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      user: 'You',
      icon: 'check-circle',
      color: '#10B981'
    },
    {
      id: '2',
      type: 'workspace',
      action: 'created',
      description: 'Created new workspace "Marketing Campaign"',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      user: 'You',
      icon: 'folder-plus',
      color: '#3B82F6'
    },
    {
      id: '3',
      type: 'task',
      action: 'assigned',
      description: 'Assigned task "Review marketing materials" to John Doe',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      user: 'You',
      icon: 'user-plus',
      color: '#8B5CF6'
    },
    {
      id: '4',
      type: 'template',
      action: 'created',
      description: 'Created template "Project Kickoff Checklist"',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      user: 'You',
      icon: 'copy',
      color: '#F59E0B'
    },
    {
      id: '5',
      type: 'system',
      action: 'backup',
      description: 'Automatic backup completed successfully',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      user: 'System',
      icon: 'database',
      color: '#6B7280'
    },
    {
      id: '6',
      type: 'task',
      action: 'updated',
      description: 'Updated task "Client presentation" with new deadline',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      user: 'You',
      icon: 'edit',
      color: '#EC4899'
    },
    {
      id: '7',
      type: 'workspace',
      action: 'archived',
      description: 'Archived workspace "Old Project Alpha"',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      user: 'You',
      icon: 'archive',
      color: '#EF4444'
    },
    {
      id: '8',
      type: 'user',
      action: 'login',
      description: 'Logged in from new device',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      user: 'You',
      icon: 'sign-in',
      color: '#10B981'
    }
  ];

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    // Simulate API call
    setTimeout(() => {
      setActivities(mockActivities);
    }, 500);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadActivities();
    setRefreshing(false);
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return timestamp.toLocaleDateString();
  };

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === filter);

  const filterOptions = [
    { key: 'all', label: 'All', icon: 'list' },
    { key: 'task', label: 'Tasks', icon: 'check-square-o' },
    { key: 'workspace', label: 'Workspaces', icon: 'folder' },
    { key: 'template', label: 'Templates', icon: 'copy' },
    { key: 'user', label: 'User', icon: 'user' },
    { key: 'system', label: 'System', icon: 'cog' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <FontAwesome name="clock-o" size={20} color={colors.primary} />
        <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
          Recent Activity
        </Text>
      </View>
      
      <Text style={[TextStyles.body.small, { color: colors['muted-foreground'], marginBottom: 20 }]}>
        Track your recent actions and system events
      </Text>

      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.filterTab,
              {
                backgroundColor: filter === option.key ? colors.primary : colors.card,
                borderColor: filter === option.key ? colors.primary : colors.border,
              }
            ]}
            onPress={() => setFilter(option.key as any)}
          >
            <FontAwesome 
              name={option.icon as any} 
              size={14} 
              color={filter === option.key ? colors['primary-foreground'] : colors['muted-foreground']} 
            />
            <Text style={[
              TextStyles.body.small,
              { 
                color: filter === option.key ? colors['primary-foreground'] : colors['muted-foreground'],
                fontWeight: filter === option.key ? '600' : '400'
              }
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Activity List */}
      <ScrollView 
        style={styles.activityList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredActivities.length === 0 ? (
          <Card style={styles.emptyState}>
            <FontAwesome name="inbox" size={48} color={colors['muted-foreground']} />
            <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'], marginTop: 16 }]}>
              No activities found
            </Text>
            <Text style={[TextStyles.body.small, { color: colors['muted-foreground'], textAlign: 'center' }]}>
              Try adjusting your filter or check back later
            </Text>
          </Card>
        ) : (
          filteredActivities.map((activity) => (
            <Card key={activity.id} style={styles.activityItem}>
              <View style={styles.activityContent}>
                <View style={[styles.activityIcon, { backgroundColor: activity.color + '20' }]}>
                  <FontAwesome name={activity.icon as any} size={16} color={activity.color} />
                </View>
                <View style={styles.activityDetails}>
                  <Text style={[TextStyles.body.medium, { color: colors.foreground, fontWeight: '500' }]}>
                    {activity.description}
                  </Text>
                  <View style={styles.activityMeta}>
                    <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                      {activity.user}
                    </Text>
                    <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                      •
                    </Text>
                    <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                      {getTimeAgo(activity.timestamp)}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Stats Summary */}
      <Card style={styles.statsCard}>
        <Text style={[TextStyles.body.medium, { color: colors.foreground, fontWeight: '600', marginBottom: 16 }]}>
          Activity Summary
        </Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[TextStyles.heading.h3, { color: colors.primary }]}>
              {activities.filter(a => a.type === 'task').length}
            </Text>
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
              Tasks
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[TextStyles.heading.h3, { color: colors.accent }]}>
              {activities.filter(a => a.type === 'workspace').length}
            </Text>
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
              Workspaces
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[TextStyles.heading.h3, { color: colors.warning }]}>
              {activities.filter(a => a.type === 'template').length}
            </Text>
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
              Templates
            </Text>
          </View>
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterContent: {
    gap: 12,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  activityList: {
    flex: 1,
    marginBottom: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    borderRadius: 12,
  },
  activityItem: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityDetails: {
    flex: 1,
    gap: 4,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statsCard: {
    padding: 20,
    borderRadius: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
});

export default ActivityPage;
