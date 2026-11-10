import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';

/**
 * Hook para consultar el detalle de un producto por id.
 * GET /api/inventory/:id
 *
 * @param {number|string} id
 */
export default function useProduct(id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await client.get(`/inventory/${id}`);
      setData(res.data?.data ?? null);
    } catch (err) {
      setError(
        err.userMessage ||
          err.message ||
          'Error al cargar detalle del producto.'
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    client
      .get(`/inventory/${id}`)
      .then((res) => {
        if (isMounted) {
          setData(res.data?.data ?? null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            err.userMessage ||
              err.message ||
              'Error al cargar detalle del producto.'
          );
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
  }, [id]);

  return {
    data,
    loading,
    error,
    refresh: fetchProduct,
  };
}
