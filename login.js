import { auth, db } from "./firebase.js";

import {
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithRedirect,
    getRedirectResult,
    GoogleAuthProvider,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const btnLogin = document.getElementById("btnLogin");
const btnCadastro = document.getElementById("btnCadastro");
const btnGoogle = document.getElementById("btnGoogle");

async function salvarUsuario(user) {
    await setDoc(
        doc(db, "users", user.uid),
        {
            uid: user.uid,
            email: user.email,
            atualizadoEm: Date.now()
        },
        { merge: true }
    );
}

function mostrarErro(error) {
    console.error(error);
    alert("Erro: " + error.code);
}

/* Trata retorno do Google */
getRedirectResult(auth)
    .then(async (result) => {
        if (result && result.user) {
            await salvarUsuario(result.user);
            sessionStorage.removeItem("loginGooglePendente");
            window.location.replace("dashboard.html");
        }
    })
    .catch((error) => {
        mostrarErro(error);
    });

/* Só redireciona automático se veio do Google */
onAuthStateChanged(auth, async (user) => {
    const loginGooglePendente = sessionStorage.getItem("loginGooglePendente");

    if (user && loginGooglePendente === "sim") {
        await salvarUsuario(user);
        sessionStorage.removeItem("loginGooglePendente");
        window.location.replace("dashboard.html");
    }
});

btnLogin.addEventListener("click", async () => {
    const email = emailInput.value.trim().toLowerCase();
    const senha = senhaInput.value.trim();

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, senha);
        await salvarUsuario(userCredential.user);
        window.location.replace("dashboard.html");
    } catch (error) {
        mostrarErro(error);
    }
});

btnCadastro.addEventListener("click", async () => {
    const email = emailInput.value.trim().toLowerCase();
    const senha = senhaInput.value.trim();

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        await salvarUsuario(userCredential.user);
        window.location.replace("dashboard.html");
    } catch (error) {
        mostrarErro(error);
    }
});

btnGoogle.addEventListener("click", async () => {
    try {
        const provider = new GoogleAuthProvider();

        provider.setCustomParameters({
            prompt: "select_account"
        });

        sessionStorage.setItem("loginGooglePendente", "sim");

        await signInWithRedirect(auth, provider);

    } catch (error) {
        mostrarErro(error);
    }
});