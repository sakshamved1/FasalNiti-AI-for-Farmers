import axios from 'axios';

const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
const baseURL = envBaseUrl 
  ? (envBaseUrl.endsWith('/api') ? envBaseUrl : `${envBaseUrl.replace(/\/$/, '')}/api`)
  : '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fasalniti_token') || localStorage.getItem('fasalniti_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
