import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import useAuthStore from "../../store/authStore";
import { useProfile, useUpdateProfile, useSignOut } from "../hooks/auth";
import { useQueryClient } from "@tanstack/react-query";
import { COLORS, SPACING, SHADOWS } from "../constants/theme";

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const { data: profile, isLoading, error, refetch } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const signOutMutation = useSignOut();
  const queryClient = useQueryClient();

  const [dogName, setDogName] = useState("");
  const [dogBreed, setDogBreed] = useState("");
  const [dogAge, setDogAge] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  useEffect(() => {
    if (profile) {
      console.log("Profile data loaded:", profile);
      setDogName(profile.dogName || "");
      setDogBreed(profile.dogBreed || "");
      setDogAge(profile.dogAge?.toString() || "");
    }
  }, [profile]);

  useEffect(() => {
    console.log("User data from store:", user);
  }, [user]);

  const handleSave = async () => {
    const updates: any = {};
    if (dogName !== (profile?.dogName || "")) updates.dogName = dogName;
    if (dogBreed !== (profile?.dogBreed || "")) updates.dogBreed = dogBreed;
    const ageNum = parseInt(dogAge);
    if (!isNaN(ageNum) && ageNum !== profile?.dogAge) updates.dogAge = ageNum;

    if (Object.keys(updates).length === 0) return;

    try {
      await updateProfileMutation.mutateAsync(updates);
      Alert.alert("SYSTEM UPDATE", "Identity parameters updated successfully.");
    } catch (error: any) {
      Alert.alert("ERROR", error.message);
    }
  };

  const renderInput = (
    label: string,
    value: string,
    setValue: (t: string) => void,
    icon: any,
    placeholder: string
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <BlurView intensity={10} style={styles.inputWrapper}>
        <View style={styles.inputIcon}>
          <Feather name={icon} size={18} color={COLORS.CYAN} />
        </View>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.3)"
        />
        <View style={styles.cornerTL} />
        <View style={styles.cornerBR} />
      </BlurView>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.CYAN} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Failed to load profile</Text>
        <TouchableOpacity onPress={() => signOutMutation.mutate()}>
          <Text
            style={[styles.loadingText, { color: COLORS.CYAN, marginTop: 10 }]}
          >
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.BG_DEEP, "#120520"]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing || isLoading}
                onRefresh={onRefresh}
                tintColor={COLORS.CYAN}
                colors={[COLORS.CYAN]}
              />
            }
          >
            {/* Header / Logout */}
            <View style={styles.header}>
              <Text style={styles.screenTitle}>OPERATOR PROFILE</Text>
              <TouchableOpacity
                onPress={() => signOutMutation.mutate()}
                style={styles.logoutBtn}
              >
                <Feather name="power" size={20} color={COLORS.DANGER} />
              </TouchableOpacity>
            </View>

            {/* Holographic Avatar */}
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={[COLORS.CYAN, COLORS.PURPLE]}
                  style={styles.avatarRing}
                >
                  <View style={styles.avatarBg}>
                    <MaterialCommunityIcons name="dog" size={50} color="#FFF" />
                  </View>
                </LinearGradient>
                <View style={styles.onlineBadge} />
              </View>
              <Text style={styles.userName}>
                {profile?.email || user?.email || "UNKNOWN OPERATOR"}
              </Text>
              <Text style={styles.userRole}>
                CLASS: {profile?.role || user?.role || "CITIZEN"}
              </Text>
              <Text style={styles.userId}>
                ID: {profile?.id || user?.id || "UNASSIGNED"}
              </Text>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.decoLine} />
                <Text style={styles.sectionTitle}>UNIT CONFIGURATION</Text>
                <View style={styles.decoLine} />
              </View>

              {renderInput(
                "UNIT DESIGNATION",
                dogName,
                setDogName,
                "tag",
                "Enter Name"
              )}
              {renderInput(
                "GENETIC MAKEUP",
                dogBreed,
                setDogBreed,
                "git-branch",
                "Enter Breed"
              )}
              {renderInput(
                "OPERATIONAL CYCLES",
                dogAge,
                setDogAge,
                "clock",
                "Enter Age"
              )}

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
                disabled={updateProfileMutation.isPending}
              >
                <LinearGradient
                  colors={[COLORS.CYAN, COLORS.PURPLE]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveBtnGradient}
                >
                  {updateProfileMutation.isPending ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.saveBtnText}>INITIATE UPDATE</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG_DARK },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.BG_DARK,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 16,
    textAlign: "center",
    marginHorizontal: SPACING.xl,
  },
  scrollContent: { padding: SPACING.l, paddingBottom: 100 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  screenTitle: {
    color: COLORS.CYAN,
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: "900",
  },
  logoutBtn: {
    padding: 8,
    backgroundColor: "rgba(255, 46, 99, 0.1)",
    borderRadius: 8,
  },

  profileHeader: { alignItems: "center", marginBottom: SPACING.xl },
  avatarContainer: { marginBottom: SPACING.m },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    padding: 3,
    ...SHADOWS.neon,
  },
  avatarBg: {
    flex: 1,
    backgroundColor: COLORS.BG_DARK,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.SUCCESS,
    borderWidth: 3,
    borderColor: COLORS.BG_DARK,
  },
  userName: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  userRole: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 4,
  },
  userId: {
    color: COLORS.CYAN,
    fontSize: 8,
    letterSpacing: 1,
    marginTop: 2,
    fontFamily: "monospace",
  },

  formSection: { marginTop: SPACING.m },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.l,
  },
  decoLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.1)" },
  sectionTitle: {
    color: "rgba(255,255,255,0.5)",
    marginHorizontal: 10,
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: "bold",
  },

  inputContainer: { marginBottom: SPACING.l },
  inputLabel: {
    color: COLORS.CYAN,
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.GLASS_BORDER,
  },
  inputIcon: { width: 50, alignItems: "center", justifyContent: "center" },
  input: { flex: 1, color: "#FFF", fontSize: 16, fontWeight: "600" },

  // Tactical Corners for Inputs
  cornerTL: {
    position: "absolute",
    top: -1,
    left: -1,
    width: 6,
    height: 6,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: COLORS.CYAN,
  },
  cornerBR: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 6,
    height: 6,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: COLORS.CYAN,
  },

  saveBtn: { marginTop: SPACING.m, ...SHADOWS.neon },
  saveBtnGradient: {
    height: 56,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  saveBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 2,
  },
});
