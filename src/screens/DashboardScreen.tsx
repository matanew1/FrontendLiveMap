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
  Animated,
  Modal,
  TextInput,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { COLORS, SPACING, SHADOWS, GRADIENTS } from "../constants/theme";
import { Skeleton } from "../components/Skeleton";
import StatsDashboard from "../components/StatsDashboard";
import useAuthStore from "../../store/authStore";
import { usePosts, useToggleLikePost, useCreatePost } from "../hooks/posts";
import { Post } from "../types/posts";

const { width: screenWidth } = Dimensions.get("window");
const isSmallScreen = screenWidth < 375;

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const { data: posts, isLoading, error, refetch } = usePosts();
  const toggleLikeMutation = useToggleLikePost();
  const createPostMutation = useCreatePost();
  const [refreshing, setRefreshing] = React.useState(false);
  const [likedPosts, setLikedPosts] = React.useState<Set<string>>(new Set());
  const [likeAnimations, setLikeAnimations] = React.useState<
    Map<string, Animated.Value>
  >(new Map());
  const [isCreateModalVisible, setIsCreateModalVisible] = React.useState(false);
  const [isStatsVisible, setIsStatsVisible] = React.useState(false);
  const [postContent, setPostContent] = React.useState("");
  const [postLocation, setPostLocation] = React.useState("");

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleLikePress = async (postId: string) => {
    // Add haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Create and run animation
    const animation = likeAnimations.get(postId) || new Animated.Value(1);
    if (!likeAnimations.has(postId)) {
      setLikeAnimations((prev) => new Map(prev).set(postId, animation));
    }

    Animated.sequence([
      Animated.timing(animation, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Optimistically update local liked state
    const wasLiked = likedPosts.has(postId);
    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      if (wasLiked) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });

    try {
      await toggleLikeMutation.mutateAsync({
        postId,
        isCurrentlyLiked: wasLiked,
      });
    } catch (error) {
      // Revert on error
      setLikedPosts((prev) => {
        const newSet = new Set(prev);
        if (wasLiked) {
          newSet.add(postId);
        } else {
          newSet.delete(postId);
        }
        return newSet;
      });
      console.error("Failed to toggle like:", error);
    }
  };

  const handleCreatePost = () => {
    setIsCreateModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalVisible(false);
    setPostContent("");
    setPostLocation("");
  };

  const handleSubmitPost = async () => {
    if (!postContent.trim()) return;

    try {
      console.log("Creating post...");
      await createPostMutation.mutateAsync({
        content: postContent.trim(),
        location: postLocation.trim() || undefined,
      });

      handleCloseModal();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Failed to create post:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const renderPost = ({ item }: { item: Post }) => {
    // Logic: Compare breeds or age (within 1 year) for compatibility badge
    const isMatch =
      user?.dogBreed === item.breed ||
      Math.abs((user?.dogAge || 0) - item.age) <= 1;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={GRADIENTS.primary}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>{item.user[0]}</Text>
            </LinearGradient>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{item.user}</Text>
              {isMatch && (
                <LinearGradient
                  colors={GRADIENTS.accent}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.matchBadge}
                >
                  <MaterialCommunityIcons name="paw" size={10} color="#FFF" />
                  <Text style={styles.matchText}>98% Match</Text>
                </LinearGradient>
              )}
            </View>
            <View style={styles.metaRow}>
              <Feather name="map-pin" size={12} color={COLORS.TEXT_TERTIARY} />
              <Text style={styles.metaText}>
                {item.location ? "Nearby" : "Unknown"} • {item.time}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.moreBtn}>
            <Feather
              name="more-horizontal"
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

        <View style={styles.divider} />

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleLikePress(item.id)}
            disabled={toggleLikeMutation.isPending}
          >
            <Animated.View
              style={[
                styles.likeButton,
                {
                  transform: [
                    {
                      scale: likeAnimations.get(item.id) || 1,
                    },
                  ],
                },
              ]}
            >
              <Feather
                name="heart"
                size={20}
                color={
                  item.isLiked ?? likedPosts.has(item.id)
                    ? COLORS.DANGER
                    : COLORS.TEXT_SECONDARY
                }
                style={
                  (item.isLiked ?? likedPosts.has(item.id)) && {
                    shadowColor: COLORS.DANGER,
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 2 },
                  }
                }
              />
            </Animated.View>
            <Text
              style={[
                styles.actionText,
                (item.isLiked ?? likedPosts.has(item.id)) && {
                  color: COLORS.DANGER,
                  fontWeight: "700",
                },
              ]}
            >
              {item.likes || 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <View style={styles.iconCircle}>
              <Feather
                name="message-circle"
                size={18}
                color={COLORS.TEXT_SECONDARY}
              />
            </View>
            <Text style={styles.actionText}>Reply</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <View style={styles.iconCircle}>
              <Feather name="share-2" size={18} color={COLORS.TEXT_SECONDARY} />
            </View>
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.glassHeader}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Activity</Text>
          </View>
        </View>
        <View style={{ padding: SPACING.m }}>
          <Skeleton height={200} style={{ marginBottom: SPACING.m }} />
          <Skeleton height={200} style={{ marginBottom: SPACING.m }} />
          <Skeleton height={200} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Feather name="alert-triangle" size={48} color={COLORS.TEXT_TERTIARY} />
        <Text style={{ marginTop: SPACING.m, color: COLORS.TEXT_SECONDARY }}>
          Unable to load posts
        </Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, position: "relative" }}>
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
                  <TouchableOpacity
                    style={[styles.iconBtn, { marginRight: 8 }]}
                    onPress={() => setIsStatsVisible(true)}
                  >
                    <Feather
                      name="bar-chart-2"
                      size={22}
                      color={COLORS.TEXT_PRIMARY}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn}>
                    <Feather
                      name="bell"
                      size={22}
                      color={COLORS.TEXT_PRIMARY}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.headerSubtitle} numberOfLines={2}>
                Stay connected with your dog community
              </Text>
            </View>
          </View>

          {isLoading ? (
            <View style={{ padding: SPACING.m }}>
              <Skeleton
                width="100%"
                height={150}
                style={{ marginBottom: 20, borderRadius: 24 }}
              />
              <Skeleton
                width="100%"
                height={150}
                style={{ borderRadius: 24 }}
              />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={48} color={COLORS.DANGER} />
              <Text style={styles.errorTitle}>Unable to load posts</Text>
              <Text style={styles.errorMessage}>
                {error?.message || "Something went wrong while fetching posts"}
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => refetch()}
              >
                <Text style={styles.retryText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : posts && Array.isArray(posts) && posts.length > 0 ? (
            <FlatList
              data={posts}
              renderItem={renderPost}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Feather
                name="file-text"
                size={48}
                color={COLORS.TEXT_TERTIARY}
              />
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptyMessage}>
                Be the first to share something with your dog community!
              </Text>
            </View>
          )}
        </SafeAreaView>
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleCreatePost}>
        <Feather name="plus" size={24} color="#FFF" />
      </TouchableOpacity>

      {/* Stats Dashboard Modal */}
      <Modal
        visible={isStatsVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsStatsVisible(false)}
      >
        <StatsDashboard onClose={() => setIsStatsVisible(false)} />
      </Modal>

      {/* Create Post Modal */}
      <Modal
        visible={isCreateModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Post</Text>
            <TouchableOpacity
              onPress={handleCloseModal}
              style={styles.closeButton}
            >
              <Feather name="x" size={24} color={COLORS.TEXT_SECONDARY} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.inputLabel}>What's on your mind?</Text>
            <TextInput
              style={styles.contentInput}
              placeholder="Share something with your dog community..."
              placeholderTextColor={COLORS.TEXT_TERTIARY}
              value={postContent}
              onChangeText={setPostContent}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />

            <Text style={styles.inputLabel}>Location (optional)</Text>
            <TextInput
              style={styles.locationInput}
              placeholder="Where are you?"
              placeholderTextColor={COLORS.TEXT_TERTIARY}
              value={postLocation}
              onChangeText={setPostLocation}
              maxLength={100}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCloseModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!postContent.trim() || createPostMutation.isPending) &&
                    styles.submitButtonDisabled,
                ]}
                onPress={handleSubmitPost}
                disabled={!postContent.trim() || createPostMutation.isPending}
              >
                <Text style={styles.submitButtonText}>
                  {createPostMutation.isPending ? "Posting..." : "Post"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.m,
  },
  avatarContainer: {
    marginRight: SPACING.s,
    ...SHADOWS.sm,
  },
  avatarGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#FFF", fontWeight: "bold", fontSize: 20 },
  nameRow: { flexDirection: "row", alignItems: "center" },
  userName: { fontWeight: "700", color: COLORS.TEXT_PRIMARY, fontSize: 17 },
  matchBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  matchText: {
    fontSize: 11,
    color: "#FFF",
    fontWeight: "700",
    marginLeft: 4,
  },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  metaText: { color: COLORS.TEXT_SECONDARY, fontSize: 13, marginLeft: 4 },
  moreBtn: { padding: SPACING.xs },
  postContent: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 24,
    marginBottom: SPACING.l,
    letterSpacing: 0.2,
  },
  mediaContainer: {
    width: "100%",
    height: 240,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: SPACING.l,
    ...SHADOWS.sm,
  },
  postImage: {
    width: "100%",
    height: "100%",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.BG_INPUT,
    marginBottom: SPACING.m,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.s,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.BG_INPUT,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  actionText: {
    color: COLORS.TEXT_SECONDARY,
    fontWeight: "600",
    fontSize: 14,
  },
  fab: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 120 : 90,
    right: SPACING.l,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.premium,
    zIndex: 1000,
    elevation: 10,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
    marginTop: SPACING.m,
    marginBottom: SPACING.s,
  },
  errorMessage: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: "center",
    marginBottom: SPACING.l,
  },
  retryButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
    borderRadius: 12,
  },
  retryText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
    marginTop: SPACING.m,
    marginBottom: SPACING.s,
  },
  emptyMessage: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: "center",
  },
  likeButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.BG_MAIN,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BG_INPUT,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
  },
  closeButton: {
    padding: SPACING.s,
  },
  modalContent: {
    flex: 1,
    padding: SPACING.l,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.s,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: COLORS.BG_INPUT,
    borderRadius: 12,
    padding: SPACING.m,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    minHeight: 120,
    maxHeight: 200,
    marginBottom: SPACING.l,
    backgroundColor: "#FFF",
  },
  locationInput: {
    borderWidth: 1,
    borderColor: COLORS.BG_INPUT,
    borderRadius: 12,
    padding: SPACING.m,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.xl,
    backgroundColor: "#FFF",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SPACING.m,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.BG_INPUT,
    paddingVertical: SPACING.m,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.TEXT_SECONDARY,
  },
  submitButton: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.m,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.TEXT_TERTIARY,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  retryBtn: {
    marginTop: SPACING.l,
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.m,
    borderRadius: 12,
  },
  retryBtnText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
