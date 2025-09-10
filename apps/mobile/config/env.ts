import Constants from "expo-constants";
import { Platform } from "react-native";
// Pull IP/Port from .env or fallbacks
const LOCAL_IP = process.env.EXPO_PUBLIC_LOCAL_IP || "localhost";
const PORT = process.env.EXPO_PUBLIC_LOCAL_PORT || "3001";

// Smart defaults for simulators
function getDefaultHost() {
  if (__DEV__ && Platform.OS === "android") return "10.0.2.2"; // Android emulator
  if (__DEV__ && Platform.OS === "ios") return "127.0.0.1";    // iOS simulator
  return LOCAL_IP; // Physical device (LAN IP)
}

const DEFAULT_HOST = getDefaultHost();
const DEFAULT_BASE = `http://${DEFAULT_HOST}:${PORT}`;
const DEFAULT_API = `${DEFAULT_BASE}/api`;

export const env = {
  // Environment
  NODE_ENV: __DEV__ ? "development" : "production",
  PORT,

  // Defaults
  DEFAULT_HOST,
  DEFAULT_API,
  DEFAULT_BASE,

  // API URLs
  API_BASE_URL:
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    Constants.expoConfig?.extra?.apiBaseUrl ||
    DEFAULT_API,

  API_URL:
    process.env.EXPO_PUBLIC_API_URL ||
    Constants.expoConfig?.extra?.apiUrl ||
    DEFAULT_API,

  SOCKET_URL:
    process.env.EXPO_PUBLIC_SOCKET_URL ||
    Constants.expoConfig?.extra?.socketUrl ||
    DEFAULT_BASE,

  BASE_URL:
    process.env.EXPO_PUBLIC_BASE_URL ||
    Constants.expoConfig?.extra?.baseUrl ||
    DEFAULT_BASE,

  // App Info
  APP_NAME: Constants.expoConfig?.name || "TaskFlow",
  APP_VERSION: Constants.expoConfig?.version || "1.0.0",

  // Feature Flags
  ENABLE_ANALYTICS:
    process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === "true" ||
    Constants.expoConfig?.extra?.enableAnalytics === true,
  ENABLE_DEBUG: __DEV__,

  // OAuth
  GOOGLE_CLIENT_ID:
    process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
    Constants.expoConfig?.extra?.googleClientId ||
    "",
  GOOGLE_CLIENT_SECRET:
    process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET ||
    Constants.expoConfig?.extra?.googleClientSecret ||
    "",
  GOOGLE_CALLBACK_URL:
    process.env.EXPO_PUBLIC_GOOGLE_CALLBACK_URL ||
    Constants.expoConfig?.extra?.googleCallbackUrl ||
    "taskflow://auth/google/callback",

  GITHUB_CLIENT_ID:
    process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID ||
    Constants.expoConfig?.extra?.githubClientId ||
    "",
  GITHUB_CLIENT_SECRET:
    process.env.EXPO_PUBLIC_GITHUB_CLIENT_SECRET ||
    Constants.expoConfig?.extra?.githubClientSecret ||
    "",
  GITHUB_CALLBACK_URL:
    process.env.EXPO_PUBLIC_GITHUB_CALLBACK_URL ||
    Constants.expoConfig?.extra?.githubCallbackUrl ||
    "taskflow://auth/github/callback",

  // Storage
  UPLOAD_DIR: "uploads",
  MAX_FILE_SIZE: 10485760, // 10MB

  // Build Info
  BUILD_TIME:
    process.env.EXPO_PUBLIC_BUILD_TIME || Constants.expoConfig?.extra?.buildTime,
  COMMIT_HASH:
    process.env.EXPO_PUBLIC_COMMIT_HASH || Constants.expoConfig?.extra?.commitHash,

  // Platform
  PLATFORM: Platform.OS,
  IS_IOS: Platform.OS === "ios",
  IS_ANDROID: Platform.OS === "android",

  // Device
  DEVICE_ID:
    process.env.EXPO_PUBLIC_DEVICE_ID || Constants.expoConfig?.extra?.deviceId,
  DEVICE_NAME:
    process.env.EXPO_PUBLIC_DEVICE_NAME || Constants.expoConfig?.extra?.deviceName,

  // Stores
  APP_STORE_URL:
    process.env.EXPO_PUBLIC_APP_STORE_URL || Constants.expoConfig?.extra?.appStoreUrl,
  PLAY_STORE_URL:
    process.env.EXPO_PUBLIC_PLAY_STORE_URL || Constants.expoConfig?.extra?.playStoreUrl,

  // Deep Linking
  DEEP_LINK_SCHEME: Constants.expoConfig?.scheme || "taskflow",
  DEEP_LINK_HOST:
    process.env.EXPO_PUBLIC_DEEP_LINK_HOST ||
    Constants.expoConfig?.extra?.deepLinkHost ||
    "taskflow.com",

  // Push Notifications
  PUSH_NOTIFICATION_TOKEN:
    process.env.EXPO_PUBLIC_PUSH_NOTIFICATION_TOKEN ||
    Constants.expoConfig?.extra?.pushNotificationToken,

  // Analytics
  ANALYTICS_ID:
    process.env.EXPO_PUBLIC_ANALYTICS_ID || Constants.expoConfig?.extra?.analyticsId,

  // Crash/Performance
  CRASH_REPORTING_ENABLED:
    process.env.EXPO_PUBLIC_CRASH_REPORTING_ENABLED === "true" ||
    Constants.expoConfig?.extra?.crashReportingEnabled === true,

  PERFORMANCE_MONITORING_ENABLED:
    process.env.EXPO_PUBLIC_PERFORMANCE_MONITORING_ENABLED === "true" ||
    Constants.expoConfig?.extra?.performanceMonitoringEnabled === true,

  // Env-specific APIs
  DEVELOPMENT_API_URL:
    process.env.EXPO_PUBLIC_DEV_API_URL || "http://localhost:3001/api",
  STAGING_API_URL:
    process.env.EXPO_PUBLIC_STAGING_API_URL ||
    "https://staging-api.taskflow.com/api",
  PRODUCTION_API_URL:
    process.env.EXPO_PUBLIC_PROD_API_URL || "https://api.taskflow.com/api",

  // Feature Toggles
  ENABLE_PUSH_NOTIFICATIONS:
    process.env.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS === "true" ||
    Constants.expoConfig?.extra?.enablePushNotifications === true,
  ENABLE_DEEP_LINKING:
    process.env.EXPO_PUBLIC_ENABLE_DEEP_LINKING === "true" ||
    Constants.expoConfig?.extra?.enableDeepLinking === true,
  ENABLE_BIOMETRIC_AUTH:
    process.env.EXPO_PUBLIC_ENABLE_BIOMETRIC_AUTH === "true" ||
    Constants.expoConfig?.extra?.enableBiometricAuth === true,

  // Third-party
  SENTRY_DSN:
    process.env.EXPO_PUBLIC_SENTRY_DSN || Constants.expoConfig?.extra?.sentryDsn,
  MIXPANEL_TOKEN:
    process.env.EXPO_PUBLIC_MIXPANEL_TOKEN ||
    Constants.expoConfig?.extra?.mixpanelToken,
  AMPLITUDE_API_KEY:
    process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY ||
    Constants.expoConfig?.extra?.amplitudeApiKey,

  // App Config
  DEFAULT_LANGUAGE:
    process.env.EXPO_PUBLIC_DEFAULT_LANGUAGE || "en",
  SUPPORTED_LANGUAGES: (
    process.env.EXPO_PUBLIC_SUPPORTED_LANGUAGES || "en,es,fr"
  ).split(","),
  DEFAULT_THEME: process.env.EXPO_PUBLIC_DEFAULT_THEME || "system",
} as const;

// Type helper
export type Env = typeof env;
