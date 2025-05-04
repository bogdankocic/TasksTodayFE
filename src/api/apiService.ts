import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = '/api';

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // for cookies if needed
    });

    // Request interceptor for the default instance to add auth token if available
    this.axiosInstance.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        const token = localStorage.getItem('authToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for global error handling
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        // You can add global error handling here
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  login = (data: { email: string; password: string }) =>
    this.axiosInstance.post('/auth/login', data);

  logout = () => this.axiosInstance.post('/auth/logout');

  sanctum = () => this.axiosInstance.get('/auth/sanctum');

  inviteUser = (data: { email: string; organization_id?: string | number; team_role?: string }) =>
    this.axiosInstance.post('/auth/invite-user', data);

  activate = (data: { token: string }) =>
    this.axiosInstance.post('/auth/activate', data);

  // Organizations
  getOrganizations = () => this.axiosInstance.get('/organizations');

  createOrganization = (data: any) =>
    this.axiosInstance.post('/organizations', data);

  getOrganization = (id: string | number) =>
    this.axiosInstance.get(`/organizations/${id}`);

  updateOrganization = (id: string | number, data: FormData) =>
    this.axiosInstance.post(`/organizations/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

  deleteOrganization = (id: string | number) =>
    this.axiosInstance.delete(`/organizations/${id}`);

  // Users
  getUsers = (filter?: { organization_id?: string | number | null }) => {
    let url = '/users';
    if (filter && filter.organization_id != null) {
      url += `?organization_id=${encodeURIComponent(filter.organization_id)}`;
    }
    return this.axiosInstance.get(url);
  };

  deleteUser = (id: string | number) =>
    this.axiosInstance.delete(`/users/${id}`);

  selfUpdate = (data: FormData) =>
    this.axiosInstance.post('/users/self-update', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });


  getSelf = () => this.axiosInstance.get('/users/self');

  // Projects
  getProjects = () => this.axiosInstance.get('/projects');

  createProject = (data: any) =>
    this.axiosInstance.post('/projects', data);

  getProject = (id: string | number) =>
    this.axiosInstance.get(`/projects/${id}`);

  getProjectTeams = (projectId: string | number) =>
    this.axiosInstance.get(`/projects/${projectId}/teams`);

  updateProject = (id: string | number, data: any) =>
    this.axiosInstance.post(`/projects/${id}`, data);

  getProjectMembers = (projectId: string | number) =>
    this.axiosInstance.get(`/projects/${projectId}/members`);

  finishProject = (id: string | number) =>
    this.axiosInstance.post(`/projects/${id}/finish`);

  deleteProject = (id: string | number) =>
    this.axiosInstance.delete(`/projects/${id}`);

  // Teams
  createTeam = (data: any) =>
    this.axiosInstance.post('/teams', data);

  updateTeamName = (id: string | number, data: any) =>
    this.axiosInstance.post(`/teams/${id}`, data);

  deleteTeam = (id: string | number) =>
    this.axiosInstance.delete(`/teams/${id}`);

  getTeam = (id: string | number) =>
    this.axiosInstance.get(`/teams/${id}`);

  getTeamMembers = (teamId: string | number) =>
    this.axiosInstance.get(`/teams/${teamId}/members`);

  addTeamMember = (teamId: string | number, memberId: string | number) =>
    this.axiosInstance.post(`/teams/${teamId}/members/${memberId}`);

  removeTeamMember = (teamId: string | number, memberId: string | number) =>
    this.axiosInstance.delete(`/teams/${teamId}/members/${memberId}`);

  // Tasks
  createTask = (data: any) =>
    this.axiosInstance.post('/tasks', data);

  getTasks = (filters?: Record<string, any>) => {
    let url = '/tasks';
    if (filters) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      url += `?${params.toString()}`;
    }
    return this.axiosInstance.get(url);
  };

  getTask = (id: string | number) =>
    this.axiosInstance.get(`/tasks/${id}`);

  updateTask = (id: string | number, data: any) =>
    this.axiosInstance.post(`/tasks/${id}`, data);

  deleteTask = (id: string | number) =>
    this.axiosInstance.delete(`/tasks/${id}`);

  assignPerformer = (taskId: string | number, performerId: string | number) =>
    this.axiosInstance.post(`/tasks/${taskId}/assign-performer/${performerId}`);

  activateTask = (taskId: string | number) =>
    this.axiosInstance.post(`/tasks/${taskId}/activate`);

  completeTask = (taskId: string | number) =>
    this.axiosInstance.post(`/tasks/${taskId}/complete`);

  assignContributor = (taskId: string | number, contributorId: string | number) =>
    this.axiosInstance.post(`/tasks/${taskId}/assign-contributor/${contributorId}`);

  voteTask = (taskId: string | number, data: any) =>
    this.axiosInstance.post(`/tasks/${taskId}/vote`, data);

  // Notifications
  getNotifications = () => this.axiosInstance.get('/notifications');

  markNotificationsSeen = (ids: number[]) =>
    this.axiosInstance.post('/notifications/seen', { notifications: ids });

  // Files
  uploadFile = (data: FormData) =>
    this.axiosInstance.post('/files', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

  deleteFile = (id: string | number, type: string) =>
    this.axiosInstance.delete('/files', { data: { id, type } });

  downloadTaskFile = (fileId: string | number) =>
    this.axiosInstance.get(`/files/${fileId}/tasks/download`, { responseType: 'blob' });

  downloadProjectFile = (fileId: string | number) =>
    this.axiosInstance.get(`/files/${fileId}/projects/download`, { responseType: 'blob' });

  getProjectFiles = (projectId: string | number) =>
    this.axiosInstance.get(`/files/projects/${projectId}`);

  getTaskFiles = (taskId: string | number) =>
    this.axiosInstance.get(`/files/tasks/${taskId}`);

  // Task Notes
  createTaskNote = (taskId: string | number, data: any) =>
    this.axiosInstance.post(`/task-notes/tasks/${taskId}`, data);

  getTaskNotes = (taskId: string | number) =>
    this.axiosInstance.get(`/task-notes/tasks/${taskId}`);

  // Chat Messages
  getChatMessagesForProject = (projectId: string | number) =>
    this.axiosInstance.get(`/chat-messages/projects/${projectId}`);

  postChatMessageToProject = (projectId: string | number, data: any) =>
    this.axiosInstance.post(`/chat-messages/projects/${projectId}`, data);
}

const apiService = new ApiService();

export default apiService;
