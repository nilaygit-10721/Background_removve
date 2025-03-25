// src/utils/axiosInstance.js
import axios from "axios";

// Base URL for your backend API
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Important for sending cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding tokens or handling pre-request logic
axiosInstance.interceptors.request.use(
  (config) => {
    // You can add token from localStorage if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers['Authorization'] = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error scenarios
    if (error.response) {
      switch (error.response.status) {
        case 401: // Unauthorized
          // Redirect to login or refresh token
          console.error("Unauthorized access");
          break;
        case 403: // Forbidden
          console.error("Access forbidden");
          break;
        case 404: // Not Found
          console.error("Resource not found");
          break;
        case 500: // Internal Server Error
          console.error("Server error");
          break;
        default:
          console.error("An error occurred");
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error("No response received", error.request);
    } else {
      // Something happened in setting up the request
      console.error("Error setting up request", error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
