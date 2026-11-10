import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../src/theme';
import useProduct from '../../../src/hooks/useProduct';
import useStockEntry from '../../../src/hooks/useStockEntry';
import Button from '../../../src/components/ui/Button';
import Badge from '../../../src/components/ui/Badge';
import ConfirmDialog from '../../../src/components/ui/ConfirmDialog';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, radius, fontSize } = useTheme();

  const { data: product, loading, error, refresh } = useProduct(id);
  const { submit: submitStockEntry, loading: submitting } = useStockEntry();

  // Estados para el modal de entrada de mercadería
  const [modalVisible, setModalVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [quantityInput, setQuantityInput] = useState('1');
  const [note, setNote] = useState('');
  const [entryError, setEntryError] = useState(null);

  // Estado para el ConfirmDialog
  const [confirmVisible, setConfirmVisible] = useState(false);

  const stock = Number(product?.stock ?? 0);
  const minStock = Number(product?.min_stock ?? 0);
  const isOut = stock === 0;
  const isLow = !isOut && stock <= minStock;

  // Cálculo de margen comercial
  const cost = Number(product?.cost_price ?? 0);
  const sale = Number(product?.sale_price ?? 0);
  const marginPct = sale > 0 ? (((sale - cost) / sale) * 100).toFixed(1) : '0.0';

  const handleOpenModal = () => {
    setQuantity(1);
    setQuantityInput('1');
    setNote('');
    setEntryError(null);
    setModalVisible(true);
  };

  const handleIncrement = () => {
    const next = Math.min(quantity + 1, 10000);
    setQuantity(next);
    setQuantityInput(String(next));
    setEntryError(null);
  };

  const handleDecrement = () => {
    const next = Math.max(quantity - 1, 1);
    setQuantity(next);
    setQuantityInput(String(next));
    setEntryError(null);
  };

  const handleQuantityTextChange = (text) => {
    setQuantityInput(text);
    const parsed = parseInt(text, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 10000) {
      setQuantity(parsed);
      setEntryError(null);
    }
  };

  const handleProceedToConfirm = () => {
    const parsed = parseInt(quantityInput, 10);
    if (isNaN(parsed) || parsed < 1 || parsed > 10000) {
      setEntryError('La cantidad debe ser un número entero entre 1 y 10000.');
      return;
    }
    if (note.length > 200) {
      setEntryError('La nota no puede superar los 200 caracteres.');
      return;
    }
    setQuantity(parsed);
    setEntryError(null);
    setConfirmVisible(true);
  };

  const handleConfirmStockEntry = async () => {
    if (!product) return;
    const res = await submitStockEntry(product.id, {
      quantity,
      note: note.trim() || undefined,
    });

    setConfirmVisible(false);

    if (!res.success) {
      Alert.alert(
        'Error al registrar entrada',
        res.error || 'No se pudo completar la operación.'
      );
      return;
    }

    setModalVisible(false);
    await refresh();

    Alert.alert(
      'Entrada registrada con éxito',
      `Se sumaron ${quantity} unidades a "${product.name}".\nNuevo stock disponible: ${res.data?.stock}.`
    );
  };

  if (loading && !product) {
    return (
      <View
        style={[
          styles.centerContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          style={[
            styles.loadingText,
            { color: colors.mutedForeground, marginTop: spacing.md },
          ]}
        >
          Cargando producto...
        </Text>
      </View>
    );
  }

  if (error && !product) {
    return (
      <View
        style={[
          styles.centerContainer,
          { backgroundColor: colors.background, padding: spacing.xl },
        ]}
      >
        <Ionicons
          name="alert-circle-outline"
          size={56}
          color={colors.destructive}
        />
        <Text
          style={[
            styles.errorTitle,
            { color: colors.foreground, marginTop: spacing.md },
          ]}
        >
          Error al cargar producto
        </Text>
        <Text
          style={[
            styles.errorMessage,
            {
              color: colors.mutedForeground,
              marginTop: spacing.xs,
              marginBottom: spacing.lg,
            },
          ]}
        >
          {error}
        </Text>
        <Button title="Reintentar" variant="outline" onPress={refresh} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Barra superior con botón volver */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
            paddingTop: Math.max(insets.top, 16),
            paddingHorizontal: spacing.md,
            paddingBottom: spacing.sm,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Volver al inventario"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.topBarTitleContainer}>
          <Text
            style={[
              styles.topBarTitle,
              { color: colors.foreground, fontSize: fontSize.base },
            ]}
            numberOfLines={1}
          >
            {product?.sku || 'Detalle del Repuesto'}
          </Text>
          <Text
            style={[
              styles.topBarSubtitle,
              { color: colors.mutedForeground, fontSize: fontSize.xs },
            ]}
          >
            {product?.brand || 'Almacén'}
          </Text>
        </View>
        <View style={styles.backButtonPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { padding: spacing.md, paddingBottom: 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Tarjeta principal de identificación */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radius.lg,
              padding: spacing.md,
              marginBottom: spacing.md,
            },
          ]}
        >
          <Text
            style={[
              styles.productName,
              { color: colors.foreground, fontSize: fontSize.xl },
            ]}
          >
            {product?.name}
          </Text>

          <View style={[styles.badgesRow, { marginTop: spacing.sm }]}>
            {product?.category ? (
              <Badge label={product.category} variant="outline" style={{ marginRight: 6 }} />
            ) : null}
            {product?.brand ? (
              <Badge label={product.brand} variant="default" style={{ marginRight: 6 }} />
            ) : null}
            <Badge label={`SKU: ${product?.sku}`} variant="outline" />
          </View>
        </View>

        {/* 2. Tarjeta de Stock y Alertas */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radius.lg,
              padding: spacing.md,
              marginBottom: spacing.md,
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.foreground, fontSize: fontSize.xs, marginBottom: spacing.sm },
            ]}
          >
            DISPONIBILIDAD EN ALMACÉN
          </Text>

          <View style={styles.stockRow}>
            <View>
              <Text
                style={[
                  styles.stockMainNumber,
                  {
                    color: isOut
                      ? colors.destructive
                      : isLow
                      ? colors.warning
                      : colors.foreground,
                    fontSize: fontSize['3xl'] || 32,
                  },
                ]}
              >
                {stock}
              </Text>
              <Text
                style={[
                  styles.stockMainLabel,
                  { color: colors.mutedForeground, fontSize: fontSize.xs },
                ]}
              >
                UNIDADES DISPONIBLES
              </Text>
            </View>

            <View style={styles.minStockBox}>
              <Text
                style={[
                  styles.minStockNumber,
                  { color: colors.foreground, fontSize: fontSize.xl },
                ]}
              >
                {minStock}
              </Text>
              <Text
                style={[
                  styles.minStockLabel,
                  { color: colors.mutedForeground, fontSize: fontSize.xs },
                ]}
              >
                STOCK MÍNIMO
              </Text>
            </View>
          </View>

          {/* Estado contextual del stock */}
          {isOut ? (
            <View
              style={[
                styles.alertBanner,
                {
                  backgroundColor: colors.destructive + '15',
                  borderColor: colors.destructive + '40',
                  marginTop: spacing.md,
                },
              ]}
            >
              <Ionicons
                name="alert-circle"
                size={20}
                color={colors.destructive}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles.alertBannerText,
                  { color: colors.destructive, fontSize: fontSize.sm },
                ]}
              >
                Producto agotado. Se requiere entrada urgente.
              </Text>
            </View>
          ) : isLow ? (
            <View
              style={[
                styles.alertBanner,
                {
                  backgroundColor: colors.warning + '15',
                  borderColor: colors.warning + '40',
                  marginTop: spacing.md,
                },
              ]}
            >
              <Ionicons
                name="warning-outline"
                size={20}
                color={colors.warning}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles.alertBannerText,
                  { color: colors.warning, fontSize: fontSize.sm },
                ]}
              >
                Stock bajo: faltan {minStock - stock} unidades para el mínimo.
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.alertBanner,
                {
                  backgroundColor: colors.success + '15',
                  borderColor: colors.success + '40',
                  marginTop: spacing.md,
                },
              ]}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={colors.success}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles.alertBannerText,
                  { color: colors.success, fontSize: fontSize.sm },
                ]}
              >
                Stock óptimo por encima del nivel mínimo de reposición.
              </Text>
            </View>
          )}
        </View>

        {/* 3. Tarjeta de Precios y Margen */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radius.lg,
              padding: spacing.md,
              marginBottom: spacing.md,
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.foreground, fontSize: fontSize.xs, marginBottom: spacing.sm },
            ]}
          >
            PRECIOS Y MARGEN COMERCIAL
          </Text>

          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { color: colors.mutedForeground, fontSize: fontSize.xs }]}>
                PRECIO VENTA
              </Text>
              <Text style={[styles.metricValue, { color: colors.primary, fontSize: fontSize.lg }]}>
                S/ {sale.toFixed(2)}
              </Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { color: colors.mutedForeground, fontSize: fontSize.xs }]}>
                PRECIO COSTO
              </Text>
              <Text style={[styles.metricValue, { color: colors.foreground, fontSize: fontSize.lg }]}>
                S/ {cost.toFixed(2)}
              </Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { color: colors.mutedForeground, fontSize: fontSize.xs }]}>
                MARGEN
              </Text>
              <Text
                style={[
                  styles.metricValue,
                  {
                    color: Number(marginPct) >= 0 ? colors.success : colors.destructive,
                    fontSize: fontSize.lg,
                  },
                ]}
              >
                {marginPct}%
              </Text>
            </View>
          </View>
        </View>

        {/* 4. Tarjeta de Modelos compatibles */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radius.lg,
              padding: spacing.md,
              marginBottom: spacing.md,
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.foreground, fontSize: fontSize.xs, marginBottom: spacing.sm },
            ]}
          >
            MODELOS COMPATIBLES
          </Text>

          {Array.isArray(product?.compatible_models) && product.compatible_models.length > 0 ? (
            <View style={styles.compatibleChipsContainer}>
              {product.compatible_models.map((mod, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.compatChip,
                    {
                      backgroundColor: colors.muted,
                      borderColor: colors.border,
                      borderRadius: radius.md,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.compatChipText,
                      { color: colors.foreground, fontSize: fontSize.xs },
                    ]}
                  >
                    {mod}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text
              style={[
                styles.emptyCompatText,
                { color: colors.mutedForeground, fontSize: fontSize.sm },
              ]}
            >
              Compatible universal o sin modelos restringidos.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* 5. Botón principal fijo abajo con safe area */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: Math.max(insets.bottom, 16),
            paddingHorizontal: spacing.md,
            paddingTop: spacing.sm,
          },
        ]}
      >
        <Button
          title="Registrar entrada"
          variant="primary"
          icon={<Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 6 }} />}
          onPress={handleOpenModal}
          style={styles.actionButton}
        />
      </View>

      {/* Modal / Sheet para registrar entrada de mercadería */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            style={[
              styles.modalSheet,
              {
                backgroundColor: colors.card,
                borderTopColor: colors.border,
                borderTopLeftRadius: radius.lg,
                borderTopRightRadius: radius.lg,
                padding: spacing.lg,
                paddingBottom: Math.max(insets.bottom, 24),
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.modalTitle,
                    { color: colors.foreground, fontSize: fontSize.lg },
                  ]}
                >
                  Entrada de Mercadería
                </Text>
                <Text
                  style={[
                    styles.modalSubtitle,
                    { color: colors.mutedForeground, fontSize: fontSize.xs },
                  ]}
                  numberOfLines={1}
                >
                  {product?.name} · Stock actual: {stock}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={24} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            {/* Selector de cantidad con botones − y + de 48px */}
            <Text
              style={[
                styles.inputLabel,
                { color: colors.foreground, fontSize: fontSize.sm, marginTop: spacing.md },
              ]}
            >
              Cantidad a ingresar *
            </Text>

            <View style={styles.counterRow}>
              <TouchableOpacity
                onPress={handleDecrement}
                accessibilityRole="button"
                accessibilityLabel="Restar una unidad"
                style={[
                  styles.counterButton,
                  {
                    backgroundColor: colors.muted,
                    borderColor: colors.border,
                    borderRadius: radius.md,
                  },
                ]}
              >
                <Ionicons name="remove" size={22} color={colors.foreground} />
              </TouchableOpacity>

              <TextInput
                value={quantityInput}
                onChangeText={handleQuantityTextChange}
                keyboardType="number-pad"
                style={[
                  styles.counterInput,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.foreground,
                    borderRadius: radius.md,
                    fontSize: fontSize.xl,
                  },
                ]}
              />

              <TouchableOpacity
                onPress={handleIncrement}
                accessibilityRole="button"
                accessibilityLabel="Sumar una unidad"
                style={[
                  styles.counterButton,
                  {
                    backgroundColor: colors.muted,
                    borderColor: colors.border,
                    borderRadius: radius.md,
                  },
                ]}
              >
                <Ionicons name="add" size={22} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            {/* Campo de nota opcional */}
            <Text
              style={[
                styles.inputLabel,
                { color: colors.foreground, fontSize: fontSize.sm, marginTop: spacing.md },
              ]}
            >
              Nota o referencia (opcional)
            </Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Ej. Guía 001-492, reposición de proveedor..."
              placeholderTextColor={colors.mutedForeground}
              maxLength={200}
              style={[
                styles.noteInput,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.foreground,
                  borderRadius: radius.md,
                  fontSize: fontSize.sm,
                },
              ]}
            />
            <Text
              style={[
                styles.charCount,
                { color: colors.mutedForeground, fontSize: fontSize.xs - 2 },
              ]}
            >
              {note.length}/200
            </Text>

            {entryError ? (
              <Text
                style={[
                  styles.errorAlertText,
                  { color: colors.destructive, fontSize: fontSize.xs, marginTop: 4 },
                ]}
              >
                {entryError}
              </Text>
            ) : null}

            {/* Botón de acción */}
            <View style={{ marginTop: spacing.lg }}>
              <Button
                title={`Ingresar ${quantity} ${quantity === 1 ? 'unidad' : 'unidades'}`}
                variant="primary"
                onPress={handleProceedToConfirm}
                style={{ minHeight: 48 }}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ConfirmDialog de confirmación de entrada */}
      <ConfirmDialog
        visible={confirmVisible}
        title="¿Confirmar entrada de mercadería?"
        message={`Se sumarán ${quantity} ${quantity === 1 ? 'unidad' : 'unidades'} a "${product?.name}".\n\nEl stock pasará de ${stock} a ${stock + quantity} unidades.`}
        confirmText="Confirmar entrada"
        cancelText="Cancelar"
        loading={submitting}
        onCancel={() => setConfirmVisible(false)}
        onConfirm={handleConfirmStockEntry}
      />
    </KeyboardAvoidingView>
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
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitleContainer: {
    alignItems: 'center',
    maxWidth: '70%',
  },
  topBarTitle: {
    fontWeight: '700',
  },
  topBarSubtitle: {
    marginTop: 1,
  },
  backButtonPlaceholder: {
    width: 44,
  },
  scrollContent: {},
  card: {
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  productName: {
    fontWeight: '800',
    lineHeight: 26,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockMainNumber: {
    fontWeight: '900',
  },
  stockMainLabel: {
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  minStockBox: {
    alignItems: 'flex-end',
  },
  minStockNumber: {
    fontWeight: '800',
  },
  minStockLabel: {
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  alertBannerText: {
    fontWeight: '600',
    flex: 1,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricValue: {
    fontWeight: '800',
  },
  compatibleChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  compatChip: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  compatChipText: {
    fontWeight: '600',
  },
  emptyCompatText: {
    fontStyle: 'italic',
  },
  bottomBar: {
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  actionButton: {
    minHeight: 48,
    width: '100%',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontWeight: '500',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopWidth: 1,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalTitle: {
    fontWeight: '800',
  },
  modalSubtitle: {
    marginTop: 2,
  },
  inputLabel: {
    fontWeight: '600',
    marginBottom: 8,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counterButton: {
    width: 48,
    height: 48,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    marginHorizontal: 12,
    textAlign: 'center',
    fontWeight: '700',
  },
  noteInput: {
    borderWidth: 1,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  charCount: {
    textAlign: 'right',
    marginTop: 4,
  },
  errorAlertText: {
    fontWeight: '600',
  },
});
