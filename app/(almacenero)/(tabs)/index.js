import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../../../src/theme';
import useInventory, {
  STOCK_STATUS_FILTERS,
} from '../../../src/hooks/useInventory';
import Button from '../../../src/components/ui/Button';
import EmptyState from '../../../src/components/ui/EmptyState';

export default function AlmaceneroInventoryScreen() {
  const router = useRouter();
  const { colors, spacing, radius, fontSize } = useTheme();

  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(
    STOCK_STATUS_FILTERS.ALL
  );
  const [refreshing, setRefreshing] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);

  const { data, loading, error, refresh } = useInventory({
    search: searchText,
    stockStatus: selectedStatus,
  });

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const renderChip = (key, label) => {
    const isSelected = selectedStatus === key;
    return (
      <TouchableOpacity
        key={key}
        onPress={() => setSelectedStatus(key)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
        style={[
          styles.chip,
          {
            backgroundColor: isSelected ? colors.primary : colors.card,
            borderColor: isSelected ? colors.primary : colors.border,
            borderRadius: radius.full,
            paddingHorizontal: spacing.md,
          },
        ]}
      >
        <Text
          style={[
            styles.chipText,
            {
              color: isSelected ? colors.primaryForeground : colors.foreground,
              fontSize: fontSize.sm,
              fontWeight: isSelected ? '700' : '500',
            },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderProductItem = ({ item }) => {
    const stock = Number(item.stock ?? 0);
    const minStock = Number(item.min_stock ?? 0);
    const isOut = stock === 0;
    const isLow = !isOut && stock <= minStock;

    let stockColor = colors.foreground;
    let stockLabel = 'en stock';

    if (isOut) {
      stockColor = colors.destructive;
      stockLabel = 'agotado';
    } else if (isLow) {
      stockColor = colors.warning;
      stockLabel = 'stock bajo';
    }

    const brandSku = [item.brand, item.sku].filter(Boolean).join(' · ');

    return (
      <Pressable
        onPress={() => router.push(`/(almacenero)/producto/${item.id}`)}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, stock ${stock}`}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: radius.lg,
            padding: spacing.md,
            marginBottom: spacing.sm + 4,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <View style={styles.cardContent}>
          {/* Columna izquierda: Información del repuesto */}
          <View style={styles.leftInfo}>
            <Text
              style={[
                styles.productName,
                { color: colors.foreground, fontSize: fontSize.base },
              ]}
              numberOfLines={2}
            >
              {item.name}
            </Text>
            {brandSku ? (
              <Text
                style={[
                  styles.brandSkuText,
                  {
                    color: colors.mutedForeground,
                    fontSize: fontSize.xs,
                    marginTop: 2,
                  },
                ]}
                numberOfLines={1}
              >
                {brandSku}
              </Text>
            ) : null}
            <Text
              style={[
                styles.priceText,
                {
                  color: colors.primary,
                  fontSize: fontSize.sm,
                  fontWeight: '700',
                  marginTop: spacing.xs,
                },
              ]}
            >
              S/ {Number(item.sale_price ?? 0).toFixed(2)}
            </Text>
          </View>

          {/* Columna derecha: Stock numérico grande y Chevron */}
          <View style={styles.rightStockContainer}>
            <View style={styles.stockTextWrapper}>
              <Text
                style={[
                  styles.stockNumber,
                  { color: stockColor, fontSize: fontSize['2xl'] },
                ]}
              >
                {stock}
              </Text>
              <Text
                style={[
                  styles.stockStatusLabel,
                  { color: stockColor, fontSize: fontSize.xs - 2 },
                ]}
              >
                {stockLabel}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.mutedForeground}
              style={{ marginLeft: 6 }}
            />
          </View>
        </View>
      </Pressable>
    );
  };

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4].map((key) => (
        <View
          key={key}
          style={[
            styles.card,
            styles.skeletonCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radius.lg,
              padding: spacing.md,
              marginBottom: spacing.sm + 4,
            },
          ]}
        >
          <View style={styles.cardContent}>
            <View style={{ flex: 1 }}>
              <View
                style={[
                  styles.skeletonBox,
                  {
                    width: '75%',
                    height: 18,
                    backgroundColor: colors.muted,
                    borderRadius: radius.sm,
                  },
                ]}
              />
              <View
                style={[
                  styles.skeletonBox,
                  {
                    width: '45%',
                    height: 14,
                    backgroundColor: colors.muted,
                    borderRadius: radius.sm,
                    marginTop: 6,
                  },
                ]}
              />
              <View
                style={[
                  styles.skeletonBox,
                  {
                    width: 70,
                    height: 16,
                    backgroundColor: colors.muted,
                    borderRadius: radius.sm,
                    marginTop: 8,
                  },
                ]}
              />
            </View>
            <View
              style={[
                styles.skeletonBox,
                {
                  width: 50,
                  height: 36,
                  backgroundColor: colors.muted,
                  borderRadius: radius.sm,
                },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: colors.background, paddingHorizontal: spacing.md },
      ]}
    >
      {/* Buscador de repuestos */}
      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: radius.md,
            marginTop: spacing.sm,
            paddingHorizontal: spacing.sm + 4,
          },
        ]}
      >
        <Ionicons
          name="search-outline"
          size={20}
          color={colors.mutedForeground}
        />
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Buscar repuesto, marca o SKU..."
          placeholderTextColor={colors.mutedForeground}
          style={[
            styles.searchInput,
            { color: colors.foreground, fontSize: fontSize.sm },
          ]}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
        {searchText.length > 0 ? (
          <TouchableOpacity
            onPress={() => setSearchText('')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="close-circle"
              size={18}
              color={colors.mutedForeground}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Chips de filtro */}
      <View style={[styles.chipsContainer, { marginVertical: spacing.sm + 2 }]}>
        {renderChip(STOCK_STATUS_FILTERS.ALL, 'Todos')}
        {renderChip(STOCK_STATUS_FILTERS.LOW, 'Stock bajo')}
        {renderChip(STOCK_STATUS_FILTERS.OUT, 'Agotado')}
      </View>

      {/* Estados: Error inicial, Skeleton o Lista */}
      {error && (!data || data.length === 0) ? (
        <View style={styles.centerContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={56}
            color={colors.destructive}
          />
          <Text
            style={[
              styles.errorText,
              {
                color: colors.foreground,
                fontSize: fontSize.base,
                marginTop: spacing.sm,
                marginBottom: spacing.md,
                textAlign: 'center',
              },
            ]}
          >
            {error}
          </Text>
          <Button
            title="Reintentar"
            variant="outline"
            onPress={refresh}
            style={styles.retryButton}
          />
        </View>
      ) : loading && (!data || data.length === 0) ? (
        renderSkeleton()
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderProductItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: 110 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={
                <Ionicons
                  name="cube-outline"
                  size={56}
                  color={colors.mutedForeground}
                />
              }
              title="No hay productos que coincidan"
              description="Prueba ajustando los filtros o el término de búsqueda."
            />
          }
        />
      )}

      {/* Botón flotante (FAB) rojo de 56 px */}
      <TouchableOpacity
        onPress={() => setOptionsVisible(true)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Agregar nuevo repuesto"
        style={[
          styles.fab,
          {
            backgroundColor: colors.primary,
          },
        ]}
      >
        <Ionicons name="add" size={32} color={colors.primaryForeground} />
      </TouchableOpacity>

      {/* Hoja modal de opciones: Escanear con IA / Registrar manualmente */}
      <Modal
        visible={optionsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOptionsVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setOptionsVisible(false)}
        >
          <Pressable
            style={[
              styles.optionsSheet,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderTopLeftRadius: radius.lg,
                borderTopRightRadius: radius.lg,
                padding: spacing.lg,
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.sheetHandle} />

            <Text
              style={[
                styles.optionsTitle,
                { color: colors.foreground, fontSize: fontSize.lg },
              ]}
            >
              Agregar repuesto
            </Text>
            <Text
              style={[
                styles.optionsSubtitle,
                {
                  color: colors.mutedForeground,
                  fontSize: fontSize.xs,
                  marginTop: 2,
                  marginBottom: spacing.md,
                },
              ]}
            >
              Selecciona cómo deseas ingresar el repuesto al inventario
            </Text>

            {/* Opción 1: Escanear con IA */}
            <TouchableOpacity
              onPress={() => {
                setOptionsVisible(false);
                router.push('/(almacenero)/producto/escanear');
              }}
              style={[
                styles.optionRow,
                {
                  backgroundColor: 'rgba(197, 2, 32, 0.06)',
                  borderColor: colors.primary,
                  borderRadius: radius.md,
                  padding: spacing.md,
                  marginBottom: spacing.sm,
                },
              ]}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.optionIconBox,
                  { backgroundColor: colors.primary, borderRadius: radius.full },
                ]}
              >
                <Ionicons
                  name="sparkles"
                  size={20}
                  color={colors.primaryForeground}
                />
              </View>
              <View style={styles.optionTextContainer}>
                <Text
                  style={[
                    styles.optionLabel,
                    { color: colors.foreground, fontSize: fontSize.md },
                  ]}
                >
                  Escanear con IA
                </Text>
                <Text
                  style={[
                    styles.optionSublabel,
                    { color: colors.mutedForeground, fontSize: fontSize.xs },
                  ]}
                >
                  Identifica marca, modelo y categoría desde una foto
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.mutedForeground}
              />
            </TouchableOpacity>

            {/* Opción 2: Registrar manualmente */}
            <TouchableOpacity
              onPress={() => {
                setOptionsVisible(false);
                router.push('/(almacenero)/producto/nuevo');
              }}
              style={[
                styles.optionRow,
                {
                  backgroundColor: colors.muted,
                  borderColor: colors.border,
                  borderRadius: radius.md,
                  padding: spacing.md,
                  marginBottom: spacing.lg,
                },
              ]}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.optionIconBox,
                  { backgroundColor: colors.border, borderRadius: radius.full },
                ]}
              >
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={colors.foreground}
                />
              </View>
              <View style={styles.optionTextContainer}>
                <Text
                  style={[
                    styles.optionLabel,
                    { color: colors.foreground, fontSize: fontSize.md },
                  ]}
                >
                  Registrar manualmente
                </Text>
                <Text
                  style={[
                    styles.optionSublabel,
                    { color: colors.mutedForeground, fontSize: fontSize.xs },
                  ]}
                >
                  Ingresa todos los campos en el formulario tradicional
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.mutedForeground}
              />
            </TouchableOpacity>

            <Button
              title="Cancelar"
              variant="outline"
              onPress={() => setOptionsVisible(false)}
              style={styles.cancelBtn}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 46,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    marginRight: 4,
    paddingVertical: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    minHeight: 38,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: {
    letterSpacing: 0.2,
  },
  card: {
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftInfo: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontWeight: '700',
    lineHeight: 20,
  },
  brandSkuText: {
    fontWeight: '500',
  },
  priceText: {
    letterSpacing: 0.2,
  },
  rightStockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockTextWrapper: {
    alignItems: 'flex-end',
  },
  stockNumber: {
    fontWeight: '900',
    lineHeight: 28,
  },
  stockStatusLabel: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  listContent: {
    paddingTop: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontWeight: '500',
  },
  retryButton: {
    minHeight: 48,
    minWidth: 150,
  },
  skeletonContainer: {
    paddingTop: 4,
  },
  skeletonCard: {
    opacity: 0.6,
  },
  skeletonBox: {},
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 99,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  optionsSheet: {
    borderTopWidth: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#71717a50',
    alignSelf: 'center',
    marginBottom: 12,
  },
  optionsTitle: {
    fontWeight: '700',
  },
  optionsSubtitle: {},
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 56,
  },
  optionIconBox: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  optionLabel: {
    fontWeight: '700',
  },
  optionSublabel: {
    marginTop: 2,
    lineHeight: 16,
  },
  cancelBtn: {
    minHeight: 48,
  },
});
