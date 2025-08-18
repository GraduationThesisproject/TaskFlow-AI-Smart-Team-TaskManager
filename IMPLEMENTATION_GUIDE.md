# TaskFlow Design System - Implementation Guide

This comprehensive design system has been built based on your dark-themed screenshots and is optimized for both mobile and web applications.

## 🎯 What's Been Created

### ✅ Complete Design Token System
- **Colors**: Primary Blue (#007ADF), Accent Cyan (#00E8C6), full neutral palette
- **Typography**: Inter font family with 5 text sizes (14px, 16px, 18px, 20px, 36px)
- **Spacing**: Consistent spacing scale for mobile and desktop
- **Shadows**: Optimized for dark theme with subtle elevation

### ✅ Component Library
1. **Enhanced Button** - 7 variants including gradient
2. **Typography** - Semantic text components
3. **Cards** - Multiple variants with proper dark theme styling  
4. **Badges** - Status and priority indicators
5. **Progress** - Task progress bars with variants
6. **Avatar** - User avatars with initials fallback
7. **Layout** - Container, Grid, Flex, Stack components
8. **Mobile** - Mobile-first responsive components

### ✅ Theme System
- Dark mode optimized (matches your screenshots)
- Light mode support
- Theme provider with localStorage persistence
- Theme toggle component

### ✅ Mobile-First Responsive Design
- All components are mobile-first
- Touch-friendly sizing
- Responsive breakpoints
- Mobile-specific layout components

## 🚀 How to Use in Your App

### 1. Install and Setup

```bash
# Add to your package.json dependencies
"@taskflow/ui": "workspace:*",
"@taskflow/theme": "workspace:*",
"@taskflow/config": "workspace:*"
```

### 2. Configure Tailwind CSS

In your `tailwind.config.js`:

```js
const baseConfig = require('@taskflow/config/tailwind.config');

module.exports = {
  ...baseConfig,
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './packages/ui/src/**/*.{js,ts,jsx,tsx}', // Include UI components
  ],
};
```

### 3. Setup Theme Provider

In your app root:

```tsx
import { ThemeProvider } from '@taskflow/theme/provider';
import '@taskflow/config/globals.css'; // Include global styles

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <YourAppContent />
    </ThemeProvider>
  );
}
```

### 4. Use Components

```tsx
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Typography,
  Badge,
  Progress,
  Avatar,
  AvatarFallback,
  MobileContainer,
  MobileGrid,
  getInitials
} from '@taskflow/ui';

function TaskDashboard() {
  return (
    <MobileContainer className="py-6">
      <Typography variant="heading-xl" className="mb-6">
        Finance Dashboard
      </Typography>
      
      <MobileGrid cols={3} gap="md">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <Badge variant="in-progress">In Progress</Badge>
              <Badge variant="high">High Priority</Badge>
            </div>
            <CardTitle>Implement user feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={67} variant="default" showValue className="mb-4" />
            
            <div className="flex items-center gap-2">
              <Avatar size="sm">
                <AvatarFallback variant="primary">
                  {getInitials("Alex Chen")}
                </AvatarFallback>
              </Avatar>
              <Typography variant="body-small" color="muted">
                Assigned to Alex Chen
              </Typography>
            </div>
          </CardContent>
        </Card>
      </MobileGrid>
      
      <Button variant="gradient" size="lg" className="mt-6">
        Create New Task
      </Button>
    </MobileContainer>
  );
}
```

## 📱 Mobile-First Examples

### Responsive Navigation

```tsx
import { ShowOnMobile, HideOnMobile, MobileFlex } from '@taskflow/ui';

function Navigation() {
  return (
    <>
      <ShowOnMobile>
        <MobileFlex direction="col" gap="sm" className="p-4">
          <Button variant="ghost" size="sm">Menu Item 1</Button>
          <Button variant="ghost" size="sm">Menu Item 2</Button>
        </MobileFlex>
      </ShowOnMobile>
      
      <HideOnMobile>
        <div className="flex space-x-4">
          <Button variant="ghost">Menu Item 1</Button>
          <Button variant="ghost">Menu Item 2</Button>
        </div>
      </HideOnMobile>
    </>
  );
}
```

### Task Cards (Mobile-Optimized)

```tsx
function TaskCard({ task }) {
  return (
    <Card variant="default" className="w-full">
      <CardContent className="p-4">
        <MobileStack spacing="sm">
          {/* Status row */}
          <MobileFlex justify="between" align="center">
            <Badge variant={task.status}>{task.status}</Badge>
            <Badge variant={task.priority}>{task.priority}</Badge>
          </MobileFlex>
          
          {/* Title */}
          <Typography variant="body-large" className="font-medium">
            {task.title}
          </Typography>
          
          {/* Progress */}
          <div>
            <MobileFlex justify="between" align="center" className="mb-2">
              <Typography variant="body-small" color="muted">Progress</Typography>
              <Typography variant="body-small">{task.progress}%</Typography>
            </MobileFlex>
            <Progress 
              value={task.progress} 
              variant={task.status === 'completed' ? 'success' : 'default'}
            />
          </div>
          
          {/* Assignees */}
          <MobileFlex align="center" gap="xs">
            {task.assignees.map((assignee, idx) => (
              <Avatar key={idx} size="sm">
                <AvatarFallback variant="primary">
                  {getInitials(assignee.name)}
                </AvatarFallback>
              </Avatar>
            ))}
          </MobileFlex>
        </MobileStack>
      </CardContent>
    </Card>
  );
}
```

## 🎨 Matching Your Design Screenshots

The components are designed to recreate the exact look from your screenshots:

### Finance Dashboard Interface ✅
- Dark background (`bg-background`)
- Card-based layout with proper shadows
- Primary blue buttons (#007ADF)
- Status badges with correct colors
- Progress bars matching your design
- User avatars with initials

### Typography System ✅
- Inter font family
- Exact font sizes: 14px, 16px, 18px, 20px, 36px
- Proper font weights (Regular 400, Bold 700)
- Semantic naming (heading-xl, body-large, etc.)

### Color Palette ✅
- Primary Blue: #007ADF
- Accent Cyan: #00E8C6  
- Pure Black: #000000
- Dark Gray: #1A1A1A
- Medium Gray: #2A2A2A
- Pure White: #FFFFFF

### Component Variants ✅
- Task status badges (To Do, In Progress, In Review, Completed)
- Priority badges (Very High, High, Medium, Low)
- Progress bars with proper colors
- Gradient buttons from primary to accent

## 🔧 Advanced Customization

### Adding Custom Components

```tsx
// Extend the design system
import { cva } from 'class-variance-authority';
import { cn } from '@taskflow/ui/utils';

const customVariants = cva('...', {
  variants: {
    // Your custom variants
  }
});
```

### Custom Theme Values

```tsx
// Override theme values
const customTheme = {
  ...themes.dark,
  '--primary': '200 100% 50%', // Custom primary color
};
```

## 📚 Component Reference

| Component | Purpose | Mobile Optimized |
|-----------|---------|------------------|
| `Button` | Actions, CTAs | ✅ Touch-friendly sizing |
| `Card` | Content containers | ✅ Responsive padding |
| `Typography` | Text content | ✅ Responsive font sizes |
| `Badge` | Status indicators | ✅ Compact design |
| `Progress` | Task completion | ✅ Touch-friendly |
| `Avatar` | User representation | ✅ Multiple sizes |
| `MobileContainer` | Layout wrapper | ✅ Mobile-first padding |
| `MobileGrid` | Responsive grids | ✅ Stacks on mobile |
| `MobileFlex` | Flexible layouts | ✅ Direction switching |

This design system is production-ready and will give you the exact look and feel from your screenshots while being fully responsive and accessible! 🚀
