import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import Button from './Button';

export default function EmptyState({
  icon = null,
  title,
  description,
  actionTitle = null,
  onAction = null,
  style,
}) {
  const { colors, spacing, fontSize } = useTheme();

  return (
    <View style={[styles.container, { padding: spacing.xl }, style]}>
      {icon ? <View style={[styles.iconContainer, { marginBottom: spacing.md }]}>{icon}</View> : null}
      {title ? (
        <Text
          style={[
            styles.title,
            {
              color: colors.foreground,
              fontSize: fontSize.lg,
              marginBottom: spacing.xs,
            },
          ]}
        >
          {title}
        </Text>
      ) : null}
      {description ? (
        <Text
          style={[
            styles.description,
            {
              color: colors.mutedForeground,
              fontSize: fontSize.sm,
              marginBottom: actionTitle ? spacing.lg : 0,
            },
          ]}
        >
          {description}
        </Text>
      ) : null}
      {actionTitle && onAction ? (
        <Button title={actionTitle} onPress={onAction} variant="primary" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
});
