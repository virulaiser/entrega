import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { auth } from "../firebase/config";

const HomeScreen = () => {
    const handleLogout = async () => {
        try {
            await auth.signOut();
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
});

export default HomeScreen;
