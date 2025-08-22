import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../layouts/Dashboard/Home.Layouts';
import Templates from '../layouts/Dashboard/Templates.Layouts';
import Calendar from '../layouts/Dashboard/Calendar.Layouts';
import Settings from '../layouts/Dashboard/Settings.Layouts';
import DashboardNavbar from '../components/common/navbar/dashboardNav/DashboardNavbar';
const Dashboard: React.FC = () => {
  return (
    <div>
      <DashboardNavbar/>
      <Routes>
        <Route path="" element={<Home/>} />
        <Route path="Templates" element={<Templates/>} />
        <Route path="Calendar" element={<Calendar/>} />
        <Route path="Settings" element={<Settings/>} />
        <Route path="/home" element={<Home/>} />
        <Route path="/templates" element={<Templates/>} />
        <Route path="/calendar" element={<Calendar/>} />
        <Route path="/settings" element={<Settings/>} />
      </Routes>
      
     </div>
   );
   };
    
export default Dashboard;
