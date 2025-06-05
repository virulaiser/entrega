import React, { useState, useEffect, useCallback } from "react";
import {
    FlatList,
    Text,
    View,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    Button, // Para el botón de "Generar y Guardar"
} from "react-native";
import { faker } from "@faker-js/faker";

// Importamos las funciones de la base de datos
import {
    initDB,
    insertProduct,
    fetchProductsFromDB,
    clearProductsTable,
} from "../database/db"; // Asegúrate de que esta ruta sea correcta

// Componente individual para cada ítem de la lista (sin cambios)
const ProductListItem = React.memo(({ item }) => {
    return (
        <View style={styles.itemContainer}>
            <Text style={styles.itemText}>Artículo: {item.articulo}</Text>
            <Text style={styles.itemText}>Cantidad: {item.cantidad}</Text>
        </View>
    );
});

function OptimizedProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Genera un solo producto mock para insertar
    const generateSingleMockProduct = () => ({
        id: faker.database.mongodbObjectId(),
        articulo: faker.commerce.productName(),
        cantidad: faker.number.int({ min: 1, max: 100 }),
    });

    // --- Lógica de carga e inicialización de la DB ---
    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                // 1. Inicializar la base de datos (crear la tabla si no existe)
                await initDB();

                // 2. Intentar cargar productos existentes
                const storedProducts = await fetchProductsFromDB();
                if (storedProducts.length > 0) {
                    setProducts(storedProducts);
                    Alert.alert(
                        "Datos cargados",
                        `Se encontraron ${storedProducts.length} productos guardados.`
                    );
                } else {
                    // Si no hay productos, generar y guardar 20 productos iniciales
                    Alert.alert(
                        "Base de datos vacía",
                        "Generando 20 nuevos productos..."
                    );
                    await generateAndSaveInitialProducts(20);
                }
            } catch (err) {
                console.error(
                    "Error al cargar/inicializar DB o productos:",
                    err
                );
                setError("Error al iniciar la aplicación o cargar productos.");
                Alert.alert(
                    "Error crítico",
                    "No se pudo inicializar la base de datos o cargar productos."
                );
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, []); // Se ejecuta solo una vez al montar el componente

    // --- Funciones para interactuar con la DB ---

    const generateAndSaveInitialProducts = async (count) => {
        try {
            const newProducts = Array.from(
                { length: count },
                generateSingleMockProduct
            );
            for (const product of newProducts) {
                await insertProduct(
                    product.id,
                    product.articulo,
                    product.cantidad
                );
            }
            setProducts(newProducts); // Actualizar el estado con los nuevos productos
            Alert.alert(
                "Generado y Guardado",
                `Se generaron y guardaron ${count} productos en la base de datos.`
            );
        } catch (err) {
            console.error("Error al generar y guardar productos:", err);
            setError("Error al generar y guardar productos iniciales.");
            Alert.alert(
                "Error",
                "No se pudieron generar y guardar los productos iniciales."
            );
        }
    };

    const handleClearProducts = async () => {
        try {
            setLoading(true);
            await clearProductsTable();
            setProducts([]); // Vaciar la lista en el estado
            Alert.alert(
                "Borrado",
                "Todos los productos han sido eliminados de la base de datos."
            );
        } catch (err) {
            console.error("Error al borrar productos:", err);
            setError("Error al borrar productos.");
            Alert.alert("Error", "No se pudieron borrar los productos.");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateAndSaveNewProduct = async () => {
        try {
            setLoading(true);
            const newProduct = generateSingleMockProduct();
            await insertProduct(
                newProduct.id,
                newProduct.articulo,
                newProduct.cantidad
            );
            // Actualizar la lista en el estado para reflejar el nuevo producto
            setProducts((prevProducts) => [...prevProducts, newProduct]);
            Alert.alert(
                "Producto Añadido",
                `"${newProduct.articulo}" añadido y guardado.`
            );
        } catch (err) {
            console.error("Error al añadir un nuevo producto:", err);
            setError("Error al añadir un nuevo producto.");
            Alert.alert("Error", "No se pudo añadir el nuevo producto.");
        } finally {
            setLoading(false);
        }
    };

    // --- Funciones de renderizado de FlatList (sin cambios) ---
    const renderItem = useCallback(
        ({ item }) => <ProductListItem item={item} />,
        []
    );
    const keyExtractor = useCallback((item) => item.id, []);

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loadingText}>
                    Cargando datos (SQLite)...
                </Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <Button
                    title="Intentar de nuevo"
                    onPress={() => console.log("Implementar reintento")}
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Inventario de Artículos (SQLite)</Text>

            <View style={styles.buttonContainer}>
                <Button
                    title="Añadir Nuevo Producto"
                    onPress={handleGenerateAndSaveNewProduct}
                />
                <Button
                    title="Borrar Todos"
                    onPress={handleClearProducts}
                    color="red"
                />
            </View>

            <FlatList
                data={products}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                initialNumToRender={10}
                maxToRenderPerBatch={5}
                windowSize={21}
                ListEmptyComponent={
                    <Text style={styles.emptyListText}>
                        No hay artículos para mostrar. Genera algunos.
                    </Text>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f0f0f0",
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginVertical: 20,
        color: "#333",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    itemContainer: {
        backgroundColor: "#fff",
        padding: 15,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    itemText: {
        fontSize: 16,
        color: "#555",
        marginBottom: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
    },
    loadingText: {
        marginTop: 10,
        fontSize: 18,
        color: "#666",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ffe6e6",
    },
    errorText: {
        fontSize: 18,
        color: "#cc0000",
        textAlign: "center",
        marginHorizontal: 20,
    },
    emptyListText: {
        textAlign: "center",
        marginTop: 50,
        fontSize: 16,
        color: "#999",
    },
});

export default OptimizedProductList;
