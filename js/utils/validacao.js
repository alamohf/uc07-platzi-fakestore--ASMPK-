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
}
