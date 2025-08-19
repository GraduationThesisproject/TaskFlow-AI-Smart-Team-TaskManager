 
import {Routes, Route } from 'react-router-dom'
import Main from '../layouts/workSpace/MainPage';
import Sidebar from '../layouts/workSpace/Sidebar';
const WorkSpace = () => {
  return (
    <div>
      <Sidebar/>
      <Routes>
        <Route path="main" element={<Main/>} />
      </Routes>
      
     </div>
   );
 };

 export default WorkSpace;
