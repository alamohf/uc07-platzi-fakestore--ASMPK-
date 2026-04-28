const containerDetalhe = document.querySelector("#produto-detalhe");
const containerRelacionados = document.querySelector(".lista-relacionados");

function extrairUrlImagem(produto) {
  let imagens = produto.images;

  // 1. Tratamento caso a API envie uma string em vez de um array
  if (typeof imagens === "string") {
    try {
      imagens = JSON.parse(imagens);
    } catch (e) {
      // Se não for um JSON válido, mantemos como está para o replace limpar depois
    }
  }

  // 2. Pega a primeira imagem ou tenta a imagem da categoria como plano B
  let urlBruta = (Array.isArray(imagens) && imagens.length > 0) 
    ? imagens[0] 
    : (produto.category?.image || "");

  // 3. LIMPEZA TOTAL (Remove [ ] " \ e espaços extras)
  let urlLimpa = urlBruta.replace(/[\[\]"\\ ]/g, "");

  // 4. VALIDAÇÃO DE PROTOCOLO
  // Se não começar com http ou for apenas texto (comum nessa API), usa um placeholder estável
  if (!urlLimpa.startsWith("http")) {
    return "https://picsum.photos/600/400"; 
  }

  return urlLimpa;
}


// PEGAR ID DA URL

const params = new URLSearchParams(window.location.search);
const id = params.get("id") || 4;

// CARREGAR PRODUTO

async function carregarProduto(id) {
  try {
    containerDetalhe.innerHTML = renderLoading();

    var produto = await buscarProdutoPorId(id);
    renderProduto(produto);
  } catch (erro) {
    containerDetalhe.innerHTML = renderEmpty();
    mostrarToast("Erro ao carregar produto");
    console.error(erro);
  }
}

// RENDER PRODUTO

function renderProduto(produto) {
 
  let imagens = produto.images;

if (typeof imagens === "string") {
  try {
    imagens = JSON.parse(imagens);
  } catch {
    imagens = [];
  }
}

const imagem = imagens?.[0]?.replace (/[\[\]"]/g, "") || 
"https://via.placeholder.com/300";

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

        <button class="btn-comprar" 
    onclick="comprarProduto()">
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

    var produtos = await buscarProdutosRelacionados(id);

    if (!produtos.length) {
      containerRelacionados.innerHTML = renderEmpty();
      return;
    }

    containerRelacionados.innerHTML = produtos.map(renderCard).join("");
  } catch (erro) {
      containerRelacionados.innerHTML = renderEmpty();
    mostrarToast("Erro ao carregar relacionados");
    console.error(erro);
  }
}

// INICIAR

  carregarProduto(id);
  carregarRelacionados(id);
