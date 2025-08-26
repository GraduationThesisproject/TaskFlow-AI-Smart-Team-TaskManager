import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../layouts/Dashboard/Home.Layouts';
import Templates from '../layouts/Dashboard/Templates.Layouts';
import Settings from '../layouts/Dashboard/Settings.Layouts';
import UserAnalyticsLayout from '../layouts/Dashboard/UserAnalytics.Layout.tsx';

const Dashboard: React.FC = () => {
  return (
    <div>
      <Routes>
        <Route path="" element={<Home/>} />
        <Route path="Templates" element={<Templates/>} />
        <Route path="Settings" element={<Settings/>} />
        <Route path="analytics" element={<UserAnalyticsLayout/>} />
        <Route path="/home" element={<Home/>} />
        <Route path="/templates" element={<Templates/>} />
        <Route path="/settings" element={<Settings/>} />
        <Route path="/analytics" element={<UserAnalyticsLayout/>} />
      </Routes>
    </div>
  );
};

export default Dashboard;
