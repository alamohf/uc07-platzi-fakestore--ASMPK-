/**
 * carrinho.js — Gerenciamento do carrinho de compras via localStorage
 * Responsável: Dev 2
 *
 * O carrinho é armazenado no localStorage como um array de objetos:
 * [{ id, title, price, image, quantidade }]
 *
 * Não há checkout nem integração com API — tudo é local.
 */

let CHAVE_CARRINHO = 'carrinho';

// ---- OPERAÇÕES DO CARRINHO ----

/**
 * Retorna o array do carrinho salvo no localStorage.
 * Se não existir, retorna array vazio.
 */
function obterCarrinho() {
  let json = localStorage.getItem(CHAVE_CARRINHO);
  try {
    return json ? JSON.parse(json) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Salva o array do carrinho no localStorage.
 */
function salvarCarrinho(carrinho) {
  localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
  atualizarBadgeCarrinho();
}

/**
 * Adiciona um produto ao carrinho.
 * Se o produto já existir, incrementa a quantidade.
 */
function adicionarAoCarrinho(produto) {
  let carrinho = obterCarrinho();
  let itemExistente = carrinho.find(function(item) {
    return item.id === produto.id;
  });

  if (itemExistente) {
    itemExistente.quantidade += 1;
  } else {
    carrinho.push({
      id: produto.id,
      title: produto.title,
      price: produto.price,
      image: produto.images && produto.images[0] ? produto.images[0] : '',
      quantidade: 1
    });
  }

  salvarCarrinho(carrinho);
  exibirToast('Produto adicionado ao carrinho!', 'sucesso');
}

/**
 * Remove um produto do carrinho pelo id.
 */
function removerDoCarrinho(produtoId) {
  let carrinho = obterCarrinho();
  let carrinhoAtualizado = carrinho.filter(function(item) {
    return item.id !== produtoId;
  });
  salvarCarrinho(carrinhoAtualizado);
}

/**
 * Altera a quantidade de um item no carrinho.
 * Se a quantidade chegar a 0 ou menos, remove o item.
 */
function alterarQuantidade(produtoId, novaQuantidade) {
  let carrinho = obterCarrinho();

  if (novaQuantidade <= 0) {
    removerDoCarrinho(produtoId);
    return;
  }

  let item = carrinho.find(function(item) {
    return item.id === produtoId;
  });

  if (item) {
    item.quantidade = novaQuantidade;
    salvarCarrinho(carrinho);
  }
}

/**
 * Limpa todo o carrinho.
 */
function limparCarrinho() {
  localStorage.removeItem(CHAVE_CARRINHO);
  atualizarBadgeCarrinho();
}

/**
 * Retorna a quantidade total de itens no carrinho.
 */
function quantidadeTotalCarrinho() {
  let carrinho = obterCarrinho();
  return carrinho.reduce(function(total, item) {
    return total + item.quantidade;
  }, 0);
}

/**
 * Retorna o valor total do carrinho.
 */
function valorTotalCarrinho() {
  let carrinho = obterCarrinho();
  return carrinho.reduce(function(total, item) {
    return total + (item.price * item.quantidade);
  }, 0);
}

// ---- RENDERIZAÇÃO ----

/**
 * Atualiza o badge (número) no ícone do carrinho no header.
 * Chamado automaticamente a cada operação no carrinho.
 */
function atualizarBadgeCarrinho() {
  let badge = document.getElementById('carrinho-badge');
  if (!badge) return;

  let quantidade = quantidadeTotalCarrinho();
  badge.textContent = quantidade;
  badge.style.display = quantidade > 0 ? 'inline-flex' : 'none';
}

/**
 * Renderiza a lista completa do carrinho na página carrinho.html.
 */
function renderizarCarrinho() {
  let container = document.getElementById('lista-carrinho');
  let resumo = document.getElementById('resumo-carrinho');

  if (!container) return;

  let carrinho = obterCarrinho();

  if (carrinho.length === 0) {
    container.innerHTML = ''
      + '<div class="empty-state">'
      + '  <div class="empty-state-icone">🛒</div>'
      + '  <p class="empty-state-texto">Seu carrinho está vazio</p>'
      + '  <p class="empty-state-subtexto">Volte à vitrine para adicionar produtos.</p>'
      + '  <a href="index.html" class="btn btn-primario" style="margin-top: 16px;">Ir para vitrine</a>'
      + '</div>';

    if (resumo) resumo.style.display = 'none';
    return;
  }

  let html = '';
  carrinho.forEach(function(item) {
    html += ''
      + '<div class="carrinho-item" data-id="' + item.id + '">'
      + '  <img src="' + item.image + '" alt="' + item.title + '" class="carrinho-item-imagem"'
      + '       onerror="this.src=\'https://via.placeholder.com/80x80?text=Sem+imagem\'">'
      + '  <div class="carrinho-item-info">'
      + '    <h3 class="carrinho-item-titulo">' + item.title + '</h3>'
      + '    <p class="carrinho-item-preco">R$ ' + item.price.toFixed(2) + '</p>'
      + '  </div>'
      + '  <div class="carrinho-item-quantidade">'
      + '    <button class="btn btn-pequeno btn-secundario" onclick="alterarQuantidadeUI(' + item.id + ', ' + (item.quantidade - 1) + ')">−</button>'
      + '    <span class="carrinho-item-qtd">' + item.quantidade + '</span>'
      + '    <button class="btn btn-pequeno btn-secundario" onclick="alterarQuantidadeUI(' + item.id + ', ' + (item.quantidade + 1) + ')">+</button>'
      + '  </div>'
      + '  <p class="carrinho-item-subtotal">R$ ' + (item.price * item.quantidade).toFixed(2) + '</p>'
      + '  <button class="btn btn-pequeno btn-perigo" onclick="removerDoCarrinhoUI(' + item.id + ')">Remover</button>'
      + '</div>';
  });

  container.innerHTML = html;

  if (resumo) {
    resumo.style.display = 'block';
    let totalEl = document.getElementById('carrinho-total');
    let qtdEl = document.getElementById('carrinho-qtd-total');
    if (totalEl) totalEl.textContent = 'R$ ' + valorTotalCarrinho().toFixed(2);
    if (qtdEl) qtdEl.textContent = quantidadeTotalCarrinho() + ' item(ns)';
  }
}

// ---- HANDLERS DE UI ----

function alterarQuantidadeUI(produtoId, novaQuantidade) {
  alterarQuantidade(produtoId, novaQuantidade);
  renderizarCarrinho();
}

function removerDoCarrinhoUI(produtoId) {
  removerDoCarrinho(produtoId);
  renderizarCarrinho();
  exibirToast('Produto removido do carrinho.', 'info');
}

function limparCarrinhoUI() {
  abrirModalConfirmacao('Deseja limpar todo o carrinho?', function() {
    limparCarrinho();
    renderizarCarrinho();
    exibirToast('Carrinho limpo.', 'info');
  });
}

// ---- INICIALIZAÇÃO ----

document.addEventListener('DOMContentLoaded', function() {
  atualizarBadgeCarrinho();

  if (document.getElementById('lista-carrinho')) {
    renderizarCarrinho();
  }
});
