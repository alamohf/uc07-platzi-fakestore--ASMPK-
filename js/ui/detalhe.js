/**
 * detalhe.js — Tela de detalhe do produto
 * Responsável: Dev 2 (Maria Clara)
 *
 * Endpoints implementados:
 *   GET /products/:id
 *   GET /products/:id/related
 */

document.addEventListener("DOMContentLoaded", function () {
  inicializarPaginaDeDetalhe();
});

/* ── Helpers de estado UI ── */

function exibirCarregando(containerId) {
  var el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML =
    '<div class="estado-carregando-produto">' +
    '<span class="material-symbols-outlined estado-icone-girando">autorenew</span>' +
    '<span>Carregando...</span>' +
    '</div>';
}

function exibirMensagemDeErro(containerId, mensagem) {
  var el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML =
    '<div class="estado-erro-produto">' +
    '<span class="material-symbols-outlined" style="font-size:40px;color:var(--erro)">error</span>' +
    '<p>' + mensagem + '</p>' +
    '</div>';
}

/* ── Extrai a melhor URL de imagem do campo `images` da API ── */

function extrairUrlDaImagem(images) {
  try {
    var lista = images;
    if (typeof images === 'string') lista = JSON.parse(images);
    if (Array.isArray(lista) && lista.length > 0) {
      var url = lista[0].replace(/[\[\]"]/g, '').trim();
      if (url && url.startsWith('http')) {
        if (url.includes('imgur.com')) {
          return 'https://wsrv.nl/?url=' + encodeURIComponent(url) + '&w=800&h=600&fit=cover';
        }
        return url;
      }
    }
  } catch (e) {}
  return null;
}

/* ── Inicialização ── */

async function inicializarPaginaDeDetalhe() {
  var parametrosUrl = new URLSearchParams(window.location.search);
  var idProduto = parametrosUrl.get("id");

  if (!idProduto) {
    exibirMensagemDeErro("detalhe-produto", "ID do produto não informado na URL.");
    return;
  }

  await carregarDetalheDoProduto(idProduto);
  await carregarProdutosRelacionadosNaTela(idProduto);
}

/* ── Detalhe ── */

async function carregarDetalheDoProduto(idProduto) {
  exibirCarregando("detalhe-produto");

  try {
    var produto = await buscarProdutoPorId(idProduto);
    renderizarDetalheDoProduto(produto);
  } catch (erro) {
    exibirMensagemDeErro(
      "detalhe-produto",
      "Não foi possível carregar o produto: " + erro.message,
    );
  }
}

function renderizarDetalheDoProduto(produto) {
  var container = document.getElementById("detalhe-produto");
  if (!container) return;

  var urlImagem = extrairUrlDaImagem(produto.images) ||
    'https://picsum.photos/seed/' + produto.id + '/800/600';
  var urlThumb2 = 'https://picsum.photos/seed/' + produto.id + 'b/400/300';
  var nomeCategoria = produto.category ? produto.category.name : "Produto";
  var tituloSeguro = produto.title.replace(/'/g, '’').replace(/"/g, '&quot;');

  document.title = produto.title + ' | The Precision Merchant';
  var breadcrumb = document.getElementById('breadcrumb-produto');
  if (breadcrumb) breadcrumb.textContent = produto.title;

  container.innerHTML =
    '<div class="produto-galeria">' +
    '  <div class="produto-imagem-principal-wrap">' +
    '    <img src="' + urlImagem + '" alt="' + tituloSeguro + '"' +
    '         class="produto-imagem-principal"' +
    '         onerror="this.src=\'https://picsum.photos/seed/' + produto.id + '/800/600\'">' +
    '  </div>' +
    '  <div class="produto-thumbnails">' +
    '    <img src="' + urlImagem + '" alt="Vista 1" class="produto-thumb"' +
    '         onerror="this.src=\'https://picsum.photos/seed/' + produto.id + '/400/300\'">' +
    '    <img src="' + urlThumb2 + '" alt="Vista 2" class="produto-thumb">' +
    '  </div>' +
    '</div>' +
    '<div class="produto-info">' +
    '  <span class="produto-categoria-badge">' + nomeCategoria.toUpperCase() + '</span>' +
    '  <h1 class="produto-titulo">' + produto.title + '</h1>' +
    '  <p class="produto-preco">R$ ' + Number(produto.price).toFixed(2) + '</p>' +
    '  <hr class="produto-divisor">' +
    '  <p class="produto-historia-label">A HISTÓRIA</p>' +
    '  <p class="produto-descricao">' + produto.description + '</p>' +
    '  <div class="produto-acoes">' +
    '    <button class="btn-adicionar-carrinho"' +
    '            onclick="adicionarProdutoAoCarrinho(' + produto.id + ', \'' + tituloSeguro + '\', ' + produto.price + ', \'' + urlImagem + '\')">' +
    '      <span class="material-symbols-outlined">shopping_bag</span>' +
    '      Adicionar ao Carrinho' +
    '    </button>' +
    '    <button class="btn-encontrar-loja" onclick="window.location.href=\'carrinho.html\'">' +
    '      Ver Carrinho' +
    '    </button>' +
    '  </div>' +
    '  <div class="produto-garantias">' +
    '    <div class="garantia-item">' +
    '      <span class="material-symbols-outlined">workspace_premium</span>' +
    '      <span>5 Anos Garantia</span>' +
    '    </div>' +
    '    <div class="garantia-item">' +
    '      <span class="material-symbols-outlined">local_shipping</span>' +
    '      <span>Frete Grátis</span>' +
    '    </div>' +
    '    <div class="garantia-item">' +
    '      <span class="material-symbols-outlined">lock</span>' +
    '      <span>Compra Segura</span>' +
    '    </div>' +
    '    <div class="garantia-item">' +
    '      <span class="material-symbols-outlined">autorenew</span>' +
    '      <span>Troca Fácil</span>' +
    '    </div>' +
    '  </div>' +
    '</div>';

  var specsSection = document.getElementById('produto-specs');
  if (specsSection) {
    specsSection.style.display = '';
    var specCategoria = document.getElementById('spec-categoria-valor');
    if (specCategoria) specCategoria.textContent = nomeCategoria;
    var specsImagem = document.getElementById('specs-imagem');
    if (specsImagem) { specsImagem.src = urlImagem; specsImagem.alt = produto.title; }
    var specsTitulo = document.getElementById('specs-titulo-material');
    if (specsTitulo) specsTitulo.textContent = produto.title;
  }
}

/* ── Relacionados ── */

async function carregarProdutosRelacionadosNaTela(idProduto) {
  var container = document.getElementById("grade-relacionados");
  if (!container) return;

  exibirCarregando("grade-relacionados");

  try {
    var relacionados = await buscarProdutosRelacionados(idProduto);

    if (!relacionados || relacionados.length === 0) {
      container.innerHTML =
        '<div class="relacionados-vazio">Sem produtos relacionados.<br>Explore a vitrine para mais produtos.</div>';
      return;
    }

    container.innerHTML = relacionados.slice(0, 4).map(gerarCardRelacionado).join('');
  } catch (erro) {
    container.innerHTML =
      '<div class="relacionados-vazio">Não foi possível carregar os relacionados.</div>';
  }
}

function gerarCardRelacionado(produto) {
  var urlImagem = extrairUrlDaImagem(produto.images) ||
    'https://picsum.photos/seed/' + produto.id + '/400/300';
  var nomeCategoria = produto.category ? produto.category.name.toUpperCase() : 'PRODUTO';
  var preco = 'R$ ' + Number(produto.price).toFixed(2);
  var urlDetalhe = 'produto.html?id=' + produto.id;
  var titulo = produto.title.replace(/"/g, '&quot;');

  return '<article class="card-relacionado" onclick="window.location.href=\'' + urlDetalhe + '\'">' +
    '<div class="card-rel-imagem-wrap">' +
    '<img src="' + urlImagem + '" alt="' + titulo + '" class="card-rel-imagem"' +
    ' onerror="this.src=\'https://picsum.photos/seed/' + produto.id + '/400/300\'">' +
    '<button class="card-rel-favorito" onclick="event.stopPropagation()" title="Favoritar">' +
    '<span class="material-symbols-outlined">favorite</span>' +
    '</button>' +
    '</div>' +
    '<div class="card-rel-info">' +
    '<h3 class="card-rel-nome">' + produto.title + '</h3>' +
    '<span class="card-rel-categoria">' + nomeCategoria + '</span>' +
    '<p class="card-rel-preco">' + preco + '</p>' +
    '</div>' +
    '</article>';
}