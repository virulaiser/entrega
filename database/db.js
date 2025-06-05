import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";

// Función para abrir o crear la base de datos
const openDatabase = () => {
    if (Platform.OS === "web") {
        // Esto es un mock para web; SQLite no funciona igual en navegador
        return {
            transaction: (callback) => {
                const mockTx = {
                    executeSql: (sql, args, success, error) => {
                        console.warn(
                            "SQLite (web) mock: executeSql called. SQL:",
                            sql
                        );
                        success && success({ rows: { _array: [] } });
                    },
                };
                callback(mockTx);
            },
        };
    }
    const db = SQLite.openDatabase("products.db");
    return db;
};

const db = openDatabase();

/**
 * Función auxiliar para ejecutar una sentencia SQL dentro de una transacción.
 * Retorna una Promesa que resuelve con los resultados de la consulta.
 */
const executeSql = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(
                sql,
                params,
                (_, result) => resolve(result),
                (_, error) => reject(error)
            );
        });
    });
};

// --- Funciones exportadas (ahora usan await executeSql) ---

/**
 * Inicializa la tabla 'products' si no existe.
 */
export const initDB = async () => {
    try {
        await executeSql(
            `CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY NOT NULL,
        articulo TEXT NOT NULL,
        cantidad INTEGER NOT NULL
      );`
        );
        console.log("Tabla products inicializada o ya existente.");
    } catch (error) {
        console.error("Error al inicializar la tabla products:", error);
        throw error; // Re-lanza el error para que sea manejado por el llamador
    }
};

/**
 * Inserta un nuevo producto en la tabla 'products'.
 * @param {string} id - ID único del producto.
 * @param {string} articulo - Nombre del artículo.
 * @param {number} cantidad - Cantidad del artículo.
 */
export const insertProduct = async (id, articulo, cantidad) => {
    try {
        await executeSql(
            "INSERT INTO products (id, articulo, cantidad) VALUES (?, ?, ?)",
            [id, articulo, cantidad]
        );
        console.log(`Producto "${articulo}" insertado.`);
    } catch (error) {
        console.error(`Error al insertar producto "${articulo}":`, error);
        throw error;
    }
};

/**
 * Obtiene todos los productos de la tabla 'products'.
 * @returns {Array<Object>} Un array de objetos de productos.
 */
export const fetchProductsFromDB = async () => {
    try {
        const result = await executeSql("SELECT * FROM products");
        // SQLite devuelve los resultados en 'rows._array'
        return result.rows._array;
    } catch (error) {
        console.error("Error al obtener productos:", error);
        throw error;
    }
};

/**
 * Elimina todos los registros de la tabla 'products'.
 */
export const clearProductsTable = async () => {
    try {
        await executeSql("DELETE FROM products");
        console.log("Tabla products limpiada.");
    } catch (error) {
        console.error("Error al limpiar la tabla products:", error);
        throw error;
    }
};
