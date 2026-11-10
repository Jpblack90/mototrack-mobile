import { useColorScheme } from 'react-native';

/**
 * Tokens de color de MotoTrack AI en formato hexadecimal,
 * replicando exactamente la paleta de mototrack-frontend/src/index.css.
 */
export const colors = {
  light: {
    primary: '#c50220',            // Rojo MotoTrack (oklch 0.52 0.21 25)
    primaryForeground: '#ffffff',
    background: '#ffffff',
    card: '#ffffff',
    cardForeground: '#18181b',
    foreground: '#18181b',
    muted: '#f4f4f5',
    mutedForeground: '#71717a',
    border: '#e4e4e7',
    input: '#e4e4e7',
    success: '#007313',            // Verde accesible
    successForeground: '#ffffff',
    warning: '#834300',            // Ámbar accesible
    warningForeground: '#ffffff',
    destructive: '#b81e00',        // Naranja-rojo accesible
    destructiveForeground: '#ffffff',
    sidebar: '#0d0d0d',            // Franja oscura de marca persistente
    sidebarForeground: '#e4e4e7',
    sidebarBorder: '#27272a',
  },
  dark: {
    primary: '#db2b33',            // Rojo ligeramente más brillante en oscuro
    primaryForeground: '#ffffff',
    background: '#18181b',
    card: '#27272a',
    cardForeground: '#fafafa',
    foreground: '#fafafa',
    muted: '#27272a',
    mutedForeground: '#a1a1aa',
    border: '#3f3f46',
    input: '#3f3f46',
    success: '#54bf5c',            // Verde accesible en modo oscuro
    successForeground: '#18181b',
    warning: '#e89d00',            // Ámbar accesible en modo oscuro
    warningForeground: '#18181b',
    destructive: '#ef4444',        // Naranja-rojo en modo oscuro
    destructiveForeground: '#ffffff',
    sidebar: '#0d0d0d',            // Franja oscura de marca persistente
    sidebarForeground: '#e4e4e7',
    sidebarBorder: '#27272a',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
};

/**
 * Retorna la paleta de colores para el esquema indicado ('light' | 'dark').
 */
export function getTheme(scheme) {
  const isDark = scheme === 'dark';
  return {
    colors: isDark ? colors.dark : colors.light,
    spacing,
    radius,
    fontSize,
    isDark,
  };
}

/**
 * Hook para consumir los tokens temáticos dinámicamente según el sistema operativo.
 */
export function useTheme() {
  const scheme = useColorScheme();
  return getTheme(scheme);
}
