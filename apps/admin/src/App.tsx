import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { ThemeProvider } from '@taskflow/theme/ThemeProvider';
import './App.css';

// Layout Components
import AdminLayout from './layouts/AdminLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import TemplatesPage from './pages/TemplatesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import IntegrationsPage from './pages/IntegrationsPage';
import SystemHealthPage from './pages/SystemHealthPage';
import NotificationsPage from './pages/NotificationsPage';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // TODO: Implement proper authentication check
  const isAuthenticated = true; // Placeholder
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
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
              
              {/* Protected Admin Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="users" element={<UserManagementPage />} />
                <Route path="templates" element={<TemplatesPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="integrations" element={<IntegrationsPage />} />
                <Route path="system-health" element={<SystemHealthPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
              </Route>
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
