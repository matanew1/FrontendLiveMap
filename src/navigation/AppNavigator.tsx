import React, { useEffect, useRef, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
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

const Stack = createStackNavigator();

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
          <Stack.Screen name="RealtimeMap" component={RealtimeMap} />
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
