import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { TextStyles } from '@/constants/Fonts';
import { useThemeColors } from '@/components/ThemeProvider';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';

export default function BoardHomeScreen() {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[TextStyles.heading.h1, { color: colors.foreground }]}>Board</Text>
      </View>

      <View style={styles.content}>
        <Card style={styles.sectionCard}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 16 }]}>Views</Text>
          <View style={styles.links}>
            <TouchableOpacity style={[styles.link, { backgroundColor: colors.card }]} onPress={() => router.push('/board/kanban')}>
              <FontAwesome name="th-large" size={18} color={colors.primary} />
              <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>Kanban</Text>
              <FontAwesome name="chevron-right" size={14} color={colors['muted-foreground']} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.link, { backgroundColor: colors.card }]} onPress={() => router.push('/board/list')}>
              <FontAwesome name="list" size={18} color={colors.primary} />
              <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>List</Text>
              <FontAwesome name="chevron-right" size={14} color={colors['muted-foreground']} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.link, { backgroundColor: colors.card }]} onPress={() => router.push('/board/timeline')}>
              <FontAwesome name="clock-o" size={18} color={colors.primary} />
              <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>Timeline</Text>
              <FontAwesome name="chevron-right" size={14} color={colors['muted-foreground']} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.link, { backgroundColor: colors.card }]} onPress={() => router.push('/board/task')}>
              <FontAwesome name="tasks" size={18} color={colors.primary} />
              <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>Task Details</Text>
              <FontAwesome name="chevron-right" size={14} color={colors['muted-foreground']} />
            </TouchableOpacity>
          </View>
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
  links: { gap: 12 },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
});
