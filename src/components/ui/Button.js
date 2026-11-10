import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme';

/**
 * Botón accesible con área táctil mínima de 48px.
 * Variantes: 'primary', 'outline', 'ghost', 'destructive'.
 */
export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon = null,
  style,
  textStyle,
  ...props
}) {
  const { colors, radius, spacing, fontSize } = useTheme();

  // Estilos por variante
  let backgroundColor = colors.primary;
  let borderColor = colors.primary;
  let textColor = colors.primaryForeground;
  let borderWidth = 0;

  if (variant === 'destructive') {
    backgroundColor = colors.destructive;
    borderColor = colors.destructive;
    textColor = colors.destructiveForeground;
  } else if (variant === 'outline') {
    backgroundColor = 'transparent';
    borderColor = colors.border;
    borderWidth = 1.5;
    textColor = colors.foreground;
  } else if (variant === 'ghost') {
    backgroundColor = 'transparent';
    borderColor = 'transparent';
    textColor = colors.foreground;
  }

  if (disabled) {
    backgroundColor = variant === 'ghost' || variant === 'outline' ? 'transparent' : colors.muted;
    borderColor = colors.border;
    textColor = colors.mutedForeground;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          backgroundColor,
          borderColor,
          borderWidth,
          borderRadius: radius.md,
          paddingHorizontal: spacing.md,
        },
        disabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={styles.content}>
          {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
          <Text
            style={[
              styles.text,
              {
                color: textColor,
                fontSize: fontSize.base,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.65,
  },
});
