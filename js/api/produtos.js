/**
 * produtos.js — Endpoints de /products
 * Responsável GETs: Dev 1 | POST/PUT/DELETE: Dev 3
 */

async function buscarProdutos(filtros) {
  filtros = filtros || {};
  var params = new URLSearchParams();
  params.append('offset', filtros.offset || 0);
  params.append('limit', filtros.limit || 12);
  if (filtros.categoryId) params.append('categoryId', filtros.categoryId);
  if (filtros.title) params.append('title', filtros.title);
  if (filtros.price_min != null) params.append('price_min', filtros.price_min);
  if (filtros.price_max != null) params.append('price_max', filtros.price_max);
  return await requisicaoAPI('/products?' + params.toString());
}

async function buscarProdutoPorId(id) {
  return await requisicaoAPI('/products/' + id);
}

async function buscarProdutosRelacionados(id) {
  // Primeiro buscamos o produto para saber a categoria dele
  const produto = await buscarProdutoPorId(id);
  // Depois buscamos outros produtos da mesma categoria
  return await buscarProdutos({ categoryId: produto.category.id, limit: 4 });
}

async function criarProduto(dados) {
  return await requisicaoAPI('/products/', {
    method: 'POST',
    body: JSON.stringify(dados)
  });
}

async function atualizarProduto(id, camposAlterados) {
  return await requisicaoAPI('/products/' + id, {
    method: 'PUT',
    body: JSON.stringify(camposAlterados)
  });
}

async function excluirProduto(id) {
  return await requisicaoAPI('/products/' + id, {
    method: 'DELETE'
  });
}
