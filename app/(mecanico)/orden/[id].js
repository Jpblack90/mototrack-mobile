import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../src/theme';
import useWorkOrder from '../../../src/hooks/useWorkOrder';
import useUpdateWorkOrderStatus from '../../../src/hooks/useUpdateWorkOrderStatus';
import Badge from '../../../src/components/ui/Badge';
import Button from '../../../src/components/ui/Button';
import Input from '../../../src/components/ui/Input';
import ConfirmDialog from '../../../src/components/ui/ConfirmDialog';
import { formatRelativeTime } from '../../../src/utils/dates';

const TIMELINE_STEPS = [
  { key: 'recibido', label: 'Recibido', icon: 'document-text-outline' },
  { key: 'diagnostico', label: 'Diagnóstico', icon: 'search-outline' },
  { key: 'en_reparacion', label: 'Reparación', icon: 'build-outline' },
  { key: 'terminado', label: 'Terminado', icon: 'checkmark-circle-outline' },
];

export default function WorkOrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, radius, fontSize } = useTheme();

  const { data: order, loading, error, refresh } = useWorkOrder(id);
  const { update, loading: updating } = useUpdateWorkOrderStatus();

  // Estados locales para el formulario de diagnóstico
  const [diagnosisNotes, setDiagnosisNotes] = useState('');
  const [additionalCost, setAdditionalCost] = useState('');
  const [notesError, setNotesError] = useState(null);

  // Estados para diálogo de confirmación
  const [confirmDialog, setConfirmDialog] = useState({
    visible: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    targetStatus: null,
  });

  // Diálogo especial para aviso de aprobación requerida
  const [approvalNoticeVisible, setApprovalNoticeVisible] = useState(false);

  const vehicleName =
    [order?.brand, order?.model].filter(Boolean).join(' ') ||
    'Vehículo sin marca registrada';

  // Paso actual en la línea de tiempo (0..3)
  const getStepIndex = (status) => {
    switch (status) {
      case 'recibido':
        return 0;
      case 'diagnostico':
        return 1;
      case 'pendiente_aprobacion':
        return 1; // en pausa tras diagnóstico
      case 'en_reparacion':
        return 2;
      case 'terminado':
      case 'entregado':
      case 'no_recogido':
        return 3;
      default:
        return 0;
    }
  };

  const currentStepIndex = order ? getStepIndex(order.status) : 0;

  // Manejadores de acciones según estado
  const handleStartDiagnosis = () => {
    setConfirmDialog({
      visible: true,
      title: '¿Iniciar diagnóstico?',
      message:
        'La orden pasará al estado de diagnóstico técnico para evaluar la motocicleta.',
      confirmText: 'Iniciar diagnóstico',
      targetStatus: 'diagnostico',
    });
  };

  const handleStartReparation = () => {
    const trimmedNotes = diagnosisNotes.trim();
    if (trimmedNotes.length < 10) {
      setNotesError(
        'El reporte de diagnóstico es obligatorio y debe tener al menos 10 caracteres.'
      );
      return;
    }
    setNotesError(null);

    setConfirmDialog({
      visible: true,
      title: '¿Pasar a reparación?',
      message:
        'Se guardará el diagnóstico y se solicitará el paso a reparación del vehículo.',
      confirmText: 'Pasar a reparación',
      targetStatus: 'en_reparacion',
    });
  };

  const handleMarkTerminado = () => {
    setConfirmDialog({
      visible: true,
      title: '¿Marcar como terminada?',
      message:
        '¿Confirmas que se completaron todas las tareas de mantenimiento y reparación?',
      confirmText: 'Marcar terminada',
      targetStatus: 'terminado',
    });
  };

  const handleConfirmTransition = async () => {
    if (!order || !confirmDialog.targetStatus) return;

    const extras = {};
    if (confirmDialog.targetStatus === 'en_reparacion') {
      extras.diagnosis_notes = diagnosisNotes.trim();
      const numCost = parseFloat(additionalCost.replace(',', '.'));
      if (!isNaN(numCost) && numCost > 0) {
        extras.additional_cost = numCost;
      }
    }

    const res = await update(order.id, confirmDialog.targetStatus, extras);
    setConfirmDialog((prev) => ({ ...prev, visible: false }));

    if (!res.success) {
      Alert.alert(
        'No se pudo actualizar el estado',
        res.error || 'Ocurrió un error inesperado.'
      );
      return;
    }

    // Si pasó a pendiente_aprobacion (por superar umbral)
    if (res.data?.status === 'pendiente_aprobacion') {
      setApprovalNoticeVisible(true);
    } else {
      Alert.alert(
        'Estado actualizado',
        `La orden #${order.id} se actualizó con éxito.`
      );
    }

    await refresh();
  };

  if (loading && !order) {
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
          Cargando detalles de la orden...
        </Text>
      </View>
    );
  }

  if (error && !order) {
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
          Error al cargar orden
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
      {/* Cabecera con botón volver y título */}
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
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace('/(mecanico)/(tabs)')
          }
          accessibilityRole="button"
          accessibilityLabel="Volver a mis órdenes"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.topBarTitleContainer}>
          <Text
            style={[
              styles.topBarTitle,
              { color: colors.foreground, fontSize: fontSize.lg },
            ]}
          >
            Orden #{order?.id}
          </Text>
          <Text
            style={[
              styles.topBarSubtitle,
              { color: colors.mutedForeground, fontSize: fontSize.xs },
            ]}
          >
            {formatRelativeTime(order?.created_at)}
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
        {/* 1. Tarjeta principal del vehículo */}
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
          <View style={styles.cardHeader}>
            <Text
              style={[
                styles.plateBadge,
                {
                  color: colors.primary,
                  backgroundColor: colors.primary + '15',
                  borderColor: colors.primary + '40',
                  borderRadius: radius.md,
                  paddingHorizontal: spacing.sm + 2,
                  paddingVertical: spacing.xs,
                  fontSize: fontSize.xl,
                },
              ]}
            >
              {order?.placa || '—'}
            </Text>
            <Badge
              label={
                order?.status === 'pendiente_aprobacion'
                  ? 'Pend. Aprobación'
                  : order?.status === 'en_reparacion'
                  ? 'En Reparación'
                  : order?.status === 'diagnostico'
                  ? 'Diagnóstico'
                  : order?.status === 'terminado'
                  ? 'Terminado'
                  : order?.status === 'entregado'
                  ? 'Entregado'
                  : order?.status === 'no_recogido'
                  ? 'No Recogido'
                  : 'Recibido'
              }
              variant={
                order?.status === 'terminado' || order?.status === 'entregado'
                  ? 'success'
                  : order?.status === 'pendiente_aprobacion'
                  ? 'warning'
                  : order?.status === 'no_recogido'
                  ? 'destructive'
                  : 'outline'
              }
            />
          </View>

          <Text
            style={[
              styles.vehicleTitle,
              {
                color: colors.foreground,
                fontSize: fontSize.base,
                marginTop: spacing.sm,
              },
            ]}
          >
            {vehicleName}
          </Text>

          <View style={[styles.detailRow, { marginTop: spacing.sm }]}>
            <View style={styles.detailCol}>
              <Text
                style={[
                  styles.fieldLabel,
                  { color: colors.mutedForeground, fontSize: fontSize.xs },
                ]}
              >
                KILOMETRAJE
              </Text>
              <Text
                style={[
                  styles.fieldValue,
                  { color: colors.foreground, fontSize: fontSize.sm },
                ]}
              >
                {order?.entry_mileage != null
                  ? `${Number(order.entry_mileage).toLocaleString('es-PE')} km`
                  : '—'}
              </Text>
            </View>

            <View style={styles.detailCol}>
              <Text
                style={[
                  styles.fieldLabel,
                  { color: colors.mutedForeground, fontSize: fontSize.xs },
                ]}
              >
                CLIENTE (PROPIETARIO)
              </Text>
              <Text
                style={[
                  styles.fieldValue,
                  { color: colors.foreground, fontSize: fontSize.sm },
                ]}
              >
                {/* Ley 29733: SOLO se muestra el nombre, nunca el teléfono */}
                {order?.customer_name || 'No registrado'}
              </Text>
            </View>
          </View>
        </View>

        {/* 2. Línea de tiempo visual de estados */}
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
              {
                color: colors.foreground,
                fontSize: fontSize.sm,
                marginBottom: spacing.md,
              },
            ]}
          >
            ESTADO DE LA ATENCIÓN TÉCNICA
          </Text>

          <View style={styles.timelineContainer}>
            {TIMELINE_STEPS.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const isLast = idx === TIMELINE_STEPS.length - 1;

              const circleBg = isCurrent
                ? colors.primary
                : isPast
                ? colors.success
                : colors.muted;

              const circleText = isCurrent
                ? colors.primaryForeground
                : isPast
                ? colors.successForeground
                : colors.mutedForeground;

              return (
                <View key={step.key} style={styles.timelineItemWrapper}>
                  <View style={styles.timelineStep}>
                    <View
                      style={[
                        styles.timelineCircle,
                        {
                          backgroundColor: circleBg,
                          borderColor: isCurrent
                            ? colors.primary
                            : isPast
                            ? colors.success
                            : colors.border,
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          isPast
                            ? 'checkmark'
                            : isCurrent
                            ? step.icon
                            : step.icon
                        }
                        size={16}
                        color={circleText}
                      />
                    </View>
                    <Text
                      style={[
                        styles.timelineLabel,
                        {
                          color: isCurrent
                            ? colors.primary
                            : isPast
                            ? colors.foreground
                            : colors.mutedForeground,
                          fontSize: fontSize.xs - 1,
                          fontWeight: isCurrent ? '700' : '500',
                          marginTop: 4,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {step.label}
                    </Text>
                  </View>

                  {!isLast && (
                    <View
                      style={[
                        styles.timelineConnector,
                        {
                          backgroundColor:
                            idx < currentStepIndex
                              ? colors.success
                              : colors.border,
                        },
                      ]}
                    />
                  )}
                </View>
              );
            })}
          </View>

          {/* Banner contextual si está en pendiente_aprobacion */}
          {order?.status === 'pendiente_aprobacion' && (
            <View
              style={[
                styles.noticeBanner,
                {
                  backgroundColor: colors.warning + '15',
                  borderColor: colors.warning + '40',
                  marginTop: spacing.md,
                },
              ]}
            >
              <Ionicons
                name="time-outline"
                size={20}
                color={colors.warning}
                style={{ marginRight: spacing.sm }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.noticeTitle,
                    { color: colors.warning, fontSize: fontSize.sm },
                  ]}
                >
                  Esperando aprobación del cliente
                </Text>
                <Text
                  style={[
                    styles.noticeDesc,
                    {
                      color: colors.foreground,
                      fontSize: fontSize.xs,
                      marginTop: 2,
                    },
                  ]}
                >
                  El trabajo adicional supera el umbral configurado. El cajero o
                  administrador debe registrar la aprobación antes de continuar.
                </Text>
              </View>
            </View>
          )}

          {/* Banner contextual si está terminado */}
          {order?.status === 'terminado' && (
            <View
              style={[
                styles.noticeBanner,
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
                style={{ marginRight: spacing.sm }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.noticeTitle,
                    { color: colors.success, fontSize: fontSize.sm },
                  ]}
                >
                  Orden terminada
                </Text>
                <Text
                  style={[
                    styles.noticeDesc,
                    {
                      color: colors.foreground,
                      fontSize: fontSize.xs,
                      marginTop: 2,
                    },
                  ]}
                >
                  Los trabajos concluyeron. El vehículo queda listo para facturación
                  y entrega en recepción.
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* 3. Reporte de ingreso (Checklist notes) */}
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
              {
                color: colors.foreground,
                fontSize: fontSize.sm,
                marginBottom: spacing.xs,
              },
            ]}
          >
            REPORTE DE INGRESO (CHECKLIST)
          </Text>
          <Text
            style={[
              styles.notesBody,
              {
                color: order?.checklist_notes
                  ? colors.foreground
                  : colors.mutedForeground,
                fontSize: fontSize.sm,
              },
            ]}
          >
            {order?.checklist_notes || 'Sin observaciones registradas al ingreso.'}
          </Text>
        </View>

        {/* 4. Diagnóstico técnico y Costo adicional */}
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
              {
                color: colors.foreground,
                fontSize: fontSize.sm,
                marginBottom: spacing.xs,
              },
            ]}
          >
            DIAGNÓSTICO TÉCNICO
          </Text>

          {/* Si está en diagnóstico, se muestra el formulario editable */}
          {order?.status === 'diagnostico' ? (
            <View style={{ marginTop: spacing.sm }}>
              <Input
                label="Notas de diagnóstico técnico *"
                placeholder="Describe el fallo detectado y los repuestos necesarios (mín. 10 caracteres)..."
                value={diagnosisNotes}
                onChangeText={(text) => {
                  setDiagnosisNotes(text);
                  if (notesError && text.trim().length >= 10) {
                    setNotesError(null);
                  }
                }}
                multiline
                numberOfLines={3}
                inputStyle={styles.multilineInput}
                error={notesError}
              />

              <Input
                label="Costo adicional estimado (S/) — Opcional"
                placeholder="0.00"
                value={additionalCost}
                onChangeText={setAdditionalCost}
                keyboardType="decimal-pad"
                helper="Si supera el umbral del taller pasará a aprobación del cliente."
              />
            </View>
          ) : (
            <View>
              <Text
                style={[
                  styles.notesBody,
                  {
                    color: order?.diagnosis_notes
                      ? colors.foreground
                      : colors.mutedForeground,
                    fontSize: fontSize.sm,
                  },
                ]}
              >
                {order?.diagnosis_notes || 'Diagnóstico aún no registrado.'}
              </Text>

              {order?.additional_cost != null &&
                Number(order.additional_cost) > 0 && (
                  <View
                    style={[
                      styles.costBadgeRow,
                      {
                        backgroundColor: colors.muted,
                        borderRadius: radius.md,
                        padding: spacing.sm,
                        marginTop: spacing.sm,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.costLabel,
                        { color: colors.mutedForeground, fontSize: fontSize.xs },
                      ]}
                    >
                      Costo adicional registrado:
                    </Text>
                    <Text
                      style={[
                        styles.costValue,
                        { color: colors.foreground, fontSize: fontSize.sm },
                      ]}
                    >
                      S/ {Number(order.additional_cost).toFixed(2)}
                    </Text>
                  </View>
                )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* 5. Botón de acción fijo abajo con safe area */}
      {order && (
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
          {order.status === 'recibido' && (
            <Button
              title="Iniciar diagnóstico"
              variant="primary"
              onPress={handleStartDiagnosis}
              loading={updating}
              style={styles.actionButton}
            />
          )}

          {order.status === 'diagnostico' && (
            <Button
              title="Pasar a reparación"
              variant="primary"
              onPress={handleStartReparation}
              loading={updating}
              style={styles.actionButton}
            />
          )}

          {order.status === 'en_reparacion' && (
            <Button
              title="Marcar como terminada"
              variant="primary"
              onPress={handleMarkTerminado}
              loading={updating}
              style={styles.actionButton}
            />
          )}

          {order.status === 'pendiente_aprobacion' && (
            <View style={styles.readOnlyFooter}>
              <Ionicons
                name="hourglass-outline"
                size={18}
                color={colors.warning}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.readOnlyFooterText,
                  { color: colors.warning, fontSize: fontSize.sm },
                ]}
              >
                Esperando aprobación del cliente
              </Text>
            </View>
          )}

          {['terminado', 'entregado', 'no_recogido'].includes(
            order.status
          ) && (
            <View style={styles.readOnlyFooter}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={colors.mutedForeground}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.readOnlyFooterText,
                  { color: colors.mutedForeground, fontSize: fontSize.sm },
                ]}
              >
                Orden finalizada (solo lectura)
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Diálogo de confirmación accesible */}
      <ConfirmDialog
        visible={confirmDialog.visible}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText="Cancelar"
        loading={updating}
        onCancel={() =>
          setConfirmDialog((prev) => ({ ...prev, visible: false }))
        }
        onConfirm={handleConfirmTransition}
      />

      {/* Diálogo especial ante desvío a pendiente_aprobacion */}
      <ConfirmDialog
        visible={approvalNoticeVisible}
        title="Requiere aprobación del cliente"
        message="El costo adicional ingresado superó el umbral del taller. La orden quedó en 'Pendiente de aprobación' y el cajero o administrador debe aprobarla con el cliente."
        confirmText="Entendido"
        cancelText=""
        onCancel={() => setApprovalNoticeVisible(false)}
        onConfirm={() => setApprovalNoticeVisible(false)}
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  plateBadge: {
    fontWeight: '800',
    borderWidth: 1,
    letterSpacing: 1.2,
  },
  vehicleTitle: {
    fontWeight: '700',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailCol: {
    flex: 1,
  },
  fieldLabel: {
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  fieldValue: {
    fontWeight: '500',
  },
  sectionTitle: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  timelineItemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timelineStep: {
    alignItems: 'center',
    width: 60,
  },
  timelineCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLabel: {
    textAlign: 'center',
  },
  timelineConnector: {
    flex: 1,
    height: 2,
    marginTop: -16,
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  noticeTitle: {
    fontWeight: '700',
  },
  noticeDesc: {
    lineHeight: 16,
  },
  notesBody: {
    lineHeight: 20,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 8,
  },
  costBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costLabel: {
    fontWeight: '600',
  },
  costValue: {
    fontWeight: '700',
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
  readOnlyFooter: {
    minHeight: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  readOnlyFooterText: {
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
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
