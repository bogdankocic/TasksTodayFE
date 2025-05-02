import React, { useState } from 'react';
import { Link, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import SidebarModal from './SidebarModal';

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const adminNavItems = [
    { to: "/organizations", label: "Organizations" },
    { to: "/users", label: "Users" }
  ];

  const userNavItems = [
    { to: "/organization", label: "Organization" },
    { to: "/users", label: "Users" },
    { to: "/projects", label: "Projects" },
    { to: "/tasks", label: "Tasks" }
  ];
  
  return (
    <div className="flex h-screen bg-gray-50">
      <aside className={`w-64 bg-white shadow-lg border border-gray-200 rounded-r-lg hidden lg:block`}>
        <nav className="mt-12 flex flex-col space-y-2 px-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
              {user.role_id === 1 ? 'Administration' : 'My Workspace'}
            </h3>
            <div className="space-y-1">
              {user.role_id === 1 ? (
                adminNavItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="block py-2 px-4 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                  >
                    {item.label}
                  </Link>
                ))
              ) : (
                userNavItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="block py-2 px-4 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                  >
                    {item.label}
                  </Link>
                ))
              )}
            </div>
          </div>
        </nav>
      </aside>
      <main className="flex-1 flex flex-col">
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-14 px-4 sm:px-6 lg:px-8">
            <button 
              className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
              onClick={() => setIsSidebarOpen(true)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="flex-1 flex items-center justify-center lg:justify-start flex-shrink-0">
              <span className="text-xl font-semibold">TasksToday</span>
            </div>
            
            <div className="flex items-center gap-4">
              {user ? (
                <div className="relative inline-block">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="reset-button-border-and-padding h-13 w-13 rounded-full"
                >
                   {user.profile_photo ? (
                    <img 
                      src={user.profile_photo} 
                      alt="Profile" 
                      className="h-12 inline rounded-full"
                    />
                    ) : (
                      <span className="text-gray-600 text-sm font-medium">
                        {(user.first_name?.[0] || '') + (user.last_name?.[0] || '')}
                      </span>
                    )}
                  </button>
                  
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-200">
                      <Link to="/my-profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                        My Profile
                      </Link>
                      <button 
                        onClick={() => logout()} 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </header>
        
        <div className="overflow-y-auto p-8 bg-white rounded-l-lg shadow-inner">
          <Outlet />
        </div>
      </main>
      <SidebarModal isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={user} />
    </div>
  );
};

export default DashboardLayout;
