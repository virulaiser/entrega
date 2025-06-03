import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { auth } from "../firebase/config";
import LazySaveButton from "./LazySaveButton"; // <-- Importa el nuevo componente

const HomeScreen = ({ navigation }) => {
    const handleLogout = async () => {
        try {
            await auth.signOut();
            // Opcional: Navegar a la pantalla de login después de cerrar sesión
            // navigation.replace('Login'); // Usar replace para que no puedan volver atrás
        } catch (error) {
            console.error("Error al cerrar sesión:", error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>¡Bienvenido!</Text>
            {auth.currentUser && (
                <Text style={styles.email}>
                    Estás logueado como: {auth.currentUser.email}
                </Text>
            )}
            {/* Aquí agregamos el botón de Lazy Save */}
            <LazySaveButton />
            <View style={styles.spacer} /> {/* Espaciador */}
            <Button title="Cerrar Sesión" onPress={handleLogout} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#e0f7fa",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#00796b",
    },
    email: {
        fontSize: 16,
        marginBottom: 30,
        color: "#004d40",
    },
    spacer: {
        height: 30, // Espacio entre el botón de lazy save y el de cerrar sesión
    },
});

export default HomeScreen;
