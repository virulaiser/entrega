import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen"; // Importa tu pantalla de inicio de sesión
import RegisterScreen from "../screens/RegisterScreen"; // Importa tu pantalla de registro
import HomeScreen from "../screens/HomeScreen"; // Importa tu pantalla de inicio


const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
      <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="registrar" component={RegisterScreen} />
              <Stack.Screen name="Home" component={HomeScreen} />
          </Stack.Navigator>
      </NavigationContainer>
  );
}
