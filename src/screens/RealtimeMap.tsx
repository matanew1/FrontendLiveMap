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
} from "react-native";
import MapView, {
  Marker,
  Circle,
  PROVIDER_DEFAULT,
  Callout,
} from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { COLORS, SHADOWS, SPACING } from "../constants/theme";
import { socket, connectSocket } from "../lib/socket";
import useLocationStore from "../../store/locationStore";
import useAuthStore from "../../store/authStore";
import { useUpdateSearchRadius } from "../hooks/location";
import { useProfile } from "../hooks/auth";

const { width, height } = Dimensions.get("window");

// Premium Map Style (Silver/Light Retro)
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
    stylers: [{ color: "#c9c9c9" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
];

export default function RealtimeMap() {
  const mapRef = useRef<MapView>(null);
  const markerRefs = useRef<{ [key: string]: any }>({});
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
        pitch: 45, // Tilted view for more modern feel
      });
    }
  }, [myLocation.lat]);

  const updateRadius = (radius: number) => {
    const newRadius = Math.max(100, Math.min(5000, radius));
    setSearchRadius(newRadius);
    updateSearchRadiusMutation.mutate({ radius: newRadius });
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        transparent
        backgroundColor="transparent"
      />

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
            fillColor="rgba(79, 70, 229, 0.08)"
            strokeColor={COLORS.PRIMARY}
            strokeWidth={1.5}
          />
        )}

        {/* User Marker with "Pulse" Ring */}
        {myLocation.lat && (
          <Marker
            coordinate={{ latitude: myLocation.lat, longitude: myLocation.lng }}
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={10}
          >
            <View style={styles.myMarkerContainer}>
              <View style={styles.pulseRing} />
              <View style={styles.myMarkerDot}>
                {user?.avatarUrl ? (
                  <Image
                    source={{ uri: user.avatarUrl }}
                    style={styles.markerAvatar}
                  />
                ) : null}
              </View>
            </View>
          </Marker>
        )}

        {/* Nearby Users Markers */}
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
                    <FontAwesome5 name="dog" size={10} color="#FFF" />
                  )}
                </View>
              </View>
              <Callout onPress={() => {}}>
                <TouchableOpacity
                  style={styles.calloutContent}
                  activeOpacity={1}
                >
                  {u.avatarUrl ? (
                    <Image
                      source={{ uri: u.avatarUrl }}
                      style={styles.calloutAvatar}
                    />
                  ) : (
                    <View style={styles.calloutAvatarPlaceholder}>
                      <FontAwesome5 name="dog" size={30} color="#FFF" />
                    </View>
                  )}
                  <View style={styles.calloutText}>
                    <Text style={styles.calloutName}>
                      {u.dogName || "Anonymous Pup"}
                    </Text>
                    {u.dogBreed && (
                      <Text style={styles.calloutBreed}>{u.dogBreed}</Text>
                    )}
                    <Text style={styles.calloutDistance}>
                      {u.distance}m away
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.calloutCloseBtn}
                    onPress={() => {
                      markerRefs.current[u.id]?.hideCallout();
                      setSelectedMarkerId(null);
                    }}
                  >
                    <Ionicons
                      name="close"
                      size={16}
                      color={COLORS.TEXT_SECONDARY}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              </Callout>
            </Marker>
          ))}
      </MapView>

      {/* Top Glassmorphism Status Bar */}
      <SafeAreaView style={styles.topContainer} pointerEvents="none">
        <View style={styles.statusCard}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>
            {nearbyUsers.length - 1 > 0
              ? `${nearbyUsers.length - 1} friends nearby`
              : "Scanning for local pups..."}
          </Text>
        </View>
      </SafeAreaView>

      {/* Integrated Control Panel */}
      <View style={styles.controlOverlay}>
        <View style={styles.controlPanel}>
          {/* Radius Scrubber */}
          <View style={styles.radiusControl}>
            <TouchableOpacity
              style={styles.radiusBtn}
              onPress={() => updateRadius(searchRadius - 200)}
            >
              <Feather name="minus" size={20} color={COLORS.TEXT_PRIMARY} />
            </TouchableOpacity>

            <View style={styles.radiusLabelContainer}>
              <Text style={styles.radiusValue}>{searchRadius}m</Text>
              <Text style={styles.radiusLabel}>Search Radius</Text>
            </View>

            <TouchableOpacity
              style={styles.radiusBtn}
              onPress={() => updateRadius(searchRadius + 200)}
            >
              <Feather name="plus" size={20} color={COLORS.TEXT_PRIMARY} />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Action Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, isInvisible && styles.actionBtnActive]}
              onPress={() => setIsInvisible(!isInvisible)}
            >
              <Feather
                name={isInvisible ? "eye-off" : "eye"}
                size={22}
                color={isInvisible ? "#FFF" : COLORS.TEXT_PRIMARY}
              />
              <Text
                style={[styles.actionBtnText, isInvisible && { color: "#FFF" }]}
              >
                {isInvisible ? "Hidden" : "Visible"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.primaryActionBtn]}
              onPress={() => {
                if (myLocation.lat) {
                  mapRef.current?.animateToRegion({
                    latitude: myLocation.lat,
                    longitude: myLocation.lng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  });
                }
              }}
            >
              <Ionicons name="navigate" size={22} color="#FFF" />
              <Text style={[styles.actionBtnText, { color: "#FFF" }]}>
                Recenter
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG_MAIN },

  // Top HUD
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
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    ...SHADOWS.md,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.ACCENT,
    marginRight: 10,
  },
  statusText: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: "700",
    fontSize: 13,
  },

  // Custom Markers
  myMarkerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.PRIMARY,
    opacity: 0.2,
  },
  myMarkerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.PRIMARY,
    borderWidth: 3,
    borderColor: "#FFF",
    ...SHADOWS.md,
  },
  markerAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  otherMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.sm,
  },
  otherMarkerInner: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.ACCENT,
    alignItems: "center",
    justifyContent: "center",
  },
  nearbyAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },

  // Bottom Control Overlay
  controlOverlay: {
    position: "absolute",
    // 85 (tab height) + 20 (tab margin) + 15 (gap) = 120
    bottom: 120,
    left: 16,
    right: 16,
    zIndex: 10, // Ensure it sits above the map
  },
  controlPanel: {
    backgroundColor: "#FFF",
    borderRadius: 28,
    padding: 16,
    ...SHADOWS.lg,
  },
  radiusControl: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 16,
  },
  radiusBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.BG_INPUT,
    alignItems: "center",
    justifyContent: "center",
  },
  radiusLabelContainer: {
    alignItems: "center",
  },
  radiusValue: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.TEXT_PRIMARY,
  },
  radiusLabel: {
    fontSize: 11,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.BG_INPUT,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    backgroundColor: COLORS.BG_INPUT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionBtnActive: {
    backgroundColor: COLORS.TEXT_PRIMARY,
  },
  primaryActionBtn: {
    backgroundColor: COLORS.PRIMARY,
    flex: 1.2,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
  },

  // Callout Styles
  calloutContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#FFF",
    borderRadius: 12,
    minWidth: 240,
    ...SHADOWS.md,
  },
  calloutAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  calloutAvatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.ACCENT,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  calloutText: {
    flex: 1,
  },
  calloutName: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  calloutBreed: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 4,
  },
  calloutDistance: {
    fontSize: 12,
    color: COLORS.ACCENT,
    fontWeight: "600",
  },
  calloutCloseBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.BG_INPUT,
    alignItems: "center",
    justifyContent: "center",
  },
});
