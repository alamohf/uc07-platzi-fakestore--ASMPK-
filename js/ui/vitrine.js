/**
 * vitrine.js — Lógica da tela principal (vitrine de produtos)
 * Responsável: Dev 1 (Samuel)
 *
 * Endpoints implementados:
 *   GET /products
 *   GET /products?offset=&limit=
 *   GET /products?categoryId=
 *   GET /products?title=
 *   GET /products?price_min=&price_max=
 *   GET /categories
 */

/*INICIALIZAÇÃO  */

document.addEventListener('DOMContentLoaded', function() {
  inicializarVitrine();
});

async function inicializarVitrine() {
  await carregarCategoriasNoMenu();
  await carregarProdutosNaVitrine();
  registrarEventosDaVitrine();
}

/* CARREGAMENTO DE CATEGORIAS  */

async function carregarCategoriasNoMenu() {
  var lista = document.getElementById('lista-categorias');
  if (!lista) return;

  try {
    var todasCategorias = await buscarTodasAsCategorias();

    // Filtra categorias invalidas: remove UUIDs e nomes muito longos
    // A API Platzi tem categorias "lixo" criadas por outros usuarios
    var REGEX_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    var NOMES_VALIDOS = ["Clothes", "Electronics", "Furniture", "Shoes", "Miscellaneous", "Love is light"];

    var categorias = todasCategorias.filter(function(c) {
      // Exclui se nome parece UUID ou contém UUID
      if (REGEX_UUID.test(c.name)) return false;

      if (c.name.startsWith("Product-")) return false;
      
      if (c.name.length > 30) return false;
      return true;
    });

    // Se nao sobrou nada valido, usa todas mesmo
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

/* CARREGAMENTO DE PRODUTOS  */

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

/*  PAGINAÇÃO */

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

/*  FILTROS  */

function filtrarPorCategoria(idCategoria, elementoClicado) {
  // Atualiza visual da sidebar
  var itens = document.querySelectorAll('.lista-categorias-item');
  itens.forEach(function(item) { item.classList.remove('selecionada'); });
  if (elementoClicado) elementoClicado.classList.add('selecionada');

  // Atualiza estado e recarrega
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
  // Limpa campos visuais
  var minInput = document.getElementById('preco-minimo');
  var maxInput = document.getElementById('preco-maximo');
  var buscaInput = document.getElementById('busca-header');
  if (minInput) minInput.value = '';
  if (maxInput) maxInput.value = '';
  if (buscaInput) buscaInput.value = '';

  // Desmarca categoria
  var itens = document.querySelectorAll('.lista-categorias-item');
  itens.forEach(function(item) { item.classList.remove('selecionada'); });
  var todos = document.querySelector('.lista-categorias-item[data-id=""]');
  if (todos) todos.classList.add('selecionada');

  limparTodosOsFiltros();
  carregarProdutosNaVitrine();
}

/* BUSCA  */

var buscarComAtraso = aplicarDebounce(function(textoBuscado) {
  var filtros = obterEstadoAtual().filtrosAtivos;
  atualizarEstadoGlobal({
    filtrosAtivos: Object.assign({}, filtros, { textoBusca: textoBuscado }),
    paginacaoAtual: { deslocamento: 0, limite: 4 }
  });
  carregarProdutosNaVitrine();
}, 500);

/* REGISTRO DE EVENTOS  */

function registrarEventosDaVitrine() {
  // Busca no header
  var inputBusca = document.getElementById('busca-header');
  if (inputBusca) {
    inputBusca.addEventListener('input', function(e) {
      buscarComAtraso(e.target.value.trim());
    });
  }

  // Paginação
  var btnAnterior = document.getElementById('btn-anterior');
  var btnProxima  = document.getElementById('btn-proxima');
  if (btnAnterior) btnAnterior.addEventListener('click', voltarParaPaginaAnterior);
  if (btnProxima)  btnProxima.addEventListener('click', irParaProximaPagina);

  // Filtro de preço
  var btnFiltrar = document.getElementById('btn-filtrar-preco');
  if (btnFiltrar) btnFiltrar.addEventListener('click', aplicarFiltroDePrecoPelosBotoes);

  // Limpar filtros
  var btnLimpar = document.getElementById('btn-limpar-filtros');
  if (btnLimpar) btnLimpar.addEventListener('click', limparFiltrosERecarregar);
}
