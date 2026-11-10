import { useState, useCallback } from 'react';
import client from '../api/client';

/**
 * Hook para actualizar el estado de una orden de trabajo.
 * Ejecuta PATCH /api/workorders/:id/status.
 */
export default function useUpdateWorkOrderStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = useCallback(async (id, status, extras = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.patch(`/workorders/${id}/status`, {
        status,
        ...extras,
      });
      return { success: true, data: res.data?.data };
    } catch (err) {
      const msg =
        err.userMessage || err.message || 'Error al actualizar el estado.';
      setError(msg);
      return { success: false, error: msg, code: err.code };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    update,
  };
}
