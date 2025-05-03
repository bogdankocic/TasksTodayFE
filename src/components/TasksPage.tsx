import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import apiService from '../api/apiService';
import CreateTaskModal from './CreateTaskModal';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'inprogress' | 'completed';
  complexity: number;
  created_at: string;
  updated_at: string;
  // Add other task fields as needed
}

const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
  return (
    <div className="relative bg-white shadow rounded p-4 mb-4 border border-gray-200">
      <div className="absolute top-2 right-2 flex space-x-2">
        <img
          src="/images/editing.png"
          alt="Edit"
          className="w-5 h-5 cursor-pointer"
          title="Edit task"
          // onClick handler can be added here for update functionality
        />
        <img
          src="/images/bin.png"
          alt="Delete"
          className="w-5 h-5 cursor-pointer"
          title="Delete task"
          // onClick handler can be added here for delete functionality
        />
      </div>
      <h4 className="font-semibold text-lg mb-1">{task.title}</h4>
      <p className="text-gray-600 text-sm mb-2">{task.description}</p>
      <div className="text-xs text-gray-700 font-bold mb-2">
        Complexity: {task.complexity}
      </div>
      <div className="text-xs text-gray-400">
        Created: {new Date(task.created_at).toLocaleDateString()}
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teams, setTeams] = useState<{ id: number; name: string }[]>([]);

  // Parse query params to get project_id
  const queryParams = new URLSearchParams(location.search);
  const projectId = queryParams.get('project_id');

  const fetchTasks = () => {
    if (!projectId) {
      setError('Project ID is required to load tasks.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Fetch tasks with project_id filter
    apiService.getTasks({ project_id: projectId })
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
    // Use the dedicated API endpoint to get teams by project
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
        console.error('Failed to load teams', error);
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
    } catch (error) {
      // Handle error (optional)
      console.error('Failed to create task', error);
    }
  };

  // Filter tasks by status
  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'inprogress');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading tasks...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Tasks</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section>
          <h3 className="text-xl font-semibold mb-4">To Do</h3>
          {todoTasks.length > 0 ? (
            <>
              {todoTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
              <EmptyTaskCard onClick={() => setIsModalOpen(true)} />
            </>
          ) : (
            <>
              <p className="text-gray-500">No tasks to do.</p>
              <EmptyTaskCard onClick={() => setIsModalOpen(true)} />
            </>
          )}
        </section>
        <section>
          <h3 className="text-xl font-semibold mb-4">In Progress</h3>
          {inProgressTasks.length > 0 ? inProgressTasks.map((task) => <TaskCard key={task.id} task={task} />) : <p className="text-gray-500">No tasks in progress.</p>}
        </section>
        <section>
          <h3 className="text-xl font-semibold mb-4">Completed</h3>
          {completedTasks.length > 0 ? completedTasks.map((task) => <TaskCard key={task.id} task={task} />) : <p className="text-gray-500">No completed tasks.</p>}
        </section>
      </div>
      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateTask}
        teams={teams}
      />
    </div>
  );
};

export default TasksPage;
