import { useState, useCallback } from 'react';
import client from '../api/client';
import { emitStockAlertsUpdated } from './useStockAlerts';

/**
 * Hook para registrar una entrada de stock de mercadería.
 * POST /api/inventory/:id/stock-entry
 */
export default function useStockEntry() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = useCallback(async (id, { quantity, note } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.post(`/inventory/${id}/stock-entry`, {
        quantity: Number(quantity),
        note: note ? String(note).trim() : undefined,
      });
      emitStockAlertsUpdated();
      return { success: true, data: res.data?.data };
    } catch (err) {
      const msg =
        err.userMessage ||
        err.response?.data?.error?.message ||
        err.message ||
        'Error al registrar la entrada de mercadería.';
      setError(msg);
      return { success: false, error: msg, code: err.code };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    submit,
    loading,
    error,
  };
}
