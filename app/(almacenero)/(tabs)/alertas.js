import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../../../src/theme';
import useStockAlerts from '../../../src/hooks/useStockAlerts';
import Badge from '../../../src/components/ui/Badge';
import Button from '../../../src/components/ui/Button';
import EmptyState from '../../../src/components/ui/EmptyState';

export default function AlmaceneroAlertsScreen() {
  const router = useRouter();
  const { colors, spacing, radius, fontSize } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const { outOfStock, lowStock, total, loading, error, refresh } =
    useStockAlerts();

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

  const renderAlertCard = (item, isOut) => {
    const stock = Number(item.stock ?? 0);
    const minStock = Number(item.min_stock ?? 0);
    const missing = Math.max(minStock - stock, 1);

    const stockColor = isOut ? colors.destructive : colors.warning;
    const missingText = isOut
      ? `Agotado (mínimo: ${minStock})`
      : `faltan ${missing} para el mínimo`;

    return (
      <Pressable
        key={item.id}
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
            marginBottom: spacing.sm + 2,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <View style={styles.cardRow}>
          <View style={styles.cardLeft}>
            <Text
              style={[
                styles.productName,
                { color: colors.foreground, fontSize: fontSize.base },
              ]}
              numberOfLines={2}
            >
              {item.name}
            </Text>
            <View style={styles.cardMetaRow}>
              {item.sku ? (
                <Text
                  style={[
                    styles.skuText,
                    { color: colors.mutedForeground, fontSize: fontSize.xs },
                  ]}
                >
                  SKU: {item.sku}
                </Text>
              ) : null}
              {item.category ? (
                <Text
                  style={[
                    styles.categoryText,
                    { color: colors.mutedForeground, fontSize: fontSize.xs },
                  ]}
                >
                  · {item.category}
                </Text>
              ) : null}
            </View>

            <View
              style={[
                styles.missingBadge,
                {
                  backgroundColor: isOut
                    ? colors.destructive + '15'
                    : colors.warning + '15',
                  borderColor: isOut
                    ? colors.destructive + '40'
                    : colors.warning + '40',
                  borderRadius: radius.full,
                  marginTop: spacing.xs + 2,
                },
              ]}
            >
              <Text
                style={[
                  styles.missingBadgeText,
                  { color: stockColor, fontSize: fontSize.xs - 1 },
                ]}
              >
                {missingText}
              </Text>
            </View>
          </View>

          <View style={styles.cardRight}>
            <View style={styles.stockCol}>
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
                  styles.stockLabel,
                  { color: stockColor, fontSize: fontSize.xs - 2 },
                ]}
              >
                {isOut ? 'AGOTADO' : 'STOCK BAJO'}
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

  if (loading && total === 0) {
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
          Verificando niveles de inventario...
        </Text>
      </View>
    );
  }

  if (error && total === 0) {
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
          Error al cargar alertas
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
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.scrollContent,
        { padding: spacing.md, paddingBottom: 110 },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {/* Estado vacío positivo si no hay ninguna alerta */}
      {total === 0 ? (
        <EmptyState
          icon={
            <Ionicons
              name="checkmark-done-circle-outline"
              size={64}
              color={colors.success}
            />
          }
          title="Todo en orden"
          description="No hay productos con stock bajo ni agotados en este momento."
          style={{ marginTop: 40 }}
        />
      ) : (
        <View>
          {/* Sección 1: Agotados */}
          {outOfStock.length > 0 && (
            <View style={{ marginBottom: spacing.lg }}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={colors.destructive}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.sectionTitle,
                      { color: colors.foreground, fontSize: fontSize.base },
                    ]}
                  >
                    Agotados
                  </Text>
                </View>
                <Badge label={String(outOfStock.length)} variant="destructive" />
              </View>

              {outOfStock.map((item) => renderAlertCard(item, true))}
            </View>
          )}

          {/* Sección 2: Stock bajo */}
          {lowStock.length > 0 && (
            <View style={{ marginBottom: spacing.lg }}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons
                    name="warning"
                    size={20}
                    color={colors.warning}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.sectionTitle,
                      { color: colors.foreground, fontSize: fontSize.base },
                    ]}
                  >
                    Stock bajo
                  </Text>
                </View>
                <Badge label={String(lowStock.length)} variant="warning" />
              </View>

              {lowStock.map((item) => renderAlertCard(item, false))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: '800',
  },
  card: {
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
    flex: 1,
    marginRight: 10,
  },
  productName: {
    fontWeight: '700',
    lineHeight: 20,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  skuText: {
    fontWeight: '500',
  },
  categoryText: {
    fontWeight: '500',
    marginLeft: 4,
  },
  missingBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  missingBadgeText: {
    fontWeight: '700',
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockCol: {
    alignItems: 'flex-end',
  },
  stockNumber: {
    fontWeight: '900',
    lineHeight: 28,
  },
  stockLabel: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
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
});
