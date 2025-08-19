 
import {Routes, Route } from 'react-router-dom'
import Main from '../layouts/workSpace/MainPage';
const WorkSpace = () => {
  return (
    <div>
      <Routes>
        <Route path="main" element={<Main/>} />
      </Routes>
      
     </div>
   );
 };

 export default WorkSpace;
