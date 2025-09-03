import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native';
import { ArrowLeft, Bell, ChevronDown, Search, Plus, Sun } from 'lucide-react-native';
import { useTheme, ThemedView, ThemedText, getPriorityColor } from '../theme';

export default function BoardScreen() {
  const { theme, toggleTheme } = useTheme();
  
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

  const screenWidth = Dimensions.get('window').width;
  const columnWidth = screenWidth * 0.85;

  // Use global styles from theme with additional custom styles
  const styles = {
    ...theme.globalStyles,
    taskFooter: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
    },
    assignees: {
      flexDirection: 'row' as const,
    },
    avatar: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.card,
    },
    addListButton: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.xl,
      height: 48,
      marginRight: theme.spacing.md,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    addListContent: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
    },
    addTaskContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
    },
    addTaskButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.xl,
      paddingVertical: theme.spacing.md,
      alignItems: 'center' as const,
    },
    addTaskContent: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
    },
  };

  return (
    <ThemedView variant="background" style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={toggleTheme}>
          <Sun color={theme.colors.text} size={24} />
        </TouchableOpacity>
        <ThemedView style={styles.headerRow}>
          <TouchableOpacity>
            <ArrowLeft color={theme.colors.text} size={24} />
          </TouchableOpacity>
          <ThemedText size="xl" weight="bold">
            Finance Dashboard
          </ThemedText>
          <TouchableOpacity>
            <Bell color={theme.colors.text} size={24} />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      {/* Search Bar */}
      <ThemedView style={styles.searchContainer}>
        <ThemedView style={styles.searchBar}>
          <Search color={theme.colors.textMuted} size={20} />
          <ThemedText variant="muted" style={{ marginLeft: theme.spacing.sm }}>
            Search
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {/* View Tabs */}
      <ThemedView style={styles.viewTabs}>
        <TouchableOpacity style={styles.activeTab}>
          <ThemedText weight="medium" style={{ color: '#000000' }}>
            Kanban
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.inactiveTab}>
          <ThemedText variant="muted">List</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.inactiveTab}>
          <ThemedText variant="muted">Timeline</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Board Columns */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={styles.boardContainer}
      >
        {columns.map((column) => (
          <ThemedView
            key={column.id}
            style={{
              ...styles.column,
              width: columnWidth,
            }}
          >
            {/* Column Header */}
            <ThemedView style={styles.columnHeader}>
              <ThemedView style={styles.columnTitleRow}>
                <ThemedText size="lg" weight="bold">
                  {column.title}
                </ThemedText>
                {column.tasks.length > 0 && (
                  <ThemedView style={styles.taskCount}>
                    <ThemedText size="sm">{column.tasks.length}</ThemedText>
                  </ThemedView>
                )}
              </ThemedView>
              <TouchableOpacity>
                <ChevronDown color={theme.colors.text} size={20} />
              </TouchableOpacity>
            </ThemedView>

            {/* Tasks */}
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              {column.tasks.map((task) => (
                <TouchableOpacity key={task.id} style={styles.taskCard}>
                  <ThemedView style={styles.taskHeader}>
                    <ThemedText 
                      weight="bold" 
                      size="base" 
                      style={styles.taskTitle}
                    >
                      {task.title}
                    </ThemedText>
                    <ThemedView 
                      style={{
                        ...styles.priorityBadge,
                        backgroundColor: getPriorityColor(task.priority, theme)
                      }}
                    >
                      <ThemedText size="xs" style={{ color: 'white' }}>
                        {task.priority}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                  
                  <ThemedText variant="muted" size="sm" style={{ marginBottom: theme.spacing.sm }}>
                    {task.category}
                  </ThemedText>
                  
                  {task.progress !== undefined && (
                    <ThemedView style={styles.progressContainer}>
                      <ThemedView style={styles.progressBar}>
                        <ThemedView 
                          style={{
                            ...styles.progressFill,
                            width: `${task.progress}%`
                          }}
                        ></ThemedView>
                      </ThemedView>
                    </ThemedView>
                  )}

                  <ThemedView style={styles.taskFooter}>
                    <ThemedView style={styles.assignees}>
                      {task.assignees.map((assignee, index) => (
                        <Image
                          key={assignee.id}
                          source={{ uri: assignee.avatar }}
                          style={[
                            styles.avatar,
                            { marginLeft: index > 0 ? -8 : 0 }
                          ]}
                        />
                      ))}
                    </ThemedView>
                    <ThemedText variant="muted" size="sm">
                      {task.dueDate}
                    </ThemedText>
                  </ThemedView>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ThemedView>
        ))}

        {/* Add List Button */}
        <TouchableOpacity 
          style={[styles.addListButton, { width: columnWidth }]}
        >
          <ThemedView style={styles.addListContent}>
            <Plus color={theme.colors.textMuted} size={20} />
            <ThemedText variant="muted" style={{ marginLeft: theme.spacing.sm }}>
              Add List
            </ThemedText>
          </ThemedView>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Task Button */}
      <ThemedView style={styles.addTaskContainer}>
        <TouchableOpacity style={styles.addTaskButton}>
          <ThemedView style={styles.addTaskContent}>
            <Plus color="#000000" size={20} />
            <ThemedText weight="medium" style={{ color: '#000000', marginLeft: theme.spacing.sm }}>
              Add Task
            </ThemedText>
          </ThemedView>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}
