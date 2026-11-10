import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';

/**
 * Hook para consultar el detalle de una orden de trabajo por id.
 * Consulta GET /api/workorders/:id.
 *
 * @param {number|string} id
 */
export default function useWorkOrder(id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWorkOrder = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await client.get(`/workorders/${id}`);
      setData(res.data?.data ?? null);
    } catch (err) {
      setError(
        err.userMessage ||
          err.message ||
          'Error al cargar detalle de la orden.'
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    client
      .get(`/workorders/${id}`)
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
              'Error al cargar detalle de la orden.'
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
    refresh: fetchWorkOrder,
  };
}
