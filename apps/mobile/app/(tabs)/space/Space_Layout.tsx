// app/(tabs)/space/_layout.tsx
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { withLayoutContext } from "expo-router";
import React from "react";
import { View, Text } from "react-native";
import { KanbanViewLayout } from "../../../Layouts/KanbanViewLayout";
import { TimelineViewLayout } from "../../../Layouts/TimelineViewLayout";
import { TaskDetailsLayout } from "../../../Layouts/TaskDetailsLayout";

const TopTabs = createMaterialTopTabNavigator();

// Wrap for Expo Router
const TopTabsLayout = withLayoutContext(TopTabs.Navigator);

export default function SpaceLayout() {
  return (
    <TopTabsLayout>
      
      <TopTabs.Screen name="index" options={{ title: "Kanban" }}>
        {() => <KanbanViewLayout />}
      </TopTabs.Screen>

      <TopTabs.Screen name="list" options={{ title: "List" }}>
        {() => (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text>List View (placeholder)</Text>
          </View>
        )}
      </TopTabs.Screen>

      <TopTabs.Screen name="timeline" options={{ title: "Timeline" }}>
        {() => <TimelineViewLayout />}
      </TopTabs.Screen>

      <TopTabs.Screen name="task/[taskId]" options={{ title: "Task Details" }}>
        {() => <TaskDetailsLayout />}
      </TopTabs.Screen>
    </TopTabsLayout>
  );
}
