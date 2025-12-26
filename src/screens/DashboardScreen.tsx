import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { COLORS, SPACING, SHADOWS } from "../constants/theme";
import { Skeleton } from "../components/Skeleton";

// Mock Data
const MOCK_POSTS = [
  {
    id: "1",
    user: "Rex the Husky",
    location: "Central Park",
    content:
      "Just finished a 5k run with my human. The squirrels are fast today!",
    time: "2h ago",
    likes: 128,
  },
  {
    id: "2",
    user: "Luna Retriever",
    location: "Downtown",
    content: "Checking in at the new pet-friendly cafe.",
    time: "4h ago",
    likes: 84,
  },
];

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate initial data fetch
    setTimeout(() => setLoading(false), 2000);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const renderSkeleton = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Skeleton width={40} height={40} style={{ borderRadius: 20 }} />
        <View style={{ marginLeft: 12 }}>
          <Skeleton width={120} height={16} style={{ marginBottom: 6 }} />
          <Skeleton width={80} height={12} />
        </View>
      </View>
      <Skeleton width="100%" height={60} style={{ marginVertical: 12 }} />
      <Skeleton width="100%" height={200} style={{ borderRadius: 8 }} />
    </View>
  );

  const renderPost = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.user[0]}</Text>
        </View>
        <View>
          <Text style={styles.userName}>{item.user}</Text>
          <Text style={styles.metaText}>
            {item.location} • {item.time}
          </Text>
        </View>
      </View>

      <Text style={styles.postContent}>{item.content}</Text>

      {/* Placeholder Image Area */}
      <View style={styles.mediaPlaceholder}>
        <Feather name="image" size={32} color={COLORS.TEXT_TERTIARY} />
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn}>
          <Feather name="heart" size={18} color={COLORS.TEXT_SECONDARY} />
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Feather
            name="message-square"
            size={18}
            color={COLORS.TEXT_SECONDARY}
          />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Feather name="share-2" size={18} color={COLORS.TEXT_SECONDARY} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.BG_MAIN} />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Activity Feed</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <Feather name="bell" size={24} color={COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{ padding: SPACING.m }}>
            {renderSkeleton()}
            {renderSkeleton()}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
    backgroundColor: COLORS.BG_MAIN,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
  },
  iconBtn: { padding: 8 },
  listContent: { padding: SPACING.m, paddingBottom: 100 },
  card: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: 12,
    padding: SPACING.m,
    marginBottom: SPACING.m,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.s,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.s,
  },
  avatarText: { color: "#FFF", fontWeight: "bold" },
  userName: { fontWeight: "700", color: COLORS.TEXT_PRIMARY, fontSize: 15 },
  metaText: { color: COLORS.TEXT_SECONDARY, fontSize: 12, marginTop: 2 },
  postContent: {
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 22,
    marginBottom: SPACING.m,
  },
  mediaPlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: COLORS.BG_INPUT,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.m,
  },
  actionRow: {
    flexDirection: "row",
    paddingTop: SPACING.s,
    borderTopWidth: 1,
    borderTopColor: COLORS.BG_INPUT,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: SPACING.l,
  },
  actionText: {
    marginLeft: 6,
    color: COLORS.TEXT_SECONDARY,
    fontSize: 13,
    fontWeight: "500",
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
