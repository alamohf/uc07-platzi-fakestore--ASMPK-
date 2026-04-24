/**
 * debounce.js — Controla frequência de chamadas de função
 */

function debounce(funcao, atraso) {
  var temporizador;
  return function() {
    var contexto = this;
    var argumentos = arguments;
    clearTimeout(temporizador);
    temporizador = setTimeout(function() {
      funcao.apply(contexto, argumentos);
    }, atraso);
  };
}
