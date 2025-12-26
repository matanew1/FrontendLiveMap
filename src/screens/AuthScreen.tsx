import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import { ModernInput } from "../components/ModernInput";
import { COLORS, SPACING, SHADOWS } from "../constants/theme";
import { useSignIn, useSignUp } from "../hooks/auth";

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const signInMutation = useSignIn();
  const signUpMutation = useSignUp();
  const isLoading = signInMutation.isPending || signUpMutation.isPending;

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Required", "Please enter both email and password.");
      return;
    }
    try {
      if (isSignUp) {
        await signUpMutation.mutateAsync({ email, password });
      } else {
        await signInMutation.mutateAsync({ email, password });
      }
    } catch (error: any) {
      Alert.alert("Authentication Failed", error.message);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoBadge}>
                <FontAwesome5 name="dog" size={32} color={COLORS.PRIMARY} />
              </View>
              <Text style={styles.title}>CyDog</Text>
              <Text style={styles.subtitle}>
                {isSignUp ? "Create your account" : "Welcome back"}
              </Text>
            </View>

            {/* Form */}
            <View style={styles.formCard}>
              <ModernInput
                label="Email Address"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <ModernInput
                label="Password"
                placeholder="••••••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.primaryBtnText}>
                    {isSignUp ? "Create Account" : "Sign In"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <TouchableOpacity
              style={styles.footerBtn}
              onPress={() => setIsSignUp(!isSignUp)}
            >
              <Text style={styles.footerText}>
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG_MAIN },
  safeArea: { flex: 1 },
  keyboardView: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: SPACING.l,
  },
  header: { alignItems: "center", marginBottom: SPACING.xl },
  logoBadge: {
    width: 64,
    height: 64,
    backgroundColor: COLORS.BG_CARD,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.m,
    ...SHADOWS.md,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.xs,
  },
  formCard: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: 16,
    padding: SPACING.l,
    ...SHADOWS.sm,
  },
  primaryBtn: {
    backgroundColor: COLORS.PRIMARY,
    height: 52,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.m,
  },
  primaryBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  footerBtn: { marginTop: SPACING.l, alignItems: "center" },
  footerText: { color: COLORS.TEXT_SECONDARY, fontSize: 14 },
});
