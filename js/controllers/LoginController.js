// ===========================
// LoginController -- wires index.html together.
// If already logged in, skip straight past the form.
// ===========================
document.addEventListener("DOMContentLoaded", () => {
    if (AuthModel.isLoggedIn()) {
        window.location.href = AuthModel.homeForRole();
        return;
    }

    const form = document.getElementById("loginForm");
    const errorEl = document.getElementById("formError");
    const btn = document.getElementById("loginBtn");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorEl.innerHTML = "";
        btn.disabled = true;
        btn.textContent = "Signing in...";

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        try {
            await AuthModel.login(email, password);
            window.location.href = AuthModel.homeForRole();
        } catch (err) {
            errorEl.innerHTML = `<div class="error-box">${err.message}</div>`;
            btn.disabled = false;
            btn.textContent = "Log in";
        }
    });
});
