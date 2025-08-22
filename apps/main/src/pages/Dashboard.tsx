import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../layouts/Dashboard/Home.Layouts';
import Templates from '../layouts/Dashboard/Templates.Layouts';
import Calendar from '../layouts/Dashboard/Calendar.Layouts';
import Settings from '../layouts/Dashboard/Settings.Layouts';

const Dashboard: React.FC = () => {
  return (
<<<<<<< HEAD
    <div>
      <Routes>
<<<<<<< HEAD
        <Route path="" element={<Home/>} />
        <Route path="Templates" element={<Templates/>} />
        <Route path="Calendar" element={<Calendar/>} />
        <Route path="Settings" element={<Settings/>} />
=======
        <Route path="/home" element={<Home/>} />
        <Route path="/templates" element={<Templates/>} />
        <Route path="/calendar" element={<Calendar/>} />
        <Route path="/settings" element={<Settings/>} />
>>>>>>> 426cb96bece97975d9e8d45e9726770b63e25710
      </Routes>
      
     </div>
   );
 };
=======
    <Routes>
      <Route path="" element={<Home />} />
      <Route path="templates" element={<Templates />} />
      <Route path="calendar" element={<Calendar />} />
      <Route path="settings" element={<Settings />} />
    </Routes>
  );
};
>>>>>>> 934a1067b0877b904f2f22e6dc9951dd0098261b

export default Dashboard;
