// ===========================
// SignupController -- wires signup.html together.
// ===========================
document.addEventListener("DOMContentLoaded", () => {
    if (AuthModel.isLoggedIn()) {
        window.location.href = AuthModel.homeForRole();
        return;
    }

    const form = document.getElementById("signupForm");
    const errorEl = document.getElementById("formError");
    const btn = document.getElementById("signupBtn");

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmInput = document.getElementById("confirmPassword");

    const emailErrorEl = document.getElementById("emailError");
    const passwordErrorEl = document.getElementById("passwordError");
    const confirmErrorEl = document.getElementById("confirmPasswordError");

    function clearAllErrors() {
        errorEl.innerHTML = "";
        [emailErrorEl, passwordErrorEl, confirmErrorEl].forEach(el => Validation.clearError(el));
        [emailInput, passwordInput, confirmInput].forEach(el => el.classList.remove("input-invalid"));
    }

    function markInvalid(input, errorEl, message) {
        input.classList.add("input-invalid");
        Validation.showError(errorEl, message);
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearAllErrors();

        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirm = confirmInput.value;

        const emailErr = Validation.validateEmail(email);
        const passwordErr = Validation.validatePassword(password);
        const confirmErr = Validation.validateConfirmPassword(password, confirm);

        let hasError = false;

        if (emailErr) {
            markInvalid(emailInput, emailErrorEl, emailErr);
            hasError = true;
        }
        if (passwordErr) {
            markInvalid(passwordInput, passwordErrorEl, passwordErr);
            hasError = true;
        }
        if (confirmErr) {
            markInvalid(confirmInput, confirmErrorEl, confirmErr);
            hasError = true;
        }

        if (hasError) {
            errorEl.innerHTML = `<div class="error-box">Please fix the highlighted fields below.</div>`;
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

    // Optional: live-clear a field's error as the user retypes it
    [
        [emailInput, emailErrorEl],
        [passwordInput, passwordErrorEl],
        [confirmInput, confirmErrorEl]
    ].forEach(([input, errEl]) => {
        input.addEventListener("input", () => {
            input.classList.remove("input-invalid");
            Validation.clearError(errEl);
        });
    });
});