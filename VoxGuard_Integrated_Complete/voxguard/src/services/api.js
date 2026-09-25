import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "X-VoxGuard-Client": "Frontend-Web-v1.0"
  },
  timeout: 15000
});

// Interceptor to attach Authorization JWT token dynamically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("voxguard_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Helper simulator for smooth async operations
export const mockDelay = (ms = 300) => new Promise((res) => setTimeout(res, ms));
