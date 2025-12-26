import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { ModernInput } from "../components/ModernInput";
import { Skeleton } from "../components/Skeleton";
import useAuthStore from "../../store/authStore";
import { useProfile, useUpdateProfile, useSignOut } from "../hooks/auth";
import { COLORS, SPACING, SHADOWS } from "../constants/theme";

const { width: screenWidth } = Dimensions.get("window");
const isSmallScreen = screenWidth < 375;

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const { data: profile, isLoading } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const signOutMutation = useSignOut();

  const currentProfile = user || profile;

  const [dogName, setDogName] = useState("");
  const [dogBreed, setDogBreed] = useState("");
  const [dogAge, setDogAge] = useState("");

  useEffect(() => {
    if (currentProfile) {
      setDogName(currentProfile.dogName || "");
      setDogBreed(currentProfile.dogBreed || "");
      setDogAge(currentProfile.dogAge?.toString() || "");
    }
  }, [currentProfile]);

  const handleSave = async () => {
    const updates: any = {};
    if (dogName !== currentProfile?.dogName) updates.dogName = dogName;
    if (dogBreed !== currentProfile?.dogBreed) updates.dogBreed = dogBreed;
    const ageNum = parseInt(dogAge);
    if (!isNaN(ageNum) && ageNum !== currentProfile?.dogAge)
      updates.dogAge = ageNum;

    if (Object.keys(updates).length === 0) return;

    try {
      await updateProfileMutation.mutateAsync(updates);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const getProfileCompletion = () => {
    let completed = 0;
    const total = 3;
    if (currentProfile?.dogName) completed++;
    if (currentProfile?.dogBreed) completed++;
    if (currentProfile?.dogAge) completed++;
    return Math.round((completed / total) * 100);
  };

  const profileCompletion = getProfileCompletion();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ padding: 24, alignItems: "center" }}>
          <Skeleton
            width={120}
            height={120}
            style={{ borderRadius: 60, marginBottom: 20 }}
          />
          <Skeleton width="60%" height={24} style={{ marginBottom: 8 }} />
          <Skeleton width="40%" height={16} style={{ marginBottom: 20 }} />
          <Skeleton
            width="100%"
            height={180}
            style={{ borderRadius: 24, marginBottom: 16 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Action Row */}
          <View style={styles.headerActions}>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity
              style={styles.signOutIconButton}
              onPress={() => signOutMutation.mutate()}
            >
              <Feather name="log-out" size={20} color={COLORS.DANGER} />
            </TouchableOpacity>
          </View>

          {/* Enhanced Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarGlow}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {currentProfile?.dogName?.[0]?.toUpperCase() || "🐕"}
                </Text>
              </View>
            </View>
            <View style={styles.nameSection}>
              <Text style={styles.dogNameText}>
                {currentProfile?.dogName || "Your Dog"}
              </Text>
              <Text style={styles.userEmailText}>{currentProfile?.email}</Text>

              <View
                style={[
                  styles.completionBadge,
                  profileCompletion === 100 && styles.completionBadgeComplete,
                ]}
              >
                <MaterialCommunityIcons
                  name={
                    profileCompletion === 100 ? "seal-variant" : "timer-sand"
                  }
                  size={14}
                  color={profileCompletion === 100 ? "#FFF" : COLORS.PRIMARY}
                />
                <Text
                  style={[
                    styles.completionText,
                    profileCompletion === 100 && styles.completionTextComplete,
                  ]}
                >
                  {profileCompletion}% Profile Score
                </Text>
              </View>
            </View>
          </View>

          {/* Profile Completion Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${profileCompletion}%` },
                ]}
              />
            </View>
          </View>

          {/* Dog Details Form Card */}
          <View style={styles.formCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconBox}>
                <MaterialCommunityIcons
                  name="dog"
                  size={20}
                  color={COLORS.PRIMARY}
                />
              </View>
              <Text style={styles.cardTitle}>Dog Identity</Text>
            </View>

            <ModernInput
              label="Dog's Name"
              value={dogName}
              onChangeText={setDogName}
              placeholder="What's your buddy's name?"
            />
            <ModernInput
              label="Breed"
              value={dogBreed}
              onChangeText={setDogBreed}
              placeholder="e.g. Golden Retriever"
            />
            <ModernInput
              label="Age"
              value={dogAge}
              onChangeText={setDogAge}
              placeholder="Age in years"
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={[
                styles.saveBtn,
                updateProfileMutation.isPending && styles.saveBtnDisabled,
              ]}
              onPress={handleSave}
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Feather name="check-circle" size={18} color="#FFF" />
                  <Text style={styles.saveBtnText}>Update Profile</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Account Settings List */}
          <View style={styles.formCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconBox}>
                <Ionicons
                  name="settings-outline"
                  size={20}
                  color={COLORS.PRIMARY}
                />
              </View>
              <Text style={styles.cardTitle}>Preferences</Text>
            </View>

            <View style={styles.settingsList}>
              <SettingItem icon="bell" label="Notifications" />
              <SettingItem icon="shield" label="Privacy & Visibility" />
              <SettingItem
                icon="help-circle"
                label="Support Center"
                border={false}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// Helper Component for Settings Rows
const SettingItem = ({
  icon,
  label,
  border = true,
}: {
  icon: any;
  label: string;
  border?: boolean;
}) => (
  <TouchableOpacity
    style={[styles.settingItem, !border && { borderBottomWidth: 0 }]}
  >
    <View style={styles.settingLeft}>
      <Feather name={icon} size={18} color={COLORS.TEXT_SECONDARY} />
      <Text style={styles.settingText}>{label}</Text>
    </View>
    <Feather name="chevron-right" size={18} color={COLORS.TEXT_TERTIARY} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG_MAIN },
  content: { paddingBottom: SPACING.xxl },

  // Header Actions
  headerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: -0.5,
  },
  signOutIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(244, 63, 94, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Avatar Section
  avatarSection: {
    alignItems: "center",
    marginTop: SPACING.m,
    marginBottom: SPACING.l,
  },
  avatarGlow: {
    padding: 6,
    borderRadius: 70,
    backgroundColor: "#EEF2FF",
    ...SHADOWS.md,
  },
  avatarContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#FFF",
  },
  avatarText: {
    fontSize: 44,
    color: "#FFF",
    fontWeight: "800",
  },
  nameSection: {
    alignItems: "center",
    marginTop: SPACING.m,
  },
  dogNameText: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: -0.5,
  },
  userEmailText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
    marginBottom: SPACING.m,
  },
  completionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY_LIGHT,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  completionBadgeComplete: {
    backgroundColor: COLORS.ACCENT,
  },
  completionText: {
    fontSize: 12,
    color: COLORS.PRIMARY,
    fontWeight: "700",
    marginLeft: 6,
  },
  completionTextComplete: {
    color: "#FFF",
  },

  // Progress Bar
  progressContainer: {
    paddingHorizontal: SPACING.l * 2,
    marginBottom: SPACING.xl,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: COLORS.BG_INPUT,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 3,
  },

  // Form Cards
  formCard: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: 24,
    padding: SPACING.l,
    marginHorizontal: SPACING.l,
    marginBottom: SPACING.l,
    ...SHADOWS.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.l,
  },
  cardIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
  },

  // Settings List
  settingsList: {
    marginTop: -SPACING.s,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BG_INPUT,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: SPACING.m,
    fontWeight: "500",
  },

  // Buttons
  saveBtn: {
    backgroundColor: COLORS.PRIMARY,
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.m,
    flexDirection: "row",
    ...SHADOWS.md,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: SPACING.s,
  },
});
