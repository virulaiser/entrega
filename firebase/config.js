import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";


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
const auth = getAuth(app);
if(auth !== null) {
    console.log("Firebase Auth initialized successfully");
};

export { auth };
