import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001",
  withCredentials: true,
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Helper to extract error message from backend response
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    // Backend sends { error: "message", details: [...] }
    if (data?.error) {
      return data.error;
    }
    // Fallback to message property
    if (data?.message) {
      return data.message;
    }
    // Handle validation errors with details
    if (data?.details && Array.isArray(data.details)) {
      const messages = data.details
        .map((d: { message?: string; path?: string[] }) => d.message || d.path?.join("."))
        .filter(Boolean);
      if (messages.length > 0) {
        return messages.join(", ");
      }
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Une erreur inattendue s'est produite";
};

// Response interceptor to handle token refresh and show errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean; _skipErrorToast?: boolean };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry for auth endpoints to avoid infinite loops
      if (
        originalRequest.url?.includes("/auth/refresh") ||
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/me")
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the token
        await api.post("/api/auth/refresh");
        processQueue(null);
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError);
        // Don't redirect here - let the app handle it via Redux state
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;