import axios, { AxiosError } from 'axios';
import type {
  ApiResponse,
  PaginatedResponse,
  AuthResponse,
  User,
  Application,
  RegisterFormData,
  LoginFormData,
  UpdateProfileFormData,
  CreateApplicationFormData,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: async (data: RegisterFormData): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data.data!;
  },

  login: async (data: LoginFormData): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data.data!;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data.data!;
  },
};

// User API
export const userApi = {
  getProfile: async (userId: string): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(`/users/profile/${userId}`);
    return response.data.data!;
  },

  updateProfile: async (data: UpdateProfileFormData): Promise<User> => {
    const response = await api.put<ApiResponse<User>>('/users/profile', data);
    return response.data.data!;
  },

  getUsersByRole: async (
    role: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<User[]>> => {
    const response = await api.get<PaginatedResponse<User[]>>(`/users/role/${role}`, {
      params: { page, limit },
    });
    return response.data;
  },

  getReputationHistory: async (userId: string, page = 1, limit = 50) => {
    const response = await api.get(`/users/${userId}/reputation`, {
      params: { page, limit },
    });
    return response.data;
  },

  getReputationStats: async (userId: string) => {
    const response = await api.get(`/users/${userId}/reputation/stats`);
    return response.data;
  },

  getLeaderboard: async (role?: string, limit = 100) => {
    const response = await api.get('/users/leaderboard', {
      params: { role, limit },
    });
    return response.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}`);
  },
};

// Application API
export const applicationApi = {
  createApplication: async (data: CreateApplicationFormData): Promise<Application> => {
    const response = await api.post<ApiResponse<Application>>('/applications', data);
    return response.data.data!;
  },

  getApplication: async (id: string): Promise<Application> => {
    const response = await api.get<ApiResponse<Application>>(`/applications/${id}`);
    return response.data.data!;
  },

  getMyApplications: async (
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Application[]>> => {
    const response = await api.get<PaginatedResponse<Application[]>>('/applications/my', {
      params: { page, limit },
    });
    return response.data;
  },

  getAllApplications: async (
    page = 1,
    limit = 20,
    status?: string
  ): Promise<PaginatedResponse<Application[]>> => {
    const response = await api.get<PaginatedResponse<Application[]>>('/applications', {
      params: { page, limit, status },
    });
    return response.data;
  },

  updateApplicationStatus: async (
    id: string,
    data: { status?: string; assignedTo?: string; adminNotes?: string }
  ): Promise<Application> => {
    const response = await api.patch<ApiResponse<Application>>(`/applications/${id}`, data);
    return response.data.data!;
  },

  deleteApplication: async (id: string): Promise<void> => {
    await api.delete(`/applications/${id}`);
  },

  getStatistics: async () => {
    const response = await api.get('/applications/statistics');
    return response.data;
  },
};

export default api;
