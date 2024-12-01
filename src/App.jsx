import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import './login.css';
import './SignUp.css';
import './ForgotPassword.css';
import './Dashboard.css';
import Login from './login';
import ForgotPassword from './ForgotPassword';
import SignUp from './SignUp';
import Dashboard from './Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Add more routes here as needed */}
      </Routes>
    </Router>
  );
}

export default App;