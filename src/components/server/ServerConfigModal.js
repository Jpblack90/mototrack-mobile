import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import {
  getApiUrl,
  setApiUrl,
  resetApiUrl,
  testConnection,
  validateApiUrl,
  DEFAULT_API_URL,
} from '../../config/server';
import Button from '../ui/Button';

export default function ServerConfigModal({ visible, onClose, onSaved }) {
  const { colors, radius, spacing, fontSize } = useTheme();

  const [urlInput, setUrlInput] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // { success: boolean, message: string }
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      getApiUrl().then((current) => {
        setUrlInput(current);
        setTestResult(null);
      });
    }
  }, [visible]);

  const handleUrlChange = (text) => {
    setUrlInput(text);
    // Cualquier cambio en la URL invalida la prueba anterior
    if (testResult) {
      setTestResult(null);
    }
  };

  const handleTest = async () => {
    const trimmed = urlInput.trim();
    if (!validateApiUrl(trimmed)) {
      setTestResult({
        success: false,
        message: 'Formato inválido. Debe ser http(s)://host[:puerto]/api',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    const res = await testConnection(trimmed);
    setTesting(false);

    if (res.success) {
      setTestResult({
        success: true,
        message: 'Conectado exitosamente con el servidor.',
      });
    } else {
      setTestResult({
        success: false,
        message: res.error || 'Error de conexión con el servidor.',
      });
    }
  };

  const handleSave = async () => {
    const trimmed = urlInput.trim();
    if (!testResult || !testResult.success) {
      return;
    }

    setSaving(true);
    try {
      const saved = await setApiUrl(trimmed);
      if (onSaved) {
        await onSaved(saved);
      }
      onClose();
    } catch (err) {
      setTestResult({
        success: false,
        message: err.message || 'Error al guardar la URL.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setTesting(false);
    setUrlInput(DEFAULT_API_URL);
    setTestResult(null);
    await resetApiUrl();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}
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
            {/* Cabecera */}
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <Ionicons
                  name="server"
                  size={22}
                  color={colors.primary}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={[
                    styles.title,
                    { color: colors.foreground, fontSize: fontSize.lg },
                  ]}
                >
                  Configurar Servidor
                </Text>
              </View>

              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={24} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <Text
              style={[
                styles.subtitle,
                { color: colors.mutedForeground, fontSize: fontSize.xs, marginTop: 4 },
              ]}
            >
              Ingresa la dirección IP o dominio del backend para conectar la app
              en la red local.
            </Text>

            {/* Campo URL */}
            <View style={[styles.fieldGroup, { marginTop: spacing.md }]}>
              <Text
                style={[
                  styles.label,
                  { color: colors.foreground, fontSize: fontSize.sm },
                ]}
              >
                URL de la API (Backend)
              </Text>
              <TextInput
                value={urlInput}
                onChangeText={handleUrlChange}
                placeholder="http://192.168.1.50:4000/api"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.foreground,
                    borderColor: colors.border,
                    borderRadius: radius.md,
                    fontSize: fontSize.sm,
                  },
                ]}
              />
            </View>

            {/* Resultado de la prueba */}
            {testResult && (
              <View
                style={[
                  styles.resultBox,
                  {
                    backgroundColor: testResult.success
                      ? 'rgba(0, 115, 19, 0.08)'
                      : 'rgba(184, 30, 0, 0.08)',
                    borderColor: testResult.success
                      ? colors.success
                      : colors.destructive,
                    borderRadius: radius.md,
                    padding: spacing.sm,
                    marginTop: spacing.sm,
                  },
                ]}
              >
                <Ionicons
                  name={testResult.success ? 'checkmark-circle' : 'alert-circle'}
                  size={20}
                  color={testResult.success ? colors.success : colors.destructive}
                />
                <Text
                  style={[
                    styles.resultText,
                    {
                      color: testResult.success
                        ? colors.success
                        : colors.destructive,
                      fontSize: fontSize.xs,
                      marginLeft: 8,
                      flex: 1,
                    },
                  ]}
                >
                  {testResult.success ? 'Conectado' : testResult.message}
                </Text>
              </View>
            )}

            {/* Botón Probar conexión */}
            <Button
              title={testing ? 'Probando conexión…' : 'Probar conexión'}
              variant="outline"
              onPress={handleTest}
              loading={testing}
              disabled={testing || saving || !urlInput.trim()}
              icon={
                !testing ? (
                  <Ionicons
                    name="wifi-outline"
                    size={18}
                    color={colors.foreground}
                  />
                ) : null
              }
              style={{ marginTop: spacing.md, minHeight: 46 }}
            />

            {/* Acciones: Guardar y Restablecer */}
            <View style={[styles.actionsRow, { marginTop: spacing.md }]}>
              <Button
                title="Restablecer"
                variant="outline"
                onPress={handleReset}
                disabled={testing || saving}
                style={[styles.actionBtnFlex, { marginRight: spacing.sm }]}
              />
              <Button
                title={saving ? 'Guardando…' : 'Guardar'}
                variant="primary"
                onPress={handleSave}
                loading={saving}
                disabled={!testResult || !testResult.success || testing || saving}
                style={styles.actionBtnFlex}
              />
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  keyboardAvoid: {
    width: '100%',
    maxWidth: 420,
  },
  dialog: {
    width: '100%',
    borderWidth: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
  },
  subtitle: {
    lineHeight: 16,
  },
  fieldGroup: {},
  label: {
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    height: 46,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  resultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  resultText: {
    fontWeight: '600',
    lineHeight: 16,
  },
  actionsRow: {
    flexDirection: 'row',
  },
  actionBtnFlex: {
    flex: 1,
    minHeight: 46,
  },
});
