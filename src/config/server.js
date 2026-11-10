import { getStorageItem, setStorageItem, deleteStorageItem } from '../utils/storage';

export const SERVER_STORAGE_KEY = 'mototrack_api_url';
export const DEFAULT_API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://192.168.101.11:4000/api';

let cachedApiUrl = null;

/**
 * Obtiene la URL efectiva de la API:
 * 1. Desde almacenamiento seguro (SecureStore con clave mototrack_api_url)
 * 2. Si no existe, usa la variable de entorno EXPO_PUBLIC_API_URL (o fallback predeterminado).
 */
export async function getApiUrl() {
  if (cachedApiUrl) {
    return cachedApiUrl;
  }
  try {
    const stored = await getStorageItem(SERVER_STORAGE_KEY);
    if (stored && typeof stored === 'string' && stored.trim()) {
      cachedApiUrl = stored.trim().replace(/\/+$/, '');
      return cachedApiUrl;
    }
  } catch (err) {
    console.warn('Error leyendo mototrack_api_url:', err);
  }
  cachedApiUrl = DEFAULT_API_URL.replace(/\/+$/, '');
  return cachedApiUrl;
}

/**
 * Retorna de forma síncrona la URL actual en memoria (para renderizado inicial).
 */
export function getApiUrlSync() {
  return cachedApiUrl || DEFAULT_API_URL.replace(/\/+$/, '');
}

/**
 * Valida el formato de la URL:
 * Debe cumplir con http(s)://host[:puerto]/api
 */
export function validateApiUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  // Formato: http(s)://dominio-o-ip[:puerto]/api (con o sin barra final)
  const regex = /^https?:\/\/[a-zA-Z0-9.-]+(:\d+)?(\/[a-zA-Z0-9_.-]+)*\/api\/?$/i;
  return regex.test(trimmed);
}

/**
 * Guarda una nueva URL en SecureStore y actualiza la caché en memoria.
 */
export async function setApiUrl(url) {
  const cleanUrl = String(url).trim().replace(/\/+$/, '');
  if (!validateApiUrl(cleanUrl)) {
    throw new Error('Formato inválido. Debe ser http(s)://host[:puerto]/api');
  }
  await setStorageItem(SERVER_STORAGE_KEY, cleanUrl);
  cachedApiUrl = cleanUrl;
  return cleanUrl;
}

/**
 * Restablece la URL a la configuración predeterminada de entorno.
 */
export async function resetApiUrl() {
  await deleteStorageItem(SERVER_STORAGE_KEY);
  cachedApiUrl = DEFAULT_API_URL.replace(/\/+$/, '');
  return cachedApiUrl;
}

/**
 * Prueba la conexión con el servidor realizando un GET a {url}/health
 * con timeout de 5 segundos.
 */
export async function testConnection(url) {
  const cleanUrl = String(url).trim().replace(/\/+$/, '');
  if (!validateApiUrl(cleanUrl)) {
    return {
      success: false,
      error: 'Formato inválido. Debe ser http(s)://host[:puerto]/api',
    };
  }

  const healthUrl = `${cleanUrl}/health`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(healthUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (res.ok) {
      return { success: true, status: res.status };
    }
    return {
      success: false,
      error: `El servidor respondió con código HTTP ${res.status}`,
    };
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      return {
        success: false,
        error: 'Tiempo de espera agotado (5 s). Verifica la IP y el puerto.',
      };
    }
    return {
      success: false,
      error: err.message || 'No se pudo conectar con el servidor.',
    };
  }
}
