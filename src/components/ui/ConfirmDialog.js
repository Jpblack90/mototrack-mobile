import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../theme';
import Button from './Button';

/**
 * Diálogo de confirmación modal accesible para acciones críticas y cambios de estado.
 */
export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  loading = false,
  destructive = false,
}) {
  const { colors, radius, spacing, fontSize } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={loading ? undefined : onCancel}
    >
      <Pressable
        style={styles.backdrop}
        onPress={loading ? undefined : onCancel}
      >
        <Pressable
          style={[
            styles.dialog,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radius.lg,
              padding: spacing.lg,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {title ? (
            <Text
              style={[
                styles.title,
                { color: colors.foreground, fontSize: fontSize.lg },
              ]}
            >
              {title}
            </Text>
          ) : null}
          {message ? (
            <Text
              style={[
                styles.message,
                {
                  color: colors.mutedForeground,
                  fontSize: fontSize.sm,
                  marginTop: spacing.xs,
                },
              ]}
            >
              {message}
            </Text>
          ) : null}

          <View
            style={[styles.actions, { marginTop: spacing.lg, gap: spacing.sm }]}
          >
            <Button
              title={cancelText}
              variant="outline"
              onPress={onCancel}
              disabled={loading}
              style={styles.buttonFlex}
            />
            <Button
              title={confirmText}
              variant={destructive ? 'destructive' : 'primary'}
              onPress={onConfirm}
              loading={loading}
              style={styles.buttonFlex}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  title: {
    fontWeight: '700',
  },
  message: {
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
  },
  buttonFlex: {
    flex: 1,
    minHeight: 48,
  },
});
