import React from 'react';
import { ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Settings, Moon, Sun } from 'lucide-react-native';
import { 
  useTheme, 
  ThemedView, 
  ThemedText, 
  ThemedButton,
  getPriorityColor 
} from '../theme';

// Example: Converting a regular component to use theme system
export default function ThemeUsageExample() {
  const { theme, themeMode, toggleTheme } = useTheme();

  // Create styles using theme values
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.md,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    card: {
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.xl,
      marginBottom: theme.spacing.md,
      ...theme.shadows.sm, // Apply shadow
    },
    priorityBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.md,
      alignSelf: 'flex-start',
    },
    buttonRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.md,
    },
    flexButton: {
      flex: 1,
    },
  });

  const tasks = [
    { id: 1, title: 'Design Review', priority: 'high', status: 'pending' },
    { id: 2, title: 'Code Review', priority: 'medium', status: 'in progress' },
    { id: 3, title: 'Testing', priority: 'low', status: 'completed' },
  ];

  return (
    <ThemedView variant="background" style={styles.container}>
      {/* Header with theme toggle */}
      <ThemedView style={styles.header}>
        <ThemedText size="2xl" weight="bold">
          Theme Example
        </ThemedText>
        <TouchableOpacity onPress={toggleTheme}>
          {themeMode === 'dark' ? (
            <Sun color={theme.colors.primary} size={24} />
          ) : (
            <Moon color={theme.colors.primary} size={24} />
          )}
        </TouchableOpacity>
      </ThemedView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Typography Examples */}
        <ThemedView style={styles.section}>
          <ThemedText size="lg" weight="bold" style={{ marginBottom: theme.spacing.md }}>
            Typography Scale
          </ThemedText>
          <ThemedView variant="card" style={styles.card}>
            <ThemedText size="xs" variant="muted">Extra Small Text (xs)</ThemedText>
            <ThemedText size="sm" variant="muted">Small Text (sm)</ThemedText>
            <ThemedText size="base">Base Text (base)</ThemedText>
            <ThemedText size="lg" weight="medium">Large Text (lg)</ThemedText>
            <ThemedText size="xl" weight="bold">Extra Large (xl)</ThemedText>
            <ThemedText size="2xl" weight="bold">2X Large (2xl)</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Color Examples */}
        <ThemedView style={styles.section}>
          <ThemedText size="lg" weight="bold" style={{ marginBottom: theme.spacing.md }}>
            Color System
          </ThemedText>
          <ThemedView variant="card" style={styles.card}>
            <ThemedText variant="primary">Primary Text</ThemedText>
            <ThemedText variant="secondary">Secondary Text</ThemedText>
            <ThemedText variant="muted">Muted Text</ThemedText>
            
            <ThemedView style={{ marginTop: theme.spacing.md }}>
              <ThemedText style={{ color: theme.colors.success }}>Success Color</ThemedText>
              <ThemedText style={{ color: theme.colors.warning }}>Warning Color</ThemedText>
              <ThemedText style={{ color: theme.colors.error }}>Error Color</ThemedText>
              <ThemedText style={{ color: theme.colors.info }}>Info Color</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Button Examples */}
        <ThemedView style={styles.section}>
          <ThemedText size="lg" weight="bold" style={{ marginBottom: theme.spacing.md }}>
            Button Variants
          </ThemedText>
          <ThemedView variant="card" style={styles.card}>
            <ThemedView style={styles.buttonRow}>
              <ThemedButton 
                variant="primary" 
                style={styles.flexButton}
                onPress={() => console.log('Primary')}
              >
                Primary
              </ThemedButton>
              <ThemedButton 
                variant="secondary" 
                style={styles.flexButton}
                onPress={() => console.log('Secondary')}
              >
                Secondary
              </ThemedButton>
            </ThemedView>
            <ThemedView style={styles.buttonRow}>
              <ThemedButton 
                variant="outline" 
                style={styles.flexButton}
                onPress={() => console.log('Outline')}
              >
                Outline
              </ThemedButton>
              <ThemedButton 
                variant="primary" 
                disabled
                style={styles.flexButton}
                onPress={() => {}}
              >
                Disabled
              </ThemedButton>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Task List Example */}
        <ThemedView style={styles.section}>
          <ThemedText size="lg" weight="bold" style={{ marginBottom: theme.spacing.md }}>
            Task List with Priority Colors
          </ThemedText>
          {tasks.map((task) => (
            <ThemedView key={task.id} variant="card" style={styles.card}>
              <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <ThemedView style={{ flex: 1 }}>
                  <ThemedText weight="medium" style={{ marginBottom: theme.spacing.xs }}>
                    {task.title}
                  </ThemedText>
                  <ThemedText variant="muted" size="sm">
                    Status: {task.status}
                  </ThemedText>
                </ThemedView>
                <ThemedView 
                  style={[
                    styles.priorityBadge,
                    { backgroundColor: getPriorityColor(task.priority, theme) }
                  ]}
                >
                  <ThemedText size="xs" style={{ color: 'white' }}>
                    {task.priority.toUpperCase()}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          ))}
        </ThemedView>

        {/* Spacing Examples */}
        <ThemedView style={styles.section}>
          <ThemedText size="lg" weight="bold" style={{ marginBottom: theme.spacing.md }}>
            Spacing System
          </ThemedText>
          <ThemedView variant="card" style={styles.card}>
            <ThemedView style={{ padding: theme.spacing.xs, backgroundColor: theme.colors.primary + '20', marginBottom: theme.spacing.xs }}>
              <ThemedText size="sm">XS Spacing (4px)</ThemedText>
            </ThemedView>
            <ThemedView style={{ padding: theme.spacing.sm, backgroundColor: theme.colors.primary + '20', marginBottom: theme.spacing.xs }}>
              <ThemedText size="sm">SM Spacing (8px)</ThemedText>
            </ThemedView>
            <ThemedView style={{ padding: theme.spacing.md, backgroundColor: theme.colors.primary + '20', marginBottom: theme.spacing.xs }}>
              <ThemedText size="sm">MD Spacing (16px)</ThemedText>
            </ThemedView>
            <ThemedView style={{ padding: theme.spacing.lg, backgroundColor: theme.colors.primary + '20' }}>
              <ThemedText size="sm">LG Spacing (24px)</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Theme Info */}
        <ThemedView style={styles.section}>
          <ThemedText size="lg" weight="bold" style={{ marginBottom: theme.spacing.md }}>
            Current Theme Info
          </ThemedText>
          <ThemedView variant="card" style={styles.card}>
            <ThemedText>Mode: <ThemedText weight="medium">{themeMode}</ThemedText></ThemedText>
            <ThemedText>Primary Color: <ThemedText weight="medium">{theme.colors.primary}</ThemedText></ThemedText>
            <ThemedText>Background: <ThemedText weight="medium">{theme.colors.background}</ThemedText></ThemedText>
            <ThemedText>Surface: <ThemedText weight="medium">{theme.colors.surface}</ThemedText></ThemedText>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}
