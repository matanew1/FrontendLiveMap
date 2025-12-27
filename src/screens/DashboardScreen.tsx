import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Dimensions,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SPACING, SHADOWS } from "../constants/theme";
import { Skeleton } from "../components/Skeleton";
import useAuthStore from "../../store/authStore";

const { width: screenWidth } = Dimensions.get("window");
const isSmallScreen = screenWidth < 375;

// Mock Data including breed and age for compatibility logic
const MOCK_POSTS = [
  {
    id: "1",
    user: "Rex",
    breed: "Husky",
    age: 3,
    location: "Central Park",
    content: "Squirrel hunting season is officially open! 🐿️",
    time: "2h ago",
    likes: 128,
    imageUrl:
      "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&h=300&fit=crop",
  },
  {
    id: "2",
    user: "Luna",
    breed: "Retriever",
    age: 2,
    location: "Downtown",
    content: "Found a new pet-friendly latte spot!",
    time: "4h ago",
    likes: 84,
    imageUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
  },
];

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate initial data fetch
    setTimeout(() => setLoading(false), 1500);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const renderPost = ({ item }: any) => {
    // Logic: Compare breeds or age (within 1 year) for compatibility badge
    const isMatch =
      user?.dogBreed === item.breed ||
      Math.abs((user?.dogAge || 0) - item.age) <= 1;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarGlow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.user[0]}</Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{item.user}</Text>
              {isMatch && (
                <View style={styles.matchBadge}>
                  <MaterialCommunityIcons
                    name="paw"
                    size={12}
                    color={COLORS.PRIMARY}
                  />
                  <Text style={styles.matchText}>Great Match</Text>
                </View>
              )}
            </View>
            <View style={styles.metaRow}>
              <Feather name="map-pin" size={12} color={COLORS.TEXT_TERTIARY} />
              <Text style={styles.metaText}>
                {item.location} • {item.time}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.moreBtn}>
            <Feather
              name="more-vertical"
              size={20}
              color={COLORS.TEXT_TERTIARY}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.postContent}>{item.content}</Text>

        {item.imageUrl && (
          <View style={styles.mediaContainer}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.postImage}
              resizeMode="cover"
            />
          </View>
        )}

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn}>
            <Feather name="heart" size={18} color={COLORS.DANGER} />
            <Text style={styles.actionText}>{item.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Feather
              name="message-circle"
              size={18}
              color={COLORS.TEXT_SECONDARY}
            />
            <Text style={styles.actionText}>Reply</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Feather name="share" size={18} color={COLORS.TEXT_SECONDARY} />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.BG_MAIN} />
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        {/* RESPONSIVE GLASSMOPRHISM HEADER */}
        <View style={styles.glassHeader}>
          <View style={styles.headerContent}>
            <View style={styles.headerTopRow}>
              <View style={styles.titleContainer}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  Activity
                </Text>
              </View>

              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.iconBtn}>
                  <Feather name="bell" size={22} color={COLORS.TEXT_PRIMARY} />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.headerSubtitle} numberOfLines={2}>
              Stay connected with your dog community
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={{ padding: SPACING.m }}>
            <Skeleton
              width="100%"
              height={150}
              style={{ marginBottom: 20, borderRadius: 24 }}
            />
            <Skeleton width="100%" height={150} style={{ borderRadius: 24 }} />
          </View>
        ) : (
          <FlatList
            data={MOCK_POSTS}
            renderItem={renderPost}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </SafeAreaView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Feather name="plus" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG_MAIN },

  // Header Styles
  glassHeader: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.3)",
    ...SHADOWS.md,
    zIndex: 10,
  },
  headerContent: {
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: isSmallScreen ? 22 : 28,
    fontWeight: "800",
    color: COLORS.PRIMARY,
    letterSpacing: -0.8,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerSubtitle: {
    fontSize: isSmallScreen ? 13 : 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
    fontWeight: "500",
    maxWidth: "90%",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
    ...SHADOWS.sm,
  },
  streakText: {
    marginLeft: 4,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    fontSize: 14,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.sm,
  },

  // Card & List Styles
  listContent: {
    paddingBottom: 100,
    paddingTop: SPACING.m,
  },
  card: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: 24,
    padding: SPACING.l,
    marginBottom: SPACING.l,
    marginHorizontal: SPACING.m,
    ...SHADOWS.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.m,
  },
  avatarGlow: {
    padding: 2,
    borderRadius: 22,
    backgroundColor: "#EEF2FF",
    marginRight: SPACING.s,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#FFF", fontWeight: "bold", fontSize: 18 },
  nameRow: { flexDirection: "row", alignItems: "center" },
  userName: { fontWeight: "700", color: COLORS.TEXT_PRIMARY, fontSize: 16 },
  matchBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  matchText: {
    fontSize: 11,
    color: COLORS.PRIMARY,
    fontWeight: "700",
    marginLeft: 4,
  },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  metaText: { color: COLORS.TEXT_SECONDARY, fontSize: 12, marginLeft: 4 },
  moreBtn: { padding: SPACING.xs },
  postContent: {
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 22,
    marginBottom: SPACING.l,
  },
  mediaContainer: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: SPACING.l,
  },
  postImage: {
    width: "100%",
    height: "100%",
  },
  actionRow: {
    flexDirection: "row",
    paddingTop: SPACING.m,
    borderTopWidth: 1,
    borderTopColor: COLORS.BG_INPUT,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: SPACING.xl,
  },
  actionText: {
    marginLeft: 6,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: "600",
    fontSize: 13,
  },
  fab: {
    position: "absolute",
    bottom: SPACING.l,
    right: SPACING.l,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.lg,
  },
});
