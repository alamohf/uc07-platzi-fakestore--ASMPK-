let paginaAtual = 1;
const limit = 4;
let categoriaAtual = null;
let buscaAtual = '';
let precoMinAtual = null;
let precoMaxAtual = null;

const produtosGrid = document.getElementById('produtos-grid');
const btnAnterior = document.getElementById('btn-anterior');
const btnProxima = document.getElementById('btn-proximo');
const paginaSpan = document.getElementById('indicador-pagina');
const buscaInput = document.getElementById('input-busca');

function exibirProdutos(produtos) {
    produtosGrid.innerHTML = '';

    if (!produtos || produtos.length === 0) {
        produtosGrid.innerHTML = '<div class="vazio">Nenhum produto encontrado</div>';
        return;
    }

    produtos.forEach((produto, index) => {
        const card = document.createElement('article');
        const produtoDestaque = index === 0 && paginaAtual === 1 && !buscaAtual && produtos.length > 1;

        card.className = produtoDestaque ? 'card-produto destaque' : 'card-produto';

        const imagem = produto.images?.[0] || `https://picsum.photos/300/200?random=${produto.id}`;
        const categoria = produto.category?.name?.toUpperCase() || 'PRODUTO';
        const preco = produto.price.toFixed(2);

        if (produtoDestaque) {
            card.innerHTML = `
                <span class="destaque-badge">ESCOLHA DO EDITOR</span>
                <img src="${imagem}" class="imagem-produto" onerror="this.src='https://picsum.photos/300/200?random=${produto.id}'">
                <div class="info-produto">
                    <div class="categoria-produto">${categoria}</div>
                    <h3 class="titulo-produto">${produto.title}</h3>
                    <div class="preco-produto">R$ ${preco}</div>
                </div>
            `;
        } else {
            card.innerHTML = `
                <img src="${imagem}" class="imagem-produto" onerror="this.src='https://picsum.photos/300/200?random=${produto.id}'">
                <div class="info-produto">
                    <div class="categoria-produto">${categoria}</div>
                    <h3 class="titulo-produto">${produto.title}</h3>
                    <div class="preco-produto">R$ ${preco}</div>
                </div>
            `;
        }

        
        produtosGrid.appendChild(card);
        
        
        card.addEventListener('click', () => {
            window.location.href = `produto.html?id=${produto.id}`;
        });
    }); 
}

async function carregarVitrine() {
  try {
    produtosGrid.innerHTML = '<div class="loading">Carregando produtos...</div>';

    const offset = (paginaAtual - 1) * limit;
    const filtros = { offset, limit };

    if (categoriaAtual) filtros.categoryId = categoriaAtual;
    if (buscaAtual) filtros.title = buscaAtual;
    if (precoMinAtual !== null && precoMinAtual > 0) filtros.price_min = precoMinAtual;
    if (precoMaxAtual !== null && precoMaxAtual < 5000) filtros.price_max = precoMaxAtual;

    const produtos = await buscarProdutos(filtros);
    exibirProdutos(produtos);
    atualizarPaginacao();

  } catch (erro) {
    produtosGrid.innerHTML = '<div class="erro">Erro ao carregar produtos</div>';
  }
}

function configurarFiltroCategoria() {
  const categorias = document.querySelectorAll('.item-categoria');

  categorias.forEach(cat => {
    cat.addEventListener('click', (e) => {
      e.preventDefault();
      categorias.forEach(c => c.classList.remove('ativa'));
      cat.classList.add('ativa');

      const id = cat.getAttribute('data-categoria');
      categoriaAtual = id ? parseInt(id) : null;
      paginaAtual = 1;
      carregarVitrine();
    });
  });
}

function configurarFiltroPreco() {
  const inputMin   = document.getElementById('preco-min-input');
  const inputMax   = document.getElementById('preco-max-input');
  const displayMin = document.getElementById('preco-min-display');
  const displayMax = document.getElementById('preco-max-display');
  const btnFiltrar = document.getElementById('btn-filtrar-preco');

  if (!inputMin || !inputMax || !btnFiltrar) return;


  inputMin.addEventListener('input', () => {
    displayMin.textContent = `R$ ${parseInt(inputMin.value) || 0}`;
  });

  inputMax.addEventListener('input', () => {
    displayMax.textContent = `R$ ${parseInt(inputMax.value) || 5000}`;
  });


  btnFiltrar.addEventListener('click', () => {
    const min = parseInt(inputMin.value) || 0;
    const max = parseInt(inputMax.value) || 5000;


    if (min > max) {
      alert('O valor mínimo não pode ser maior que o máximo.');
      return;
    }

    precoMinAtual = min > 0    ? min : null;
    precoMaxAtual = max < 5000 ? max : null;
    paginaAtual = 1;
    carregarVitrine();
  });
}

function buscarPorTitulo() {
  buscaAtual = buscaInput?.value.trim() || '';
  paginaAtual = 1;
  carregarVitrine();
}

function proximaPagina() {
  paginaAtual++;
  carregarVitrine();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function anteriorPagina() {
  if (paginaAtual > 1) {
    paginaAtual--;
    carregarVitrine();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function atualizarPaginacao() {
  if (paginaSpan)  paginaSpan.textContent = paginaAtual;
  if (btnAnterior) btnAnterior.disabled   = paginaAtual === 1;
}

async function inicializar() {
  await carregarVitrine();
  configurarFiltroCategoria();
  configurarFiltroPreco();

  btnAnterior?.addEventListener('click', anteriorPagina);
  btnProxima?.addEventListener('click', proximaPagina);
  buscaInput?.addEventListener('keypress', e => {
    if (e.key === 'Enter') buscarPorTitulo();
  });

  document.querySelector('.barra-busca .material-symbols-outlined')
  ?.addEventListener('click', buscarPorTitulo);
}

document.addEventListener('DOMContentLoaded', inicializar);