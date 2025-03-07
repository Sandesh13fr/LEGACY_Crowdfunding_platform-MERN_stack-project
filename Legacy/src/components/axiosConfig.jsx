import axios from 'axios';

const baseURL =
  process.env.NODE_ENV === 'production'
    ? window.location.origin  // in production uses current domain (e.g., https://legacymd.vercel.app)
    : 'http://localhost:5000'; // in development use localhost

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export default api;