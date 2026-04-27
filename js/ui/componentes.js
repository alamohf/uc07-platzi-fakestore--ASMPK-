function renderCard(produto) {
  let imagens = produto.images;
  if (typeof imagens === "string") {
    try { imagens = JSON.parse(imagens); } catch { imagens = []; }
  }

  // Limpeza robusta de caracteres como [ ] " \
  const imagem = imagens && imagens.length > 0
    ? imagens[0].replace(/[\[\]"\\ ]/g, "")
    : "https://via.placeholder.com/300";


  return `
    <div class="card">

       <img 
        src="${imagem}" 
        alt="${produto.title}"
        onerror="this.src='https://via.placeholder.com/300'"
      >
      
      <h3>${produto.title}</h3>

      <p class="preco">R$ ${produto.price}</p>
      
      <button onclick="verDetalhe(${produto.id})">
        Ver Detalhes
      </button>
    </div>
  `;
}

// REDIRECIONAR PARA DETALHE DO PRODUTO
function verDetalhe(id) {
  window.location.href = `produto.html?id=${id}`;
}

// LOADING
function renderLoading() {
  return `
    <p class="loading">Carregando...</p>
  `;
}

// FUNÇÃO PARA QUANDO NÃO TIVER PRODUTO
// RENDEREMPTY QUANDO NÃO APARECE O RESULTADO
function renderEmpty() {
  return `
    <p class="empty">Nenhum produto encontrado</p>
  `;
}

// MENSAGEM RÁPIDA TOAST
function mostrarToast(mensagem) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerText = mensagem;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function renderApiLinks() {
  const apiBaseAnchor = document.querySelector(".api-base-link");
  const apiDocAnchor = document.querySelector(".api-doc-link");

  if (apiBaseAnchor) {
    apiBaseAnchor.href = API_BASE_URL;
    apiBaseAnchor.innerText = API_BASE_URL;
  }

  if (apiDocAnchor) {
    apiDocAnchor.href = API_DOC_URL;
    apiDocAnchor.innerText = API_DOC_URL;
  }
}

renderApiLinks();

// MODAL
function mostrarModalConfirmação(mensagem, onConfirmar) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  const modal = document.createElement("div");
  modal.className = "modal";

  modal.innerHTML = `
    <p>${mensagem}</p>
    <div class="modal-botoes">
      <button class="btn-confirmar">Confirmar</button>
      <button class="btn-cancelar">Cancelar</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  modal.querySelector(".btn-confirmar").onclick = () => {
    onConfirmar();
    overlay.remove();
  };

  modal.querySelector(".btn-cancelar").onclick = () => {
    overlay.remove();
  };
}