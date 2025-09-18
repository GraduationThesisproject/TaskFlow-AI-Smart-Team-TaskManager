import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, View as RNView, Text as RNText } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';

const RULES_FILE = FileSystem.documentDirectory + 'workspace_rules.txt';

const DEFAULT_RULES = `📌 Task Management Rules

One Task = One Owner

Every task must have a single responsible owner (others can be collaborators).

Clear Titles & Descriptions

Task titles should be short but descriptive.

Description must include context, requirements, and links/resources if needed.

Due Dates are Mandatory

Every task must have a start and/or due date.

Use Labels/Tags

Add at least one tag (e.g., frontend, backend, urgent, bug).

Checklist for Big Tasks

Break larger tasks into subtasks or checklists.

📌 Workflow Rules

No Skipping Columns

Tasks must move step-by-step (e.g., To Do ➝ In Progress ➝ Review ➝ Done).

Limit Work in Progress (WIP)

Max 3 active tasks per person to avoid overload.

Daily Standup Updates

Each member updates at least once per day (comment or status).

Review Required Before Done

Every task in Review must be checked by another teammate or AI assistant before moving to Done.

📌 Communication Rules

Comment Before Closing

Always leave a final comment when completing a task (summary, links, results).

@Mentions for Clarity

Use @name to assign or notify directly.

AI Suggestions First

Before asking the team, check if TaskFlow AI can suggest fixes/answers.

📌 AI Integration Rules

AI for Task Drafting

Use AI to draft tasks, acceptance criteria, or user stories before team refinement.

AI for Summaries

At the end of the day, AI generates a progress summary for the team.

AI for Estimates

Use AI as a second opinion for effort/priority estimation.`;

export default function WorkspaceRulesScreen() {
  const colors = useThemeColors();
  const router = useRouter();

  const [rules, setRules] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const info = await FileSystem.getInfoAsync(RULES_FILE);
        if (info.exists) {
          const content = await FileSystem.readAsStringAsync(RULES_FILE);
          setRules(content);
        } else {
          // Prefill with default and persist once
          setRules(DEFAULT_RULES);
          await FileSystem.writeAsStringAsync(RULES_FILE, DEFAULT_RULES, { encoding: FileSystem.EncodingType.UTF8 });
        }
      } catch (e) {
        console.warn('Failed to load rules file, using defaults.', e);
        setRules(DEFAULT_RULES);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await FileSystem.writeAsStringAsync(RULES_FILE, rules, { encoding: FileSystem.EncodingType.UTF8 });
      Alert.alert('Saved', 'Workspace rules saved successfully.');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to save rules');
    } finally {
      setSaving(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      const safe = (rules || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8" />
        <title>Workspace Rules</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', Arial, sans-serif; padding: 24px; }
          h1 { font-size: 22px; margin-bottom: 12px; }
          .content { line-height: 1.5; font-size: 14px; }
        </style>
      </head><body>
        <h1>Workspace Rules</h1>
        <div class="content">${safe}</div>
      </body></html>`;

      const { uri } = await Print.printToFileAsync({ html });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, { UTI: 'com.adobe.pdf', mimeType: 'application/pdf' });
      } else {
        Alert.alert('PDF saved', `Saved to: ${uri}`);
      }
    } catch (e: any) {
      Alert.alert('Export failed', e?.message || 'Failed to export PDF');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <RNView style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <FontAwesome name="arrow-left" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>Workspace Rules</Text>
        <RNView style={styles.headerActions}>
          <TouchableOpacity onPress={handleExportPdf} style={styles.headerBtn}>
            <FontAwesome name="file-pdf-o" size={20} color={colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.headerBtn}>
            <FontAwesome name="save" size={20} color={colors.primary} />
          </TouchableOpacity>
        </RNView>
      </RNView>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={[styles.editorCard, { backgroundColor: colors.card }]}>
          <TextInput
            value={rules}
            onChangeText={setRules}
            editable={!loading}
            placeholder="Write or paste your workspace rules here..."
            placeholderTextColor={colors['muted-foreground']}
            multiline
            textAlignVertical="top"
            style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
          />
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBtn: { padding: 8 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  content: { padding: 16 },
  editorCard: { padding: 12 },
  input: {
    minHeight: 400,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
});
