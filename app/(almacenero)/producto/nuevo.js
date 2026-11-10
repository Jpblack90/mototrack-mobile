import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../src/theme';
import useCreateProduct from '../../../src/hooks/useCreateProduct';
import ProductForm from '../../../src/components/inventory/ProductForm';

export default function NuevoProductoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, fontSize } = useTheme();
  const { scanData: rawScanData, imageUri } = useLocalSearchParams();

  const { createProduct, loading, error } = useCreateProduct();

  // Parsear datos sugeridos por IA si existen
  const scanResult = useMemo(() => {
    if (!rawScanData) return null;
    try {
      return JSON.parse(rawScanData);
    } catch {
      return null;
    }
  }, [rawScanData]);

  // Armar initialData para ProductForm
  const initialData = useMemo(() => {
    if (scanResult) {
      const suggested = scanResult.suggested_product || {};
      return {
        name: suggested.name || scanResult.detected_name || '',
        brand: suggested.brand || scanResult.detected_brand || '',
        category: suggested.category || scanResult.detected_category || 'Motor',
        sku: suggested.sku || '',
        compatible_models:
          suggested.compatible_models || scanResult.suggested_compatible_models || [],
        cost_price: suggested.cost_price ?? '',
        sale_price: suggested.sale_price ?? '',
        stock: suggested.stock ?? 0,
        min_stock: suggested.min_stock ?? 5,
        ai_confidence: scanResult.confidence,
        requires_confirmation: Boolean(scanResult.requires_confirmation),
        imageUri,
      };
    }
    return {
      name: '',
      brand: '',
      category: 'Motor',
      sku: '',
      compatible_models: [],
      cost_price: '',
      sale_price: '',
      stock: 0,
      min_stock: 5,
    };
  }, [scanResult, imageUri]);

  const handleSubmit = async (formData) => {
    const res = await createProduct(formData);
    if (res && res.success && res.data?.id) {
      // Reemplaza la pantalla actual con el detalle del nuevo producto
      router.replace(`/(almacenero)/producto/${res.data.id}`);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {/* Barra superior con botón volver */}
      <View
        style={[
          styles.topBar,
          {
            borderBottomColor: colors.border,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text
          style={[
            styles.screenTitle,
            { color: colors.foreground, fontSize: fontSize.lg },
          ]}
        >
          {scanResult ? 'Confirmar repuesto escaneado' : 'Registrar producto'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ProductForm
        initialData={initialData}
        isAi={Boolean(scanResult)}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  screenTitle: {
    fontWeight: '700',
  },
});
