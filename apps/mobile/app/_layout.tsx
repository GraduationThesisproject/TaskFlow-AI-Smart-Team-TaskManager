import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Provider } from 'react-redux';

import { ThemeProvider } from '@/components/ThemeProvider';
import { FontConfig } from '@/constants/Fonts';
import { store } from '@/store';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // Inter variable fonts
    'Inter-VariableFont_opsz,wght': require('../assets/fonts/Inter-VariableFont_opsz,wght.ttf'),
    'Inter-Italic-VariableFont_opsz,wght': require('../assets/fonts/Inter-Italic-VariableFont_opsz,wght.ttf'),
    
    // Poppins fonts
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Light': require('../assets/fonts/Poppins-Light.ttf'),
    
    // JetBrains Mono variable fonts
    'JetBrainsMono-VariableFont_wght': require('../assets/fonts/JetBrainsMono-VariableFont_wght.ttf'),
    'JetBrainsMono-Italic-VariableFont_wght': require('../assets/fonts/JetBrainsMono-Italic-VariableFont_wght.ttf'),
    
    // Additional fonts
    'SpaceMono-Regular': require('../assets/fonts/SpaceMono-Regular.ttf'),
    
    // FontAwesome icons
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
    </Provider>
  );
}
