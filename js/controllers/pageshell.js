// ===========================
// PageShell -- the common setup every authenticated page needs:
// guard the page, render the role-aware nav, fill in the user chip,
// wire logout. One place to fix instead of eight.
//
// Returns { email, role } on success, or null if the guard redirected
// (in which case the caller should stop immediately).
// ===========================
function initPageShell(activeHref, requiredRoles = null) {
    if (!AuthModel.guard(requiredRoles)) return null;

    const email = AuthModel.getEmail();
    const role = AuthModel.getRole();

    const emailEl = document.getElementById("userEmail");
    if (emailEl) emailEl.textContent = email;

    const roleTagEl = document.getElementById("roleTag");
    if (roleTagEl) {
        roleTagEl.textContent = role;
        roleTagEl.className = `role-tag role-${role.toLowerCase()}`;
    }

    NavView.init(activeHref);

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            AuthModel.logout();
        });
    }

    return { email, role };
}
