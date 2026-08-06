// ===========================
// ApprovalsController -- wires approvals.html together. Approver/Admin only.
// ===========================
document.addEventListener("DOMContentLoaded", () => {
    const session = initPageShell("approvals.html", ["Approver", "Admin"]);
    if (!session) return;
});
