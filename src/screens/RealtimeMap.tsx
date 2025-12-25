import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  StatusBar,
  Animated,
  Easing,
  ActivityIndicator,
  Dimensions,
  Platform,
} from "react-native";
import MapView, { Marker, Circle, PROVIDER_DEFAULT } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import {
  Feather,
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { socket, connectSocket } from "../lib/socket";

import useLocationStore from "../../store/locationStore";
import useAuthStore from "../../store/authStore";
import { useSignOut } from "../hooks/auth";
import {
  useNearbyUsers,
  updateNearbyUsers,
  UserLocation,
} from "../hooks/location";
import { useQueryClient } from "@tanstack/react-query";

const { width, height } = Dimensions.get("window");

const THEME = {
  CYAN: "#00F0FF",
  PURPLE: "#BD00FF",
  SUCCESS: "#00FF94",
  DANGER: "#FF2E63",
  BG: "#05070A",
  SURFACE: "rgba(30, 34, 45, 0.8)",
  BORDER: "rgba(0, 240, 255, 0.3)",
  GLOW: "rgba(0, 240, 255, 0.4)",
};

export default function RealtimeMap() {
  const mapRef = useRef<MapView>(null);
  const { user } = useAuthStore();
  const signOutMutation = useSignOut();
  const queryClient = useQueryClient();

  const [isLive, setIsLive] = useState(socket.connected);
  const [isStealth, setIsStealth] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const {
    myLocation,
    searchRadius,
    setSearchRadius,
    startTracking,
    stopTracking,
  } = useLocationStore();

  const { data: nearbyUsers = [] } = useNearbyUsers(user?.id || "");

  // Animations
  const scanAnim = useRef(new Animated.Value(0)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const statusPulse = useRef(new Animated.Value(0.6)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Tactical Scan Effect
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Socket and Reconnection Logic
  useEffect(() => {
    if (!socket.connected) {
      setIsReconnecting(true);
      connectSocket();
    }

    const onConnect = () => {
      setIsLive(true);
      setIsReconnecting(false);
    };
    const onDisconnect = () => setIsLive(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  // Handle location updates
  useEffect(() => {
    const handleLocationUpdate = (data: {
      updated: any;
      nearby: UserLocation[];
    }) => {
      if (user?.id) {
        updateNearbyUsers(queryClient, user.id, data, myLocation, searchRadius);
      }
    };
    socket.on("location_updated", handleLocationUpdate);
    return () => {
      socket.off("location_updated", handleLocationUpdate);
    };
  }, [queryClient, user?.id, myLocation, searchRadius]);

  const initTracking = useCallback(async () => {
    try {
      setIsLoading(true);
      await startTracking();
      setTimeout(() => {
        mapRef.current?.animateCamera(
          {
            center: { latitude: myLocation.lat, longitude: myLocation.lng },
            pitch: 45,
            heading: 0,
            zoom: 18,
          },
          { duration: 1500 }
        );
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setIsLoading(false);
    }
  }, [startTracking, myLocation]);

  useEffect(() => {
    initTracking();
    return () => stopTracking();
  }, []);

  const updateRadius = (radius: number) => {
    const newRadius = Math.max(100, Math.min(5000, radius));
    setSearchRadius(newRadius);
    if (user?.id && socket.connected) {
      socket.emit("update_search_radius", {
        userId: user.id,
        radius: newRadius,
      });
    }
  };

  if (isLoggingOut) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.CYAN} />
        <Text style={styles.loadingText}>TERMINATING SESSION...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* TACTICAL SCANNING OVERLAY */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Animated.View
          style={[
            styles.scanLine,
            {
              transform: [
                {
                  translateY: scanAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, height],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={["transparent", THEME.CYAN, "transparent"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ flex: 1, opacity: 0.2 }}
          />
        </Animated.View>
      </View>

      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        customMapStyle={DARK_MAP_STYLE}
        showsCompass={false}
      >
        {!isStealth && myLocation.lat && (
          <>
            <Circle
              center={{ latitude: myLocation.lat, longitude: myLocation.lng }}
              radius={searchRadius}
              fillColor="rgba(0, 240, 255, 0.05)"
              strokeColor={THEME.CYAN}
              strokeWidth={1.5}
            />
            <Marker
              coordinate={{
                latitude: myLocation.lat,
                longitude: myLocation.lng,
              }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.myLocationContainer}>
                <Animated.View
                  style={[
                    styles.ripple,
                    {
                      transform: [
                        {
                          scale: rippleAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 4],
                          }),
                        },
                      ],
                      opacity: rippleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 0],
                      }),
                    },
                  ]}
                />
                <View style={styles.coreGlow}>
                  <View style={styles.coreSolid} />
                </View>
              </View>
            </Marker>
          </>
        )}

        {nearbyUsers.map((u) => (
          <Marker
            key={u.user_id}
            coordinate={{ latitude: u.lat, longitude: u.lng }}
            anchor={{ x: 0.5, y: 1 }}
          >
            <View style={styles.userPinContainer}>
              <LinearGradient
                colors={[THEME.PURPLE, "#7000FF"]}
                style={styles.pinHead}
              >
                <FontAwesome5 name="dog" size={12} color="#FFF" />
              </LinearGradient>
              <View
                style={[styles.pinStick, { backgroundColor: THEME.PURPLE }]}
              />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* TOP GLASS HUD */}
      <SafeAreaView style={styles.topContainer} pointerEvents="box-none">
        <BlurView intensity={30} tint="dark" style={styles.modernHud}>
          <View style={styles.hudContent}>
            <View style={styles.profileSection}>
              <LinearGradient
                colors={[THEME.CYAN, THEME.PURPLE]}
                style={styles.miniAvatar}
              >
                <Text style={styles.avatarText}>
                  {user?.email[0].toUpperCase()}
                </Text>
              </LinearGradient>
              <View>
                <Text style={styles.hudTitle}>
                  Cy<Text style={{ color: THEME.CYAN }}>Dog</Text>
                </Text>
                <Text style={styles.systemStatus}>
                  {isLive ? "● ENCRYPTED LINK" : "○ OFFLINE"}
                </Text>
              </View>
            </View>
            <View style={styles.hudStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>UNITS</Text>
                <Text style={styles.statValue}>{nearbyUsers.length}</Text>
              </View>
              <TouchableOpacity
                onPress={() => signOutMutation.mutate()}
                style={styles.iconBtn}
              >
                <Feather name="power" size={18} color={THEME.DANGER} />
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </SafeAreaView>

      {/* BOTTOM CONTROL HUB */}
      <View style={styles.bottomContainer} pointerEvents="box-none">
        <View style={styles.controlRow}>
          {/* Quick Actions */}
          <BlurView intensity={40} tint="dark" style={styles.sideTool}>
            <TouchableOpacity
              onPress={() => setIsStealth(!isStealth)}
              style={styles.toolBtn}
            >
              <MaterialCommunityIcons
                name={isStealth ? "eye-off" : "eye"}
                size={22}
                color={isStealth ? THEME.PURPLE : "#FFF"}
              />
            </TouchableOpacity>
          </BlurView>

          {/* Radius Slider Panel */}
          <BlurView intensity={60} tint="dark" style={styles.radiusPanel}>
            <TouchableOpacity onPress={() => updateRadius(searchRadius - 100)}>
              <Feather name="minus-circle" size={24} color={THEME.CYAN} />
            </TouchableOpacity>
            <View style={styles.radiusInfo}>
              <Text style={styles.radiusValue}>{searchRadius}m</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(searchRadius / 2000) * 100}%` },
                  ]}
                />
              </View>
            </View>
            <TouchableOpacity onPress={() => updateRadius(searchRadius + 100)}>
              <Feather name="plus-circle" size={24} color={THEME.CYAN} />
            </TouchableOpacity>
          </BlurView>

          {/* Location Center */}
          <TouchableOpacity
            style={styles.fab}
            onPress={() =>
              mapRef.current?.animateToRegion({
                latitude: myLocation.lat,
                longitude: myLocation.lng,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              })
            }
          >
            <LinearGradient
              colors={[THEME.CYAN, THEME.PURPLE]}
              style={styles.fabInner}
            >
              <Ionicons name="navigate" size={24} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.BG },
  scanLine: { position: "absolute", width: "100%", height: 2, zIndex: 1 },
  loadingContainer: {
    flex: 1,
    backgroundColor: THEME.BG,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: THEME.CYAN,
    marginTop: 20,
    fontWeight: "900",
    letterSpacing: 2,
  },

  // My Location Marker
  myLocationContainer: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  ripple: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: THEME.CYAN,
  },
  coreGlow: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0, 240, 255, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: THEME.CYAN,
    shadowRadius: 12,
    shadowOpacity: 1,
    elevation: 15,
  },
  coreSolid: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFF",
  },

  // User Markers
  userPinContainer: { alignItems: "center" },
  pinHead: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderBottomLeftRadius: 2,
    transform: [{ rotate: "45deg" }],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  pinStick: { width: 3, height: 6, marginTop: -2 },

  // Top HUD
  topContainer: {
    position: "absolute",
    top: 10,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  modernHud: {
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: THEME.BORDER,
  },
  hudContent: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileSection: { flexDirection: "row", alignItems: "center" },
  miniAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { color: "#FFF", fontWeight: "bold" },
  hudTitle: { color: "#FFF", fontSize: 18, fontWeight: "900" },
  systemStatus: {
    color: THEME.SUCCESS,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
  },
  hudStats: { flexDirection: "row", alignItems: "center" },
  statItem: { alignItems: "flex-end", marginRight: 15 },
  statLabel: { color: "rgba(255,255,255,0.5)", fontSize: 7, fontWeight: "900" },
  statValue: { color: THEME.CYAN, fontSize: 16, fontWeight: "900" },
  iconBtn: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
  },

  // Bottom Controls
  bottomContainer: { position: "absolute", bottom: 30, left: 16, right: 16 },
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sideTool: {
    width: 54,
    height: 54,
    borderRadius: 27,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: THEME.BORDER,
  },
  toolBtn: { flex: 1, alignItems: "center", justifyContent: "center" },
  radiusPanel: {
    flex: 1,
    marginHorizontal: 12,
    height: 54,
    borderRadius: 27,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: THEME.BORDER,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  radiusInfo: { flex: 1, alignItems: "center", paddingHorizontal: 10 },
  radiusValue: { color: "#FFF", fontWeight: "900", fontSize: 16 },
  progressBar: {
    height: 3,
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 2,
    marginTop: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: THEME.CYAN,
    borderRadius: 2,
  },
  fab: { width: 54, height: 54, borderRadius: 27, elevation: 5 },
  fabInner: {
    flex: 1,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
});

const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#05070A" }] },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#000000" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1A1E26" }],
  },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
];
