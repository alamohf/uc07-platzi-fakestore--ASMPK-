// CARD DOS PRODUTO
function renderCard(produto) {
  return `
    <div class="card">
      <img src="${produto.images[0]}" alt="${produto.title}">
      
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

// MODAL
function mostrarModalConfirmação(mensagem, onConfirmar){
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
    