 import {Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '../components';
import Main from '../layouts/workSpace/MainPage';
import SettingsLayout from '../layouts/workSpace/SettingsLayout';
import UpgradeLayout from '../layouts/workSpace/UpgradeLayout';
import ReportsLayout from '../layouts/workSpace/ReportsLayout';

const WorkSpace = () => {
  return (      
      <Routes>
        {/* Anyone with workspace access (member+) */}
        <Route path="main" element={
          // <ProtectedRoute requiredRole="member">
            <Main/>
          // </ProtectedRoute>
        } />

        {/* Settings: restrict to admins+ (owner/admin) */}
        <Route path="settings/*" element={
          <ProtectedRoute requiredRole="admin">
            <SettingsLayout />
          </ProtectedRoute>
        } />

        {/* Example using a specific permission flag instead of role */}
        <Route path="upgrade/*" element={
          <ProtectedRoute requiredPermission="canManageSettings">
            <UpgradeLayout />
          </ProtectedRoute>
        } />

        {/* Reports: allow members+ */}
        <Route path="reports/*" element={
          <ProtectedRoute requiredRole="member">
            <ReportsLayout />
          </ProtectedRoute>
        } />
      </Routes>
  );
};


 export default WorkSpace;
