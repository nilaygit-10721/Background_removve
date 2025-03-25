import axios from "axios";
import { toast } from "react-toastify";

// Set base URL for all requests
axios.defaults.baseURL = "http://localhost:3000/api";

// Add a request interceptor to include token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Token expired or unauthorized
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
          toast.error("Session expired. Please login again.");
          break;
        case 403:
          toast.error("You do not have permission to perform this action.");
          break;
        case 500:
          toast.error("Server error. Please try again later.");
          break;
        default:
          toast.error(error.response.data.message || "An error occurred");
      }
    } else if (error.request) {
      toast.error("No response from server. Check your network connection.");
    } else {
      toast.error("Error setting up the request");
    }
    return Promise.reject(error);
  }
);

export default axios;
