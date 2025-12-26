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
import {
  FontAwesome5,
  MaterialCommunityIcons,
  Feather,
} from "@expo/vector-icons";
import { ModernInput } from "../components/ModernInput";
import { COLORS, SPACING, SHADOWS, FONTS } from "../constants/theme";
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
            {/* Enhanced Header */}
            <View style={styles.header}>
              <View style={styles.logoGlow}>
                <View style={styles.logoBadge}>
                  <FontAwesome5 name="dog" size={40} color={COLORS.PRIMARY} />
                </View>
              </View>
              <Text style={styles.title}>CyDog</Text>
              <Text style={styles.subtitle}>
                {isSignUp ? "Create your account" : "Welcome back"}
              </Text>
              <View style={styles.headerStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>10K+</Text>
                  <Text style={styles.statLabel}>Happy Dogs</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>⭐</Text>
                  <Text style={styles.statLabel}>Top Rated</Text>
                </View>
              </View>
            </View>

            {/* Enhanced Form Card */}
            <View style={styles.formCard}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons
                  name={isSignUp ? "account-plus" : "login"}
                  size={24}
                  color={COLORS.PRIMARY}
                />
                <Text style={styles.cardTitle}>
                  {isSignUp ? "Create Account" : "Sign In"}
                </Text>
              </View>

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
                style={[
                  styles.primaryBtn,
                  isLoading && styles.primaryBtnDisabled,
                ]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Feather
                      name={isSignUp ? "user-plus" : "log-in"}
                      size={18}
                      color="#FFF"
                    />
                    <Text style={styles.primaryBtnText}>
                      {isSignUp ? "Create Account" : "Sign In"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Enhanced Footer */}
            <TouchableOpacity
              style={styles.footerBtn}
              onPress={() => setIsSignUp(!isSignUp)}
            >
              <View style={styles.footerContent}>
                <Feather
                  name={isSignUp ? "log-in" : "user-plus"}
                  size={16}
                  color={COLORS.TEXT_SECONDARY}
                />
                <Text style={styles.footerText}>
                  {isSignUp
                    ? "Already have an account? Sign in"
                    : "Don't have an account? Sign up"}
                </Text>
              </View>
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

  // Enhanced Header
  header: { alignItems: "center", marginBottom: SPACING.xxl },
  logoGlow: {
    padding: 4,
    borderRadius: 50,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    ...SHADOWS.lg,
  },
  logoBadge: {
    width: 90,
    height: 90,
    backgroundColor: COLORS.BG_CARD,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.md,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.TEXT_PRIMARY,
    marginTop: SPACING.l,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.xs,
    textAlign: "center",
  },
  headerStats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.l,
    backgroundColor: COLORS.GLASS,
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    ...SHADOWS.md,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.TEXT_PRIMARY,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: "600",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 25,
    backgroundColor: COLORS.BORDER,
    marginHorizontal: SPACING.m,
  },

  // Enhanced Form Card
  formCard: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: 24,
    padding: SPACING.l,
    marginBottom: SPACING.xl,
    ...SHADOWS.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.l,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
    marginLeft: SPACING.s,
  },

  // Enhanced Buttons
  primaryBtn: {
    backgroundColor: COLORS.PRIMARY,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.m,
    flexDirection: "row",
    ...SHADOWS.md,
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: SPACING.s,
  },

  // Enhanced Footer
  footerBtn: {
    alignItems: "center",
    paddingVertical: SPACING.m,
  },
  footerContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.BG_CARD,
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
    borderRadius: 20,
    ...SHADOWS.sm,
  },
  footerText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: SPACING.s,
  },
});
