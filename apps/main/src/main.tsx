import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store";
import "./index.css";
import App from "./App.tsx";
import { SocketProvider } from "./contexts/SocketContext.tsx";
import { ThemeProvider } from "@taskflow/theme";
import { AccessibilityProvider } from "./contexts/AccessibilityContext.tsx";
import { BrowserRouter as Router } from "react-router-dom";
import { ToastProvider } from "./hooks/useToast";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ToastProvider position="top-right" maxToasts={5}>
        <ThemeProvider defaultTheme="dark" storageKey="theme">
          <AccessibilityProvider>
            <Router>
              <SocketProvider>
                <App />
              </SocketProvider>
            </Router>
          </AccessibilityProvider>
        </ThemeProvider>
      </ToastProvider>
    </PersistGate>
  </Provider>
);
