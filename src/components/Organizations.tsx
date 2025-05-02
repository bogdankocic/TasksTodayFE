import React, { useEffect, useState } from 'react';
import apiService from '../api/apiService';
import ConfirmModal from './ConfirmModal';

interface Organization {
  id: number;
  name: string;
}

const Organizations: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [newOrgName, setNewOrgName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New state for confirm modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [orgIdToDelete, setOrgIdToDelete] = useState<number | null>(null);

  const fetchOrganizations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getOrganizations();
      setOrganizations(response.data);
    } catch (err) {
      setError('Failed to fetch organizations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleDelete = async (id: number) => {
    setOrgIdToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (orgIdToDelete === null) return;
    setError(null);
    try {
      await apiService.deleteOrganization(orgIdToDelete);
      setOrganizations((prev) => prev.filter((org) => org.id !== orgIdToDelete));
    } catch (err) {
      setError('Failed to delete organization.');
    } finally {
      setIsConfirmModalOpen(false);
      setOrgIdToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsConfirmModalOpen(false);
    setOrgIdToDelete(null);
  };

  const handleCreate = async () => {
    if (!newOrgName.trim()) {
      setError('Organization name cannot be empty.');
      return;
    }
    setError(null);
    try {
      const response = await apiService.createOrganization({ name: newOrgName.trim() });
      setOrganizations((prev) => [...prev, response.data]);
      setNewOrgName('');
    } catch (err) {
      setError('Failed to create organization.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-semibold text-gray-900 mb-6">Organizations</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-6 flex space-x-3">
        <input
          type="text"
          placeholder="New organization name"
          value={newOrgName}
          onChange={(e) => setNewOrgName(e.target.value)}
          className="flex-grow border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Create
        </button>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading organizations...</p>
      ) : (
        <ul className="space-y-4">
          {organizations.map((org) => (
            <li
              key={org.id}
              className="flex justify-between items-center border border-gray-200 rounded p-4"
            >
              <span className="text-gray-800 font-medium">{org.name}</span>
              <button
                onClick={() => handleDelete(org.id)}
                className="text-red-600 hover:text-red-800 transition"
                aria-label={`Delete organization ${org.name}`}
              >
                Delete
              </button>
            </li>
          ))}
          {organizations.length === 0 && (
            <li className="text-gray-600">No organizations found.</li>
          )}
        </ul>
      )}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        message="Are you sure you want to delete this organization?"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

export default Organizations;
