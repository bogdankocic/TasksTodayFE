import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import DashboardLayout from './components/DashboardLayout'
import DashboardHome from './components/DashboardHome'
import Organizations from './components/Organizations'
import Users from './components/Users'
import OrganizationPage from './components/OrganizationPage'
import MyProfile from './components/MyProfile'
import Login from './components/Login'
import Landing from './components/Landing'
import UserActivate from './components/UserActivate'
import { AuthProvider, useAuth } from './components/AuthContext'
import React from 'react'

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/user-activate" element={<UserActivate />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="organizations" element={<Organizations />} />
        <Route path="organization" element={<OrganizationPage />} />
        <Route path="users" element={<Users />} />
        <Route path="my-profile" element={<MyProfile />} />
      </Route>
    </Routes>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
