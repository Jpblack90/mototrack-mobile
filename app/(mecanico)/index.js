import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/theme';
import EmptyState from '../../src/components/ui/EmptyState';
import Badge from '../../src/components/ui/Badge';

export default function MecanicoOrdersScreen() {
  const { user } = useAuth();
  const { colors, spacing, fontSize } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, padding: spacing.md }]}>
      {/* Banner de saludo */}
      <View style={[styles.greetingBanner, { backgroundColor: colors.card, borderColor: colors.border, padding: spacing.md }]}>
        <View>
          <Text style={[styles.greetingText, { color: colors.mutedForeground, fontSize: fontSize.xs }]}>
            Panel Operativo
          </Text>
          <Text style={[styles.userName, { color: colors.foreground, fontSize: fontSize.lg }]}>
            {user?.name || 'Mecánico'}
          </Text>
        </View>
        <Badge variant="default" label="Mecánico" />
      </View>

      {/* Contenido placeholder */}
      <View style={styles.centerContainer}>
        <EmptyState
          icon={<Ionicons name="construct-outline" size={56} color={colors.primary} />}
          title="Mis Órdenes de Trabajo"
          description="Disponible en la siguiente versión"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  greetingBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  greetingText: {
    fontWeight: '500',
  },
  userName: {
    fontWeight: '700',
    marginTop: 2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
