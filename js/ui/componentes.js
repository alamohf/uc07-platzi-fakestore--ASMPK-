/**
 * componentes.js — Funções de UI reutilizáveis em todas as páginas
 * Responsável: Dev 2 (Maria Clara)
 */

/* ------------------------------------------------
   RENDERIZAÇÃO DE CARD DE PRODUTO
   ------------------------------------------------ */

/**
 * Gera o HTML de um card de produto.
 * @param {object} produto - objeto com id, title, price, category, images
 * @returns {string} HTML do card
 */
function gerarHtmlDoCard(produto) {
  var urlImagem = extrairUrlDaImagem(produto.images);
  var nomeCategoria = produto.category
    ? produto.category.name
    : "Sem categoria";

  return (
    '<article class="card-produto" onclick="irParaDetalheDoProduto(' +
    produto.id +
    ')">' +
    '  <div class="card-produto-imagem-container">' +
    '    <img src="' +
    urlImagem +
    '" alt="' +
    produto.title +
    '"' +
    '         class="card-produto-imagem"' +
    "         onerror=\"this.src='https://picsum.photos/seed/produto/300/200'\">" +
    "  </div>" +
    '  <div class="card-produto-corpo">' +
    '    <span class="card-produto-categoria">' +
    nomeCategoria +
    "</span>" +
    '    <h3 class="card-produto-titulo">' +
    produto.title +
    "</h3>" +
    '    <p class="card-produto-preco">R$ ' +
    Number(produto.price).toFixed(2) +
    "</p>" +
    '    <div class="card-produto-acoes">' +
    '      <button class="btn btn-primario btn-pequeno"' +
    '              onclick="event.stopPropagation(); irParaDetalheDoProduto(' +
    produto.id +
    ')">' +
    "        Ver detalhes" +
    "      </button>" +
    '      <button class="btn btn-fantasma btn-pequeno"' +
    '              onclick="event.stopPropagation(); adicionarProdutoAoCarrinho(' +
    produto.id +
    ", '" +
    produto.title.replace(/'/g, "") +
    "', " +
    produto.price +
    ", '" +
    urlImagem +
    "')\">" +
    "        🛒" +
    "      </button>" +
    "    </div>" +
    "  </div>" +
    "</article>"
  );
}

/**
 * Extrai e valida a URL da imagem do campo images da API.
 *
 * Problemas conhecidos da API Platzi com imagens:
 *  1. Retorna string JSON em vez de array: '["http://..."]'
 *  2. Retorna URLs com colchetes extras: ["http://..."]
 *  3. Retorna URLs que bloqueiam cross-origin (403)
 *
 * Solução: extrair URL, validar, e usar picsum como fallback.
 */
function extrairUrlDaImagem(images) {
  try {
    var lista = images;

    // Caso 1: string JSON - converte para array
    if (typeof images === "string") {
      lista = JSON.parse(images);
    }

    if (Array.isArray(lista) && lista.length > 0) {
      // Remove colchetes e aspas que a API Platzi ocasionalmente inclui
      var url = lista[0].replace(/[\[\]"]/g, "").trim();

      // Valida se e uma URL http valida
      if (url && url.startsWith("http")) {
        // Imgur bloqueia hotlink (403) quando o referer nao e imgur.com.
        // Solucao: usar wsrv.nl como proxy de imagem gratuito.
        // Ele faz a requisicao pelo servidor dele (sem Referer) e repassa.
        if (url.includes("imgur.com")) {
          return (
            "https://wsrv.nl/?url=" +
            encodeURIComponent(url) +
            "&w=400&h=300&fit=cover"
          );
        }
        return url;
      }
    }
  } catch (e) {}

  // Fallback garantido: picsum.photos nao tem restricao de hotlink
  return "https://picsum.photos/seed/produto/400/300";
}

/* NAVEGAÇÃO */

function irParaDetalheDoProduto(idProduto) {
  window.location.href = "produto.html?id=" + idProduto;
}

/* ESTADOS DE TELA */

function exibirCarregando(idContainer) {
  var container = document.getElementById(idContainer);
  if (!container) return;
  container.innerHTML =
    '<div class="estado-carregando">' +
    '<div class="spinner"></div>' +
    "<span>Carregando...</span>" +
    "</div>";
}

function exibirEstadoVazio(idContainer, titulo, descricao) {
  titulo = titulo || "Nenhum resultado encontrado";
  descricao = descricao || "Tente ajustar os filtros.";

  var container = document.getElementById(idContainer);
  if (!container) return;
  container.innerHTML =
    '<div class="estado-vazio">' +
    '<div class="estado-vazio-icone">🔍</div>' +
    '<p class="estado-vazio-titulo">' +
    titulo +
    "</p>" +
    '<p class="estado-vazio-descricao">' +
    descricao +
    "</p>" +
    "</div>";
}

function exibirMensagemDeErro(idContainer, mensagem) {
  var container = document.getElementById(idContainer);
  if (!container) return;
  container.innerHTML =
    '<div class="estado-vazio">' +
    '<div class="estado-vazio-icone">⚠️</div>' +
    '<p class="estado-vazio-titulo">Algo deu errado</p>' +
    '<p class="estado-vazio-descricao">' +
    mensagem +
    "</p>" +
    "</div>";
}

/* TOAST (notificação rápida) */

/**
 * Exibe uma notificação toast na tela.
 * @param {string} mensagem
 * @param {string} tipo - 'sucesso', 'erro', 'info', 'alerta'
 */
function mostrarToast(mensagem, tipo) {
  tipo = tipo || "info";

  var container = document.getElementById("toast-container");
  if (!container) return;

  var toast = document.createElement("div");
  toast.className = "toast toast-" + tipo;
  toast.textContent = mensagem;
  container.appendChild(toast);

  setTimeout(function () {
    toast.remove();
  }, 3000);
}

/* MODAL DE CONFIRMAÇÃO*/

/**
 * Abre o modal de confirmação genérico.
 * @param {string} mensagem - texto exibido no modal
 * @param {function} aoConfirmar - função executada ao confirmar
 */
function abrirModalDeConfirmacao(mensagem, aoConfirmar) {
  var modal = document.getElementById("modal-fundo");
  var textoEl = document.getElementById("modal-mensagem");
  var btnSim = document.getElementById("modal-btn-confirmar");
  var btnNao = document.getElementById("modal-btn-cancelar");

  if (!modal) return;

  textoEl.textContent = mensagem;
  modal.classList.add("aberto");

  btnSim.onclick = function () {
    aoConfirmar();
    fecharModalDeConfirmacao();
  };

  btnNao.onclick = fecharModalDeConfirmacao;

  modal.onclick = function (evento) {
    if (evento.target === modal) fecharModalDeConfirmacao();
  };
}

function fecharModalDeConfirmacao() {
  var modal = document.getElementById("modal-fundo");
  if (modal) modal.classList.remove("aberto");
}

/* MENU DO USUÁRIO (header) */

/**
 * Atualiza o menu do cabeçalho com base no estado de autenticação.
 * Chamado ao carregar cada página.
 */
function atualizarMenuDoUsuario() {
  var menu = document.getElementById("menu-usuario");
  if (!menu) return;

  if (verificarSeEstaLogado()) {
    var usuario = obterUsuarioLogado();
    var nomeExibido = usuario ? usuario.name.split(" ")[0] : "Conta";

    var html =
      '<a href="perfil.html" class="cabecalho-link">Olá, ' +
      nomeExibido +
      "</a>";

    if (verificarSeEhAdmin()) {
      html += '<a href="admin.html" class="cabecalho-link">Admin</a>';
    }

    html +=
      '<button class="cabecalho-link" onclick="realizarLogout()" style="background:none;border:none;cursor:pointer;font-size:var(--texto-sm);font-weight:500;color:var(--cinza-texto);">Sair</button>';

    menu.innerHTML = html;
  } else {
    menu.innerHTML =
      '<a href="login.html" class="cabecalho-link">Entrar</a>' +
      '<a href="cadastro.html" class="cabecalho-link destaque">Cadastrar</a>';
  }
}

/* ATUALIZAR CONTADOR DO CARRINHO*/

function atualizarContadorDoCarrinho() {
  var badge = document.getElementById("carrinho-contador");
  if (!badge) return;

  var quantidade = calcularQuantidadeTotalDoCarrinho();

  if (quantidade > 0) {
    badge.textContent = quantidade;
    badge.classList.remove("oculto");
  } else {
    badge.classList.add("oculto");
  }
}

/*INICIALIZAÇÃO GLOBAL (roda em todas as páginas) */

document.addEventListener("DOMContentLoaded", function () {
  atualizarMenuDoUsuario();
  atualizarContadorDoCarrinho();
});