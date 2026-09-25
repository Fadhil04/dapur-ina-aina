// frontend/src/services/api.js — Axios Base Instance
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1',
});

// Request interceptor: inject token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// Response interceptor: handle 401 — hapus token & redirect /login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
