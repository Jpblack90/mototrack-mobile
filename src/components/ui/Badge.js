import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

export default function Badge({
  label,
  children,
  variant = 'default',
  style,
  textStyle,
  icon = null,
  ...props
}) {
  const { colors, radius, spacing, fontSize } = useTheme();

  let bg = colors.primary;
  let text = colors.primaryForeground;
  let border = 'transparent';

  if (variant === 'success') {
    bg = colors.success + '20'; // 12% opacity
    text = colors.success;
    border = colors.success + '40';
  } else if (variant === 'warning') {
    bg = colors.warning + '20';
    text = colors.warning;
    border = colors.warning + '40';
  } else if (variant === 'destructive') {
    bg = colors.destructive + '20';
    text = colors.destructive;
    border = colors.destructive + '40';
  } else if (variant === 'outline') {
    bg = 'transparent';
    text = colors.foreground;
    border = colors.border;
  }

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          borderColor: border,
          borderRadius: radius.full,
          paddingHorizontal: spacing.sm + 2,
          paddingVertical: spacing.xs,
        },
        style,
      ]}
      {...props}
    >
      {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
      <Text
        style={[
          styles.text,
          {
            color: text,
            fontSize: fontSize.xs,
          },
          textStyle,
        ]}
      >
        {label || children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 4,
  },
  text: {
    fontWeight: '600',
    textTransform: 'none',
  },
});
