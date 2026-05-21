import axios from 'axios';

const hostname = window.location.hostname;
const API_URL = hostname === 'localhost.lambdatest.com'
  ? 'http://localhost.lambdatest.com:3000/api/v1'
  : `http://${hostname}:3000/api/v1`;

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor for adding auth token
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

// Response interceptor for handling 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
