import React, { useState, useEffect } from 'react';
import apiService from '../api/apiService';

interface Team {
  id: number;
  title: string;
  project_id: number;
  created_at: string;
}

interface UpdateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: { title: string; description: string }) => void;
  initialData: { title: string; description: string; teams: Team[] };
  userPermissions: {
    can_add_member: boolean;
    can_delete_team: boolean;
  };
}

const UpdateProjectModal: React.FC<UpdateProjectModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
  initialData,
  userPermissions,
}) => {
  const [title, setTitle] = React.useState(initialData.title);
  const [description, setDescription] = React.useState(initialData.description);
  const [teams, setTeams] = React.useState(initialData.teams || []);
  const [newTeamTitle, setNewTeamTitle] = React.useState('');
  const [isCreatingTeam, setIsCreatingTeam] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setTeams(initialData.teams || []);
      setNewTeamTitle('');
      setIsCreatingTeam(false);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ title, description });
  };

  const handleAddMember = (teamId: number) => {
    alert(`Add member to team ${teamId}`);
  };

  const handleRemoveMember = (teamId: number) => {
    alert(`Remove member from team ${teamId}`);
  };

  const handleDeleteTeam = async (teamId: number) => {
    try {
      await apiService.deleteTeam(teamId);
      setTeams((prevTeams) => prevTeams.filter((t) => t.id !== teamId));
    } catch (error) {
      throw error;
    }
  };

  const handleCreateTeamClick = () => {
    setIsCreatingTeam(true);
  };

  const handleCreateTeamCancel = () => {
    setIsCreatingTeam(false);
    setNewTeamTitle('');
  };

  const handleCreateTeamSubmit = async () => {
    if (!newTeamTitle.trim()) return;
    try {
      const response = await apiService.createTeam({
        title: newTeamTitle.trim(),
        project_id: initialData.teams.length > 0 ? initialData.teams[0].project_id : undefined,
      });
      const createdTeam = response.data;
      setTeams((prev) => [...prev, createdTeam]);
      setNewTeamTitle('');
      setIsCreatingTeam(false);
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateTeamName = async (teamId: number, newTitle: string) => {
    if (!newTitle.trim()) return;
    try {
      await apiService.updateTeamName(teamId, { title: newTitle.trim() });
      setTeams((prevTeams) =>
        prevTeams.map((t) => (t.id === teamId ? { ...t, title: newTitle.trim() } : t))
      );
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 overflow-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Update Project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div>
            <div className="flex justify-end space-x-2 mb-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Update
              </button>
            </div>
            <h3 className="text-lg font-semibold mb-2">Teams</h3>
            <div className="space-y-2">
              {teams.map((team) => (
                <div key={team.id} className="border rounded p-3 flex flex-col space-y-2">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={team.title}
                        onChange={(e) => {
                          const newTitle = e.target.value;
                          setTeams((prevTeams) =>
                            prevTeams.map((t) =>
                              t.id === team.id ? { ...t, title: newTitle } : t
                            )
                          );
                        }}
                        className="border border-gray-300 rounded p-1 text-sm flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateTeamName(team.id, team.title)}
                        className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        title="Submit Team Name"
                      >
                        Update
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">Created at: {new Date(team.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex space-x-2">
                    <div
                      className={`cursor-pointer p-1 rounded hover:bg-gray-100 ${(!userPermissions.can_add_member && !userPermissions.can_delete_team) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title="Users"
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        window.location.href = `/teams/${team.id}/members`;
                      }}
                      onKeyPress={(e) => { if (e.key === 'Enter') {
                        window.location.href = `/teams/${team.id}/members`;
                      }}}
                    >
                      <img src="/images/users.png" alt="Users" className="h-5 w-5" />
                    </div>
                    <div
                      onClick={() => handleDeleteTeam(team.id)}
                      className={`cursor-pointer p-1 rounded hover:bg-gray-100 ${!userPermissions.can_delete_team ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title="Delete Team"
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) => { if (e.key === 'Enter') handleDeleteTeam(team.id); }}
                    >
                      <img src="/images/bin.png" alt="Delete Team" className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              ))}
              {isCreatingTeam ? (
                <div className="border rounded p-3 flex flex-col space-y-2">
                  <div className="flex flex-col space-y-1">
                    <input
                      type="text"
                      value={newTeamTitle}
                      onChange={(e) => setNewTeamTitle(e.target.value)}
                      placeholder="New team title"
                      className="border border-gray-300 rounded p-1 text-sm flex-1 mb-6"
                    />
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={handleCreateTeamCancel}
                        className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400 text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateTeamSubmit}
                        className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      >
                        Create
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="border rounded p-3 flex items-center justify-center cursor-pointer hover:bg-gray-100"
                  onClick={handleCreateTeamClick}
                >
                  <span className="text-2xl font-bold">+</span>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProjectModal;
