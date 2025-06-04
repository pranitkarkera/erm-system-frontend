export const API_URL = import.meta.env.VITE_API_URL;

console.log('API URL:', API_URL); // Log the API URL to verify it's correct

// Setup token for axios globally
import axios from "axios";

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('Axios request config:', {
    url: config.url,
    method: config.method,
    headers: config.headers
  });
  return config;
});

// Add response interceptor for debugging
axios.interceptors.response.use(
  (response) => {
    console.log('Axios response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Axios error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      response: error.response?.data
    });
    return Promise.reject(error);
  }
); 