import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';

// Import page components
import DashboardPage from './DashboardPage';
import UserManagementPage from './UserManagementPage';
import TemplatesPage from './TemplatesPage';
import AnalyticsPage from './AnalyticsPage';
import IntegrationsPage from './IntegrationsPage';
import SystemHealthPage from './SystemHealthPage';
import NotificationsPage from './NotificationsPage';
import SettingsPage from './SettingsPage';

const AdminPage: React.FC = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/users" element={<UserManagementPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/integrations" element={<IntegrationsPage />} />
        <Route path="/system-health" element={<SystemHealthPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminPage;
