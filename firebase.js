console.log("firebase.js carregou");

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCyYhxR-sSk2ZNVj7sNohQB9GLqqNT1D7Y",
    authDomain: "lista-compartilhada-1ebd7.firebaseapp.com",
    projectId: "lista-compartilhada-1ebd7",
    storageBucket: "lista-compartilhada-1ebd7.firebasestorage.app",
    messagingSenderId: "1072895865640",
    appId: "1:1072895865640:web:eb106eac0e268247f6561d"
   
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
