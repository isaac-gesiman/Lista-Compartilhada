# Lista Compartilhada

**Relatório Técnico — Projeto A3**
Unidade Curricular: Sistemas Distribuídos e Mobile

---

|                        |                                |
| ---------------------- | ------------------------------ |
| **Instituição**        | Universidade Potiguar - UnP    |
| **Unidade Curricular** | Sistemas Distribuídos e Mobile |
| **Tipo de Avaliação**  | Projeto Avaliativo A3          |

**Integrantes do Grupo**

| Nome                               | RA  |
| ---------------------------------- | --- |
| Tiago Ferreira da Fonseca Sobrinho | —   |
| Sofia de Souza Beleza              | —   |
| Isaac Rodrigues de Medeiros        | —   |

---

## Sumário

1. [Introdução](#1-introdução)
2. [Objetivos](#2-objetivos)
3. [Fundamentação Teórica](#3-fundamentação-teórica)
4. [Metodologia de Desenvolvimento](#4-metodologia-de-desenvolvimento)
5. [Arquitetura do Sistema](#5-arquitetura-do-sistema)
6. [Tecnologias Utilizadas](#6-tecnologias-utilizadas)
7. [Estrutura do Projeto](#7-estrutura-do-projeto)
8. [Modelo de Dados](#8-modelo-de-dados)
9. [Implementação](#9-implementação)
10. [Segurança](#10-segurança)
11. [Resultados Obtidos](#11-resultados-obtidos)
12. [Dificuldades Encontradas e Soluções Aplicadas](#12-dificuldades-encontradas-e-soluções-aplicadas)
13. [Conclusão](#13-conclusão)
14. [Referências](#14-referências)

---

## 1. Introdução

O presente relatório documenta o desenvolvimento do projeto **Lista Compartilhada**, uma aplicação web colaborativa criada como parte da avaliação A3 da Unidade Curricular de Sistemas Distribuídos e Mobile.

O projeto tem como propósito central demonstrar na prática os fundamentos de sistemas distribuídos aplicados ao desenvolvimento de software moderno, explorando conceitos como sincronização de dados entre múltiplos clientes, autenticação distribuída, persistência em banco de dados na nuvem e comunicação em tempo real entre dispositivos distintos.

A problemática que motivou o desenvolvimento parte de uma necessidade cotidiana: a dificuldade de compartilhar e manter sincronizadas listas de tarefas ou compras entre pessoas que utilizam dispositivos diferentes. Soluções tradicionais baseadas em armazenamento local (como `localStorage` do navegador) resolvem apenas o problema do usuário individual, sendo incapazes de propagar alterações para outros participantes. A proposta deste projeto é construir uma solução que supere essa limitação por meio de arquitetura distribuída em nuvem.

---

## 2. Objetivos

### 2.1 Objetivo Geral

Desenvolver uma aplicação web colaborativa que permita a criação, edição e compartilhamento de listas entre múltiplos usuários, com sincronização de dados em tempo real suportada por infraestrutura de nuvem distribuída.

### 2.2 Objetivos Específicos

- Implementar um sistema de autenticação seguro com suporte a múltiplos provedores de identidade (e-mail/senha e OAuth 2.0 com Google)
- Aplicar o modelo de banco de dados NoSQL orientado a documentos para persistência das listas e seus itens
- Utilizar mecanismos de comunicação em tempo real (listeners reativos) para sincronizar alterações entre clientes simultaneamente conectados
- Implementar controle de acesso baseado em identidade do usuário, garantindo que cada usuário visualize e edite apenas as listas às quais tem permissão
- Desenvolver uma interface de usuário responsiva, acessível e funcional sem dependência de frameworks ou ferramentas de build

---

## 3. Fundamentação Teórica

### 3.1 Sistemas Distribuídos

Um sistema distribuído é definido como um conjunto de computadores independentes que se apresenta aos usuários como um sistema único e coerente (TANENBAUM; VAN STEEN, 2007). O projeto Lista Compartilhada incorpora essa definição ao delegar o armazenamento e a sincronização de dados a servidores geograficamente distribuídos da infraestrutura do Google Firebase, enquanto múltiplos clientes (navegadores de usuários diferentes) interagem com esse sistema de forma concorrente e transparente.

### 3.2 Comunicação em Tempo Real

A comunicação em tempo real em sistemas distribuídos pode ser implementada por diferentes estratégias, entre elas polling, long polling, Server-Sent Events (SSE) e WebSockets. O Firebase Firestore, utilizado neste projeto, implementa internamente o protocolo gRPC com streaming bidirecional sobre HTTP/2, expondo ao desenvolvedor uma API de alto nível baseada em listeners (`onSnapshot`) que abstraem a complexidade do canal de comunicação subjacente. Ao registrar um listener em um documento ou coleção, o cliente recebe automaticamente as atualizações publicadas por qualquer outro cliente que modifique os mesmos dados, sem necessidade de requisições periódicas.

### 3.3 Banco de Dados NoSQL Orientado a Documentos

O modelo relacional tradicional, baseado em tabelas e esquemas fixos, impõe rigidez que nem sempre é adequada para dados hierárquicos e variáveis. O Cloud Firestore adota o modelo de banco de dados NoSQL orientado a documentos, no qual os dados são organizados em coleções de documentos JSON flexíveis. Cada documento pode conter campos escalares, arrays e objetos aninhados, o que se mostrou adequado para representar as listas e seus itens em uma única unidade de dado, reduzindo a quantidade de operações de leitura necessárias.

### 3.4 Autenticação e Identidade Federada

A autenticação federada (ou identidade federada) permite que um sistema delegue a verificação de identidade a um provedor externo confiável, sem que o sistema armazene credenciais dos usuários diretamente. O Firebase Authentication implementa esse modelo por meio do protocolo OAuth 2.0 para login social (Google) e gerencia internamente o ciclo de vida dos tokens JWT (JSON Web Tokens) para autenticação por e-mail e senha. O token gerado é automaticamente incluído nas requisições ao Firestore, onde as regras de segurança validam permissões com base na identidade do usuário autenticado.

### 3.5 Arquitetura MPA e Módulos ES

A aplicação segue o padrão MPA (Multi-Page Application), no qual cada página é um documento HTML independente. Essa abordagem contrasta com o modelo SPA (Single-Page Application), sendo mais simples de implementar sem ferramentas de build, porém exigindo estratégias cuidadosas de compartilhamento de estado entre páginas. O projeto utiliza ES Modules nativos do JavaScript (especificação ECMAScript 2015+), que permitem organizar o código em módulos com exportações e importações explícitas, sem necessidade de bundlers como Webpack ou Vite.

---

## 4. Metodologia de Desenvolvimento

O desenvolvimento foi conduzido de forma iterativa e incremental, dividido nas seguintes fases:

**Fase 1 — Planejamento e Prototipação**
Levantamento de requisitos funcionais e não funcionais, definição da arquitetura e do modelo de dados, e criação do layout visual das páginas.

**Fase 2 — Desenvolvimento da Interface**
Implementação das páginas HTML e da folha de estilos CSS, com foco em responsividade, acessibilidade (atributos `aria-label`, `role`) e consistência visual por meio de um sistema de design tokens via variáveis CSS.

**Fase 3 — Integração com Firebase**
Configuração do projeto no Firebase Console, habilitação dos serviços de Authentication e Firestore, e implementação da camada de comunicação no JavaScript.

**Fase 4 — Testes e Correção de Bugs**
Identificação e correção de três problemas críticos relacionados à sincronização de dados, navegação entre páginas e condições de corrida na inicialização. Os detalhes estão documentados na Seção 12.

**Fase 5 — Documentação**
Elaboração deste relatório técnico.

---

## 5. Arquitetura do Sistema

### 5.1 Visão Geral

O sistema é composto por três camadas principais:

```
┌─────────────────────────────────────────────┐
│              CAMADA DE APRESENTAÇÃO          │
│   HTML5 + CSS3 + JavaScript (ES Modules)    │
│  index · login · dashboard · lista          │
└───────────────────┬─────────────────────────┘
                    │ Firebase SDK (CDN)
┌───────────────────▼─────────────────────────┐
│           CAMADA DE SERVIÇOS (BaaS)          │
│              Google Firebase                 │
│   Firebase Auth │ Cloud Firestore            │
└───────────────────┬─────────────────────────┘
                    │ Infraestrutura Google
┌───────────────────▼─────────────────────────┐
│         CAMADA DE INFRAESTRUTURA             │
│    Google Cloud Platform (multi-região)      │
└─────────────────────────────────────────────┘
```

O modelo adotado é **BaaS (Backend as a Service)**, no qual toda a infraestrutura de servidor, banco de dados, autenticação e sincronização é provida pelo Firebase, eliminando a necessidade de desenvolver e manter um backend próprio. Isso permite que a equipe foque integralmente na lógica de negócio e na experiência do usuário.

### 5.2 Fluxo de Dados em Tempo Real

Quando um usuário modifica um item de uma lista, o seguinte fluxo ocorre:

```
Cliente A (usuário 1)
    │
    ├─► updateDoc(Firestore) ──► Google Cloud
    │                                  │
    │                           Propaga mudança
    │                                  │
    └─────────────────────────► onSnapshot dispara
                                       │
                               Cliente B (usuário 2)
                               renderiza automaticamente
```

### 5.3 Fluxo de Navegação

```
index.html  ──────────────────────────────────────────────┐
(pública)                                                  │
    │                                                      │
    └──► login.html ──► [Firebase Auth] ──► dashboard.html │
         (pública)                              │          │
                                    ┌───────────┴──────┐  │
                                    │                  │  │
                               Clicar lista       Criar lista
                                    │                  │
                                    └──────┬───────────┘
                                           │
                                      lista.html
                                           │
                                    Botão Voltar
                                           │
                                      dashboard.html
```

A passagem do identificador da lista entre `dashboard.html` e `lista.html` é feita via `sessionStorage`, garantindo persistência durante a sessão sem expor o ID na URL.

---

## 6. Tecnologias Utilizadas

| Tecnologia              | Versão              | Função no Projeto                                          |
| ----------------------- | ------------------- | ---------------------------------------------------------- |
| HTML5                   | —                   | Estrutura semântica das páginas                            |
| CSS3                    | —                   | Estilização, responsividade e sistema de design tokens     |
| JavaScript              | ES2022 (ESM nativo) | Lógica de negócio e interação com Firebase                 |
| Firebase Authentication | SDK 12.0.0          | Autenticação de usuários (e-mail/senha e Google OAuth 2.0) |
| Cloud Firestore         | SDK 12.0.0          | Banco de dados NoSQL em tempo real                         |
| Google Fonts (Outfit)   | —                   | Tipografia da interface                                    |

**Justificativa das escolhas tecnológicas:** o projeto foi desenvolvido intencionalmente sem frameworks JavaScript (React, Vue, Angular) ou ferramentas de build (Webpack, Vite), a fim de demonstrar o domínio dos fundamentos da plataforma web e da integração direta com serviços distribuídos em nuvem, sem abstrações adicionais.

---

## 7. Estrutura do Projeto

```
lista-compartilhada/
│
├── index.html          # Landing page pública com apresentação do produto
├── login.html          # Tela de autenticação (login, cadastro e Google)
├── dashboard.html      # Painel principal com todas as listas do usuário
├── lista.html          # Tela de edição de lista e compartilhamento
│
├── app.js              # Controlador principal (dashboard + lista + logout)
├── login.js            # Lógica exclusiva do fluxo de autenticação
├── firebase.js         # Inicialização e exportação das instâncias Firebase
│
└── style.css           # Folha de estilos global com design system via CSS vars
```

### 7.1 Descrição dos Módulos JavaScript

**`firebase.js`**
Responsável por inicializar o aplicativo Firebase com as credenciais do projeto e exportar as instâncias de `auth` (Firebase Authentication) e `db` (Cloud Firestore) para uso nos demais módulos.

**`login.js`**
Gerencia exclusivamente o fluxo de autenticação: validação de campos, chamadas às funções do Firebase Auth (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `signInWithPopup`), tratamento de erros com mensagens em português e controle do estado de carregamento dos botões.

**`app.js`**
Módulo central da aplicação. Implementa um roteador simples baseado na detecção de elementos DOM para determinar em qual página está sendo executado e inicializar apenas as funções pertinentes. Contém toda a lógica de interação com o Firestore: carregamento de listas, criação, edição, exclusão, adição de itens e compartilhamento.

---

## 8. Modelo de Dados

### 8.1 Estrutura no Firestore

O Firestore organiza os dados em coleções de documentos. O projeto utiliza uma única coleção principal:

**Coleção: `listas`**

Cada documento representa uma lista pertencente a um usuário.

```json
{
  "nome": "Compras da Semana",
  "dono": "uid_firebase_do_usuario",
  "criadoEm": "2026-06-15T10:00:00Z",
  "compartilhados": ["contato@email.com"],
  "itens": [
    {
      "id": "1718400000000",
      "nome": "Arroz",
      "qtd": "2 kg",
      "concluido": false
    },
    {
      "id": "1718400001000",
      "nome": "Feijão",
      "qtd": "1 kg",
      "concluido": true
    }
  ]
}
```

### 8.2 Decisões de Modelagem

A opção de armazenar os itens e os e-mails compartilhados como **arrays dentro do documento da lista** (em vez de subcoleções separadas) foi uma decisão consciente de modelagem, baseada nos seguintes critérios:

- **Localidade de dados:** em operações de leitura do dashboard, todos os dados necessários para renderizar um card (nome, quantidade de itens, concluídos) são obtidos em uma única leitura de documento, sem joins ou subconsultas
- **Atomicidade:** a atualização de um item e seus metadados ocorre em uma única operação `updateDoc`, sem risco de inconsistência parcial
- **Simplicidade:** o modelo se alinha com a escala do projeto, onde o número de itens por lista é limitado e não justifica a complexidade de subcoleções

A desvantagem dessa abordagem — limitação de 1 MB por documento no Firestore — é irrelevante para o escopo da aplicação.

---

## 9. Implementação

### 9.1 Autenticação e Proteção de Rotas

A proteção das páginas internas é implementada por meio do listener `onAuthStateChanged`, que é executado automaticamente pelo Firebase SDK ao carregar a página. Caso não haja sessão ativa, o usuário é redirecionado para `login.html` antes que qualquer operação de banco de dados seja iniciada:

```javascript
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  currentUser = user;
  inicializarPagina(); // só executa após confirmar autenticação
});
```

Essa estrutura garante que nenhuma query ao Firestore seja disparada sem um usuário autenticado, prevenindo erros de permissão e possíveis exposições de dados.

### 9.2 Sincronização em Tempo Real

A sincronização é implementada com `onSnapshot`, que registra um listener persistente no documento ou coleção especificada. O callback é invocado imediatamente com o estado atual dos dados e novamente a cada alteração futura:

```javascript
onSnapshot(doc(db, "listas", listaId), (docSnap) => {
  listaCache = { id: docSnap.id, ...docSnap.data() };
  renderizarItens(listaCache);
  renderizarCompartilhados(listaCache);
});
```

Isso elimina a necessidade de requisições periódicas (polling) e garante que todos os clientes conectados à mesma lista vejam as alterações em tempo real.

### 9.3 Roteador de Página

O `app.js` é compartilhado entre `dashboard.html` e `lista.html`. Para determinar qual conjunto de funções inicializar, o módulo verifica a presença de elementos específicos do DOM:

```javascript
function inicializarPagina() {
  if (document.getElementById("listasContainer")) {
    carregarListas(); // estamos no dashboard
  } else if (document.getElementById("nomeLista")) {
    carregarDetalhesLista(); // estamos na lista
  }
}
```

### 9.4 Debounce no Salvamento do Nome

Para evitar uma escrita no Firestore a cada tecla digitada no campo de nome da lista, foi implementado um debounce de 600ms:

```javascript
let debounceNome;
nomeListaInput.addEventListener("input", () => {
  clearTimeout(debounceNome);
  debounceNome = setTimeout(async () => {
    await updateDoc(doc(db, "listas", listaId), { nome: nomeListaInput.value });
  }, 600);
});
```

### 9.5 Sistema de Design (CSS Custom Properties)

A interface é construída sobre um sistema de design tokens implementado com CSS Custom Properties (variáveis CSS), o que garante consistência visual e facilita futuras customizações:

```css
:root {
  --color-accent: #2563eb;
  --color-success: #10b981;
  --color-danger: #ef4444;
  --radius-md: 10px;
  --shadow-md: 0 4px 6px -1px rgba(15, 23, 42, 0.05);
  --transition-normal: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 10. Segurança

### 10.1 Regras do Firestore

O controle de acesso aos dados é garantido pelas Security Rules do Firestore, que são avaliadas no servidor antes de qualquer operação de leitura ou escrita:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /listas/{listaId} {
      // Somente o dono pode criar, ler e modificar sua lista
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.dono;

      // Qualquer usuário autenticado pode criar uma nova lista
      allow create: if request.auth != null;

      // Usuários com e-mail na lista de compartilhados podem ler
      allow read: if request.auth != null
        && request.auth.token.email in resource.data.compartilhados;
    }
  }
}
```

### 10.2 Validações no Cliente

Além das regras do servidor, o front-end implementa validações preventivas:

- Validação de formato de e-mail com expressão regular antes de adicionar ao compartilhamento
- Verificação de duplicatas na lista de compartilhados
- Verificação de campos obrigatórios antes de criar ou adicionar itens
- Confirmação explícita do usuário (diálogo `confirm`) antes de operações destrutivas (apagar lista, sair da conta)

### 10.3 Gerenciamento de Sessão

O Firebase Authentication gerencia automaticamente a persistência da sessão via tokens JWT armazenados no `indexedDB` do navegador. O token é renovado automaticamente antes de expirar, garantindo continuidade da sessão sem reautenticação manual.

---

## 11. Resultados Obtidos

Ao final do desenvolvimento, a aplicação atende integralmente aos requisitos funcionais estabelecidos:

| Requisito                             | Status       |
| ------------------------------------- | ------------ |
| Autenticação com e-mail e senha       | Implementado |
| Autenticação com conta Google         | Implementado |
| Criação e exclusão de listas          | Implementado |
| Adição e remoção de itens             | Implementado |
| Marcação de itens como concluídos     | Implementado |
| Compartilhamento de listas por e-mail | Implementado |
| Sincronização em tempo real           | Implementado |
| Persistência dos dados na nuvem       | Implementado |
| Proteção de rotas por autenticação    | Implementado |
| Interface responsiva                  | Implementado |

A aplicação demonstra com sucesso os princípios de sistemas distribuídos estudados na unidade curricular, em especial: transparência de acesso (o usuário interage com dados remotos como se fossem locais), transparência de replicação (o Firestore replica os dados internamente sem exposição ao cliente) e comunicação assíncrona baseada em eventos.

---

## 12. Dificuldades Encontradas e Soluções Aplicadas

### 12.1 Ausência de Integração com Firestore

**Problema:** a versão inicial da aplicação utilizava `localStorage` para armazenar todas as listas e itens. Embora funcional para uso individual em um único navegador, essa abordagem impossibilitava o compartilhamento real de dados entre usuários distintos e não atendia aos requisitos de um sistema distribuído.

**Solução:** migração completa da camada de persistência para o Cloud Firestore, com adição da exportação da instância `db` no módulo `firebase.js` (que originalmente exportava apenas `auth`) e reescrita de todas as funções de leitura e escrita para utilizar a API do Firestore com listeners reativos via `onSnapshot`.

### 12.2 Condição de Corrida na Inicialização

**Problema:** a inicialização da página de lista (`lista.html`) ocorria de forma síncrona ao carregar o módulo, antes que o Firebase confirmasse o estado de autenticação do usuário. Isso resultava em tentativas de acesso ao Firestore sem token de autenticação válido, gerando erros de permissão e falhas silenciosas no carregamento.

**Solução:** toda a lógica de inicialização foi movida para dentro do callback de `onAuthStateChanged`, garantindo que nenhuma operação de banco de dados seja executada antes da confirmação do usuário autenticado.

### 12.3 Falha na Navegação Entre Páginas

**Problema:** o identificador da lista ativa era armazenado em `localStorage` antes do redirecionamento de `dashboard.html` para `lista.html`. Em determinadas condições (especialmente em dispositivos mais lentos ou com cache bloqueado), o valor não estava disponível quando a página de lista tentava lê-lo, resultando em falha silenciosa sem carregamento da lista.

**Solução:** substituição de `localStorage` por `sessionStorage` para o ID da lista ativa. O `sessionStorage` tem escrita síncrona garantida dentro da mesma sessão de navegação, eliminando a condição de corrida. Adicionalmente, foi implementado um guard que redireciona ao dashboard caso o ID não seja encontrado, evitando estado indefinido na interface.

---

## 13. Conclusão

O desenvolvimento da **Lista Compartilhada** permitiu à equipe aplicar de forma prática os conceitos fundamentais de sistemas distribuídos estudados ao longo da unidade curricular. O projeto demonstra que é possível construir um sistema colaborativo em tempo real com sincronização entre múltiplos clientes utilizando exclusivamente tecnologias web nativas e serviços de nuvem acessíveis, sem a necessidade de um servidor backend dedicado.

A adoção do modelo BaaS (Backend as a Service) do Firebase revelou-se uma escolha adequada para o escopo do projeto, abstraindo a complexidade de gerenciamento de infraestrutura distribuída — como replicação de dados, gerenciamento de conexões simultâneas e renovação de tokens de autenticação — e permitindo que o foco do desenvolvimento recaísse sobre a lógica de negócio e a experiência do usuário.

Os desafios encontrados durante o desenvolvimento, documentados na Seção 12, reforçaram na prática conceitos como condições de corrida em operações assíncronas, gerenciamento de estado em aplicações multi-página e a importância das regras de segurança em sistemas que expõem dados a múltiplos usuários.

Como trabalhos futuros, identifica-se como oportunidades de evolução: a implementação de notificações em tempo real via Firebase Cloud Messaging, a adição de suporte offline com o cache do Firestore, a transformação em PWA (Progressive Web App) para instalação em dispositivos móveis e a implementação de categorias e prioridades nos itens das listas.

---

## 14. Referências

TANENBAUM, Andrew S.; VAN STEEN, Maarten. **Distributed Systems: Principles and Paradigms**. 2. ed. Upper Saddle River: Prentice Hall, 2007.

GOOGLE. **Firebase Documentation: Cloud Firestore**. Disponível em: https://firebase.google.com/docs/firestore. Acesso em: jun. 2026.

GOOGLE. **Firebase Documentation: Firebase Authentication**. Disponível em: https://firebase.google.com/docs/auth. Acesso em: jun. 2026.

GOOGLE. **Firebase Documentation: Security Rules**. Disponível em: https://firebase.google.com/docs/rules. Acesso em: jun. 2026.

MDN WEB DOCS. **JavaScript Modules**. Disponível em: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules. Acesso em: jun. 2026.

MDN WEB DOCS. **Using CSS Custom Properties**. Disponível em: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties. Acesso em: jun. 2026.

IETF. **RFC 7519: JSON Web Token (JWT)**. Disponível em: https://datatracker.ietf.org/doc/html/rfc7519. Acesso em: jun. 2026.

IETF. **RFC 6749: The OAuth 2.0 Authorization Framework**. Disponível em: https://datatracker.ietf.org/doc/html/rfc6749. Acesso em: jun. 2026.
