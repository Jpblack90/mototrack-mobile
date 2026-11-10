import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../src/theme';
import useMyWorkOrders, {
  WORK_ORDER_FILTERS,
} from '../../../src/hooks/useMyWorkOrders';
import Badge from '../../../src/components/ui/Badge';
import Button from '../../../src/components/ui/Button';
import EmptyState from '../../../src/components/ui/EmptyState';
import { formatRelativeTime } from '../../../src/utils/dates';

const STATUS_CONFIG = {
  recibido: { label: 'Recibido', variant: 'outline' },
  diagnostico: { label: 'Diagnóstico', variant: 'outline' },
  pendiente_aprobacion: { label: 'Pend. Aprobación', variant: 'warning' },
  en_reparacion: { label: 'En Reparación', variant: 'default' },
  terminado: { label: 'Terminado', variant: 'success' },
  entregado: { label: 'Entregado', variant: 'success' },
  no_recogido: { label: 'No Recogido', variant: 'destructive' },
};

export default function MecanicoOrdersScreen() {
  const router = useRouter();
  const { colors, spacing, radius, fontSize } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState(
    WORK_ORDER_FILTERS.ACTIVAS
  );
  const [refreshing, setRefreshing] = useState(false);

  const { data, loading, error, refresh } = useMyWorkOrders(selectedFilter);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const renderChip = (key, label) => {
    const isSelected = selectedFilter === key;
    return (
      <TouchableOpacity
        key={key}
        onPress={() => setSelectedFilter(key)}
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

  const renderOrderItem = ({ item }) => {
    const statusMeta = STATUS_CONFIG[item.status] ?? {
      label: item.status,
      variant: 'outline',
    };
    const vehicleInfo = [item.brand, item.model].filter(Boolean).join(' ') || 'Vehículo sin registrar';
    const mileageText =
      item.entry_mileage != null
        ? `${Number(item.entry_mileage).toLocaleString('es-PE')} km`
        : '—';
    const relativeTime = formatRelativeTime(item.created_at);

    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: '/(mecanico)/orden/[id]',
            params: { id: String(item.id) },
          })
        }
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Orden ${item.id}, placa ${item.placa}`}
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
        {/* Cabecera de la tarjeta: Placa y Badge de estado */}
        <View style={styles.cardHeader}>
          <Text
            style={[
              styles.plateText,
              {
                color: colors.foreground,
                fontSize: fontSize.xl,
              },
            ]}
          >
            {item.placa || `OT #${item.id}`}
          </Text>
          <Badge
            label={statusMeta.label}
            variant={statusMeta.variant}
          />
        </View>

        {/* Marca y modelo */}
        <Text
          style={[
            styles.vehicleText,
            {
              color: colors.foreground,
              fontSize: fontSize.base,
              marginTop: spacing.xs,
            },
          ]}
        >
          {vehicleInfo}
        </Text>

        {/* Separador sutil */}
        <View
          style={[
            styles.divider,
            {
              backgroundColor: colors.border,
              marginVertical: spacing.sm,
            },
          ]}
        />

        {/* Fila de metadatos: Kilometraje y Tiempo transcurrido */}
        <View style={styles.cardFooter}>
          <View style={styles.metaItem}>
            <Ionicons
              name="speedometer-outline"
              size={16}
              color={colors.mutedForeground}
              style={styles.metaIcon}
            />
            <Text
              style={[
                styles.metaText,
                { color: colors.mutedForeground, fontSize: fontSize.xs },
              ]}
            >
              {mileageText}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons
              name="time-outline"
              size={16}
              color={colors.mutedForeground}
              style={styles.metaIcon}
            />
            <Text
              style={[
                styles.metaText,
                { color: colors.mutedForeground, fontSize: fontSize.xs },
              ]}
            >
              {relativeTime}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map((key) => (
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
              marginBottom: spacing.md,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.skeletonBox,
                {
                  width: 120,
                  height: 24,
                  backgroundColor: colors.muted,
                  borderRadius: radius.sm,
                },
              ]}
            />
            <View
              style={[
                styles.skeletonBox,
                {
                  width: 80,
                  height: 20,
                  backgroundColor: colors.muted,
                  borderRadius: radius.full,
                },
              ]}
            />
          </View>
          <View
            style={[
              styles.skeletonBox,
              {
                width: 180,
                height: 18,
                backgroundColor: colors.muted,
                borderRadius: radius.sm,
                marginTop: spacing.sm,
              },
            ]}
          />
          <View
            style={[
              styles.divider,
              { backgroundColor: colors.border, marginVertical: spacing.sm },
            ]}
          />
          <View style={styles.cardFooter}>
            <View
              style={[
                styles.skeletonBox,
                {
                  width: 90,
                  height: 14,
                  backgroundColor: colors.muted,
                  borderRadius: radius.sm,
                },
              ]}
            />
            <View
              style={[
                styles.skeletonBox,
                {
                  width: 80,
                  height: 14,
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
      {/* Barra de chips de filtro */}
      <View style={[styles.chipsContainer, { marginVertical: spacing.md }]}>
        {renderChip(WORK_ORDER_FILTERS.ACTIVAS, 'Activas')}
        {renderChip(WORK_ORDER_FILTERS.TERMINADAS, 'Terminadas')}
        {renderChip(WORK_ORDER_FILTERS.TODAS, 'Todas')}
      </View>

      {/* Estado de error inicial con botón reintentar */}
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
          renderItem={renderOrderItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: 110 }, // Padding inferior para no tapar con la barra de tabs
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
          ListEmptyComponent={
            <EmptyState
              icon={
                <Ionicons
                  name="construct-outline"
                  size={56}
                  color={colors.mutedForeground}
                />
              }
              title="No tienes órdenes asignadas"
              description={
                selectedFilter === WORK_ORDER_FILTERS.ACTIVAS
                  ? 'No hay órdenes activas pendientes de atención.'
                  : 'No se encontraron órdenes para este filtro.'
              }
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    minHeight: 40,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: {
    letterSpacing: 0.3,
  },
  card: {
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  plateText: {
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  vehicleText: {
    fontWeight: '600',
  },
  divider: {
    height: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    marginRight: 4,
  },
  metaText: {
    fontWeight: '500',
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
});
