import { Platform } from 'react-native';
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
    tabBarStyle: {
      backgroundColor: colors.card,
      height: TAB_BAR_CONTENT_HEIGHT + bottomInset,
      paddingBottom: bottomInset,
      paddingTop: 0,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      // Efecto de elevación (sombra hacia arriba)
      ...Platform.select({
        android: { elevation: 18 },
        default: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDark ? 0.45 : 0.12,
          shadowRadius: 12,
        },
      }),
    },
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
