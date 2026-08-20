// ===========================
// LoginController -- wires index.html together.
// If already logged in, skip straight past the form.
// No client-side validation -- server is the source of truth on
// whether the email/password combo is valid; we just relay its error.
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

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        btn.disabled = true;
        btn.textContent = "Signing in...";

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