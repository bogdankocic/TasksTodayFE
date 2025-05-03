import React, { useState, useEffect } from 'react';

interface Team {
  id: number;
  title: string;
  project_id: number;
  created_at: string;
  // Add other team properties as needed
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

  React.useEffect(() => {
    if (isOpen) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setTeams(initialData.teams || []);
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

  const handleDeleteTeam = (teamId: number) => {
    alert(`Delete team ${teamId}`);
  };

  const handleCreateTeam = () => {
    alert('Create new team');
  };

  const handleUpdateTeamName = (teamId: number, newTitle: string) => {
    alert(`Update team ${teamId} name to ${newTitle}`);
    // Here you would call the API endpoint to update the team name
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
                      onClick={() => handleAddMember(team.id)}
                      className={`cursor-pointer p-1 rounded hover:bg-gray-100 ${!userPermissions.can_add_member ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title="Add Member"
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) => { if (e.key === 'Enter') handleAddMember(team.id); }}
                    >
                      <img src="/images/add-user.png" alt="Add Member" className="h-5 w-5" />
                    </div>
                    <div
                      onClick={() => handleRemoveMember(team.id)}
                      className={`cursor-pointer p-1 rounded hover:bg-gray-100 ${!userPermissions.can_delete_team ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title="Remove Member"
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) => { if (e.key === 'Enter') handleRemoveMember(team.id); }}
                    >
                      <img src="/images/remove-user.png" alt="Remove Member" className="h-5 w-5" />
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
              <div className="border rounded p-3 flex items-center justify-center cursor-pointer hover:bg-gray-100" onClick={handleCreateTeam}>
                <span className="text-2xl font-bold">+</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
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
        </form>
      </div>
    </div>
  );
};

export default UpdateProjectModal;
