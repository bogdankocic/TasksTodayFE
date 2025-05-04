import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiService from '../api/apiService';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_verified: boolean;
}

const TeamMembersPage: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const [members, setMembers] = useState<User[]>([]);
  const [projectMembers, setProjectMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [projectId, setProjectId] = useState<number | null>(null);

  useEffect(() => {
    if (!teamId) {
      console.log('No teamId param');
      return;
    }
    const fetchTeamAndMembers = async () => {
      try {
        setLoading(true);
        const teamResponse = await apiService.getTeam(Number(teamId));
        console.log('Fetched team data:', teamResponse.data);
        setProjectId(teamResponse.data.project_id || null);

        const membersResponse = await apiService.getTeamMembers(Number(teamId));
        console.log('Fetched team members:', membersResponse.data);
        setMembers(membersResponse.data || []);
      } catch (err) {
        setError('Failed to load team members.');
      } finally {
        setLoading(false);
      }
    };
    fetchTeamAndMembers();
  }, [teamId]);

  useEffect(() => {
    const fetchProjectMembers = async () => {
      try {
        if (!projectId) return;
        const response = await apiService.getProjectMembers(projectId);
        setProjectMembers(response.data);
      } catch (err) {
        console.error('Failed to load project members.');
      }
    };
    fetchProjectMembers();
  }, [projectId]);

  const handleAddMember = async () => {
    if (!teamId || selectedUserId === null) return;
    try {
      await apiService.addTeamMember(Number(teamId), selectedUserId);
      const response = await apiService.getTeamMembers(Number(teamId));
      setMembers(response.data);
      setIsModalOpen(false);
      setSelectedUserId(null);
      alert('Member added successfully');
    } catch (err) {
      alert('Failed to add member');
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!teamId) return;
    try {
      await apiService.removeTeamMember(Number(teamId), memberId);
      const response = await apiService.getTeamMembers(Number(teamId));
      setMembers(response.data);
      alert('Member removed successfully');
    } catch (err) {
      alert('Failed to remove member');
    }
  };

  if (loading) return <div>Loading team members...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Team Members</h1>
      <div className="flex justify-end mb-4">
        <img
          onClick={() => setIsModalOpen(true)}
          title="Add Member"
          src="/images/add-user.png"
          alt="Add Member"
          className="h-8 w-8 cursor-pointer rounded hover:bg-gray-100 p-1"
        />
      </div>
      <ul className="space-y-4">
        {members.map((member) => (
          <li key={member.id} className="flex items-center justify-between border rounded p-3">
            <div className="flex items-center space-x-3">
              {member.is_verified ? (
                <span className="h-3 w-3 rounded-full bg-green-500 inline-block order-first" title="Verified"></span>
              ) : (
                <span className="h-3 w-3 rounded-full bg-red-500 inline-block order-first" title="Not Verified"></span>
              )}
              <p className="font-medium flex-1 text-center">
                {member.first_name || member.last_name
                  ? `${member.first_name} ${member.last_name}`
                  : member.email}
              </p>
            </div>
            <div className="flex space-x-3">
              <img
                onClick={() => handleRemoveMember(member.id)}
                title="Remove Member"
                src="/images/remove-user.png"
                alt="Remove Member"
                className="h-7 w-7 cursor-pointer rounded hover:bg-gray-100 p-1"
              />
            </div>
          </li>
        ))}
      </ul>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add Member to Team</h2>
            <select
              className="w-full border border-gray-300 rounded p-2 mb-4"
              value={selectedUserId ?? ''}
              onChange={(e) => setSelectedUserId(Number(e.target.value))}
            >
              <option value="" disabled>
                Select a user
              </option>
              {projectMembers
                .filter(
                  (user) => !members.some((member) => member.id === user.id)
                )
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email}
                  </option>
                ))}
            </select>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                disabled={selectedUserId === null}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMembersPage;
