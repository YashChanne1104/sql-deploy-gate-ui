// ===========================
// ReviewController -- the "glue" for review.html.
// Fetches one submission via SubmissionModel, renders it via ReviewView,
// wires up approve/reject. This is the ONLY file that touches document.*
// on this page.
// ===========================
document.addEventListener("DOMContentLoaded", async () => {
    if (!AuthModel.guard(["Approver", "Admin"])) return;

    NavView.init("queue.html");
    document.getElementById("userEmail").textContent = AuthModel.getEmail();
    document.getElementById("logoutBtn").addEventListener("click", () => AuthModel.logout());

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const contentEl = document.getElementById("reviewContent");

    if (!id) {
        contentEl.innerHTML = `<div class="error-box">No submission ID given.</div>`;
        return;
    }

    async function load() {
        contentEl.innerHTML = `<div class="empty-state">Loading...</div>`;
        try {
            const submission = await SubmissionModel.get(id);
            render(submission);
        } catch (err) {
            contentEl.innerHTML = `<div class="error-box">${err.message}</div>`;
        }
    }

    function render(submission) {
        contentEl.innerHTML =
            ReviewView.renderHeader(submission) +
            ReviewView.renderChecks(submission) +
            ReviewView.renderDiff(submission) +
            ReviewView.renderActions(submission);

        if (submission.status === "Pending") {
            document.getElementById("approveBtn").addEventListener("click", () => handleApprove(submission.id));
            document.getElementById("rejectBtn").addEventListener("click", () => handleReject(submission.id));
        }
    }

    async function handleApprove(subId) {
        if (!confirm("Approve this submission?")) return;
        try {
            await SubmissionModel.approve(subId);
            load();
        } catch (err) {
            alert(err.message);
        }
    }

    async function handleReject(subId) {
        const reason = prompt("Reason for rejection:");
        if (!reason) return;
        try {
            await SubmissionModel.reject(subId, reason);
            load();
        } catch (err) {
            alert(err.message);
        }
    }

    load();
});