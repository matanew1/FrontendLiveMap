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
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";

import { ModernInput } from "../components/ModernInput";
import { Skeleton } from "../components/Skeleton";
import useAuthStore from "../../store/authStore";
import {
  useProfile,
  useUpdateProfile,
  useSignOut,
  useUploadAvatar,
} from "../hooks/auth";
import { COLORS, SPACING, SHADOWS, GRADIENTS } from "../constants/theme";

const { width: screenWidth } = Dimensions.get("window");
const isSmallScreen = screenWidth < 375;

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const { data: profile, isLoading, error, refetch } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const signOutMutation = useSignOut();
  const uploadAvatarMutation = useUploadAvatar();

  const currentProfile = profile;

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

  const handleAvatarPress = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Please allow access to your photo library."
      );
      return;
    }

    let result;
    try {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to open image picker: " + (error as any).message
      );
      return;
    }

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const fileName = uri.split("/").pop() || "avatar.jpg";
      const fileType = fileName.split(".").pop() || "jpg";
      const file = {
        uri,
        name: `avatar.${fileType}`,
        type: `image/${fileType}`,
      } as any;

      try {
        // Determine if this is an update or first upload based on existing avatar
        const isUpdate = !!currentProfile?.avatarUrl;
        await uploadAvatarMutation.mutateAsync({ file, isUpdate });
        Alert.alert(
          "Success",
          isUpdate
            ? "Avatar updated successfully!"
            : "Avatar uploaded successfully!"
        );
      } catch (error: any) {
        Alert.alert("Error", error.message);
      }
    }
  };

  if (isLoading) {
    return (
      <LinearGradient
        colors={GRADIENTS.glass}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
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
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient
        colors={GRADIENTS.glass}
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <View style={styles.errorCard}>
            <Feather name="alert-triangle" size={48} color={COLORS.DANGER} />
            <Text style={styles.errorText}>Unable to load profile</Text>
            <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
              <LinearGradient
                colors={GRADIENTS.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.retryGradient}
              >
                <Text style={styles.retryBtnText}>Retry</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={[COLORS.BG_MAIN, "#E0E7FF"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Profile</Text>
            <Text style={styles.headerSubtitle}>
              Manage your dog's identity
            </Text>
          </View>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={() => signOutMutation.mutate()}
          >
            <Feather name="log-out" size={20} color={COLORS.DANGER} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={GRADIENTS.primary}
                style={styles.avatarBorder}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <TouchableOpacity
                  style={styles.avatarInner}
                  onPress={handleAvatarPress}
                  disabled={uploadAvatarMutation.isPending}
                >
                  {currentProfile?.avatarUrl ? (
                    <Image
                      source={{ uri: currentProfile.avatarUrl }}
                      style={styles.avatarImage}
                      key={currentProfile.avatarUrl}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Feather name="camera" size={32} color={COLORS.PRIMARY} />
                    </View>
                  )}

                  <View style={styles.editBadge}>
                    <Feather name="edit-2" size={12} color="#FFF" />
                  </View>

                  {uploadAvatarMutation.isPending && (
                    <View style={styles.uploadingOverlay}>
                      <ActivityIndicator color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              </LinearGradient>
            </View>

            <Text style={styles.dogNameText}>
              {currentProfile?.dogName || "Your Dog"}
            </Text>
            <Text style={styles.userEmailText}>{currentProfile?.email}</Text>

            {/* Profile Score */}
            <View style={styles.scoreContainer}>
              <LinearGradient
                colors={
                  profileCompletion === 100
                    ? GRADIENTS.accent
                    : [COLORS.TEXT_TERTIARY, COLORS.TEXT_TERTIARY]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.scoreBadge}
              >
                <MaterialCommunityIcons
                  name={
                    profileCompletion === 100
                      ? "check-decagram"
                      : "progress-clock"
                  }
                  size={14}
                  color={profileCompletion === 100 ? "#FFF" : "#FFF"}
                />
                <Text style={[styles.scoreText, { color: "#FFF" }]}>
                  {profileCompletion}% Complete
                </Text>
              </LinearGradient>
            </View>
          </View>

          {/* Form Section */}
          <View style={styles.formCard}>
            <View style={styles.cardHeader}>
              <LinearGradient
                colors={GRADIENTS.primary}
                style={styles.iconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialCommunityIcons name="dog" size={20} color="#FFF" />
              </LinearGradient>
              <Text style={styles.cardTitle}>Details</Text>
            </View>

            <View style={styles.inputsContainer}>
              <ModernInput
                label="Dog's Name"
                value={dogName}
                onChangeText={setDogName}
                placeholder="e.g. Rex"
                icon="type"
              />
              <ModernInput
                label="Breed"
                value={dogBreed}
                onChangeText={setDogBreed}
                placeholder="e.g. German Shepherd"
                icon="gitlab"
              />
              <ModernInput
                label="Age (Years)"
                value={dogAge}
                onChangeText={setDogAge}
                placeholder="e.g. 3"
                keyboardType="numeric"
                icon="calendar"
              />
            </View>

            <TouchableOpacity
              onPress={handleSave}
              disabled={updateProfileMutation.isPending}
              style={styles.saveButtonContainer}
            >
              <LinearGradient
                colors={GRADIENTS.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButton}
              >
                {updateProfileMutation.isPending ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                    <Feather name="check" size={20} color="#FFF" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  signOutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.BG_SURFACE,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.sm,
  },
  content: {
    padding: SPACING.l,
    paddingBottom: 100,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  avatarContainer: {
    marginBottom: SPACING.m,
    ...SHADOWS.md,
  },
  avatarBorder: {
    width: 128,
    height: 128,
    borderRadius: 64,
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInner: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
    backgroundColor: COLORS.BG_MAIN,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 4,
    borderColor: COLORS.BG_MAIN,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.BG_INPUT,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.PRIMARY,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.BG_MAIN,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dogNameText: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  userEmailText: {
    fontSize: 14,
    color: COLORS.TEXT_TERTIARY,
    marginBottom: SPACING.m,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.TEXT_SECONDARY,
  },
  formCard: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 24,
    padding: SPACING.l,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    ...SHADOWS.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.l,
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
  },
  inputsContainer: {
    gap: SPACING.m,
    marginBottom: SPACING.xl,
  },
  saveButtonContainer: {
    ...SHADOWS.md,
  },
  saveButton: {
    flexDirection: "row",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
  },
  errorCard: {
    backgroundColor: "#FFF",
    padding: SPACING.xl,
    borderRadius: 24,
    alignItems: "center",
    width: "80%",
    ...SHADOWS.md,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.m,
    marginBottom: SPACING.l,
    textAlign: "center",
  },
  retryBtn: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
  },
  retryGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  retryBtnText: {
    color: "#FFF",
    fontWeight: "600",
  },
});
