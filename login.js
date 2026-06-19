import { auth, db } from "./firebase.js";

import {
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

console.log("login.js carregou");

const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const btnLogin = document.getElementById("btnLogin");
const btnCadastro = document.getElementById("btnCadastro");
const mensagem = document.getElementById("mensagem");

function mostrarMensagem(texto) {
    if (mensagem) {
        mensagem.textContent = texto;
    }
}

function bloquearBotoes(bloquear) {
    if (btnLogin) btnLogin.disabled = bloquear;
    if (btnCadastro) btnCadastro.disabled = bloquear;
}

function irParaDashboard() {
    window.location.href = "dashboard.html";
}

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
    console.error("ERRO COMPLETO:", error);
    console.error("CÓDIGO:", error.code);
    console.error("MENSAGEM:", error.message);

    mostrarMensagem("");
    bloquearBotoes(false);

    if (error.code === "auth/invalid-email") {
        alert("Email inválido. Verifique se digitou corretamente.");
        return;
    }

    if (error.code === "auth/missing-password") {
        alert("Digite uma senha.");
        return;
    }

    if (error.code === "auth/weak-password") {
        alert("A senha precisa ter pelo menos 6 caracteres.");
        return;
    }

    if (error.code === "auth/email-already-in-use") {
        alert("Esse email já está cadastrado. Clique em Entrar.");
        return;
    }

    if (error.code === "auth/invalid-credential") {
        alert("Email ou senha incorretos.");
        return;
    }

    if (error.code === "auth/user-not-found") {
        alert("Essa conta ainda não existe. Clique em Criar Conta.");
        return;
    }

    if (error.code === "auth/wrong-password") {
        alert("Senha incorreta.");
        return;
    }

    alert("Erro: " + error.code);
}

btnLogin.addEventListener("click", async () => {
    const email = emailInput.value.trim().toLowerCase();
    const senha = senhaInput.value.trim();

    if (!email || !senha) {
        alert("Digite o email e a senha.");
        return;
    }

    try {
        bloquearBotoes(true);
        mostrarMensagem("Entrando...");

        const userCredential = await signInWithEmailAndPassword(auth, email, senha);

        await salvarUsuario(userCredential.user);

        irParaDashboard();

    } catch (error) {
        mostrarErro(error);
    }
});

btnCadastro.addEventListener("click", async () => {
    const email = emailInput.value.trim().toLowerCase();
    const senha = senhaInput.value.trim();

    if (!email || !senha) {
        alert("Digite o email e a senha.");
        return;
    }

    if (senha.length < 6) {
        alert("A senha precisa ter pelo menos 6 caracteres.");
        return;
    }

    try {
        bloquearBotoes(true);
        mostrarMensagem("Criando conta...");

        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);

        await salvarUsuario(userCredential.user);

        alert("Conta criada com sucesso!");

        irParaDashboard();

    } catch (error) {
        mostrarErro(error);
    }
});