import { BrowserRouter ,  Routes, Route  } from 'react-router-dom'
import WorkSpace from './pages/workSpace';
import Home from './layouts/CCWork/HomePage';
import Templates from './layouts/CCWork/TemplatePage';
function App() {
  return (

      <BrowserRouter>
        <Routes >
          <Route path="/workspace/*" element={<WorkSpace/>} />
          <Route path="/home/*" element={<Home/>} />
          <Route path="/Templates/*" element={<Templates/>} />
        </Routes >
      </BrowserRouter>
   
  );
}

export default App;
