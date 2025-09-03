# TaskFlow Mobile Theme System

A comprehensive cross-platform theme system for React Native that supports iOS, Android, and web platforms with consistent theming, custom fonts, and advanced color management.

## 🎨 Features

- **Cross-platform compatibility**: Works seamlessly on iOS, Android, and web
- **Dark/Light mode support**: Automatic system theme detection with manual override
- **Custom font support**: Easy integration of custom fonts with system fallbacks
- **Comprehensive color system**: 50+ color tokens with semantic naming
- **Gradient support**: Built-in gradient creation and theme-aware gradients
- **Responsive design**: Font sizes and spacing that adapt to screen sizes
- **TypeScript support**: Full type safety with comprehensive type definitions
- **Performance optimized**: Efficient color calculations and caching

## 📁 File Structure

```
apps/mobile/
├── constants/
│   ├── Colors.ts          # Color definitions and themes
│   └── Fonts.ts           # Font configuration and utilities
├── components/
│   ├── ThemeProvider.tsx   # Theme context and provider
│   ├── Themed.tsx          # Themed component wrappers
│   ├── useColorScheme.ts   # Platform-specific color scheme hook
│   └── useColorScheme.web.ts # Web-specific color scheme hook
├── utils/
│   └── themeUtils.ts       # Theme utilities and helpers
└── assets/
    └── fonts/              # Custom font files (to be added)
```

## 🚀 Quick Start

### 1. Setup Theme Provider

Wrap your app with the `ThemeProvider`:

```tsx
import { ThemeProvider } from '@/components/ThemeProvider';

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <YourAppContent />
    </ThemeProvider>
  );
}
```

### 2. Use Themed Components

```tsx
import { View, Text, Button, Card } from '@/components/Themed';

export default function MyScreen() {
  return (
    <View style={{ flex: 1 }}>
      <Card>
        <Text style={{ fontSize: 18 }}>Hello, themed world!</Text>
        <Button variant="primary">
          <ButtonText>Click me</ButtonText>
        </Button>
      </Card>
    </View>
  );
}
```

### 3. Use Theme Hooks

```tsx
import { useTheme, useThemeColors, useThemeColor } from '@/components/ThemeProvider';

export default function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  const colors = useThemeColors();
  const primaryColor = useThemeColor('primary');

  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: primaryColor }}>Current theme: {theme}</Text>
      <Button onPress={toggleTheme}>
        <ButtonText>Toggle Theme</ButtonText>
      </Button>
    </View>
  );
}
```

## 🎯 Color System

### Color Tokens

The theme system provides 50+ color tokens organized into semantic categories:

```typescript
// Core colors
background, foreground, card, 'card-foreground'
popover, 'popover-foreground'

// Primary colors
primary, 'primary-foreground'

// Secondary colors
secondary, 'secondary-foreground'

// Muted colors
muted, 'muted-foreground'

// Accent colors
accent, 'accent-foreground'

// Destructive colors
destructive, 'destructive-foreground'

// Border and input colors
border, input, ring

// Neutral colors
'neutral-0', 'neutral-100', 'neutral-200', 'neutral-1000'

// Status colors
success, warning, error, info

// Scrollbar colors
'scrollbar-track', 'scrollbar-thumb', 'scrollbar-thumb-hover', 'scrollbar-corner'

// Gradient colors
'gradient-primary', 'gradient-secondary', 'gradient-accent', 'gradient-muted'
```

### Using Colors

```tsx
// Direct color access
const colors = useThemeColors();
const backgroundColor = colors.background;

// Specific color hook
const primaryColor = useThemeColor('primary');

// In styled components
<View style={{ backgroundColor: colors.card }}>
  <Text style={{ color: colors.foreground }}>Content</Text>
</View>
```

## 🔤 Font System

### Font Configuration

The font system supports custom fonts with automatic system fallbacks:

```typescript
// Primary font family (Inter)
regular: 'Inter-Regular'
medium: 'Inter-Medium'
semiBold: 'Inter-SemiBold'
bold: 'Inter-Bold'
light: 'Inter-Light'

// Secondary font family (Poppins)
regular: 'Poppins-Regular'
medium: 'Poppins-Medium'
semiBold: 'Poppins-SemiBold'
bold: 'Poppins-Bold'
light: 'Poppins-Light'

// Monospace font family (JetBrains Mono)
regular: 'JetBrainsMono-Regular'
medium: 'JetBrainsMono-Medium'
bold: 'JetBrainsMono-Bold'
```

### Using Fonts

```tsx
import { getFontStyle, TextStyles } from '@/constants/Fonts';

// Custom font style
const customStyle = getFontStyle('lg', 'semiBold', 'bold');

// Predefined text styles
const headingStyle = TextStyles.heading.h1;
const bodyStyle = TextStyles.body.medium;
const buttonStyle = TextStyles.button.large;

<Text style={customStyle}>Custom styled text</Text>
<Text style={headingStyle}>Heading</Text>
<Text style={bodyStyle}>Body text</Text>
```

## 🎨 Adding Custom Fonts

### 1. Download Font Files

Download your font files (TTF or OTF) and place them in `assets/fonts/`:

```
assets/fonts/
├── Inter-Regular.ttf
├── Inter-Medium.ttf
├── Inter-SemiBold.ttf
├── Inter-Bold.ttf
├── Inter-Light.ttf
├── Poppins-Regular.ttf
├── Poppins-Medium.ttf
├── Poppins-SemiBold.ttf
├── Poppins-Bold.ttf
├── Poppins-Light.ttf
├── JetBrainsMono-Regular.ttf
├── JetBrainsMono-Medium.ttf
└── JetBrainsMono-Bold.ttf
```

### 2. Update Font Configuration

Modify `constants/Fonts.ts` to use your custom fonts:

```typescript
export const Fonts = {
  primary: {
    regular: 'YourFont-Regular',
    medium: 'YourFont-Medium',
    semiBold: 'YourFont-SemiBold',
    bold: 'YourFont-Bold',
    light: 'YourFont-Light',
  },
  // ... other font families
};
```

### 3. Load Fonts

Use Expo's font loading in your app:

```tsx
import * as Font from 'expo-font';
import { FontConfig } from '@/constants/Fonts';

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
        'Inter-Medium': require('./assets/fonts/Inter-Medium.ttf'),
        'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.ttf'),
        'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
        'Inter-Light': require('./assets/fonts/Inter-Light.ttf'),
        // ... other fonts
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider>
      <YourAppContent />
    </ThemeProvider>
  );
}
```

## 🎨 Advanced Theming

### Custom Color Palettes

```tsx
import { createColorPalette } from '@/utils/themeUtils';

const customPalette = createColorPalette('#007ADF');
// Returns: { light: '#3399ff', main: '#007ADF', dark: '#0056b3', contrast: '#ffffff' }
```

### Gradient Creation

```tsx
import { createGradient, createThemeGradient } from '@/utils/themeUtils';

// Custom gradient
const customGradient = createGradient('#007ADF', '#00E8C6', 10);

// Theme-aware gradient
const themeGradient = createThemeGradient(colors, 'primary');
```

### Responsive Design

```tsx
import { getResponsiveFontSize } from '@/utils/themeUtils';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const responsiveFontSize = getResponsiveFontSize('lg', screenWidth);
```

### Shadow Styles

```tsx
import { getThemeShadowStyle } from '@/utils/themeUtils';

const shadowStyle = getThemeShadowStyle(colors, 4, 0.15);
// Returns platform-specific shadow styles for iOS and Android
```

## 🔧 Theme Utilities

### ThemeUtils Class

The `ThemeUtils` class provides comprehensive theme utilities:

```tsx
import { ThemeUtils } from '@/utils/themeUtils';

// Color conversions
const rgb = ThemeUtils.hexToRgb('#007ADF');
const hsl = ThemeUtils.rgbToHsl(0, 122, 223);
const hex = ThemeUtils.hslToHex(201, 100, 44);

// Contrast calculations
const contrastColor = ThemeUtils.getContrastColor('#007ADF');

// Complete theme style
const themeStyle = ThemeUtils.createThemeStyle(colors, {
  backgroundColor: 'card',
  textColor: 'foreground',
  borderRadius: 'lg',
  padding: 'md',
  elevation: 2,
});
```

## 📱 Platform-Specific Considerations

### iOS

- Uses `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`
- Font family: SF Pro Text fallback
- Supports dynamic type scaling

### Android

- Uses `elevation` for shadows
- Font family: Roboto fallback
- Supports material design elevation

### Web

- Uses CSS custom properties
- Font family: System font stack
- Supports CSS-in-JS styling

## 🎯 Best Practices

### 1. Use Semantic Color Names

```tsx
// ✅ Good
<Text style={{ color: colors.foreground }}>Text</Text>
<View style={{ backgroundColor: colors.card }}>Card</View>

// ❌ Avoid
<Text style={{ color: '#000000' }}>Text</Text>
<View style={{ backgroundColor: '#ffffff' }}>Card</View>
```

### 2. Leverage Theme Hooks

```tsx
// ✅ Good
const colors = useThemeColors();
const primaryColor = useThemeColor('primary');

// ❌ Avoid
const { colors } = useTheme();
const primaryColor = colors.primary;
```

### 3. Use Predefined Text Styles

```tsx
// ✅ Good
<Text style={TextStyles.heading.h1}>Heading</Text>
<Text style={TextStyles.body.medium}>Body text</Text>

// ❌ Avoid
<Text style={{ fontSize: 30, fontWeight: 'bold' }}>Heading</Text>
```

### 4. Responsive Design

```tsx
// ✅ Good
const screenWidth = Dimensions.get('window').width;
const fontSize = getResponsiveFontSize('lg', screenWidth);

// ❌ Avoid
const fontSize = 18; // Fixed size
```

## 🔍 Troubleshooting

### Common Issues

1. **Fonts not loading**: Ensure font files are in the correct location and properly referenced
2. **Colors not updating**: Check that components are wrapped in `ThemeProvider`
3. **Platform differences**: Use `Platform.OS` to handle platform-specific styling
4. **Performance issues**: Use `useThemeColors()` instead of `useTheme()` when only colors are needed

### Debug Mode

Enable debug mode to see theme information:

```tsx
import { useTheme } from '@/components/ThemeProvider';

export default function DebugComponent() {
  const { theme, colors, userPrimaryColor } = useTheme();
  
  console.log('Current theme:', theme);
  console.log('Theme colors:', colors);
  console.log('User primary color:', userPrimaryColor);
  
  return null;
}
```

## 📚 Additional Resources

- [React Native Platform API](https://reactnative.dev/docs/platform)
- [Expo Font Loading](https://docs.expo.dev/versions/latest/sdk/font/)
- [React Native Color Theory](https://reactnative.dev/docs/colors)
- [Material Design Color System](https://material.io/design/color/the-color-system.html)

## 🤝 Contributing

When contributing to the theme system:

1. Follow the existing naming conventions
2. Add TypeScript types for new features
3. Test on both iOS and Android
4. Update this documentation
5. Consider web compatibility

---

This theme system provides a solid foundation for building beautiful, consistent, and accessible mobile applications across all platforms.
