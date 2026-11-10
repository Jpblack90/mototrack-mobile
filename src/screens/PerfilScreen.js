import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme';
import { useCompany } from '../hooks/useCompany';
import { useServerHealth } from '../hooks/useServerHealth';
import { getApiUrl } from '../config/server';
import ServerConfigModal from '../components/server/ServerConfigModal';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function PerfilScreen() {
  const { user, logout, changePassword } = useAuth();
  const { colors, spacing, radius, fontSize } = useTheme();
  const { company, loading: companyLoading } = useCompany();
  const { health, loading: healthLoading, refetch: refetchHealth } = useServerHealth();

  // Modal para cambio de contraseña voluntario
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  // Servidor dinámico
  const [effectiveUrl, setEffectiveUrl] = useState('');
  const [serverModalVisible, setServerModalVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getApiUrl().then((url) => {
      if (isMounted) setEffectiveUrl(url);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const roleLabel =
    user?.role === 'mecanico'
      ? 'Mecánico'
      : user?.role === 'almacenero'
      ? 'Almacenero'
      : user?.role === 'admin'
      ? 'Administrador'
      : user?.role === 'cajero'
      ? 'Cajero'
      : user?.role || 'Usuario';

  const workshopName =
    company?.nombre_comercial || company?.razon_social || (companyLoading ? 'Cargando...' : 'Taller');

  async function handlePasswordChange() {
    setPassError('');
    setPassSuccess('');

    if (!currentPassword || !newPassword) {
      setPassError('Completa todos los campos obligatorios.');
      return;
    }

    if (newPassword.length < 8) {
      setPassError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('La confirmación no coincide con la nueva contraseña.');
      return;
    }

    setPassLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPassSuccess('¡Contraseña actualizada con éxito!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setModalVisible(false);
        setPassSuccess('');
      }, 1500);
    } catch (err) {
      setPassError(err.userMessage || err.message || 'Error al actualizar la contraseña.');
    } finally {
      setPassLoading(false);
    }
  }

  const isServerOnline = health?.status === 'ok';
  const isAiOnline = health?.ai === 'ok';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { padding: spacing.md }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Cabecera de usuario ── */}
      <View style={[styles.headerCard, { backgroundColor: colors.sidebar, borderRadius: radius.lg, padding: spacing.lg }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.avatarText, { fontSize: fontSize['2xl'] }]}>
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </Text>
        </View>

        <Text style={[styles.userName, { color: colors.sidebarForeground, fontSize: fontSize.xl }]}>
          {user?.name || 'Usuario'}
        </Text>
        <Text style={[styles.userEmail, { color: colors.mutedForeground, fontSize: fontSize.sm }]}>
          {user?.email}
        </Text>

        <View style={{ marginTop: spacing.sm }}>
          <Badge variant="default" label={roleLabel} />
        </View>
      </View>

      {/* ── Tarjeta: Datos del Taller ── */}
      <Card style={{ marginTop: spacing.md }}>
        <View style={styles.cardHeader}>
          <Ionicons name="business-outline" size={18} color={colors.primary} />
          <Text style={[styles.cardTitle, { color: colors.foreground, fontSize: fontSize.base, marginLeft: spacing.xs }]}>
            Taller Asignado
          </Text>
        </View>
        <Text style={[styles.workshopName, { color: colors.foreground, fontSize: fontSize.lg }]}>
          {workshopName}
        </Text>
        {company?.ruc ? (
          <Text style={[styles.workshopRuc, { color: colors.mutedForeground, fontSize: fontSize.xs }]}>
            RUC: {company.ruc}
          </Text>
        ) : null}
      </Card>

      {/* ── Tarjeta: Conexión con Servidor ── */}
      <Card style={{ marginTop: spacing.md }}>
        <View style={styles.cardHeader}>
          <Ionicons name="server-outline" size={18} color={colors.primary} />
          <Text style={[styles.cardTitle, { color: colors.foreground, fontSize: fontSize.base, marginLeft: spacing.xs }]}>
            Servidor y Conectividad
          </Text>
        </View>

        <View style={[styles.row, { marginTop: spacing.sm }]}>
          <Text style={[styles.label, { color: colors.mutedForeground, fontSize: fontSize.xs }]}>
            URL Conectada:
          </Text>
          <Text style={[styles.valueMono, { color: colors.foreground, fontSize: fontSize.xs }]}>
            {effectiveUrl || 'Cargando...'}
          </Text>
        </View>

        <View style={[styles.rowBetween, { marginTop: spacing.sm }]}>
          <Text style={[styles.label, { color: colors.foreground, fontSize: fontSize.sm }]}>
            Estado Backend:
          </Text>
          <Badge
            variant={isServerOnline ? 'success' : 'destructive'}
            label={isServerOnline ? 'En línea' : 'Desconectado'}
          />
        </View>

        <View style={[styles.rowBetween, { marginTop: spacing.sm }]}>
          <Text style={[styles.label, { color: colors.foreground, fontSize: fontSize.sm }]}>
            Motor IA (Gemini):
          </Text>
          <Badge
            variant={isAiOnline ? 'success' : 'warning'}
            label={isAiOnline ? 'Operativo' : 'No disponible'}
          />
        </View>

        <Button
          title={healthLoading ? 'Comprobando...' : 'Comprobar conexión'}
          onPress={refetchHealth}
          variant="outline"
          loading={healthLoading}
          style={{ marginTop: spacing.md }}
        />

        <Button
          title="Cambiar servidor"
          onPress={() => setServerModalVisible(true)}
          variant="outline"
          icon={<Ionicons name="settings-outline" size={18} color={colors.foreground} />}
          style={{ marginTop: spacing.sm }}
        />
      </Card>

      {/* ── Tarjeta: Seguridad y Sesión ── */}
      <Card style={{ marginTop: spacing.md }}>
        <View style={styles.cardHeader}>
          <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
          <Text style={[styles.cardTitle, { color: colors.foreground, fontSize: fontSize.base, marginLeft: spacing.xs }]}>
            Seguridad
          </Text>
        </View>

        <Button
          title="Cambiar contraseña"
          onPress={() => setModalVisible(true)}
          variant="outline"
          icon={<Ionicons name="key-outline" size={18} color={colors.foreground} />}
          style={{ marginTop: spacing.sm }}
        />

        <Button
          title="Cerrar sesión"
          onPress={logout}
          variant="destructive"
          icon={<Ionicons name="log-out-outline" size={18} color={colors.destructiveForeground} />}
          style={{ marginTop: spacing.md }}
        />
      </Card>

      {/* ── Modal: Cambio de contraseña voluntario ── */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground, fontSize: fontSize.lg }]}>
                Cambiar Contraseña
              </Text>
              <Ionicons
                name="close-outline"
                size={24}
                color={colors.mutedForeground}
                onPress={() => setModalVisible(false)}
              />
            </View>

            {passError ? (
              <View style={[styles.alertBox, { backgroundColor: colors.destructive + '15', borderColor: colors.destructive + '40' }]}>
                <Text style={{ color: colors.destructive, fontSize: fontSize.xs }}>{passError}</Text>
              </View>
            ) : null}

            {passSuccess ? (
              <View style={[styles.alertBox, { backgroundColor: colors.success + '15', borderColor: colors.success + '40' }]}>
                <Text style={{ color: colors.success, fontSize: fontSize.xs }}>{passSuccess}</Text>
              </View>
            ) : null}

            <Input
              label="Contraseña actual"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={true}
              placeholder="Ingresa tu contraseña actual"
            />

            <Input
              label="Nueva contraseña"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={true}
              placeholder="Mínimo 8 caracteres"
            />

            <Input
              label="Confirmar nueva contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={true}
              placeholder="Repite la nueva contraseña"
            />

            <View style={[styles.modalActions, { marginTop: spacing.md }]}>
              <Button
                title="Cancelar"
                onPress={() => setModalVisible(false)}
                variant="ghost"
                style={{ flex: 1, marginRight: spacing.sm }}
              />
              <Button
                title="Actualizar"
                onPress={handlePasswordChange}
                variant="primary"
                loading={passLoading}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
      {/* Modal: Configuración de servidor */}
      <ServerConfigModal
        visible={serverModalVisible}
        onClose={() => setServerModalVisible(false)}
        onSaved={async (newUrl) => {
          setEffectiveUrl(newUrl);
          // Si se cambia el servidor con sesión iniciada, cierra la sesión (el token es de otro servidor)
          await logout();
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  headerCard: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  userName: {
    fontWeight: '700',
  },
  userEmail: {
    marginTop: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontWeight: '600',
  },
  workshopName: {
    fontWeight: '700',
    marginTop: 4,
  },
  workshopRuc: {
    marginTop: 2,
  },
  row: {
    flexDirection: 'column',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'between',
  },
  label: {
    fontWeight: '500',
  },
  valueMono: {
    fontFamily: 'monospace',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertBox: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
});
