import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// En entorno web (solo desarrollo/pruebas), el token se almacena únicamente en memoria
// para evitar persistencia insegura de credenciales en localStorage.
const webMemoryStore = new Map();

export async function getStorageItem(key) {
  if (Platform.OS === 'web') {
    if (key.includes('token') || key === 'mototrack_token') {
      return webMemoryStore.get(key) || null;
    }
    try {
      return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    } catch {
      return null;
    }
  }
  return await SecureStore.getItemAsync(key);
}

export async function setStorageItem(key, value) {
  if (Platform.OS === 'web') {
    if (key.includes('token') || key === 'mototrack_token') {
      webMemoryStore.set(key, value);
      return;
    }
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // Ignorar error de cuota o restricción en web
    }
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function deleteStorageItem(key) {
  if (Platform.OS === 'web') {
    if (key.includes('token') || key === 'mototrack_token') {
      webMemoryStore.delete(key);
      return;
    }
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Ignorar error
    }
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
