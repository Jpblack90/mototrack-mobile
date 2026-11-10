import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getStorageItem, setStorageItem, deleteStorageItem } from '../utils/storage';
import client, { TOKEN_KEY, USER_KEY, REMEMBER_EMAIL_KEY, setUnauthorizedHandler } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rememberedEmail, setRememberedEmail] = useState('');

  // Limpieza de sesión ante 401
  const handleUnauthorized = useCallback(() => {
    setUser(null);
    setToken(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(handleUnauthorized);
  }, [handleUnauthorized]);

  // Carga inicial y validación con GET /auth/me
  useEffect(() => {
    async function loadSession() {
      try {
        // Cargar correo recordado si existe
        const savedEmail = await getStorageItem(REMEMBER_EMAIL_KEY);
        if (savedEmail) {
          setRememberedEmail(savedEmail);
        }

        const storedToken = await getStorageItem(TOKEN_KEY);
        if (!storedToken) {
          setLoading(false);
          return;
        }

        setToken(storedToken);

        // Validar sesión contra el servidor
        const res = await client.get('/auth/me');
        if (res.data?.success && res.data?.data) {
          const freshUser = res.data.data;
          setUser(freshUser);
          await setStorageItem(USER_KEY, JSON.stringify(freshUser));
        } else {
          // Token inválido
          await deleteStorageItem(TOKEN_KEY);
          await deleteStorageItem(USER_KEY);
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        // Si fue 401, ya se limpió en el interceptor
        if (err.response?.status === 401) {
          setUser(null);
          setToken(null);
        } else {
          // Error de red temporal: si había usuario guardado en caché local,
          // permitir arranque conservando datos para mostrar pantalla de reconexión
          try {
            const cachedUserStr = await getStorageItem(USER_KEY);
            if (cachedUserStr) {
              setUser(JSON.parse(cachedUserStr));
            }
          } catch {}
        }
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, []);

  // Iniciar sesión
  async function login(email, password, rememberMe = false) {
    const cleanEmail = email.trim().toLowerCase();
    const res = await client.post('/auth/login', {
      email: cleanEmail,
      password,
    });

    const data = res.data?.data;
    if (!data?.token || !data?.user) {
      throw new Error('Respuesta inválida del servidor al iniciar sesión.');
    }

    const { token: newToken, user: newUser } = data;

    // Guardar token y usuario en almacenamiento
    await setStorageItem(TOKEN_KEY, newToken);
    await setStorageItem(USER_KEY, JSON.stringify(newUser));

    // Gestionar correo recordado
    if (rememberMe) {
      await setStorageItem(REMEMBER_EMAIL_KEY, cleanEmail);
      setRememberedEmail(cleanEmail);
    } else {
      await deleteStorageItem(REMEMBER_EMAIL_KEY);
      setRememberedEmail('');
    }

    setToken(newToken);
    setUser(newUser);

    return newUser;
  }

  // Cerrar sesión
  async function logout() {
    try {
      await deleteStorageItem(TOKEN_KEY);
      await deleteStorageItem(USER_KEY);
    } catch (e) {
      console.warn('Error al eliminar credenciales en almacenamiento:', e);
    }
    setToken(null);
    setUser(null);
  }

  // Cambio obligatorio o voluntario de contraseña
  async function changePassword(currentPassword, newPassword) {
    const res = await client.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });

    if (res.data?.success) {
      // Actualizar flag must_change_password localmente y en almacenamiento
      const updatedUser = {
        ...user,
        must_change_password: false,
      };
      await setStorageItem(USER_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
      return res.data;
    }

    throw new Error(res.data?.error?.message || 'Error al cambiar la contraseña.');
  }

  const value = {
    user,
    token,
    loading,
    rememberedEmail,
    login,
    logout,
    changePassword,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
