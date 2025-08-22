import React, { useState, useEffect } from 'react';
import { Button, Typography, Flex, Avatar, AvatarImage, AvatarFallback } from '@taskflow/ui';
import { Link } from 'react-router-dom';
import { ThemeProvider } from '@taskflow/theme';
import { useAuth } from './hooks/useAuth';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppDispatch } from './store';
import { checkAuthStatus } from './store/slices/authSlice';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WorkSpace from './pages/workSpace';
import { SpacePage } from './pages/space.page';
import { BoardPage } from './pages/board.page';
import { LandingPage } from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import { NoAccessPage } from './pages/NoAccessPage';
import { LogoutConfirmDialog, ThemeToggle, AppLayout } from './components';
import { AccessibilityProvider } from './components/common/AccessibilityProvider';
import { LogOut } from 'lucide-react';

function AppContent() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Initializing...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {isAuthenticated && (
        <header className="backdrop-blur-sm bg-card/90 border-b border-border/30 w-full sticky top-0 z-50 shadow-sm">
          <div className="w-full px-6 sm:px-8 lg:px-12 py-6">
            <Flex justify="between" align="center">
              <div className="flex items-center gap-3">
                <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">T</span>
                  </div>
                  <Typography variant="heading-large" className="font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    TaskFlow AI
                  </Typography>
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 text-sm">
                    <Avatar size="sm">
                      {user?.user?.avatar && <AvatarImage src={user.user.avatar} alt={user.user.name || 'User'} />}
                      <AvatarFallback variant="primary">
                        {user?.user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {user?.user?.name || 'User'}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLogoutConfirm(true)}
                    className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400 transition-all duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Log out</span>
                  </Button>
                </div>
              </div>
            </Flex>
          </div>
        </header>
      )}

      <main className="flex-1 bg-gradient-to-br from-background via-muted/50 to-background">
        <Routes>
          <Route path="/*" element={<LandingPage />} />

          <Route path="/dashboard/*" element={<Dashboard />} />

          <Route path="/workspace/*" element={<WorkSpace />} />

          <Route path="/space/*" element={<SpacePage />} />

          <Route path="/board/*" element={<BoardPage />} />

          <Route path="/no-access" element={<NoAccessPage />} />

          <Route path="*" element={
            <Navigate to="/" replace />
          } />
        </Routes>
      </main>

      <LogoutConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={logout}
        userName={user?.user?.name || 'User'}
      />
    </AppLayout>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider 
        defaultTheme="dark" 
        storageKey="theme"
      >
        <AccessibilityProvider>
          <Router>
            <AppContent />
          </Router>
        </AccessibilityProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
