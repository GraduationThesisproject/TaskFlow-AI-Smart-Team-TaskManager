import React, { useRef, useState } from 'react';
import { Dimensions, ScrollView, TouchableOpacity, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { ThemedView, ThemedText, useTheme } from '../theme';
import { ChevronDown, Plus, Users, LayoutGrid, Activity as ActivityIcon } from 'lucide-react-native';

export default function SpaceScreen() {
  const { theme } = useTheme();
  const pagerRef = useRef<PagerView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const screenWidth = Dimensions.get('window').width;

  const styles = {
    ...theme.globalStyles,
    tabs: {
      flexDirection: 'row' as const,
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    activeTab: {
      backgroundColor: theme.colors.card,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
    },
    inactiveTab: {
      backgroundColor: theme.colors.muted,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
    },
    section: {
      padding: theme.spacing.md,
      gap: theme.spacing.md,
    },
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.md,
    },
    row: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
    },
    chip: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      backgroundColor: theme.colors.muted,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: theme.borderRadius.lg,
    },
  } as const;

  return (
    <ThemedView variant="background" style={{ flex: 1 }}>
      {/* Header */}
      <ThemedView style={[styles.header, { paddingHorizontal: theme.spacing.md }]}>        
        <ThemedText size="xl" weight="bold">Space</ThemedText>
        <TouchableOpacity>
          <ChevronDown color={theme.colors.text} size={20} />
        </TouchableOpacity>
      </ThemedView>

      {/* Tabs */}
      <ThemedView style={styles.tabs}>
        <TouchableOpacity
          style={activeIndex === 0 ? styles.activeTab : styles.inactiveTab}
          onPress={() => {
            setActiveIndex(0);
            pagerRef.current?.setPage(0);
          }}
        >
          <ThemedText weight="medium">Overview</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={activeIndex === 1 ? styles.activeTab : styles.inactiveTab}
          onPress={() => {
            setActiveIndex(1);
            pagerRef.current?.setPage(1);
          }}
        >
          <ThemedText weight="medium">Boards</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={activeIndex === 2 ? styles.activeTab : styles.inactiveTab}
          onPress={() => {
            setActiveIndex(2);
            pagerRef.current?.setPage(2);
          }}
        >
          <ThemedText weight="medium">Activity</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Slides */}
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={({ nativeEvent }) => setActiveIndex(nativeEvent.position)}
      >
        {/* Overview */}
        <ThemedView key="overview" style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.section}>
            <ThemedView style={[styles.card, styles.row]}>              
              <ThemedText size="lg" weight="bold">Welcome to your Space</ThemedText>
              <TouchableOpacity style={styles.chip}>
                <Plus color={theme.colors.text} size={16} />
                <ThemedText style={{ marginLeft: 6 }}>New</ThemedText>
              </TouchableOpacity>
            </ThemedView>

            <ThemedView style={styles.card}>
              <ThemedText weight="bold">Members</ThemedText>
              <View style={{ height: theme.spacing.md }} />
              <ThemedView style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                <Users color={theme.colors.text} size={18} />
                <ThemedText variant="muted">Invite teammates to collaborate</ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.card}>
              <ThemedText weight="bold">Quick Start</ThemedText>
              <View style={{ height: theme.spacing.sm }} />
              <ThemedText variant="muted">Create your first board to organize tasks.</ThemedText>
            </ThemedView>
          </ScrollView>
        </ThemedView>

        {/* Boards */}
        <ThemedView key="boards" style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.section}>
            <ThemedView style={[styles.card, styles.row]}>
              <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <LayoutGrid color={theme.colors.text} size={18} />
                <ThemedText weight="bold">Boards</ThemedText>
              </ThemedView>
              <TouchableOpacity style={styles.chip}>
                <Plus color={theme.colors.text} size={16} />
                <ThemedText style={{ marginLeft: 6 }}>New Board</ThemedText>
              </TouchableOpacity>
            </ThemedView>

            {/* Placeholder cards */}
            <ThemedView style={styles.card}>
              <ThemedText>Kanban Board</ThemedText>
              <ThemedText variant="muted">Track tasks across stages</ThemedText>
            </ThemedView>
            <ThemedView style={styles.card}>
              <ThemedText>Timeline Board</ThemedText>
              <ThemedText variant="muted">Plan tasks over time</ThemedText>
            </ThemedView>
          </ScrollView>
        </ThemedView>

        {/* Activity */}
        <ThemedView key="activity" style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.section}>
            <ThemedView style={[styles.card, styles.row]}>
              <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ActivityIcon color={theme.colors.text} size={18} />
                <ThemedText weight="bold">Recent Activity</ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.card}>
              <ThemedText variant="muted">No activity yet.</ThemedText>
            </ThemedView>
          </ScrollView>
        </ThemedView>
      </PagerView>
    </ThemedView>
  );
}