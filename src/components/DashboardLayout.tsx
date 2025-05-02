import React, { useState, useEffect } from 'react';
import { Link, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import SidebarModal from './SidebarModal';
import SidebarProjects from './SidebarProjects';
import CreateProjectModal from './CreateProjectModal';
import UpdateProjectModal from './UpdateProjectModal';
import apiService from '../api/apiService';

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<{ id: number; title: string; description: string; teams: { id: number; title: string; project_id: number; created_at: string }[] } | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      setProjectsError(null);
      try {
        const response = await apiService.getProjects();
        setProjects(response.data);
      } catch (error) {
        setProjectsError('Failed to load projects');
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, []);

  if (!user) {
    return <Navigate to="/" replace />;
  }
  

  const adminNavItems = [
    { to: "/organizations", label: "Organizations" },
    { to: "/users", label: "Users" }
  ];

  const userNavItems = [
    { to: "/users", label: "Users" }
  ];

  // Adjust permissions based on user.permissions object
  const canCreateProject = user.permissions?.can_create_project ?? false;

  const handleCreateProject = () => {
    setIsCreateModalOpen(true);
  };

  const handleUpdateProject = (projectId: number) => {
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      setEditingProject(project);
      setIsUpdateModalOpen(true);
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    try {
      await apiService.deleteProject(projectId);
      // Refresh projects list
      const response = await apiService.getProjects();
      setProjects(response.data);
    } catch (error) {
      alert('Failed to delete project');
    }
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
  };

  const handleUpdateModalClose = () => {
    setIsUpdateModalOpen(false);
    setEditingProject(null);
  };

  const handleCreateModalSubmit = async (data: { title: string; description: string }) => {
    try {
      await apiService.createProject(data);
      setIsCreateModalOpen(false);
      // Refresh projects list
      const response = await apiService.getProjects();
      setProjects(response.data);
    } catch (error) {
      alert('Failed to create project');
    }
  };

  const handleUpdateModalSubmit = async (data: { title: string; description: string }) => {
    if (!editingProject) return;
    try {
      await apiService.updateProject(editingProject.id, data);
      setIsUpdateModalOpen(false);
      setEditingProject(null);
      const response = await apiService.getProjects();
      setProjects(response.data);
    } catch (error) {
      alert('Failed to update project');
    }
  };

  // For each project, determine canUpdate and canDelete based on user permissions
  const projectsWithPermissions = projects.map((project) => ({
    ...project,
    canUpdate: user.permissions?.can_update_project ?? false,
    canDelete: user.permissions?.can_delete_project ?? false,
  }));

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className={`w-64 bg-white shadow-lg border border-gray-200 rounded-r-lg hidden lg:block`}>
        <nav className="mt-12 flex flex-col space-y-2 px-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">
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
                <>
                    <Link
                      key="user-organization"
                      to="/organization"
                      className="block py-2 px-4 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                    >
                      Organization
                    </Link>
                    {userNavItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="block py-2 px-4 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                      >
                        {item.label}
                      </Link>
                    ))}
                  {loadingProjects && <p className="px-4 text-gray-500">Loading projects...</p>}
                  {projectsError && <p className="px-4 text-red-500">{projectsError}</p>}
                  {!loadingProjects && !projectsError && (
                  <SidebarProjects
                    projects={projectsWithPermissions}
                    canCreate={canCreateProject}
                    onCreate={handleCreateProject}
                    onUpdate={handleUpdateProject}
                    onDelete={handleDeleteProject}
                  />
                  )}
                </>
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
                  className="reset-button-border-and-padding h-12 w-12 rounded-full"
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
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={handleCreateModalClose}
        onSubmit={handleCreateModalSubmit}
      />
      <UpdateProjectModal
        isOpen={isUpdateModalOpen}
        onClose={handleUpdateModalClose}
        onUpdate={handleUpdateModalSubmit}
        initialData={editingProject ?? { title: '', description: '', teams: [] }}
        userPermissions={user.permissions}
      />
    </div>
  );
};

export default DashboardLayout;
