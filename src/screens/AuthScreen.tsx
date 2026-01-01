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
import { COLORS, SPACING, SHADOWS } from "../constants/theme";
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
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
        >
          <View style={styles.brandContainer}>
            <View style={styles.logoCircle}>
              <FontAwesome5 name="dog" size={32} color={COLORS.PRIMARY} />
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
              style={[styles.mainBtn, isLoading && styles.btnDisabled]}
              onPress={() =>
                isSignUp
                  ? signUp.mutate({ email, password })
                  : signIn.mutate({ email, password })
              }
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.btnText}>
                  {isSignUp ? "Join the Pack" : "Sign In"}
                </Text>
              )}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG_MAIN },
  safeArea: { flex: 1 },
  flex: { flex: 1, justifyContent: "center", padding: SPACING.l },
  brandContainer: { alignItems: "center", marginBottom: SPACING.xl },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.subtle,
    marginBottom: SPACING.m,
  },
  brandName: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: -1,
  },
  tagline: { fontSize: 14, color: COLORS.TEXT_SECONDARY, marginTop: 4 },
  authCard: {
    backgroundColor: "#FFF",
    borderRadius: 32,
    padding: SPACING.l,
    ...SHADOWS.premium,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: SPACING.l,
    color: COLORS.TEXT_PRIMARY,
  },
  mainBtn: {
    backgroundColor: COLORS.PRIMARY,
    height: 58,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.m,
  },
  btnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  btnDisabled: { opacity: 0.7 },
  switchBtn: { marginTop: SPACING.l, alignItems: "center" },
  switchText: { color: COLORS.PRIMARY, fontWeight: "600", fontSize: 14 },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    padding: SPACING.m,
    borderRadius: 12,
    marginBottom: SPACING.m,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: {
    color: COLORS.DANGER,
    marginLeft: SPACING.s,
    fontSize: 14,
    flex: 1,
  },
});
