/**
 * storage.js — Wrapper para localStorage
 */

function salvarNoStorage(chave, valor) {
  localStorage.setItem(chave, JSON.stringify(valor));
}

function lerDoStorage(chave) {
  var json = localStorage.getItem(chave);
  try {
    return json ? JSON.parse(json) : null;
  } catch (e) {
    return null;
  }
}

function removerDoStorage(chave) {
  localStorage.removeItem(chave);
}
