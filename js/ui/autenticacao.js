const API_BASE_URL = "https://api.escuelajs.co/api/v1";

const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email-login");
const passwordInput = document.getElementById("password-login");

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const loginData = {
      email: emailInput.value.trim(),
      password: passwordInput.value.trim(),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        throw new Error("E-mail ou senha incorretos.");
      }

      const data = await response.json();

      localStorage.setItem("access_token", data.access_token);

      alert("Login realizado com sucesso! Redirecionando...");

      window.location.href = "index.html";
    } catch (error) {
      alert(error.message);
      console.error("Erro no login:", error.message);

      emailInput.style.borderColor = "#e63636";
      passwordInput.style.borderColor = "#e63636";
    }
  });
}
