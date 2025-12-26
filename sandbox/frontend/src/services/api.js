import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data.data;
  },
  (error) => {
    const message = error.response?.data?.error?.message || error.message || 'Произошла ошибка';
    return Promise.reject(new Error(message));
  }
);

/**
 * Create a new sandbox session
 */
export const createSession = async (agentType, metadata = {}) => {
  return api.post('/sessions', { agentType, metadata });
};

/**
 * Get session information
 */
export const getSession = async (sessionId) => {
  return api.get(`/sessions/${sessionId}`);
};

/**
 * Destroy a sandbox session
 */
export const destroySession = async (sessionId) => {
  return api.delete(`/sessions/${sessionId}`);
};

/**
 * List all active sessions
 */
export const listSessions = async () => {
  return api.get('/sessions');
};

/**
 * Execute agent in sandbox session
 */
export const executeAgent = async (sessionId, input, options = {}) => {
  return api.post(`/agents/${sessionId}/execute`, { input, options });
};

export default api;
