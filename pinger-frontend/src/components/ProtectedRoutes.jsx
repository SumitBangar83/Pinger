import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const ProtectedRoute = () => {
  const { authUser } = useAuth();

  // Outlet, nested child routes (jaise Dashboard) ko render karta hai
  // Agar user hai, to Outlet dikhao, warna /login par bhej do
  return authUser ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;