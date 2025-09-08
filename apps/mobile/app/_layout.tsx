import 'react-native-get-random-values';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { ThemeProvider } from '@/components/ThemeProvider';
import { FontConfig } from '@/constants/Fonts';
import { store, persistor, useAppDispatch, useAppSelector } from '@/store';
import { checkAuthStatus } from '@/store/slices/authSlice';

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
    // Register custom font family names WITHOUT commas (commas break CSS font-family on web)
    // Inter variable fonts
    Inter: require('../assets/fonts/Inter-VariableFont_opsz,wght.ttf'),
    'Inter-Italic': require('../assets/fonts/Inter-Italic-VariableFont_opsz,wght.ttf'),
    
    // Poppins fonts
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Light': require('../assets/fonts/Poppins-Light.ttf'),
    
    // JetBrains Mono variable fonts
    JetBrainsMono: require('../assets/fonts/JetBrainsMono-VariableFont_wght.ttf'),
    'JetBrainsMono-Italic': require('../assets/fonts/JetBrainsMono-Italic-VariableFont_wght.ttf'),
    
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

  // Fallback: Ensure the splash screen is hidden even if font loading stalls on web
  useEffect(() => {
    const t = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 6000);
    return () => clearTimeout(t);
  }, []);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <AuthGate />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

function AuthGate() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  // On app start, check auth status (reads token from storage and fetches profile with timeout)
  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  // Optional: show splash/blank while determining auth
  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    // Unauthenticated: expose only login screen to prevent access to other screens
    return (
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
      </Stack>
    );
  }

  // Authenticated: show main tabs (workspace section lives under tabs/index)
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
