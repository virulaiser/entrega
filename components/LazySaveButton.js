// components/LazySaveButton.js
import React, { useState } from "react";
import {
    Button,
    View,
    Text,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db, collection, addDoc } from "../firebase/config"; // Importa 'db' y funciones de Firestore
import { getAuth } from "firebase/auth"; // Para verificar si hay usuario logueado, útil para Firestore rules

const UNUPLOADED_ITEMS_KEY = "@unuploaded_items";

const LazySaveButton = () => {
    const [loading, setLoading] = useState(false);
    const auth = getAuth(); // Obtener la instancia de auth para verificar el usuario actual

    // Función para guardar un artículo localmente
    const saveLocally = async (item) => {
        try {
            const storedItems = await AsyncStorage.getItem(
                UNUPLOADED_ITEMS_KEY
            );
            const items = storedItems ? JSON.parse(storedItems) : [];
            items.push({ ...item, id: Date.now().toString(), uploaded: false }); // Añade un ID local y estado
            await AsyncStorage.setItem(
                UNUPLOADED_ITEMS_KEY,
                JSON.stringify(items)
            );
            return true;
        } catch (e) {
            console.error("Error saving item locally:", e);
            Alert.alert("Error", "No se pudo guardar el artículo localmente.");
            return false;
        }
    };

    // Función para subir un artículo a Firestore
    const uploadToFirestore = async (item) => {
        try {
            if (!auth.currentUser) {
                console.warn(
                    "No user logged in. Item will not be uploaded to Firestore."
                );
                // Si necesitas que un usuario esté logueado para subir, podrías retornar false aquí
                // o reintentar cuando el usuario se loguee.
                return false;
            }
            const docRef = await addDoc(collection(db, "articulos"), {
                articulo: item.articulo,
                cantidad: item.cantidad,
                timestamp: new Date(), // Agrega un timestamp para ordenar
                userId: auth.currentUser.uid, // Relaciona el artículo con el usuario
            });
            console.log("Document written with ID: ", docRef.id);
            return true;
        } catch (e) {
            console.error("Error uploading item to Firestore:", e);
            // Podrías verificar e.code para errores específicos de conexión
            return false;
        }
    };

    // Función para sincronizar todos los artículos pendientes
    const syncItems = async () => {
        setLoading(true);
        try {
            const storedItems = await AsyncStorage.getItem(
                UNUPLOADED_ITEMS_KEY
            );
            let items = storedItems ? JSON.parse(storedItems) : [];
            let updatedItems = [...items]; // Copia para modificar

            for (let i = 0; i < updatedItems.length; i++) {
                if (!updatedItems[i].uploaded) {
                    const success = await uploadToFirestore(updatedItems[i]);
                    if (success) {
                        updatedItems[i].uploaded = true; // Marca como subido
                    } else {
                        // Si falla la subida, dejarlo como no subido y reintentar más tarde
                        console.warn(
                            `Failed to upload item ${updatedItems[i].id}. Retrying later.`
                        );
                    }
                }
            }

            // Filtra los que ya se subieron exitosamente
            const remainingItems = updatedItems.filter(
                (item) => !item.uploaded
            );
            await AsyncStorage.setItem(
                UNUPLOADED_ITEMS_KEY,
                JSON.stringify(remainingItems)
            );

            if (remainingItems.length === 0) {
                console.log("All pending items synced successfully.");
                Alert.alert(
                    "Sincronización completa",
                    "Todos los artículos pendientes han sido subidos a Firestore."
                );
            } else {
                console.log(
                    `${remainingItems.length} items still pending upload.`
                );
                Alert.alert(
                    "Sincronización parcial",
                    `Se subieron algunos artículos. ${remainingItems.length} pendientes.`
                );
            }
        } catch (e) {
            console.error("Error during sync:", e);
            Alert.alert(
                "Error de sincronización",
                "Hubo un problema al intentar sincronizar los artículos."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleAddArticle = async () => {
        const newArticle = { articulo: "licuadora", cantidad: 1 };

        // 1. Guardar localmente inmediatamente
        const locallySaved = await saveLocally(newArticle);
        if (locallySaved) {
            Alert.alert(
                "Artículo guardado",
                "El artículo se guardó localmente. Sincronizando..."
            );
            // 2. Iniciar la sincronización en segundo plano
            syncItems(); // No esperamos aquí, se ejecuta de forma asíncrona
        }
    };

    return (
        <View style={styles.container}>
            <Button
                title={
                    loading
                        ? "Sincronizando..."
                        : "Agregar Licuadora (Lazy Save)"
                }
                onPress={handleAddArticle}
                disabled={loading}
            />
            {loading && (
                <ActivityIndicator
                    size="small"
                    color="#0000ff"
                    style={styles.indicator}
                />
            )}
            <Text style={styles.infoText}>
                Al presionar, guarda localmente y luego intenta subir a
                Firestore.
            </Text>
            <Button
                title="Sincronizar Ahora"
                onPress={syncItems}
                disabled={loading}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        marginTop: 20,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        backgroundColor: "#fff",
        alignItems: "center",
    },
    infoText: {
        marginTop: 10,
        marginBottom: 15,
        textAlign: "center",
        color: "#666",
    },
    indicator: {
        marginTop: 10,
    },
});

export default LazySaveButton;
