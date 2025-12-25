import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import useAuthStore from "../../store/authStore";
import AuthScreen from "../screens/AuthScreen";
import RealtimeMap from "../screens/RealtimeMap";
import { useUser } from "../hooks/auth";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user } = useAuthStore();
  const { data: queryUser, isLoading } = useUser();

  React.useEffect(() => {
    // If query has user, set in store
    if (queryUser && !user) {
      useAuthStore.getState().setUser(queryUser);
    }
  }, [queryUser, user]);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user && user.id ? (
          <Stack.Screen name="RealtimeMap" component={RealtimeMap} />
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
