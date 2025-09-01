
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import './index.css'
import App from './App.tsx'
import { SocketProvider } from './contexts/SocketContext.tsx'
import { ThemeProvider } from '@taskflow/theme'
import { AccessibilityProvider } from './contexts/AccessibilityContext.tsx'
import {
  BrowserRouter as Router,

} from "react-router-dom";
createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
  <ThemeProvider defaultTheme="dark" storageKey="theme">
    <AccessibilityProvider>
      <Router>
        <SocketProvider>
          <App />
        </SocketProvider>
      </Router>
    </AccessibilityProvider>
  </ThemeProvider>
</Provider>
)
