import { Dimensions, Platform } from "react-native";

const { width, height } = Dimensions.get("window");

export const COLORS = {
  // Brand Identity
  PRIMARY: "#4F46E5", // Indigo 600 - Trustworthy, modern tech
  PRIMARY_DARK: "#4338CA",
  ACCENT: "#10B981", // Emerald 500 - Success actions
  DANGER: "#EF4444", // Red 500 - Destructive actions

  // Backgrounds
  BG_MAIN: "#F9FAFB", // Cool Gray 50 - Easier on eyes than pure white
  BG_CARD: "#FFFFFF",
  BG_MODAL: "#FFFFFF",
  BG_INPUT: "#F3F4F6", // Cool Gray 100

  // Typography
  TEXT_PRIMARY: "#111827", // Cool Gray 900 - High legibility
  TEXT_SECONDARY: "#6B7280", // Cool Gray 500 - Meta data
  TEXT_TERTIARY: "#9CA3AF", // Cool Gray 400 - Placeholders

  // UI Elements
  BORDER: "#E5E7EB", // Cool Gray 200
  ICON: "#4B5563", // Cool Gray 600
  OVERLAY: "rgba(0, 0, 0, 0.4)",
};
export const SPACING = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

export const LAYOUT = {
  window: { width, height },
  isSmallDevice: width < 375,
};

export const SHADOWS = {
  // Soft, diffused shadows instead of neon glows
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
};
export const FONTS = {
  // Use system fonts for native feel
  regular: Platform.OS === "ios" ? "System" : "Roboto",
  bold: Platform.OS === "ios" ? "System" : "Roboto",
};
