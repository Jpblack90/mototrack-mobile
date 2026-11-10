import { useState, useEffect, useCallback, useMemo } from 'react';
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

const STATUS_PRIORITY = {
  diagnostico: 1,
  en_reparacion: 1,
  pendiente_aprobacion: 2,
  recibido: 3,
  terminado: 4,
  entregado: 5,
  no_recogido: 6,
};

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

function processOrder(order, now) {
  const isOldReceived =
    order.status === 'recibido' &&
    now - new Date(order.created_at).getTime() > THREE_DAYS_MS;
  return {
    ...order,
    is_old_received: isOldReceived,
  };
}

/**
 * Ordena las órdenes de trabajo según la prioridad técnica del mecánico:
 * 1. diagnostico y en_reparacion
 * 2. pendiente_aprobacion
 * 3. recibido (la más antigua primero)
 * 4. terminadas y otros
 */
function sortWorkOrders(orders) {
  return [...orders].sort((a, b) => {
    const prioA = STATUS_PRIORITY[a.status] ?? 99;
    const prioB = STATUS_PRIORITY[b.status] ?? 99;

    if (prioA !== prioB) {
      return prioA - prioB;
    }

    // Para el estado 'recibido': la más antigua primero (ascendente)
    const timeA = new Date(a.created_at).getTime();
    const timeB = new Date(b.created_at).getTime();
    return timeA - timeB;
  });
}

/**
 * Hook para listar las órdenes de trabajo asignadas al mecánico autenticado.
 * Consulta GET /api/workorders?assigned=me, calcula los conteos y realiza
 * el ordenamiento según la regla de negocio.
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
      const now = Date.now();
      const processed = (data.data ?? []).map((o) => processOrder(o, now));
      setAllOrders(processed);
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
          const now = Date.now();
          const processed = (res.data?.data ?? []).map((o) =>
            processOrder(o, now)
          );
          setAllOrders(processed);
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

  // Conteos calculados sobre la totalidad de órdenes del mecánico
  const counts = useMemo(() => {
    const activas = allOrders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length;
    const terminadas = allOrders.filter((o) => o.status === 'terminado').length;
    const todas = allOrders.length;
    return { activas, terminadas, todas };
  }, [allOrders]);

  // Filtrado y ordenamiento de la lista
  const sortedAndFilteredData = useMemo(() => {
    let list = allOrders;
    if (filter === WORK_ORDER_FILTERS.ACTIVAS) {
      list = allOrders.filter((o) => ACTIVE_STATUSES.includes(o.status));
    } else if (filter === WORK_ORDER_FILTERS.TERMINADAS) {
      list = allOrders.filter((o) => o.status === 'terminado');
    } else if (filter !== WORK_ORDER_FILTERS.TODAS && filter) {
      list = allOrders.filter((o) => o.status === filter);
    }
    return sortWorkOrders(list);
  }, [allOrders, filter]);

  return {
    data: sortedAndFilteredData,
    counts,
    loading,
    error,
    refresh: fetchOrders,
  };
}
