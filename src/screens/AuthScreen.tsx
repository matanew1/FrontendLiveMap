import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Animated,
  Easing,
  Dimensions,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur"; // Adds the modern glass effect
import {
  Feather,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import * as Haptics from "expo-haptics"; // Optional: npm install expo-haptics
import { useNavigation } from "@react-navigation/native";
import useAuthStore from "../../store/authStore";
import { useSignIn, useSignUp } from "../hooks/auth";

const { width, height } = Dimensions.get("window");

// --- MODERN THEME CONSTANTS ---
const NEON_CYAN = "#00F0FF";
const NEON_PURPLE = "#BD00FF";
const BG_DARK = "#05070A";
const GLASS_SURFACE = "rgba(255, 255, 255, 0.05)";
const GLOW_BORDER = "rgba(0, 240, 255, 0.3)";

const AuthScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const signInMutation = useSignIn();
  const signUpMutation = useSignUp();

  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const formSlideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Subtle Float Animation for Logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -15,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Entry animation for the form
    Animated.spring(formSlideAnim, {
      toValue: 1,
      tension: 20,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  const triggerFeedback = () => {
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleSubmit = async () => {
    triggerFeedback();
    if (!email || !password) {
      Alert.alert("LINK FAILURE", "Credentials missing from data stream.");
      return;
    }
    try {
      if (isSignUp) {
        await signUpMutation.mutateAsync({ email, password });
      } else {
        await signInMutation.mutateAsync({ email, password });
      }
    } catch (error: any) {
      Alert.alert("ACCESS DENIED", error.message);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.mainContainer}>
        <StatusBar barStyle="light-content" />

        {/* BACKGROUND LAYER */}
        <LinearGradient
          colors={[BG_DARK, "#0A0D14", "#120520"]}
          style={StyleSheet.absoluteFill}
        />

        {/* CYBER PARTICLES (Visual Tool) */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {[...Array(6)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.particle,
                {
                  top: Math.random() * height,
                  left: Math.random() * width,
                  opacity: 0.3,
                },
              ]}
            />
          ))}
        </View>

        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.contentContainer}
          >
            {/* LOGO SECTION */}
            <Animated.View
              style={[
                styles.headerContainer,
                { transform: [{ translateY: floatAnim }] },
              ]}
            >
              <View style={styles.logoOuterGlow}>
                <LinearGradient
                  colors={[NEON_CYAN, NEON_PURPLE]}
                  style={styles.logoGradient}
                >
                  <FontAwesome5 name="dog" size={40} color="#fff" />
                </LinearGradient>
              </View>
              <Text style={styles.appName}>
                Cy<Text style={{ color: NEON_CYAN }}>Dog</Text>
              </Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {isSignUp
                    ? "PROTOCOL: REGISTRATION"
                    : "PROTOCOL: AUTHENTICATION"}
                </Text>
              </View>
            </Animated.View>

            {/* GLASS FORM CONTAINER */}
            <Animated.View
              style={[
                styles.formWrapper,
                {
                  opacity: formSlideAnim,
                  transform: [
                    {
                      translateY: formSlideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <BlurView intensity={20} tint="dark" style={styles.glassCard}>
                {/* Email Input */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>OPERATOR IDENTITY</Text>
                  <View
                    style={[
                      styles.inputFieldContainer,
                      focusedInput === "email" && styles.inputFieldActive,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="identifier"
                      size={20}
                      color={NEON_CYAN}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="ACCESSID@CYDOG.NETWORK"
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setFocusedInput("email")}
                      onBlur={() => setFocusedInput(null)}
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>ENCRYPTION KEY</Text>
                  <View
                    style={[
                      styles.inputFieldContainer,
                      focusedInput === "pass" && styles.inputFieldActive,
                    ]}
                  >
                    <Feather
                      name="shield"
                      size={18}
                      color={NEON_PURPLE}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••••••"
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      onFocus={() => setFocusedInput("pass")}
                      onBlur={() => setFocusedInput(null)}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      <Feather
                        name={showPassword ? "eye" : "eye-off"}
                        size={18}
                        color={NEON_CYAN}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={
                    signInMutation.isPending || signUpMutation.isPending
                  }
                  activeOpacity={0.9}
                  style={styles.submitBtnContainer}
                >
                  <LinearGradient
                    colors={[NEON_CYAN, NEON_PURPLE]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.submitBtn}
                  >
                    {signInMutation.isPending || signUpMutation.isPending ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <View style={styles.btnRow}>
                        <Text style={styles.submitBtnText}>
                          {isSignUp
                            ? "INITIALIZE LINK"
                            : "ESTABLISH CONNECTION"}
                        </Text>
                        <MaterialCommunityIcons
                          name="frequently-asked-questions"
                          size={20}
                          color="#FFF"
                        />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </BlurView>

              {/* Toggle Mode Button */}
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  triggerFeedback();
                  setIsSignUp(!isSignUp);
                }}
              >
                <Text style={styles.secondaryButtonText}>
                  {isSignUp
                    ? "ALREADY REGISTERED? DECRYPT"
                    : "NEW OPERATOR? REGISTER"}
                </Text>
                <View style={styles.underline} />
              </TouchableOpacity>
            </Animated.View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: BG_DARK },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  // Background Particles
  particle: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: NEON_CYAN,
  },

  // Header
  headerContainer: { alignItems: "center", marginBottom: 30 },
  logoOuterGlow: {
    padding: 4,
    borderRadius: 50,
    backgroundColor: "rgba(0, 240, 255, 0.1)",
    shadowColor: NEON_CYAN,
    shadowRadius: 20,
    shadowOpacity: 0.5,
  },
  logoGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  appName: {
    fontSize: 48,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -1,
  },
  statusBadge: {
    backgroundColor: "rgba(0, 240, 255, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 240, 255, 0.2)",
  },
  statusText: {
    color: NEON_CYAN,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 2,
  },

  // Glass Form
  formWrapper: { width: "100%" },
  glassCard: {
    padding: 24,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
    backgroundColor: "rgba(10, 13, 20, 0.5)",
  },
  inputWrapper: { marginBottom: 18 },
  label: {
    fontSize: 10,
    fontWeight: "900",
    color: "rgba(255,255,255,0.5)",
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 1.5,
  },
  inputFieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    height: 60,
  },
  inputFieldActive: {
    borderColor: NEON_CYAN,
    shadowColor: NEON_CYAN,
    shadowRadius: 10,
    shadowOpacity: 0.3,
  },
  inputIcon: { paddingLeft: 18, paddingRight: 12 },
  input: {
    flex: 1,
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    letterSpacing: 1,
    textAlign: "left",
    writingDirection: "ltr",
  },
  eyeIcon: { paddingRight: 18 },

  // Button
  submitBtnContainer: { marginTop: 10 },
  submitBtn: {
    height: 65,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  btnRow: { flexDirection: "row", alignItems: "center" },
  submitBtnText: {
    color: "white",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1,
    marginRight: 10,
  },

  // Secondary
  secondaryButton: { alignItems: "center", marginTop: 30 },
  secondaryButtonText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  underline: {
    width: 40,
    height: 2,
    backgroundColor: NEON_PURPLE,
    marginTop: 8,
    borderRadius: 1,
  },
});

export default AuthScreen;
