import React from 'react';
import { Card, Typography } from '@taskflow/ui';
import type { Task } from '../../types/task.types';
import type { Column, Board } from '../../types/board.types';

interface ListViewLayoutProps {
  currentBoard: Board | null;
  tasks: Task[];
  columns: Column[];
  tasksByColumn: Record<string, Task[]>;
  taskStats: {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
  };
  loading: boolean;
  error: string | null;
  onTaskClick: (task: Task) => void;
  onAddTask: (taskData: Partial<Task>) => Promise<void>;
  onAddTaskToColumn: (columnId: string) => void;
  onDragEnd: (result: any) => Promise<void>;
  onEditColumn: (columnId: string) => void;
  onDeleteColumn: (columnId: string) => Promise<void>;
  onUpdateColumn: (columnId: string, columnData: Partial<Column>) => Promise<void>;
  onAddColumn: () => Promise<void>;
  onCancelAddColumn: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isAddingColumn: boolean;
  newColumnName: string;
  setNewColumnName: (name: string) => void;
  setIsAddingColumn: (adding: boolean) => void;
  isAddTaskModalOpen: boolean;
  setIsAddTaskModalOpen: (open: boolean) => void;
  isAddColumnModalOpen: boolean;
  setIsAddColumnModalOpen: (open: boolean) => void;
}

export const ListViewLayout: React.FC<ListViewLayoutProps> = (props) => {
  return (
    <div className="min-h-screen bg-white/[0.7] backdrop-blur-sm text-foreground w-full pb-20">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <Card className="p-8">
          <Typography variant="h3" className="mb-4 text-muted-foreground">
            List View
          </Typography>
          <Typography variant="body-medium" textColor="muted">
            List view functionality is coming soon...
          </Typography>
        </Card>
      </div>
    </div>
  );
};