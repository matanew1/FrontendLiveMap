import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, Circle, PROVIDER_DEFAULT } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { COLORS, SHADOWS, SPACING } from "../constants/theme";
import { socket, connectSocket } from "../lib/socket";
import useLocationStore from "../../store/locationStore";
import useAuthStore from "../../store/authStore";
import { useUpdateSearchRadius } from "../hooks/location";

const { width } = Dimensions.get("window");

export default function RealtimeMap() {
  const mapRef = useRef<MapView>(null);
  const { user } = useAuthStore();
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

  useEffect(() => {
    if (!socket.connected) connectSocket();
    startTracking();
    return () => stopTracking();
  }, []);

  // Update initial camera
  useEffect(() => {
    if (myLocation.lat && mapRef.current) {
      mapRef.current.animateCamera({
        center: { latitude: myLocation.lat, longitude: myLocation.lng },
        zoom: 15,
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
      <StatusBar barStyle="dark-content" />

      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        showsUserLocation={false} // We render custom markers
        showsCompass={false}
      >
        {myLocation.lat && (
          <Circle
            center={{ latitude: myLocation.lat, longitude: myLocation.lng }}
            radius={!isInvisible ? searchRadius : 0}
            fillColor="rgba(79, 70, 229, 0.1)"
            strokeColor={COLORS.PRIMARY}
            strokeWidth={1}
          />
        )}

        {/* My Marker */}
        {myLocation.lat && (
          <Marker
            coordinate={{ latitude: myLocation.lat, longitude: myLocation.lng }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.myMarker}>
              <View style={styles.myMarkerDot} />
            </View>
          </Marker>
        )}

        {/* Nearby Users */}
        {nearbyUsers
          .filter((u) => u.id !== user?.id)
          .map((u) => (
            <Marker
              key={`nearby-${u.id}`}
              coordinate={{ latitude: u.lat, longitude: u.lng }}
            >
              <View style={styles.otherMarker}>
                <FontAwesome5 name="dog" size={12} color="#FFF" />
              </View>
            </Marker>
          ))}
      </MapView>

      {/* Top Search Bar Style HUD */}
      <SafeAreaView style={styles.topContainer} pointerEvents="box-none">
        <View style={styles.searchCard}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>
            {nearbyUsers.length - 1 > 0
              ? `${nearbyUsers.length - 1} active nearby`
              : "Scanning for friends..."}
          </Text>
        </View>
      </SafeAreaView>

      {/* Bottom Controls */}
      <View style={styles.bottomContainer}>
        {/* Radius Controls */}
        <View style={styles.controlCard}>
          <TouchableOpacity onPress={() => updateRadius(searchRadius - 200)}>
            <Feather name="minus" size={20} color={COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.radiusText}>{searchRadius}m range</Text>
          <TouchableOpacity onPress={() => updateRadius(searchRadius + 200)}>
            <Feather name="plus" size={20} color={COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.fabRow}>
          <TouchableOpacity
            style={[
              styles.fab,
              { backgroundColor: isInvisible ? COLORS.TEXT_PRIMARY : "#FFF" },
            ]}
            onPress={() => setIsInvisible(!isInvisible)}
          >
            <Feather
              name={isInvisible ? "eye-off" : "eye"}
              size={24}
              color={isInvisible ? "#FFF" : COLORS.TEXT_PRIMARY}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.fab, styles.primaryFab]}
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
            <Ionicons name="navigate" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG_MAIN },
  topContainer: { paddingHorizontal: SPACING.l, paddingTop: SPACING.s },
  searchCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: SPACING.m,
    borderRadius: 12,
    ...SHADOWS.md,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.ACCENT,
    marginRight: 8,
  },
  statusText: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: "500",
  },

  // Markers
  myMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(79, 70, 229, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  myMarkerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.PRIMARY,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  otherMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.ACCENT,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFF",
    ...SHADOWS.sm,
  },

  // Bottom
  bottomContainer: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
  },
  controlCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: SPACING.m,
    borderRadius: 12,
    marginBottom: SPACING.m,
    ...SHADOWS.sm,
  },
  radiusText: { fontWeight: "600", color: COLORS.TEXT_PRIMARY },
  fabRow: { flexDirection: "row", justifyContent: "space-between" },
  fab: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.md,
  },
  primaryFab: {
    backgroundColor: COLORS.PRIMARY,
  },
});
