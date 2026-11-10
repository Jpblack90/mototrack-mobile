import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../src/theme';
import useProductScan from '../../../src/hooks/useProductScan';
import Button from '../../../src/components/ui/Button';

export default function EscanearProductoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, radius, fontSize } = useTheme();

  const {
    loading,
    error,
    errorCode,
    scan,
    reset,
    takePhoto,
    pickFromGallery,
  } = useProductScan();

  const [photoUri, setPhotoUri] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Acción para tomar foto con la cámara
  const handleTakePhoto = async () => {
    setPermissionDenied(false);
    reset();
    const res = await takePhoto();
    if (res.permissionDenied) {
      setPermissionDenied(true);
      return;
    }
    if (!res.canceled && res.uri) {
      setPhotoUri(res.uri);
    }
  };

  // Acción para seleccionar foto de la galería
  const handlePickGallery = async () => {
    reset();
    const res = await pickFromGallery();
    if (!res.canceled && res.uri) {
      setPhotoUri(res.uri);
    }
  };

  // Disparar el análisis con IA
  const handleAnalyze = async () => {
    if (!photoUri || loading) return;
    const res = await scan(photoUri);
    if (res && res.success && res.data) {
      router.push({
        pathname: '/(almacenero)/producto/nuevo',
        params: {
          scanData: JSON.stringify(res.data),
          imageUri: photoUri,
        },
      });
    }
  };

  // Repetir / cambiar foto
  const handleRetake = () => {
    setPhotoUri(null);
    reset();
  };

  const isPlanLimit =
    errorCode === 'PLAN_LIMIT_REACHED' ||
    (error && error.includes('Alcanzaste los'));

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {/* Barra superior con botón volver */}
      <View
        style={[
          styles.topBar,
          {
            borderBottomColor: colors.border,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text
          style={[
            styles.screenTitle,
            { color: colors.foreground, fontSize: fontSize.lg },
          ]}
        >
          Escanear repuesto con IA
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { padding: spacing.lg }]}
      >
        {/* Paso 1: Sin foto seleccionada */}
        {!photoUri && (
          <View style={styles.selectStep}>
            <View
              style={[
                styles.illustrationBox,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: radius.lg,
                  padding: spacing.xl,
                },
              ]}
            >
              <Ionicons name="sparkles" size={56} color={colors.primary} />
              <Text
                style={[
                  styles.boxTitle,
                  {
                    color: colors.foreground,
                    fontSize: fontSize.lg,
                    marginTop: spacing.md,
                  },
                ]}
              >
                Identificación inteligente
              </Text>
              <Text
                style={[
                  styles.boxSubtitle,
                  {
                    color: colors.mutedForeground,
                    fontSize: fontSize.sm,
                    marginTop: spacing.xs,
                  },
                ]}
              >
                Toma una foto clara del repuesto o su empaque para detectar
                automáticamente nombre, marca, categoría y motos compatibles.
              </Text>
            </View>

            {/* Aviso si se denegó permiso de cámara */}
            {permissionDenied && (
              <View
                style={[
                  styles.permissionWarning,
                  {
                    backgroundColor: 'rgba(131, 67, 0, 0.08)',
                    borderColor: colors.warning,
                    borderRadius: radius.md,
                    padding: spacing.md,
                    marginTop: spacing.md,
                  },
                ]}
              >
                <Ionicons
                  name="information-circle"
                  size={22}
                  color={colors.warning}
                />
                <View style={styles.permissionWarningText}>
                  <Text
                    style={[
                      styles.permissionTitle,
                      { color: colors.warning, fontSize: fontSize.sm },
                    ]}
                  >
                    Permiso de cámara no disponible
                  </Text>
                  <Text
                    style={[
                      styles.permissionDescription,
                      { color: colors.mutedForeground, fontSize: fontSize.xs, marginTop: 2 },
                    ]}
                  >
                    MotoTrack usa la cámara para identificar repuestos con IA.
                    Puedes conceder el permiso en los ajustes de tu celular o
                    elegir una foto de tu galería.
                  </Text>
                </View>
              </View>
            )}

            {/* Botones grandes de selección */}
            <View style={[styles.buttonsContainer, { marginTop: spacing.xl }]}>
              <TouchableOpacity
                onPress={handleTakePhoto}
                style={[
                  styles.largeButton,
                  {
                    backgroundColor: colors.primary,
                    borderRadius: radius.lg,
                    padding: spacing.lg,
                    marginBottom: spacing.md,
                  },
                ]}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="camera"
                  size={28}
                  color={colors.primaryForeground}
                />
                <View style={styles.buttonTextWrapper}>
                  <Text
                    style={[
                      styles.largeButtonTitle,
                      {
                        color: colors.primaryForeground,
                        fontSize: fontSize.md,
                      },
                    ]}
                  >
                    Tomar foto
                  </Text>
                  <Text
                    style={[
                      styles.largeButtonSubtitle,
                      {
                        color: 'rgba(255,255,255,0.85)',
                        fontSize: fontSize.xs,
                      },
                    ]}
                  >
                    Abrir la cámara del dispositivo
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handlePickGallery}
                style={[
                  styles.largeButton,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderWidth: 1,
                    borderRadius: radius.lg,
                    padding: spacing.lg,
                  },
                ]}
                activeOpacity={0.8}
              >
                <Ionicons name="images-outline" size={28} color={colors.foreground} />
                <View style={styles.buttonTextWrapper}>
                  <Text
                    style={[
                      styles.largeButtonTitle,
                      { color: colors.foreground, fontSize: fontSize.md },
                    ]}
                  >
                    Elegir de galería
                  </Text>
                  <Text
                    style={[
                      styles.largeButtonSubtitle,
                      { color: colors.mutedForeground, fontSize: fontSize.xs },
                    ]}
                  >
                    Seleccionar una imagen guardada
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Paso 2: Con foto previa lista */}
        {photoUri && (
          <View style={styles.previewStep}>
            <View
              style={[
                styles.previewCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: radius.lg,
                  padding: spacing.md,
                },
              ]}
            >
              <Image
                source={{ uri: photoUri }}
                style={[styles.previewImage, { borderRadius: radius.md }]}
                resizeMode="contain"
              />

              {/* Manejo de errores */}
              {error && (
                <View
                  style={[
                    styles.errorBox,
                    {
                      backgroundColor: isPlanLimit
                        ? 'rgba(131, 67, 0, 0.08)'
                        : 'rgba(184, 30, 0, 0.08)',
                      borderColor: isPlanLimit
                        ? colors.warning
                        : colors.destructive,
                      borderRadius: radius.md,
                      padding: spacing.md,
                      marginTop: spacing.md,
                    },
                  ]}
                >
                  <Ionicons
                    name={isPlanLimit ? 'warning-outline' : 'alert-circle-outline'}
                    size={22}
                    color={isPlanLimit ? colors.warning : colors.destructive}
                  />
                  <Text
                    style={[
                      styles.errorText,
                      {
                        color: isPlanLimit ? colors.warning : colors.destructive,
                        fontSize: fontSize.sm,
                        marginLeft: 8,
                        flex: 1,
                      },
                    ]}
                  >
                    {error}
                  </Text>
                </View>
              )}

              {/* Botones de acción */}
              <View style={[styles.actionButtons, { marginTop: spacing.lg }]}>
                {isPlanLimit ? (
                  <Button
                    title="Registrar manualmente"
                    variant="primary"
                    onPress={() =>
                      router.replace('/(almacenero)/producto/nuevo')
                    }
                    style={styles.actionBtn}
                  />
                ) : error ? (
                  <Button
                    title="Reintentar análisis"
                    variant="primary"
                    onPress={handleAnalyze}
                    loading={loading}
                    disabled={loading}
                    style={styles.actionBtn}
                  />
                ) : (
                  <Button
                    title="Analizar con IA"
                    variant="primary"
                    onPress={handleAnalyze}
                    loading={loading}
                    disabled={loading}
                    style={styles.actionBtn}
                  />
                )}

                <Button
                  title="Cambiar foto / Repetir"
                  variant="outline"
                  onPress={handleRetake}
                  disabled={loading}
                  style={[styles.actionBtn, { marginTop: spacing.sm }]}
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Overlay modal durante el análisis con IA para bloquear doble toque */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View
            style={[
              styles.loadingCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: radius.lg,
                padding: spacing.xl,
              },
            ]}
          >
            <ActivityIndicator size="large" color={colors.primary} />
            <Text
              style={[
                styles.loadingOverlayText,
                {
                  color: colors.foreground,
                  fontSize: fontSize.md,
                  marginTop: spacing.md,
                },
              ]}
            >
              Identificando repuesto…
            </Text>
            <Text
              style={[
                styles.loadingOverlaySubtext,
                {
                  color: colors.mutedForeground,
                  fontSize: fontSize.xs,
                  marginTop: spacing.xs,
                },
              ]}
            >
              Analizando marcas, referencias y modelos compatibles
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  screenTitle: {
    fontWeight: '700',
  },
  content: {
    flexGrow: 1,
  },
  selectStep: {
    flex: 1,
    justifyContent: 'center',
  },
  illustrationBox: {
    alignItems: 'center',
    borderWidth: 1,
  },
  boxTitle: {
    fontWeight: '700',
    textAlign: 'center',
  },
  boxSubtitle: {
    textAlign: 'center',
    lineHeight: 20,
  },
  permissionWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
  },
  permissionWarningText: {
    flex: 1,
    marginLeft: 8,
  },
  permissionTitle: {
    fontWeight: '700',
  },
  permissionDescription: {
    lineHeight: 16,
  },
  buttonsContainer: {
    width: '100%',
  },
  largeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
  },
  buttonTextWrapper: {
    marginLeft: 16,
    flex: 1,
  },
  largeButtonTitle: {
    fontWeight: '700',
  },
  largeButtonSubtitle: {
    marginTop: 2,
  },
  previewStep: {
    flex: 1,
  },
  previewCard: {
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  previewImage: {
    width: '100%',
    height: 320,
    backgroundColor: '#00000010',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  errorText: {
    lineHeight: 18,
    fontWeight: '500',
  },
  actionButtons: {
    width: '100%',
  },
  actionBtn: {
    minHeight: 48,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    padding: 24,
  },
  loadingCard: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    borderWidth: 1,
    elevation: 8,
  },
  loadingOverlayText: {
    fontWeight: '700',
    textAlign: 'center',
  },
  loadingOverlaySubtext: {
    textAlign: 'center',
  },
});
