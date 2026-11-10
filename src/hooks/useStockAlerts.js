import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';

const alertListeners = new Set();

/**
 * Notifica a todos los componentes que escuchan alertas de stock para que refresquen su conteo.
 */
export function emitStockAlertsUpdated() {
  for (const listener of alertListeners) {
    try {
      listener();
    } catch {
      // Ignorar errores de callback en componentes desmontándose
    }
  }
}

/**
 * Hook para consultar las alertas de inventario (agotados y stock bajo).
 * GET /api/inventory/alerts
 */
export default function useStockAlerts() {
  const [data, setData] = useState({ out_of_stock: [], low_stock: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.get('/inventory/alerts');
      setData(res.data?.data ?? { out_of_stock: [], low_stock: [], total: 0 });
    } catch (err) {
      setError(
        err.userMessage ||
          err.message ||
          'Error al cargar las alertas de inventario.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    client
      .get('/inventory/alerts')
      .then((res) => {
        if (isMounted) {
          setData(res.data?.data ?? { out_of_stock: [], low_stock: [], total: 0 });
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            err.userMessage ||
              err.message ||
              'Error al cargar las alertas de inventario.'
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    const onUpdate = () => {
      fetchAlerts();
    };

    alertListeners.add(onUpdate);
    return () => {
      isMounted = false;
      alertListeners.delete(onUpdate);
    };
  }, [fetchAlerts]);

  return {
    data,
    outOfStock: data.out_of_stock ?? [],
    lowStock: data.low_stock ?? [],
    total: data.total ?? (data.out_of_stock?.length ?? 0) + (data.low_stock?.length ?? 0),
    loading,
    error,
    refresh: fetchAlerts,
  };
}
