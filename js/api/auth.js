/**
 * auth.js — Endpoints de autenticação
 * Responsável: Dev 4
 */

async function fazerLogin(email, senha) {
  return await requisicaoAPI('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: email, password: senha })
  });
}

async function buscarPerfil() {
  return await requisicaoAPI('/auth/profile');
}
