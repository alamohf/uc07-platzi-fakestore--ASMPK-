/* KAUÃ */

const form = document.getElementById("cadastro-form");
const campos = document.querySelectorAll(".required");
const spans = document.querySelectorAll(".span-required");
const emailRegex = /^\w+([-+.']\w+)*@\w+([ -. ]\w+)*\.\w+([ -. ]\w+)*$/;

function nameValidate() {
  if (campos[0].value.length < 3) {
    console.log("Nome deve ter 3 caracteres");
  } else {
    console.log("Nome validado");
  }
  
 /* KAUÃ */
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
