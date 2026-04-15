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


// MENSAGEM RÁPIDA 
function mostrarToast(mensagem) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerText = mensagem;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}