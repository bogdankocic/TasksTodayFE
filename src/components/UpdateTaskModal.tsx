import React, { useState, useEffect } from 'react';
import apiService from '../api/apiService';

interface User {
  id: number;
  name: string;
  profile_photo: string | null;
}

interface File {
  id: number;
  title: string;
  path: string;
}

interface UpdateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: { id: number; name: string; description: string }) => void;
  initialData: { id: number; name: string; description: string; performer?: User; contributor?: User; team_id?: number; files?: File[] } | null;
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
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description);
      setSelectedPerformer(initialData.performer || null);
      setSelectedContributor(initialData.contributor || null);
      setFiles(initialData.files || []);
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

          {/* Files upload and list */}
          <div className="mb-4">
            <label className="block mb-2 font-medium">Files</label>
            <div className="flex items-center space-x-2 mb-2">
              <button
                type="button"
                className="px-2 py-0.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
                onClick={() => document.getElementById('file-upload-input')?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload File'}
              </button>
              <input
                type="file"
                id="file-upload-input"
                className="hidden"
                onChange={async (e) => {
                  if (!e.target.files || e.target.files.length === 0 || !initialData) return;
                  const file = e.target.files[0];
                  setUploading(true);
                  try {
                    const formData = new FormData();
                    formData.append('type', 'task');
                    formData.append('id', initialData.id.toString());
                    formData.append('title', file.name);
                    formData.append('file', file);
                    const response = await apiService.uploadFile(formData);
                    if (response.data) {
                      setFiles((prev) => [...prev, response.data]);
                    }
                  } catch (error) {
                    console.error('File upload failed', error);
                  } finally {
                    setUploading(false);
                    if (e.target) e.target.value = '';
                  }
                }}
              />
            </div>
            <div className="text-sm text-gray-700">
                {files.length > 0 ? (
                  files.map((file, index) => (
                    <span key={file.id} className="inline-flex items-center">
                      <span
                        className="inline-flex items-center cursor-pointer hover:underline"
                        onClick={async () => {
                          try {
                            const response = await apiService.downloadTaskFile(file.id);
                            const blob = new Blob([response.data]);
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = file.title;
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            window.URL.revokeObjectURL(url);
                          } catch (error) {
                            console.error('Download failed', error);
                          }
                        }}
                      >
                        <img src="/images/file.png" alt="file icon" className="w-4 h-4 mr-1" />
                        {file.title}
                      </span>
                      <img
                        src="/images/bin.png"
                        alt="delete file"
                        className="w-4 h-4 ml-2 cursor-pointer hover:opacity-70"
                        onClick={async () => {
                          if (!initialData) return;
                          try {
                            await apiService.deleteFile(file.id, 'task');
                            // Remove file from state
                            setFiles((prev) => prev.filter((f) => f.id !== file.id));
                          } catch (error) {
                            console.error('Failed to delete file', error);
                          }
                        }}
                      />
                      {index < files.length - 1 && <span>,&nbsp;</span>}
                    </span>
                  ))
                ) : (
                  <span>No files uploaded</span>
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
