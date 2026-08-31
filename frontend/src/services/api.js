import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth APIs
export const authAPI = {
  loginWithGitHub: () => {
    window.location.href = `${API_URL}/auth/github`;
  },
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Repository APIs
export const repoAPI = {
  getGitHubRepos: () => api.get('/repos'),
  connectRepo: (repoId) => api.post('/repos/connect', { repoId }),
  getConnectedRepos: () => api.get('/repos/connected'),
  disconnectRepo: (repoId) => api.delete(`/repos/${repoId}`),
};

// Task APIs
export const taskAPI = {
  createTask: (data) => api.post('/tasks', data),
  getTasks: () => api.get('/tasks'),
  getTask: (id) => api.get(`/tasks/${id}`),
  approveTask: (id) => api.post(`/tasks/${id}/approve`),
  getTaskStatus: (id) => api.get(`/tasks/${id}/status`),
};

// Commit APIs
export const commitAPI = {
  getCommits: () => api.get('/commits'),
  getTaskCommits: (taskId) => api.get(`/commits/task/${taskId}`),
};

export default api;
