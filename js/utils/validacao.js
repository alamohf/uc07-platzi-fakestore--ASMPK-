const API_BASE_URL = "https://api.escuelajs.co/api/v1";

const formCadastro = document.getElementById("cadastro-form");
const nameInput = document.getElementById("name-cadastro");
const spanNome = nameInput.nextElementSibling;
const emailInput = document.getElementById("email-cadastro");
const emailStatus = document.getElementById("email-status");
const spanEmail = emailInput.nextElementSibling;
const senhaInput = document.getElementById("password-cadastro");
const confirmarSenhaInput = document.getElementById(
  "confirm-password-cadastro",
);

nameInput.addEventListener("input", () => {
  const valor = nameInput.value.trim();

  const temSobrenome = valor.includes(" ") && valor.split(" ")[1].length > 0;

  if (valor.length < 5 || !temSobrenome) {
    nameInput.style.borderColor = "#e63636";
    spanNome.style.display = "block";
  } else {
    nameInput.style.borderColor = "#006b3f";
    spanNome.style.display = "none";
  }
});

emailInput.addEventListener("blur", async () => {
  const email = emailInput.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    emailInput.style.borderColor = "#e63636";
    spanEmail.style.display = "block";
    emailStatus.classList.add("hidden");
    return;
  } else {
    spanEmail.style.display = "none";
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users`);

    if (response.ok) {
      const usuarios = await response.json();

      const emailJaExiste = usuarios.some((user) => user.email === email);

      if (!emailJaExiste) {
        emailStatus.classList.remove("hidden");
        emailInput.style.borderColor = "#006b3f";
      } else {
        emailStatus.classList.add("hidden");
        alert("Este e-mail já está cadastrado. Tente outro.");
        emailInput.style.borderColor = "#e63636";
      }
    }
  } catch (err) {
    console.error("Erro ao verificar e-mail:", err.message);
  }
});

formCadastro.addEventListener("submit", async (event) => {
  event.preventDefault();

  const valorNome = nameInput.value.trim();
  if (!valorNome.includes(" ") || valorNome.split(" ")[1].length === 0) {
    alert("Por favor, digite nome e sobrenome.");
    return;
  }

  if (senhaInput.value !== confirmarSenhaInput.value) {
    alert("As senhas não coincidem!");
    confirmarSenhaInput.style.borderColor = "#e63636";
    return;
  }

  if (senhaInput.value.length < 8) {
    alert("A senha deve ter no mínimo 8 caracteres.");
    senhaInput.style.borderColor = "#e63636";
    return;
  }

  const novoUsuario = {
    name: nameInput.value,
    email: emailInput.value,
    password: senhaInput.value,
    avatar: "https://picsum.photos/800",
  };

  try {
    const res = await fetch(`${API_BASE_URL}/users/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novoUsuario),
    });

    if (!res.ok) throw new Error(res.statusText);

    const data = await res.json();
    alert("Cadastro realizado com sucesso!");
    window.location.href = "login.html";
  } catch (err) {
    alert("Erro ao cadastrar usuário. Verifique os dados no console.");
    console.error(err.message);
  }
});
