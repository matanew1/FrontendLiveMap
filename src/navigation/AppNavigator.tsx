import React, { useRef, useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useAuthStore from "../../store/authStore";
import AuthScreen from "../screens/AuthScreen";
import ProfileScreen from "../screens/ProfileScreen";
import RealtimeMap from "../screens/RealtimeMap";
import DashboardScreen from "../screens/DashboardScreen";
import BootSequence from "../components/BootSequence";
import { connectSocket } from "../lib/socket";
import { useUser } from "../hooks/auth";
import { COLORS, SHADOWS } from "../constants/theme";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator for authenticated screens
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.BG_CARD,
          borderTopWidth: 1,
          borderTopColor: COLORS.BORDER,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          ...SHADOWS.md, // Subtle lift
          elevation: 5, // Android shadow
        },
        tabBarActiveTintColor: COLORS.PRIMARY,
        tabBarInactiveTintColor: COLORS.TEXT_SECONDARY,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginBottom: 4,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";

          if (route.name === "Feed") {
            iconName = focused ? "newspaper" : "newspaper-outline";
          } else if (route.name === "Map") {
            iconName = focused ? "map" : "map-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Feed"
        component={DashboardScreen}
        options={{ title: "Activity" }}
      />
      <Tab.Screen
        name="Map"
        component={RealtimeMap}
        options={{ title: "Explore" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Account" }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const navigationRef = useRef(null);
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingSteps, setLoadingSteps] = useState([
    { label: "Initializing app", completed: false },
    { label: "Checking authentication", completed: false },
    { label: "Loading user profile", completed: false },
    { label: "Connecting services", completed: false },
    { label: "Ready", completed: false },
  ]);
  const { data: queryUser, refetch } = useUser();

  const updateStep = (index: number, completed: boolean) => {
    setLoadingSteps((prev) =>
      prev.map((step, i) => (i === index ? { ...step, completed } : step))
    );
  };

  useEffect(() => {
    const checkAuth = async () => {
      // Step 0: Initializing app
      updateStep(0, true);
      await new Promise((resolve) => setTimeout(resolve, 600)); // Small delay for visual

      // Step 1: Checking authentication
      updateStep(1, true);
      await new Promise((resolve) => setTimeout(resolve, 700)); // Delay before checking token
      const token = await AsyncStorage.getItem("accessToken");

      if (token && !user) {
        // Step 2: Loading user profile
        updateStep(2, true);
        await new Promise((resolve) => setTimeout(resolve, 800)); // Delay before fetching
        try {
          await refetch();
        } catch (error) {
          console.log("Token invalid, clearing auth");
          await AsyncStorage.removeItem("accessToken");
          await AsyncStorage.removeItem("refreshToken");
          useAuthStore.getState().setUser(null);
        }
      } else {
        // If no token or user already loaded, mark profile as completed
        updateStep(2, true);
        await new Promise((resolve) => setTimeout(resolve, 500)); // Delay for consistency
      }

      // Step 3: Connecting services
      updateStep(3, true);
      await new Promise((resolve) => setTimeout(resolve, 600)); // Delay for service connection
      // Socket connection will happen when user is synced

      // Step 4: Ready
      updateStep(4, true);
      await new Promise((resolve) => setTimeout(resolve, 800)); // Final delay

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Sync React Query user state with Zustand store
  React.useEffect(() => {
    if (queryUser && !user) {
      useAuthStore.getState().setUser(queryUser);
      // Connect socket when user is loaded
      connectSocket();
    }
  }, [queryUser, user]);

  if (isLoading) {
    return (
      <BootSequence
        steps={loadingSteps}
        onComplete={() => setIsLoading(false)}
      />
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        console.log("AppNavigator: Navigation container is ready");
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user?.id ? (
          <Stack.Screen name="MainTabs" component={TabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
