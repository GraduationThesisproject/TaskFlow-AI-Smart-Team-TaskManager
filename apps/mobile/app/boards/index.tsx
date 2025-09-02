import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useMobileTheme } from '../../src/theme/ThemeProvider';

// Simple icon components to replace lucide-react-native
const ArrowLeft = ({ color, size }: { color: string; size: number }) => (
  <Text style={{ color, fontSize: size }}>←</Text>
);

const Bell = ({ color, size }: { color: string; size: number }) => (
  <Text style={{ color, fontSize: size }}>🔔</Text>
);

const ChevronDown = ({ color, size }: { color: string; size: number }) => (
  <Text style={{ color, fontSize: size }}>⌄</Text>
);

const Search = ({ color, size }: { color: string; size: number }) => (
  <Text style={{ color, fontSize: size }}>🔍</Text>
);

const Plus = ({ color, size }: { color: string; size: number }) => (
  <Text style={{ color, fontSize: size }}>+</Text>
);

export default function BoardScreen() {
  const router = useRouter();
  const theme = useMobileTheme();

  // Mock data for the board columns
  const [columns] = useState([
    {
      id: 1,
      title: 'To Do',
      tasks: [
        {
          id: 1,
          title: 'Define KPI list for Q2',
          category: 'Medium SaaS',
          priority: 'Very High',
          progress: 25,
          dueDate: 'Mar 15',
          assignees: [
            { id: 1, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0" },
            { id: 2, avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0" },
          ],
        },
        {
          id: 2,
          title: 'Budget Review Meeting',
          category: 'Quarterly Planning',
          priority: 'Medium',
          dueDate: 'Mar 18',
          assignees: [
            { id: 3, avatar: "https://images.unsplash.com/photo-1605993439219-9d09d2020fa5?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0" },
          ],
        },
        {
          id: 3,
          title: 'Expense Report Analysis',
          category: 'Monthly Review',
          priority: 'Low',
          progress: 60,
          dueDate: 'Mar 20',
          assignees: [
            { id: 4, avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0" },
            { id: 5, avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0" },
          ],
        },
      ],
    },
    {
      id: 2,
      title: 'In Progress',
      tasks: [],
    },
    {
      id: 3,
      title: 'Done',
      tasks: [],
    },
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'very high':
        return '#EF4444';
      case 'high':
        return '#F97316';
      case 'medium':
        return '#EAB308';
      default:
        return '#22C55E';
    }
  };

  const screenWidth = Dimensions.get('window').width;
  const columnWidth = screenWidth * 0.85;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: 48,
      paddingBottom: theme.spacing.lg,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerTitle: {
      color: theme.colors.foreground,
      fontSize: 20,
      fontWeight: 'bold',
    },
    searchContainer: {
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.muted,
      borderRadius: 8,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    searchText: {
      color: theme.colors.mutedForeground,
      marginLeft: theme.spacing.sm,
    },
    tabsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: theme.spacing.xl,
      gap: theme.spacing.lg,
    },
    activeTab: {
      backgroundColor: '#2DD4BF',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: 20,
    },
    inactiveTab: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
    },
    activeTabText: {
      color: '#000000',
      fontWeight: '500',
    },
    inactiveTabText: {
      color: theme.colors.mutedForeground,
    },
    boardContainer: {
      flex: 1,
    },
    column: {
      width: columnWidth,
      marginRight: theme.spacing.lg,
    },
    columnHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    columnTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    columnTitle: {
      color: theme.colors.foreground,
      fontSize: 18,
      fontWeight: 'bold',
    },
    taskCount: {
      marginLeft: theme.spacing.sm,
      backgroundColor: theme.colors.muted,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: 12,
    },
    taskCountText: {
      color: theme.colors.foreground,
      fontSize: 12,
    },
    taskCard: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    taskHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm,
    },
    taskTitle: {
      color: theme.colors.foreground,
      fontSize: 16,
      fontWeight: 'bold',
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    priorityBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: 6,
    },
    priorityText: {
      fontSize: 10,
      color: '#FFFFFF',
      fontWeight: '500',
    },
    taskCategory: {
      color: theme.colors.mutedForeground,
      fontSize: 14,
      marginBottom: theme.spacing.md,
    },
    progressContainer: {
      marginBottom: theme.spacing.md,
    },
    progressBar: {
      height: 6,
      backgroundColor: theme.colors.muted,
      borderRadius: 3,
    },
    progressFill: {
      height: 6,
      backgroundColor: '#3B82F6',
      borderRadius: 3,
    },
    taskFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    assigneesContainer: {
      flexDirection: 'row',
    },
    assigneeAvatar: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.background,
    },
    dueDate: {
      color: theme.colors.mutedForeground,
      fontSize: 14,
    },
    addListButton: {
      width: columnWidth,
      backgroundColor: theme.colors.muted,
      borderRadius: 12,
      height: 48,
      marginRight: theme.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addListContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    addListText: {
      color: theme.colors.mutedForeground,
      marginLeft: theme.spacing.sm,
    },
    addTaskContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
    },
    addTaskButton: {
      backgroundColor: '#2DD4BF',
      borderRadius: 12,
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
    },
    addTaskContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    addTaskText: {
      color: '#000000',
      fontWeight: '500',
      marginLeft: theme.spacing.sm,
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft color={theme.colors.foreground} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Task Boards</Text>
          <TouchableOpacity>
            <Bell color={theme.colors.foreground} size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search color={theme.colors.mutedForeground} size={20} />
          <Text style={styles.searchText}>Search tasks...</Text>
        </View>
      </View>

      {/* View Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity style={styles.activeTab}>
          <Text style={styles.activeTabText}>Kanban</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.inactiveTab}>
          <Text style={styles.inactiveTabText}>List</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.inactiveTab}>
          <Text style={styles.inactiveTabText}>Timeline</Text>
        </TouchableOpacity>
      </View>

      {/* Board Columns */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.boardContainer}
        contentContainerStyle={{ paddingHorizontal: theme.spacing.lg }}
      >
        {columns.map((column) => (
          <View key={column.id} style={styles.column}>
            {/* Column Header */}
            <View style={styles.columnHeader}>
              <View style={styles.columnTitleContainer}>
                <Text style={styles.columnTitle}>{column.title}</Text>
                {column.tasks.length > 0 && (
                  <View style={styles.taskCount}>
                    <Text style={styles.taskCountText}>{column.tasks.length}</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity>
                <ChevronDown color={theme.colors.foreground} size={20} />
              </TouchableOpacity>
            </View>

            {/* Tasks */}
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              {column.tasks.map((task) => (
                <TouchableOpacity key={task.id} style={styles.taskCard}>
                  <View style={styles.taskHeader}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
                      <Text style={styles.priorityText}>{task.priority}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.taskCategory}>{task.category}</Text>
                  
                  {task.progress !== undefined && (
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View 
                          style={[styles.progressFill, { width: `${task.progress}%` }]}
                        />
                      </View>
                    </View>
                  )}

                  <View style={styles.taskFooter}>
                    <View style={styles.assigneesContainer}>
                      {task.assignees.map((assignee, index) => (
                        <Image
                          key={assignee.id}
                          source={{ uri: assignee.avatar }}
                          style={[
                            styles.assigneeAvatar,
                            { marginLeft: index > 0 ? -8 : 0 }
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={styles.dueDate}>{task.dueDate}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ))}

        {/* Add List Button */}
        <TouchableOpacity style={[styles.addListButton, { width: columnWidth }]}>
          <View style={styles.addListContent}>
            <Plus color={theme.colors.mutedForeground} size={20} />
            <Text style={styles.addListText}>Add List</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Task Button */}
      <View style={styles.addTaskContainer}>
        <TouchableOpacity style={styles.addTaskButton}>
          <View style={styles.addTaskContent}>
            <Plus color="#000000" size={20} />
            <Text style={styles.addTaskText}>Add Task</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}