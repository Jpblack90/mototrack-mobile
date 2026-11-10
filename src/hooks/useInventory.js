import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';

export const STOCK_STATUS_FILTERS = {
  ALL: 'all',
  LOW: 'low',
  OUT: 'out',
};

/**
 * Hook para consultar el catálogo de inventario con búsqueda debounceada (400ms)
 * y filtrado por estado de stock (all | low | out).
 *
 * @param {{ search?: string, stockStatus?: string }} params
 */
export default function useInventory({ search = '', stockStatus = STOCK_STATUS_FILTERS.ALL } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Debounce de 400ms para el término de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (debouncedSearch && debouncedSearch.trim() !== '') {
        params.search = debouncedSearch.trim();
      }
      if (stockStatus && stockStatus !== STOCK_STATUS_FILTERS.ALL) {
        params.stock_status = stockStatus;
      }

      const res = await client.get('/inventory', { params });
      setData(res.data?.data ?? []);
    } catch (err) {
      setError(
        err.userMessage ||
          err.message ||
          'Error al cargar el inventario de repuestos.'
      );
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, stockStatus]);

  useEffect(() => {
    let isMounted = true;
    const params = {};
    if (debouncedSearch && debouncedSearch.trim() !== '') {
      params.search = debouncedSearch.trim();
    }
    if (stockStatus && stockStatus !== STOCK_STATUS_FILTERS.ALL) {
      params.stock_status = stockStatus;
    }

    client
      .get('/inventory', { params })
      .then((res) => {
        if (isMounted) {
          setData(res.data?.data ?? []);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            err.userMessage ||
              err.message ||
              'Error al cargar el inventario de repuestos.'
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
  }, [debouncedSearch, stockStatus]);

  return {
    data,
    loading,
    error,
    refresh: fetchInventory,
  };
}
