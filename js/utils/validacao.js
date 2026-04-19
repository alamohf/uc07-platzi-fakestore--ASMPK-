/**
 * validacao.js — Regras de validação dos formulários
 */

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function urlValida(url) {
  return url && url.startsWith('http');
}

function marcarCampoInvalido(campoId) {
  var campo = document.getElementById(campoId);
  if (campo) campo.classList.add('campo-invalido');
}

function limparValidacao(campoId) {
  var campo = document.getElementById(campoId);
  if (campo) campo.classList.remove('campo-invalido');
}

function limparTodosOsCampos(formularioIds) {
  formularioIds.forEach(function(id) { limparValidacao(id); });
}
