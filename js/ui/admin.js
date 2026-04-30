/**
 * admin.js — CRUD de produtos (cadastro, edição, exclusão)
 * Responsável: Dev 3
 */

// TODO: implementar aoEnviarFormularioProduto()
// TODO: implementar aoSalvarEdicao()
// TODO: implementar aoClicarExcluir()
// TODO: implementar carregarListaAdmin()
const produtos = [
  {
    id: 1,
    nome: "Monolith Watch v1",
    sku: "MW-001",
    categoria: "Relojoaria",
    preco: 1240.0,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA3cHwvPerJaboN5m7GRxl2fxM0TsMmDoUSzX8MLkJHioRLzwjHSRzPDL7kAIZOytZMzcjov63HlNQgJ1PMKbgEjzB_am3HEiOcS6fDi5TDoStCAdCZ4bkB1Vu1fC6WGegfAg0iHE_yVz0-msD02GyOP1DoEY4MnkJGxrA0vihseC7UNLsItB6uIOZY4EEKasnkEHG-IFeqH_qFHp24Kfj38BU3BnBPea1Gp-i6talvwx006XfaXEFxhjKtw2M1KrRqfGVKVODPRnHJ",
    descricao: "",
  },
  {
    id: 2,
    nome: "AeroStride Runner",
    sku: "AS-992",
    categoria: "Esportivo",
    preco: 185.0,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAD4wIhBckhUnWIyytBiMoqub-UbtCcokKokPwZSPh1i2Vl7OR6ElNvcxMtKax6sWNgC7kfsOAFiRFJH2WeX9LczDetuedy0sAlWA5qytCxE4-J7jgKiEKMRuB6G2RU2PMkshSLLkdlErn_3bcQsMx8Yud_0G00RsWz3Akp4hbW_Ab-kZ0WYOhKcNWtf0vV5L49SCGSUl-X_pAIEx7O6NDvApJ_TT-xfeLjz_0-fXQAnLkbqDdcFkk5LQjshwdBGw6fc2O1CCT0MVce",
    descricao: "",
  },
  {
    id: 3,
    nome: "Sonic Zenith Pro",
    sku: "SZ-104",
    categoria: "Áudio",
    preco: 420.0,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAfQCOuyXt9945qoa7qxZD59sgGVXcb8ZlbYnB7gGDyKJgisqCoHO73bUC-sJ9NERV9dut5vzfYsuZjW5YFSUiLtidWTgFObzw0FTS6PKHs5bR-dfkNNhqar_SW5Q1__w2kF3n9F06Fw2iJh_q_PzcnLt_C5QTnDER1Ex7LE8xTeDAAooDaAMUR5d7a-MiKTgQXiK_ZZRurOXZL6GEvukJG8VtNhpFZjhvHcfPQfdJwKui0jE-WXHCtp3G89mOx28duhwpfZ3PbU8vr",
    descricao: "",
  },
  {
    id: 4,
    nome: "Nomad Leather Pack",
    sku: "NL-042",
    categoria: "Viagem",
    preco: 310.0,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBx8IGazfFBPjcAwqt2SfZJMe2yMlRLK36G2iqR6KhQdKPapwS5DNvF3oo1zXeYr9JjKoMsdGV4PXrghYswIIUIB3Ytmyhfls8ta-WHGVgxTWXM6EjxbzJ-WqAlvJhP1AM45JHze8o4IrZvQ1xe2PXL0pKV4rbkd3Z_zZn89F8v4_B0Gt7XiEMxqTE7xXXed9KgJoiaKdCiNXmWR4WdHaYnpj-he1iRGGrhvgaLtxoDdIfCjI4z03GdKxcnicVKi9J1O4R0pDxnJ-33",
    descricao: "",
  },
];

let proximoId = 5;
let produtoEditandoId = null;

const tbody = document.querySelector("tbody");
const overlay = document.getElementById("modalOverlay");
const btnAdd = document.querySelector(".btn-add");
const btnFechar = document.getElementById("btnFechar");
const btnSubmit = document.querySelector(".btn-submit");
const inputBusca = document.querySelector(".toolbar input");
const selectFiltro = document.querySelector(".toolbar select");
const modalTitulo = document.querySelector(".modal h2");
const modalSubtitle = document.querySelector(".modal-subtitle");

const inputNome = document.querySelector(
  ".modal .form-group:nth-child(3) input",
);
const inputPreco = document.querySelector(
  ".modal .form-row .form-group:first-child input",
);
const selectCategoria = document.querySelector(
  ".modal .form-row .form-group:last-child select",
);
const inputDescricao = document.querySelector(".modal textarea");

const paginacaoInfo = document.querySelector(".pagination span");
const btnAnterior = document.querySelector(".pagination button:first-of-type");
const btnProximo = document.querySelector(".pagination button:last-of-type");

const ITENS_POR_PAGINA = 5;
let paginaAtual = 1;

function formatarPreco(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function gerarSKU(nome, id) {
  const sigla = nome
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);
  return `${sigla}-${String(id).padStart(3, "0")}`;
}

function mostrarToast(mensagem, tipo = "sucesso") {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = mensagem;
  toast.className = `toast toast-${tipo} toast-visivel`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(
    () => toast.classList.remove("toast-visivel"),
    3000,
  );
}

function filtrarProdutos() {
  const busca = inputBusca.value.toLowerCase();
  const categoria = selectFiltro.value;
  return produtos.filter((p) => {
    const matchBusca =
      p.nome.toLowerCase().includes(busca) ||
      p.sku.toLowerCase().includes(busca);
    const matchCategoria =
      categoria === "Todas as Categorias" || p.categoria === categoria;
    return matchBusca && matchCategoria;
  });
}

function renderizarTabela() {
  const filtrados = filtrarProdutos();
  const total = filtrados.length;
  const totalPaginas = Math.max(1, Math.ceil(total / ITENS_POR_PAGINA));

  if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;

  const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const pagina = filtrados.slice(inicio, inicio + ITENS_POR_PAGINA);

  tbody.innerHTML = "";

  if (pagina.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding: 32px; color: #697988;">
          Nenhum produto encontrado.
        </td>
      </tr>`;
  } else {
    pagina.forEach((p) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><div class="prod-img"><img src="${p.img}" alt="${p.nome}" /></div></td>
        <td>
          <div class="prod-name">${p.nome}</div>
          <div class="prod-sku">SKU: ${p.sku}</div>
        </td>
        <td><span class="badge">${p.categoria}</span></td>
        <td class="price">${formatarPreco(p.preco)}</td>
        <td class="actions">
          <button title="Editar" data-id="${p.id}" class="btn-editar">✏️</button>
          <button title="Excluir" data-id="${p.id}" class="del btn-excluir">🗑️</button>
        </td>`;
      tbody.appendChild(tr);
    });
  }

  const exibindo = pagina.length;
  paginacaoInfo.innerHTML = `Exibindo <strong>${exibindo}</strong> de <strong>${total}</strong> produtos`;
  btnAnterior.disabled = paginaAtual === 1;
  btnProximo.disabled = paginaAtual >= totalPaginas;
}

function abrirModalNovo() {
  produtoEditandoId = null;
  modalTitulo.textContent = "Adicionar Novo Produto";
  modalSubtitle.textContent =
    "Insira os detalhes do produto para listar na vitrine.";
  btnSubmit.textContent = "Criar Anúncio de Produto";
  limparFormulario();
  overlay.classList.add("active");
  inputNome.focus();
}

function abrirModalEditar(id) {
  const prod = produtos.find((p) => p.id === id);
  if (!prod) return;
  produtoEditandoId = id;
  modalTitulo.textContent = "Editar Produto";
  modalSubtitle.textContent = "Atualize os detalhes do produto.";
  btnSubmit.textContent = "Salvar Alterações";
  inputNome.value = prod.nome;
  inputPreco.value = prod.preco;
  selectCategoria.value = prod.categoria;
  inputDescricao.value = prod.descricao;
  overlay.classList.add("active");
  inputNome.focus();
}

function fecharModal() {
  overlay.classList.remove("active");
  limparFormulario();
  limparErros();
}

function limparFormulario() {
  inputNome.value = "";
  inputPreco.value = "";
  selectCategoria.value = "Relojoaria";
  inputDescricao.value = "";
}

function limparErros() {
  document
    .querySelectorAll(".campo-erro")
    .forEach((el) => el.classList.remove("campo-erro"));
  document.querySelectorAll(".msg-erro").forEach((el) => el.remove());
}

function mostrarErro(input, mensagem) {
  input.classList.add("campo-erro");
  const msg = document.createElement("span");
  msg.className = "msg-erro";
  msg.textContent = mensagem;
  input.parentNode.appendChild(msg);
}

function validarFormulario() {
  limparErros();
  let valido = true;

  if (!inputNome.value.trim()) {
    mostrarErro(inputNome, "O nome do produto é obrigatório.");
    valido = false;
  }

  const preco = parseFloat(inputPreco.value);
  if (!inputPreco.value || isNaN(preco) || preco <= 0) {
    mostrarErro(inputPreco, "Informe um preço válido maior que zero.");
    valido = false;
  }

  return valido;
}

function salvarProduto() {
  if (!validarFormulario()) return;

  const nome = inputNome.value.trim();
  const preco = parseFloat(inputPreco.value);
  const categoria = selectCategoria.value;
  const descricao = inputDescricao.value.trim();

  if (produtoEditandoId !== null) {
    const prod = produtos.find((p) => p.id === produtoEditandoId);
    prod.nome = nome;
    prod.preco = preco;
    prod.categoria = categoria;
    prod.descricao = descricao;
    mostrarToast(`✅ "${nome}" atualizado com sucesso!`);
  } else {
    const id = proximoId++;
    const sku = gerarSKU(nome, id);
    produtos.push({
      id,
      nome,
      sku,
      categoria,
      preco,
      descricao,
      img: "https://placehold.co/44x44/d7eaff/4d5d6c?text=📦",
    });
    mostrarToast(`✅ "${nome}" adicionado com sucesso!`);
  }

  fecharModal();
  renderizarTabela();
}

function excluirProduto(id) {
  const prod = produtos.find((p) => p.id === id);
  if (!prod) return;
  const confirmar = confirm(`Tem certeza que deseja excluir "${prod.nome}"?`);
  if (!confirmar) return;
  const idx = produtos.indexOf(prod);
  produtos.splice(idx, 1);
  mostrarToast(`🗑️ "${prod.nome}" removido.`, "erro");
  renderizarTabela();
}

document.querySelectorAll("nav a").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    document
      .querySelectorAll("nav a")
      .forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
  });
});

btnAdd.addEventListener("click", abrirModalNovo);

btnFechar.addEventListener("click", fecharModal);
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) fecharModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && overlay.classList.contains("active")) fecharModal();
});

btnSubmit.addEventListener("click", salvarProduto);

tbody.addEventListener("click", (e) => {
  const btnEditar = e.target.closest(".btn-editar");
  const btnExcluir = e.target.closest(".btn-excluir");
  if (btnEditar) abrirModalEditar(Number(btnEditar.dataset.id));
  if (btnExcluir) excluirProduto(Number(btnExcluir.dataset.id));
});

inputBusca.addEventListener("input", () => {
  paginaAtual = 1;
  renderizarTabela();
});

selectFiltro.addEventListener("change", () => {
  paginaAtual = 1;
  renderizarTabela();
});

btnAnterior.addEventListener("click", () => {
  if (paginaAtual > 1) {
    paginaAtual--;
    renderizarTabela();
  }
});
btnProximo.addEventListener("click", () => {
  paginaAtual++;
  renderizarTabela();
});

(function injetarEstilosToast() {
  const style = document.createElement("style");
  style.textContent = `
    .toast {
      position: fixed;
      bottom: 32px;
      right: 32px;
      padding: 14px 22px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: bold;
      color: #fff;
      opacity: 0;
      transform: translateY(16px);
      transition: opacity 0.3s, transform 0.3s;
      z-index: 999;
      pointer-events: none;
    }
    .toast-visivel {
      opacity: 1;
      transform: translateY(0);
    }
    .toast-sucesso { background: #006a35; }
    .toast-erro    { background: #b31b25; }

    .campo-erro {
      border-color: #b31b25 !important;
      background: #fff5f5 !important;
    }
    .msg-erro {
      font-size: 11px;
      color: #b31b25;
      margin-top: 2px;
    }
  `;
  document.head.appendChild(style);
})();

renderizarTabela();
