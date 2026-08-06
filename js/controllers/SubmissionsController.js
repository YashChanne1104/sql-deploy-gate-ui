// ===========================
// SubmissionsController -- wires submissions.html together.
// Open to every logged-in role: push a change and review your own.
// ===========================
document.addEventListener("DOMContentLoaded", () => {
    const session = initPageShell("submissions.html");
    if (!session) return;
});
