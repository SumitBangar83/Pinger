import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoutes';
import PingerApp from './pages/PingerApp';
import './components/css/Dashboard.css'
function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/pinger" element={<PingerApp />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        {/* Future protected routes will go here, for example: */}
        {/* <Route path="/profile" element={<Profile />} /> */}
      </Route>
    </Routes>
  );
}

export default App;