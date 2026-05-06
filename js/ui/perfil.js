const API_BASE_URL = "https://api.escuelajs.co/api/v1";

// Protege a página — redireciona se não estiver logado
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "login.html";
}

async function carregarPerfil() {
  try {
    // IMPLEMENTADO: GET /auth/profile com Bearer token
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    const usuario = await response.json();

    // Salva os dados do usuário para uso do autorizacao.js
    localStorage.setItem("usuario", JSON.stringify(usuario));

    // Preenche nome
    const nomeEl = document.querySelector(".profile-details h1");
    if (nomeEl) nomeEl.textContent = usuario.name;

    // Preenche e-mail
    const emailEl = document.querySelector(".profile-meta span:first-child");
    if (emailEl)
      emailEl.innerHTML = `<span class="material-symbols-outlined">mail</span> ${usuario.email}`;

    // Preenche avatar se disponível
    const avatarEl = document.querySelector(".profile-img");
    if (avatarEl && usuario.avatar) avatarEl.src = usuario.avatar;

    // Preenche label de role
    const labelEl = document.querySelector(".profile-label");
    if (labelEl) {
      labelEl.textContent =
        usuario.role === "admin" ? "Administrador" : "Comerciante Verificado";
    }
  } catch (error) {
    alert(error.message);
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
  }
}

function configurarLogout() {
  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      window.location.href = "login.html";
    });
  }
}

carregarPerfil();
configurarLogout();
