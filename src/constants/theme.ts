// src/constants/theme.ts
import { Dimensions, Platform } from "react-native";

const { width, height } = Dimensions.get("window");

export const FONTS = {
  regular: Platform.OS === "ios" ? "System" : "Roboto",
  bold: Platform.OS === "ios" ? "System" : "Roboto",
};

export const COLORS = {
  PRIMARY: "#6366F1",
  PRIMARY_DARK: "#4F46E5",
  PRIMARY_LIGHT: "#EEF2FF",
  ACCENT: "#10B981",
  DANGER: "#F43F5E",
  WARNING: "#F59E0B",

  // Modern Neutrals
  BG_MAIN: "#F8FAFC",
  BG_SURFACE: "#FFFFFF",
  BG_INPUT: "#F1F5F9",
  BG_CARD: "#FFFFFF",

  // Typography
  TEXT_PRIMARY: "#0F172A",
  TEXT_SECONDARY: "#475569",
  TEXT_TERTIARY: "#94A3B8",

  BORDER: "#E2E8F0",
  DIVIDER: "rgba(226, 232, 240, 0.6)",
};

export const SHADOWS = {
  subtle: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  premium: {
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
};

export const SPACING = { xs: 4, s: 8, m: 16, l: 24, xl: 32, xxl: 48 };
