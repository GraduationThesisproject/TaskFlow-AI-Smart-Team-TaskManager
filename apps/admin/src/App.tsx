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

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('adminToken');
  
  console.log('ProtectedRoute: checking token:', !!token);
  
  if (!token) {
    console.log('ProtectedRoute: no token, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  console.log('ProtectedRoute: token found, rendering children');
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
                <ProtectedRoute>
                  <LanguageProvider>
                    <NotificationProvider authToken={localStorage.getItem('adminToken') || ''}>
                      <AdminPage />
                    </NotificationProvider>
                  </LanguageProvider>
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
