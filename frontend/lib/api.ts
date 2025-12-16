import axios, { AxiosError } from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001",
  withCredentials: true, // Send cookies with requests
});


interface IErrorApi {
  response?:{
    data?:{
      message:string ;
    }
    status:number;
  }
}
// Add token to every request
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("token");
    
    // If token exists, add it to request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses and errors
api.interceptors.response.use(
  (response) => {
    // If response is successful, just return it
    return response;
  },
  (error) => {
    // If unauthorized (401), redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    
    return Promise.reject(error);
  }
);


export type IAxiosError = AxiosError<{
  message?: string;
  error?: string;
  details?: Array<{ message: string }>;
}>;


// Helper function to get error message from API response
export const getErrorMessage = (error: IAxiosError): string => {
  // Check if error has response from server
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  // Check for message property
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  // Check for validation errors
  if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
    return error.response.data.details.map((d: { message: string }) => d.message).join(", ");
  }
  
  // Default error message
  if (error.message) {
    return error.message;
  }
  
  return "An unexpected error occurred";
};

export default api;