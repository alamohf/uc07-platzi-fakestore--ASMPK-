/**
 * estado.js — Estado global compartilhado
 * Escrito em pair programming: Álamo (LT) + Dev 1
 */

let estado = {
  produtos: [],
  categorias: [],
  filtros: { categoriaId: null, busca: '', precoMin: null, precoMax: null },
  paginacao: { offset: 0, limit: 12 },
  usuarioLogado: null
};

let listeners = [];

function atualizarEstado(novo) {
  Object.assign(estado, novo);
  listeners.forEach(function(callback) { callback(estado); });
}

function obterEstado() {
  return JSON.parse(JSON.stringify(estado));
}

function aoMudarEstado(callback) {
  listeners.push(callback);
}

function resetarFiltros() {
  atualizarEstado({
    filtros: { categoriaId: null, busca: '', precoMin: null, precoMax: null },
    paginacao: { offset: 0, limit: 12 }
  });
}
