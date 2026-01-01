// src/screens/AuthScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SPACING, SHADOWS, GRADIENTS } from "../constants/theme";
import { ModernInput } from "../components/ModernInput";
import { useSignIn, useSignUp } from "../hooks/auth";

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const signIn = useSignIn();
  const signUp = useSignUp();
  const isLoading = signIn.isPending || signUp.isPending;
  const error = signIn.error || signUp.error;

  return (
    <LinearGradient
      colors={GRADIENTS.primary}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
        >
          <View style={styles.brandContainer}>
            <View style={styles.logoGlowContainer}>
              <LinearGradient
                colors={GRADIENTS.accent}
                style={styles.logoCircle}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <FontAwesome5 name="dog" size={36} color="#FFF" />
              </LinearGradient>
            </View>
            <Text style={styles.brandName}>CyDog</Text>
            <Text style={styles.tagline}>
              The future of canine social networking.
            </Text>
          </View>

          <View style={styles.authCard}>
            <Text style={styles.cardTitle}>
              {isSignUp ? "Create Account" : "Welcome Back"}
            </Text>

            {error && (
              <View style={styles.errorContainer}>
                <Feather name="alert-circle" size={20} color={COLORS.DANGER} />
                <Text style={styles.errorText}>
                  {error.message || "An error occurred. Please try again."}
                </Text>
              </View>
            )}

            <ModernInput
              label="Email"
              placeholder="name@domain.com"
              value={email}
              onChangeText={setEmail}
            />
            <ModernInput
              label="Password"
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                isSignUp
                  ? signUp.mutate({ email, password })
                  : signIn.mutate({ email, password })
              }
              disabled={isLoading}
            >
              <LinearGradient
                colors={GRADIENTS.accent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.mainBtn, isLoading && styles.btnDisabled]}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.btnText}>
                    {isSignUp ? "Join the Pack" : "Sign In"}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsSignUp(!isSignUp)}
              style={styles.switchBtn}
            >
              <Text style={styles.switchText}>
                {isSignUp
                  ? "Already have an account? Sign In"
                  : "New here? Create an account"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  flex: { flex: 1, justifyContent: "center", padding: SPACING.l },
  brandContainer: { alignItems: "center", marginBottom: SPACING.xl * 1.5 },
  logoGlowContainer: {
    shadowColor: COLORS.ACCENT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: SPACING.m,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
  },
  brandName: {
    fontSize: 42,
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: -1,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
    fontWeight: "500",
  },
  authCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 32,
    padding: SPACING.xl,
    ...SHADOWS.premium,
    borderWidth: 1,
    borderColor: "#FFF",
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: SPACING.l,
    color: COLORS.TEXT_PRIMARY,
    textAlign: "center",
  },
  mainBtn: {
    height: 58,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.m,
    ...SHADOWS.md,
  },
  btnText: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  btnDisabled: { opacity: 0.7 },
  switchBtn: { marginTop: SPACING.l, alignItems: "center" },
  switchText: { color: COLORS.PRIMARY, fontWeight: "600", fontSize: 15 },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    padding: SPACING.m,
    borderRadius: 16,
    marginBottom: SPACING.m,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: {
    color: COLORS.DANGER,
    marginLeft: SPACING.s,
    fontSize: 14,
    flex: 1,
    fontWeight: "500",
  },
});
