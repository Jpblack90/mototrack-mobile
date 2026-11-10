import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../src/theme';

/**
 * Pila de navegación del rol: las pestañas viven en (tabs)/ y las pantallas
 * de detalle (p. ej. orden/[id]) se abren encima, sin barra de pestañas.
 */
export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function AlmaceneroStackLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
