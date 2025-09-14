# Banner Component

A reusable, animated banner component for displaying notifications, alerts, and messages throughout your app.

## Features

- 🎨 **4 Types**: Success, Error, Warning, Info with distinct colors
- 📱 **Responsive**: Works on all screen sizes
- ⚡ **Animated**: Smooth fade and slide animations
- 🎯 **Flexible**: Top or bottom positioning
- 🔄 **Auto-hide**: Configurable duration or manual control
- 🎛️ **Customizable**: Full styling and behavior control
- 📦 **Context Provider**: Easy state management with hooks

## Usage

### Method 1: Using BannerProvider (Recommended)

Wrap your app with the BannerProvider and use the hook:

```tsx
import { BannerProvider, useBanner } from '@/components/common/BannerProvider';

// In your app root
function App() {
  return (
    <BannerProvider>
      <YourAppContent />
    </BannerProvider>
  );
}

// In any component
function MyComponent() {
  const { showSuccess, showError, showWarning, showInfo } = useBanner();

  const handleSuccess = () => {
    showSuccess('Operation completed!');
  };

  const handleError = () => {
    showError('Something went wrong!');
  };

  return (
    <View>
      <Button onPress={handleSuccess} title="Success" />
      <Button onPress={handleError} title="Error" />
    </View>
  );
}
```

### Method 2: Direct Usage

Use the Banner component directly with state management:

```tsx
import { Banner } from '@/components/common/Banner';

function MyComponent() {
  const [banner, setBanner] = useState({
    visible: false,
    type: 'success' as const,
    message: '',
  });

  const showBanner = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setBanner({ visible: true, type, message });
  };

  return (
    <View>
      <Banner
        visible={banner.visible}
        type={banner.type}
        message={banner.message}
        onClose={() => setBanner(prev => ({ ...prev, visible: false }))}
        duration={3000}
        position="bottom"
      />
    </View>
  );
}
```

## Props

### Banner Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `visible` | `boolean` | - | Whether the banner is visible |
| `type` | `'success' \| 'error' \| 'warning' \| 'info'` | - | Banner type (determines color) |
| `message` | `string` | - | Message to display |
| `duration` | `number` | `3000` | Auto-hide duration in ms (0 = no auto-hide) |
| `onClose` | `() => void` | - | Called when banner is closed |
| `onPress` | `() => void` | - | Called when banner is pressed |
| `showCloseButton` | `boolean` | `true` | Whether to show close button |
| `position` | `'top' \| 'bottom'` | `'bottom'` | Banner position |
| `style` | `ViewStyle` | - | Additional container styles |
| `textStyle` | `TextStyle` | - | Additional text styles |
| `animationDuration` | `number` | `300` | Animation duration in ms |
| `testID` | `string` | - | Test identifier |

### BannerProvider Hook Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `showBanner` | `BannerState` | Show banner with full control |
| `hideBanner` | - | Hide current banner |
| `showSuccess` | `message, options?` | Show success banner |
| `showError` | `message, options?` | Show error banner |
| `showWarning` | `message, options?` | Show warning banner |
| `showInfo` | `message, options?` | Show info banner |

## Examples

### Basic Usage

```tsx
const { showSuccess } = useBanner();

// Simple success message
showSuccess('Data saved successfully!');

// Custom duration
showError('Failed to save data!', { duration: 5000 });

// Top position
showInfo('New feature available!', { position: 'top' });
```

### Advanced Usage

```tsx
const { showBanner } = useBanner();

// Custom banner with click handler
showBanner({
  type: 'info',
  message: 'Tap to learn more!',
  onPress: () => {
    // Navigate to help page
    navigation.navigate('Help');
  },
  duration: 0, // No auto-hide
  position: 'top',
});

// Banner with custom styling
showBanner({
  type: 'success',
  message: 'Custom styled banner!',
  style: { marginHorizontal: 20 },
  textStyle: { fontSize: 16 },
});
```

### Direct Component Usage

```tsx
<Banner
  visible={showBanner}
  type="warning"
  message="This is a warning message!"
  onClose={() => setShowBanner(false)}
  duration={0}
  showCloseButton={true}
  position="bottom"
  style={{ marginBottom: 20 }}
/>
```

## Styling

The Banner component uses predefined colors for each type:

- **Success**: Green (`#10B981`)
- **Error**: Red (`#EF4444`)
- **Warning**: Orange (`#F59E0B`)
- **Info**: Blue (`#3B82F6`)

You can override styles using the `style` and `textStyle` props.

## Accessibility

The Banner component includes:

- Proper touch targets (minimum 44x44px)
- Screen reader support
- High contrast colors
- Clear visual hierarchy

## Performance

- Uses `useNativeDriver: true` for smooth animations
- Minimal re-renders with proper memoization
- Lightweight implementation
- No external dependencies
