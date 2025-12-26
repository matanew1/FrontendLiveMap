import { Dimensions, Platform } from "react-native";

const { width, height } = Dimensions.get("window");

export const COLORS = {
  // Brand Identity - Refined Indigo & Emerald
  PRIMARY: "#6366F1",
  PRIMARY_LIGHT: "#EEF2FF",
  ACCENT: "#10B981",
  DANGER: "#F43F5E",
  WARNING: "#F59E0B", // For the "Fire" streak

  // Backgrounds - Slate based for premium feel
  BG_MAIN: "#F8FAFC",
  BG_CARD: "#FFFFFF",
  BG_INPUT: "#F1F5F9",
  GLASS: "rgba(255, 255, 255, 0.85)",

  // Typography
  TEXT_PRIMARY: "#0F172A",
  TEXT_SECONDARY: "#64748B",
  TEXT_TERTIARY: "#94A3B8",

  // UI Elements
  BORDER: "#E2E8F0",
  ICON: "#475569",
  OVERLAY: "rgba(15, 23, 42, 0.4)",
};

export const SPACING = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

export const SHADOWS = {
  // Multi-layered soft shadows
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },
};

export const FONTS = {
  regular: Platform.OS === "ios" ? "System" : "Roboto",
  bold: Platform.OS === "ios" ? "System" : "Roboto",
};
