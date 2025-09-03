# TaskFlow Theme System

A comprehensive theming solution for your React Native TaskFlow application.

## 🎨 Overview

The theme system provides:
- **Consistent colors** across light and dark modes
- **Typography scale** with predefined sizes and weights
- **Spacing system** for consistent layouts
- **Reusable components** with theme integration
- **TypeScript support** for type safety

## 📁 Structure

```
theme/
├── types.ts          # TypeScript interfaces
├── colors.ts         # Color palettes
├── theme.ts          # Main theme configuration
├── ThemeProvider.tsx # React context provider
├── components.tsx    # Themed components
├── utils.ts          # Helper functions
└── index.ts          # Exports
```

## 🚀 Quick Start

### 1. Wrap your app with ThemeProvider

```tsx
import { ThemeProvider } from './theme';

export default function App() {
  return (
    <ThemeProvider initialTheme="dark">
      <YourAppContent />
    </ThemeProvider>
  );
}
```

### 2. Use the theme hook

```tsx
import { useTheme } from './theme';

function MyComponent() {
  const { theme, themeMode, toggleTheme } = useTheme();
  
  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.text }}>
        Current theme: {themeMode}
      </Text>
    </View>
  );
}
```

## 🎯 Theme Properties

### Colors
```tsx
theme.colors.primary          // #2DD4BF (teal-400)
theme.colors.background       // #000000 (dark) / #FFFFFF (light)
theme.colors.surface          // #111827 (dark) / #F9FAFB (light)
theme.colors.text             // #FFFFFF (dark) / #111827 (light)
theme.colors.textSecondary    // #D1D5DB (dark) / #374151 (light)
theme.colors.textMuted        // #9CA3AF (dark) / #6B7280 (light)

// Status colors
theme.colors.success          // #10B981
theme.colors.warning          // #F59E0B
theme.colors.error            // #EF4444
theme.colors.info             // #3B82F6

// Priority colors
theme.colors.priorityVeryHigh // #EF4444
theme.colors.priorityHigh     // #F97316
theme.colors.priorityMedium   // #EAB308
theme.colors.priorityLow      // #22C55E
```

### Typography
```tsx
theme.typography.fontSize.xs    // 12
theme.typography.fontSize.sm    // 14
theme.typography.fontSize.base  // 16
theme.typography.fontSize.lg    // 18
theme.typography.fontSize.xl    // 20
theme.typography.fontSize['2xl'] // 24

theme.typography.fontWeight.normal // '400'
theme.typography.fontWeight.medium // '500'
theme.typography.fontWeight.bold   // '700'
```

### Spacing
```tsx
theme.spacing.xs    // 4
theme.spacing.sm    // 8
theme.spacing.md    // 16
theme.spacing.lg    // 24
theme.spacing.xl    // 32
theme.spacing['2xl'] // 48
```

### Border Radius
```tsx
theme.borderRadius.sm   // 4
theme.borderRadius.md   // 8
theme.borderRadius.lg   // 12
theme.borderRadius.xl   // 16
theme.borderRadius.full // 9999
```

## 🧩 Themed Components

### ThemedView
```tsx
<ThemedView variant="background" style={{ flex: 1 }}>
  <ThemedView variant="card" style={{ padding: 16 }}>
    Content here
  </ThemedView>
</ThemedView>
```

**Variants:**
- `background` - Main app background
- `surface` - Secondary background
- `card` - Card/container background

### ThemedText
```tsx
<ThemedText size="2xl" weight="bold" variant="primary">
  Heading Text
</ThemedText>

<ThemedText variant="muted" size="sm">
  Secondary text
</ThemedText>
```

**Variants:**
- `primary` - Main text color
- `secondary` - Secondary text color
- `muted` - Muted/disabled text color

**Sizes:** `xs`, `sm`, `base`, `lg`, `xl`, `2xl`, `3xl`, `4xl`
**Weights:** `normal`, `medium`, `bold`

### ThemedButton
```tsx
<ThemedButton 
  variant="primary" 
  size="md"
  onPress={() => console.log('Pressed')}
>
  Primary Button
</ThemedButton>

<ThemedButton variant="outline" onPress={handlePress}>
  Outline Button
</ThemedButton>
```

**Variants:**
- `primary` - Filled button with primary color
- `secondary` - Secondary styled button
- `outline` - Outlined button

**Sizes:** `sm`, `md`, `lg`

## 🛠 Utility Functions

### Priority Colors
```tsx
import { getPriorityColor } from './theme';

const color = getPriorityColor('high', theme); // Returns theme.colors.priorityHigh
```

### Status Colors
```tsx
import { getStatusColor } from './theme';

const color = getStatusColor('completed', theme); // Returns theme.colors.success
```

## 📱 Usage Examples

### Creating a Themed Screen
```tsx
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { 
  useTheme, 
  ThemedView, 
  ThemedText, 
  ThemedButton 
} from '../theme';

export default function MyScreen() {
  const { theme } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.md,
    },
    card: {
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.xl,
      marginBottom: theme.spacing.md,
    },
  });
  
  return (
    <ThemedView variant="background" style={styles.container}>
      <ThemedView variant="card" style={styles.card}>
        <ThemedText size="xl" weight="bold">
          Card Title
        </ThemedText>
        <ThemedText variant="muted">
          Card description text
        </ThemedText>
        <ThemedButton 
          variant="primary" 
          onPress={() => {}}
          style={{ marginTop: theme.spacing.md }}
        >
          Action Button
        </ThemedButton>
      </ThemedView>
    </ThemedView>
  );
}
```

### Custom Styled Components
```tsx
import { useTheme } from '../theme';

function CustomComponent() {
  const { theme } = useTheme();
  
  return (
    <View style={{
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      shadowColor: theme.shadows.md.shadowColor,
      shadowOffset: theme.shadows.md.shadowOffset,
      shadowOpacity: theme.shadows.md.shadowOpacity,
      shadowRadius: theme.shadows.md.shadowRadius,
      elevation: theme.shadows.md.elevation,
    }}>
      <Text style={{
        color: theme.colors.text,
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.medium,
      }}>
        Custom Component
      </Text>
    </View>
  );
}
```

## 🎨 Customization

### Adding New Colors
Edit `theme/colors.ts`:
```tsx
export const darkColors: Colors = {
  // ... existing colors
  customColor: '#FF6B6B',
};
```

### Adding New Typography Sizes
Edit `theme/theme.ts`:
```tsx
fontSize: {
  // ... existing sizes
  '5xl': 48,
},
```

### Creating Custom Variants
```tsx
// In your component
const getVariantStyle = (variant: string) => {
  switch (variant) {
    case 'danger':
      return { backgroundColor: theme.colors.error };
    case 'success':
      return { backgroundColor: theme.colors.success };
    default:
      return { backgroundColor: theme.colors.surface };
  }
};
```

## 🌙 Theme Switching

The theme system supports both dark and light modes:

```tsx
function ThemeToggle() {
  const { themeMode, toggleTheme, setThemeMode } = useTheme();
  
  return (
    <ThemedButton onPress={toggleTheme}>
      Switch to {themeMode === 'dark' ? 'Light' : 'Dark'} Mode
    </ThemedButton>
  );
}
```

## 📝 Best Practices

1. **Always use theme values** instead of hardcoded colors/sizes
2. **Use themed components** when possible for consistency
3. **Create reusable styled components** for complex UI patterns
4. **Test both light and dark themes** during development
5. **Use TypeScript** to catch theme-related errors early

## 🎯 Global Styles System

The theme now includes a **centralized global styles system** that eliminates the need for individual screen styles:

### Using Global Styles
```tsx
import { useTheme } from '../theme';

function MyScreen() {
  const { theme } = useTheme();
  const styles = theme.globalStyles; // Access all global styles
  
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText>Header Content</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.card}>
        <ThemedText>Card Content</ThemedText>
      </ThemedView>
    </ThemedView>
  );
}
```

### Available Global Styles

**Layout Styles:**
- `container` - Main screen container
- `header` - Screen header
- `headerRow` - Header row layout
- `content` - Main content area

**Navigation Styles:**
- `searchContainer` - Search input container
- `searchBar` - Search input styling

**Tab Styles:**
- `viewTabs` - Tab container
- `activeTab` - Active tab styling
- `inactiveTab` - Inactive tab styling

**Board/Grid Styles:**
- `boardContainer` - Board layout container
- `column` - Board column styling
- `columnHeader` - Column header
- `columnTitleRow` - Column title row

**Card Styles:**
- `card` - Standard card styling
- `cardHeader` - Card header
- `cardContent` - Card content area

**Task Styles:**
- `taskItem` - Individual task item
- `taskCard` - Task card variant
- `taskHeader` - Task header
- `taskTitle` - Task title
- `taskCount` - Task count badge
- `priorityBadge` - Priority indicator
- `progressContainer` - Progress bar container
- `progressBar` - Progress bar background
- `progressFill` - Progress bar fill

**Button Styles:**
- `primaryButton` - Primary action button
- `secondaryButton` - Secondary action button
- `iconButton` - Icon-only button

### Benefits of Global Styles

1. **Consistency** - All screens use the same styling patterns
2. **Maintainability** - Update styles in one place, affects all screens
3. **Performance** - No need to recreate StyleSheet objects per screen
4. **Theme Integration** - Automatically adapts to theme changes
5. **Reduced Code** - No duplicate style definitions

### Extending Global Styles

For screen-specific styles, combine global styles with custom ones:

```tsx
const styles = {
  ...theme.globalStyles,
  customStyle: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
  }
};
```

## 🔧 Integration with Existing Code

To migrate existing components to use the theme system:

1. Import the theme hook: `import { useTheme } from '../theme';`
2. Replace StyleSheet.create() with `theme.globalStyles`
3. Use themed components where appropriate
4. Add custom styles only when needed
5. Test in both light and dark modes
