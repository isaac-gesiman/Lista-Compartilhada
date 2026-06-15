import { auth } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

console.log("login.js carregado");

// Seleção dos elementos do DOM
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const btnLogin = document.getElementById("btnLogin");
const btnCadastro = document.getElementById("btnCadastro");
const btnGoogle = document.getElementById("btnGoogle");
const mensagemTexto = document.getElementById("mensagem");

// Função auxiliar para mostrar mensagens na tela de forma amigável
function exibirMensagem(texto, cor = "red") {
    if (mensagemTexto) {
        mensagemTexto.textContent = texto;
        mensagemTexto.style.color = cor;
    }
}

// 1. LOGAR COM EMAIL E SENHA
if (btnLogin) {
    btnLogin.addEventListener("click", async () => {
        const email = emailInput.value.trim();
        const senha = senhaInput.value.trim();

        if (!email || !senha) {
            exibirMensagem("Por favor, preencha todos os campos.");
            return;
        }

        try {
            exibirMensagem("Autenticando...", "#007bff");
            const userCredential = await signInWithEmailAndPassword(auth, email, senha);
            console.log(userCredential.user);

            window.location.href = "./dashboard.html";
        } catch (error) {
            console.error(error);
            exibirMensagem("Erro ao entrar: " + error.code);
        }
    });
}

// 2. CRIAR NOVA CONTA
if (btnCadastro) {
    btnCadastro.addEventListener("click", async () => {
        const email = emailInput.value.trim();
        const senha = senhaInput.value.trim();

        if (!email || !senha) {
            exibirMensagem("Por favor, preencha todos os campos.");
            return;
        }

        try {
            exibirMensagem("Criando conta...", "#007bff");
            const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
            console.log(userCredential.user);

            window.location.href = "./dashboard.html";
        } catch (error) {
            console.error(error);
            exibirMensagem("Erro ao criar conta: " + error.code);
        }
    });
}

// 3. LOGIN COM GOOGLE
if (btnGoogle) {
    btnGoogle.addEventListener("click", async () => {
        try {
            exibirMensagem("Conectando ao Google...", "#007bff");
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            console.log(userCredential.user);

            window.location.href = "./dashboard.html";
        } catch (error) {
            console.error(error);
            exibirMensagem("Erro Google: " + error.code);
        }
    });
}
