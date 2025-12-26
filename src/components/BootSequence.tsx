import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../constants/theme";

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

  useEffect(() => {
    // Elegant entrance
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Check if all steps are completed
    const allCompleted = steps.every((step) => step.completed);
    if (allCompleted) {
      // Elegant exit
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(onComplete);
    }
  }, [steps, onComplete]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={{ opacity: opacityAnim, transform: [{ scale: scaleAnim }] }}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="dog-side"
              size={64}
              color={COLORS.PRIMARY}
            />
          </View>

          <View style={styles.stepsContainer}>
            {steps.map((step, index) => (
              <View key={index} style={styles.stepRow}>
                <MaterialCommunityIcons
                  name={step.completed ? "check-circle" : "circle-outline"}
                  size={20}
                  color={step.completed ? COLORS.ACCENT : COLORS.TEXT_SECONDARY}
                />
                <Text
                  style={[
                    styles.stepText,
                    step.completed && styles.stepTextCompleted,
                  ]}
                >
                  {step.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG_MAIN,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
  },
  iconContainer: {
    padding: 20,
    backgroundColor: COLORS.BG_CARD,
    borderRadius: 24,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 30,
  },
  stepsContainer: {
    width: 250,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  stepText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: 12,
    fontWeight: "500",
  },
  stepTextCompleted: {
    color: COLORS.ACCENT,
  },
});
