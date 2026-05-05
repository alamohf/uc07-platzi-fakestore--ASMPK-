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
 * Faz uma requisição HTTP para a API da Platzi Fake Store.
 *
 * @param {string} caminho - parte da URL após a base (ex: '/products')
 * @param {object} configuracoes - opções do fetch (method, body, headers)
 * @returns {Promise} dados da resposta em JSON
 */
async function fazerRequisicao(caminho, configuracoes) {
  configuracoes = configuracoes || {};

  var urlCompleta = URL_BASE_API + caminho;
  var tokenSalvo = localStorage.getItem("token");

  // Monta os headers da requisição
  var headers = { "Content-Type": "application/json" };

  // Se o usuário está logado, inclui o token
  if (tokenSalvo) {
    headers["Authorization"] = "Bearer " + tokenSalvo;
  }

  // Permite sobrescrever headers extras se necessário
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

    // Token expirado ou inválido: limpa sessão e avisa
    if (resposta.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("dadosUsuario");
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    // Qualquer outro erro HTTP
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

    // DELETE retorna 204 sem corpo

      var mensagemErro = corpoErro.message || "Erro " + resposta.status;
      if (Array.isArray(mensagemErro)) {
        mensagemErro = mensagemErro.join(", ");
      }
      throw new Error(mensagemErro);
    }
   
    if (resposta.status === 204) return null;

    return await resposta.json();
  } catch (erro) {
    // Log para debugging — remover antes da entrega final (30/04)

    console.error(
      "[API]",
      configuracoes.method || "GET",
      caminho,
      "→",
      erro.message,
    );
    throw erro; // propaga o erro para a camada de UI tratar
  }
}

// Alias para manter compatibilidade com os arquivos da API
var requisicaoAPI = fazerRequisicao;
    throw erro;
  }
}
var requisicaoAPI = fazerRequisicao;
