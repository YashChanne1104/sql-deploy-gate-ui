// ===========================
// UsersController -- wires users.html together. Admin only.
// Where roles get assigned/reassigned to accounts.
// ===========================
document.addEventListener("DOMContentLoaded", () => {
    const session = initPageShell("users.html", ["Admin"]);
    if (!session) return;
});
