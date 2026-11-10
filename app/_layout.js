import React, { useEffect } from 'react';
import { View, Image, ActivityIndicator, StyleSheet } from 'react-native';
import {
  Slot,
  useRouter,
  useSegments,
  ThemeProvider,
  DarkTheme,
  DefaultTheme,
} from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SystemUI from 'expo-system-ui';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/theme';

export const unstable_settings = {
  initialRouteName: '(auth)',
};

function AuthGate() {
  const { user, loading, isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { colors } = useTheme();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const currentScreen = segments[1];

    if (!isAuthenticated) {
      if (!inAuthGroup || currentScreen !== 'login') {
        router.replace('/(auth)/login');
      }
      return;
    }

    // Usuario autenticado con cambio de contraseña pendiente
    if (user?.must_change_password) {
      if (segments[0] !== '(auth)' || currentScreen !== 'change-password') {
        router.replace('/(auth)/change-password');
      }
      return;
    }

    // Usuario autenticado con rol NO permitido en la app móvil
    if (user?.role !== 'mecanico' && user?.role !== 'almacenero') {
      if (segments[0] !== '(auth)' || currentScreen !== 'unauthorized') {
        router.replace('/(auth)/unauthorized');
      }
      return;
    }

    // Usuario autorizado: redirigir a su interfaz de rol si se encuentra en auth o raíz
    if (inAuthGroup || segments.length === 0) {
      if (user.role === 'mecanico') {
        router.replace('/(mecanico)/(tabs)');
      } else if (user.role === 'almacenero') {
        router.replace('/(almacenero)/(tabs)');
      }
    }
  }, [user, loading, isAuthenticated, segments, router]);

  if (loading) {
    return (
      <View style={[styles.splashContainer, { backgroundColor: '#0d0d0d' }]}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.splashLogo}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 24 }} />
      </View>
    );
  }

  return <Slot />;
}

/**
 * Tema de navegación alineado con los tokens de src/theme.js,
 * para que el fondo detrás de la barra de pestañas y las
 * transiciones no muestren blanco en modo oscuro.
 */
function NavigationTheme({ children }) {
  const { colors, isDark } = useTheme();

  // Fondo de la ventana nativa con el color del tema: sin esto Android muestra
  // un destello blanco al volver atrás o durante las transiciones del Stack.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => {});
  }, [colors.background]);
  const base = isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.foreground,
      border: colors.border,
    },
  };
  return <ThemeProvider value={navTheme}>{children}</ThemeProvider>;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <NavigationTheme>
        <AuthProvider>
          <AuthGate />
        </AuthProvider>
      </NavigationTheme>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    width: 220,
    height: 70,
  },
});
