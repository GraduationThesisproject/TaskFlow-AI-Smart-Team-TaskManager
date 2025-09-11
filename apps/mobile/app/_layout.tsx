import 'react-native-get-random-values';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PersistGate } from 'redux-persist/integration/react';

import { ThemeProvider } from '@/components/ThemeProvider';
import { FontConfig } from '@/constants/Fonts';
import { store, persistor, useAppDispatch, useAppSelector } from '@/store';
import { checkAuthStatus } from '@/store/slices/authSlice';
import { SocketProvider } from '@/contexts/SocketContext';
import { ToastProvider } from '@/components/common/ToastProvider';

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
    // Load only essential fonts to avoid conflicts
    'SpaceMono-Regular': require('../assets/fonts/SpaceMono-Regular.ttf'),
    
    // Poppins fonts (only load what exists)
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Light': require('../assets/fonts/Poppins-Light.ttf'),
    
    // FontAwesome icons
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) {
      console.error('Font loading error:', error);
      // Don't throw the error, just log it to prevent app crash
      // throw error;
    }
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
    <GestureHandlerRootView style={{ flex: 1 }}>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SocketProvider>
          <ThemeProvider>
            <ToastProvider>
              <AuthGate />
            </ToastProvider>
          </ThemeProvider>
        </SocketProvider>
      </PersistGate>
    </Provider>
    </GestureHandlerRootView>
  );
}

function AuthGate() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  // // On app start, check auth status (reads token from storage and fetches profile with timeout)
  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  // // Optional: show splash/blank while determining auth
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
  if (!isAuthenticated) {
    // Unauthenticated: expose auth screens
    return (
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
        <Stack.Screen name="verify-code" options={{ headerShown: false }} />
        <Stack.Screen name="reset-password" options={{ headerShown: false }} />
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





