import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthPage from './components/Auth';
import Dashboard from './components/Dashboard';
import Diagnosing from './components/Diagnosing';
import AssessmentForm from './components/AssessmentForm';
import Dyslexiadiagnosis from './components/Dyslexiadiagnosis';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/dash" element={<Dashboard />} />
        <Route path="/diagnosing" element={<AssessmentForm />} />
        <Route path='/LD_identification' element={<Diagnosing />}/>
        <Route path='/dyslexia_diagnosis' element={<Dyslexiadiagnosis />}/>
      </Routes>
    </Router>
  );
}

export default App;