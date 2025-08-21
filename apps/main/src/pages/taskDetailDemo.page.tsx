import React, { useState } from 'react';
import { Button, Typography, Container, Stack } from '@taskflow/ui';
import { TaskDetailModal } from '../components/board/TaskDetailModal';
import type { Task, User } from '../types/task.types';

const TaskDetailDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  // Mock users data
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    },
  ];

  // Mock task data
  const mockTask: Task = {
    id: '1',
    title: 'Design New Landing Page',
    description: 'Create a modern and responsive landing page for our new product launch. The design should focus on user experience and conversion optimization.',
    status: 'in_progress',
    priority: 'high',
    assigneeId: '1',
    assignee: mockUsers[0],
    dueDate: new Date('2024-12-20'),
    tags: ['Design', 'Frontend', 'Priority'],
    attachments: [
      {
        id: '1',
        filename: 'mockup-v1.png',
        url: '#',
        size: 2.4 * 1024 * 1024,
        type: 'image/png',
        uploadedAt: new Date(),
      },
      {
        id: '2',
        filename: 'requirements.pdf',
        url: '#',
        size: 1.8 * 1024 * 1024,
        type: 'application/pdf',
        uploadedAt: new Date(),
      },
    ],
    comments: [
      {
        id: '1',
        content: 'Updated the wireframes based on client feedback. Ready for review.',
        authorId: '1',
        author: mockUsers[0],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: '2',
        content: 'Looks great! Just need to adjust the spacing on mobile.',
        authorId: '2',
        author: mockUsers[1],
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    workspaceId: 'workspace-1',
    boardId: 'board-1',
    columnId: 'column-1',
  };

  const handleOpenModal = () => {
    setCurrentTask(mockTask);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentTask(null);
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    console.log('Saving task:', taskData);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Task saved successfully!');
  };

  const handleDeleteTask = async () => {
    console.log('Deleting task:', currentTask?.id);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Task deleted successfully!');
    handleCloseModal();
  };

  return (
    <Container className="py-8">
      <Stack gap="lg" className="max-w-2xl mx-auto">
        <div className="text-center">
          <Typography variant="h1" className="mb-4">
            Task Detail Modal Demo
          </Typography>
          <Typography variant="body-lg" className="text-neutral-600 dark:text-neutral-400 mb-8">
            Click the button below to open the task detail modal and explore all the features.
          </Typography>
        </div>

        <div className="text-center">
          <Button 
            variant="gradient" 
            size="lg" 
            onClick={handleOpenModal}
            className="px-8 py-3"
          >
            Open Task Detail Modal
          </Button>
        </div>

        <div className="bg-neutral-100 dark:bg-neutral-200 p-6 rounded-lg">
          <Typography variant="h3" className="mb-4">
            Features Included:
          </Typography>
          <ul className="space-y-2 text-sm">
            <li>✅ Responsive design with dark/light theme support</li>
            <li>✅ Task status and priority management</li>
            <li>✅ Assignee management with avatars</li>
            <li>✅ Rich text description editor</li>
            <li>✅ Subtasks with progress tracking</li>
            <li>✅ File attachments with drag & drop</li>
            <li>✅ Comments and activity feed</li>
            <li>✅ Due date and time estimation</li>
            <li>✅ Custom labels/tags with color coding</li>
            <li>✅ Task dependencies</li>
            <li>✅ Save, cancel, and delete actions</li>
          </ul>
        </div>

        <TaskDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          task={currentTask}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          users={mockUsers}
        />
      </Stack>
    </Container>
  );
};

export default TaskDetailDemo;
