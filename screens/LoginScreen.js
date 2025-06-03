import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert} from "react-native";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase/config"; // Importa 'auth' desde tu archivo de configuración


const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            Alert.alert("Éxito", "Sesión iniciada correctamente");
           console.log('Valor de auth de loginScreen:', auth.currentUser); // <--- AGREGAR ESTO
            navigation.navigate('Home');
        } catch (error) {
            console.log("Error al iniciar sesión", error.message);
        }
    };

    const handleSignUp = async () => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            Alert.alert("Éxito", "Usuario registrado correctamente");
        } catch (error) {
            Alert.alert("Error al registrar usuario", error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Iniciar Sesión / Registrarse</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Button title="Iniciar Sesión" onPress={handleLogin} />
            <View style={styles.spacer} />
            <Button title="Registrarse" onPress={handleSignUp} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 20,
        backgroundColor: "#f5f5f5",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 30,
        textAlign: "center",
    },
    input: {
        height: 50,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 15,
        backgroundColor: "#fff",
    },
    spacer: {
        height: 10,
    },
});

export default LoginScreen;
