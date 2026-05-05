/**
 * componentes.js — Funções de UI reutilizáveis em todas as páginas
 * Responsável: Dev 2 (Maria Clara)
 */

/* RENDERIZAÇÃO DE CARD DE PRODUTO*/

/**
 
 * @param {object} produto 
 * @returns {string} 
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


function extrairUrlDaImagem(images) {
  try {
    var lista = images;

    if (typeof images === "string") {
      lista = JSON.parse(images);
    }

    if (Array.isArray(lista) && lista.length > 0) {
    
      var url = lista[0].replace(/[\[\]"]/g, "").trim();

     
      if (url && url.startsWith("http")) {
       
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


  return "https://picsum.photos/seed/produto/400/300";
}



function irParaDetalheDoProduto(idProduto) {
  window.location.href = "produto.html?id=" + idProduto;
}


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


/**
 
 * @param {string} mensagem
 * @param {string} tipo 
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


/**
 
 * @param {string} mensagem 
 * @param {function} aoConfirmar 
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


document.addEventListener("DOMContentLoaded", function () {
  atualizarMenuDoUsuario();
  atualizarContadorDoCarrinho();
});