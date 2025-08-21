# TaskDetailModal Component

A comprehensive task detail modal component that provides a full-featured interface for viewing and editing task information.

## Features

### 🎨 **Design & Layout**
- **Responsive Design**: Adapts to different screen sizes with a mobile-first approach
- **Dark/Light Theme Support**: Fully compatible with the design system's theme tokens
- **Two-Column Layout**: Main content on the left, metadata on the right
- **Modern UI**: Clean, professional interface matching the screenshot design

### 📋 **Task Management**
- **Status Management**: Dropdown to change task status (To Do, In Progress, Review, Done)
- **Priority Display**: Visual priority badges with color coding
- **Assignee Management**: Avatar display with ability to add/remove assignees
- **Due Date**: Date picker for setting task deadlines

### 📝 **Content Sections**
- **Description**: Rich text area for detailed task descriptions
- **Subtasks**: 
  - Progress tracking with visual indicators
  - Add/remove subtasks with due dates and assignees
  - Checkbox completion status
- **Attachments**: 
  - File upload with drag & drop support
  - File type icons and size display
  - Upload area with visual feedback
- **Comments & Activity**: 
  - Real-time comment system
  - User avatars and timestamps
  - Activity feed display

### 🏷️ **Metadata & Organization**
- **Labels/Tags**: 
  - Color-coded labels for categorization
  - Add/remove labels with custom colors
  - Visual tag management
- **Estimated Time**: Time tracking with hour input
- **Dependencies**: Display task dependencies with link indicators

### ⚡ **Actions & Functionality**
- **Save Changes**: Persist modifications to the task
- **Cancel**: Close modal without saving
- **Delete Task**: Remove task with confirmation
- **Real-time Updates**: Live preview of changes

## Usage

```tsx
import { TaskDetailModal } from '@taskflow/components/board';
import type { Task, User } from '@taskflow/types';

const MyComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [task, setTask] = useState<Task | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const handleSave = async (taskData: Partial<Task>) => {
    // Save task data to your backend
    console.log('Saving task:', taskData);
  };

  const handleDelete = async () => {
    // Delete task from your backend
    console.log('Deleting task');
  };

  return (
    <TaskDetailModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      task={task}
      onSave={handleSave}
      onDelete={handleDelete}
      users={users}
    />
  );
};
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | Yes | Controls modal visibility |
| `onClose` | `() => void` | Yes | Callback when modal is closed |
| `task` | `Task \| null` | Yes | Task data to display/edit |
| `onSave` | `(taskData: Partial<Task>) => Promise<void>` | Yes | Callback when saving changes |
| `onDelete` | `() => Promise<void>` | Yes | Callback when deleting task |
| `users` | `User[]` | No | Available users for assignment |

## Data Types

### Task Interface
```tsx
interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  assignee?: User;
  dueDate?: Date;
  tags: string[];
  attachments: Attachment[];
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
  workspaceId: string;
  boardId: string;
  columnId: string;
}
```

### User Interface
```tsx
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}
```

## Styling

The component uses the design system's theme tokens and is fully responsive:

- **Breakpoints**: Mobile-first approach with responsive grid layout
- **Colors**: Uses semantic color tokens (primary, accent, success, etc.)
- **Spacing**: Consistent spacing using the design system's spacing scale
- **Typography**: Typography tokens for consistent text styling
- **Shadows**: Subtle shadows for depth and hierarchy

## Accessibility

- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Focus Management**: Automatic focus management when modal opens/closes
- **Color Contrast**: Meets WCAG accessibility standards

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Responsive design works across all device sizes

## Demo

Visit `/task-detail-demo` in the application to see the component in action with sample data and full functionality.
