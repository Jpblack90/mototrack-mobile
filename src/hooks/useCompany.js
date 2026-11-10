import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';

export function useCompany() {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompany = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.get('/company');
      if (res.data?.success) {
        setCompany(res.data.data);
      }
    } catch (err) {
      setError(err.userMessage || 'No se pudo cargar los datos del taller.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    client
      .get('/company')
      .then((res) => {
        if (isMounted && res.data?.success) {
          setCompany(res.data.data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.userMessage || 'No se pudo cargar los datos del taller.');
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

  return { company, loading, error, refetch: fetchCompany };
}
