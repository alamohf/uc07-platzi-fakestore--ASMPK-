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

async function inicializarPaginaDeDetalhe() {
  var parametrosUrl = new URLSearchParams(window.location.search);
  var idProduto = parametrosUrl.get("id");

  if (!idProduto) {
    exibirMensagemDeErro(
      "detalhe-produto",
      "ID do produto não informado na URL.",
    );
    return;
  }

  await carregarDetalheDoProduto(idProduto);
  await carregarProdutosRelacionadosNaTela(idProduto);
}

async function carregarDetalheDoProduto(idProduto) {
  exibirCarregando("detalhe-produto");

  try {
    var produto = await buscarProdutoPeloId(idProduto);
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

  var urlImagem = extrairUrlDaImagem(produto.images);
  var nomeCategoria = produto.category
    ? produto.category.name
    : "Sem categoria";

  container.innerHTML =
    '<div class="detalhe-container">' +
    '  <img src="' +
    urlImagem +
    '" alt="' +
    produto.title +
    '"' +
    '       class="detalhe-imagem-principal"' +
    "       onerror=\"this.src='https://picsum.photos/seed/fallback/400/400'\">" +
    '  <div class="detalhe-informacoes">' +
    '    <p class="detalhe-categoria">' +
    nomeCategoria +
    "</p>" +
    '    <h1 class="detalhe-titulo">' +
    produto.title +
    "</h1>" +
    '    <p class="detalhe-preco">R$ ' +
    Number(produto.price).toFixed(2) +
    "</p>" +
    '    <p class="detalhe-descricao">' +
    produto.description +
    "</p>" +
    '    <div class="detalhe-acoes">' +
    '      <button class="btn btn-primario btn-grande"' +
    '              onclick="adicionarProdutoAoCarrinho(' +
    produto.id +
    ", '" +
    produto.title.replace(/'/g, "") +
    "', " +
    produto.price +
    ", '" +
    urlImagem +
    "')\">" +
    "        🛒 Adicionar ao carrinho" +
    "      </button>" +
    '      <a href="carrinho.html" class="btn btn-secundario btn-grande">Ver carrinho</a>' +
    "    </div>" +
    "  </div>" +
    "</div>";
}

async function carregarProdutosRelacionadosNaTela(idProduto) {
  var container = document.getElementById("grade-relacionados");
  if (!container) return;

  exibirCarregando("grade-relacionados");

  try {
    var relacionados = await buscarProdutosRelacionados(idProduto);

    if (!relacionados || relacionados.length === 0) {
      exibirEstadoVazio(
        "grade-relacionados",
        "Sem produtos relacionados",
        "Explore outros produtos na vitrine.",
      );
      return;
    }

    container.innerHTML =
      '<div class="grade-produtos">' +
      relacionados.slice(0, 4).map(gerarHtmlDoCard).join("") +
      "</div>";
  } catch (erro) {
    exibirMensagemDeErro(
      "grade-relacionados",
      "Não foi possível carregar os relacionados.",
    );
  }
}