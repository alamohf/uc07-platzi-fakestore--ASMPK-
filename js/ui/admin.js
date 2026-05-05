const API_URL = "https://api.escuelajs.co/api/v1/products/";
const ITENS_POR_PAGINA = 5;
const IMG_PLACEHOLDER = "https://placehold.co/44x44/d7eaff/4d5d6c?text=📦";

const state = {
  produtos: [],
  proximoId: 1,
  produtoEditandoId: null,
  fotoBase64: null,
  paginaAtual: 1,
};

function $(seletor, raiz = document) {
  const el = raiz.querySelector(seletor);
  if (!el) console.warn(`Elemento não encontrado: "${seletor}"`);
  return el;
}

function formatarPreco(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function gerarSKU(nome, id) {
  const sigla = nome
    .split(" ")
    .map((p) => p[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 3);
  return `${sigla}-${String(id).padStart(3, "0")}`;
}

function sanitizarImagem(url) {
  if (!url) return IMG_PLACEHOLDER;
  try {
    const parsed = JSON.parse(url);
    if (Array.isArray(parsed) && parsed[0]) return parsed[0];
  } catch {
    // não é JSON
  }
  const limpa = url.replace(/["\[\]]/g, "").trim();
  return limpa || IMG_PLACEHOLDER;
}

function normalizarProduto(p) {
  return {
    id: p.id,
    nome: p.title,
    sku: gerarSKU(p.title, p.id),
    categoria: p.category?.name ?? "Outros",
    preco: p.price,
    descricao: p.description ?? "",
    img: sanitizarImagem(p.images?.[0]),
  };
}

async function buscarProdutos() {
  mostrarStatusLoading("Buscando produtos da API…");

  try {
    const resposta = await fetch(`${API_URL}?offset=0&limit=50`);
    if (!resposta.ok) throw new Error(`Erro HTTP ${resposta.status}`);

    const dados = await resposta.json();
    state.produtos = dados.map(normalizarProduto);
    state.proximoId = Math.max(...state.produtos.map((p) => p.id)) + 1;
    state.paginaAtual = 1;

    popularFiltrosCategorias();
    renderizarTabela();
    esconderStatus();
    mostrarToast(
      `✅ ${state.produtos.length} produtos carregados com sucesso!`,
    );
  } catch (erro) {
    console.error("Erro ao buscar produtos:", erro);
    mostrarStatusErro(`⚠️ Falha ao conectar com a API: ${erro.message}`);
    mostrarToast("❌ Não foi possível carregar os produtos.", "erro");
  }
}

const DOM = {
  tbody: $("tbody"),
  overlay: $("#modalOverlay"),
  btnAdd: $(".btn-add"),
  btnFechar: $("#btnFechar"),
  btnSubmit: $(".btn-submit"),
  inputBusca: $(".toolbar input"),
  selectFiltro: $(".toolbar select"),
  modalTitulo: $(".modal h2"),
  modalSubtitle: $(".modal-subtitle"),
  inputNome: $(".modal .form-group:nth-child(3) input"),
  inputPreco: $(".modal .form-row .form-group:first-child input"),
  selectCategoria: $(".modal .form-row .form-group:last-child select"),
  inputDescricao: $(".modal textarea"),
  paginacaoInfo: $(".pagination span"),
  btnAnterior: $(".pagination button:first-of-type"),
  btnProximo: $(".pagination button:last-of-type"),
};

function criarLinhaProduto(p) {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>
      <div class="prod-img">
        <img
          src="${p.img}"
          alt="${p.nome}"
          loading="lazy"
          onerror="this.src='${IMG_PLACEHOLDER}'"
        />
      </div>
    </td>
    <td>
      <div class="prod-name">${p.nome}</div>
      <div class="prod-sku">SKU: ${p.sku}</div>
    </td>
    <td><span class="badge">${p.categoria}</span></td>
    <td class="price">${formatarPreco(p.preco)}</td>
    <td class="actions">
      <button title="Editar"  data-id="${p.id}" class="btn-editar">✏️</button>
      <button title="Excluir" data-id="${p.id}" class="del btn-excluir">🗑️</button>
    </td>`;
  return tr;
}

function exibirProdutos(lista) {
  DOM.tbody.innerHTML = "";

  if (!lista?.length) {
    DOM.tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding:32px; color:#697988;">
          Nenhum produto encontrado.
        </td>
      </tr>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  lista.forEach((p) => fragment.appendChild(criarLinhaProduto(p)));
  DOM.tbody.appendChild(fragment);
}

function filtrarProdutos() {
  const busca = DOM.inputBusca.value.toLowerCase().trim();
  const categoria = DOM.selectFiltro.value;

  return state.produtos.filter((p) => {
    const matchBusca =
      !busca ||
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

  state.paginaAtual = Math.min(state.paginaAtual, totalPaginas);

  const inicio = (state.paginaAtual - 1) * ITENS_POR_PAGINA;
  const paginaAtiva = filtrados.slice(inicio, inicio + ITENS_POR_PAGINA);

  exibirProdutos(paginaAtiva);

  DOM.paginacaoInfo.innerHTML = `
    Exibindo <strong>${paginaAtiva.length}</strong>
    de <strong>${total}</strong> produtos`;
  DOM.btnAnterior.disabled = state.paginaAtual === 1;
  DOM.btnProximo.disabled = state.paginaAtual >= totalPaginas;
}

function popularFiltrosCategorias() {
  const categorias = [
    ...new Set(state.produtos.map((p) => p.categoria)),
  ].sort();
  const primeiraOpcao =
    DOM.selectFiltro.options[0]?.text ?? "Todas as Categorias";

  DOM.selectFiltro.innerHTML = `<option>${primeiraOpcao}</option>`;
  categorias.forEach((cat) => {
    const opt = document.createElement("option");
    opt.textContent = cat;
    DOM.selectFiltro.appendChild(opt);
  });
}

function abrirModalNovo() {
  state.produtoEditandoId = null;
  DOM.modalTitulo.textContent = "Adicionar Novo Produto";
  DOM.modalSubtitle.textContent =
    "Insira os detalhes do produto para listar na vitrine.";
  DOM.btnSubmit.textContent = "Criar Anúncio de Produto";
  limparFormulario();
  DOM.overlay.classList.add("active");
  criarCampoFoto();
  DOM.inputNome.focus();
}

function abrirModalEditar(id) {
  const prod = state.produtos.find((p) => p.id === id);
  if (!prod) return;

  state.produtoEditandoId = id;
  DOM.modalTitulo.textContent = "Editar Produto";
  DOM.modalSubtitle.textContent = "Atualize os detalhes do produto.";
  DOM.btnSubmit.textContent = "Salvar Alterações";
  DOM.inputNome.value = prod.nome;
  DOM.inputPreco.value = prod.preco;
  DOM.selectCategoria.value = prod.categoria;
  DOM.inputDescricao.value = prod.descricao;

  DOM.overlay.classList.add("active");
  criarCampoFoto();
  preencherFotoEdicao(prod.img);
  DOM.inputNome.focus();
}

function fecharModal() {
  DOM.overlay.classList.remove("active");
  limparFormulario();
  limparErros();
  removerCampoFoto();
}

function limparFormulario() {
  DOM.inputNome.value = "";
  DOM.inputPreco.value = "";
  DOM.selectCategoria.value = DOM.selectCategoria.options[0]?.value ?? "";
  DOM.inputDescricao.value = "";
  limparFoto();
}

function removerCampoFoto() {
  const dropzone = document.getElementById("dropzone");
  if (dropzone) dropzone.closest(".form-group")?.remove();
}

function criarCampoFoto() {
  if (document.getElementById("dropzone")) return;

  const primeiroFormGroup = $(".modal .form-group:first-of-type");
  if (!primeiroFormGroup) return;

  const wrapper = document.createElement("div");
  wrapper.className = "form-group";
  wrapper.innerHTML = `
    <label>Foto do Produto</label>
    <div id="dropzone" class="dropzone">
      <div id="dropzonePlaceholder" class="dropzone-placeholder">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
             stroke="#90a4ae" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        <span>Clique para selecionar ou arraste uma imagem</span>
        <small>PNG, JPG, WEBP — máx. 5 MB</small>
      </div>
      <div id="dropzonePreview" class="dropzone-preview" style="display:none;">
        <img id="imgPreview" src="" alt="preview" />
        <span id="imgNome"></span>
        <button type="button" id="btnRemoverFoto" class="btn-remover-foto">
          Remover foto
        </button>
      </div>
      <input type="file" id="inputFoto" accept="image/*" style="display:none;" />
    </div>`;

  primeiroFormGroup.parentNode.insertBefore(wrapper, primeiroFormGroup);
  inicializarEventosFoto();
}

function inicializarEventosFoto() {
  const inputFoto = document.getElementById("inputFoto");
  const dropzone = document.getElementById("dropzone");
  const btnRemoverFoto = document.getElementById("btnRemoverFoto");

  dropzone.addEventListener("click", (e) => {
    if (btnRemoverFoto.contains(e.target)) return;
    inputFoto.click();
  });

  inputFoto.addEventListener("change", (e) => {
    if (e.target.files[0]) mostrarPreviewFoto(e.target.files[0]);
  });

  btnRemoverFoto.addEventListener("click", (e) => {
    e.stopPropagation();
    limparFoto();
  });

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dropzone--over");
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("dropzone--over");
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dropzone--over");
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) mostrarPreviewFoto(file);
  });
}

function mostrarPreviewFoto(file) {
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    mostrarToast("⚠️ Imagem muito grande. Máximo 5 MB.", "erro");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    state.fotoBase64 = e.target.result;
    document.getElementById("imgPreview").src = state.fotoBase64;
    document.getElementById("imgNome").textContent = file.name;
    document.getElementById("dropzonePlaceholder").style.display = "none";
    document.getElementById("dropzonePreview").style.display = "flex";
  };
  reader.readAsDataURL(file);
}

function limparFoto() {
  state.fotoBase64 = null;
  const inputFoto = document.getElementById("inputFoto");
  const imgPreview = document.getElementById("imgPreview");
  const imgNome = document.getElementById("imgNome");
  const dropzonePlaceholder = document.getElementById("dropzonePlaceholder");
  const dropzonePreview = document.getElementById("dropzonePreview");

  if (inputFoto) inputFoto.value = "";
  if (imgPreview) imgPreview.src = "";
  if (imgNome) imgNome.textContent = "";
  if (dropzonePreview) dropzonePreview.style.display = "none";
  if (dropzonePlaceholder) dropzonePlaceholder.style.display = "flex";
}

function preencherFotoEdicao(img) {
  state.fotoBase64 = img;
  const imgPreview = document.getElementById("imgPreview");
  const imgNome = document.getElementById("imgNome");
  const dropzonePlaceholder = document.getElementById("dropzonePlaceholder");
  const dropzonePreview = document.getElementById("dropzonePreview");

  if (imgPreview) imgPreview.src = img;
  if (imgNome) imgNome.textContent = "Imagem atual";
  if (dropzonePlaceholder) dropzonePlaceholder.style.display = "none";
  if (dropzonePreview) dropzonePreview.style.display = "flex";
}

function validarFormulario() {
  limparErros();
  let valido = true;

  if (!DOM.inputNome.value.trim()) {
    mostrarErro(DOM.inputNome, "O nome do produto é obrigatório.");
    valido = false;
  }

  const preco = parseFloat(DOM.inputPreco.value);
  if (!DOM.inputPreco.value || isNaN(preco) || preco <= 0) {
    mostrarErro(DOM.inputPreco, "Informe um preço válido maior que zero.");
    valido = false;
  }

  return valido;
}

function salvarProduto() {
  if (!validarFormulario()) return;

  const nome = DOM.inputNome.value.trim();
  const preco = parseFloat(DOM.inputPreco.value);
  const categoria = DOM.selectCategoria.value;
  const descricao = DOM.inputDescricao.value.trim();
  const imgFinal = state.fotoBase64 ?? IMG_PLACEHOLDER;

  if (state.produtoEditandoId !== null) {
    const prod = state.produtos.find((p) => p.id === state.produtoEditandoId);
    if (!prod) return;
    Object.assign(prod, { nome, preco, categoria, descricao, img: imgFinal });
    mostrarToast(`✅ "${nome}" atualizado com sucesso!`);
  } else {
    const id = state.proximoId++;
    state.produtos.push({
      id,
      nome,
      sku: gerarSKU(nome, id),
      categoria,
      preco,
      descricao,
      img: imgFinal,
    });
    mostrarToast(`✅ "${nome}" adicionado com sucesso!`);
  }

  popularFiltrosCategorias();
  fecharModal();
  renderizarTabela();
}

function excluirProduto(id) {
  const prod = state.produtos.find((p) => p.id === id);
  if (!prod) return;
  if (!confirm(`Tem certeza que deseja excluir "${prod.nome}"?`)) return;

  state.produtos = state.produtos.filter((p) => p.id !== id);
  mostrarToast(`🗑️ "${prod.nome}" removido.`, "erro");
  renderizarTabela();
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

function obterOuCriarStatusBar() {
  let bar = document.getElementById("statusApiBar");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "statusApiBar";
    const tableCard = $(".table-card") ?? DOM.tbody.closest("table");
    tableCard?.parentNode?.insertBefore(bar, tableCard);
  }
  return bar;
}

function mostrarStatusLoading(msg) {
  const bar = obterOuCriarStatusBar();
  bar.style.display = "flex";
  bar.className = "status-bar status-loading";
  bar.innerHTML = `<span class="status-spinner"></span> ${msg}`;
}

function mostrarStatusErro(msg) {
  const bar = obterOuCriarStatusBar();
  bar.style.display = "flex";
  bar.className = "status-bar status-erro";
  bar.innerHTML = `
    ${msg}
    <button onclick="buscarProdutos()" class="btn-tentar-novamente">
      Tentar novamente
    </button>`;
}

function esconderStatus() {
  const bar = document.getElementById("statusApiBar");
  if (bar) bar.style.display = "none";
}

function mostrarErro(input, mensagem) {
  input.classList.add("campo-erro");
  const msg = document.createElement("span");
  msg.className = "msg-erro";
  msg.textContent = mensagem;
  input.parentNode.appendChild(msg);
}

function limparErros() {
  document
    .querySelectorAll(".campo-erro")
    .forEach((el) => el.classList.remove("campo-erro"));
  document.querySelectorAll(".msg-erro").forEach((el) => el.remove());
}

(function injetarEstilos() {
  const style = document.createElement("style");
  style.textContent = `
    /* ── Toast ── */
    .toast {
      position: fixed; bottom: 32px; right: 32px;
      padding: 14px 22px; border-radius: 8px;
      font-size: 14px; font-weight: bold; color: #fff;
      opacity: 0; transform: translateY(16px);
      transition: opacity .3s, transform .3s;
      z-index: 999; pointer-events: none;
    }
    .toast-visivel { opacity: 1; transform: translateY(0); }
    .toast-sucesso  { background: #006a35; }
    .toast-erro     { background: #b31b25; }

    /* ── Validação ── */
    .campo-erro { border-color: #b31b25 !important; background: #fff5f5 !important; }
    .msg-erro   { font-size: 11px; color: #b31b25; margin-top: 2px; display: block; }

    /* ── Status bar ── */
    .status-bar {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 16px; border-radius: 8px;
      font-size: 13.5px; font-weight: 500; margin-bottom: 12px;
    }
    .status-loading { background: #e8edff; color: #3b5bdb; }
    .status-erro    { background: #fff0f0; color: #b31b25; }
    .btn-tentar-novamente {
      margin-left: 12px; font-size: 12px; border: 1px solid #b31b25;
      border-radius: 6px; padding: 3px 10px; background: none;
      cursor: pointer; color: #b31b25;
    }

    /* ── Spinner ── */
    .status-spinner {
      width: 15px; height: 15px; flex-shrink: 0;
      border: 2px solid currentColor; border-top-color: transparent;
      border-radius: 50%; animation: spin .6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Dropzone ── */
    .dropzone {
      border: 1.5px dashed #b0bec5; border-radius: 8px;
      padding: 18px 12px; text-align: center; cursor: pointer;
      background: #f8fafc; transition: background 0.2s;
    }
    .dropzone:hover,
    .dropzone--over { background: #eef4fb !important; border-color: #90a4ae; }

    .dropzone-placeholder {
      display: flex; flex-direction: column;
      align-items: center; gap: 6px; pointer-events: none;
    }
    .dropzone-placeholder span { font-size: 13px; color: #546e7a; }
    .dropzone-placeholder small { font-size: 11px; color: #90a4ae; }

    .dropzone-preview {
      flex-direction: column; align-items: center; gap: 10px;
    }
    .dropzone-preview img {
      max-height: 110px; max-width: 100%;
      border-radius: 8px; object-fit: cover;
    }
    .dropzone-preview span { font-size: 12px; color: #546e7a; }

    .btn-remover-foto {
      font-size: 12px; border: 1px solid #e57373; border-radius: 6px;
      padding: 4px 14px; background: none; cursor: pointer; color: #c62828;
    }

    /* ── Imagem do produto ── */
    .prod-img img { display: block; width: 100%; height: 100%; object-fit: cover; }
  `;
  document.head.appendChild(style);
})();

document.querySelectorAll("nav a").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    document
      .querySelectorAll("nav a")
      .forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
  });
});

DOM.btnAdd.addEventListener("click", abrirModalNovo);
DOM.btnFechar.addEventListener("click", fecharModal);
DOM.btnSubmit.addEventListener("click", salvarProduto);

DOM.overlay.addEventListener("click", (e) => {
  if (e.target === DOM.overlay) fecharModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && DOM.overlay.classList.contains("active"))
    fecharModal();
});

DOM.tbody.addEventListener("click", (e) => {
  const btnEditar = e.target.closest(".btn-editar");
  const btnExcluir = e.target.closest(".btn-excluir");
  if (btnEditar) abrirModalEditar(Number(btnEditar.dataset.id));
  if (btnExcluir) excluirProduto(Number(btnExcluir.dataset.id));
});

DOM.inputBusca.addEventListener("input", () => {
  state.paginaAtual = 1;
  renderizarTabela();
});

DOM.selectFiltro.addEventListener("change", () => {
  state.paginaAtual = 1;
  renderizarTabela();
});

DOM.btnAnterior.addEventListener("click", () => {
  if (state.paginaAtual > 1) {
    state.paginaAtual--;
    renderizarTabela();
  }
});

DOM.btnProximo.addEventListener("click", () => {
  state.paginaAtual++;
  renderizarTabela();
});

buscarProdutos();
