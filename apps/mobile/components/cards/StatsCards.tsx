import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppSelector } from '@/store';

interface StatsCardsProps {
  // Optional props for customization
  showTitle?: boolean;
  compact?: boolean;
}

const StatsCards: React.FC<StatsCardsProps> = ({ 
  showTitle = true, 
  compact = false 
}) => {
  const colors = useThemeColors();
  const { data: analytics } = useAppSelector(state => state.analytics);

  const getTaskStats = () => {
    const totalTasks = analytics?.coreMetrics?.totalTasks || 0;
    const completedTasks = Math.round((analytics?.coreMetrics?.completionRate || 0) * totalTasks / 100);
    const overdueTasks = analytics?.coreMetrics?.overdueTasks || 0;
    const completionRate = analytics?.coreMetrics?.completionRate || 0;

    return {
      totalTasks,
      completedTasks,
      overdueTasks,
      completionRate,
    };
  };

  const taskStats = getTaskStats();

  const statsData = [
    {
      title: 'Total Tasks',
      value: taskStats.totalTasks,
      color: colors.primary,
    },
    {
      title: 'Completed',
      value: taskStats.completedTasks,
      color: colors.success,
    },
    {
      title: 'Overdue',
      value: taskStats.overdueTasks,
      color: colors.destructive,
    },
    {
      title: 'Completion Rate',
      value: `${taskStats.completionRate.toFixed(1)}%`,
      color: colors.warning,
    },
  ];

  return (
    <View style={styles.container}>
      {showTitle && (
        <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginBottom: 16 }]}>
          Task Statistics
        </Text>
      )}
      
      <View style={[styles.statsGrid, compact && styles.compactGrid]}>
        {statsData.map((stat, index) => (
          <Card key={index} style={[styles.statCard, compact && styles.compactCard]}>
            <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
              {stat.title}
            </Text>
            <Text style={[
              compact ? TextStyles.heading.h4 : TextStyles.heading.h2, 
              { color: stat.color, marginTop: 4 }
            ]}>
              {stat.value}
            </Text>
          </Card>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  compactGrid: {
    gap: 8,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    alignItems: 'center',
  },
  compactCard: {
    padding: 12,
    minWidth: '22%',
  },
});

export default StatsCards;
