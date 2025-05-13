import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import DashboardLayout from './components/DashboardLayout'
import DashboardHome from './pages/DashboardHome'
import Organizations from './pages/Organizations'
import Users from './pages/Users'
import OrganizationPage from './pages/OrganizationPage'
import MyProfile from './pages/MyProfile'
import Login from './pages/Login'
import Landing from './pages/Landing'
import UserActivate from './pages/UserActivate'
import { AuthProvider, useAuth } from './components/AuthContext'
import React from 'react'
import TeamMembersPage from './pages/TeamMembersPage'
import TasksPage from './pages/TasksPage'
import { ToastProvider } from './components/ToastContext'
import Toast from './components/Toast'

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
        <Route
          path="teams/:teamId/members"
          element={<TeamMembersPage />}
        />
        <Route path="tasks" element={<TasksPage />} />
      </Route>
    </Routes>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
          <Toast />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
