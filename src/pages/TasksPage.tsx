import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import apiService from '../api/apiService';
import CreateTaskModal from '../components/CreateTaskModal';
import UpdateTaskModal from '../components/UpdateTaskModal';

interface User {
  id: number;
  name: string;
  profile_photo: string | null;
}

interface Task {
  id: number;
  name: string;
  description: string;
  status: 'todo' | 'inprogress' | 'completed';
  complexity: number;
  user_voted?: boolean;
  performer?: User;
  contributor?: User;
  team_id?: number;
  created_at: string;
  updated_at: string;
}

import { useAuth } from '../components/AuthContext';

const TaskCard: React.FC<{
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  canActivateTask: boolean;
  canCompleteTask: boolean;
  onActivate: (taskId: number) => Promise<void>;
  onComplete: (taskId: number) => Promise<void>;
}> = ({ task, onEdit, onDelete, canActivateTask, canCompleteTask, onActivate, onComplete }) => {
  const [isVoting, setIsVoting] = useState(false);
  const [selectedVote, setSelectedVote] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleVoteClick = () => {
    setIsVoting(true);
  };

  const handleVoteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVote(Number(e.target.value));
  };

  const handleVoteSubmit = async () => {
    if (selectedVote === null) return;
    try {
      await apiService.voteTask(task.id, { complexity: selectedVote });
      setIsVoting(false);
      setSelectedVote(null);
      window.location.reload();
    } catch (error) {
      console.error('Failed to submit vote', error);
    }
  };

  const handleActivateClick = async () => {
    setIsProcessing(true);
    try {
      await onActivate(task.id);
    } catch (error) {
      console.error('Failed to activate task', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteClick = async () => {
    setIsProcessing(true);
    try {
      await onComplete(task.id);
    } catch (error) {
      console.error('Failed to complete task', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative bg-white shadow rounded p-4 mb-4 border border-gray-200">
      <div className="absolute top-2 right-2 flex space-x-2">
        <img
          src="/images/editing.png"
          alt="Edit"
          className="w-5 h-5 cursor-pointer"
          title="Edit task"
          onClick={() => onEdit(task)}
        />
        <img
          src="/images/bin.png"
          alt="Delete"
          className="w-5 h-5 cursor-pointer"
          title="Delete task"
          onClick={() => onDelete(task.id)}
        />
      </div>
      <h4 className="font-semibold text-lg mb-1">{task.name}</h4>
      <p className="text-gray-600 text-sm mb-2">{task.description}</p>
      <div className="text-xs text-gray-700 font-bold mb-2 flex items-center space-x-2">
        <span>Complexity: {task.complexity}</span>
        <div>
          {!task.user_voted && !isVoting ? (
            <button
              onClick={handleVoteClick}
              className="ml-4 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              title="Vote"
            >
              Vote
            </button>
          ) : isVoting ? (
            <>
              <select
                value={selectedVote ?? ''}
                onChange={handleVoteChange}
                className="border border-gray-300 rounded px-2 py-1 mr-2"
              >
                <option value="" disabled>
                  Select
                </option>
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
              <button
                onClick={handleVoteSubmit}
                className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                disabled={selectedVote === null}
              >
                Submit
              </button>
            </>
          ) : null}
        </div>
      </div>
      {(task.status === 'todo' && canActivateTask) && (
        <button
          onClick={handleActivateClick}
          disabled={isProcessing}
          className="mt-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        >
          {isProcessing ? 'Activating...' : 'Activate'}
        </button>
      )}
      {(task.status === 'inprogress' && canCompleteTask) && (
        <button
          onClick={handleCompleteClick}
          disabled={isProcessing}
          className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {isProcessing ? 'Completing...' : 'Complete'}
        </button>
      )}
      <div className="text-xs text-gray-400 relative mt-2">
        Created: {new Date(task.created_at).toLocaleDateString()}
        <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full overflow-hidden border border-gray-300">
          <img
            src={task.performer?.profile_photo || '/images/placeholder.png'}
            alt="Performer"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

const EmptyTaskCard: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-white shadow rounded p-4 mb-4 border border-dashed border-gray-400 flex items-center justify-center text-gray-400 hover:bg-gray-50"
      aria-label="Create new task"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
    >
      <span className="text-3xl font-bold select-none">+</span>
    </div>
  );
};

const TasksPage: React.FC = () => {
  const location = useLocation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [teams, setTeams] = useState<{ id: number; name: string }[]>([]);
  const [taskToUpdate, setTaskToUpdate] = useState<Task | null>(null);

  const [filterTeamId, setFilterTeamId] = useState<number | ''>('');
  const [filterComplexity, setFilterComplexity] = useState<number | ''>('');
  const [filterSortByTime, setFilterSortByTime] = useState<'asc' | 'desc' | ''>('');
  const [filterSortByComplexity, setFilterSortByComplexity] = useState<'asc' | 'desc' | ''>('');
  const [filterSaveFilter, setFilterSaveFilter] = useState<boolean>(false);

  const { user } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const projectId = queryParams.get('project_id');

  useEffect(() => {
    if (user?.cached_filter) {
      const cached = user.cached_filter;
      setFilterTeamId(cached.team_id ?? '');
      setFilterComplexity(cached.complexity ?? '');
      setFilterSortByTime(cached.sort_by_time ?? '');
      setFilterSortByComplexity(cached.sort_by_complexity ?? '');
      setFilterSaveFilter(true);
    }
  }, [user]);

  const fetchTasks = () => {
    if (!projectId) {
      setError('Project ID is required to load tasks.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const params: any = { project_id: projectId };
    if (filterTeamId !== '') params.team_id = filterTeamId;
    if (filterComplexity !== '') params.complexity = filterComplexity;
    if (filterSortByTime !== '') params.sort_by_time = filterSortByTime;
    if (filterSortByComplexity !== '') params.sort_by_complexity = filterSortByComplexity;
    if (filterSaveFilter) params.save_filter = true;

    apiService.getTasks(params)
      .then((response) => {
        setTasks(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load tasks.');
        setLoading(false);
      });
  };

  const fetchTeams = () => {
    if (!projectId) return;
    apiService.getProjectTeams(Number(projectId))
      .then((response) => {
        const teamsData = response.data;
        if (Array.isArray(teamsData)) {
          const teamsFromApi = teamsData.map((team: any) => ({
            id: team.id,
            name: team.title,
          }));
          setTeams(teamsFromApi);
        } else {
          setTeams([]);
        }
      })
      .catch((error) => {
        throw error;
      });
  };

  useEffect(() => {
    fetchTasks();
    fetchTeams();
  }, [projectId]);

  const handleCreateTask = async (data: { name: string; description: string; team_id: number | null }) => {
    if (!projectId) return;
    try {
      await apiService.createTask({
        name: data.name,
        description: data.description,
        project_id: Number(projectId),
        team_id: data.team_id,
      });
      fetchTasks();
      window.location.reload();
    } catch (error) {
      throw error;
    }
  };

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'inprogress');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const handleActivateTask = async (taskId: number) => {
    try {
      await apiService.activateTask(taskId);
      fetchTasks();
    } catch (error) {
      console.error('Failed to activate task', error);
    }
  };

  const handleCompleteTask = async (taskId: number) => {
    try {
      await apiService.completeTask(taskId);
      fetchTasks();
    } catch (error) {
      console.error('Failed to complete task', error);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading tasks...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  const handleEditClick = (task: Task) => {
    const teamId = task.team_id ?? (teams.length > 0 ? teams[0].id : undefined);
    setTaskToUpdate({
      ...task,
      team_id: teamId,
    });
    setIsUpdateModalOpen(true);
  };

  const handleDeleteClick = async (taskId: number) => {
    try {
      await apiService.deleteTask(taskId);
      fetchTasks();
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  const handleUpdateTask = async (data: { id: number; name: string; description: string }) => {
    try {
      await apiService.updateTask(data.id, {
        name: data.name,
        description: data.description,
      });
      fetchTasks();
      window.location.reload();
    } catch (error) {
      console.error('Failed to update task', error);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 p-4 bg-white rounded shadow border border-gray-200 grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
        <div className="flex flex-col">
          <label htmlFor="projectFilter" className="text-sm font-medium text-gray-700 mb-1">
            Project
          </label>
          <input
            id="projectFilter"
            type="text"
            value={projectId ?? ''}
            readOnly
            className="border border-gray-300 rounded px-3 py-1 bg-gray-100 cursor-not-allowed"
            title="Project ID is read-only"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="teamFilter" className="text-sm font-medium text-gray-700 mb-1">
            Team
          </label>
          <select
            id="teamFilter"
            value={filterTeamId}
            onChange={(e) => setFilterTeamId(e.target.value === '' ? '' : Number(e.target.value))}
            className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Teams</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="complexityFilter" className="text-sm font-medium text-gray-700 mb-1">
            Complexity
          </label>
          <select
            id="complexityFilter"
            value={filterComplexity}
            onChange={(e) => setFilterComplexity(e.target.value === '' ? '' : Number(e.target.value))}
            className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Any</option>
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>

        {/* Sort by time */}
        <div className="flex flex-col">
          <label htmlFor="sortByTimeFilter" className="text-sm font-medium text-gray-700 mb-1">
            Sort by Time
          </label>
          <select
            id="sortByTimeFilter"
            value={filterSortByTime}
            onChange={(e) => setFilterSortByTime(e.target.value as 'asc' | 'desc' | '')}
            className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">None</option>
            <option value="asc">Oldest First</option>
            <option value="desc">Newest First</option>
          </select>
        </div>

        {/* Sort by complexity */}
        <div className="flex flex-col">
          <label htmlFor="sortByComplexityFilter" className="text-sm font-medium text-gray-700 mb-1">
            Sort by Complexity
          </label>
          <select
            id="sortByComplexityFilter"
            value={filterSortByComplexity}
            onChange={(e) => setFilterSortByComplexity(e.target.value as 'asc' | 'desc' | '')}
            className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">None</option>
            <option value="asc">Lowest First</option>
            <option value="desc">Highest First</option>
          </select>
        </div>

        {/* Save filter */}
        <div className="flex items-center space-x-2 self-center">
          <input
            id="saveFilter"
            type="checkbox"
            checked={filterSaveFilter}
            onChange={(e) => setFilterSaveFilter(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="saveFilter" className="text-sm font-medium text-gray-700">
            Save Filter
          </label>
        </div>

        {/* Apply button */}
        <div className="flex justify-center md:justify-end">
          <button
            onClick={fetchTasks}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Apply Filters
          </button>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">Tasks</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section>
          <h3 className="text-xl font-semibold mb-4">To Do</h3>
          {todoTasks.length > 0 ? (
            <>
              {todoTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  canActivateTask={true}
                  canCompleteTask={true}
                  onActivate={handleActivateTask}
                  onComplete={handleCompleteTask}
                />
              ))}
              <EmptyTaskCard onClick={() => setIsCreateModalOpen(true)} />
            </>
          ) : (
            <>
              <p className="text-gray-500">No tasks to do.</p>
              <EmptyTaskCard onClick={() => setIsCreateModalOpen(true)} />
            </>
          )}
        </section>
        <section>
          <h3 className="text-xl font-semibold mb-4">In Progress</h3>
          {inProgressTasks.length > 0 ? inProgressTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              canActivateTask={true}
              canCompleteTask={true}
              onActivate={handleActivateTask}
              onComplete={handleCompleteTask}
            />
          )) : <p className="text-gray-500">No tasks in progress.</p>}
        </section>
        <section>
          <h3 className="text-xl font-semibold mb-4">Completed</h3>
          {completedTasks.length > 0 ? completedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              canActivateTask={true}
              canCompleteTask={true}
              onActivate={handleActivateTask}
              onComplete={handleCompleteTask}
            />
          )) : <p className="text-gray-500">No completed tasks.</p>}
        </section>
      </div>
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateTask}
        teams={teams}
      />
      <UpdateTaskModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onUpdate={handleUpdateTask}
        initialData={taskToUpdate}
      />
    </div>
  );
};

export default TasksPage;
