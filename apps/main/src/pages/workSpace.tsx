 import {Routes, Route } from 'react-router-dom'
import Main from '../layouts/workSpace/MainPage';
import SettingsLayout from '../layouts/workSpace/SettingsLayout';
import UpgradeLayout from '../layouts/workSpace/UpgradeLayout';
import ReportsLayout from '../layouts/workSpace/ReportsLayout';

const WorkSpace = () => {
  return (      
      <Routes>
        <Route path="main" element={<Main/>} />
        <Route path="settings/*" element={<SettingsLayout />} />
        <Route path="upgrade/*" element={<UpgradeLayout />} />
        <Route path="reports/*" element={<ReportsLayout />} />
      </Routes>
  );
};


 export default WorkSpace;
