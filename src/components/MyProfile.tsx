import React, { useState, useEffect, ChangeEvent, FormEvent, useRef } from 'react';
import { useAuth } from './AuthContext';
import apiService from '../api/apiService';
import ProfilePhotoInput from './ProfilePhotoInput';

interface Karma {
  current: number;
  required: number;
  currentLevel: string;
  currentLevelNumber: number;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  favicon: string;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_photo?: string;
  karma: Karma;
  achievements: Achievement[];
  tasks_completed_count: number;
  login_strike: number;
  login_after_hours_count: number;
  is_verified: number;
  role_id: number;
  teamrole: string;
  created_at: string;
}

const MyProfile: React.FC = () => {
  const { user, loading } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setProfilePhoto(URL.createObjectURL(selectedFile));
    }
  };

  useEffect(() => {
    if (!loading && user) {
      setFirstName(user.first_name);
      setLastName(user.last_name);
      setProfilePhoto(user.profile_photo || '');
    }
  }, [loading, user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    const formData = new FormData();
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    if (file) {
      formData.append('profile_photo', file);
    }
    
    try {
      await apiService.selfUpdate(formData);
      window.location.reload();
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 text-lg">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 text-lg">No user data available.</div>
      </div>
    );
  }

  const progressPercent = Math.min(
    100,
    (user.karma.current / user.karma.required) * 100
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow flex space-x-8">
      <div className="flex-1">
        <h2 className="text-2xl font-semibold mb-4 text-center">My Profile</h2>
        <ProfilePhotoInput
          profilePhoto={profilePhoto}
          userProfilePhoto={user.profile_photo}
          fileInputRef={fileInputRef}
          handleFileSelect={handleFileSelect}
          onFileChange={onFileChange}
        />
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row md:space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setFirstName(e.target.value)
                }
                className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setLastName(e.target.value)
                }
                className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="space-y-2 mb-6">
            <div>
              <span className="font-medium">Email:</span> {user.email}
            </div>
            <div>
              <span className="font-medium">Tasks Completed:</span> {user.tasks_completed_count}
            </div>
            <div>
              <span className="font-medium">Login Strike:</span> {user.login_strike}
            </div>
            <div>
              <span className="font-medium">After Hours Logins:</span> {user.login_after_hours_count}
            </div>
            <div>
              <span className="font-medium">Verified:</span> {user.is_verified ? 'Yes' : 'No'}
            </div>
            <div>
              <span className="font-medium">Role ID:</span> {user.role_id}
            </div>
            <div>
              <span className="font-medium">Team Role:</span> {user.teamrole}
            </div>
            <div>
              <span className="font-medium">Created At:</span> {new Date(user.created_at).toLocaleString()}
            </div>
          </div>
          <button
            type="submit"
            disabled={submitLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {submitLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="w-80 p-6 bg-gray-50 rounded-lg shadow flex flex-col items-center space-y-6">
        <h3 className="text-xl font-semibold mb-2">Karma</h3>
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-tr from-yellow-400 to-yellow-600 text-yellow-900 font-bold rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
            {user.karma.currentLevelNumber}
          </div>
          <div className="text-lg font-medium">{user.karma.currentLevel}</div>
        </div>
        <div className="w-full">
          <div className="h-4 bg-gray-300 rounded-full overflow-hidden">
            <div
              className="h-4 bg-yellow-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm mt-1 text-gray-600 font-medium">
            <span>{user.karma.current} /</span>
            <span>{user.karma.required}</span>
          </div>
        </div>

        <div className="w-full mt-6">
          <h4 className="text-lg font-semibold mb-3 border-b border-gray-300 pb-1">Achievements</h4>
          <ul className="space-y-3 max-h-96 overflow-y-auto">
            {user.achievements.map((achievement) => (
              <li key={achievement.id} className="flex items-center space-x-3">
                <img
                  src={achievement.favicon}
                  alt={achievement.title}
                  className="w-8 h-8 rounded-md object-cover shadow"
                />
                <div>
                  <div className="font-medium text-gray-800">{achievement.title}</div>
                  <div className="text-sm text-gray-600">{achievement.description}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
