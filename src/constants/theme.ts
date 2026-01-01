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

export const GRADIENTS = {
  primary: ["#6366F1", "#8B5CF6"] as const,
  accent: ["#10B981", "#34D399"] as const,
  danger: ["#F43F5E", "#FB7185"] as const,
  dark: ["#1E293B", "#0F172A"] as const,
  glass: ["rgba(255,255,255,0.8)", "rgba(255,255,255,0.4)"] as const,
};

export const SHADOWS = {
  subtle: {
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sm: {
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  lg: {
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  premium: {
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
};

export const SPACING = { xs: 4, s: 8, m: 16, l: 24, xl: 32, xxl: 48 };
