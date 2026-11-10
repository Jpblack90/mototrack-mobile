import { useState, useCallback } from 'react';
import client from '../api/client';
import { emitStockAlertsUpdated } from './useStockAlerts';

/**
 * Hook para registrar un producto en el inventario.
 * POST /api/inventory
 */
export default function useCreateProduct() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorCode, setErrorCode] = useState(null);

  const createProduct = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    setErrorCode(null);

    // Aseguramos que nunca se envíe force
    const cleanPayload = {
      name: String(payload.name || '').trim(),
      brand: payload.brand ? String(payload.brand).trim() : undefined,
      category: payload.category ? String(payload.category).trim() : undefined,
      sku: payload.sku ? String(payload.sku).trim() : undefined,
      compatible_models:
        Array.isArray(payload.compatible_models) && payload.compatible_models.length > 0
          ? payload.compatible_models.map((m) => String(m).trim()).filter(Boolean)
          : undefined,
      cost_price: Number(payload.cost_price),
      sale_price: Number(payload.sale_price),
      stock: Number(payload.stock ?? 0),
      min_stock: Number(payload.min_stock ?? 5),
      registration_method: payload.registration_method === 'ia' ? 'ia' : 'manual',
      ai_confidence:
        payload.registration_method === 'ia' && payload.ai_confidence != null
          ? Number(payload.ai_confidence)
          : null,
    };

    try {
      const res = await client.post('/inventory', cleanPayload);
      emitStockAlertsUpdated();
      return { success: true, data: res.data?.data };
    } catch (err) {
      const code = err.response?.data?.error?.code || err.code || null;
      let msg =
        err.response?.data?.error?.message ||
        err.userMessage ||
        err.message ||
        'Error al crear el producto.';

      // Si el backend responde NEGATIVE_MARGIN, mostrar mensaje amigable sin detalles de force
      if (code === 'NEGATIVE_MARGIN' || msg.includes('margen negativo')) {
        msg = 'El precio de venta debe ser mayor al costo.';
      }

      setError(msg);
      setErrorCode(code);
      return { success: false, error: msg, code };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createProduct,
    loading,
    error,
    errorCode,
  };
}
