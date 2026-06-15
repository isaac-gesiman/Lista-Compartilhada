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
const loginForm = document.getElementById("loginForm");

// Função auxiliar para mostrar mensagens na tela de forma amigável
function exibirMensagem(texto, cor = "var(--color-danger)") {
    if (mensagemTexto) {
        mensagemTexto.textContent = texto;
        mensagemTexto.style.color = cor;
    }
}

// Mapeamento de erros comuns do Firebase Auth
function obterMensagemErro(codigo) {
    switch (codigo) {
        case "auth/invalid-credential":
            return "E-mail ou senha incorretos.";
        case "auth/email-already-in-use":
            return "Este e-mail já está sendo utilizado.";
        case "auth/weak-password":
            return "A senha deve ter pelo menos 6 caracteres.";
        case "auth/invalid-email":
            return "O e-mail digitado não é válido.";
        case "auth/user-disabled":
            return "Este usuário foi desativado.";
        case "auth/user-not-found":
            return "Usuário não cadastrado.";
        case "auth/wrong-password":
            return "Senha incorreta.";
        case "auth/popup-closed-by-user":
            return "O login pelo Google foi cancelado.";
        default:
            return "Ocorreu um erro ao autenticar. Tente novamente.";
    }
}

// Controle de estado dos botões para Feedback de Loading
function definirEstadoCarregamento(carregando, botaoAtivo, textoOriginal, textoLoading = "Carregando...") {
    const botoes = [btnLogin, btnCadastro, btnGoogle];
    botoes.forEach(btn => {
        if (btn) {
            btn.disabled = carregando;
            if (carregando) {
                btn.style.opacity = "0.6";
                btn.style.cursor = "not-allowed";
            } else {
                btn.style.opacity = "";
                btn.style.cursor = "";
            }
        }
    });
    
    if (botaoAtivo) {
        if (carregando) {
            if (botaoAtivo === btnGoogle) {
                botaoAtivo.innerHTML = `⏳ ${textoLoading}`;
            } else {
                botaoAtivo.textContent = textoLoading;
            }
        } else {
            if (botaoAtivo === btnGoogle) {
                botaoAtivo.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
                        <path d="M9 18C11.43 18 13.4673 17.1941 14.9577 15.8195L12.0491 13.5614C11.2418 14.1027 10.2109 14.4273 9 14.4273C6.65591 14.4273 4.67182 12.8414 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
                        <path d="M4.96409 10.71C4.78409 10.17 4.68182 9.59727 4.68182 9C4.68182 8.40273 4.78409 7.83 4.96409 7.29V4.95818H1.95727C1.34591 6.17318 1 7.54773 1 9C1 10.4523 1.34591 11.8268 1.95727 13.0418L4.96409 10.71Z" fill="#FBBC05"/>
                        <path d="M9 3.57273C10.3214 3.57273 11.5077 4.02545 12.4405 4.91727L15.0218 2.33591C13.4632 0.887727 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.15864 6.65591 3.57273 9 3.57273Z" fill="#EA4335"/>
                    </svg>
                    Entrar com o Google
                `;
            } else {
                botaoAtivo.textContent = textoOriginal;
            }
        }
    }
}

// 1. LOGAR COM EMAIL E SENHA (via Submit do Form)
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();
        const senha = senhaInput.value.trim();

        if (!email || !senha) {
            exibirMensagem("Por favor, preencha todos os campos.");
            if (!email) emailInput.style.borderColor = "var(--color-danger)";
            if (!senha) senhaInput.style.borderColor = "var(--color-danger)";
            return;
        }

        emailInput.style.borderColor = "";
        senhaInput.style.borderColor = "";

        const textoOriginal = btnLogin ? btnLogin.textContent : "Entrar";
        definirEstadoCarregamento(true, btnLogin, textoOriginal, "Entrando...");

        try {
            exibirMensagem("Autenticando...", "var(--color-accent)");
            await signInWithEmailAndPassword(auth, email, senha);
            window.location.href = "./dashboard.html";
        } catch (error) {
            console.error(error);
            exibirMensagem(obterMensagemErro(error.code));
            definirEstadoCarregamento(false, btnLogin, textoOriginal);
        }
    });
}

// 2. CRIAR NOVA CONTA
if (btnCadastro) {
    btnCadastro.addEventListener("click", async () => {
        const email = emailInput.value.trim();
        const senha = senhaInput.value.trim();

        if (!email || !senha) {
            exibirMensagem("Preencha o e-mail e senha para cadastrar.");
            if (!email) emailInput.style.borderColor = "var(--color-danger)";
            if (!senha) senhaInput.style.borderColor = "var(--color-danger)";
            return;
        }

        if (senha.length < 6) {
            exibirMensagem("A senha deve ter pelo menos 6 caracteres.");
            senhaInput.style.borderColor = "var(--color-danger)";
            return;
        }

        emailInput.style.borderColor = "";
        senhaInput.style.borderColor = "";

        const textoOriginal = btnCadastro.textContent;
        definirEstadoCarregamento(true, btnCadastro, textoOriginal, "Criando conta...");

        try {
            exibirMensagem("Criando conta...", "var(--color-accent)");
            await createUserWithEmailAndPassword(auth, email, senha);
            window.location.href = "./dashboard.html";
        } catch (error) {
            console.error(error);
            exibirMensagem(obterMensagemErro(error.code));
            definirEstadoCarregamento(false, btnCadastro, textoOriginal);
        }
    });
}

// 3. LOGIN COM GOOGLE
if (btnGoogle) {
    btnGoogle.addEventListener("click", async () => {
        const textoOriginal = "Entrar com o Google";
        definirEstadoCarregamento(true, btnGoogle, textoOriginal, "Conectando...");

        try {
            exibirMensagem("Conectando ao Google...", "var(--color-accent)");
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            window.location.href = "./dashboard.html";
        } catch (error) {
            console.error(error);
            exibirMensagem(obterMensagemErro(error.code));
            definirEstadoCarregamento(false, btnGoogle, textoOriginal);
        }
    });
}

// Resetar bordas vermelhas e mensagens no input do usuário
if (emailInput) {
    emailInput.addEventListener("input", () => {
        emailInput.style.borderColor = "";
        if (mensagemTexto) mensagemTexto.textContent = "";
    });
}
if (senhaInput) {
    senhaInput.addEventListener("input", () => {
        senhaInput.style.borderColor = "";
        if (mensagemTexto) mensagemTexto.textContent = "";
    });
}
