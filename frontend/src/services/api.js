import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }
};

// Users API
export const usersAPI = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  update: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
  
  changePassword: async (id, passwordData) => {
    const response = await api.put(`/users/${id}/password`, passwordData);
    return response.data;
  }
};

// Roles API
export const rolesAPI = {
  getAll: async () => {
    const response = await api.get('/roles');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },
  
  update: async (id, roleData) => {
    const response = await api.put(`/roles/${id}`, roleData);
    return response.data;
  }
};

export default api;