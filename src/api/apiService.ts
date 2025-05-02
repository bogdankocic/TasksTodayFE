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
  getUsers = () => this.axiosInstance.get('/users');

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

  updateProject = (id: string | number, data: any) =>
    this.axiosInstance.post(`/projects/${id}`, data);

  finishProject = (id: string | number) =>
    this.axiosInstance.post(`/projects/${id}/finish`);

  deleteProject = (id: string | number) =>
    this.axiosInstance.delete(`/projects/${id}`);

  // Teams
  createTeam = (data: any) =>
    this.axiosInstance.post('/teams', data);

  deleteTeam = (id: string | number) =>
    this.axiosInstance.delete(`/teams/${id}`);

  getTeam = (id: string | number) =>
    this.axiosInstance.get(`/teams/${id}`);

  addTeamMember = (teamId: string | number, memberId: string | number) =>
    this.axiosInstance.post(`/teams/${teamId}/members/${memberId}`);

  removeTeamMember = (teamId: string | number, memberId: string | number) =>
    this.axiosInstance.delete(`/teams/${teamId}/members/${memberId}`);

  // Tasks
  createTask = (data: any) =>
    this.axiosInstance.post('/tasks', data);

  getTasks = () => this.axiosInstance.get('/tasks');

  getTask = (id: string | number) =>
    this.axiosInstance.get(`/tasks/${id}`);

  assignPerformer = (taskId: string | number, performerId: string | number) =>
    this.axiosInstance.post(`/tasks/${taskId}/assign-performer/${performerId}`);

  activateTask = (taskId: string | number) =>
    this.axiosInstance.post(`/tasks/${taskId}/activate`);

  completeTask = (taskId: string | number) =>
    this.axiosInstance.post(`/tasks/${taskId}/complete`);

  assignContributor = (taskId: string | number, contributorId: string | number) =>
    this.axiosInstance.post(`/tasks/${taskId}/assign-contributor/${contributorId}`);

  voteTask = (taskId: string | number) =>
    this.axiosInstance.post(`/tasks/${taskId}/vote`);

  // Notifications
  getNotifications = () => this.axiosInstance.get('/notifications');

  markNotificationsSeen = () =>
    this.axiosInstance.post('/notifications/seen');

  // Files
  uploadFile = (data: FormData) =>
    this.axiosInstance.post('/files', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

  deleteFile = (id: string | number) =>
    this.axiosInstance.delete(`/files/${id}`);

  downloadTaskFile = (taskId: string | number) =>
    this.axiosInstance.get(`/files/tasks/download/${taskId}`, { responseType: 'blob' });

  downloadProjectFile = (projectId: string | number) =>
    this.axiosInstance.get(`/files/projects/download/${projectId}`, { responseType: 'blob' });

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
  postChatMessage = (projectId: string | number, data: any) =>
    this.axiosInstance.post(`/chat-messages/projects/${projectId}`, data);

}

const apiService = new ApiService();

export default apiService;
