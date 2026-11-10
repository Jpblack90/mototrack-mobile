import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

/**
 * Ícono de pestaña con "píldora" elevada cuando está activa.
 * Usa la variante rellena del ícono al estar enfocado.
 */
export default function TabBarIcon({ name, focused, color }) {
  const { colors } = useTheme();
  const iconName = focused ? name : `${name}-outline`;

  return (
    <View
      style={[
        styles.pill,
        focused && {
          backgroundColor: colors.primary + '26',
          borderColor: colors.primary + '55',
        },
      ]}
    >
      <Ionicons name={iconName} size={22} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    width: 60,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
