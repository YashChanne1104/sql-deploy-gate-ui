// ===========================
// DashboardController -- wires dashboard.html together.
// ===========================
document.addEventListener("DOMContentLoaded", () => {
    const session = initPageShell("dashboard.html");
    if (!session) return;

    document.getElementById("dashEmail").textContent = session.email;
    document.getElementById("dashRole").textContent = session.role;
});
