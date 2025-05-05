import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import apiService from '../api/apiService';
import ProfilePhotoInput from './ProfilePhotoInput';

interface OrganizationData {
  id: number;
  name: string;
  description?: string;
  [key: string]: any;
}

const OrganizationPage: React.FC = () => {
  const [organization, setOrganization] = useState<OrganizationData | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [formData, setFormData] = useState<{ name: string; email: string }>({
    name: '',
    email: '',
  });

  // Add state for profile photo and file
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
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
          email: orgData.email || '',
        });
        setProfilePhoto(orgData.profile_photo || '');
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
      data.append('email', formData.email);
      if (file) {
        data.append('profile_photo', file);
      }
      await apiService.updateOrganization(organization.id, data);
      setOrganization({ ...organization, ...formData });
      window.location.reload();
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
      <h2 className="text-2xl font-semibold mb-4 text-center">Organization Details</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <ProfilePhotoInput
          profilePhoto={profilePhoto}
          userProfilePhoto={organization?.profile_photo}
          fileInputRef={fileInputRef}
          handleFileSelect={() => fileInputRef.current?.click()}
          onFileChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              const selectedFile = e.target.files[0];
              setFile(selectedFile);
              setProfilePhoto(URL.createObjectURL(selectedFile));
            }
          }}
        />
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
            className={`mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 h-12 px-3 ${
              !canUpdate ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={!canUpdate || saving}
            required
            className={`mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 h-12 px-3 ${
              !canUpdate ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
          />
        </div>
        {canUpdate && (
          <button
            type="submit"
            disabled={saving}
            className="bg-black text-white px-6 py-3 rounded hover:bg-gray-900 transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </form>
    </div>
  );
};

export default OrganizationPage;
