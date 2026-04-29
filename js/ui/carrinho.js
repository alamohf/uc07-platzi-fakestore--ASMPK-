/**
 * carrinho.js — Gerenciamento do carrinho de compras via localStorage
 * Responsável: Dev 2
 *
 * O carrinho é armazenado no localStorage como um array de objetos:
 * [{ id, title, price, image, quantidade }]
 *
 * Não há checkout nem integração com API — tudo é local.
 */

const Carrinho = {
  CHAVE: 'carrinho',
  ESTOQUE_MAX: 10, // Limite simulado por produto

  // ---- CORE DE DADOS ----

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
      exibirToast('Erro: Memória do navegador cheia!', 'erro');
    }
  },

  // ---- OPERAÇÕES ----

  adicionar(produto) {
    let carrinho = this.obterItens();
    let itemExistente = carrinho.find(item => item.id === Number(produto.id));

    if (itemExistente) {
      if (itemExistente.quantidade >= this.ESTOQUE_MAX) {
        exibirToast(`Limite de ${this.ESTOQUE_MAX} unidades atingido.`, 'info');
        return;
      }
      itemExistente.quantidade += 1;
    } else {
      carrinho.push({
        id: Number(produto.id),
        title: produto.title,
        price: Number(produto.price),
        image: produto.images?.[0] || 'https://via.placeholder.com/80x80?text=Sem+imagem',
        quantidade: 1
      });
    }

    this.salvar(carrinho);
    exibirToast('Produto adicionado!', 'sucesso');
  },

  remover(id) {
    const carrinho = this.obterItens().filter(item => item.id !== Number(id));
    this.salvar(carrinho);
  },

  alterarQuantidade(id, novaQtd) {
    if (novaQtd <= 0) return this.remover(id);
    if (novaQtd > this.ESTOQUE_MAX) {
      exibirToast(`Estoque máximo atingido (${this.ESTOQUE_MAX})`, 'info');
      return;
    }

    const carrinho = this.obterItens();
    const item = carrinho.find(item => item.id === Number(id));
    if (item) {
      item.quantidade = novaQtd;
      this.salvar(carrinho);
    }
  },

  limpar() {
    localStorage.removeItem(this.CHAVE);
    this.atualizarInterface();
  },

  // ---- CÁLCULOS (Getters) ----

  get totalFinanceiro() {
    return this.obterItens().reduce((acc, item) => acc + (item.price * item.quantidade), 0);
  },

  get totalItens() {
    return this.obterItens().reduce((acc, item) => acc + item.quantidade, 0);
  },

  // ---- UTILITÁRIOS ----

  formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  },

  // ---- UI & RENDERIZAÇÃO ----

  atualizarInterface() {
    // Atualiza o Badge do Header
    const badge = document.getElementById('carrinho-badge');
    if (badge) {
      const qtd = this.totalItens;
      badge.textContent = qtd;
      badge.style.display = qtd > 0 ? 'inline-flex' : 'none';
      
      // Efeito visual de pulso no badge
      badge.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.2)' }, { transform: 'scale(1)' }], 200);
    }

    // Se estivermos na página de carrinho, re-renderiza a lista
    if (document.getElementById('lista-carrinho')) {
      this.renderizarPaginaCarrinho();
    }
  },

  renderizarPaginaCarrinho() {
    const container = document.getElementById('lista-carrinho');
    const resumo = document.getElementById('resumo-carrinho');
    const carrinho = this.obterItens();

    if (carrinho.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icone">🛒</div>
          <p class="empty-state-texto">Seu carrinho está vazio</p>
          <a href="index.html" class="btn btn-primario">Voltar à vitrine</a>
        </div>`;
      if (resumo) resumo.style.display = 'none';
      return;
    }

    container.innerHTML = carrinho.map(item => `
      <div class="carrinho-item">
        <img src="${item.image}" alt="${item.title}" class="carrinho-item-imagem">
        <div class="carrinho-item-info">
          <h3 class="carrinho-item-titulo">${item.title}</h3>
          <p class="carrinho-item-preco">${this.formatarMoeda(item.price)}</p>
        </div>
        <div class="carrinho-item-quantidade">
          <button class="btn btn-pequeno" onclick="Carrinho.alterarQuantidade(${item.id}, ${item.quantidade - 1})">−</button>
          <span class="carrinho-item-qtd">${item.quantidade}</span>
          <button class="btn btn-pequeno" onclick="Carrinho.alterarQuantidade(${item.id}, ${item.quantidade + 1})">+</button>
        </div>
        <p class="carrinho-item-subtotal">Total: ${this.formatarMoeda(item.price * item.quantidade)}</p>
        <button class="btn btn-pequeno btn-perigo" onclick="Carrinho.remover(${item.id})">Remover</button>
      </div>
    `).join('');

    if (resumo) {
      resumo.style.display = 'block';
      document.getElementById('carrinho-total').textContent = this.formatarMoeda(this.totalFinanceiro);
      document.getElementById('carrinho-qtd-total').textContent = `${this.totalItens} item(ns)`;
    }
  }
};

// ---- ESCUTADORES DE EVENTOS ----

// Sincroniza abas: se mudar o carrinho em uma aba, a outra atualiza sozinha
window.addEventListener('storage', (e) => {
  if (e.key === Carrinho.CHAVE) Carrinho.atualizarInterface();
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => Carrinho.atualizarInterface());

// Expõe globalmente para os botões HTML continuarem funcionando
window.Carrinho = Carrinho;