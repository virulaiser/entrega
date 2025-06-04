import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Button,
    ActivityIndicator,
    StyleSheet,
} from "react-native";
import { auth } from "../firebase/config";
import * as Location from "expo-location"; // Importa Expo Location para obtener la ubicación
import MapView, { Marker } from "react-native-maps"; // Importa MapView y Marker de react-native-maps
/* import MapsConmponents from "../components/MapsConmponents"; */ // Asegúrate de que este componente exista y esté configurado correctamente

const HomeScreen = () => {
    const [location, setLocation] = useState(null); //guarda ubicación
    const [errorMsg, setErrorMsg] = useState(null); //guarda mensaje de error

    const getLocation = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setErrorMsg("Permiso de ubicación denegado");
                return;
            }
            let currentLocation = await Location.getCurrentPositionAsync({});

            setLocation(currentLocation.coords); // Guarda la ubicación actual
        } catch (error) {
            console.error("Error al obtener la ubicación:", error);
            setErrorMsg("Error al obtener la ubicación");
        }
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
        } catch (error) {
            console.error("Error al cerrar sesión:", error.message);
        }
    };

    if (errorMsg) {
        return (
            <View style={styles.container}>
                <Text style={styles.error}>{errorMsg}</Text>
                <Button title="reintentar" onPress={getLocation()} />
            </View>
        );
    }

    useEffect(() => {
        getLocation(); // Llama a la función para obtener la ubicación al montar el componente
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>¡Bienvenido!</Text>
            {auth.currentUser && (
                <Text style={styles.email}>
                    Estás logueado como: {auth.currentUser.email}
                </Text>
            )}
            <Button title="Cerrar Sesión" onPress={handleLogout} />

            <Text style={styles.title}>¡Bienvenido!</Text>
           {/*  <MapsConmponents /> */}
            {auth.currentUser && (
                <Text style={styles.email}>
                    Estás logueado como: {auth.currentUser.email}
                </Text>
            )}
            {location ? (
                <MapView
                    style={{ width: "100%", height: 300 }}
                    initialRegion={{
                        latitude: location.latitude,
                        longitude: location.longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                    showsUserLocation={true} // Muestra la ubicación del usuario
                    showsMyLocationButton={true} // Muestra el botón para centrar en la ubicación del usuario
                >
                    <Marker
                        coordinate={{
                            latitude: location.latitude,
                            longitude: location.longitude,
                        }}
                        title="Tu ubicación"
                    />
                </MapView>
            ) : (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text>Cargando ubicación...</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
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
