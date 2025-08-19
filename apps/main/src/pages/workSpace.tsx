 import {Routes, Route } from 'react-router-dom'
import Main from '../layouts/workSpace/MainPage';

const WorkSpace = () => {
  return (      
      <Routes>
        <Route path="main" element={<Main/>} />
      </Routes>
   );
 };

 export default WorkSpace;
