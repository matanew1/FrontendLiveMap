import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { ModernInput } from "../components/ModernInput";
import { Skeleton } from "../components/Skeleton";
import useAuthStore from "../../store/authStore";
import { useProfile, useUpdateProfile, useSignOut } from "../hooks/auth";
import { COLORS, SPACING, SHADOWS } from "../constants/theme";

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const { data: profile, isLoading, error } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const signOutMutation = useSignOut();

  // Use profile from store if available, otherwise from query
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ padding: 24, alignItems: "center" }}>
          <Skeleton
            width={100}
            height={100}
            style={{ borderRadius: 50, marginBottom: 20 }}
          />
          <Skeleton width="100%" height={50} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={50} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>My Profile</Text>
          <TouchableOpacity onPress={() => signOutMutation.mutate()}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar Section */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {currentProfile?.email?.[0].toUpperCase() || "U"}
            </Text>
          </View>
          <Text style={styles.emailText}>{currentProfile?.email}</Text>
          <Text style={styles.idText}>
            ID: {currentProfile?.id?.slice(0, 8)}...
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Dog Details</Text>

          <ModernInput
            label="Name"
            value={dogName}
            onChangeText={setDogName}
            placeholder="e.g. Rex"
          />
          <ModernInput
            label="Breed"
            value={dogBreed}
            onChangeText={setDogBreed}
            placeholder="e.g. German Shepherd"
          />
          <ModernInput
            label="Age"
            value={dogAge}
            onChangeText={setDogAge}
            placeholder="e.g. 3"
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveBtnText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG_MAIN },
  content: { padding: SPACING.l },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
  },
  signOutText: {
    color: COLORS.DANGER,
    fontWeight: "600",
  },
  profileHeader: { alignItems: "center", marginBottom: SPACING.xl },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.m,
    ...SHADOWS.md,
  },
  avatarText: {
    fontSize: 32,
    color: "#FFF",
    fontWeight: "bold",
  },
  emailText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
  },
  idText: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
  },
  formSection: {
    backgroundColor: COLORS.BG_CARD,
    padding: SPACING.l,
    borderRadius: 16,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: SPACING.l,
    color: COLORS.TEXT_PRIMARY,
  },
  saveBtn: {
    backgroundColor: COLORS.PRIMARY,
    height: 50,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.m,
  },
  saveBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
