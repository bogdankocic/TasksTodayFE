import React, { useState, useEffect } from 'react';
import apiService from '../api/apiService';

interface User {
  id: number;
  name: string;
  profile_photo: string | null;
}

interface UpdateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: { id: number; name: string; description: string }) => void;
  initialData: { id: number; name: string; description: string; performer?: User; contributor?: User; team_id?: number } | null;
}

const UpdateTaskModal: React.FC<UpdateTaskModalProps> = ({ isOpen, onClose, onUpdate, initialData }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [performerDropdownOpen, setPerformerDropdownOpen] = useState(false);
  const [contributorDropdownOpen, setContributorDropdownOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [selectedPerformer, setSelectedPerformer] = useState<User | null>(null);
  const [selectedContributor, setSelectedContributor] = useState<User | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description);
      setSelectedPerformer(initialData.performer || null);
      setSelectedContributor(initialData.contributor || null);
      if (initialData.team_id) {
        fetchTeamMembers(initialData.team_id);
      }
    }
  }, [initialData]);

  useEffect(() => {
    if ((performerDropdownOpen || contributorDropdownOpen) && initialData?.team_id) {
      console.log('Fetching team members for team_id:', initialData.team_id);
      fetchTeamMembers(initialData.team_id);
    }
  }, [performerDropdownOpen, contributorDropdownOpen, initialData]);

  const fetchTeamMembers = async (teamId: number) => {
    try {
      const response = await apiService.getTeamMembers(teamId);
      if (Array.isArray(response.data)) {
        setTeamMembers(response.data);
      } else {
        setTeamMembers([]);
      }
    } catch (error) {
      console.error('Failed to fetch team members', error);
    }
  };

  const handleAssignPerformer = async (user: User) => {
    if (!initialData) return;
    try {
      await apiService.assignPerformer(initialData.id, user.id);
      setSelectedPerformer(user);
      setPerformerDropdownOpen(false);
    } catch (error) {
      console.error('Failed to assign performer', error);
    }
  };

  const handleAssignContributor = async (user: User) => {
    if (!initialData) return;
    try {
      await apiService.assignContributor(initialData.id, user.id);
      setSelectedContributor(user);
      setContributorDropdownOpen(false);
    } catch (error) {
      console.error('Failed to assign contributor', error);
    }
  };

  if (!isOpen || !initialData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    await onUpdate({ id: initialData.id, name, description });
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
        <h3 className="text-xl font-semibold mb-4">Update Task</h3>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2 font-medium" htmlFor="task-name">Name</label>
          <input
            id="task-name"
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={submitting}
          />
          <label className="block mb-2 font-medium" htmlFor="task-description">Description</label>
          <textarea
            id="task-description"
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={submitting}
          />
          <div className="flex space-x-8 mb-6 items-center">
            {/* Performer */}
            <div className="flex flex-col items-center">
              <label className="mb-1 text-sm font-medium text-gray-700">Performer</label>
              <div
                className="w-14 h-14 rounded-full overflow-hidden border border-gray-300 cursor-pointer"
                onClick={() => setPerformerDropdownOpen(!performerDropdownOpen)}
                title="Select Performer"
              >
                <img
                  src={selectedPerformer?.profile_photo || '/images/placeholder.png'}
                  alt="Performer"
                  className="w-full h-full object-cover"
                />
              </div>
              {performerDropdownOpen && (
                <div className="absolute z-10 bg-white border border-gray-300 rounded shadow mt-2 max-h-48 overflow-y-auto w-48">
                  {teamMembers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center p-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleAssignPerformer(user)}
                    >
                      <img
                        src={user.profile_photo || '/images/placeholder.png'}
                        alt={user.name}
                        className="w-8 h-8 rounded-full mr-3 object-cover"
                      />
                      <span>{user.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Contributor */}
            <div className="flex flex-col items-center">
              <label className="mb-1 text-sm font-medium text-gray-700">Contributor</label>
              <div
                className="w-14 h-14 rounded-full overflow-hidden border border-gray-300 cursor-pointer"
                onClick={() => setContributorDropdownOpen(!contributorDropdownOpen)}
                title="Select Contributor"
              >
                <img
                  src={selectedContributor?.profile_photo || '/images/placeholder.png'}
                  alt="Contributor"
                  className="w-full h-full object-cover"
                />
              </div>
              {contributorDropdownOpen && (
                <div className="absolute z-10 bg-white border border-gray-300 rounded shadow mt-2 max-h-48 overflow-y-auto w-48">
                  {teamMembers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center p-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleAssignContributor(user)}
                    >
                      <img
                        src={user.profile_photo || '/images/placeholder.png'}
                        alt={user.name}
                        className="w-8 h-8 rounded-full mr-3 object-cover"
                      />
                      <span>{user.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateTaskModal;
