# TaskFlow Design System

A comprehensive design system for TaskFlow applications, built for both mobile and web platforms with a focus on dark mode aesthetics and modern UI patterns.

## 🎨 Design Tokens

Based on your design system screenshots, we've implemented:

### Color System
- **Primary Blue**: `#007ADF` - Main brand color for buttons and highlights
- **Accent Cyan**: `#00E8C6` - Secondary accent for gradients and special elements
- **Neutral Colors**: Dark theme optimized (`#000000`, `#1A1A1A`, `#2A2A2A`, `#FFFFFF`)

### Typography
- **Font Family**: Inter (system fonts fallback)
- **Scales**: 14px, 16px, 18px, 20px, 36px following your design tokens
- **Weights**: Regular (400), Medium (500), Semibold (600), Bold (700)

## 📦 Packages

### @taskflow/config
Shared configuration for Tailwind CSS and ESLint

### @taskflow/theme
Design tokens, theme management, and dark/light mode switching

### @taskflow/ui
Comprehensive UI component library

### @taskflow/utils
Shared utility functions

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# In your app, import components:
import { Button, Card, Typography } from '@taskflow/ui';
import { ThemeProvider } from '@taskflow/theme/provider';

# Wrap your app with the theme provider
<ThemeProvider defaultTheme="dark">
  <YourApp />
</ThemeProvider>
```

## 🧩 Component Library

### Buttons
```tsx
import { Button } from '@taskflow/ui';

// Primary button (matches your screenshots)
<Button variant="default" size="lg">Primary Button</Button>

// Gradient button (cyan to blue gradient)
<Button variant="gradient" size="default">Gradient Button</Button>

// Different sizes
<Button size="sm">Small</Button>
<Button size="default">Medium</Button>
<Button size="lg">Large</Button>
```

### Typography
```tsx
import { Typography } from '@taskflow/ui';

<Typography variant="heading-xl">Page Title</Typography>
<Typography variant="heading-large">Section Heading</Typography>
<Typography variant="body-large">Large body text (18px)</Typography>
<Typography variant="body-medium">Medium body text (16px)</Typography>
<Typography variant="body-small">Small body text (14px)</Typography>
```

### Cards
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@taskflow/ui';

<Card variant="default">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>
```

### Status & Progress
```tsx
import { Badge, Progress } from '@taskflow/ui';

// Task status badges
<Badge variant="to-do">To Do</Badge>
<Badge variant="in-progress">In Progress</Badge>
<Badge variant="completed">Completed</Badge>

// Priority badges
<Badge variant="very-high">Very High</Badge>
<Badge variant="high">High</Badge>
<Badge variant="medium">Medium</Badge>
<Badge variant="low">Low</Badge>

// Progress bars
<Progress value={70} variant="default" showValue />
<Progress value={100} variant="success" />
```

### Avatars
```tsx
import { Avatar, AvatarImage, AvatarFallback, getInitials } from '@taskflow/ui';

<Avatar size="default">
  <AvatarImage src="/avatar.jpg" alt="User" />
  <AvatarFallback variant="primary">
    {getInitials("Alex Chen")}
  </AvatarFallback>
</Avatar>
```

## 📱 Mobile-First Design

### Responsive Layout Components
```tsx
import { MobileContainer, MobileGrid, MobileStack } from '@taskflow/ui/Mobile';

// Mobile-optimized container
<MobileContainer size="6xl" padding="md">
  <MobileStack spacing="md">
    <MobileGrid cols={3}>
      {/* Content automatically stacks on mobile */}
    </MobileGrid>
  </MobileStack>
</MobileContainer>
```

### Responsive Utilities
```tsx
import { ShowOnMobile, HideOnMobile, useMobileDetection } from '@taskflow/ui/Mobile';

// Conditional rendering
<ShowOnMobile>
  <MobileNavigation />
</ShowOnMobile>

<HideOnMobile>
  <DesktopNavigation />
</HideOnMobile>

// Hook for programmatic detection
const { isMobile, isTablet, isDesktop } = useMobileDetection();
```

## 🌙 Theme Management

```tsx
import { ThemeProvider, useTheme, ThemeToggle } from '@taskflow/theme/provider';

// Provider setup
<ThemeProvider defaultTheme="dark" storageKey="taskflow-theme">
  <App />
</ThemeProvider>

// Using theme in components
function MyComponent() {
  const { theme, setTheme, toggleTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <ThemeToggle />
    </div>
  );
}
```

## 🎯 Design System Features

### ✅ Complete Color Palette
- Primary blue (#007ADF) and accent cyan (#00E8C6) from your design
- Full neutral scale optimized for dark themes
- Status colors for success, warning, error states

### ✅ Typography System
- Inter font family with proper fallbacks
- Responsive font sizes matching your design tokens
- Semantic variant names (heading-xl, body-large, etc.)

### ✅ Component Variants
- Multiple button styles including gradient effects
- Task status and priority badges
- Progress indicators with different styles
- Avatar system with initials and color generation

### ✅ Mobile-First Responsive Design
- All components work seamlessly on mobile and desktop
- Responsive layout utilities
- Mobile-specific components and patterns
- Touch-friendly sizing and spacing

### ✅ Dark Mode Optimized
- Primary dark theme matching your screenshots
- Proper contrast ratios and accessibility
- Smooth theme transitions
- System preference detection

## 📚 Example Usage

Check out the complete dashboard example in `packages/ui/src/examples/Dashboard.tsx` to see how all components work together to recreate the interface from your screenshots.

## 🛠 Development

```bash
# Build all packages
npm run build

# Development mode with watching
npm run dev

# Lint all packages
npm run lint
```

## 🎨 Customization

The design system is built with CSS custom properties and Tailwind CSS, making it easy to customize:

```css
:root {
  --primary: 201 100% 44%;      /* #007ADF */
  --accent: 170 100% 45%;       /* #00E8C6 */
  --background: 0 0% 0%;        /* #000000 */
  --card: 0 0% 10%;            /* #1A1A1A */
}
```

All components automatically respect these design tokens, ensuring consistency across your application.
