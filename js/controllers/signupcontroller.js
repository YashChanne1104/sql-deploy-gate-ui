// ===========================
// SignupController -- wires signup.html together.
// If already logged in, skip straight past the form.
// Validates client-side first (fast feedback, no round-trip for
// obvious mistakes) -- backend is still the real source of truth and
// re-validates everything server-side.
// Signup does not log the user in (no token returned) -- on success we
// send them to the login page to sign in with their new credentials.
// ===========================
document.addEventListener("DOMContentLoaded", () => {
    if (AuthModel.isLoggedIn()) {
        window.location.href = AuthModel.homeForRole();
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
        const confirmPassword = document.getElementById("confirmPassword").value;

        const validationError =
            Validation.validateEmail(email) ||
            Validation.validatePassword(password) ||
            Validation.validateConfirmPassword(password, confirmPassword);

        if (validationError) {
            errorEl.innerHTML = `<div class="error-box">${validationError}</div>`;
            return;
        }

        btn.disabled = true;
        btn.textContent = "Creating account...";

        try {
            await AuthModel.signup(email, password);
            window.location.href = "index.html"; // go log in with the new account
        } catch (err) {
            errorEl.innerHTML = `<div class="error-box">${err.message}</div>`;
            btn.disabled = false;
            btn.textContent = "Sign up";
        }
    });
});