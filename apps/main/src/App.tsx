import React, { useState, useEffect } from 'react';
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
import SignIn from './layouts/Landing/SignIn';
import SignUP from './layouts/Landing/SignUP';
import EmailVerification from './layouts/Landing/EmailVerif';
import OAuthCallback from './components/auth/OAuthCallback';
import { LogoutConfirmDialog, AppLayout } from './components';
import { AccessibilityProvider } from './components/common/AccessibilityProvider';
import UniversalNavbar from './components/common/navbar/UniversalNavbar';
import Dashboard from './pages/Dashboard';
import { NoAccessPage } from './pages/NoAccessPage';

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

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  return (
    <AppLayout>
      {/* Universal Navbar - Always displayed */}
      <UniversalNavbar 
        user={user || undefined}
        onLogout={handleLogout}
        isAuthenticated={isAuthenticated}
        className="sticky top-0 z-50"
      />

      {/* Main Content */}
      <main className="flex-1 bg-gradient-to-br from-background via-muted/50 to-background">
        <Routes>
          <Route path="/*" element={<LandingPage />} />

          <Route path="/auth/callback" element={<OAuthCallback />} />

          <Route path="/dashboard/*" element={<Dashboard />} />

          <Route path="/workspace/*" element={<WorkSpace />} />

          <Route path="/space/*" element={<SpacePage/>} />

          <Route path="/board/:boardId/*" element={<BoardPage />} />

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
        storageKey="theme"      >
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
