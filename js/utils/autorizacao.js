/**
 * autorizacao.js — Controle de acesso tipo de login
 * Responsável: Dev 4(kaua)
 */

function obterUsuarioLogado() {
  let json = localStorage.getItem('usuario');
  try { return json ? JSON.parse(json) : null; }
  catch (e) { return null; }
}

function estaLogado() {
  return !!localStorage.getItem('token');
}

function ehAdmin() {
  let usuario = obterUsuarioLogado();
  return usuario !== null && usuario.role === 'admin';
}

function exigirAdmin() {
  if (!ehAdmin()) {
    alert('Acesso restrito a administradores.');
    window.location.href = 'index.html';
  }
}

function exigirLogin() {
  if (!estaLogado()) {
    window.location.href = 'login.html';
  }
}

function fazerLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = 'index.html';
}
