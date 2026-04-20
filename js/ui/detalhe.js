const containerDetalhe = document.querySelector("#produto-detalhe");
const containerRelacionados = document.querySelector(".lista-relacionados");

// PEGAR ID DA URL

const params = new URLSearchParams(window.location.search);
const id = params.get("id");


// CARREGAR PRODUTO

async function carregarProduto(id) {
  try {
    containerDetalhe.innerHTML = renderLoading();

    const res = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!res.ok) throw new Error("Erro ao carregar produto");

    const produto = await res.json();

    renderProduto(produto);
  } catch (erro) {
    containerDetalhe.innerHTML = renderEmpty();
    mostrarToast("Erro ao carregar produto");
  }
}


// RENDER PRODUTO

function renderProduto(produto) {
  const imagem = produto.images?.[0] || "https://via.placeholder.com/300";

  containerDetalhe.innerHTML = `
    <div class="produto-container">

      <div class="produto-imagem">
        <img 
          src="${imagem}" 
          alt="${produto.title}"
          onerror="this.src='https://via.placeholder.com/300'"
        >
      </div>

      <div class="produto-info">
        <h2 class="produto-titulo">${produto.title}</h2>

        <p class="preco">R$ ${produto.price}</p>

        <p class="descricao">${produto.description}</p>

        <span class="categoria">${produto.category?.name || "Sem categoria"}</span>

        <button class="btn-comprar" onclick="comprarProduto()">
          Comprar
        </button>
      </div>

    </div>
  `;
}


// AÇÃO DE COMPRA

function comprarProduto() {
  mostrarToast("Produto adicionado ao carrinho!");
}


// CARREGAR RELACIONADOS


async function carregarRelacionados(id) {
  try {
    containerRelacionados.innerHTML = renderLoading();

    const res = await fetch(`${API_BASE_URL}/products/${id}/related`);
    if (!res.ok) throw new Error("Erro ao carregar relacionados");

    const produtos = await res.json();

    if (!produtos.length) {
      containerRelacionados.innerHTML = renderEmpty();
      return;
    }

    containerRelacionados.innerHTML = produtos.map(renderCard).join("");
  } catch (erro) {
    containerRelacionados.innerHTML = renderEmpty();
    mostrarToast("Erro ao carregar relacionados");
  }
}


// INICIAR

if (id) {
  carregarProduto(id);
  carregarRelacionados(id);
} else {
  containerDetalhe.innerHTML = renderEmpty();
  mostrarToast("Produto não encontrado");
}