import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import TaskCard from './TaskCard';

export default function TaskCardExample() {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleDragStart = (id: string) => {
    setDraggedTaskId(id);
    console.log(`Started dragging task: ${id}`);
    // You can add haptic feedback here
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleDragEnd = (id: string) => {
    setDraggedTaskId(null);
    console.log(`Stopped dragging task: ${id}`);
    Alert.alert('Drag Complete', `Task ${id} drag operation completed`);
  };

  const handlePress = () => {
    Alert.alert('Task Pressed', 'Regular tap detected');
  };

  const handleLongPress = () => {
    Alert.alert('Long Press', 'Long press detected - drag will start if draggable is enabled');
  };

  return (
    <View style={{ padding: 16 }}>
      {/* Regular TaskCard (not draggable) */}
      <TaskCard
        id="task-1"
        title="Regular Task Card"
        description="This is a regular task card without drag functionality"
        status="todo"
        priority="medium"
        onPress={handlePress}
        onLongPress={handleLongPress}
        assignee={{
          id: "user-1",
          name: "John Doe"
        }}
        dueDate="2024-12-31"
        tags={["frontend", "react-native"]}
      />

      {/* Draggable TaskCard */}
      <TaskCard
        id="task-2"
        title="Draggable Task Card"
        description="This task card supports drag functionality - long press to start dragging"
        status="in-progress"
        priority="high"
        isDraggable={true}
        onPress={handlePress}
        onLongPress={handleLongPress}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        assignee={{
          id: "user-2",
          name: "Jane Smith"
        }}
        dueDate="2024-11-15"
        tags={["backend", "api", "urgent"]}
        selected={draggedTaskId === "task-2"}
      />
    </View>
  );
}
