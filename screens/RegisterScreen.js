// Importa React y el hook useState para manejar estados locales
import React, { useState } from "react";

// Importa los componentes necesarios de React Native
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";

// Importa el hook de RTK Query para el registro
import { useSignupMutation } from "../features/auth/authApi";

// Importa el dispatch de Redux
import { useDispatch } from "react-redux";

// Importa la acción para guardar el usuario en el estado global
import { setUser } from "../features/auth/authSlice";

export default function RegisterScreen({ navigation }) {
  // Estados locales para guardar email y contraseña
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Hook de RTK Query para realizar el registro
  const [signup, { isLoading }] = useSignupMutation();

  // Hook para despachar acciones a Redux
  const dispatch = useDispatch();

  // Función que se ejecuta cuando el usuario toca "Registrar"
  const handleSignup = async () => {
    try {
      const result = await signup({ email, password });

      if (result.data) {
        // Si el registro fue exitoso, guarda el usuario y redirige a Home
        dispatch(setUser(result.data));
        navigation.navigate("Home");
      } else {
        // Si hubo error, lo mostramos
        console.log(result.error);
        Alert.alert("Error", "No se pudo registrar. Intenta con otro email.");
      }
    } catch (error) {
      Alert.alert(
        "Error inesperado",
        error.message || "Inténtalo de nuevo más tarde."
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      <TextInput
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <Button
        title={isLoading ? "Registrando..." : "Registrar"}
        onPress={handleSignup}
        disabled={isLoading}
      />

      <Button
        title="Ya tengo cuenta"
        onPress={() => navigation.navigate("Login")}
      />
    </View>
  );
}

// Estilos básicos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
    padding: 10,
    borderRadius: 5,
  },
});
