 
import {Routes, Route } from 'react-router-dom'
import Main from '../layouts/home/MainPage';
const Home = () => {
  return (
    <div>
      <Routes>
        <Route path="main" element={<Main/>} />
      </Routes>
      
     </div>
   );
 };

 export default Home;
