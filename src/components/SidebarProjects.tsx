import React from 'react';

interface Project {
  id: number;
  title: string;
  canUpdate: boolean;
  canDelete: boolean;
}

interface SidebarProjectsProps {
  projects: Project[];
  canCreate: boolean;
  onCreate: () => void;
  onUpdate: (projectId: number) => void;
  onDelete: (projectId: number) => void;
}

const SidebarProjects: React.FC<SidebarProjectsProps> = ({
  projects,
  canCreate,
  onCreate,
  onUpdate,
  onDelete,
}) => {
  return (
    <div className="mb-6 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase px-4 pl-0">My Projects</h3>
        {canCreate && (
          <button
            onClick={onCreate}
            className="text-gray-500 hover:text-gray-700 focus:outline-none h-6 w-6 flex items-center justify-center rounded text-lg font-bold"
            aria-label="Create new project"
          >
            +
          </button>
        )}
      </div>
      <ul>
        {projects.map((project) => (
          <li
            key={project.id}
            className="flex items-center justify-between px-4 py-1 hover:bg-gray-100 rounded"
          >
            <span className="text-gray-700">{project.title}</span>
            <div className="flex space-x-2">
              {project.canUpdate && (
                <img
                  src="/images/update.png"
                  alt="Update"
                  onClick={() => onUpdate(project.id)}
                  className="cursor-pointer h-5 w-5 hover:opacity-75"
                  aria-label={`Update project ${project.title}`}
                />
              )}
              {project.canDelete && (
                <img
                  src="/images/bin.png"
                  alt="Delete"
                  onClick={() => onDelete(project.id)}
                  className="cursor-pointer h-5 w-5 hover:opacity-75"
                  aria-label={`Delete project ${project.title}`}
                />
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SidebarProjects;
