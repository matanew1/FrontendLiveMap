import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { COLORS, SPACING, SHADOWS } from "../constants/theme";
import { Platform } from "react-native";

// Mock Data
const MOCK_POSTS = [
  {
    id: "1",
    user: "Rex_Cyber",
    rank: "ELITE",
    breed: "Husky Model-X",
    content: "Sector 7 patrol complete. No anomalies detected.",
    time: "02:14 PM",
    likes: 128,
  },
  {
    id: "2",
    user: "Luna_Labs",
    rank: "ROOKIE",
    breed: "Golden Ret. v2",
    content: "Upgraded my collar firmware. Tracking efficiency +15%.",
    time: "01:45 PM",
    likes: 84,
  },
];

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const renderPost = ({ item }: any) => (
    <View style={styles.cardContainer}>
      {/* Glow behind the card */}
      <View style={styles.cardGlow} />

      <BlurView intensity={30} tint="dark" style={styles.postCard}>
        {/* Header */}
        <View style={styles.postHeader}>
          <LinearGradient
            colors={[COLORS.CYAN, COLORS.PURPLE]}
            style={styles.avatarBorder}
          >
            <View style={styles.avatarInner}>
              <Text style={styles.avatarText}>{item.user[0]}</Text>
            </View>
          </LinearGradient>

          <View style={styles.headerText}>
            <View style={styles.nameRow}>
              <Text style={styles.postUser}>{item.user}</Text>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{item.rank}</Text>
              </View>
            </View>
            <Text style={styles.postSub}>
              ID: {item.breed} •{" "}
              <Text style={{ color: COLORS.CYAN }}>{item.time}</Text>
            </Text>
          </View>

          <TouchableOpacity style={styles.moreBtn}>
            <Feather
              name="more-horizontal"
              size={20}
              color={COLORS.TEXT_SECONDARY}
            />
          </TouchableOpacity>
        </View>

        {/* Media Placeholder - Digital Noise Style */}
        <View style={styles.mediaContainer}>
          <MaterialCommunityIcons
            name="waveform"
            size={64}
            color={COLORS.NEON_BORDER}
          />
          <Text style={styles.mediaText}>ENCRYPTED_SIGNAL_RECEIVED</Text>
        </View>

        {/* Content & Actions */}
        <View style={styles.contentSection}>
          <Text style={styles.postContent}>{item.content}</Text>

          <View style={styles.divider} />

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn}>
              <Feather name="heart" size={18} color={COLORS.DANGER} />
              <Text style={styles.actionText}>{item.likes}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn}>
              <Feather
                name="message-square"
                size={18}
                color={COLORS.TEXT_PRIMARY}
              />
              <Text style={styles.actionText}>REPLY</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn}>
              <Feather name="share-2" size={18} color={COLORS.CYAN} />
              <Text style={styles.actionText}>LINK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[COLORS.BG_DEEP, COLORS.BG_DARK]}
        style={StyleSheet.absoluteFill}
      />

      {/* Background Grid/Decoration */}
      <View style={styles.gridLine} />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>SYSTEM FEED</Text>
            <Text style={styles.headerTitle}>
              CY<Text style={{ color: COLORS.CYAN }}>LOGS</Text>
            </Text>
          </View>
          <TouchableOpacity style={styles.addBtn}>
            <LinearGradient
              colors={[COLORS.CYAN, COLORS.PURPLE]}
              style={styles.addBtnGradient}
            >
              <Feather name="plus" size={24} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <FlatList
          data={MOCK_POSTS}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.CYAN}
            />
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG_DARK },
  gridLine: {
    position: "absolute",
    top: "20%",
    width: "100%",
    height: 1,
    backgroundColor: COLORS.NEON_BORDER,
    opacity: 0.2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
  },
  headerSubtitle: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 2,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: 1,
    fontStyle: "italic",
  },
  addBtn: {
    shadowColor: COLORS.CYAN,
    shadowRadius: 10,
    shadowOpacity: 0.4,
  },
  addBtnGradient: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: SPACING.l,
    paddingBottom: 120, // Space for TabBar
  },
  // Card Styles
  cardContainer: {
    marginBottom: SPACING.l,
  },
  cardGlow: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    bottom: -10,
    backgroundColor: COLORS.CYAN,
    opacity: 0.05,
    borderRadius: 24,
    transform: [{ scale: 0.95 }],
  },
  postCard: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.GLASS_BORDER,
    backgroundColor: "rgba(30, 34, 45, 0.4)",
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  avatarBorder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    padding: 2,
    marginRight: SPACING.s,
  },
  avatarInner: {
    flex: 1,
    backgroundColor: COLORS.BG_DARK,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  headerText: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center" },
  postUser: { color: "#FFF", fontWeight: "bold", fontSize: 16, marginRight: 8 },
  rankBadge: {
    backgroundColor: "rgba(189, 0, 255, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(189, 0, 255, 0.4)",
  },
  rankText: { color: COLORS.PURPLE, fontSize: 8, fontWeight: "900" },
  postSub: { color: COLORS.TEXT_SECONDARY, fontSize: 11, marginTop: 2 },
  moreBtn: { padding: 4 },

  mediaContainer: {
    height: 200,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  mediaText: {
    color: COLORS.NEON_BORDER,
    fontSize: 10,
    marginTop: SPACING.s,
    letterSpacing: 2,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  contentSection: { padding: SPACING.m },
  postContent: { color: "#FFF", fontSize: 14, lineHeight: 20 },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginVertical: SPACING.m,
  },
  actionRow: { flexDirection: "row", justifyContent: "space-between" },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  actionText: { color: "#FFF", marginLeft: 6, fontSize: 12, fontWeight: "600" },
});
