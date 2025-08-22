# ConfirmationDialog Component

A reusable confirmation dialog component that provides consistent user experience across the admin application for all confirmation popups.

## Features

- **Multiple Types**: Support for danger, warning, info, and success confirmation types
- **Customizable**: Configurable title, description, and button text
- **Loading States**: Built-in loading state with spinner
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Responsive**: Works on all screen sizes
- **Consistent Styling**: Follows the app's design system

## Usage

### Basic Usage

```tsx
import { ConfirmationDialog } from '../components/common';

const MyComponent = () => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = () => {
    // Your confirmation logic here
    console.log('Action confirmed!');
    setShowConfirm(false);
  };

  return (
    <>
      <Button onClick={() => setShowConfirm(true)}>
        Delete Item
      </Button>

      <ConfirmationDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
};
```

### All Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | Controls whether the dialog is visible |
| `onClose` | `() => void` | - | Function called when dialog is closed |
| `onConfirm` | `() => void` | - | Function called when confirm button is clicked |
| `title` | `string` | - | Dialog title |
| `description` | `string` | - | Optional description text |
| `confirmText` | `string` | `'Confirm'` | Text for the confirm button |
| `cancelText` | `string` | `'Cancel'` | Text for the cancel button |
| `type` | `ConfirmationType` | `'info'` | Visual type of the dialog |
| `isLoading` | `boolean` | `false` | Shows loading state on confirm button |
| `confirmButtonVariant` | `ButtonVariant` | `'default'` | Override confirm button variant |

### Confirmation Types

#### 1. Danger (Red)
Use for destructive actions like delete, remove, or destructive operations.

```tsx
<ConfirmationDialog
  type="danger"
  title="Delete User"
  description="Are you sure you want to delete this user? This action cannot be undone."
  confirmText="Delete"
  cancelText="Cancel"
  // ... other props
/>
```

#### 2. Warning (Yellow)
Use for actions that might have consequences but aren't destructive.

```tsx
<ConfirmationDialog
  type="warning"
  title="Unsaved Changes"
  description="You have unsaved changes. Are you sure you want to leave without saving?"
  confirmText="Leave"
  cancelText="Stay"
  // ... other props
/>
```

#### 3. Info (Blue)
Use for informational confirmations or feature updates.

```tsx
<ConfirmationDialog
  type="info"
  title="Feature Update"
  description="A new feature is available. Would you like to enable it now?"
  confirmText="Enable"
  cancelText="Later"
  // ... other props
/>
```

#### 4. Success (Green)
Use for positive confirmations or completion confirmations.

```tsx
<ConfirmationDialog
  type="success"
  title="Operation Complete"
  description="Your action has been completed successfully. Would you like to continue?"
  confirmText="Continue"
  cancelText="Close"
  // ... other props
/>
```

### Loading States

Show loading state during async operations:

```tsx
const [isLoading, setIsLoading] = useState(false);

const handleConfirm = async () => {
  setIsLoading(true);
  try {
    await deleteUser(userId);
    setShowConfirm(false);
  } catch (error) {
    console.error('Failed to delete user:', error);
  } finally {
    setIsLoading(false);
  }
};

<ConfirmationDialog
  // ... other props
  isLoading={isLoading}
  confirmText={isLoading ? 'Deleting...' : 'Delete'}
/>
```

### Custom Button Variants

Override the default button variant for the confirm button:

```tsx
<ConfirmationDialog
  // ... other props
  confirmButtonVariant="outline"
  type="info"
/>
```

## Examples

### Delete Confirmation

```tsx
const DeleteUserDialog = ({ userId, isOpen, onClose, onDelete }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteUser(userId);
      onDelete();
      onClose();
    } catch (error) {
      console.error('Failed to delete user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleDelete}
      title="Delete User"
      description="Are you sure you want to delete this user? This action cannot be undone."
      confirmText="Delete"
      cancelText="Cancel"
      type="danger"
      isLoading={isLoading}
    />
  );
};
```

### Unsaved Changes Warning

```tsx
const UnsavedChangesDialog = ({ isOpen, onClose, onConfirm }) => (
  <ConfirmationDialog
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Unsaved Changes"
    description="You have unsaved changes. Are you sure you want to leave without saving?"
    confirmText="Leave"
    cancelText="Stay"
    type="warning"
  />
);
```

### Feature Update Info

```tsx
const FeatureUpdateDialog = ({ isOpen, onClose, onEnable }) => (
  <ConfirmationDialog
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onEnable}
    title="New Feature Available"
    description="We've added a new dashboard feature. Would you like to enable it now?"
    confirmText="Enable"
    cancelText="Later"
    type="info"
  />
);
```

## Best Practices

1. **Use Appropriate Types**: Choose the right type for your use case
2. **Clear Descriptions**: Write clear, actionable descriptions
3. **Button Text**: Use specific, action-oriented button text
4. **Loading States**: Show loading states for async operations
5. **Error Handling**: Handle errors gracefully in your confirmation logic
6. **Accessibility**: Ensure keyboard navigation works properly

## Accessibility

- **Keyboard Navigation**: ESC key closes the dialog
- **Focus Management**: Focus is trapped within the dialog
- **ARIA Labels**: Proper ARIA attributes for screen readers
- **Semantic HTML**: Uses semantic HTML elements

## Styling

The component automatically adapts to the current theme and follows the app's design system. Icons and colors are automatically applied based on the `type` prop.

## Dependencies

- `@taskflow/ui` - For Modal, Button, and other UI components
- `@heroicons/react` - For icons
- React hooks for state management
