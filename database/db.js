import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";

// La variable 'db' se declara aquí y se asignará una vez que la base de datos se abra asíncronamente.
let db = null;

/**
 * Abre o crea la base de datos SQLite de forma asíncrona.
 * Esta función debe ser llamada una única vez al inicio de la aplicación
 * o antes de cualquier otra operación de base de datos.
 */
export const initializeDatabase = async () => {
    try {
        if (Platform.OS === "web") {
            // Mock para entorno web. Expo SQLite no funciona completamente en web.
            db = {
                execAsync: async (sql, args) => {
                    console.warn(
                        "SQLite (web) mock: execAsync called. SQL:",
                        sql
                    );
                    return {
                        lastInsertRowId: 0,
                        changes: 0,
                        rows: { _array: [] },
                    };
                },
                runAsync: async (sql, args) => {
                    console.warn(
                        "SQLite (web) mock: runAsync called. SQL:",
                        sql
                    );
                    return { lastInsertRowId: 0, changes: 0 };
                },
                getAllAsync: async (sql, args) => {
                    console.warn(
                        "SQLite (web) mock: getAllAsync called. SQL:",
                        sql
                    );
                    return [];
                },
                getFirstAsync: async (sql, args) => {
                    console.warn(
                        "SQLite (web) mock: getFirstAsync called. SQL:",
                        sql
                    );
                    return undefined;
                },
                transaction: (callback) => {
                    const mockTx = {
                        executeSql: (sql, args, success) => {
                            console.warn(
                                "SQLite (web) mock: executeSql (transaction) called. SQL:",
                                sql
                            );
                            success && success({ rows: { _array: [] } });
                        },
                    };
                    callback(mockTx);
                },
            };
            console.log("📦 SQLite (web) mock inicializado.");
        } else {
            // Para nativo (iOS/Android), usa openDatabaseAsync
            db = await SQLite.openDatabaseAsync("products.db");
            console.log("📦 Conectado a la base de datos SQLite: products.db");
        }
    } catch (error) {
        console.error("❌ Error al abrir la base de datos:", error);
        throw error;
    }
};

/**
 * Función de utilidad interna para asegurar que la DB esté inicializada antes de cualquier operación.
 * Si 'db' es null, lanza un error porque 'initializeDatabase' debería haber sido llamado externamente.
 */
const ensureDbInitialized = () => {
    if (!db) {
        throw new Error(
            "Base de datos no inicializada. Asegúrate de llamar a 'initializeDatabase()' primero."
        );
    }
};

// --- Funciones exportadas que utilizan los nuevos métodos asíncronos de la instancia 'db' ---

/**
 * Inicializa la tabla 'products' si no existe.
 * Utiliza db.execAsync para sentencias DDL.
 */
export const initDB = async () => {
    try {
        ensureDbInitialized(); // Asegura que 'db' esté listo
        await db.execAsync(
            `CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY NOT NULL,
        articulo TEXT NOT NULL,
        cantidad INTEGER NOT NULL
      );`
        );
        console.log("✅ Tabla products inicializada o ya existente.");
    } catch (error) {
        console.error("❌ Error al inicializar la tabla products:", error);
        throw error;
    }
};

/**
 * Inserta un nuevo producto en la tabla 'products'.
 * Utiliza db.runAsync para sentencias INSERT.
 * @param {string} id - ID único del producto.
 * @param {string} articulo - Nombre del artículo.
 * @param {number} cantidad - Cantidad del artículo.
 */
export const insertProduct = async (id, articulo, cantidad) => {
    try {
        ensureDbInitialized(); // Asegura que 'db' esté listo
        await db.runAsync(
            "INSERT INTO products (id, articulo, cantidad) VALUES (?, ?, ?)",
            [id, articulo, cantidad]
        );
        console.log(`➕ Producto "${articulo}" insertado.`);
    } catch (error) {
        console.error(`❌ Error al insertar producto "${articulo}":`, error);
        throw error;
    }
};

/**
 * Obtiene todos los productos de la tabla 'products'.
 * Utiliza db.getAllAsync para sentencias SELECT que esperan múltiples resultados.
 * @returns {Array<Object>} Un array de objetos de productos.
 */
export const fetchProductsFromDB = async () => {
    try {
        ensureDbInitialized(); // Asegura que 'db' esté listo
        const result = await db.getAllAsync("SELECT * FROM products");
        console.log(`🔍 Se encontraron ${result.length} productos en la DB.`);
        return result; // getAllAsync ya devuelve el array de objetos directamente
    } catch (error) {
        console.error("❌ Error al obtener productos:", error);
        throw error;
    }
};

/**
 * Elimina todos los registros de la tabla 'products'.
 * Utiliza db.runAsync para sentencias DELETE.
 */
export const clearProductsTable = async () => {
    try {
        ensureDbInitialized(); // Asegura que 'db' esté listo
        await db.runAsync("DELETE FROM products");
        console.log("🗑️ Tabla products limpiada.");
    } catch (error) {
        console.error("❌ Error al limpiar la tabla products:", error);
        throw error;
    }
};
