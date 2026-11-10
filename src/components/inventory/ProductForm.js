import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { PRODUCT_CATEGORIES } from '../../constants/inventory';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import ConfirmDialog from '../ui/ConfirmDialog';

/**
 * Formulario reutilizable para creación y registro de productos (manual o con sugerencias de IA).
 */
export default function ProductForm({
  initialData = {},
  onSubmit,
  loading = false,
  error = null,
  isAi = false,
}) {
  const { colors, spacing, radius, fontSize } = useTheme();

  // Campos del formulario
  const [name, setName] = useState(initialData.name || '');
  const [brand, setBrand] = useState(initialData.brand || '');
  const [category, setCategory] = useState(initialData.category || PRODUCT_CATEGORIES[0]);
  const [sku, setSku] = useState(initialData.sku || '');
  const [compatibleModels, setCompatibleModels] = useState(
    Array.isArray(initialData.compatible_models) ? initialData.compatible_models : []
  );
  const [newModelInput, setNewModelInput] = useState('');

  const [costPrice, setCostPrice] = useState(
    initialData.cost_price != null ? String(initialData.cost_price) : ''
  );
  const [salePrice, setSalePrice] = useState(
    initialData.sale_price != null ? String(initialData.sale_price) : ''
  );
  const [stock, setStock] = useState(
    initialData.stock != null ? String(initialData.stock) : '0'
  );
  const [minStock, setMinStock] = useState(
    initialData.min_stock != null ? String(initialData.min_stock) : '5'
  );

  // Errores locales de validación
  const [validationErrors, setValidationErrors] = useState({});

  // Modal para seleccionar categoría
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  // ConfirmDialog antes de enviar
  const [confirmVisible, setConfirmVisible] = useState(false);

  // Cálculo en vivo del margen comercial
  const marginCalculation = useMemo(() => {
    const cost = parseFloat(costPrice.replace(',', '.'));
    const sale = parseFloat(salePrice.replace(',', '.'));

    if (isNaN(cost) || isNaN(sale) || sale <= 0) {
      return { valid: false, marginPct: null, isNegative: false };
    }

    const margin = ((sale - cost) / sale) * 100;
    const isNegative = sale <= cost;

    return {
      valid: true,
      marginPct: margin.toFixed(1),
      isNegative,
      cost,
      sale,
    };
  }, [costPrice, salePrice]);

  // Manejo de modelos compatibles (chips)
  const handleAddModel = () => {
    const trimmed = newModelInput.trim();
    if (!trimmed) return;
    if (!compatibleModels.includes(trimmed)) {
      setCompatibleModels([...compatibleModels, trimmed]);
    }
    setNewModelInput('');
  };

  const handleRemoveModel = (modelToRemove) => {
    setCompatibleModels(compatibleModels.filter((m) => m !== modelToRemove));
  };

  // Validación y confirmación
  const handleValidateAndConfirm = () => {
    const errors = {};
    if (!name.trim()) {
      errors.name = 'El nombre del repuesto es obligatorio.';
    }

    const cost = parseFloat(costPrice.replace(',', '.'));
    if (isNaN(cost) || cost < 0) {
      errors.costPrice = 'Ingresa un precio de costo válido (≥ 0).';
    }

    const sale = parseFloat(salePrice.replace(',', '.'));
    if (isNaN(sale) || sale <= 0) {
      errors.salePrice = 'Ingresa un precio de venta mayor a 0.';
    } else if (!isNaN(cost) && sale <= cost) {
      errors.salePrice = 'El precio de venta debe ser mayor al costo.';
    }

    const stockNum = parseInt(stock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      errors.stock = 'El stock inicial debe ser un entero ≥ 0.';
    }

    const minStockNum = parseInt(minStock, 10);
    if (isNaN(minStockNum) || minStockNum < 0) {
      errors.minStock = 'El stock mínimo debe ser un entero ≥ 0.';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    setConfirmVisible(true);
  };

  const handleConfirmSubmit = () => {
    setConfirmVisible(false);

    const cost = parseFloat(costPrice.replace(',', '.'));
    const sale = parseFloat(salePrice.replace(',', '.'));
    const stockNum = parseInt(stock, 10) || 0;
    const minStockNum = parseInt(minStock, 10) || 0;

    onSubmit({
      name: name.trim(),
      brand: brand.trim() || undefined,
      category: category || undefined,
      sku: sku.trim() || undefined,
      compatible_models: compatibleModels.length > 0 ? compatibleModels : undefined,
      cost_price: cost,
      sale_price: sale,
      stock: stockNum,
      min_stock: minStockNum,
      registration_method: isAi ? 'ia' : 'manual',
      ai_confidence: isAi && initialData.ai_confidence != null ? initialData.ai_confidence : null,
    });
  };

  const aiConfidence = initialData.ai_confidence;
  const requiresConfirmation = initialData.requires_confirmation;
  const imageUri = initialData.imageUri;

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { padding: spacing.md }]}
      keyboardShouldPersistTaps="handled"
    >
      {/* Tarjeta superior de IA si aplica */}
      {isAi && (
        <View
          style={[
            styles.aiCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radius.md,
              padding: spacing.md,
              marginBottom: spacing.md,
            },
          ]}
        >
          <View style={styles.aiHeader}>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={[styles.thumbnail, { borderRadius: radius.sm }]}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  styles.thumbnailPlaceholder,
                  { backgroundColor: colors.muted, borderRadius: radius.sm },
                ]}
              >
                <Ionicons name="sparkles" size={24} color={colors.primary} />
              </View>
            )}

            <View style={styles.aiHeaderInfo}>
              <View style={styles.badgeRow}>
                <Badge
                  label={`Sugerido por IA · ${aiConfidence ?? 85}%`}
                  variant="outline"
                  size="md"
                />
              </View>
              <Text
                style={[
                  styles.aiSubtitle,
                  { color: colors.mutedForeground, fontSize: fontSize.xs, marginTop: 4 },
                ]}
              >
                Datos detectados automáticamente. Puedes editarlos antes de guardar.
              </Text>
            </View>
          </View>

          {requiresConfirmation && (
            <View
              style={[
                styles.warningBox,
                {
                  backgroundColor: 'rgba(131, 67, 0, 0.08)',
                  borderColor: colors.warning,
                  borderRadius: radius.sm,
                  padding: spacing.sm,
                  marginTop: spacing.sm,
                },
              ]}
            >
              <View style={styles.warningRow}>
                <Ionicons name="warning-outline" size={18} color={colors.warning} />
                <Text
                  style={[
                    styles.warningText,
                    { color: colors.warning, fontSize: fontSize.xs, marginLeft: 6 },
                  ]}
                >
                  La IA no está segura. Revisa nombre, marca y categoría antes de guardar.
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Mensaje de error general si viene de la API */}
      {error && (
        <View
          style={[
            styles.apiErrorBox,
            {
              backgroundColor: 'rgba(184, 30, 0, 0.08)',
              borderColor: colors.destructive,
              borderRadius: radius.sm,
              padding: spacing.sm,
              marginBottom: spacing.md,
            },
          ]}
        >
          <Ionicons name="alert-circle" size={18} color={colors.destructive} />
          <Text
            style={[
              styles.apiErrorText,
              { color: colors.destructive, fontSize: fontSize.sm, marginLeft: 8 },
            ]}
          >
            {error}
          </Text>
        </View>
      )}

      {/* Campo: Nombre del producto (requerido) */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.foreground, fontSize: fontSize.sm }]}>
          Nombre del repuesto <Text style={{ color: colors.primary }}>*</Text>
        </Text>
        <TextInput
          value={name}
          onChangeText={(val) => {
            setName(val);
            if (validationErrors.name) setValidationErrors({ ...validationErrors, name: null });
          }}
          placeholder="Ej. Pastillas de freno delanteras"
          placeholderTextColor={colors.mutedForeground}
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              color: colors.foreground,
              borderColor: validationErrors.name ? colors.destructive : colors.border,
              borderRadius: radius.md,
              fontSize: fontSize.md,
            },
          ]}
        />
        {validationErrors.name && (
          <Text style={[styles.fieldError, { color: colors.destructive, fontSize: fontSize.xs }]}>
            {validationErrors.name}
          </Text>
        )}
      </View>

      {/* Fila: Marca y SKU */}
      <View style={styles.twoColRow}>
        <View style={[styles.fieldGroup, { flex: 1, marginRight: spacing.sm }]}>
          <Text style={[styles.label, { color: colors.foreground, fontSize: fontSize.sm }]}>
            Marca
          </Text>
          <TextInput
            value={brand}
            onChangeText={setBrand}
            placeholder="Ej. Nissin, Bosch"
            placeholderTextColor={colors.mutedForeground}
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                color: colors.foreground,
                borderColor: colors.border,
                borderRadius: radius.md,
                fontSize: fontSize.md,
              },
            ]}
          />
        </View>

        <View style={[styles.fieldGroup, { flex: 1 }]}>
          <Text style={[styles.label, { color: colors.foreground, fontSize: fontSize.sm }]}>
            Código / SKU
          </Text>
          <TextInput
            value={sku}
            onChangeText={setSku}
            placeholder="Ej. BRK-FZ25"
            placeholderTextColor={colors.mutedForeground}
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                color: colors.foreground,
                borderColor: colors.border,
                borderRadius: radius.md,
                fontSize: fontSize.md,
              },
            ]}
          />
        </View>
      </View>

      {/* Campo: Categoría */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.foreground, fontSize: fontSize.sm }]}>
          Categoría
        </Text>
        <TouchableOpacity
          onPress={() => setCategoryModalVisible(true)}
          activeOpacity={0.7}
          style={[
            styles.selectorButton,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radius.md,
              paddingHorizontal: spacing.md,
            },
          ]}
        >
          <Text style={[styles.selectorText, { color: colors.foreground, fontSize: fontSize.md }]}>
            {category || 'Seleccionar categoría'}
          </Text>
          <Ionicons name="chevron-down" size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      {/* Campo: Modelos compatibles (chips editables) */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.foreground, fontSize: fontSize.sm }]}>
          Modelos compatibles
        </Text>

        <View style={styles.chipsContainer}>
          {compatibleModels.map((model) => (
            <View
              key={model}
              style={[
                styles.modelChip,
                {
                  backgroundColor: colors.muted,
                  borderColor: colors.border,
                  borderRadius: radius.full,
                },
              ]}
            >
              <Text
                style={[
                  styles.modelChipText,
                  { color: colors.foreground, fontSize: fontSize.xs },
                ]}
              >
                {model}
              </Text>
              <TouchableOpacity
                onPress={() => handleRemoveModel(model)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.chipRemoveButton}
              >
                <Ionicons name="close" size={14} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          ))}
          {compatibleModels.length === 0 && (
            <Text
              style={[
                styles.noChipsText,
                { color: colors.mutedForeground, fontSize: fontSize.xs },
              ]}
            >
              No hay modelos agregados aún.
            </Text>
          )}
        </View>

        {/* Input para agregar modelo */}
        <View style={styles.addModelRow}>
          <TextInput
            value={newModelInput}
            onChangeText={setNewModelInput}
            placeholder="Agregar modelo (ej. Yamaha FZ25)"
            placeholderTextColor={colors.mutedForeground}
            onSubmitEditing={handleAddModel}
            returnKeyType="done"
            style={[
              styles.addModelInput,
              {
                backgroundColor: colors.card,
                color: colors.foreground,
                borderColor: colors.border,
                borderRadius: radius.md,
                fontSize: fontSize.sm,
              },
            ]}
          />
          <TouchableOpacity
            onPress={handleAddModel}
            style={[
              styles.addModelBtn,
              {
                backgroundColor: colors.primary,
                borderRadius: radius.md,
                marginLeft: spacing.sm,
              },
            ]}
          >
            <Ionicons name="add" size={22} color={colors.primaryForeground} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Fila: Precios y margen */}
      <View style={styles.twoColRow}>
        <View style={[styles.fieldGroup, { flex: 1, marginRight: spacing.sm }]}>
          <Text style={[styles.label, { color: colors.foreground, fontSize: fontSize.sm }]}>
            Precio de costo (S/) <Text style={{ color: colors.primary }}>*</Text>
          </Text>
          <TextInput
            value={costPrice}
            onChangeText={(val) => {
              setCostPrice(val);
              if (validationErrors.costPrice) {
                setValidationErrors({ ...validationErrors, costPrice: null });
              }
            }}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={colors.mutedForeground}
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                color: colors.foreground,
                borderColor: validationErrors.costPrice ? colors.destructive : colors.border,
                borderRadius: radius.md,
                fontSize: fontSize.md,
              },
            ]}
          />
          {validationErrors.costPrice && (
            <Text
              style={[styles.fieldError, { color: colors.destructive, fontSize: fontSize.xs }]}
            >
              {validationErrors.costPrice}
            </Text>
          )}
        </View>

        <View style={[styles.fieldGroup, { flex: 1 }]}>
          <Text style={[styles.label, { color: colors.foreground, fontSize: fontSize.sm }]}>
            Precio de venta (S/) <Text style={{ color: colors.primary }}>*</Text>
          </Text>
          <TextInput
            value={salePrice}
            onChangeText={(val) => {
              setSalePrice(val);
              if (validationErrors.salePrice) {
                setValidationErrors({ ...validationErrors, salePrice: null });
              }
            }}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={colors.mutedForeground}
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                color: colors.foreground,
                borderColor: validationErrors.salePrice ? colors.destructive : colors.border,
                borderRadius: radius.md,
                fontSize: fontSize.md,
              },
            ]}
          />
          {validationErrors.salePrice && (
            <Text
              style={[styles.fieldError, { color: colors.destructive, fontSize: fontSize.xs }]}
            >
              {validationErrors.salePrice}
            </Text>
          )}
        </View>
      </View>

      {/* Margen comercial en vivo */}
      <View
        style={[
          styles.marginContainer,
          {
            backgroundColor: marginCalculation.valid
              ? marginCalculation.isNegative
                ? 'rgba(184, 30, 0, 0.08)'
                : 'rgba(0, 115, 19, 0.08)'
              : colors.muted,
            borderColor: marginCalculation.valid
              ? marginCalculation.isNegative
                ? colors.destructive
                : colors.success
              : colors.border,
            borderRadius: radius.md,
            padding: spacing.sm,
            marginBottom: spacing.md,
          },
        ]}
      >
        {marginCalculation.valid ? (
          marginCalculation.isNegative ? (
            <View style={styles.marginRow}>
              <Ionicons name="close-circle" size={18} color={colors.destructive} />
              <Text
                style={[
                  styles.marginText,
                  { color: colors.destructive, fontSize: fontSize.xs, marginLeft: 6 },
                ]}
              >
                El precio de venta debe ser mayor al costo (Margen: {marginCalculation.marginPct}%)
              </Text>
            </View>
          ) : (
            <View style={styles.marginRow}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text
                style={[
                  styles.marginText,
                  { color: colors.success, fontSize: fontSize.xs, marginLeft: 6 },
                ]}
              >
                Margen comercial: +{marginCalculation.marginPct}% de ganancia
              </Text>
            </View>
          )
        ) : (
          <Text
            style={[
              styles.marginText,
              { color: colors.mutedForeground, fontSize: fontSize.xs },
            ]}
          >
            Ingresa costo y venta para calcular el margen comercial en vivo.
          </Text>
        )}
      </View>

      {/* Fila: Stock inicial y Stock mínimo */}
      <View style={styles.twoColRow}>
        <View style={[styles.fieldGroup, { flex: 1, marginRight: spacing.sm }]}>
          <Text style={[styles.label, { color: colors.foreground, fontSize: fontSize.sm }]}>
            Stock inicial
          </Text>
          <TextInput
            value={stock}
            onChangeText={(val) => {
              setStock(val);
              if (validationErrors.stock) {
                setValidationErrors({ ...validationErrors, stock: null });
              }
            }}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={colors.mutedForeground}
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                color: colors.foreground,
                borderColor: validationErrors.stock ? colors.destructive : colors.border,
                borderRadius: radius.md,
                fontSize: fontSize.md,
              },
            ]}
          />
          {validationErrors.stock && (
            <Text
              style={[styles.fieldError, { color: colors.destructive, fontSize: fontSize.xs }]}
            >
              {validationErrors.stock}
            </Text>
          )}
        </View>

        <View style={[styles.fieldGroup, { flex: 1 }]}>
          <Text style={[styles.label, { color: colors.foreground, fontSize: fontSize.sm }]}>
            Stock mínimo
          </Text>
          <TextInput
            value={minStock}
            onChangeText={(val) => {
              setMinStock(val);
              if (validationErrors.minStock) {
                setValidationErrors({ ...validationErrors, minStock: null });
              }
            }}
            keyboardType="number-pad"
            placeholder="5"
            placeholderTextColor={colors.mutedForeground}
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                color: colors.foreground,
                borderColor: validationErrors.minStock ? colors.destructive : colors.border,
                borderRadius: radius.md,
                fontSize: fontSize.md,
              },
            ]}
          />
          {validationErrors.minStock && (
            <Text
              style={[styles.fieldError, { color: colors.destructive, fontSize: fontSize.xs }]}
            >
              {validationErrors.minStock}
            </Text>
          )}
        </View>
      </View>

      {/* Botón principal de guardado */}
      <View style={[styles.submitContainer, { marginTop: spacing.md }]}>
        <Button
          title={loading ? 'Guardando producto…' : 'Guardar producto'}
          variant="primary"
          onPress={handleValidateAndConfirm}
          disabled={loading || (marginCalculation.valid && marginCalculation.isNegative)}
          loading={loading}
          style={styles.submitBtn}
        />
      </View>

      {/* Modal de selección de categoría */}
      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setCategoryModalVisible(false)}
        >
          <Pressable
            style={[
              styles.modalSheet,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderTopLeftRadius: radius.lg,
                borderTopRightRadius: radius.lg,
                padding: spacing.md,
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  { color: colors.foreground, fontSize: fontSize.md },
                ]}
              >
                Seleccionar categoría
              </Text>
              <TouchableOpacity
                onPress={() => setCategoryModalVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.categoryList}>
              {PRODUCT_CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => {
                      setCategory(cat);
                      setCategoryModalVisible(false);
                    }}
                    style={[
                      styles.categoryOption,
                      {
                        borderBottomColor: colors.border,
                        backgroundColor: isSelected
                          ? 'rgba(197, 2, 32, 0.08)'
                          : 'transparent',
                        paddingVertical: spacing.md,
                        paddingHorizontal: spacing.sm,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        {
                          color: isSelected ? colors.primary : colors.foreground,
                          fontSize: fontSize.md,
                          fontWeight: isSelected ? '700' : '400',
                        },
                      ]}
                    >
                      {cat}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ConfirmDialog con el resumen del producto antes de guardar */}
      <ConfirmDialog
        visible={confirmVisible}
        title="¿Registrar producto?"
        message={`¿Deseas registrar este repuesto en el inventario?\n\n• Nombre: ${name.trim()}\n• Categoría: ${category}\n• Costo: S/ ${costPrice} | Venta: S/ ${salePrice}\n• Stock inicial: ${stock || 0}`}
        confirmText="Confirmar y guardar"
        cancelText="Volver y revisar"
        loading={loading}
        onCancel={() => setConfirmVisible(false)}
        onConfirm={handleConfirmSubmit}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  aiCard: {
    borderWidth: 1,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 60,
    height: 60,
  },
  thumbnailPlaceholder: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  aiSubtitle: {
    lineHeight: 16,
  },
  warningBox: {
    borderWidth: 1,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningText: {
    flex: 1,
    fontWeight: '500',
    lineHeight: 16,
  },
  apiErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  apiErrorText: {
    flex: 1,
    fontWeight: '500',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  twoColRow: {
    flexDirection: 'row',
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  fieldError: {
    marginTop: 4,
    fontWeight: '500',
  },
  selectorButton: {
    height: 48,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorText: {
    fontWeight: '500',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  modelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  modelChipText: {
    fontWeight: '500',
    marginRight: 6,
  },
  chipRemoveButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noChipsText: {
    fontStyle: 'italic',
    paddingVertical: 4,
  },
  addModelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addModelInput: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  addModelBtn: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  marginContainer: {
    borderWidth: 1,
  },
  marginRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  marginText: {
    flex: 1,
    fontWeight: '600',
  },
  submitContainer: {
    marginBottom: 20,
  },
  submitBtn: {
    minHeight: 48,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopWidth: 1,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e7',
  },
  modalTitle: {
    fontWeight: '700',
  },
  categoryList: {
    marginTop: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  categoryOptionText: {},
});
