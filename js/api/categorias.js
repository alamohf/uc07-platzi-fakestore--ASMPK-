/**
 * categorias.js — Endpoint GET /categories
 * Responsável: Dev 1(samuel)
 */

async function buscarCategorias() {
  return await requisicaoAPI('/categories');
}
