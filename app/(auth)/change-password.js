import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/theme';
import Input from '../../src/components/ui/Input';
import Button from '../../src/components/ui/Button';

export default function ChangePasswordScreen() {
  const { user, changePassword, logout } = useAuth();
  const { colors, spacing, radius, fontSize } = useTheme();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit() {
    setErrorMessage('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage('Por favor completa todos los campos.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMessage('La nueva contraseña no puede ser igual a la actual.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('La confirmación no coincide con la nueva contraseña.');
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      // Tras actualizar, user.must_change_password pasa a false y AuthGate redirige a los tabs
    } catch (err) {
      const msg =
        err.userMessage ||
        err.response?.data?.error?.message ||
        err.message ||
        'Error al actualizar la contraseña.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.scrollContent, { padding: spacing.lg }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg }]}>
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: colors.warning + '20' }]}>
            <Ionicons name="key-outline" size={32} color={colors.warning} />
          </View>
          <Text style={[styles.title, { color: colors.foreground, fontSize: fontSize.xl, marginTop: spacing.md }]}>
            Cambio Obligatorio
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground, fontSize: fontSize.sm, marginTop: spacing.xs }]}>
            Hola {user?.name || ''}, debes cambiar tu contraseña temporal antes de ingresar al sistema.
          </Text>
        </View>

        {errorMessage ? (
          <View
            style={[
              styles.errorCard,
              {
                backgroundColor: colors.destructive + '15',
                borderColor: colors.destructive + '40',
                borderRadius: radius.md,
                padding: spacing.md,
                marginTop: spacing.md,
              },
            ]}
          >
            <View style={styles.errorHeader}>
              <Ionicons name="alert-circle" size={18} color={colors.destructive} />
              <Text style={[styles.errorText, { color: colors.destructive, fontSize: fontSize.xs, marginLeft: spacing.xs }]}>
                {errorMessage}
              </Text>
            </View>
          </View>
        ) : null}

        <View style={{ marginTop: spacing.lg }}>
          <Input
            label="Contraseña actual"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry={true}
            placeholder="Tu contraseña temporal"
          />

          <Input
            label="Nueva contraseña"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={true}
            placeholder="Mínimo 8 caracteres"
            helper="Debe incluir letras y números."
          />

          <Input
            label="Confirmar nueva contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={true}
            placeholder="Repite la nueva contraseña"
          />

          <Button
            title={loading ? 'Actualizando...' : 'Actualizar contraseña'}
            onPress={handleSubmit}
            variant="primary"
            loading={loading}
            style={{ marginTop: spacing.sm }}
          />

          <Button
            title="Cerrar sesión"
            onPress={logout}
            variant="ghost"
            style={{ marginTop: spacing.md }}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  card: {
    borderWidth: 1,
  },
  header: {
    alignItems: 'center',
    textAlign: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 20,
  },
  errorCard: {
    borderWidth: 1,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    fontWeight: '500',
  },
});
