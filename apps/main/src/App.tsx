import React, { useState, useEffect } from 'react';
import { Button,  Typography, Flex, Avatar, AvatarImage, AvatarFallback } from '@taskflow/ui';
import { Link } from 'react-router-dom';
import { ThemeProvider } from '@taskflow/theme';
import { useAuth } from './hooks/useAuth';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppDispatch } from './store';
import { checkAuthStatus } from './store/slices/authSlice';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import WorkSpace from './pages/workSpace';
import { SpacePage } from './pages/space.page';
import { BoardPage } from './pages/board.page';
import { LandingPage } from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import { NoAccessPage } from './pages/NoAccessPage';
import { ProtectedRoute, PublicRoute, LogoutConfirmDialog, ThemeToggle } from './components';
import { LogOut } from 'lucide-react';

function AppContent() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Initialize authentication check on app mount
  useEffect(() => {
    console.log('AppContent: Initializing authentication check...');
    dispatch(checkAuthStatus());
  }, [dispatch]);

  // Debug logging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('AppContent render:', { isAuthenticated, isLoading, user: !!user });
  }

  // Show loading while auth is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing...</p>
          <p className="text-xs text-muted-foreground mt-2">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
      {/* Header with Theme Toggle - Only show for authenticated users */}
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

                {/* User Info and Logout */}
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

      {/* Main Content with Gradient Background */}
      <main className="bg-gradient-to-br from-background via-muted/50 to-background">
        <Routes>
          {/* Public Routes - Only accessible to unauthenticated users */}
          <Route path="/*" element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          } />

          {/* Protected Routes - Require authentication */}
          <Route path="/dashboard/*" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          {/* Workspace Routes - Require authentication and member role */}
          <Route path="/workspace/*" element={
            <ProtectedRoute requiredRole="member">
              <WorkSpace />
            </ProtectedRoute>
          } />

          {/* Space Routes - Require authentication and member role */}
          <Route path="/space/*" element={
            <ProtectedRoute requiredRole="member">
              <SpacePage />
            </ProtectedRoute>
          } />

          {/* Board Routes - Require authentication and member role */}
          <Route path="/board/*" element={
            <ProtectedRoute requiredRole="member">
              <BoardPage />
            </ProtectedRoute>
          } />


           {/* No Access Page */}
           <Route path="/no-access" element={<NoAccessPage />} />

          {/* Catch all route - redirect to landing page */}
          <Route path="*" element={
            <Navigate to="/" replace />
          } />
        </Routes>
      </main>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={logout}
        userName={user?.user?.name || 'User'}
      />
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider defaultTheme="dark" storageKey="theme">
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
