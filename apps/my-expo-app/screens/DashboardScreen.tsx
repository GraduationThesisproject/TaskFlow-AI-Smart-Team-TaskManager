import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { BarChart3, Users, Clock, TrendingUp, Bell } from 'lucide-react-native';
import { useTheme, ThemedView, ThemedText } from '../theme';

export default function DashboardScreen() {
  const { theme } = useTheme();
  
  const stats = [
    { title: 'Total Tasks', value: '24', icon: BarChart3, color: theme.colors.info },
    { title: 'Team Members', value: '8', icon: Users, color: theme.colors.success },
    { title: 'In Progress', value: '12', icon: Clock, color: theme.colors.warning },
    { title: 'Completed', value: '18', icon: TrendingUp, color: theme.colors.primary },
  ];

  const recentActivity = [
    { id: 1, action: 'Task completed', task: 'Budget Review Meeting', time: '2 hours ago' },
    { id: 2, action: 'New task assigned', task: 'Q2 Planning Session', time: '4 hours ago' },
    { id: 3, action: 'Comment added', task: 'Expense Report Analysis', time: '6 hours ago' },
  ];

  const styles = theme.globalStyles;

  return (
    <ThemedView variant="background" style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedView style={styles.headerRow}>
          <ThemedView>
            <ThemedText size="2xl" weight="bold">Dashboard</ThemedText>
            <ThemedText variant="muted" size="sm">Welcome back, John</ThemedText>
          </ThemedView>
          <TouchableOpacity style={styles.iconButton}>
            <Bell color={theme.colors.text} size={24} />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: theme.spacing.md }}>
        {/* Stats Grid */}
        <ThemedView style={{ 
          flexDirection: 'row', 
          flexWrap: 'wrap', 
          justifyContent: 'space-between', 
          marginBottom: theme.spacing.lg 
        }}>
          {stats.map((stat, index) => (
            <ThemedView key={index} style={{
              width: '48%',
              backgroundColor: theme.colors.card,
              borderRadius: theme.borderRadius.xl,
              padding: theme.spacing.md,
              marginBottom: theme.spacing.md,
              ...theme.shadows.sm
            }}>
              <ThemedView style={{
                backgroundColor: stat.color,
                width: 40,
                height: 40,
                borderRadius: theme.borderRadius.lg,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: theme.spacing.sm
              }}>
                <stat.icon color="white" size={20} />
              </ThemedView>
              <ThemedText size="2xl" weight="bold">{stat.value}</ThemedText>
              <ThemedText variant="muted" size="sm">{stat.title}</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>

        {/* Recent Activity */}
        <ThemedView style={{ marginBottom: theme.spacing.lg }}>
          <ThemedText size="lg" weight="bold" style={{ marginBottom: theme.spacing.md }}>
            Recent Activity
          </ThemedText>
          <ThemedView style={styles.card}>
            {recentActivity.map((activity, index) => (
              <ThemedView key={activity.id} style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: theme.spacing.sm,
                borderBottomWidth: index < recentActivity.length - 1 ? 1 : 0,
                borderBottomColor: theme.colors.border
              }}>
                <ThemedView style={{
                  width: 8,
                  height: 8,
                  backgroundColor: theme.colors.primary,
                  borderRadius: 4,
                  marginRight: theme.spacing.sm
                }} />
                <ThemedView style={{ flex: 1 }}>
                  <ThemedText weight="medium">{activity.action}</ThemedText>
                  <ThemedText variant="muted" size="sm">{activity.task}</ThemedText>
                </ThemedView>
                <ThemedText variant="muted" size="xs">{activity.time}</ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        </ThemedView>

        {/* Quick Actions */}
        <ThemedView style={{ marginBottom: theme.spacing.lg }}>
          <ThemedText size="lg" weight="bold" style={{ marginBottom: theme.spacing.md }}>
            Quick Actions
          </ThemedText>
          <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity style={{
              ...styles.primaryButton,
              flex: 1,
              marginRight: theme.spacing.sm
            }}>
              <ThemedText weight="bold" style={{ color: 'white' }}>Create Task</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={{
              ...styles.secondaryButton,
              flex: 1,
              marginLeft: theme.spacing.sm,
              backgroundColor: theme.colors.success
            }}>
              <ThemedText weight="bold" style={{ color: 'white' }}>View Reports</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}
