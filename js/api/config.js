/**
 * config.js — Configurações e helper central de requisições HTTP
 *
 * Responsável: Líder Técnico (Álamo)
 *
 * REGRA DE OURO: todos os arquivos em /js/api/ usam a função
 * fazerRequisicao() em vez de fetch() direto. Isso garante:
 *   1. try/catch em todas as chamadas
 *   2. Header Authorization automático
 *   3. Tratamento de 401 (sessão expirada)
 *   4. URL base centralizada
 */

var URL_BASE_API = "https://api.escuelajs.co/api/v1";

/**

 * @param {string} caminho 
 * @param {object} configuracoes 
 * @returns {Promise} 
 */
async function fazerRequisicao(caminho, configuracoes) {
  configuracoes = configuracoes || {};

  var urlCompleta = URL_BASE_API + caminho;
  var tokenSalvo = localStorage.getItem("token");

 
  var headers = { "Content-Type": "application/json" };

  
  if (tokenSalvo) {
    headers["Authorization"] = "Bearer " + tokenSalvo;
  }


  if (configuracoes.headers) {
    Object.assign(headers, configuracoes.headers);
  }

  try {
    var resposta = await fetch(
      urlCompleta,
      Object.assign({}, configuracoes, {
        headers: headers,
      }),
    );

    if (resposta.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("dadosUsuario");
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    if (!resposta.ok) {
      var corpoErro = {};
      try {
        corpoErro = await resposta.json();
      } catch (e) {}

      var mensagemErro = corpoErro.message || "Erro " + resposta.status;
      if (Array.isArray(mensagemErro)) {
        mensagemErro = mensagemErro.join(", ");
      }
      throw new Error(mensagemErro);
    }
   
    if (resposta.status === 204) return null;

    return await resposta.json();
  } catch (erro) {

    console.error(
      "[API]",
      configuracoes.method || "GET",
      caminho,
      "→",
      erro.message,
    );
    throw erro;
  }
}
var requisicaoAPI = fazerRequisicao;