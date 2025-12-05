import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constantes de storage (AsyncStorage)
const ACCESS_TOKEN_KEY = '@lava2:accessToken';
const REFRESH_TOKEN_KEY = '@lava2:refreshToken';

export interface ApiResponse<T = any> {
  success: boolean;
  mensaje?: string;
  data?: T;
  meta?: any;
}

const BASE_URL = 'http://localhost:3000';

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let refreshQueue: Array<(token?: string | null) => void> = [];

api.interceptors.request.use(async (config: AxiosRequestConfig) => {
  try {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    if (token && config && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // Ignorar errores de lectura de storage
  }
  return config;
});

// Manejo central de respuestas: 401 -> intentar refresh-token, 403 -> rechazar con tipo
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !original?._retry) {
      // Si ya se está refrescando, encolar
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((token?: string | null) => {
            if (token && original && original.headers) {
              original.headers.Authorization = `Bearer ${token}`;
            }
            resolve(api(original));
          });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        // Usar endpoint /api/auth/refresh-token (fallback a /api/auth/refresh)
        const url = `${BASE_URL}/api/auth/refresh-token`;
        const resp = await axios.post(url, { refreshToken }, { withCredentials: true });
        const nuevoAccess = resp.data?.data?.accessToken || resp.data?.accessToken;
        if (nuevoAccess) {
          await AsyncStorage.setItem(ACCESS_TOKEN_KEY, nuevoAccess);
          refreshQueue.forEach((cb) => cb(nuevoAccess));
          refreshQueue = [];
          isRefreshing = false;
          if (original && original.headers) original.headers.Authorization = `Bearer ${nuevoAccess}`;
          return api(original);
        }
      } catch (e) {
        // limpiar y propagar
        await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
        await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
        refreshQueue.forEach((cb) => cb(null));
        refreshQueue = [];
        isRefreshing = false;
        return Promise.reject(e);
      }
    }

    if (error.response?.status === 403) {
      return Promise.reject({ tipo: 'FORBIDDEN', mensaje: error.response?.data?.mensaje || 'Acceso prohibido' });
    }

    const mensaje = error.response?.data?.mensaje || error.message || 'Error desconocido';
    return Promise.reject({ tipo: 'GENERIC', mensaje, status: error.response?.status });
  }
);

export const guardarTokens = async (accessToken?: string, refreshToken?: string) => {
  if (accessToken) await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const limpiarTokens = async () => {
  await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
  await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
};

export default api;
