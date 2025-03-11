import axios from 'axios';

export const api = axios.create({
  baseURL:
    process.env.NODE_ENV === 'production'
      ? 'https://legacy-api-rbyi.onrender.com'
      : 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});