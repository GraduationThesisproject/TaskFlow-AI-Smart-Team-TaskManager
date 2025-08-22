import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { ThemeProvider } from '@taskflow/theme';
import './App.css';

// Main Admin Page Component
import AdminPage from './pages/AdminPage';

// Login Page
import LoginPage from './pages/LoginPage';

// Notification Context
import { NotificationProvider } from './contexts/NotificationContext';
import { LanguageProvider } from './contexts/LanguageContext';

// Protected Route Component that can access Redux state
const ProtectedRouteWithRedux = ({ children }: { children: React.ReactNode }) => {
  const state = store.getState();
  const { isAuthenticated, isLoading } = state.admin;
  const token = localStorage.getItem('adminToken');
  
  // console.log('ProtectedRoute: checking auth state:', { isAuthenticated, isLoading, hasToken: !!token });
  
  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-muted-foreground">Checking authentication...</div>
        </div>
      </div>
    );
  }
  
  // Check if authenticated or has token
  if (!isAuthenticated && !token) {
    console.log('ProtectedRoute: not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // console.log('ProtectedRoute: authenticated, rendering children');
  return <>{children}</>;
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider defaultTheme="dark">
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected Admin Routes - All handled by AdminPage */}
              <Route path="/*" element={
                <ProtectedRouteWithRedux>
                  <LanguageProvider>
                    <NotificationProvider authToken={localStorage.getItem('adminToken') || ''}>
                      <AdminPage />
                    </NotificationProvider>
                  </LanguageProvider>
                </ProtectedRouteWithRedux>
              } />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
