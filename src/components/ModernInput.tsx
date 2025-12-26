import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from "react-native";
import { COLORS, SPACING, FONTS } from "../constants/theme";

interface ModernInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export const ModernInput = ({ label, error, ...props }: ModernInputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputFocused,
          !!error && styles.inputError,
        ]}
      >
        <TextInput
          style={styles.input}
          placeholderTextColor={COLORS.TEXT_TERTIARY}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.m },
  label: {
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 6,
    fontWeight: "600",
  },
  inputWrapper: {
    backgroundColor: COLORS.BG_INPUT,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
    height: 48,
    justifyContent: "center",
    paddingHorizontal: SPACING.m,
  },
  inputFocused: {
    backgroundColor: COLORS.BG_CARD,
    borderColor: COLORS.PRIMARY,
  },
  inputError: {
    borderColor: COLORS.DANGER,
  },
  input: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    fontFamily: FONTS.regular,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.DANGER,
    marginTop: 4,
  },
});
