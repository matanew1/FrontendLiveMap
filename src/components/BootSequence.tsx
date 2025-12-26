import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SHADOWS } from "../constants/theme";

export default function BootSequence({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [status, setStatus] = React.useState("Initializing...");

  const statusMessages = [
    "Initializing...",
    "Scanning Networks...",
    "Decrypting Data...",
    "System Online",
  ];

  useEffect(() => {
    // Entrance Animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Status Message Cycle
    let i = 0;
    const interval = setInterval(() => {
      if (i < statusMessages.length) {
        setStatus(statusMessages[i]);
        i++;
      }
    }, 600);

    // Progress Bar & Exit
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2500,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false,
    }).start(() => {
      // Exit animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => onComplete());
    });

    return () => clearInterval(interval);
  }, []);

  return (
    <LinearGradient
      colors={[COLORS.BG_DARK, "#0A0F1A", COLORS.BG_DARK]}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={[COLORS.CYAN, COLORS.PURPLE]}
            style={styles.logoGlow}
          >
            <MaterialCommunityIcons
              name="map-marker-path"
              size={60}
              color="#FFF"
            />
          </LinearGradient>
        </View>

        <Text style={styles.title}>
          Cy<Text style={{ color: COLORS.CYAN }}>Dog</Text>
        </Text>

        <View style={styles.loaderWrapper}>
          <Text style={styles.statusText}>{status}</Text>
          <View style={styles.progressBarBg}>
            <LinearGradient
              colors={[COLORS.CYAN, COLORS.PURPLE]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
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
  content: { alignItems: "center", width: "80%" },
  logoContainer: { marginBottom: 20 },
  logoGlow: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.CYAN,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 1,
    textShadowColor: COLORS.CYAN,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  loaderWrapper: { width: "100%", marginTop: 50 },
  statusText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    marginBottom: 10,
    fontWeight: "500",
    textAlign: "center",
  },
  progressBarBg: {
    width: "100%",
    height: 6,
    backgroundColor: "#1A1E26",
    borderRadius: 3,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.CYAN,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
});
