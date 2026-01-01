import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Image,
  Animated,
} from "react-native";
import {
  Feather,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { COLORS, SPACING, SHADOWS, GRADIENTS } from "../constants/theme";
import { fetchStats, StatsData } from "../api/stats";

const { width } = Dimensions.get("window");

interface StatsDashboardProps {
  onClose: () => void;
}

export default function StatsDashboard({ onClose }: StatsDashboardProps) {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [localTreats, setLocalTreats] = useState(0);
  const treatScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const stats = await fetchStats();
      setData(stats);
      setLocalTreats(stats.globalTreats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGiveTreat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLocalTreats((prev) => prev + 1);

    Animated.sequence([
      Animated.spring(treatScale, {
        toValue: 0.8,
        useNativeDriver: true,
      }),
      Animated.spring(treatScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>
          Sniffing out the latest trends...
        </Text>
      </View>
    );
  }

  if (!data) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Community Hub</Text>
          <Text style={styles.headerSubtitle}>Trends, Treats & Tails</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Feather name="x" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Dog of the Day Hero */}
        <View style={styles.heroCard}>
          <Image
            source={{ uri: data.dogOfTheDay.imageUrl }}
            style={styles.heroImage}
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={styles.heroOverlay}
          >
            <View style={styles.heroBadge}>
              <FontAwesome5 name="crown" size={12} color="#FFD700" />
              <Text style={styles.heroBadgeText}>DOG OF THE DAY</Text>
            </View>
            <Text style={styles.heroName}>{data.dogOfTheDay.name}</Text>
            <Text style={styles.heroBreed}>{data.dogOfTheDay.breed}</Text>
            <Text style={styles.heroBio} numberOfLines={2}>
              {data.dogOfTheDay.bio}
            </Text>
          </LinearGradient>
        </View>

        {/* Global Treat Counter (Gimic) */}
        <View style={styles.treatSection}>
          <LinearGradient
            colors={GRADIENTS.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.treatCard}
          >
            <View style={styles.treatContent}>
              <Text style={styles.treatTitle}>Global Treat Count</Text>
              <Text style={styles.treatCount}>
                {localTreats.toLocaleString()}
              </Text>
              <Text style={styles.treatSubtitle}>
                Treats given by the community today!
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleGiveTreat}
              style={styles.treatButtonWrapper}
            >
              <Animated.View
                style={[
                  styles.treatButton,
                  { transform: [{ scale: treatScale }] },
                ]}
              >
                <FontAwesome5 name="bone" size={24} color={COLORS.PRIMARY} />
              </Animated.View>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Daily Fact */}
        <View style={styles.factCard}>
          <View style={styles.factIcon}>
            <MaterialCommunityIcons
              name="lightbulb-on-outline"
              size={24}
              color={COLORS.WARNING}
            />
          </View>
          <View style={styles.factContent}>
            <Text style={styles.factTitle}>Did you know?</Text>
            <Text style={styles.factText}>{data.dailyFact}</Text>
          </View>
        </View>

        {/* Trending Breeds */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Trending Breeds</Text>
          {data.trendingBreeds.map((item, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{index + 1}</Text>
              </View>
              <View style={styles.listContent}>
                <Text style={styles.listTitle}>{item.breed}</Text>
                <Text style={styles.listSubtitle}>
                  {item.count} active today
                </Text>
              </View>
              <View style={styles.trendBadge}>
                <Feather
                  name={
                    item.trend === "up"
                      ? "trending-up"
                      : item.trend === "down"
                      ? "trending-down"
                      : "minus"
                  }
                  size={16}
                  color={
                    item.trend === "up"
                      ? COLORS.ACCENT
                      : item.trend === "down"
                      ? COLORS.DANGER
                      : COLORS.TEXT_TERTIARY
                  }
                />
              </View>
            </View>
          ))}
        </View>

        {/* Top Parks */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Top Hotspots</Text>
          {data.topParks.map((park, index) => (
            <View key={index} style={styles.listItem}>
              <View
                style={[
                  styles.rankBadge,
                  { backgroundColor: COLORS.PRIMARY_LIGHT },
                ]}
              >
                <MaterialCommunityIcons
                  name="tree"
                  size={18}
                  color={COLORS.PRIMARY}
                />
              </View>
              <View style={styles.listContent}>
                <Text style={styles.listTitle}>{park.name}</Text>
                <Text style={styles.listSubtitle}>
                  {park.visitors} visitors now
                </Text>
              </View>
              <View style={styles.ratingContainer}>
                <FontAwesome5
                  name="star"
                  size={12}
                  color={COLORS.WARNING}
                  solid
                />
                <Text style={styles.ratingText}>{park.rating}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG_MAIN,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.BG_MAIN,
  },
  loadingText: {
    marginTop: SPACING.m,
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.l,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: "500",
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.BG_INPUT,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: SPACING.l,
  },
  // Hero Card
  heroCard: {
    height: 220,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: SPACING.l,
    ...SHADOWS.md,
    backgroundColor: COLORS.TEXT_TERTIARY,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.l,
    paddingTop: SPACING.xl * 2,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
    gap: 6,
  },
  heroBadgeText: {
    color: "#FFD700",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  heroName: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 2,
  },
  heroBreed: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  heroBio: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    lineHeight: 18,
  },
  // Treat Section
  treatSection: {
    marginBottom: SPACING.l,
  },
  treatCard: {
    borderRadius: 24,
    padding: SPACING.l,
    flexDirection: "row",
    alignItems: "center",
    ...SHADOWS.md,
  },
  treatContent: {
    flex: 1,
  },
  treatTitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  treatCount: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 4,
  },
  treatSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
  },
  treatButtonWrapper: {
    marginLeft: SPACING.m,
  },
  treatButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.lg,
  },
  // Fact Card
  factCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: SPACING.l,
    marginBottom: SPACING.l,
    flexDirection: "row",
    alignItems: "flex-start",
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  factIcon: {
    marginRight: SPACING.m,
    marginTop: 2,
  },
  factContent: {
    flex: 1,
  },
  factTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  factText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
  // Standard Sections
  sectionContainer: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: SPACING.l,
    marginBottom: SPACING.l,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.l,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.m,
    paddingBottom: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BG_INPUT,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.BG_INPUT,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.m,
  },
  rankText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.TEXT_SECONDARY,
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
  },
  listSubtitle: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
  },
  trendBadge: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#B45309",
  },
});
