import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ActivityIndicator,
    Button,
    StyleSheet,
} from "react-native";
import LoginScreen from "../screens/LoginScreen"; // Importa tu pantalla de inicio de sesión
import { auth } from "../firebase/config"; // Importa auth para el listener
import { onAuthStateChanged } from "firebase/auth";
/* import MapsConmponents from "..components/MapsConmponents"; */ // Asegúrate de que este componente exista y esté configurado correctamente
/* import HomeScreen from "../screens/HomeScreen"; */
import Opitimi from "../components/Optimi"; // Importa tu componente de Optimi
// Asegúrate de que este componente exista y esté configurado correctamente
export default function AppIncome() {
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState(null);

    // Handle user state changes
    function onAuthStateChangedHandler(user) {
        setUser(user);
        if (initializing) setInitializing(false);
    }

    useEffect(() => {
        const subscriber = onAuthStateChanged(auth, onAuthStateChangedHandler);
        return subscriber; // unsubscribe on unmount
        
    
        
    }, []);

    if (initializing) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Cargando...</Text>
            </View>
        );
    }

    if (!user) {
        return <LoginScreen />;
    }else{
       /*  return <HomeScreen user={user} />; */
            return( <Opitimi />)
    }

    return (
        <View style={styles.container}>
            <Text style={styles.loggedInText}>Bienvenido, {user.email}!</Text>
           <MapsConmponents /> 
            <Button title="Cerrar Sesión" onPress={() => auth.signOut()} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
    },
    loggedInText: {
        fontSize: 20,
        marginBottom: 20,
    },
});
