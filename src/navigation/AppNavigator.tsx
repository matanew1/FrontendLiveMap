import React, { useEffect, useRef, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Alert } from "react-native";
import * as Linking from "expo-linking";
import { supabase } from "../lib/supabase";
import useAuthStore from "../../store/authStore";
import AuthScreen from "../screens/AuthScreen";
import ProfileScreen from "../screens/ProfileScreen";
import RealtimeMap from "../screens/RealtimeMap";
import DashboardScreen from "../screens/DashboardScreen";
import { useUser } from "../hooks/auth";
import { COLORS, SHADOWS } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator for authenticated screens
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.BG_DARK,
          borderTopColor: COLORS.BORDER_LIGHT,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarActiveTintColor: COLORS.CYAN,
        tabBarInactiveTintColor: COLORS.TEXT_SECONDARY,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === "Map") {
            iconName = focused ? "map" : "map-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Map"
        component={RealtimeMap}
        options={{ title: "Map" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const navigationRef = useRef(null);
  const { user } = useAuthStore();
  const { data: queryUser } = useUser();

  React.useEffect(() => {
    if (queryUser && !user) {
      useAuthStore.getState().setUser(queryUser);
    }
  }, [queryUser, user]);

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
