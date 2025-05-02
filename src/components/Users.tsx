import React, { useEffect, useState } from 'react';
import apiService from '../api/apiService';

interface User {
  id: number | string;
  first_name: string;
  last_name: string;
  email: string;
  is_verified: number;
  teamrole: string | null;
  karma: {
    currentLevel: string;
  };
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // New state for modal and form inputs
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteTeamRole, setInviteTeamRole] = useState('');
  const [inviteOrganizationId, setInviteOrganizationId] = useState<string | number | null>(null);
  const [organizations, setOrganizations] = useState<{ id: number | string; name: string }[]>([]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getUsers();
      console.log('Users API response:', response.data);
      setUsers(response.data);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await apiService.getSelf();
      setCurrentUser(response.data);
      if (response.data.role_id === 1) {
        const orgResponse = await apiService.getOrganizations();
        setOrganizations(orgResponse.data);
      }
    } catch {
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
  }, []);

  // Open modal instead of prompt
  const handleInviteOpen = () => {
    setInviteEmail('');
    setInviteTeamRole('');
    setInviteOrganizationId(currentUser?.role_id === 1 ? null : currentUser?.organization_id || null);
    setIsInviteModalOpen(true);
  };

  const handleInviteClose = () => {
    setIsInviteModalOpen(false);
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Current user data not loaded');
      return;
    }
    if (!inviteEmail) {
      alert('Email is required');
      return;
    }
    try {
      if (currentUser.role_id === 1) {
        if (!inviteOrganizationId) {
          alert('Organization is required for role_id 1');
          return;
        }
        await apiService.inviteUser({
          email: inviteEmail,
          organization_id: inviteOrganizationId,
        });
      } else if (currentUser.role_id === 2) {
        if (!inviteTeamRole) {
          alert('Team role is required for role_id 2');
          return;
        }
        await apiService.inviteUser({
          email: inviteEmail,
          organization_id: currentUser.organization_id,
          team_role: inviteTeamRole,
        });
      } else {
        await apiService.inviteUser({ email: inviteEmail });
      }
      alert('Invitation sent');
      setIsInviteModalOpen(false);
    } catch {
      alert('Failed to send invitation');
    }
  };

  const handleDelete = async (id: number | string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await apiService.deleteUser(id);
        alert('User deleted');
        fetchUsers();
      } catch {
        alert('Failed to delete user');
      }
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading users...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
        <button
          onClick={handleInviteOpen}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
        >
          Invite New User
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2 border-b">First Name</th>
              <th className="text-left px-4 py-2 border-b">Last Name</th>
              <th className="text-left px-4 py-2 border-b">Email</th>
              <th className="text-center px-4 py-2 border-b">Verified</th>
              <th className="text-left px-4 py-2 border-b">Team Role</th>
              <th className="text-left px-4 py-2 border-b">Karma Level</th>
              <th className="text-center px-4 py-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-100">
                <td className="px-4 py-2 border-b align-middle">{user.first_name}</td>
                <td className="px-4 py-2 border-b align-middle">{user.last_name}</td>
                <td className="px-4 py-2 border-b align-middle">{user.email}</td>
                <td className="px-4 py-2 border-b text-center align-middle">
                  <span
                    className={`inline-block w-3 h-3 rounded-full ${
                      user.is_verified === 1 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    title={user.is_verified === 1 ? 'Verified' : 'Not Verified'}
                  />
                </td>
                <td className="px-4 py-2 border-b align-middle">{user.teamrole ?? 'N/A'}</td>
                <td className="px-4 py-2 border-b align-middle">{user.karma.currentLevel}</td>
                <td className="px-4 py-2 border-b text-center align-middle">
                <button
                      onClick={() => handleDelete(user.id)}
                      disabled={currentUser?.id === user.id}
                      className={`text-red-600 hover:text-red-800 font-semibold ${currentUser?.id === user.id ? 'disabled:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none' : null}`}
                      aria-label={`Delete user ${user.first_name} ${user.last_name}`}
                    >
                      Delete
                </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Invite New User</h2>
            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {currentUser?.role_id === 1 && (
                <div>
                  <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
                    Organization
                  </label>
                  <select
                    id="organization"
                    value={inviteOrganizationId ?? ''}
                    onChange={(e) => setInviteOrganizationId(e.target.value)}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="" disabled>
                      Select organization
                    </option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {currentUser?.role_id === 2 && (
                <div>
                  <label htmlFor="teamRole" className="block text-sm font-medium text-gray-700">
                    Team Role
                  </label>
                  <select
                    id="teamRole"
                    value={inviteTeamRole}
                    onChange={(e) => setInviteTeamRole(e.target.value)}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="" disabled>
                      Select team role
                    </option>
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                    <option value="user">User</option>
                  </select>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleInviteClose}
                  className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
