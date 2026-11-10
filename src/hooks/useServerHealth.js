import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';

export function useServerHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.get('/health');
      setHealth(res.data);
    } catch (err) {
      setError(err.userMessage || 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    client
      .get('/health')
      .then((res) => {
        if (isMounted) {
          setHealth(res.data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.userMessage || 'No se pudo conectar con el servidor.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { health, loading, error, refetch: checkHealth };
}
