import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error = null,
  helper = null,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  disabled = false,
  style,
  inputStyle,
  ...props
}) {
  const { colors, radius, spacing, fontSize } = useTheme();
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);

  const hasToggle = secureTextEntry;

  return (
    <View style={[styles.container, { marginBottom: spacing.md }, style]}>
      {label ? (
        <Text
          style={[
            styles.label,
            {
              color: colors.foreground,
              fontSize: fontSize.sm,
              marginBottom: spacing.xs,
            },
          ]}
        >
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.card,
            borderColor: error
              ? colors.destructive
              : isFocused
              ? colors.primary
              : colors.border,
            borderRadius: radius.md,
            paddingHorizontal: spacing.md,
          },
          disabled && { backgroundColor: colors.muted, opacity: 0.7 },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          secureTextEntry={hasToggle ? isSecure : false}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            {
              color: colors.foreground,
              fontSize: fontSize.base,
            },
            inputStyle,
          ]}
          {...props}
        />

        {hasToggle ? (
          <TouchableOpacity
            onPress={() => setIsSecure(!isSecure)}
            style={styles.toggleButton}
            accessibilityRole="button"
            accessibilityLabel={isSecure ? 'Mostrar contraseña' : 'Ocultar contraseña'}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons
              name={isSecure ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.mutedForeground}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? (
        <Text
          style={[
            styles.errorText,
            {
              color: colors.destructive,
              fontSize: fontSize.xs,
              marginTop: spacing.xs,
            },
          ]}
        >
          {error}
        </Text>
      ) : helper ? (
        <Text
          style={[
            styles.helperText,
            {
              color: colors.mutedForeground,
              fontSize: fontSize.xs,
              marginTop: spacing.xs,
            },
          ]}
        >
          {helper}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontWeight: '600',
  },
  inputContainer: {
    minHeight: 48,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
    paddingVertical: 10,
  },
  toggleButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontWeight: '500',
  },
  helperText: {},
});
