import axios from 'axios';
import { API_BASE_URL } from './config';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Add request interceptor for logging
api.interceptors.request.use(
  config => {
    console.log(
      `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`
    );
    return config;
  },
  error => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  response => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  error => {
    console.error(
      '❌ API Response Error:',
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);
