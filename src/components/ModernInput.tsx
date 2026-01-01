import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  Animated,
} from "react-native";
import { COLORS, SPACING, FONTS, SHADOWS } from "../constants/theme";

interface ModernInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export const ModernInput = ({ label, error, ...props }: ModernInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", COLORS.PRIMARY],
  });

  const backgroundColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.BG_INPUT, COLORS.BG_SURFACE],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View
        style={[
          styles.inputWrapper,
          {
            borderColor: error ? COLORS.DANGER : borderColor,
            backgroundColor,
            shadowOpacity: focusAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.1],
            }),
          },
        ]}
      >
        <TextInput
          style={styles.input}
          placeholderTextColor={COLORS.TEXT_TERTIARY}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </Animated.View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.m },
  label: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 8,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  inputWrapper: {
    borderRadius: 16,
    borderWidth: 1.5,
    height: 56,
    justifyContent: "center",
    paddingHorizontal: SPACING.m,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 0, // Animated elevation via shadowOpacity
  },
  input: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    fontFamily: FONTS.regular,
    height: "100%",
  },
  errorText: {
    fontSize: 12,
    color: COLORS.DANGER,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: "500",
  },
});
