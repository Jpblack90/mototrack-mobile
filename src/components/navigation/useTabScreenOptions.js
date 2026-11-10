import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';

const TAB_BAR_CONTENT_HEIGHT = 64;

/**
 * Opciones compartidas de la barra de pestañas (mecánico y almacenero).
 * Respeta el área segura inferior de Android (botones de navegación
 * o barra de gestos) para que nada quede debajo de ellos.
 */
export default function useTabScreenOptions() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);

  return {
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.mutedForeground,
    tabBarHideOnKeyboard: true,
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: '600',
      marginTop: 2,
    },
    tabBarItemStyle: {
      paddingTop: 8,
      minHeight: 48,
    },
    // La barra pinta su propio fondo rectangular (color de pantalla) y encima
    // una "tarjeta" con esquinas redondeadas y sombra. Así las esquinas nunca
    // dejan ver el fondo blanco de Android.
    tabBarStyle: {
      backgroundColor: colors.background,
      height: TAB_BAR_CONTENT_HEIGHT + bottomInset,
      paddingBottom: bottomInset,
      paddingTop: 0,
      borderTopWidth: 0,
      elevation: 0,
      shadowOpacity: 0,
    },
    tabBarBackground: () => (
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: colors.card,
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
            borderTopWidth: 1,
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderColor: colors.border,
          },
          // En Android no se usa elevation aquí: cambiaría el orden de dibujo
          // y taparía los íconos. El relieve lo da el borde superior claro.
          Platform.select({
            android: { borderTopColor: isDark ? '#52525b' : '#d4d4d8' },
            default: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: isDark ? 0.45 : 0.12,
              shadowRadius: 12,
            },
          }),
        ]}
      />
    ),
    sceneStyle: {
      backgroundColor: colors.background,
    },
    headerStyle: {
      backgroundColor: colors.card,
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
    },
    headerTintColor: colors.foreground,
    headerTitleStyle: {
      fontWeight: '700',
    },
  };
}
