// ==========================================
// 1. DASHBOARD
// ==========================================
function carregarListas() {
    const container = document.querySelector(".listas-container");
    if (!container) return;

    container.innerHTML = "";
    const listas = JSON.parse(localStorage.getItem("listas")) || [];

    listas.forEach(lista => {
        const card = document.createElement("div");
        card.className = "lista-card";
        card.innerText = lista.nome;

        card.addEventListener("click", () => {
            localStorage.setItem("listaAtual", lista.id);
            window.location.href = "lista.html";
        });

        container.appendChild(card);
    });
}

// Inicializa o dashboard se estiver na página correta
carregarListas();

// ==========================================
// 2. CRIAR LISTA
// ==========================================
const plusBtn = document.querySelector(".plus-btn");

if (plusBtn) {
    plusBtn.addEventListener("click", () => {
        const listas = JSON.parse(localStorage.getItem("listas")) || [];

        const novaLista = {
            id: Date.now().toString(),
            nome: "Nova Lista",
            itens: [],
            compartilhados: []
        };

        listas.push(novaLista);
        localStorage.setItem("listas", JSON.stringify(listas));
        localStorage.setItem("listaAtual", novaLista.id);

        window.location.href = "lista.html";
    });
}

// ==========================================
// 3. CARREGAR DETALHES DA LISTA ATUAL
// ==========================================
const nomeListaInput = document.getElementById("nomeLista");
const listaItens = document.getElementById("listaItens");
const listaAtualId = localStorage.getItem("listaAtual");

if (nomeListaInput && listaItens && listaAtualId) {
    let listas = JSON.parse(localStorage.getItem("listas")) || [];
    let lista = listas.find(l => l.id === listaAtualId);

    if (lista) {
        nomeListaInput.value = lista.nome;
        renderizarItens();
    }

    // Corrigido para garantir que a alteração do nome persista corretamente
    nomeListaInput.addEventListener("input", () => {
        if (lista) {
            lista.nome = nomeListaInput.value;
            salvar(lista);
        }
    });
}

// ==========================================
// 4. ADICIONAR ITEM À LISTA
// ==========================================
const addBtn = document.getElementById("addItem");

if (addBtn) {
    addBtn.addEventListener("click", () => {
        const nome = document.getElementById("itemNome").value.trim();
        const qtd = document.getElementById("itemQtd").value.trim();

        if (!nome) return;

        let listas = JSON.parse(localStorage.getItem("listas")) || [];
        let lista = listas.find(l => l.id === listaAtualId);

        if (!lista) return;

        lista.itens.push({
            id: Date.now(),
            nome,
            qtd,
            concluido: false
        });

        localStorage.setItem("listas", JSON.stringify(listas));
        renderizarItens();

        // Limpa os campos de input
        document.getElementById("itemNome").value = "";
        document.getElementById("itemQtd").value = "";
    });
}

// ==========================================
// 5. RENDERIZAR ITENS DA LISTA
// ==========================================
function renderizarItens() {
    if (!listaItens) return;

    let listas = JSON.parse(localStorage.getItem("listas")) || [];
    let lista = listas.find(l => l.id === listaAtualId);

    if (!lista) return;

    listaItens.innerHTML = "";

    lista.itens.forEach(item => {
        const div = document.createElement("div");
        div.className = "item";

        div.innerHTML = `
            <div class="check ${item.concluido ? "done" : ""}"></div>
            <div style="flex:1;">${item.nome}</div>
            <div>${item.qtd}</div>
            <button class="delete">🗑</button>
        `;

        // Marcar/Desmarcar como concluído
        div.querySelector(".check").addEventListener("click", () => {
            item.concluido = !item.concluido;
            localStorage.setItem("listas", JSON.stringify(listas));
            renderizarItens();
        });

        // Apagar item específico
        div.querySelector(".delete").addEventListener("click", () => {
            lista.itens = lista.itens.filter(i => i.id !== item.id);
            localStorage.setItem("listas", JSON.stringify(listas));
            renderizarItens();
        });

        listaItens.appendChild(div);
    });
}

// ==========================================
// 6. NAVEGAÇÃO / VOLTAR
// ==========================================
const btnVoltar = document.getElementById("btnVoltar");

if (btnVoltar) {
    btnVoltar.addEventListener("click", () => {
        window.location.href = "dashboard.html";
    });
}

// ==========================================
// 7. APAGAR LISTA COMPLETA
// ==========================================
const btnApagarLista = document.getElementById("btnApagarLista");

if (btnApagarLista) {
    btnApagarLista.addEventListener("click", () => {
        if (!confirm("Deseja realmente apagar esta lista?")) return;

        let listas = JSON.parse(localStorage.getItem("listas")) || [];
        listas = listas.filter(l => l.id !== listaAtualId);

        localStorage.setItem("listas", JSON.stringify(listas));
        localStorage.removeItem("listaAtual");

        window.location.href = "dashboard.html";
    });
}

// ==========================================
// 8. FUNÇÃO AUXILIAR: SALVAR ALTERAÇÕES
// ==========================================
function salvar(listaAtualizada) {
    let listas = JSON.parse(localStorage.getItem("listas")) || [];
    const index = listas.findIndex(l => l.id === listaAtualId);

    if (index === -1) return;

    listas[index] = listaAtualizada;
    localStorage.setItem("listas", JSON.stringify(listas));
}