import axios from 'axios';
import useAuthStore from '../store/authStore';

const getBaseURL = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
  return url.endsWith('/') ? url : `${url}/`;
};

const axiosClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar automáticamente el token JWT en las peticiones cabecera
axiosClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosClient;
