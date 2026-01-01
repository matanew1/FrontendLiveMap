import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  StatusBar,
  Dimensions,
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
import { COLORS, SHADOWS } from "../constants/theme";
import { socket, connectSocket } from "../lib/socket";
import useLocationStore from "../../store/locationStore";
import useAuthStore from "../../store/authStore";
import { useUpdateSearchRadius } from "../hooks/location";
import { useProfile } from "../hooks/auth";

const { width } = Dimensions.get("window");

const MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
  {
    featureType: "landscape.man_made",
    elementType: "geometry.fill",
    stylers: [{ color: "#eceef3" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#eeeeee" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#d2d6e2" }],
  },
];

export default function RealtimeMap() {
  const mapRef = useRef<MapView>(null);
  const markerRefs = useRef<{ [key: string]: any }>({});
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const { data: user } = useProfile();
  const updateSearchRadiusMutation = useUpdateSearchRadius();

  const [isInvisible, setIsInvisible] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

  const {
    myLocation,
    searchRadius,
    setSearchRadius,
    startTracking,
    stopTracking,
    nearbyUsers,
  } = useLocationStore();

  // Pulse Animation for User Location
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.4,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (!socket.connected) connectSocket();
    startTracking();
    return () => stopTracking();
  }, []);

  useEffect(() => {
    if (myLocation.lat && mapRef.current) {
      mapRef.current.animateCamera({
        center: { latitude: myLocation.lat, longitude: myLocation.lng },
        zoom: 15,
        pitch: 0,
      });
    }
  }, [myLocation.lat]);

  const updateRadius = (radius: number) => {
    const newRadius = Math.max(100, Math.min(5000, radius));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSearchRadius(newRadius);
    updateSearchRadiusMutation.mutate({ radius: newRadius });
  };

  const toggleVisibility = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsInvisible(!isInvisible);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        customMapStyle={MAP_STYLE}
        showsUserLocation={false}
        showsCompass={false}
        pitchEnabled={true}
      >
        {myLocation.lat && (
          <Circle
            center={{ latitude: myLocation.lat, longitude: myLocation.lng }}
            radius={!isInvisible ? searchRadius : 0}
            fillColor="rgba(79, 70, 229, 0.05)"
            strokeColor={COLORS.PRIMARY}
            strokeWidth={1}
          />
        )}

        {myLocation.lat && (
          <Marker
            coordinate={{ latitude: myLocation.lat, longitude: myLocation.lng }}
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={10}
          >
            <View style={styles.myMarkerContainer}>
              <Animated.View
                style={[
                  styles.pulseRing,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              />
              <View style={styles.myMarkerDot}>
                {user?.avatarUrl ? (
                  <Image
                    source={{ uri: user.avatarUrl }}
                    style={styles.markerAvatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder} />
                )}
              </View>
            </View>
          </Marker>
        )}

        {nearbyUsers
          .filter((u) => u.id !== user?.id)
          .map((u) => (
            <Marker
              key={`nearby-${u.id}`}
              coordinate={{ latitude: u.lat, longitude: u.lng }}
              tracksViewChanges={false}
              ref={(ref) => {
                markerRefs.current[u.id] = ref;
              }}
              onPress={() => {
                Haptics.selectionAsync();
                if (selectedMarkerId === u.id) {
                  markerRefs.current[u.id]?.hideCallout();
                  setSelectedMarkerId(null);
                } else {
                  if (selectedMarkerId)
                    markerRefs.current[selectedMarkerId]?.hideCallout();
                  markerRefs.current[u.id]?.showCallout();
                  setSelectedMarkerId(u.id);
                }
              }}
            >
              <View style={styles.otherMarker}>
                <View style={styles.otherMarkerInner}>
                  {u.avatarUrl ? (
                    <Image
                      source={{ uri: u.avatarUrl }}
                      style={styles.nearbyAvatar}
                    />
                  ) : (
                    <FontAwesome5 name="dog" size={18} color="#FFF" />
                  )}
                </View>
              </View>
              <Callout tooltip>
                <View style={styles.calloutWrapper}>
                  <View style={styles.calloutContent}>
                    {/* IMPROVED IMAGE LOGIC */}
                    {u.avatarUrl ? (
                      <Image
                        source={{ uri: u.avatarUrl }}
                        style={styles.calloutAvatar}
                      />
                    ) : user?.avatarUrl ? (
                      <Image
                        source={{ uri: user.avatarUrl }}
                        style={styles.calloutAvatar}
                      />
                    ) : (
                      <View
                        style={[
                          styles.calloutAvatar,
                          styles.calloutPlaceholder,
                        ]}
                      >
                        <FontAwesome5 name="dog" size={16} color="#FFF" />
                      </View>
                    )}

                    <View style={styles.calloutTextContainer}>
                      <Text style={styles.calloutName}>
                        {u.dogName || "Pup"}
                      </Text>
                      <Text style={styles.calloutDistance}>
                        {u.distance}m away
                      </Text>
                    </View>
                  </View>
                  <View style={styles.calloutTip} />
                </View>
              </Callout>
            </Marker>
          ))}
      </MapView>

      {/* Floating Status HUD */}
      <SafeAreaView style={styles.topContainer} pointerEvents="none">
        <BlurView intensity={80} tint="light" style={styles.statusCard}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isInvisible ? "#FF4B4B" : COLORS.ACCENT },
            ]}
          />
          <Text style={styles.statusText}>
            {isInvisible
              ? "Ghost Mode Active"
              : `${Math.max(0, nearbyUsers.length - 1)} Pups Nearby`}
          </Text>
        </BlurView>
      </SafeAreaView>

      {/* Integrated Control Panel */}
      <View style={styles.controlOverlay}>
        <BlurView intensity={90} tint="default" style={styles.controlPanel}>
          <View style={styles.pillContainer}>
            <TouchableOpacity
              style={styles.radiusIconButton}
              onPress={() => updateRadius(searchRadius - 200)}
            >
              <Feather name="minus" size={20} color={COLORS.PRIMARY} />
            </TouchableOpacity>

            <View style={styles.radiusInfo}>
              <Text style={styles.radiusValueText}>{searchRadius}m</Text>
              <Text style={styles.radiusLabelText}>SCAN RADIUS</Text>
            </View>

            <TouchableOpacity
              style={styles.radiusIconButton}
              onPress={() => updateRadius(searchRadius + 200)}
            >
              <Feather name="plus" size={20} color={COLORS.PRIMARY} />
            </TouchableOpacity>
          </View>

          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={[styles.glassBtn, isInvisible && styles.glassBtnActive]}
              onPress={toggleVisibility}
            >
              <Feather
                name={isInvisible ? "eye-off" : "eye"}
                size={20}
                color={isInvisible ? "#FFF" : COLORS.TEXT_PRIMARY}
              />
              <Text
                style={[styles.glassBtnText, isInvisible && { color: "#FFF" }]}
              >
                {isInvisible ? "Ghost" : "Visible"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.glassBtn, styles.primaryBtn]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                mapRef.current?.animateToRegion({
                  latitude: myLocation.lat,
                  longitude: myLocation.lng,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                });
              }}
            >
              <Ionicons name="navigate" size={20} color="#FFF" />
              <Text style={[styles.glassBtnText, { color: "#FFF" }]}>
                Recenter
              </Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F2F5" },

  // HUD Elements
  topContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? 40 : 10,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    ...SHADOWS.md,
    overflow: "hidden",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  statusText: {
    color: "#1A1A1A",
    fontWeight: "800",
    fontSize: 13,
    letterSpacing: 0.3,
  },

  // Custom Markers
  myMarkerContainer: { alignItems: "center", justifyContent: "center" },
  pulseRing: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.PRIMARY,
    opacity: 0.2,
  },
  myMarkerDot: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.PRIMARY,
    borderWidth: 3,
    borderColor: "#FFF",
    ...SHADOWS.md,
    overflow: "hidden",
  },
  markerAvatar: { width: "100%", height: "100%" },
  avatarPlaceholder: { flex: 1, backgroundColor: COLORS.PRIMARY },

  otherMarker: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.sm,
  },
  otherMarkerInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.ACCENT,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  nearbyAvatar: { width: "100%", height: "100%" },

  // Control Panel
  controlOverlay: {
    position: "absolute",
    bottom: 110,
    left: 16,
    right: 16,
  },
  controlPanel: {
    padding: 16,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    overflow: "hidden",
    ...SHADOWS.lg,
  },
  pillContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.04)",
    padding: 8,
    borderRadius: 24,
    marginBottom: 16,
  },
  radiusIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.sm,
  },
  radiusInfo: { alignItems: "center" },
  radiusValueText: { fontSize: 20, fontWeight: "900", color: "#1A1A1A" },
  radiusLabelText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#666",
    letterSpacing: 1,
  },

  actionGrid: { flexDirection: "row", gap: 12 },
  glassBtn: {
    flex: 1,
    height: 56,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.8)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  glassBtnActive: { backgroundColor: "#1A1A1A" },
  primaryBtn: { backgroundColor: COLORS.PRIMARY, flex: 1.4 },
  glassBtnText: { fontSize: 15, fontWeight: "700", color: "#1A1A1A" },

  // Improved Callout
  calloutWrapper: { alignItems: "center", width: 160 },
  calloutContent: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    ...SHADOWS.md,
  },
  calloutAvatar: { width: 40, height: 40, borderRadius: 10, marginRight: 10 },
  calloutTextContainer: { flex: 1 },
  calloutName: { fontSize: 14, fontWeight: "800", color: "#1A1A1A" },
  calloutDistance: { fontSize: 11, color: COLORS.ACCENT, fontWeight: "600" },
  calloutTip: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#FFF",
  },
  calloutPlaceholder: {
    backgroundColor: COLORS.ACCENT,
    alignItems: "center",
    justifyContent: "center",
  },
});
