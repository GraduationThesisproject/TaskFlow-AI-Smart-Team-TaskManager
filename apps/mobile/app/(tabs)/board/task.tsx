import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { TextStyles } from '@/constants/Fonts';
import { useThemeColors } from '@/components/ThemeProvider';

export default function TaskDetailsScreen() {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[TextStyles.heading.h1, { color: colors.foreground }]}>Task Details</Text>
      </View>

      <View style={styles.content}>
        <Card style={styles.sectionCard}>
          <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>Select a task to view details.</Text>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  content: { flex: 1, padding: 16 },
  sectionCard: { padding: 20 },
});
