document.addEventListener('DOMContentLoaded', function() {
  inicializarVitrine();
});

async function inicializarVitrine() {
  await carregarCategoriasNoMenu();
  await carregarProdutosNaVitrine();
  registrarEventosDaVitrine();
}

async function carregarCategoriasNoMenu() {
  var lista = document.getElementById('lista-categorias');
  if (!lista) return;

  try {
    var todasCategorias = await buscarTodasAsCategorias();


    var REGEX_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    var NOMES_VALIDOS = ["Clothes", "Electronics", "Furniture", "Shoes", "Miscellaneous", "Love is light"];

    var categorias = todasCategorias.filter(function(c) {

      if (REGEX_UUID.test(c.name)) return false;

      if (c.name.startsWith("Product-")) return false;
      
      if (c.name.length > 30) return false;
      return true;
    });

    if (categorias.length === 0) categorias = todasCategorias.slice(0, 6);

    atualizarEstadoGlobal({ listaDeCategorias: categorias });

    var html = '<li class="lista-categorias-item selecionada" data-id="" onclick="filtrarPorCategoria(null, this)">Todos</li>';

    categorias.forEach(function(categoria) {
      html += '<li class="lista-categorias-item" data-id="' + categoria.id + '"'
        + ' onclick="filtrarPorCategoria(' + categoria.id + ', this)">' 
        + categoria.name
        + '</li>';
    });

    lista.innerHTML = html;
  } catch (erro) {
    lista.innerHTML = '<li style="color:var(--cinza-texto);font-size:var(--texto-sm);padding:8px 12px;">Erro ao carregar categorias</li>';
  }
}


async function carregarProdutosNaVitrine() {
  var grade = document.getElementById('grade-produtos');
  if (!grade) return;

  exibirCarregando('grade-produtos');

  try {
    var estado  = obterEstadoAtual();
    var filtros = estado.filtrosAtivos;
    var pagina  = estado.paginacaoAtual;

    var produtos = await buscarListaDeProdutos({
      deslocamento: pagina.deslocamento,
      limite:       pagina.limite,
      idCategoria:  filtros.idCategoria  || undefined,
      titulo:       filtros.textoBusca   || undefined,
      precoMinimo:  filtros.precoMinimo  != null ? filtros.precoMinimo  : undefined,
      precoMaximo:  filtros.precoMaximo  != null ? filtros.precoMaximo  : undefined
    });

    atualizarEstadoGlobal({ listaDeProdutos: produtos });

    if (!produtos || produtos.length === 0) {
      exibirEstadoVazio('grade-produtos',
        'Nenhum produto encontrado',
        'Tente outros filtros ou termos de busca.'
      );
      atualizarBotoesDePaginacao(false, false);
      return;
    }

    grade.innerHTML = produtos.map(gerarHtmlDoCard).join('');
    atualizarBotoesDePaginacao(
      pagina.deslocamento > 0,
      produtos.length === pagina.limite
    );

  } catch (erro) {
    exibirMensagemDeErro('grade-produtos', erro.message);
  }
}



function atualizarBotoesDePaginacao(podaVoltar, podaAvancar) {
  var btnAnterior = document.getElementById('btn-anterior');
  var btnProxima  = document.getElementById('btn-proxima');
  var infoPagina  = document.getElementById('info-pagina');

  if (btnAnterior) btnAnterior.disabled = !podaVoltar;
  if (btnProxima)  btnProxima.disabled  = !podaAvancar;

  if (infoPagina) {
    var estado = obterEstadoAtual();
    var paginaNumero = Math.floor(estado.paginacaoAtual.deslocamento / estado.paginacaoAtual.limite) + 1;
    infoPagina.textContent = 'Página ' + paginaNumero;
  }
}

function irParaProximaPagina() {
  var estado = obterEstadoAtual();
  atualizarEstadoGlobal({
    paginacaoAtual: {
      deslocamento: estado.paginacaoAtual.deslocamento + estado.paginacaoAtual.limite,
      limite:       estado.paginacaoAtual.limite
    }
  });
  carregarProdutosNaVitrine();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function voltarParaPaginaAnterior() {
  var estado = obterEstadoAtual();
  var novoDeslocamento = Math.max(0, estado.paginacaoAtual.deslocamento - estado.paginacaoAtual.limite);
  atualizarEstadoGlobal({
    paginacaoAtual: {
      deslocamento: novoDeslocamento,
      limite:       estado.paginacaoAtual.limite
    }
  });
  carregarProdutosNaVitrine();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}



function filtrarPorCategoria(idCategoria, elementoClicado) {
  
  var itens = document.querySelectorAll('.lista-categorias-item');
  itens.forEach(function(item) { item.classList.remove('selecionada'); });
  if (elementoClicado) elementoClicado.classList.add('selecionada');

  var filtros = obterEstadoAtual().filtrosAtivos;
  atualizarEstadoGlobal({
    filtrosAtivos: Object.assign({}, filtros, { idCategoria: idCategoria }),
    paginacaoAtual: { deslocamento: 0, limite: 4 }
  });
  carregarProdutosNaVitrine();
}

function aplicarFiltroDePrecoPelosBotoes() {
  var minInput = document.getElementById('preco-minimo');
  var maxInput = document.getElementById('preco-maximo');

  var min = minInput && minInput.value !== '' ? parseFloat(minInput.value) : null;
  var max = maxInput && maxInput.value !== '' ? parseFloat(maxInput.value) : null;

  var filtros = obterEstadoAtual().filtrosAtivos;
  atualizarEstadoGlobal({
    filtrosAtivos: Object.assign({}, filtros, { precoMinimo: min, precoMaximo: max }),
    paginacaoAtual: { deslocamento: 0, limite: 4 }
  });
  carregarProdutosNaVitrine();
}

function limparFiltrosERecarregar() {

  var minInput = document.getElementById('preco-minimo');
  var maxInput = document.getElementById('preco-maximo');
  var buscaInput = document.getElementById('busca-header');
  if (minInput) minInput.value = '';
  if (maxInput) maxInput.value = '';
  if (buscaInput) buscaInput.value = '';


  var itens = document.querySelectorAll('.lista-categorias-item');
  itens.forEach(function(item) { item.classList.remove('selecionada'); });
  var todos = document.querySelector('.lista-categorias-item[data-id=""]');
  if (todos) todos.classList.add('selecionada');

  limparTodosOsFiltros();
  carregarProdutosNaVitrine();
}


var buscarComAtraso = aplicarDebounce(function(textoBuscado) {
  var filtros = obterEstadoAtual().filtrosAtivos;
  atualizarEstadoGlobal({
    filtrosAtivos: Object.assign({}, filtros, { textoBusca: textoBuscado }),
    paginacaoAtual: { deslocamento: 0, limite: 4 }
  });
  carregarProdutosNaVitrine();
}, 500);



function registrarEventosDaVitrine() {
 
  var inputBusca = document.getElementById('busca-header');
  if (inputBusca) {
    inputBusca.addEventListener('input', function(e) {
      buscarComAtraso(e.target.value.trim());
    });
  }


  var btnAnterior = document.getElementById('btn-anterior');
  var btnProxima  = document.getElementById('btn-proxima');
  if (btnAnterior) btnAnterior.addEventListener('click', voltarParaPaginaAnterior);
  if (btnProxima)  btnProxima.addEventListener('click', irParaProximaPagina);


  var btnFiltrar = document.getElementById('btn-filtrar-preco');
  if (btnFiltrar) btnFiltrar.addEventListener('click', aplicarFiltroDePrecoPelosBotoes);

  var btnLimpar = document.getElementById('btn-limpar-filtros');
  if (btnLimpar) btnLimpar.addEventListener('click', limparFiltrosERecarregar);
}



let paginaAtual = 1;
const limit = 4;
let categoriaAtual = null;
let buscaAtual = '';


const produtosGrid = document.getElementById('produto-grid');
const btnAnterior = document.getElementById('btn-anterior');
const btnProxima = document.getElementById('btn-proxima');
const paginaSpan = document.getElementById('pagina-span');
const buscaInput = document.getElementById('busca-input');
const btnBuscar = document.getElementById('btn-buscar');


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
        <img src="${imagem}" class="imagem-produto"
          onerror="this.src='https://picsum.photos/300/200?random=${produto.id}'" />
        <div class="info-produto">
          <div class="categoria-produto">${categoria}</div>
          <h3 class="titulo-produto">${produto.title}</h3>
          <div class="preco-produto">R$ ${preco}</div>
        </div>
      `;
    } else {
      card.innerHTML = `
        <img src="${imagem}" class="imagem-produto"
          onerror="this.src='https://picsum.photos/300/200?random=${produto.id}'" />
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

async function carregarCategoria() {
    const selectCategoria = document.getElementById('selecao-categoria');
    if (!selectCategoria) return;

    try {
        const categorias = await buscarCategorias();

        selectCategoria.innerHTML = '<option value="">Todas categorias</option>';

        categorias.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            selectCategoria.appendChild(option);
        });
    
    } catch (erro) {
        selectCategoria.innerHTML = '<option value="">Categorias indisponiveis</option>';
    }
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


function buscarPorTitulo() {
    buscaAtual = buscaInput?.value.trim()|| '';
    paginaAtual = 1;
    carregarVitrine();
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
