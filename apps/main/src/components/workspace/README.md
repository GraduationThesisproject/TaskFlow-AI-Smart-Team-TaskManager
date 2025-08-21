# CreateWorkspaceModal Component

A reusable modal component for creating new workspaces in the TaskFlow application.

## Features

- **Form Validation**: Validates workspace name (required, 2-200 characters) and description (optional, max 1000 characters)
- **Visibility Settings**: Choose between private and public workspace visibility
- **Owner Information**: Displays current user as workspace owner (auto-filled, not editable)
- **Loading States**: Shows loading state during workspace creation
- **Error Handling**: Displays validation errors and API errors
- **Responsive Design**: Works on desktop and mobile devices

## Usage

```tsx
import { CreateWorkspaceModal } from '../../components/workspace/CreateWorkspaceModal';

const MyComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleCreateWorkspace = async (workspaceData) => {
    try {
      // Handle workspace creation
      await createWorkspace(workspaceData);
      setIsOpen(false);
    } catch (error) {
      // Handle error
    }
  };

  return (
    <CreateWorkspaceModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onSubmit={handleCreateWorkspace}
    />
  );
};
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | Yes | Controls modal visibility |
| `onClose` | `() => void` | Yes | Callback when modal is closed |
| `onSubmit` | `(data) => Promise<void>` | Yes | Callback when form is submitted |

## Form Data Structure

```typescript
interface WorkspaceData {
  name: string;           // Required, 2-200 characters
  description?: string;   // Optional, max 1000 characters
  visibility: 'private' | 'public';
}
```

## API Integration

The component integrates with the workspace API through Redux:

- **Endpoint**: `POST /api/workspaces`
- **Service**: `WorkspaceService.createWorkspace()`
- **Redux Action**: `createWorkspace` thunk
- **Hook**: `useCreateWorkspaceModal`

## Styling

Uses the global theme system with:
- Modal components from `@taskflow/ui`
- Consistent spacing and typography
- Error states with destructive colors
- Loading states with disabled inputs

## Accessibility

- Keyboard navigation support (Escape to close)
- ARIA labels and descriptions
- Focus management
- Screen reader friendly error messages
