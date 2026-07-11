import axios from "axios";

const api = axios.create({
  // In development the Vite proxy rewrites "/api/v1" → "http://localhost:5500"
  // In production set VITE_API_URL to your backend URL (e.g. https://api.myapp.com)
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
