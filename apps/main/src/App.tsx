import { BrowserRouter ,  Routes, Route  } from 'react-router-dom'
import WorkSpace from './pages/workSpace';

function App() {
  return (

      <BrowserRouter>
        <Routes >
          <Route path="/workspace/*" element={<WorkSpace/>} />
        </Routes >
      </BrowserRouter>
   
  );
}

export default App;
