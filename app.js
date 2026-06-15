import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// ==========================================
// 0. PROTEÇÃO DE AUTENTICAÇÃO
// ==========================================
let currentUser = null;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  currentUser = user;
  inicializarPagina();
});

// ==========================================
// 0.1 LOGOUT
// ==========================================
const btnPerfil = document.getElementById("btnPerfil");
const btnPerfilLista = document.getElementById("btnPerfilLista");

function fazerLogout() {
  if (!confirm("Deseja realmente sair da sua conta?")) return;
  signOut(auth)
    .then(() => {
      window.location.href = "login.html";
    })
    .catch((error) => {
      console.error("Erro ao fazer logout:", error);
      alert("Ocorreu um erro ao tentar sair. Tente novamente.");
    });
}

if (btnPerfil) btnPerfil.addEventListener("click", fazerLogout);
if (btnPerfilLista) btnPerfilLista.addEventListener("click", fazerLogout);

// ==========================================
// 0.2 ROTEADOR DE INICIALIZAÇÃO
// ==========================================
function inicializarPagina() {
  const nomeListaInput = document.getElementById("nomeLista");
  const listasContainer = document.getElementById("listasContainer");

  if (listasContainer) {
    // Estamos no dashboard
    carregarListas();
  } else if (nomeListaInput) {
    // Estamos na página de lista
    const listaId = sessionStorage.getItem("listaAtual");
    if (!listaId) {
      // ID não encontrado → volta ao dashboard com segurança
      window.location.href = "dashboard.html";
      return;
    }
    carregarDetalhesLista(listaId);
  }
}

// ==========================================
// 1. DASHBOARD — CARREGAR LISTAS
// ==========================================
async function carregarListas() {
  const container = document.getElementById("listasContainer");
  if (!container) return;

  container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-secondary);">Carregando listas...</div>`;

  try {
    const q = query(
      collection(db, "listas"),
      where("dono", "==", currentUser.uid),
    );

    // Listener em tempo real
    onSnapshot(q, (snapshot) => {
      container.innerHTML = "";

      if (snapshot.empty) {
        container.innerHTML = `
          <div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-secondary);">
            <span style="font-size:48px;display:block;margin-bottom:12px;">📋</span>
            <p style="font-weight:600;">Nenhuma lista criada ainda.</p>
            <p style="font-size:14px;margin-top:4px;">Clique no botão "+" acima para criar sua primeira lista.</p>
          </div>`;
        return;
      }

      snapshot.forEach((docSnap) => {
        const lista = { id: docSnap.id, ...docSnap.data() };
        const card = document.createElement("div");
        card.className = "lista-card card-base";

        const qtdItens = lista.itens ? lista.itens.length : 0;
        const qtdConcluidos = lista.itens
          ? lista.itens.filter((i) => i.concluido).length
          : 0;

        let infoTexto = "Nenhum item";
        if (qtdItens > 0) {
          infoTexto = qtdItens === 1 ? "1 item" : `${qtdItens} itens`;
          if (qtdConcluidos > 0) {
            infoTexto += ` (${qtdConcluidos} concluído${qtdConcluidos > 1 ? "s" : ""})`;
          }
        }

        card.innerHTML = `
          <div>${lista.nome || "Lista sem título"}</div>
          <div class="lista-card-info"><span>📋</span> ${infoTexto}</div>`;

        card.addEventListener("click", () => {
          sessionStorage.setItem("listaAtual", lista.id);
          window.location.href = "lista.html";
        });

        container.appendChild(card);
      });
    });
  } catch (err) {
    console.error("Erro ao carregar listas:", err);
    container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--color-danger);">Erro ao carregar listas. Tente recarregar a página.</div>`;
  }
}

// ==========================================
// 2. CRIAR NOVA LISTA
// ==========================================
const btnCriarLista = document.getElementById("btnCriarLista");
const actionCriarLista = document.getElementById("actionCriarLista");

async function criarNovaLista() {
  if (!currentUser) return;

  try {
    const docRef = await addDoc(collection(db, "listas"), {
      nome: "Nova Lista",
      itens: [],
      compartilhados: [],
      dono: currentUser.uid,
      criadoEm: serverTimestamp(),
    });

    sessionStorage.setItem("listaAtual", docRef.id);
    window.location.href = "lista.html";
  } catch (err) {
    console.error("Erro ao criar lista:", err);
    alert("Não foi possível criar a lista. Tente novamente.");
  }
}

if (btnCriarLista) btnCriarLista.addEventListener("click", criarNovaLista);
if (actionCriarLista) {
  actionCriarLista.addEventListener("click", (e) => {
    if (e.target !== btnCriarLista) criarNovaLista();
  });
}

// ==========================================
// 3. CARREGAR DETALHES DA LISTA
// ==========================================
const nomeListaInput = document.getElementById("nomeLista");
const listaItens = document.getElementById("listaItens");

// Variável local para os dados da lista atual (evita re-fetch constante)
let listaCache = null;

async function carregarDetalhesLista(listaId) {
  if (!nomeListaInput || !listaItens) return;

  try {
    const docRef = doc(db, "listas", listaId);

    // Listener em tempo real para a lista
    onSnapshot(docRef, (docSnap) => {
      if (!docSnap.exists()) {
        alert("Esta lista não existe ou foi apagada.");
        window.location.href = "dashboard.html";
        return;
      }

      listaCache = { id: docSnap.id, ...docSnap.data() };

      // Atualiza nome sem resetar o cursor do input
      if (document.activeElement !== nomeListaInput) {
        nomeListaInput.value = listaCache.nome || "";
      }

      renderizarItens(listaCache);
      renderizarCompartilhados(listaCache);
    });

    // Salvar nome ao digitar (com debounce)
    let debounceNome;
    nomeListaInput.addEventListener("input", () => {
      clearTimeout(debounceNome);
      debounceNome = setTimeout(async () => {
        try {
          await updateDoc(doc(db, "listas", listaId), {
            nome: nomeListaInput.value,
          });
        } catch (err) {
          console.error("Erro ao salvar nome:", err);
        }
      }, 600);
    });
  } catch (err) {
    console.error("Erro ao carregar lista:", err);
    alert("Erro ao carregar a lista.");
    window.location.href = "dashboard.html";
  }
}

// ==========================================
// 4. ADICIONAR ITEM
// ==========================================
const addBtn = document.getElementById("addItem");
const itemNomeInput = document.getElementById("itemNome");
const itemQtdInput = document.getElementById("itemQtd");

async function adicionarItem() {
  if (!itemNomeInput) return;
  const nome = itemNomeInput.value.trim();
  const qtd = itemQtdInput ? itemQtdInput.value.trim() : "";
  if (!nome) return;

  const listaId = sessionStorage.getItem("listaAtual");
  if (!listaId || !listaCache) return;

  const novosItens = [
    ...(listaCache.itens || []),
    { id: Date.now().toString(), nome, qtd, concluido: false },
  ];

  try {
    await updateDoc(doc(db, "listas", listaId), { itens: novosItens });
    itemNomeInput.value = "";
    if (itemQtdInput) itemQtdInput.value = "";
    itemNomeInput.focus();
  } catch (err) {
    console.error("Erro ao adicionar item:", err);
    alert("Não foi possível adicionar o item.");
  }
}

if (addBtn) addBtn.addEventListener("click", adicionarItem);
if (itemNomeInput) {
  itemNomeInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") adicionarItem();
  });
}
if (itemQtdInput) {
  itemQtdInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") adicionarItem();
  });
}

// ==========================================
// 5. RENDERIZAR ITENS
// ==========================================
function renderizarItens(lista) {
  if (!listaItens) return;

  listaItens.innerHTML = "";

  if (!lista.itens || lista.itens.length === 0) {
    listaItens.innerHTML = `
      <div style="text-align:center;padding:30px;color:var(--text-secondary);border:1px dashed var(--color-border);border-radius:var(--radius-md);">
        <p style="font-weight:500;font-size:14px;">Esta lista está vazia.</p>
        <p style="font-size:12px;margin-top:2px;">Digite o nome do item acima para começar.</p>
      </div>`;
    return;
  }

  lista.itens.forEach((item) => {
    const div = document.createElement("div");
    div.className = `item ${item.concluido ? "done-item" : ""}`;
    div.innerHTML = `
      <div class="check ${item.concluido ? "done" : ""}" role="checkbox" aria-checked="${item.concluido}"></div>
      <div class="item-text">${item.nome}</div>
      ${item.qtd ? `<div class="item-qtd">${item.qtd}</div>` : ""}
      <button class="delete" title="Excluir Item">🗑</button>`;

    div.querySelector(".check").addEventListener("click", async () => {
      const listaId = sessionStorage.getItem("listaAtual");
      const novosItens = lista.itens.map((i) =>
        i.id === item.id ? { ...i, concluido: !i.concluido } : i,
      );
      await updateDoc(doc(db, "listas", listaId), { itens: novosItens });
    });

    div.querySelector(".delete").addEventListener("click", async () => {
      const listaId = sessionStorage.getItem("listaAtual");
      const novosItens = lista.itens.filter((i) => i.id !== item.id);
      await updateDoc(doc(db, "listas", listaId), { itens: novosItens });
    });

    listaItens.appendChild(div);
  });
}

// ==========================================
// 6. NAVEGAÇÃO — VOLTAR
// ==========================================
const btnVoltar = document.getElementById("btnVoltar");
if (btnVoltar) {
  btnVoltar.addEventListener("click", () => {
    window.location.href = "dashboard.html";
  });
}

// ==========================================
// 7. APAGAR LISTA
// ==========================================
const btnApagarLista = document.getElementById("btnApagarLista");
if (btnApagarLista) {
  btnApagarLista.addEventListener("click", async () => {
    if (!confirm("Deseja realmente apagar esta lista permanentemente?")) return;

    const listaId = sessionStorage.getItem("listaAtual");
    if (!listaId) return;

    try {
      await deleteDoc(doc(db, "listas", listaId));
      sessionStorage.removeItem("listaAtual");
      window.location.href = "dashboard.html";
    } catch (err) {
      console.error("Erro ao apagar lista:", err);
      alert("Não foi possível apagar a lista.");
    }
  });
}

// ==========================================
// 8. COMPARTILHAMENTO
// ==========================================
const btnShare = document.getElementById("btnShare");
const shareEmailInput = document.getElementById("shareEmail");
const shareUsuariosList = document.getElementById("shareUsuariosList");

function renderizarCompartilhados(lista) {
  if (!shareUsuariosList) return;

  shareUsuariosList.innerHTML = "";
  const compartilhados = lista.compartilhados || [];

  if (compartilhados.length === 0) {
    shareUsuariosList.innerHTML = `
      <div style="font-size:13px;color:var(--text-secondary);padding:8px 0;">
        Nenhum e-mail adicionado para compartilhar.
      </div>`;
    return;
  }

  compartilhados.forEach((email) => {
    const div = document.createElement("div");
    div.className = "usuario-email";
    div.innerHTML = `
      <span>${email}</span>
      <button class="delete" style="font-size:14px;" title="Remover Acesso">✕</button>`;

    div.querySelector(".delete").addEventListener("click", async () => {
      const listaId = sessionStorage.getItem("listaAtual");
      const novos = compartilhados.filter((e) => e !== email);
      await updateDoc(doc(db, "listas", listaId), { compartilhados: novos });
    });

    shareUsuariosList.appendChild(div);
  });
}

if (btnShare && shareEmailInput) {
  const adicionarCompartilhado = async () => {
    const email = shareEmailInput.value.trim().toLowerCase();
    if (!email) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Por favor, digite um e-mail válido.");
      return;
    }

    const listaId = sessionStorage.getItem("listaAtual");
    if (!listaId || !listaCache) return;

    const compartilhados = listaCache.compartilhados || [];
    if (compartilhados.includes(email)) {
      alert("Esta lista já está compartilhada com este e-mail.");
      return;
    }

    try {
      await updateDoc(doc(db, "listas", listaId), {
        compartilhados: [...compartilhados, email],
      });
      shareEmailInput.value = "";
    } catch (err) {
      console.error("Erro ao compartilhar:", err);
      alert("Não foi possível adicionar o usuário.");
    }
  };

  btnShare.addEventListener("click", adicionarCompartilhado);
  shareEmailInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") adicionarCompartilhado();
  });
}
