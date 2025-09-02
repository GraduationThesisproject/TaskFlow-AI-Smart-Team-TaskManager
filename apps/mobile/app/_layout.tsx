import { Stack } from "expo-router";
import { Platform } from "react-native";
import { ThemeProvider } from "../Theme/ThemeProvider";

function MaybeThemeProvider({ children }: { children: React.ReactNode }) {
  if (Platform.OS === "web") {
    return <ThemeProvider defaultTheme="dark">{children}</ThemeProvider>;
  }
  return <>{children}</>;
}

export default function Layout() {
  return (
    <MaybeThemeProvider>
      <Stack />
    </MaybeThemeProvider>
  );
}
