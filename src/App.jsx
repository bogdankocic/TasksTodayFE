import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Organizations from './components/Organizations';
import OrganizationPage from './components/OrganizationPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/organizations" replace />} />
        <Route path="/organizations" element={<Organizations />} />
        <Route path="/organization" element={<OrganizationPage />} />
      </Routes>
    </Router>
  );
}

export default App;
