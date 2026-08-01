// ===========================
// LoginController -- wires index.html together.
// If already logged in, skip straight past the form.
// ===========================
document.addEventListener("DOMContentLoaded", () => {
    if (AuthModel.isLoggedIn()) {
        redirectForRole(AuthModel.getRole());
        return;
    }

    const form = document.getElementById("loginForm");
    const errorEl = document.getElementById("formError");
    const btn = document.getElementById("loginBtn");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorEl.innerHTML = "";
        btn.disabled = true;
        btn.textContent = "Logging in...";

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        try {
            const { role } = await AuthModel.login(email, password);
            redirectForRole(role);
        } catch (err) {
            errorEl.innerHTML = `<div class="error-box">${err.message}</div>`;
            btn.disabled = false;
            btn.textContent = "Log in";
        }
    });
});

function redirectForRole(role) {
    if (role === "Developer") {
        window.location.href = "submit.html";
    } else {
        // Approver lands on Queue; Admin defaults to Queue but can reach
        // Submit and Admin too via the nav.
        window.location.href = "queue.html";
    }
}