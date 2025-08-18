import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { formatDate, getRelativeTime } from '@taskflow/utils';

interface Task {
  id: number;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export default function App() {
  const [tasks, setTasks] = React.useState<Task[]>([
    { id: 1, title: 'Setup project structure', completed: true, createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    { id: 2, title: 'Implement user authentication', completed: false, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { id: 3, title: 'Design dashboard UI', completed: false, createdAt: new Date(Date.now() - 30 * 60 * 1000) },
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-6 py-12">
        <Text className="text-4xl font-bold text-foreground text-center mb-2">
          TaskFlow Mobile
        </Text>
        <Text className="text-lg text-muted-foreground text-center mb-8">
          Smart Team Task Manager
        </Text>

        <View className="bg-card rounded-lg p-6 mb-6">
          <Text className="text-xl font-semibold text-card-foreground mb-4">
            Recent Tasks
          </Text>
          
          {tasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              onPress={() => toggleTask(task.id)}
              className="flex-row items-center justify-between p-4 border border-border rounded-lg mb-3"
            >
              <View className="flex-row items-center flex-1">
                <View className={`w-5 h-5 rounded border-2 mr-3 ${
                  task.completed ? 'bg-primary border-primary' : 'border-muted-foreground'
                }`} />
                <Text className={`flex-1 ${
                  task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                }`}>
                  {task.title}
                </Text>
              </View>
              <Text className="text-sm text-muted-foreground">
                {getRelativeTime(task.createdAt)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="bg-card rounded-lg p-6">
          <Text className="text-xl font-semibold text-card-foreground mb-4">
            Quick Actions
          </Text>
          
          <TouchableOpacity className="bg-primary rounded-lg p-4 mb-3">
            <Text className="text-primary-foreground text-center font-medium">
              Create New Task
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="border border-border rounded-lg p-4 mb-3">
            <Text className="text-foreground text-center font-medium">
              View All Projects
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-secondary rounded-lg p-4">
            <Text className="text-secondary-foreground text-center font-medium">
              Team Dashboard
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-center text-sm text-muted-foreground mt-8">
          Last updated: {formatDate(new Date())}
        </Text>
      </View>
    </ScrollView>
  );
}
