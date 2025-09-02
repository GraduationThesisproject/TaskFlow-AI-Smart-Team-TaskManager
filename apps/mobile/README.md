# TaskFlow Mobile App

A React Native mobile application for TaskFlow, an AI-powered smart team task manager. This app provides a native mobile experience with the same design system and functionality as the web version.

## Features

- **Consistent Design System**: Uses the same theme and design tokens as the web version
- **Authentication**: Complete login/register functionality with secure token storage
- **Responsive UI**: Mobile-optimized components and layouts
- **Theme Support**: Light and dark mode with system preference detection
- **Navigation**: Intuitive navigation using Expo Router
- **Type Safety**: Full TypeScript support with shared types

## Project Structure

```
apps/mobile/
├── app/                    # Expo Router pages
│   ├── _layout.tsx        # Root layout with theme provider
│   ├── index.tsx          # Welcome/landing screen
│   ├── auth.tsx           # Authentication screen
│   ├── dashboard.tsx      # User dashboard
│   ├── boards.tsx         # Boards management
│   └── tasks.tsx          # Tasks overview
├── src/
│   ├── components/        # Reusable UI components
│   │   └── ui/           # Mobile-adapted UI components
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Text.tsx
│   │       └── index.ts
│   ├── theme/            # Theme system
│   │   ├── index.ts      # Theme definitions and utilities
│   │   └── ThemeProvider.tsx
│   ├── hooks/            # Custom React hooks
│   │   └── useAuth.ts    # Authentication hook
│   ├── services/         # API and external services
│   │   └── api.ts        # API service layer
│   └── types/            # TypeScript type definitions
│       └── index.ts      # Shared types
└── package.json
```

## Theme System

The mobile app uses a theme system that mirrors the web version's design tokens:

### Color System
- **Primary Colors**: Brand colors for buttons, links, and accents
- **Semantic Colors**: Success, warning, error, and info states
- **Neutral Colors**: Background, foreground, and border colors
- **HSL to Hex Conversion**: Automatic conversion from web HSL values to mobile hex colors

### Typography
- **Font Sizes**: xs, sm, md, lg, xl, xxl, xxxl
- **Font Weights**: normal, medium, semibold, bold
- **Responsive**: Scales appropriately for mobile devices

### Spacing & Layout
- **Consistent Spacing**: xs (4px) to xxl (48px)
- **Border Radius**: sm (4px) to full (9999px)
- **Shadows**: Platform-specific shadow implementations

## Components

### Core UI Components

#### Button
```tsx
<Button 
  variant="default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size="default" | "sm" | "lg" | "icon"
  onPress={() => {}}
  loading={false}
>
  Button Text
</Button>
```

#### Card
```tsx
<Card variant="default" | "outlined">
  <CardHeader>
    <H2>Card Title</H2>
  </CardHeader>
  <CardContent>
    <P>Card content goes here</P>
  </CardContent>
</Card>
```

#### Text
```tsx
<Text 
  variant="h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "small" | "muted"
  size="xs" | "sm" | "md" | "lg" | "xl" | "xxl" | "xxxl"
  weight="normal" | "medium" | "semibold" | "bold"
>
  Text content
</Text>
```

## Setup & Installation

### Prerequisites
- Node.js 18+ 
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Install Dependencies**
   ```bash
   cd apps/mobile
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Run on Device/Simulator**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

### Environment Variables

Create a `.env` file in the mobile app directory:

```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

## Development

### Adding New Components

1. Create the component in `src/components/ui/`
2. Export it from `src/components/ui/index.ts`
3. Use the theme system for consistent styling

### Theme Customization

The theme system is defined in `src/theme/index.ts`. To modify:

1. Update color values in `mobileThemes`
2. Adjust spacing, typography, or shadows in `createMobileTheme`
3. The changes will automatically apply throughout the app

### API Integration

The app uses a centralized API service (`src/services/api.ts`) that:

- Handles authentication tokens
- Provides type-safe API calls
- Manages error handling
- Supports pagination

### State Management

- **Authentication**: Managed by `useAuth` hook with AsyncStorage persistence
- **Theme**: Managed by `ThemeProvider` with AsyncStorage persistence
- **API State**: Handled by individual components using React hooks

## Building for Production

### iOS
```bash
eas build --platform ios
```

### Android
```bash
eas build --platform android
```

### Web
```bash
npm run build:web
```

## Contributing

1. Follow the existing code structure and patterns
2. Use the theme system for all styling
3. Add TypeScript types for new features
4. Test on both iOS and Android
5. Update this README for significant changes

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `npx expo start --clear`
2. **iOS build errors**: Ensure Xcode is up to date
3. **Android build errors**: Check Android SDK installation
4. **Theme not applying**: Verify ThemeProvider is wrapping the app

### Performance Tips

- Use `React.memo` for expensive components
- Implement proper list virtualization for long lists
- Optimize images and assets
- Use the theme system for consistent styling

## License

This project is part of the TaskFlow application suite.
