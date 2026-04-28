/**
 * Configurações da API e tratamento dos erros
 */

const API_BASE_URL = 'https://api.escuelajs.co/api/v1';
const API_DOC_URL = 'https://fakeapi.platzi.com/en/rest/products/';

async function requisicaoAPI(endpoint, opcoes) {
  opcoes = opcoes || {};
  var url = API_BASE_URL + endpoint;
  var token = localStorage.getItem('token');

  var headers = { 'Content-Type': 'application/json' };
  if (token) { headers['Authorization'] = 'Bearer ' + token; }
  if (opcoes.headers) { Object.assign(headers, opcoes.headers); }

  try {
    var resposta = await fetch(url, Object.assign({}, opcoes, { headers: headers }));

    if (resposta.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    if (!resposta.ok) {
      var erroBody = {};
      try { erroBody = await resposta.json(); } catch (e) {}
      var mensagem = erroBody.message || ('Erro ' + resposta.status);
      if (Array.isArray(mensagem)) { mensagem = mensagem.join(', '); }
      throw new Error(mensagem);
    }

    if (resposta.status === 204) return null;

    return await resposta.json();
  } catch (erro) {
    console.error('[API] ' + (opcoes.method || 'GET') + ' ' + endpoint + ':', erro.message);
    throw erro;
  }
}