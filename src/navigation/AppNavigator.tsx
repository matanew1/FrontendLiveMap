import React, { useRef, useState, useEffect } from "react";
import { View, StyleSheet, Platform } from "react-native";
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
import { COLORS, SHADOWS, SPACING } from "../constants/theme";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: "rgba(255, 255, 255, 0.98)",
          borderTopWidth: 0,
          height: Platform.OS === "ios" ? 88 : 70,
          paddingBottom: Platform.OS === "ios" ? 30 : 12,
          paddingTop: 12,
          marginHorizontal: SPACING.m,
          marginBottom: 20,
          borderRadius: 32,
          position: "absolute",
          borderWidth: 1,
          borderColor: "rgba(0,0,0,0.04)",
          ...SHADOWS.lg,
        },
        tabBarActiveTintColor: COLORS.PRIMARY,
        tabBarInactiveTintColor: COLORS.TEXT_TERTIARY,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginBottom: 0,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";

          if (route.name === "Feed")
            iconName = focused ? "layers" : "layers-outline";
          else if (route.name === "Map")
            iconName = focused ? "map" : "map-outline";
          else if (route.name === "Profile")
            iconName = focused ? "person" : "person-outline";

          return (
            <View
              style={[styles.tabIconContainer, focused && styles.tabIconActive]}
            >
              <Ionicons name={iconName} size={22} color={color} />
            </View>
          );
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
    { label: "Initializing CyDog", completed: false },
    { label: "Securing connection", completed: false },
    { label: "Fetching profile", completed: false },
    { label: "Connecting radar", completed: false },
    { label: "Welcome back", completed: false },
  ]);
  const { data: queryUser, refetch } = useUser();

  const updateStep = (index: number, completed: boolean) => {
    setLoadingSteps((prev) =>
      prev.map((step, i) => (i === index ? { ...step, completed } : step))
    );
  };

  useEffect(() => {
    const checkAuth = async () => {
      updateStep(0, true);
      await new Promise((r) => setTimeout(r, 400));

      updateStep(1, true);
      const token = await AsyncStorage.getItem("accessToken");

      if (token && !user) {
        updateStep(2, true);
        try {
          await refetch();
        } catch (error) {
          await AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
          useAuthStore.getState().setUser(null);
        }
      } else {
        updateStep(2, true);
      }

      updateStep(3, true);
      updateStep(4, true);
      await new Promise((r) => setTimeout(r, 600));
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  React.useEffect(() => {
    if (queryUser && !user) {
      useAuthStore.getState().setUser(queryUser);
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
    <NavigationContainer ref={navigationRef}>
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

const styles = StyleSheet.create({
  tabIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tabIconActive: {
    backgroundColor: COLORS.PRIMARY_LIGHT,
  },
});

export default AppNavigator;
