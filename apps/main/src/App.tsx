import { Button,  Typography, Flex } from '@taskflow/ui';
import { Link } from 'react-router-dom';
import { ThemeProvider } from '@taskflow/theme';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';
import { Provider } from 'react-redux';
import { store } from './store';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
// import { SpacePage } from './pages/space.page';
import WorkSpace from './pages/workSpace';
import { SpacePage } from './pages/space.page';
import { BoardPage } from './pages/board.page';

import { LandingPage } from './pages/LandingPage';
import Dashboard from './pages/Dashboard';

function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading while auth is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
      {/* Header with Theme Toggle */}
      <header className="backdrop-blur-sm bg-card/90 border-b border-border/30 w-full sticky top-0 z-50 shadow-sm">
        <div className="w-full px-6 sm:px-8 lg:px-12 py-6">
          <Flex justify="between" align="center">
            <div className="flex items-center gap-3">
              <Link to="/space/space1" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <Typography variant="heading-large" className="font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  TaskFlow AI
                </Typography>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="flex items-center gap-2 hover:bg-muted/50 transition-all duration-200 rounded-full px-4 py-2"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
                <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </Button>
            </div>
          </Flex>
        </div>
      </header>

      {/* Main Content with Gradient Background */}
      <main className="bg-gradient-to-br from-background via-muted/50 to-background">

        <Routes>
          <Route path="/*" element={<LandingPage />} />
          {/* <Route path="/space/*" element={<SpacePage />} /> */}
          <Route path="/workspace/*" element={<WorkSpace />} />
          <Route path="/space/*" element={<SpacePage />} />
          <Route path="/dashboard/*" element={<Dashboard/>} />
          {/* <Route path="/workspace/*" element={<WorkSpace />} /> */}
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider defaultTheme="dark" storageKey="taskflow-theme">
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
