import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import Button from './Button';

/**
 * Diálogo modal de éxito con icono de check verde accesible.
 * Reemplaza los Alerts nativos en los flujos de confirmación exitosa.
 */
export default function SuccessDialog({
  visible,
  title = 'Operación exitosa',
  message,
  buttonText = 'Entendido',
  onClose,
}) {
  const { colors, radius, spacing, fontSize } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
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
          <View style={styles.iconContainer}>
            <Ionicons
              name="checkmark-circle"
              size={54}
              color={colors.success}
            />
          </View>

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

          <View style={[styles.actions, { marginTop: spacing.lg }]}>
            <Button
              title={buttonText}
              variant="primary"
              onPress={onClose}
              style={styles.buttonFull}
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
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    lineHeight: 20,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
  },
  buttonFull: {
    width: '100%',
    minHeight: 48,
  },
});
