import React, { useState, useEffect } from 'react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; description: string; team_id: number | null }) => void;
  teams: { id: number; name: string }[];
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, onCreate, teams }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [teamId, setTeamId] = useState<number | null>(teams.length > 0 ? teams[0].id : null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (teams.length > 0) {
      setTeamId(teams[0].id);
    }
  }, [teams]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    await onCreate({ name, description, team_id: teamId });
    setSubmitting(false);
    setName('');
    setDescription('');
    setTeamId(teams.length > 0 ? teams[0].id : null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">Create New Task</h3>
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
          <label className="block mb-2 font-medium" htmlFor="task-team">Team</label>
          <select
            id="task-team"
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={teamId ?? ''}
            onChange={(e) => setTeamId(Number(e.target.value))}
            disabled={submitting}
          >
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
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
              {submitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
