import React, { useState, useEffect, useCallback } from "react";
import {
    FlatList,
    Text,
    View,
    StyleSheet,
    SafeAreaView, // Importamos SafeAreaView
    ActivityIndicator,
    Alert,
    Button,
    Platform, // Importamos Platform para estilos específicos
} from "react-native";
import { faker } from "@faker-js/faker";

// Importamos las funciones de la base de datos
import {
    initializeDatabase,
    initDB,
    insertProduct,
    fetchProductsFromDB,
    clearProductsTable,
} from "../database/db"; // ¡Asegúrate de que esta ruta sea correcta!

// --- Componente individual para cada ítem de la lista ---
const ProductListItem = React.memo(({ item }) => {
    return (
        <View style={styles.itemContainer}>
            <Text style={styles.itemTitle}>{item.articulo}</Text>
            <Text style={styles.itemQuantity}>Cantidad: {item.cantidad}</Text>
        </View>
    );
});

// --- Componente principal de la lista optimizada ---
function OptimizedProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const generateSingleMockProduct = () => ({
        id: faker.database.mongodbObjectId(),
        articulo: faker.commerce.productName(),
        cantidad: faker.number.int({ min: 1, max: 100 }),
    });

    // --- useEffect: Inicialización y Carga de Datos desde SQLite ---
    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);

                await initializeDatabase(); // Aseguramos que la DB esté abierta y lista
                await initDB(); // Luego, inicializar la tabla (crearla si no existe)

                const storedProducts = await fetchProductsFromDB();

                if (storedProducts.length > 0) {
                    setProducts(storedProducts);
                    Alert.alert(
                        "Datos cargados",
                        `Se encontraron ${storedProducts.length} productos guardados.`
                    );
                } else {
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
                setError(
                    "Error crítico al iniciar la aplicación o cargar productos."
                );
                Alert.alert(
                    "Error crítico",
                    "No se pudo inicializar la base de datos o cargar productos."
                );
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, []);

    // --- Funciones para interactuar con la Base de Datos SQLite ---
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
            setProducts(newProducts);
            Alert.alert(
                "Generado y Guardado",
                `Se generaron y guardaron ${count} productos en la base de datos.`
            );
        } catch (err) {
            console.error(
                "Error al generar y guardar productos iniciales:",
                err
            );
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
            setProducts([]);
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

    // --- Funciones de renderizado de FlatList (optimizadas con useCallback) ---
    const renderItem = useCallback(
        ({ item }) => <ProductListItem item={item} />,
        []
    );
    const keyExtractor = useCallback((item) => item.id, []);

    // --- Renderizado Condicional (Carga, Error o Lista) ---
    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4287f5" />{" "}
                {/* Color azul */}
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
                    onPress={() => {
                        setError(null);
                        setLoading(true);
                        // Volver a cargar los productos
                        fetchProductsFromDB()
                            .then((storedProducts) => {
                                setProducts(storedProducts);
                                setLoading(false);
                            })
                            .catch((err) => {
                                console.error("Error al recargar productos:", err);
                                setError("Error al recargar productos.");
                                setLoading(false);
                            });
                    }}
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Inventario de Artículos</Text>

            <View style={styles.buttonContainer}>
                <View style={styles.buttonWrapper}>
                    <Button
                        title="Añadir Producto"
                        onPress={handleGenerateAndSaveNewProduct}
                        color={Platform.OS === "ios" ? "#007AFF" : "#4287f5"}
                    />
                </View>
                <View style={styles.buttonWrapper}>
                    <Button
                        title="Borrar Todos"
                        onPress={handleClearProducts}
                        color={Platform.OS === "ios" ? "#FF3B30" : "#d9534f"}
                    />
                </View>
            </View>

            <FlatList
                data={products}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                initialNumToRender={10}
                maxToRenderPerBatch={5}
                windowSize={21}
                contentContainerStyle={styles.listContentContainer}
                ListEmptyComponent={
                    <View style={styles.emptyListContainer}>
                        <Text style={styles.emptyListText}>
                            ¡Parece que no hay productos aquí!
                        </Text>
                        <Text style={styles.emptyListSubText}>
                            Usa el botón "Añadir Producto" para empezar.
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

// --- Estilos ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f0f2f5", // Un gris azulado claro
        paddingTop: Platform.OS === "android" ? 25 : 0, // Ajuste para Android StatusBar
    },
    header: {
        fontSize: 28, // Tamaño de fuente más grande
        fontWeight: "bold",
        textAlign: "center",
        marginVertical: 25, // Más espacio vertical
        color: "#2c3e50", // Azul oscuro casi negro
        textShadowColor: "rgba(0, 0, 0, 0.1)", // Sombra sutil al texto
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 20, // Más espacio debajo de los botones
        paddingHorizontal: 15,
    },
    buttonWrapper: {
        flex: 1, // Para que los botones ocupen el mismo ancho
        marginHorizontal: 5, // Espacio entre botones
        borderRadius: 8, // Bordes más redondeados
        overflow: "hidden", // Asegura que el color del botón respete el borderRadius
    },
    listContentContainer: {
        paddingHorizontal: 10, // Espacio horizontal para la lista
        paddingBottom: 20, // Espacio al final de la lista
    },
    itemContainer: {
        backgroundColor: "#ffffff", // Fondo blanco para los ítems
        padding: 18, // Relleno aumentado
        marginVertical: 7, // Menos espacio vertical entre ítems para un look más compacto
        marginHorizontal: 5,
        borderRadius: 12, // Bordes más redondeados
        shadowColor: "#000", // Sombra más pronunciada
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15, // Opacidad de la sombra
        shadowRadius: 6, // Radio de la sombra
        elevation: 5, // Elevación para Android
        flexDirection: "row", // Para organizar el título y la cantidad
        justifyContent: "space-between", // Espacio entre el título y la cantidad
        alignItems: "center", // Centrado verticalmente
    },
    itemTitle: {
        fontSize: 18,
        fontWeight: "600", // Un poco más audaz
        color: "#34495e", // Texto más oscuro
        flexShrink: 1, // Permite que el texto se encoja si es muy largo
    },
    itemQuantity: {
        fontSize: 16,
        fontWeight: "normal",
        color: "#7f8c8d", // Un gris más suave
        marginLeft: 10, // Espacio entre el título y la cantidad
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f2f5",
    },
    loadingText: {
        marginTop: 15,
        fontSize: 19,
        color: "#555",
        fontWeight: "500",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fde7e7", // Rojo muy claro
    },
    errorText: {
        fontSize: 18,
        color: "#c0392b", // Rojo más oscuro
        textAlign: "center",
        marginHorizontal: 25,
        marginBottom: 20,
        fontWeight: "500",
    },
    emptyListContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 50,
        paddingHorizontal: 20,
    },
    emptyListText: {
        textAlign: "center",
        fontSize: 18,
        color: "#7f8c8d",
        marginBottom: 10,
        fontWeight: "500",
    },
    emptyListSubText: {
        textAlign: "center",
        fontSize: 15,
        color: "#95a5a6",
    },
});

export default OptimizedProductList;
