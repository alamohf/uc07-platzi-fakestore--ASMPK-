/**
 * carrinho.js — Gerenciamento do carrinho de compras via localStorage
 *
 * O carrinho é armazenado no localStorage como um array de objetos:
 * [{ id, title, price, image, quantidade }]
 */

const Carrinho = {
  CHAVE: 'carrinho',
  ESTOQUE_MAX: 10,

  // ---- DADOS ----

  obterItens() {
    try {
      const json = localStorage.getItem(this.CHAVE);
      return json ? JSON.parse(json) : [];
    } catch (e) {
      console.error("Erro ao ler localStorage", e);
      return [];
    }
  },

  salvar(carrinho) {
    try {
      localStorage.setItem(this.CHAVE, JSON.stringify(carrinho));
      this.atualizarInterface();
    } catch (e) {
      exibirToast("Erro: Memória do navegador cheia!", "erro");
    }
  },

  // ---- OPERAÇÕES ----

  adicionar(produto) {
    let carrinho = this.obterItens();
    let itemExistente = carrinho.find((item) => item.id === Number(produto.id));

    if (itemExistente) {
      if (itemExistente.quantidade >= this.ESTOQUE_MAX) {
        exibirToast(`Limite de ${this.ESTOQUE_MAX} unidades atingido.`, "info");
        return;
      }
      itemExistente.quantidade += 1;
    } else {
      carrinho.push({
        id: Number(produto.id),
        title: produto.title,
        price: Number(produto.price),
        image: produto.images?.[0] || "https://via.placeholder.com/80x80?text=Sem+imagem",
        quantidade: 1,
      });
    }

    this.salvar(carrinho);
    exibirToast("Produto adicionado!", "sucesso");
  },

  remover(id) {
    const carrinho = this.obterItens().filter((item) => item.id !== Number(id));
    this.salvar(carrinho);
  },

  alterarQuantidade(id, novaQtd) {
    if (novaQtd <= 0) return this.remover(id);
    if (novaQtd > this.ESTOQUE_MAX) {
      exibirToast(`Estoque máximo atingido (${this.ESTOQUE_MAX})`, "info");
      return;
    }
    const carrinho = this.obterItens();
    const item = carrinho.find((i) => i.id === Number(id));
    if (item) {
      item.quantidade = novaQtd;
      this.salvar(carrinho);
    }
  },

  limpar() {
    localStorage.removeItem(this.CHAVE);
    this.atualizarInterface();
  },

  // ---- CÁLCULOS ----

  get totalFinanceiro() {
    return this.obterItens().reduce(
      (acc, item) => acc + item.price * item.quantidade,
      0
    );
  },

  get totalItens() {
    return this.obterItens().reduce((acc, item) => acc + item.quantidade, 0);
  },

  // ---- UTILITÁRIOS ----

  formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  },

  // ---- UI ----

  atualizarInterface() {
    const badge = document.getElementById("carrinho-badge");
    if (badge) {
      const qtd = this.totalItens;
      badge.textContent = qtd;
      badge.style.display = qtd > 0 ? "inline-flex" : "none";
      badge.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.2)" }, { transform: "scale(1)" }],
        200
      );
    }

    if (document.getElementById("lista-carrinho")) {
      this.renderizarPaginaCarrinho();
    }
  },

  renderizarPaginaCarrinho() {
    const container = document.getElementById("lista-carrinho");
    const resumo = document.getElementById("resumo-carrinho");
    const subtituloEl = document.getElementById("carrinho-subtitulo");
    const carrinho = this.obterItens();

    if (subtituloEl) {
      subtituloEl.textContent =
        carrinho.length === 0
          ? "Seu carrinho está vazio"
          : carrinho.length + (carrinho.length === 1 ? " item selecionado" : " itens selecionados");
    }

    if (carrinho.length === 0) {
      container.innerHTML =
        '<div class="carrinho-vazio">' +
        '<span class="material-symbols-outlined carrinho-vazio-icone">shopping_bag</span>' +
        "<h2>Seu carrinho está vazio</h2>" +
        "<p>Adicione produtos à sua seleção e eles aparecerão aqui.</p>" +
        '<a href="index.html" class="btn-voltar-vitrine">' +
        '<span class="material-symbols-outlined">arrow_back</span>' +
        "Explorar Produtos</a>" +
        "</div>";
      if (resumo) resumo.style.display = "none";
      return;
    }

    if (resumo) resumo.style.display = "";

    container.innerHTML = carrinho
      .map((item) => {
        const precoTotal = this.formatarMoeda(item.price * item.quantidade);
        return (
          '<div class="carrinho-item">' +
          '<img src="' + item.image + '" alt="' + item.title + '" class="carrinho-item-imagem"' +
          ' onerror="this.src=\'https://picsum.photos/seed/' + item.id + '/80/80\'">' +
          '<div class="carrinho-item-conteudo">' +
          '<h3 class="carrinho-item-nome">' + item.title + "</h3>" +
          '<span class="carrinho-item-badge">PRODUTO</span>' +
          '<div class="carrinho-item-quantidade">' +
          '<button class="btn-qtd" onclick="Carrinho.alterarQuantidade(' + item.id + "," + (item.quantidade - 1) + ')">−</button>' +
          '<span class="carrinho-item-qtd-valor">' + item.quantidade + "</span>" +
          '<button class="btn-qtd" onclick="Carrinho.alterarQuantidade(' + item.id + "," + (item.quantidade + 1) + ')">+</button>' +
          "</div></div>" +
          '<div class="carrinho-item-acoes">' +
          '<span class="carrinho-item-preco">' + precoTotal + "</span>" +
          '<button class="btn-remover-item" onclick="Carrinho.remover(' + item.id + ')" title="Remover">' +
          '<span class="material-symbols-outlined">delete</span></button>' +
          "</div></div>"
        );
      })
      .join("");

    const subtotalEl = document.getElementById("carrinho-subtotal");
    const totalEl = document.getElementById("carrinho-total");
    if (subtotalEl) subtotalEl.textContent = this.formatarMoeda(this.totalFinanceiro);
    if (totalEl) totalEl.textContent = this.formatarMoeda(this.totalFinanceiro);
  },
};

window.addEventListener("storage", (e) => {
  if (e.key === Carrinho.CHAVE) Carrinho.atualizarInterface();
});

document.addEventListener("DOMContentLoaded", () => Carrinho.atualizarInterface());

window.Carrinho = Carrinho;
