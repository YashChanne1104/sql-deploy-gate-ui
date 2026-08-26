// ===========================
// DashboardController -- wires dashboard.html together.
// Renders the workspace hero immediately with loading placeholders,
// then fills in real Pending/Approved/Rejected counts once
// SubmissionModel.list() resolves. A failed stats fetch never breaks
// the page -- it just leaves the placeholders in place. 
// ===========================
document.addEventListener("DOMContentLoaded", () => {
    const session = initPageShell("dashboard.html");
    if (!session) return;

    const root = document.getElementById("workspaceRoot");
    root.innerHTML = WorkspaceView.render(session, null);

    loadStats();

    async function loadStats() {
        try {
            const submissions = await SubmissionModel.list();
            const counts = { Pending: 0, Approved: 0, Rejected: 0 };
            submissions.forEach((s) => {
                if (counts[s.status] !== undefined) counts[s.status]++;
            });
            root.innerHTML = WorkspaceView.render(session, counts);
        } catch (err) {
            // Stats are a nice-to-have -- leave the "—" placeholders.
        }
    }
});