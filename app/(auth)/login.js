import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Switch,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/theme';
import { getStorageItem } from '../../src/utils/storage';
import Input from '../../src/components/ui/Input';
import Button from '../../src/components/ui/Button';
import ServerConfigModal from '../../src/components/server/ServerConfigModal';

export default function LoginScreen() {
  const { login } = useAuth();
  const { colors, spacing, radius, fontSize } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [serverModalVisible, setServerModalVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getStorageItem('mototrack_remember_email').then((savedEmail) => {
      if (isMounted && savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  async function handleLogin() {
    setErrorMessage('');
    setIsNetworkError(false);

    if (!email.trim() || !password) {
      setErrorMessage('Por favor ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password, rememberMe);
    } catch (err) {
      const msg =
        err.userMessage ||
        err.response?.data?.error?.message ||
        err.message ||
        'Error de conexión. Verifica que el servidor esté activo.';

      setErrorMessage(msg);
      if (err.isNetworkError) {
        setIsNetworkError(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Franja Oscura Superior con Logo y Marca ── */}
        <View style={[styles.headerBanner, { backgroundColor: '#0d0d0d', paddingVertical: spacing.xl }]}>
          {/* Botón de configuración de servidor */}
          <TouchableOpacity
            onPress={() => setServerModalVisible(true)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.gearButton}
            accessibilityRole="button"
            accessibilityLabel="Configurar servidor backend"
          >
            <Ionicons name="settings-outline" size={22} color="#e4e4e7" />
          </TouchableOpacity>

          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.tagline, { color: '#e4e4e7', fontSize: fontSize.sm, marginTop: spacing.xs }]}>
            Controla tu taller, impulsa tu negocio
          </Text>
          <View style={[styles.roleHint, { backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, marginTop: spacing.sm }]}>
            <Text style={{ color: colors.primary, fontSize: fontSize.xs, fontWeight: '600' }}>
              App Móvil • Mecánico y Almacenero
            </Text>
          </View>
        </View>

        {/* ── Contenedor del Formulario ── */}
        <View style={[styles.formContainer, { padding: spacing.lg }]}>
          <Text style={[styles.formTitle, { color: colors.foreground, fontSize: fontSize.xl, marginBottom: spacing.lg }]}>
            Iniciar Sesión
          </Text>

          {/* Recuadro persistente de errores (429, TRIAL_EXPIRED, SUBSCRIPTION_EXPIRED, red) */}
          {errorMessage ? (
            <View
              style={[
                styles.errorCard,
                {
                  backgroundColor: colors.destructive + '15',
                  borderColor: colors.destructive + '40',
                  borderRadius: radius.md,
                  padding: spacing.md,
                  marginBottom: spacing.md,
                },
              ]}
              accessibilityRole="alert"
            >
              <View style={styles.errorHeader}>
                <Ionicons name="alert-circle" size={20} color={colors.destructive} />
                <Text style={[styles.errorTitle, { color: colors.destructive, fontSize: fontSize.sm, marginLeft: spacing.xs }]}>
                  {isNetworkError ? 'Fallo de Conexión' : 'Aviso de Acceso'}
                </Text>
              </View>
              <Text style={[styles.errorText, { color: colors.destructive, fontSize: fontSize.xs, marginTop: spacing.xs }]}>
                {errorMessage}
              </Text>

              {isNetworkError ? (
                <Button
                  title="Reintentar"
                  onPress={handleLogin}
                  variant="outline"
                  style={{
                    marginTop: spacing.sm,
                    borderColor: colors.destructive,
                    minHeight: 48,
                    paddingVertical: spacing.sm,
                  }}
                  textStyle={{ color: colors.destructive, fontSize: fontSize.sm }}
                />
              ) : null}
            </View>
          ) : null}

          <Input
            label="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            placeholder="ejemplo@mototrack.local"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            placeholder="Tu contraseña"
          />

          {/* Recordarme */}
          <View style={[styles.rememberRow, { marginBottom: spacing.lg }]}>
            <Switch
              value={rememberMe}
              onValueChange={setRememberMe}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={rememberMe ? '#ffffff' : '#f4f4f5'}
            />
            <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} activeOpacity={0.7}>
              <Text style={[styles.rememberLabel, { color: colors.foreground, fontSize: fontSize.sm, marginLeft: spacing.sm }]}>
                Recordarme en este dispositivo
              </Text>
            </TouchableOpacity>
          </View>

          <Button
            title={loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            onPress={handleLogin}
            variant="primary"
            loading={loading}
          />
        </View>
      </ScrollView>

      {/* Modal para configurar servidor dinámico */}
      <ServerConfigModal
        visible={serverModalVisible}
        onClose={() => setServerModalVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerBanner: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  gearButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  logo: {
    width: 220,
    height: 64,
  },
  tagline: {
    fontWeight: '500',
    textAlign: 'center',
  },
  roleHint: {
    alignSelf: 'center',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  formTitle: {
    fontWeight: '700',
  },
  errorCard: {
    borderWidth: 1.5,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorTitle: {
    fontWeight: '700',
  },
  errorText: {
    lineHeight: 18,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberLabel: {
    fontWeight: '500',
  },
});
