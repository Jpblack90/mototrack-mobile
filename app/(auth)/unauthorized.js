import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/theme';
import Button from '../../src/components/ui/Button';
import Card from '../../src/components/ui/Card';
import Badge from '../../src/components/ui/Badge';

export default function UnauthorizedScreen() {
  const { user, logout } = useAuth();
  const { colors, spacing, radius, fontSize } = useTheme();

  const roleName =
    user?.role === 'admin'
      ? 'Administrador'
      : user?.role === 'cajero'
      ? 'Cajero'
      : user?.role || 'No autorizado';

  return (
    <View style={[styles.container, { backgroundColor: colors.background, padding: spacing.lg }]}>
      <Card style={[styles.card, { maxWidth: 440, width: '100%', alignSelf: 'center', padding: spacing.xl }]}>
        <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, { backgroundColor: colors.destructive + '20' }]}>
            <Ionicons name="lock-closed-outline" size={36} color={colors.destructive} />
          </View>
        </View>

        <Text style={[styles.title, { color: colors.foreground, fontSize: fontSize.xl, marginTop: spacing.md }]}>
          Acceso Restringido
        </Text>

        <Text style={[styles.message, { color: colors.foreground, fontSize: fontSize.base, marginTop: spacing.sm }]}>
          Esta app es para mecánicos y almaceneros. Usa la versión web.
        </Text>

        <View style={[styles.userInfo, { backgroundColor: colors.muted, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.lg }]}>
          <Text style={[styles.userLabel, { color: colors.mutedForeground, fontSize: fontSize.xs }]}>
            Sesión iniciada como:
          </Text>
          <Text style={[styles.userName, { color: colors.foreground, fontSize: fontSize.base, fontWeight: '700', marginTop: 2 }]}>
            {user?.name || user?.email}
          </Text>
          <View style={{ marginTop: spacing.xs }}>
            <Badge variant="outline" label={`Rol: ${roleName}`} />
          </View>
        </View>

        <Button
          title="Cerrar sesión"
          onPress={logout}
          variant="destructive"
          icon={<Ionicons name="log-out-outline" size={18} color={colors.destructiveForeground} />}
          style={{ marginTop: spacing.xl }}
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    alignItems: 'center',
    textAlign: 'center',
  },
  iconContainer: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  userInfo: {
    width: '100%',
    alignItems: 'center',
  },
  userLabel: {
    fontWeight: '500',
  },
  userName: {},
});
