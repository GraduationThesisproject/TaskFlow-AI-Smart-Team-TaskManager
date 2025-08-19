import { BrowserRouter ,  Routes, Route  } from 'react-router-dom'
import WorkSpace from './pages/workSpace';
import Home from './pages/Home';

function App() {
  return (

      <BrowserRouter>
        <Routes >
          <Route path="/workspace/*" element={<WorkSpace/>} />
          <Route path="/home/*" element={<Home/>} />
        </Routes >
      </BrowserRouter>
   
  );
}

export default App;
