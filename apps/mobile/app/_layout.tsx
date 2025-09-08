import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ThemeProvider } from '@/components/ThemeProvider';
import { store, useAppDispatch, useAppSelector } from '@/store';
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
    // Load fonts individually to avoid conflicts
    'SpaceMono-Regular': require('../assets/fonts/SpaceMono-Regular.ttf'),
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    // FontAwesome icons - load separately to avoid conflicts
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

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <ThemeProvider>
          <AuthGate />
        </ThemeProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

function AuthGate() {
  // const dispatch = useAppDispatch();
  // const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  // // On app start, check auth status (reads token from storage and fetches profile with timeout)
  // useEffect(() => {
  //   dispatch(checkAuthStatus());
  // }, [dispatch]);

  // // Optional: show splash/blank while determining auth
  // if (isLoading) {
  //   return null;
  // }

  // if (!isAuthenticated) {
  //   // Unauthenticated: expose only login screen to prevent access to other screens
    return (
      <Stack>
        {/* <Stack.Screen name="taskcard" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} /> */}
      {/* </Stack>
    );
  }

  // Authenticated: show main tabs (workspace section lives under tabs/index)
  return (
    <Stack>*/}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> 
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

