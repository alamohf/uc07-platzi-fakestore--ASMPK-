/**
 *controle de usuarios
 */

async function cadastrarUsuario(dados) {
  return await requisicaoAPI('/users/', {
    method: 'POST',
    body: JSON.stringify(dados)
  });
}

async function verificarDisponibilidadeEmail(email) {
  return await requisicaoAPI('/users/is-available', {
    method: 'POST',
    body: JSON.stringify({ email: email })
  });
}
