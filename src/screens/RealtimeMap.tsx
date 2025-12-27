import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image,
  Animated,
  LayoutAnimation,
} from "react-native";
import MapView, {
  Marker,
  Circle,
  PROVIDER_DEFAULT,
  Callout,
} from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { COLORS, SHADOWS, SPACING } from "../constants/theme";
import { socket, connectSocket } from "../lib/socket";
import useLocationStore from "../../store/locationStore";
import { useUpdateSearchRadius } from "../hooks/location";
import { useProfile } from "../hooks/auth";

const MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#f8f9fa" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#e3e7f0" }],
  },
];

export default function RealtimeMap() {
  const mapRef = useRef<MapView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const { data: user } = useProfile();
  const updateSearchRadiusMutation = useUpdateSearchRadius();

  const [isInvisible, setIsInvisible] = useState(false);
  const {
    myLocation,
    searchRadius,
    setSearchRadius,
    startTracking,
    stopTracking,
    nearbyUsers,
  } = useLocationStore();

  // Next-Level Pulse Animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
    if (!socket.connected) connectSocket();
    startTracking();
    return () => stopTracking();
  }, []);

  const handleUpdateRadius = (val: number) => {
    const next = Math.max(100, Math.min(5000, searchRadius + val));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSearchRadius(next);
    updateSearchRadiusMutation.mutate({ radius: next });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        customMapStyle={MAP_STYLE}
        pitchEnabled
      >
        {myLocation.lat && (
          <>
            <Circle
              center={{ latitude: myLocation.lat, longitude: myLocation.lng }}
              radius={!isInvisible ? searchRadius : 0}
              fillColor="rgba(79, 70, 229, 0.04)"
              strokeColor={COLORS.PRIMARY}
              strokeWidth={1}
            />
            <Marker
              coordinate={{
                latitude: myLocation.lat,
                longitude: myLocation.lng,
              }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.markerContainer}>
                <Animated.View
                  style={[
                    styles.pulseRing,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                />
                <View style={styles.userDot}>
                  {user?.avatarUrl && (
                    <Image
                      source={{ uri: user.avatarUrl }}
                      style={styles.fullImage}
                    />
                  )}
                </View>
              </View>
            </Marker>
          </>
        )}
      </MapView>

      <SafeAreaView style={styles.topHud} pointerEvents="none">
        <BlurView intensity={80} tint="light" style={styles.glassBadge}>
          <View
            style={[
              styles.dot,
              { backgroundColor: isInvisible ? COLORS.DANGER : COLORS.ACCENT },
            ]}
          />
          <Text style={styles.badgeText}>
            {nearbyUsers.length - 1} Pups Nearby
          </Text>
        </BlurView>
      </SafeAreaView>

      <View style={styles.bottomInterface}>
        <BlurView intensity={95} tint="default" style={styles.glassPanel}>
          <View style={styles.pillSelector}>
            <TouchableOpacity
              onPress={() => handleUpdateRadius(-200)}
              style={styles.iconCircle}
            >
              <Feather name="minus" size={20} color={COLORS.PRIMARY} />
            </TouchableOpacity>
            <View style={{ alignItems: "center" }}>
              <Text style={styles.radiusVal}>{searchRadius}m</Text>
              <Text style={styles.radiusLabel}>SCAN RANGE</Text>
            </View>
            <TouchableOpacity
              onPress={() => handleUpdateRadius(200)}
              style={styles.iconCircle}
            >
              <Feather name="plus" size={20} color={COLORS.PRIMARY} />
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.btn, isInvisible && styles.btnActive]}
              onPress={() => {
                setIsInvisible(!isInvisible);
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Warning
                );
              }}
            >
              <Feather
                name={isInvisible ? "eye-off" : "eye"}
                size={20}
                color={isInvisible ? "#FFF" : COLORS.TEXT_PRIMARY}
              />
              <Text style={[styles.btnText, isInvisible && { color: "#FFF" }]}>
                Ghost
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.primaryBtn]}
              onPress={() =>
                mapRef.current?.animateCamera({
                  center: {
                    latitude: myLocation.lat,
                    longitude: myLocation.lng,
                  },
                  zoom: 15,
                })
              }
            >
              <Ionicons name="navigate" size={20} color="#FFF" />
              <Text style={[styles.btnText, { color: "#FFF" }]}>Recenter</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG_MAIN,
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.PRIMARY,
    opacity: 0.3,
  },
  userDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.PRIMARY,
    borderWidth: 3,
    borderColor: "#FFF",
    ...SHADOWS.md,
  },
  fullImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  topHud: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? 40 : 10,
  },
  glassBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    ...SHADOWS.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.ACCENT,
    marginRight: 8,
  },
  badgeText: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: "700",
    fontSize: 13,
  },
  bottomInterface: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.l,
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
  },
  glassPanel: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    padding: SPACING.l,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    ...SHADOWS.lg,
  },
  pillSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.l,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.BG_INPUT,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  radiusVal: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  radiusLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.TEXT_TERTIARY,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    gap: SPACING.m,
  },
  btn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: COLORS.BG_INPUT,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    gap: 8,
  },
  btnActive: {
    backgroundColor: COLORS.TEXT_PRIMARY,
  },
  btnText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
  },
  primaryBtn: {
    backgroundColor: COLORS.PRIMARY,
  },
});
