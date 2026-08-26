// Shared client-side validation utilities.
const Validation = {
    emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

    validateEmail(email) {
        if (!email || !email.trim()) return "Email is required.";
        if (!this.emailPattern.test(email.trim())) return "Enter a valid email address.";
        return null;
    },

    validatePassword(password, { minLength = 8 } = {}) {
        if (!password) return "Password is required.";
        if (password.length < minLength) return `Password must be at least ${minLength} characters.`;
        if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
            return "Password must contain at least one letter and one number.";
        }
        return null;
    },

    validateConfirmPassword(password, confirmPassword) {
        if (!confirmPassword) return "Please confirm your password.";
        if (password !== confirmPassword) return "Passwords do not match.";
        return null;
    },

    firstError(checks) {
        for (const [value, fn] of checks) {
            const err = fn(value);
            if (err) return err;
        }
        return null;
    },

    showError(container, message) {
        container.textContent = message;
        container.classList.add("visible");
    },

    clearError(container) {
        container.textContent = "";
        container.classList.remove("visible");
    }
};