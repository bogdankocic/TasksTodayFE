import React from 'react';
import { Link } from 'react-router-dom';

interface SidebarModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any; // Replace with the appropriate user type
}

const SidebarModal: React.FC<SidebarModalProps> = ({ isOpen, onClose, user }) => {
  if (!isOpen) return null;

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
    <div className="absolute inset-0 bg-black/25 bg-opacity-5 z-50 flex justify-start">
      <div className="w-64 bg-white shadow-lg border border-gray-200 rounded-r-lg p-4">
        <button onClick={onClose} className="text-gray-600 hover:bg-gray-100 p-2 rounded-md">
          Close
        </button>
        <nav className="mt-12 flex flex-col space-y-2">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
              {user.teamRole === 'admin' ? 'Administration' : 'My Workspace'}
            </h3>
            <div className="space-y-1">
              {user.teamRole === 'admin' ? (
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
      </div>
    </div>
  );
};

export default SidebarModal;
