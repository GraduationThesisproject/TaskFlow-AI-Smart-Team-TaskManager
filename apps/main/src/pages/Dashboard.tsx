 
import {Routes, Route } from 'react-router-dom'
import Home from '../layouts/Dashboard/Home.Layouts';
import Templates from '../layouts/Dashboard/Templates.Layouts';
import Calendar from '../layouts/Dashboard/Calendar.Layouts';
import Settings  from '../layouts/Dashboard/Settings.Layouts';

const Dashboard = () => {
  return (
    <div>
      <Routes>
        <Route path="Home" element={<Home/>} />
        <Route path="Templates" element={<Templates/>} />
        <Route path="Calendar" element={<Calendar/>} />
        <Route path="Settings" element={<Settings/>} />
      </Routes>
      
     </div>
   );
 };

 export default Dashboard;
