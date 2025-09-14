# MobileAlert Component

A professional, reusable alert system for React Native applications with multiple display types and extensive customization options.

## Features

- **Multiple Types**: Modal, Banner, and Toast notifications
- **Professional Design**: Modern UI with smooth animations
- **Theme Support**: Integrates with your app's theme system
- **Context API**: Easy state management with `MobileAlertProvider`
- **Customizable**: Extensive props for styling and behavior
- **Accessibility**: Built-in accessibility support
- **TypeScript**: Full TypeScript support with proper types

## Installation

```typescript
import { MobileAlert, MobileAlertProvider, useMobileAlert } from '@/components/common/MobileAlertProvider';
```

## Basic Usage

### With Provider (Recommended)

```typescript
import { MobileAlertProvider, useMobileAlert } from '@/components/common/MobileAlertProvider';

function App() {
  return (
    <MobileAlertProvider>
      <YourAppContent />
    </MobileAlertProvider>
  );
}

function YourComponent() {
  const { showSuccess, showError, showModal } = useMobileAlert();

  const handleSuccess = () => {
    showSuccess('Operation completed successfully!');
  };

  const handleError = () => {
    showError('Something went wrong!');
  };

  const handleModal = () => {
    showModal('Confirmation', 'Are you sure you want to proceed?');
  };

  return (
    // Your component JSX
  );
}
```

### Direct Usage

```typescript
import MobileAlert from '@/components/common/MobileAlert';

function YourComponent() {
  const [showAlert, setShowAlert] = useState(false);

  return (
    <>
      <Button onPress={() => setShowAlert(true)} title="Show Alert" />
      
      <MobileAlert
        visible={showAlert}
        type="modal"
        variant="success"
        title="Success"
        message="Operation completed!"
        onClose={() => setShowAlert(false)}
      />
    </>
  );
}
```

## Alert Types

### 1. Modal Alerts
Full-screen modal dialogs with backdrop and actions.

```typescript
showModal('Title', 'Message', {
  variant: 'success',
  onConfirm: () => console.log('Confirmed'),
  onCancel: () => console.log('Cancelled'),
  confirmText: 'Yes',
  cancelText: 'No'
});
```

### 2. Banner Alerts
Top-positioned banner notifications with auto-hide.

```typescript
showBanner('success', 'Banner message', {
  duration: 4000,
  position: 'top',
  showCloseButton: true
});
```

### 3. Toast Notifications
Bottom-positioned toast messages.

```typescript
showToast('info', 'Toast message', {
  duration: 3000,
  position: 'bottom'
});
```

## Quick Methods

```typescript
const { showSuccess, showError, showWarning, showInfo } = useMobileAlert();

// Quick success message
showSuccess('Operation completed!');

// Quick error message
showError('Something went wrong!');

// Quick warning message
showWarning('Please check your input!');

// Quick info message
showInfo('Here is some information!');
```

## Confirmation Dialogs

```typescript
const { showConfirm } = useMobileAlert();

showConfirm(
  'Delete Item',
  'Are you sure you want to delete this item?',
  () => {
    // Handle confirmation
    console.log('Item deleted');
  },
  {
    confirmText: 'Delete',
    cancelText: 'Cancel',
    variant: 'error'
  }
);
```

## Props Reference

### MobileAlert Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `visible` | `boolean` | `false` | Whether the alert is visible |
| `type` | `'modal' \| 'banner' \| 'toast'` | `'modal'` | Alert display type |
| `variant` | `'success' \| 'error' \| 'warning' \| 'info'` | `'info'` | Alert variant/color |
| `title` | `string` | - | Alert title |
| `message` | `string` | - | Alert message content |
| `description` | `string` | - | Alternative to message |
| `onClose` | `() => void` | - | Close callback |
| `onConfirm` | `() => void` | - | Confirm callback |
| `onCancel` | `() => void` | - | Cancel callback |
| `confirmText` | `string` | `'Confirm'` | Confirm button text |
| `cancelText` | `string` | `'Cancel'` | Cancel button text |
| `showCloseButton` | `boolean` | `true` | Show close button |
| `showIcon` | `boolean` | `true` | Show variant icon |
| `icon` | `React.ReactNode` | - | Custom icon |
| `duration` | `number` | `0` | Auto-hide duration (ms) |
| `position` | `'top' \| 'center' \| 'bottom'` | `'center'` | Alert position |
| `animationDuration` | `number` | `300` | Animation duration (ms) |
| `backdropOpacity` | `number` | `0.5` | Backdrop opacity |
| `allowBackdropClose` | `boolean` | `true` | Allow backdrop close |

### Context Methods

| Method | Description |
|--------|-------------|
| `showAlert(props)` | Show custom alert with full props |
| `hideAlert()` | Hide current alert |
| `showModal(title, message, options)` | Show modal alert |
| `showBanner(variant, message, options)` | Show banner alert |
| `showToast(variant, message, options)` | Show toast notification |
| `showSuccess(message, options)` | Quick success message |
| `showError(message, options)` | Quick error message |
| `showWarning(message, options)` | Quick warning message |
| `showInfo(message, options)` | Quick info message |
| `showConfirm(title, message, onConfirm, options)` | Show confirmation dialog |

## Styling

The component automatically adapts to your theme colors and provides professional styling out of the box. You can customize colors by passing style props:

```typescript
<MobileAlert
  visible={true}
  type="banner"
  variant="success"
  message="Custom styled alert"
  style={{
    backgroundColor: '#custom-color',
    borderRadius: 20
  }}
/>
```

## Animation

The component includes smooth entrance and exit animations:

- **Modal**: Scale and fade animation
- **Banner**: Slide from top with fade
- **Toast**: Slide from bottom with fade

Customize animation duration with the `animationDuration` prop.

## Accessibility

- Built-in accessibility roles and labels
- Screen reader support
- Keyboard navigation support
- Focus management

## Examples

### Complete Example

```typescript
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { MobileAlertProvider, useMobileAlert } from '@/components/common/MobileAlertProvider';

function ExampleComponent() {
  const { showSuccess, showError, showConfirm } = useMobileAlert();

  const handleSuccess = () => {
    showSuccess('Data saved successfully!');
  };

  const handleError = () => {
    showError('Failed to save data. Please try again.');
  };

  const handleDelete = () => {
    showConfirm(
      'Delete Item',
      'This action cannot be undone.',
      () => {
        // Perform deletion
        showSuccess('Item deleted successfully!');
      }
    );
  };

  return (
    <View>
      <TouchableOpacity onPress={handleSuccess}>
        <Text>Save Data</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={handleError}>
        <Text>Trigger Error</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={handleDelete}>
        <Text>Delete Item</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  return (
    <MobileAlertProvider>
      <ExampleComponent />
    </MobileAlertProvider>
  );
}
```

## Migration from Old Alert

Replace your old `Alert.alert` calls:

```typescript
// Old way
Alert.alert('Title', 'Message', [
  { text: 'Cancel', onPress: () => {} },
  { text: 'OK', onPress: () => {} }
]);

// New way
const { showModal } = useMobileAlert();
showModal('Title', 'Message', {
  onCancel: () => {},
  onConfirm: () => {}
});
```

## Best Practices

1. **Use the Provider**: Wrap your app with `MobileAlertProvider` for easy access
2. **Choose the Right Type**: Use modals for important actions, banners for notifications
3. **Keep Messages Short**: Concise messages are more effective
4. **Use Appropriate Variants**: Match the variant to the message importance
5. **Handle Callbacks**: Always provide appropriate callback functions
6. **Test Accessibility**: Ensure your alerts work with screen readers

## Troubleshooting

### Common Issues

1. **Alert not showing**: Check if `visible` prop is `true`
2. **Provider not working**: Ensure `MobileAlertProvider` wraps your components
3. **Styling issues**: Check theme colors and custom style props
4. **Animation problems**: Verify `animationDuration` is a positive number

### Debug Mode

Enable debug logging by setting `console.log` statements in your alert callbacks to track alert behavior.
