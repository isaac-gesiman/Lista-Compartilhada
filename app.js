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


// DASHBOARD

function carregarListas() {

    const container = document.querySelector(".listas-container");

    if (!container) return;

    container.innerHTML = "";

    const listas =
        JSON.parse(localStorage.getItem("listas")) || [];

    listas.forEach(lista => {

        const card = document.createElement("div");

        card.className = "lista-card";

        card.innerText = lista.nome;

        card.addEventListener("click", () => {

            localStorage.setItem(
                "listaAtual",
                lista.id
            );

            window.location.href =
                "lista.html";

        });

        container.appendChild(card);

    });

}

carregarListas();



// CRIAR LISTA


const plusBtn =
    document.querySelector(".plus-btn");

if (plusBtn) {

    plusBtn.addEventListener("click", () => {

        const listas =
            JSON.parse(
                localStorage.getItem("listas")
            ) || [];

        const novaLista = {

            id: Date.now().toString(),

            nome:
                "Nova Lista",

            itens: [],

            compartilhados: []

        };

        listas.push(novaLista);

        localStorage.setItem(
            "listas",
            JSON.stringify(listas)
        );

        localStorage.setItem(
            "listaAtual",
            novaLista.id
        );

        window.location.href =
            "lista.html";

    });

}


// CARREGAR LISTA

const nomeListaInput =
    document.getElementById("nomeLista");

const listaItens =
    document.getElementById("listaItens");

const listaAtualId =
    localStorage.getItem("listaAtual");

if (
    nomeListaInput &&
    listaItens &&
    listaAtualId
) {

    let listas =
        JSON.parse(
            localStorage.getItem("listas")
        ) || [];

    let lista =
        listas.find(
            l => l.id === listaAtualId
        );

    if (lista) {

        nomeListaInput.value =
            lista.nome;

        renderizarItens();
    }

    nomeListaInput.addEventListener(
        "input",
        () => {

            lista.nome =
                nomeListaInput.value;

            salvar();

        }
    );

}

// ADICIONAR ITEM

const addBtn =
    document.getElementById("addItem");

if (addBtn) {

    addBtn.addEventListener(
        "click",
        () => {

            const nome =
                document
                .getElementById("itemNome")
                .value
                .trim();

            const qtd =
                document
                .getElementById("itemQtd")
                .value
                .trim();

            if (!nome) return;

            let listas =
                JSON.parse(
                    localStorage.getItem(
                        "listas"
                    )
                ) || [];

            let lista =
                listas.find(
                    l =>
                    l.id ===
                    listaAtualId
                );

            lista.itens.push({

                id: Date.now(),

                nome,

                qtd,

                concluido: false

            });

            localStorage.setItem(
                "listas",
                JSON.stringify(listas)
            );

            renderizarItens();

            document.getElementById(
                "itemNome"
            ).value = "";

            document.getElementById(
                "itemQtd"
            ).value = "";

        }
    );

}


// RENDERIZAR ITENS

function renderizarItens() {

    if (!listaItens) return;

    let listas =
        JSON.parse(
            localStorage.getItem("listas")
        ) || [];

    let lista =
        listas.find(
            l => l.id === listaAtualId
        );

    if (!lista) return;

    listaItens.innerHTML = "";

    lista.itens.forEach(item => {

        const div = document.createElement("div");

        div.className = "item";

        div.innerHTML = `
            <div class="check ${item.concluido ? "done" : ""}"></div>

            <div style="flex:1;">
                ${item.nome}
            </div>

            <div>
                ${item.qtd}
            </div>

            <button class="delete">
                🗑
            </button>
        `;

        // MARCAR COMO CONCLUÍDO
        div.querySelector(".check")
        .addEventListener("click", () => {

            item.concluido = !item.concluido;

            localStorage.setItem(
                "listas",
                JSON.stringify(listas)
            );

            renderizarItens();

        });

        // APAGAR ITEM
        div.querySelector(".delete")
        .addEventListener("click", () => {

            lista.itens = lista.itens.filter(
                i => i.id !== item.id
            );

            localStorage.setItem(
                "listas",
                JSON.stringify(listas)
            );

            renderizarItens();

        });

        listaItens.appendChild(div);

    });

}


// 
// VOLTAR
// 

const btnVoltar =
    document.getElementById(
        "btnVoltar"
    );

if (btnVoltar) {

    btnVoltar.addEventListener(
        "click",
        () => {

            window.location.href =
                "dashboard.html";

        }
    );

}


// APAGAR LISTA

const btnApagarLista =
    document.getElementById(
        "btnApagarLista"
    );

if (btnApagarLista) {

    btnApagarLista.addEventListener(
        "click",
        () => {

            if (
                !confirm(
                    "Deseja apagar a lista?"
                )
            )
                return;

            let listas =
                JSON.parse(
                    localStorage.getItem(
                        "listas"
                    )
                ) || [];

            listas =
                listas.filter(
                    l =>
                    l.id !==
                    listaAtualId
                );

            localStorage.setItem(
                "listas",
                JSON.stringify(listas)
            );

            localStorage.removeItem(
                "listaAtual"
            );

            window.location.href =
                "dashboard.html";

        }
    );

}


// SALVAR

function salvar() {

    let listas =
        JSON.parse(
            localStorage.getItem(
                "listas"
            )
        ) || [];

    const index =
        listas.findIndex(
            l =>
            l.id ===
            listaAtualId
        );

    listas[index] = lista;

    localStorage.setItem(
        "listas",
        JSON.stringify(listas)
    );

}