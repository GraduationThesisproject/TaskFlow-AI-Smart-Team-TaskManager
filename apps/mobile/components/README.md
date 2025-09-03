# Mobile Components Library

A comprehensive collection of reusable React Native components built with the TaskFlow mobile theme system.

## 🎨 Theme System

All components are built using the mobile theme system with:
- **ThemeProvider**: Context-based theme management
- **Themed Components**: Base components with theme support
- **Color Tokens**: Semantic color system
- **Typography**: Consistent font system
- **Spacing**: Standardized spacing utilities

## 📦 Component Categories

### Themed Components
Base components with built-in theme support:
- `Text` - Themed text component
- `View` - Themed view component
- `TextInput` - Themed input component
- `ScrollView` - Themed scroll view
- `Card` - Card container with shadows
- `Button` - Themed button component
- `ButtonText` - Button text component

### Common Components
Essential UI components:
- `ErrorBoundary` - Error handling with fallback UI
- `LoadingSpinner` - Loading indicator with variants
- `EmptyState` - Empty state with actions
- `ConfirmationDialog` - Modal confirmation dialogs
- `Toast` - Toast notifications
- `Badge` - Status badges
- `Divider` - Visual separators
- `Icon` - Icon component

### Form Components
Form building blocks:
- `FormField` - Form field wrapper with validation
- `FormButton` - Form-specific buttons
- `FormContainer` - Form layout container
- `InputField` - Enhanced input with validation
- `SelectField` - Dropdown select component
- `CheckboxField` - Checkbox input
- `DatePickerField` - Date picker input

### Navigation Components
Navigation-related components:
- `Header` - Screen headers
- `TabBar` - Tab navigation
- `DrawerItem` - Drawer navigation items
- `NavigationButton` - Navigation buttons

### List Components
List and data display:
- `ListItem` - List item component
- `ListSection` - List section headers
- `SwipeableItem` - Swipeable list items
- `SearchableList` - Searchable list component

### Modal Components
Modal and overlay components:
- `Modal` - Modal container
- `BottomSheet` - Bottom sheet modal
- `ActionSheet` - Action sheet component

### Card Components
Data display cards:
- `TaskCard` - Task display card
- `BoardCard` - Board display card
- `WorkspaceCard` - Workspace display card
- `UserCard` - User profile card

### Auth Components
Authentication components:
- `LoginForm` - Login form with validation
- `SignupForm` - Signup form with validation
- `OAuthButton` - OAuth login buttons
- `AuthGuard` - Authentication guard

### Board Components
Task management components:
- `TaskItem` - Task list item
- `ColumnItem` - Board column item
- `BoardHeader` - Board header
- `TaskDetailModal` - Task detail modal
- `AddTaskModal` - Add task modal
- `AddColumnModal` - Add column modal

### Chat Components
Chat functionality:
- `ChatMessage` - Chat message component
- `ChatInput` - Chat input component
- `ChatHeader` - Chat header
- `ChatList` - Chat message list

### Workspace Components
Workspace management:
- `WorkspaceHeader` - Workspace header
- `WorkspaceSettings` - Workspace settings
- `MemberList` - Member list component
- `InviteMemberModal` - Invite member modal

### Settings Components
Settings and configuration:
- `SettingsItem` - Settings list item
- `SettingsSection` - Settings section
- `ThemeSettings` - Theme configuration
- `NotificationSettings` - Notification settings

### Debug Components
Development and debugging:
- `FontTest` - Font testing component
- `DebugPanel` - Debug information panel
- `NetworkStatus` - Network status indicator
- `SocketStatus` - Socket connection status

## 🚀 Usage Examples

### Basic Component Usage

```tsx
import { Text, View, Card, Button } from '@/components';

export default function MyScreen() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Card>
        <Text>Hello World</Text>
        <Button onPress={() => console.log('Pressed!')}>
          <ButtonText>Press Me</ButtonText>
        </Button>
      </Card>
    </View>
  );
}
```

### Form with Validation

```tsx
import { FormField, InputField, Button } from '@/components';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View>
      <FormField label="Email" required>
        <InputField
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email"
          keyboardType="email-address"
        />
      </FormField>
      
      <FormField label="Password" required>
        <InputField
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          secureTextEntry
        />
      </FormField>
      
      <Button onPress={handleSubmit}>
        <ButtonText>Login</ButtonText>
      </Button>
    </View>
  );
}
```

### Task Card Usage

```tsx
import { TaskCard } from '@/components';

export default function TaskList() {
  return (
    <TaskCard
      id="task-1"
      title="Complete Project"
      description="Finish the mobile app development"
      status="in-progress"
      priority="high"
      assignee={{
        id: "user-1",
        name: "John Doe"
      }}
      dueDate="2024-01-15"
      tags={["frontend", "mobile"]}
      onPress={() => console.log('Task pressed')}
    />
  );
}
```

### Error Handling

```tsx
import { ErrorBoundary } from '@/components';

export default function App() {
  return (
    <ErrorBoundary>
      <MyComponent />
    </ErrorBoundary>
  );
}
```

### Loading States

```tsx
import { LoadingSpinner } from '@/components';

export default function LoadingScreen() {
  return (
    <LoadingSpinner 
      text="Loading data..." 
      fullScreen 
    />
  );
}
```

## 🎯 Theme Integration

All components automatically use the current theme:

```tsx
import { useTheme, useThemeColors } from '@/components/ThemeProvider';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  const colors = useThemeColors();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.foreground }}>
        Current theme: {theme}
      </Text>
      <Button onPress={toggleTheme}>
        <ButtonText>Toggle Theme</ButtonText>
      </Button>
    </View>
  );
}
```

## 🔧 Customization

### Custom Styling

```tsx
<Card style={{ marginTop: 20, padding: 24 }}>
  <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
    Custom styled content
  </Text>
</Card>
```

### Theme Overrides

```tsx
<Button 
  style={{ backgroundColor: '#custom-color' }}
  variant="primary"
>
  <ButtonText>Custom Button</ButtonText>
</Button>
```

## 📱 Platform Compatibility

All components are designed for:
- ✅ iOS
- ✅ Android
- ✅ Cross-platform consistency
- ✅ Responsive design
- ✅ Accessibility support

## 🎨 Design System

### Color Tokens
- `primary` - Primary brand color
- `secondary` - Secondary brand color
- `accent` - Accent color
- `success` - Success states
- `warning` - Warning states
- `error` - Error states
- `foreground` - Text color
- `background` - Background color
- `muted-foreground` - Muted text
- `border` - Border color

### Typography
- `display.large` - Large display text
- `heading.h1` - Main headings
- `heading.h2` - Sub headings
- `heading.h3` - Section headings
- `body.large` - Large body text
- `body.medium` - Medium body text
- `body.small` - Small body text
- `caption.large` - Large captions
- `caption.small` - Small captions

### Spacing
- `xs` - Extra small (4px)
- `sm` - Small (8px)
- `md` - Medium (16px)
- `lg` - Large (24px)
- `xl` - Extra large (32px)
- `2xl` - 2x large (48px)
- `3xl` - 3x large (64px)

## 🔍 Best Practices

1. **Use Theme Hooks**: Always use `useThemeColors()` for colors
2. **Consistent Spacing**: Use the spacing system for margins/padding
3. **Typography**: Use TextStyles for consistent text styling
4. **Error Handling**: Wrap components in ErrorBoundary
5. **Loading States**: Use LoadingSpinner for async operations
6. **Accessibility**: Include proper accessibility props
7. **Performance**: Use React.memo for expensive components

## 🚀 Getting Started

1. Import components from the index:
```tsx
import { Text, View, Card, Button } from '@/components';
```

2. Use theme hooks for styling:
```tsx
import { useThemeColors } from '@/components/ThemeProvider';
```

3. Wrap your app with ThemeProvider:
```tsx
import { ThemeProvider } from '@/components/ThemeProvider';

export default function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}
```

## 📚 Additional Resources

- [Theme System Guide](./THEME_GUIDE.md)
- [Component API Documentation](./API.md)
- [Design Tokens](./tokens.json)
- [Storybook Stories](./stories/)

---

Built with ❤️ for TaskFlow Mobile App
