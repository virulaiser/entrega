import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from 'firebase/firestore'; // <-- Importa Firestore
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'; // <--- Importa AsyncStorage

const firebaseConfig = {
    apiKey: "AIzaSyCMzSpwLryLvY2kNhyphBKJiYwnXQwlUHE",
    authDomain: "my-nacho.firebaseapp.com",
    databaseURL: "https://my-nacho-default-rtdb.firebaseio.com",
    projectId: "my-nacho",
    storageBucket: "my-nacho.firebasestorage.app",
    messagingSenderId: "968277708205",
    appId: "1:968277708205:web:dc4315383db78cf7e66524",
    measurementId: "G-6VL4MVKBXR",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage), // <--- Aquí configuras la persistencia
});
if(auth !== null) {
    console.log("Firebase Auth initialized successfully");
};
const db = getFirestore(app); // <-- Inicializa Firestore

export { auth, db, collection, addDoc }; // <-- Exporta 'db' y las funciones de Firestore



