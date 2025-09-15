# Language Selection Feature

This document explains how to use the language selection feature in the TaskFlow mobile app.

## Overview

The language selection feature allows users to change the app's display language and automatically handles:
- Language persistence in local storage
- RTL (Right-to-Left) layout support for Arabic and other RTL languages
- HTML lang attribute updates
- Text direction handling

## Available Languages

The app supports the following languages:

| Code | Language | Flag | RTL |
|------|----------|------|-----|
| `en` | English | 🇺🇸 | No |
| `es` | Español | 🇪🇸 | No |
| `fr` | Français | 🇫🇷 | No |
| `de` | Deutsch | 🇩🇪 | No |
| `it` | Italiano | 🇮🇹 | No |
| `pt` | Português | 🇵🇹 | No |
| `ru` | Русский | 🇷🇺 | No |
| `ja` | 日本語 | 🇯🇵 | No |
| `ko` | 한국어 | 🇰🇷 | No |
| `zh` | 中文 | 🇨🇳 | No |
| `ar` | العربية | 🇸🇦 | Yes |
| `hi` | हिन्दी | 🇮🇳 | No |

## Usage

### 1. Using the Language Context

```tsx
import { useLanguage, Language } from '@/contexts/LanguageContext';

function MyComponent() {
  const { language, setLanguage, isRTL, getLanguageName, getLanguageFlag } = useLanguage();

  const handleLanguageChange = async (newLanguage: Language) => {
    await setLanguage(newLanguage);
    console.log('Language changed to:', newLanguage);
  };

  return (
    <View>
      <Text>Current language: {getLanguageName(language)}</Text>
      <Text>Flag: {getLanguageFlag(language)}</Text>
      {isRTL && <Text>RTL layout is active</Text>}
    </View>
  );
}
```

### 2. Using the Language Selector Component

```tsx
import LanguageSelector from '@/components/settings/LanguageSelector';

function SettingsScreen() {
  return (
    <View>
      <LanguageSelector 
        onLanguageChange={(newLanguage) => {
          console.log('Language changed to:', newLanguage);
        }}
      />
    </View>
  );
}
```

### 3. Checking RTL Status

```tsx
import { useIsRTL } from '@/contexts/LanguageContext';

function MyComponent() {
  const isRTL = useIsRTL();
  
  return (
    <View style={{ 
      flexDirection: isRTL ? 'row-reverse' : 'row',
      textAlign: isRTL ? 'right' : 'left'
    }}>
      <Text>Content</Text>
    </View>
  );
}
```

## Implementation Details

### Language Context (`LanguageContext.tsx`)

The `LanguageContext` provides:
- `language`: Current language code
- `setLanguage(language)`: Change the language
- `isRTL`: Boolean indicating if current language is RTL
- `getLanguageName(code)`: Get display name for a language code
- `getLanguageFlag(code)`: Get flag emoji for a language code

### Language Selector Component (`LanguageSelector.tsx`)

A pre-built component that provides:
- Modal-based language selection
- Visual language list with flags and names
- RTL indicator for RTL languages
- Smooth animations and theming

### Persistence

Language preferences are automatically saved to AsyncStorage and restored on app launch.

### RTL Support

When an RTL language is selected:
- HTML `dir` attribute is set to "rtl"
- Document direction is updated
- RTL notice is shown in the UI

## Adding New Languages

To add a new language:

1. Add the language code to the `Language` type in `LanguageContext.tsx`
2. Add the language configuration to `LANGUAGE_CONFIG`:

```tsx
const LANGUAGE_CONFIG = {
  // ... existing languages
  'new-lang': { name: 'New Language', flag: '🇳🇱', rtl: false },
} as const;
```

## Integration with Text Direction

The language context integrates with the existing `useTextDirection` hook:

```tsx
import { useTextDirection } from '@/hooks/useTextDirection';
import { useLanguage } from '@/contexts/LanguageContext';

function MyComponent() {
  const { language } = useLanguage();
  const { getTextAlign, getFlexDirection } = useTextDirection();
  
  return (
    <View style={{ 
      flexDirection: getFlexDirection(),
      textAlign: getTextAlign()
    }}>
      <Text>Content</Text>
    </View>
  );
}
```

## Settings Integration

The language selector is integrated into the workspace settings screen under "Language & Region" section. Users can:

1. Navigate to Workspace Settings
2. Scroll to "Language & Region" section
3. Tap the language selector
4. Choose from the available languages
5. See immediate RTL layout changes if applicable

## Browser Support

The language selection works on both:
- **React Native**: Uses AsyncStorage for persistence
- **Web**: Uses localStorage for persistence and updates HTML attributes

## Future Enhancements

Potential future improvements:
- Translation system integration
- Locale-specific date/time formatting
- Currency formatting based on language
- Voice language selection
- Automatic language detection
