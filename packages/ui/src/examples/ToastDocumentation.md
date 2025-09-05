# Toast Notification System

A comprehensive, theme-aware toast notification system with support for all major notification types including loading states with progress indicators.

## Features

- ✅ **Success Toast** - Green/positive color for successful actions
- ❌ **Error Toast** - Red/danger color for errors and failures  
- ⚠️ **Warning Toast** - Yellow/orange color for warnings
- ℹ️ **Info Toast** - Blue/neutral color for information
- ⏳ **Loading Toast** - With spinner and optional progress indicator
- 🎨 **Theme Integration** - Respects your design system colors
- 📱 **Responsive** - Works on all screen sizes
- ⚡ **Smooth Animations** - Enter/exit animations with CSS transitions
- 🎛️ **Flexible Positioning** - 6 different positions available
- 🔧 **Fully Customizable** - Duration, content, styling, and behavior

## Quick Start

### 1. Wrap your app with ToastProvider

```tsx
import { ToastProvider } from '@your-org/ui';

function App() {
  return (
    <ToastProvider position="top-right" maxToasts={5}>
      <YourAppContent />
    </ToastProvider>
  );
}
```

### 2. Use the toast hook in your components

```tsx
import { useEnhancedToast } from '@your-org/ui';

function MyComponent() {
  const toast = useEnhancedToast();

  const handleSuccess = () => {
    toast.success('Success!', 'Your action was completed successfully.');
  };

  const handleError = () => {
    toast.error('Error!', 'Something went wrong. Please try again.');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
    </div>
  );
}
```

## Toast Variants

### Success Toast ✅
```tsx
toast.success(
  'Success! ✅',
  'Your action was completed successfully.',
  { duration: 4000 }
);
```

### Error Toast ❌
```tsx
toast.error(
  'Error! ❌',
  'Something went wrong. Please try again.',
  { duration: 6000 }
);
```

### Warning Toast ⚠️
```tsx
toast.warning(
  'Warning! ⚠️',
  'Please review your input before proceeding.',
  { duration: 5000 }
);
```

### Info Toast ℹ️
```tsx
toast.info(
  'Information ℹ️',
  'Here is some helpful information for you.',
  { duration: 4000 }
);
```

### Loading Toast ⏳
```tsx
// Simple loading toast
const loadingId = toast.loading(
  'Processing... ⏳',
  'Please wait while we process your request.'
);

// Loading toast with progress
const loadingId = toast.loading(
  'Processing... ⏳',
  'Please wait while we process your request.',
  { showProgress: true }
);

// Update progress
toast.update(loadingId, { progress: 50 });

// Complete the loading toast
toast.update(loadingId, {
  variant: 'success',
  title: 'Completed! ✅',
  description: 'Your request has been processed successfully.',
  duration: 3000
});
```

## API Reference

### ToastProvider Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `'top-right' \| 'top-left' \| 'bottom-right' \| 'bottom-left' \| 'top-center' \| 'bottom-center'` | `'top-right'` | Position of toast container |
| `maxToasts` | `number` | `5` | Maximum number of toasts to show simultaneously |
| `children` | `ReactNode` | - | Your app content |

### useEnhancedToast() Hook

Returns an object with the following methods:

#### `toast.success(title, description?, options?)`
Shows a success toast.

#### `toast.error(title, description?, options?)`
Shows an error toast.

#### `toast.warning(title, description?, options?)`
Shows a warning toast.

#### `toast.info(title, description?, options?)`
Shows an info toast.

#### `toast.loading(title, description?, options?)`
Shows a loading toast. Returns the toast ID for updates.

#### `toast.update(id, updates)`
Updates an existing toast with new properties.

#### `toast.remove(id)`
Removes a specific toast by ID.

#### `toast.clear()`
Removes all toasts.

### Toast Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `duration` | `number` | `5000` | Auto-dismiss duration in milliseconds (0 = no auto-dismiss) |
| `showProgress` | `boolean` | `false` | Show progress bar (for loading toasts) |
| `progress` | `number` | `0` | Progress percentage (0-100) |
| `className` | `string` | - | Additional CSS classes |

## Advanced Usage

### Manual Loading Toast Control

```tsx
function UploadComponent() {
  const toast = useEnhancedToast();
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = async (file: File) => {
    const loadingId = toast.loading(
      'Uploading file...',
      'Please wait while we upload your file.',
      { showProgress: true }
    );

    try {
      // Simulate upload with progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setUploadProgress(i);
        toast.update(loadingId, { progress: i });
      }

      // Complete with success
      toast.update(loadingId, {
        variant: 'success',
        title: 'Upload Complete!',
        description: 'Your file has been uploaded successfully.',
        duration: 3000
      });
    } catch (error) {
      // Complete with error
      toast.update(loadingId, {
        variant: 'error',
        title: 'Upload Failed',
        description: 'Failed to upload file. Please try again.',
        duration: 5000
      });
    }
  };

  return <button onClick={() => handleUpload(file)}>Upload File</button>;
}
```

### Custom Positioning

```tsx
// Different positions for different use cases
<ToastProvider position="top-center">
  {/* For important notifications */}
</ToastProvider>

<ToastProvider position="bottom-right">
  {/* For less intrusive notifications */}
</ToastProvider>
```

### Multiple Toast Providers

You can have multiple toast providers for different contexts:

```tsx
function App() {
  return (
    <div>
      {/* Global notifications */}
      <ToastProvider position="top-right">
        <MainApp />
      </ToastProvider>
      
      {/* Modal-specific notifications */}
      <ToastProvider position="top-center">
        <ModalContent />
      </ToastProvider>
    </div>
  );
}
```

## Theme Integration

The toast system automatically uses your theme colors:

- **Success**: Uses `--success` CSS variable
- **Error**: Uses `--destructive` CSS variable  
- **Warning**: Uses `--warning` CSS variable
- **Info**: Uses `--info` CSS variable
- **Loading**: Uses `--primary` CSS variable

All colors automatically adapt to light/dark themes and respect your custom color palette.

## Accessibility

- ✅ Proper ARIA labels and roles
- ✅ Keyboard navigation support
- ✅ Screen reader friendly
- ✅ High contrast support
- ✅ Reduced motion support

## Best Practices

1. **Keep messages concise** - Toast notifications should be brief and actionable
2. **Use appropriate variants** - Match the toast type to the message content
3. **Set reasonable durations** - Success/info: 3-4s, Warning: 4-5s, Error: 5-6s
4. **Don't overuse** - Too many toasts can overwhelm users
5. **Provide context** - Include relevant details in the description
6. **Handle loading states** - Use loading toasts for async operations
7. **Update progress** - Show progress for long-running operations

## Examples

See `ToastExample.tsx` for comprehensive examples of all toast variants and features.
