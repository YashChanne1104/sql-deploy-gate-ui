// ===========================
// AuthModel -- everything about who the user is and their session.
// Knows nothing about HTML/DOM. Pure data + API calls.
// ===========================
const AuthModel = {
    async login(email, password) {
        const data = await apiFetch("/login/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });

        localStorage.setItem("access_token", data.access_token);

        const payload = JSON.parse(atob(data.access_token.split(".")[1]));
        localStorage.setItem("role", payload.role || "");
        localStorage.setItem("email", payload.sub || "");

        return { role: payload.role, email: payload.sub };
    },

    async signup(email, password) {
        return apiFetch("/login/signup", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
    },

    getToken() {
        return localStorage.getItem("access_token");
    },

    getRole() {
        return localStorage.getItem("role");
    },

    getEmail() {
        return localStorage.getItem("email");
    },

    isLoggedIn() {
        return !!this.getToken();
    },

    hasRole(...roles) {
        return roles.includes(this.getRole());
    },

    logout() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        window.location.href = "home.html";
    },

    // Where a logged-in user should land -- on their own dashboard for now.
    // Kept as one function so every controller stays in sync as new
    // role-specific pages (push/pull views) get added back in.
    homeForRole() {
        return "dashboard.html";
    },

    // Call at the top of any page that requires login.
    // requiredRoles: optional list -- if given, redirects non-matching roles
    // to their own home instead of the page they were denied, so this never
    // creates a redirect loop.
    guard(requiredRoles = null) {
        if (!this.isLoggedIn()) {
            window.location.href = "index.html";
            return false;
        }
        if (requiredRoles && !this.hasRole(...requiredRoles)) {
            window.location.href = this.homeForRole();
            return false;
        }
        return true;
    },
};
