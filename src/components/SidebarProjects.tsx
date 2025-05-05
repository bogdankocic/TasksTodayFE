import React, { useState } from 'react';
import apiService from '../api/apiService';

interface Project {
  id: number;
  title: string;
  canUpdate: boolean;
  canDelete: boolean;
}

interface File {
  id: number;
  title: string;
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
  const [expandedProjects, setExpandedProjects] = useState<{ [key: number]: boolean }>({});
  const [projectFiles, setProjectFiles] = useState<{ [key: number]: File[] }>({});

  const toggleExpand = async (projectId: number) => {
    const isExpanded = expandedProjects[projectId];
    if (isExpanded) {
      setExpandedProjects((prev) => ({ ...prev, [projectId]: false }));
    } else {
      // Fetch files if not already fetched
      if (!projectFiles[projectId]) {
        try {
          const response = await apiService.getProjectFiles(projectId);
          if (response.status === 200) {
            const files: File[] = response.data;
            setProjectFiles((prev) => ({ ...prev, [projectId]: files }));
          } else {
            console.error('Failed to fetch project files');
          }
        } catch (error) {
          console.error('Error fetching project files:', error);
        }
      }
      setExpandedProjects((prev) => ({ ...prev, [projectId]: true }));
    }
  };

  const deleteFile = async (fileId: number, projectId: number) => {
    try {
      const response = await apiService.deleteFile(fileId, 'project');
      if (response.status === 200) {
        // Remove file from state
        setProjectFiles((prev) => ({
          ...prev,
          [projectId]: prev[projectId].filter((file) => file.id !== fileId),
        }));
      } else {
        console.error('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const downloadFile = async (fileId: number, fileName: string) => {
    try {
      const response = await apiService.downloadProjectFile(fileId);
      if (response.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Failed to download file');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

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
          <li key={project.id} className="mb-8">
            <div className="flex items-center justify-between px-4 py-1 hover:bg-gray-100 rounded">
              <img
                src="/images/arrow.png"
                alt={expandedProjects[project.id] ? 'Collapse project files' : 'Expand project files'}
                onClick={() => toggleExpand(project.id)}
                className={`mr-2 cursor-pointer select-none transition-transform duration-200 ${
                  expandedProjects[project.id] ? 'rotate-90' : ''
                }`}
                style={{ width: '12px', height: '12px' }}
              />
              <a
                href={`/tasks?project_id=${project.id}`}
                className="text-blue-600 hover:underline flex-1"
                aria-label={`View tasks for project ${project.title}`}
              >
                {project.title}
              </a>
              <div className="flex space-x-2 items-center">
                <label htmlFor={`file-upload-${project.id}`} className="cursor-pointer">
                  <img
                    src="/images/add-file.png"
                    alt="Add file"
                    className="h-5 w-5 hover:opacity-75"
                    aria-label={`Add file to project ${project.title}`}
                  />
                </label>
                <input
                  id={`file-upload-${project.id}`}
                  type="file"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append('type', 'project');
                    formData.append('id', project.id.toString());
                    formData.append('title', file.name);
                    formData.append('file', file);
                    try {
                      const response = await apiService.uploadFile(formData);
                      if (response.status === 200 || response.status === 201) {
                        const newFile: File = response.data;
                        setProjectFiles((prev) => {
                          const existingFiles = prev[project.id] || [];
                          return {
                            ...prev,
                            [project.id]: [...existingFiles, newFile],
                          };
                        });
                      } else {
                        console.error('Failed to upload file');
                      }
                    } catch (error) {
                      console.error('Error uploading file:', error);
                    }
                    // Reset input value to allow uploading the same file again if needed
                    e.target.value = '';
                  }}
                />
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
            </div>
            {expandedProjects[project.id] && projectFiles[project.id] && (
              <ul className="pl-8 mt-1 space-y-1">
                {projectFiles[project.id].map((file) => (
                  <li key={file.id} className="flex items-center space-x-2 mt-4">
                    <img src="/images/file.png" alt="File" className="h-4 w-4" />
                    <span
                      className="text-gray-700 text-sm cursor-pointer hover:underline"
                      onClick={() => downloadFile(file.id, file.title)}
                      aria-label={`Download file ${file.title}`}
                    >
                      {file.title}
                    </span>
                    <img
                      src="/images/bin.png"
                      alt="Delete"
                      onClick={() => deleteFile(file.id, project.id)}
                      className="ml-auto h-4 w-4 hover:opacity-75 cursor-pointer"
                      aria-label={`Delete file ${file.title}`}
                    />
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SidebarProjects;
