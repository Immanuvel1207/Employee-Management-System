import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminHome from './components/AdminHome';
import EmpHome from './components/EmpHome';
import Login from './components/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/adminhome" element={<AdminHome />} />
        <Route path="/emphome/:id" element={<EmpHome />} />
      </Routes>
    </Router>
  );
}

export default App;
