import axios from 'axios';

// In production, use the deployed backend URL
// In development, use Vite proxy (/api → localhost:5000)
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL,
  timeout: 60000, // 60 seconds - Render free tier cold start
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach token from storage on each request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('crm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
