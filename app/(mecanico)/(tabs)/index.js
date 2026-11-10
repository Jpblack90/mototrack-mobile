import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Pressable,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../../../src/theme';
import useMyWorkOrders, {
  WORK_ORDER_FILTERS,
} from '../../../src/hooks/useMyWorkOrders';
import Button from '../../../src/components/ui/Button';
import EmptyState from '../../../src/components/ui/EmptyState';
import { formatRelativeTime } from '../../../src/utils/dates';

/**
 * Mapeo de estado técnico a token de color de src/theme.js
 * recibido = mutedForeground · diagnostico = warning · en_reparacion = primary ·
 * pendiente_aprobacion = destructive · terminado/entregado = success · no_recogido = destructive.
 */
function getStatusTheme(status, colors) {
  switch (status) {
    case 'recibido':
      return {
        color: colors.mutedForeground,
        label: 'Recibido',
      };
    case 'diagnostico':
      return {
        color: colors.warning,
        label: 'Diagnóstico',
      };
    case 'en_reparacion':
      return {
        color: colors.primary,
        label: 'En Reparación',
      };
    case 'pendiente_aprobacion':
      return {
        color: colors.destructive,
        label: 'Pend. Aprobación',
      };
    case 'terminado':
      return {
        color: colors.success,
        label: 'Terminado',
      };
    case 'entregado':
      return {
        color: colors.success,
        label: 'Entregado',
      };
    case 'no_recogido':
      return {
        color: colors.destructive,
        label: 'No Recogido',
      };
    default:
      return {
        color: colors.mutedForeground,
        label: status,
      };
  }
}

export default function MecanicoOrdersScreen() {
  const router = useRouter();
  const { colors, spacing, radius, fontSize } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState(
    WORK_ORDER_FILTERS.ACTIVAS
  );
  const [refreshing, setRefreshing] = useState(false);

  const { data, counts, loading, error, refresh } =
    useMyWorkOrders(selectedFilter);

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
    const statusTheme = getStatusTheme(item.status, colors);
    const vehicleInfo =
      [item.brand, item.model].filter(Boolean).join(' ') ||
      'Vehículo sin registrar';
    const mileageText =
      item.entry_mileage != null
        ? `${Number(item.entry_mileage).toLocaleString('es-PE')} km`
        : '—';
    const relativeTime = formatRelativeTime(item.created_at);

    // Si lleva más de 3 días en 'recibido', el tiempo se resalta en color warning
    const isOldReceived = Boolean(item.is_old_received);
    const timeColor = isOldReceived ? colors.warning : colors.mutedForeground;

    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: '/(mecanico)/orden/[id]',
            params: { id: String(item.id) },
          })
        }
        accessibilityRole="button"
        accessibilityLabel={`Orden ${item.id}, placa ${item.placa || 'sin placa'}`}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: radius.lg,
            marginBottom: spacing.md,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        {/* Franja vertical de 4 px a la izquierda con el color del estado */}
        <View
          style={[
            styles.statusStripe,
            { backgroundColor: statusTheme.color },
          ]}
        />

        <View style={[styles.cardContent, { padding: spacing.md }]}>
          {/* Cabecera: OT #id pequeño y gris sobre la placa, y Badge relleno */}
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Text
                style={[
                  styles.orderNumber,
                  { color: colors.mutedForeground, fontSize: fontSize.xs },
                ]}
              >
                OT #{item.id}
              </Text>
              <Text
                style={[
                  styles.plateText,
                  {
                    color: colors.foreground,
                    fontSize: fontSize.xl,
                  },
                ]}
              >
                {item.placa || 'SIN PLACA'}
              </Text>
            </View>

            {/* Badge RELLENO */}
            <View
              style={[
                styles.filledBadge,
                {
                  backgroundColor: statusTheme.color,
                  borderRadius: radius.full,
                },
              ]}
            >
              <Text style={[styles.filledBadgeText, { fontSize: fontSize.xs }]}>
                {statusTheme.label}
              </Text>
            </View>
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

          {/* Nombre del cliente debajo de marca/modelo (nunca el teléfono) */}
          {item.customer_name ? (
            <Text
              style={[
                styles.customerText,
                {
                  color: colors.mutedForeground,
                  fontSize: fontSize.sm,
                  marginTop: 2,
                },
              ]}
            >
              Cliente: {item.customer_name}
            </Text>
          ) : null}

          {/* Vista previa de diagnosis_notes en 1 línea si existe */}
          {item.diagnosis_notes ? (
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                styles.diagnosisPreview,
                {
                  color: colors.mutedForeground,
                  fontSize: fontSize.xs,
                  marginTop: 6,
                },
              ]}
            >
              Diagnóstico: {item.diagnosis_notes}
            </Text>
          ) : null}

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

          {/* Fila de metadatos: Kilometraje, Tiempo y Chevron a la derecha */}
          <View style={styles.cardFooter}>
            <View style={styles.footerLeft}>
              <View style={styles.metaItem}>
                <Ionicons
                  name="speedometer-outline"
                  size={15}
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

              <View style={[styles.metaItem, { marginLeft: spacing.md }]}>
                <Ionicons
                  name="time-outline"
                  size={15}
                  color={timeColor}
                  style={styles.metaIcon}
                />
                <Text
                  style={[
                    styles.metaText,
                    {
                      color: timeColor,
                      fontSize: fontSize.xs,
                      fontWeight: isOldReceived ? '700' : '500',
                    },
                  ]}
                >
                  {relativeTime}
                </Text>
              </View>
            </View>

            {/* Chevron-forward a la derecha */}
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.mutedForeground}
            />
          </View>
        </View>
      </Pressable>
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
                  width: 90,
                  height: 24,
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
                height: 16,
                backgroundColor: colors.muted,
                borderRadius: radius.sm,
                marginTop: spacing.sm,
              },
            ]}
          />
          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.border,
                marginVertical: spacing.sm,
              },
            ]}
          />
          <View style={styles.cardFooter}>
            <View
              style={[
                styles.skeletonBox,
                {
                  width: 70,
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
      {/* Barra de chips de filtro con contadores */}
      <View style={[styles.chipsContainer, { marginVertical: spacing.md }]}>
        {renderChip(
          WORK_ORDER_FILTERS.ACTIVAS,
          `Activas (${counts.activas})`
        )}
        {renderChip(
          WORK_ORDER_FILTERS.TERMINADAS,
          `Terminadas (${counts.terminadas})`
        )}
        {renderChip(
          WORK_ORDER_FILTERS.TODAS,
          `Todas (${counts.todas})`
        )}
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
            { paddingBottom: 110 },
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
                  name="clipboard-outline"
                  size={56}
                  color={colors.mutedForeground}
                />
              }
              title="No tienes órdenes en esta sección"
              description="Cuando el taller te asigne una orden de trabajo, aparecerá listada aquí."
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
    position: 'relative',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statusStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  cardContent: {
    paddingLeft: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    marginRight: 8,
  },
  orderNumber: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  plateText: {
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  filledBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filledBadgeText: {
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  vehicleText: {
    fontWeight: '600',
  },
  customerText: {
    fontWeight: '500',
  },
  diagnosisPreview: {
    lineHeight: 16,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'row',
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
