const URL_API =
  "https://api.escuelajs.co/api/v1/products/";

let produtos = [];
let proximoId = null;
let produtoEditandoId = null;
let fotoBase64 = null;
let paginaAtual = 1;

const ITENS_POR_PAGINA = 5;

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

async function buscarProdutos() {
  mostrarStatusLoading("Buscando produtos da API…");

  try {
    const resposta = await fetch(`${URL_API}?offset=0&limit=50`);

    if (!resposta.ok) throw new Error(`Erro HTTP ${resposta.status}`);

    const dados = await resposta.json();

    produtos = dados.map((p) => ({
      id: p.id,
      nome: p.title,
      sku: gerarSKU(p.title, p.id),
      categoria: p.category?.name || "Outros",
      preco: p.price,
      descricao: p.description || "",
      img: sanitizarImagem(p.images?.[0]),
    }));

    proximoId = Math.max(...produtos.map((p) => p.id)) + 1;

    popularFiltrosCategorias();
    paginaAtual = 1;
    renderizarTabela();
    esconderStatus();
    mostrarToast(`✅ ${produtos.length} produtos carregados com sucesso!`);
  } catch (erro) {
    console.error("Erro ao buscar produtos:", erro);
    mostrarStatusErro(`⚠️ Falha ao conectar com a API: ${erro.message}`);
    mostrarToast("❌ Não foi possível carregar os produtos.", "erro");
  }
}

function sanitizarImagem(url) {
  if (!url) return "https://placehold.co/44x44/d7eaff/4d5d6c?text=📦";
  try {
    const parsed = JSON.parse(url);
    if (Array.isArray(parsed) && parsed[0]) return parsed[0];
  } catch (_) {}
  return (
    url.replace(/["\[\]]/g, "").trim() ||
    "https://placehold.co/44x44/d7eaff/4d5d6c?text=📦"
  );
}

function exibirProdutos(lista) {
  tbody.innerHTML = "";

  if (!lista || lista.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding:32px; color:#697988;">
          Nenhum produto encontrado.
        </td>
      </tr>`;
    return;
  }

  lista.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <div class="prod-img">
          <img
            src="${p.img}"
            alt="${p.nome}"
            onerror="this.src='https://placehold.co/44x44/d7eaff/4d5d6c?text=📦'"
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
    tbody.appendChild(tr);
  });
}

function mostrarStatusLoading(msg) {
  let bar = document.getElementById("statusApiBar");
  if (!bar) bar = criarStatusBar();
  bar.style.display = "flex";
  bar.className = "status-bar status-loading";
  bar.innerHTML = `<span class="status-spinner"></span> ${msg}`;
}

function mostrarStatusErro(msg) {
  let bar = document.getElementById("statusApiBar");
  if (!bar) bar = criarStatusBar();
  bar.style.display = "flex";
  bar.className = "status-bar status-erro";
  bar.innerHTML = `${msg} <button onclick="buscarProdutos()" style="margin-left:12px;font-size:12px;border:1px solid #b31b25;border-radius:6px;padding:3px 10px;background:none;cursor:pointer;color:#b31b25;">Tentar novamente</button>`;
}

function esconderStatus() {
  const bar = document.getElementById("statusApiBar");
  if (bar) bar.style.display = "none";
}

function criarStatusBar() {
  const bar = document.createElement("div");
  bar.id = "statusApiBar";
  // Insere logo acima da tabela
  const tableCard =
    document.querySelector(".table-card") || tbody.closest("table");
  tableCard?.parentNode?.insertBefore(bar, tableCard);
  return bar;
}

function popularFiltrosCategorias() {
  const categorias = [...new Set(produtos.map((p) => p.categoria))].sort();
  const primeiraOpcao = selectFiltro.options[0]?.text || "Todas as Categorias";
  selectFiltro.innerHTML = `<option>${primeiraOpcao}</option>`;
  categorias.forEach((cat) => {
    const opt = document.createElement("option");
    opt.textContent = cat;
    selectFiltro.appendChild(opt);
  });
}

function criarCampoFoto() {
  const primeiroFormGroup = document.querySelector(
    ".modal .form-group:first-of-type",
  );
  if (!primeiroFormGroup || document.getElementById("dropzone")) return;

  const wrapper = document.createElement("div");
  wrapper.className = "form-group";
  wrapper.innerHTML = `
    <label>Foto do Produto</label>
    <div id="dropzone" style="
      border: 1.5px dashed #b0bec5; border-radius: 8px; padding: 18px 12px;
      text-align: center; cursor: pointer; background: #f8fafc;
      transition: background 0.2s; position: relative;
    ">
      <div id="dropzonePlaceholder" style="display:flex; flex-direction:column; align-items:center; gap:6px; pointer-events:none;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#90a4ae" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        <span style="font-size:13px; color:#546e7a;">Clique para selecionar ou arraste uma imagem</span>
        <small style="font-size:11px; color:#90a4ae;">PNG, JPG, WEBP — máx. 5 MB</small>
      </div>
      <div id="dropzonePreview" style="display:none; flex-direction:column; align-items:center; gap:10px;">
        <img id="imgPreview" src="" alt="preview" style="max-height:110px; max-width:100%; border-radius:8px; object-fit:cover;" />
        <span id="imgNome" style="font-size:12px; color:#546e7a;"></span>
        <button type="button" id="btnRemoverFoto" style="
          font-size:12px; border:1px solid #e57373; border-radius:6px;
          padding:4px 14px; background:none; cursor:pointer; color:#c62828;
        ">Remover foto</button>
      </div>
      <input type="file" id="inputFoto" accept="image/*" style="display:none;" />
    </div>
  `;

  primeiroFormGroup.parentNode.insertBefore(wrapper, primeiroFormGroup);
  inicializarEventosFoto();
}

function inicializarEventosFoto() {
  const inputFoto = document.getElementById("inputFoto");
  const dropzone = document.getElementById("dropzone");
  const btnRemoverFoto = document.getElementById("btnRemoverFoto");

  dropzone.addEventListener("click", (e) => {
    if (e.target === btnRemoverFoto || btnRemoverFoto.contains(e.target))
      return;
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
    dropzone.style.background = "#e3f2fd";
  });
  dropzone.addEventListener("dragleave", () => {
    dropzone.style.background = "#f8fafc";
  });
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.style.background = "#f8fafc";
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) mostrarPreviewFoto(file);
  });
}

function mostrarPreviewFoto(file) {
  if (file.size > 5 * 1024 * 1024) {
    mostrarToast("⚠️ Imagem muito grande. Máximo 5 MB.", "erro");
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    fotoBase64 = e.target.result;
    document.getElementById("imgPreview").src = fotoBase64;
    document.getElementById("imgNome").textContent = file.name;
    document.getElementById("dropzonePlaceholder").style.display = "none";
    document.getElementById("dropzonePreview").style.display = "flex";
  };
  reader.readAsDataURL(file);
}

function limparFoto() {
  fotoBase64 = null;
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
  fotoBase64 = img;
  const imgPreview = document.getElementById("imgPreview");
  const imgNome = document.getElementById("imgNome");
  const dropzonePlaceholder = document.getElementById("dropzonePlaceholder");
  const dropzonePreview = document.getElementById("dropzonePreview");

  if (imgPreview) imgPreview.src = img;
  if (imgNome) imgNome.textContent = "Imagem atual";
  if (dropzonePlaceholder) dropzonePlaceholder.style.display = "none";
  if (dropzonePreview) dropzonePreview.style.display = "flex";
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
    .map((p) => p[0] || "")
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

  exibirProdutos(pagina);

  paginacaoInfo.innerHTML = `Exibindo <strong>${pagina.length}</strong> de <strong>${total}</strong> produtos`;
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
  criarCampoFoto();
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
  criarCampoFoto();
  preencherFotoEdicao(prod.img);
  inputNome.focus();
}

function fecharModal() {
  overlay.classList.remove("active");
  limparFormulario();
  limparErros();
  const dropzoneWrapper = document.getElementById("dropzone");
  if (dropzoneWrapper) dropzoneWrapper.closest(".form-group").remove();
}

function limparFormulario() {
  inputNome.value = "";
  inputPreco.value = "";
  selectCategoria.value = selectCategoria.options[0]?.value || "";
  inputDescricao.value = "";
  limparFoto();
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
  const imgFinal =
    fotoBase64 || "https://placehold.co/44x44/d7eaff/4d5d6c?text=📦";

  if (produtoEditandoId !== null) {
    const prod = produtos.find((p) => p.id === produtoEditandoId);
    prod.nome = nome;
    prod.preco = preco;
    prod.categoria = categoria;
    prod.descricao = descricao;
    prod.img = imgFinal;
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
      img: imgFinal,
    });
    mostrarToast(`✅ "${nome}" adicionado com sucesso!`);
  }

  popularFiltrosCategorias();
  fecharModal();
  renderizarTabela();
}

function excluirProduto(id) {
  const prod = produtos.find((p) => p.id === id);
  if (!prod) return;
  if (!confirm(`Tem certeza que deseja excluir "${prod.nome}"?`)) return;
  produtos.splice(produtos.indexOf(prod), 1);
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

(function injetarEstilos() {
  const style = document.createElement("style");
  style.textContent = `
    /* Toast */
    .toast {
      position: fixed; bottom: 32px; right: 32px;
      padding: 14px 22px; border-radius: 8px;
      font-size: 14px; font-weight: bold; color: #fff;
      opacity: 0; transform: translateY(16px);
      transition: opacity .3s, transform .3s;
      z-index: 999; pointer-events: none;
    }
    .toast-visivel  { opacity: 1; transform: translateY(0); }
    .toast-sucesso  { background: #006a35; }
    .toast-erro     { background: #b31b25; }

    /* Validação */
    .campo-erro { border-color: #b31b25 !important; background: #fff5f5 !important; }
    .msg-erro   { font-size: 11px; color: #b31b25; margin-top: 2px; display: block; }

    /* Dropzone hover */
    #dropzone:hover { background: #eef4fb !important; border-color: #90a4ae; }

    /* Barra de status da API */
    .status-bar {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 16px; border-radius: 8px;
      font-size: 13.5px; font-weight: 500; margin-bottom: 12px;
    }
    .status-loading { background: #e8edff; color: #3b5bdb; }
    .status-erro    { background: #fff0f0; color: #b31b25; }

    /* Spinner de loading */
    .status-spinner {
      width: 15px; height: 15px; flex-shrink: 0;
      border: 2px solid currentColor; border-top-color: transparent;
      border-radius: 50%; animation: spin .6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Imagem com fallback */
    .prod-img img { display: block; width: 100%; height: 100%; object-fit: cover; }
  `;
  document.head.appendChild(style);
})();

buscarProdutos();
