import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import client from '../api/client';

/**
 * Hook para escanear e identificar repuestos con IA a través de cámara o galería.
 * Reduce la imagen a 1280 px de lado mayor, JPEG 0.8, y envía POST /api/inventory/scan.
 */
export default function useProductScan() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorCode, setErrorCode] = useState(null);
  const [result, setResult] = useState(null);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setErrorCode(null);
    setResult(null);
  }, []);

  const scan = useCallback(async (imageUri) => {
    if (!imageUri) return null;
    setLoading(true);
    setError(null);
    setErrorCode(null);

    try {
      // 1. Obtener imagen original usando la API contextual de expo-image-manipulator
      const initialRef = await ImageManipulator.manipulate(imageUri).renderAsync();
      const maxSide = 1280;
      let finalRef = initialRef;

      // 2. Escalar lado mayor a 1280 px conservando relación de aspecto
      if (initialRef.width > maxSide || initialRef.height > maxSide) {
        if (initialRef.width >= initialRef.height) {
          finalRef = await ImageManipulator.manipulate(initialRef)
            .resize({ width: maxSide })
            .renderAsync();
        } else {
          finalRef = await ImageManipulator.manipulate(initialRef)
            .resize({ height: maxSide })
            .renderAsync();
        }
      }

      // 3. Guardar en formato JPEG compresión 0.8 con base64
      const saved = await finalRef.saveAsync({
        format: SaveFormat.JPEG,
        compress: 0.8,
        base64: true,
      });

      // 4. POST /api/inventory/scan
      const res = await client.post('/inventory/scan', {
        image_base64: saved.base64,
        mime_type: 'image/jpeg',
      });

      const scanData = res.data?.data;
      setResult(scanData);
      return { success: true, data: scanData, processedUri: saved.uri };
    } catch (err) {
      const code = err.response?.data?.error?.code || err.code || null;
      const msg =
        err.response?.data?.error?.message ||
        err.userMessage ||
        err.message ||
        'Error al analizar la imagen con IA.';

      setError(msg);
      setErrorCode(code);
      return { success: false, error: msg, code };
    } finally {
      setLoading(false);
    }
  }, []);

  const takePhoto = useCallback(async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      return {
        canceled: true,
        permissionDenied: true,
        error: 'Permiso de cámara no concedido',
      };
    }
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 1,
    });
    if (res.canceled || !res.assets?.[0]?.uri) {
      return { canceled: true };
    }
    return {
      canceled: false,
      uri: res.assets[0].uri,
      width: res.assets[0].width,
      height: res.assets[0].height,
    };
  }, []);

  const pickFromGallery = useCallback(async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      return {
        canceled: true,
        permissionDenied: true,
        error: 'Permiso de galería no concedido',
      };
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });
    if (res.canceled || !res.assets?.[0]?.uri) {
      return { canceled: true };
    }
    return {
      canceled: false,
      uri: res.assets[0].uri,
      width: res.assets[0].width,
      height: res.assets[0].height,
    };
  }, []);

  return {
    loading,
    error,
    errorCode,
    result,
    scan,
    reset,
    takePhoto,
    pickFromGallery,
  };
}
