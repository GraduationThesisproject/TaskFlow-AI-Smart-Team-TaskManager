 
import {Routes, Route } from 'react-router-dom'
import Home from '../layouts/Dashboard/Home.Layouts';
import Templates from '../layouts/Dashboard/Templates.Layouts';
import Calendar from '../layouts/Dashboard/Calendar.Layouts';
import Settings  from '../layouts/Dashboard/Settings.Layouts';

const Dashboard = () => {
  return (
    <div>
      <Routes>
        <Route path="/home" element={<Home/>} />
        <Route path="/templates" element={<Templates/>} />
        <Route path="/calendar" element={<Calendar/>} />
        <Route path="/settings" element={<Settings/>} />
      </Routes>
      
     </div>
   );
 };

 export default Dashboard;
