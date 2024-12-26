import React from 'react';
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom'
import AuthPage from './components/Auth';
import Dashboard from './components/Dashboard'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" elements={<AuthPage/>}></Route>
        <Route path='/dash' elements={<Dashboard/>}></Route>
      </Routes>
    </Router>

  );
}

export default App;