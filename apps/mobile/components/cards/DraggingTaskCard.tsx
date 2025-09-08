import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../Themed';
import { useThemeColors } from '../ThemeProvider';
import { TextStyles } from '@/constants/Fonts';

interface DraggingTaskCardProps {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export default function DraggingTaskCard({
  title,
  description,
  status,
  priority,
}: DraggingTaskCardProps) {
  const colors = useThemeColors();

  const getStatusColor = () => {
    switch (status) {
      case 'todo':
        return colors['muted-foreground'];
      case 'in-progress':
        return colors.warning;
      case 'done':
        return colors.success;
      case 'archived':
        return colors.error;
      default:
        return colors['muted-foreground'];
    }
  };

  const getPriorityColor = () => {
    switch (priority) {
      case 'low':
        return colors.success;
      case 'medium':
        return colors.warning;
      case 'high':
        return colors.error;
      case 'urgent':
        return colors.destructive;
      default:
        return colors['muted-foreground'];
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={[TextStyles.body.small, { color: getStatusColor() }]}>
              {status.replace('-', ' ').toUpperCase()}
            </Text>
          </View>
          
          <View style={styles.priorityContainer}>
            <View style={[styles.priorityDot, { backgroundColor: getPriorityColor() }]} />
            <Text style={[TextStyles.body.small, { color: getPriorityColor() }]}>
              {priority.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginTop: 8 }]}>
          {title}
        </Text>

        {description && (
          <Text 
            style={[TextStyles.body.small, { color: colors['muted-foreground'], marginTop: 4 }]}
            numberOfLines={2}
          >
            {description}
          </Text>
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  card: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
});
