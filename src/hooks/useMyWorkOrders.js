import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';

export const WORK_ORDER_FILTERS = {
  ACTIVAS: 'activas',
  TERMINADAS: 'terminadas',
  TODAS: 'todas',
};

const ACTIVE_STATUSES = [
  'recibido',
  'diagnostico',
  'en_reparacion',
  'pendiente_aprobacion',
];

/**
 * Hook para listar las órdenes de trabajo asignadas al mecánico autenticado.
 * Consulta GET /api/workorders?assigned=me y filtra según el chip seleccionado.
 *
 * @param {string} filter 'activas' | 'terminadas' | 'todas'
 */
export default function useMyWorkOrders(filter = WORK_ORDER_FILTERS.ACTIVAS) {
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await client.get('/workorders?assigned=me');
      setAllOrders(data.data ?? []);
    } catch (err) {
      setError(
        err.userMessage ||
          err.message ||
          'Error al cargar órdenes de trabajo.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    client
      .get('/workorders?assigned=me')
      .then((res) => {
        if (isMounted) {
          setAllOrders(res.data?.data ?? []);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            err.userMessage ||
              err.message ||
              'Error al cargar órdenes de trabajo.'
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
  }, []);

  let filteredData = allOrders;
  if (filter === WORK_ORDER_FILTERS.ACTIVAS) {
    filteredData = allOrders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  } else if (filter === WORK_ORDER_FILTERS.TERMINADAS) {
    filteredData = allOrders.filter((o) => o.status === 'terminado');
  } else if (filter !== WORK_ORDER_FILTERS.TODAS && filter) {
    filteredData = allOrders.filter((o) => o.status === filter);
  }

  return {
    data: filteredData,
    loading,
    error,
    refresh: fetchOrders,
  };
}
