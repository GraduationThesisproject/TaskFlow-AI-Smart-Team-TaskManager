 
import {Routes, Route } from 'react-router-dom'
import Home from '../layouts/CCWork/HomePage';


const CCWork = () => {
  return (
    <div>
      <Routes>
        <Route path="Home" element={<Home/>} />
      </Routes>
      
     </div>
   );
 };

 export default CCWork;
