import { auth } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

console.log("app.js carregado");

//login

const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const btnLogin = document.getElementById("btnLogin");
const btnCadastro = document.getElementById("btnCadastro");
const btnGoogle = document.getElementById("btnGoogle");

if (btnLogin) {
    btnLogin.addEventListener("click", async () => {
        alert("Entrar clicado");

        const email = emailInput.value.trim();
        const senha = senhaInput.value.trim();

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, senha);

            console.log(userCredential.user);

            alert("Login feito com sucesso!");

            window.location.href = "./dashboard.html";

        } catch (error) {
            console.log(error);
            alert("Erro ao entrar: " + error.code);
        }
    });
}

if (btnCadastro) {
    btnCadastro.addEventListener("click", async () => {
        alert("Criar conta clicado");

        const email = emailInput.value.trim();
        const senha = senhaInput.value.trim();

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, senha);

            console.log(userCredential.user);

            alert("Conta criada com sucesso!");

            window.location.href = "./dashboard.html";

        } catch (error) {
            console.log(error);
            alert("Erro ao criar conta: " + error.code);
        }
    });
}

if (btnGoogle) {
    btnGoogle.addEventListener("click", async () => {
        alert("Google clicado");

        try {
            const provider = new GoogleAuthProvider();

            const userCredential = await signInWithPopup(auth, provider);

            console.log(userCredential.user);

            alert("Login Google feito com sucesso!");

            window.location.href = "./dashboard.html";

        } catch (error) {
            console.log(error);
            alert("Erro Google: " + error.code);
        }
    });
}

