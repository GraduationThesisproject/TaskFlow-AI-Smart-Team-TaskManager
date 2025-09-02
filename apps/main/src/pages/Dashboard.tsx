import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../layouts/Dashboard/Home.Layouts';
import Templates from '../layouts/Dashboard/Templates.Layouts';
import Settings from '../layouts/Dashboard/Settings.Layouts';
import UserAnalyticsLayout from '../layouts/Dashboard/UserAnalytics.Layout.tsx';
import WorkspacesLayout from '../layouts/Dashboard/Workspaces.Layouts';

const Dashboard: React.FC = () => {
  return (
    <div>
      <Routes>
        <Route path="" element={<Home/>} />
        <Route path="/settings" element={<Settings/>} />
        <Route path="/settings/profile" element={<Settings/>} />
        <Route path="/settings/theme" element={<Settings/>} />
        <Route path="/settings/notifications" element={<Settings/>} />
        <Route path="/settings/upgrade" element={<Settings/>} />
        <Route path="/home" element={<Home/>} />
        <Route path="/workspaces" element={<WorkspacesLayout/>} />
        <Route path="/templates" element={<Templates/>} />
        <Route path="/analytics" element={<UserAnalyticsLayout/>} />
      </Routes>
    </div>
  );
};

export default Dashboard;
