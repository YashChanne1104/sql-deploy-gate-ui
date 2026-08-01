// ===========================
// SignupController -- wires signup.html together.
// ===========================
document.addEventListener("DOMContentLoaded", () => {
    if (AuthModel.isLoggedIn()) {
        window.location.href = "submit.html";
        return;
    }

    const form = document.getElementById("signupForm");
    const errorEl = document.getElementById("formError");
    const btn = document.getElementById("signupBtn");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorEl.innerHTML = "";

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirm = document.getElementById("confirmPassword").value;

        if (password !== confirm) {
            errorEl.innerHTML = `<div class="error-box">Passwords don't match.</div>`;
            return;
        }

        btn.disabled = true;
        btn.textContent = "Creating account...";

        try {
            await AuthModel.signup(email, password);
            errorEl.innerHTML = `<div class="success-box">Account created — you can log in now.</div>`;
            form.reset();
            setTimeout(() => { window.location.href = "index.html"; }, 1200);
        } catch (err) {
            errorEl.innerHTML = `<div class="error-box">${err.message}</div>`;
            btn.disabled = false;
            btn.textContent = "Sign up";
        }
    });
});