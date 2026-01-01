import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Text, Easing } from "react-native";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SPACING, SHADOWS, GRADIENTS } from "../constants/theme";

interface BootStep {
  label: string;
  completed: boolean;
}

export default function BootSequence({
  steps,
  onComplete,
}: {
  steps: BootStep[];
  onComplete: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Initial Entrance
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Breathing Pulse (Standard RN Animated)
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Check completion
    const allCompleted = steps.every((step) => step.completed);
    if (allCompleted) {
      const timer = setTimeout(() => {
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(onComplete);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [steps]);

  return (
    <LinearGradient
      colors={GRADIENTS.primary}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Animated.View
        style={[
          styles.inner,
          { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.content}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <View style={styles.iconGlow}>
              <LinearGradient
                colors={GRADIENTS.glass}
                style={styles.iconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialCommunityIcons
                  name="dog-side"
                  size={58}
                  color="#FFF"
                />
              </LinearGradient>
            </View>
          </Animated.View>

          <Text style={styles.title}>CyDog</Text>
          <Text style={styles.subtitle}>Initializing secure link...</Text>

          <View style={styles.stepsContainer}>
            {steps.map((step, index) => (
              <View
                key={index}
                style={[
                  styles.stepRow,
                  step.completed && styles.stepRowCompleted,
                ]}
              >
                <View style={styles.iconBox}>
                  {step.completed ? (
                    <MaterialCommunityIcons
                      name="check-decagram"
                      size={20}
                      color={COLORS.ACCENT}
                    />
                  ) : (
                    <View style={styles.dotLoader} />
                  )}
                </View>
                <Text
                  style={[
                    styles.stepText,
                    step.completed && styles.stepTextCompleted,
                  ]}
                >
                  {step.label}
                </Text>
                {step.completed && (
                  <Feather name="check" size={14} color={COLORS.ACCENT} />
                )}
              </View>
            ))}
          </View>

          <View style={styles.footer}>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      (steps.filter((s) => s.completed).length / steps.length) *
                      100
                    }%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.footerText}>
              SYSTEM STATUS:{" "}
              {steps.every((s) => s.completed) ? "OPERATIONAL" : "BOOTING..."}
            </Text>
          </View>
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  inner: { width: "100%", alignItems: "center" },
  content: { alignItems: "center", width: "85%" },
  iconGlow: {
    padding: 4,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: SPACING.l,
  },
  iconContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    ...SHADOWS.md,
  },
  title: {
    fontSize: 42,
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: -1,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginBottom: SPACING.xxl,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  stepsContainer: { width: "100%", gap: 10 },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.m,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  stepRowCompleted: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderColor: "#FFF",
    ...SHADOWS.sm,
  },
  iconBox: { width: 24, marginRight: SPACING.m, alignItems: "center" },
  dotLoader: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  stepTextCompleted: { color: COLORS.TEXT_PRIMARY, fontWeight: "700" },
  footer: { marginTop: SPACING.xxl, width: "100%", alignItems: "center" },
  progressBarBg: {
    width: "60%",
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: SPACING.m,
  },
  progressFill: { height: "100%", backgroundColor: "#FFF" },
  footerText: {
    fontSize: 10,
    fontWeight: "800",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 2,
  },
});
