// ===========================
// ActivityController -- wires activity.html together.
// Open to every logged-in role -- the backend scopes what each role
// actually sees (Developers get their own actions, Approver/Admin get
// the full trail).
// ===========================
document.addEventListener("DOMContentLoaded", () => {
    const session = initPageShell("activity.html");
    if (!session) return;
});
