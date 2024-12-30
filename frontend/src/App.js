import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthPage from './components/Auth';
import Dashboard from './components/Dashboard';
import Diagnosing from './components/Diagnosing';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/dash" element={<Dashboard />} />
        <Route path="/diagnosing" element={<Diagnosing />} />
      </Routes>
    </Router>
  );
}

export default App;