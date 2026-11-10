/* eslint-disable import/no-named-as-default-member */
import axios from 'axios';
import { getStorageItem, deleteStorageItem } from '../utils/storage';

export const TOKEN_KEY = 'mototrack_token';
export const USER_KEY = 'mototrack_user';
export const REMEMBER_EMAIL_KEY = 'mototrack_remember_email';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://192.168.101.11:4000/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // Tiempo límite de 10 segundos según requisito
  headers: {
    'Content-Type': 'application/json',
  },
});

// Listener para notificar cierre de sesión al AuthContext ante 401
let onUnauthorizedCallback = null;

export function setUnauthorizedHandler(callback) {
  onUnauthorizedCallback = callback;
}

// Interceptor de solicitud: inyecta Bearer token desde SecureStore (con fallback web)
client.interceptors.request.use(
  async (config) => {
    try {
      const token = await getStorageItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn('Error leyendo token de almacenamiento:', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta: manejo de 401 y errores de red / timeout
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 1. Manejo de sesión expirada o no autorizada (401)
    if (error.response?.status === 401) {
      try {
        await deleteStorageItem(TOKEN_KEY);
        await deleteStorageItem(USER_KEY);
      } catch (e) {
        console.warn('Error al limpiar sesión en almacenamiento:', e);
      }

      if (typeof onUnauthorizedCallback === 'function') {
        onUnauthorizedCallback();
      }
    }

    // 2. Manejo de fallos de red / timeout (10s)
    const isNetworkError =
      !error.response ||
      error.code === 'ECONNABORTED' ||
      error.code === 'ERR_NETWORK' ||
      error.message?.includes('timeout') ||
      error.message?.includes('Network Error');

    if (isNetworkError) {
      error.userMessage =
        'No se pudo conectar con el servidor. Revisa que estés en la misma red Wi-Fi que el taller.';
      error.isNetworkError = true;
    } else {
      error.userMessage =
        error.response?.data?.error?.message ||
        error.message ||
        'Ocurrió un error inesperado.';
      error.code = error.response?.data?.error?.code;
    }

    return Promise.reject(error);
  }
);

export default client;
