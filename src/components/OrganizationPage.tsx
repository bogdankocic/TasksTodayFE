import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import apiService from '../api/apiService';

interface OrganizationData {
  id: number;
  name: string;
  description?: string;
  [key: string]: any;
}

const OrganizationPage: React.FC = () => {
  const [organization, setOrganization] = useState<OrganizationData | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [formData, setFormData] = useState<{ name: string; description: string }>({
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const userResponse = await apiService.getSelf();
        setCurrentUser(userResponse.data);
        const orgData = userResponse.data.organization;
        if (!orgData) {
          setError('Organization data not found.');
          return;
        }
        setOrganization(orgData);
        setFormData({
          name: orgData.name || '',
          description: orgData.description || '',
        });
      } catch {
        setError('Failed to load organization data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!organization) return;
    setSaving(true);
    setError(null);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      await apiService.updateOrganization(organization.id, data);
      setOrganization({ ...organization, ...formData });
    } catch {
      setError('Failed to update organization.');
    } finally {
      setSaving(false);
    }
  };

  const canUpdate = currentUser?.permissions?.can_update_organization;

  if (loading) {
    return <p className="text-gray-600">Loading organization data...</p>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded mb-4">
        {error}
      </div>
    );
  }

  if (!organization) {
    return <p className="text-gray-600">No organization to display.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-semibold text-gray-900 mb-6">Organization Details</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            disabled={!canUpdate || saving}
            required
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              !canUpdate ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            disabled={!canUpdate || saving}
            rows={4}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              !canUpdate ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
          />
        </div>
        {canUpdate && (
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </form>
    </div>
  );
};

export default OrganizationPage;
