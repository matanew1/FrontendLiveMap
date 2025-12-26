import { Dimensions, Platform } from "react-native";

const { width, height } = Dimensions.get("window");

export const COLORS = {
  // Cyber Tech Palette
  CYAN: "#00FFFF",
  PURPLE: "#8A2BE2",
  BG_DARK: "#05070A",
  BG_WHITE: "#FFFFFF",
  BG_DEEP: "#0A0D14",
  TEXT_PRIMARY: "#FFFFFF",
  TEXT_SECONDARY: "#B0B0B0",
  DANGER: "#FF4444",
  SUCCESS: "#00FF00",
  BORDER_LIGHT: "#333333",
  ACCENT_BLUE: "#1A73E8",
  NEON_BORDER: "rgba(0, 240, 255, 0.3)",
  GLASS_BORDER: "rgba(0, 240, 255, 0.3)",
};

export const SPACING = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
};

export const LAYOUT = {
  window: { width, height },
  isSmallDevice: width < 375,
};

export const SHADOWS = {
  light: {
    shadowColor: COLORS.TEXT_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  neon: {
    shadowColor: COLORS.CYAN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 15,
  },
};
