// ===========================
// SubmissionsController -- wires submissions.html together.
// Push a SQL change, see the AI verdict immediately, and browse past
// pushes below. This is the ONLY file that touches document.* on this
// page. Open to every logged-in role -- the backend scopes list() to
// "your own" for Developers, and "everyone's" for Approver/Admin.
// ===========================
document.addEventListener("DOMContentLoaded", () => {
    const session = initPageShell("submissions.html");
    if (!session) return;

    const form = document.getElementById("pushForm");
    const textarea = document.getElementById("sqlText");
    const btn = document.getElementById("pushBtn");
    const resultEl = document.getElementById("pushResult");
    const listEl = document.getElementById("subList");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const sqlText = textarea.value.trim();
        if (!sqlText) return;

        resultEl.innerHTML = "";
        btn.disabled = true;
        btn.textContent = "Pushing...";

        try {
            const submission = await SubmissionModel.create(sqlText);
            resultEl.innerHTML = SubmissionsView.renderResult(submission);
            textarea.value = "";
            loadList();
        } catch (err) {
            resultEl.innerHTML = `<div class="error-box inline">${err.message}</div>`;
        } finally {
            btn.disabled = false;
            btn.textContent = "Push for review";
        }
    });

    async function loadList() {
        listEl.innerHTML = `<div class="empty-state">Loading...</div>`;
        try {
            const submissions = await SubmissionModel.list();
            listEl.innerHTML = SubmissionsView.renderList(submissions);
            wireRowToggles();
        } catch (err) {
            listEl.innerHTML = `<div class="error-box">${err.message}</div>`;
        }
    }

    // Rows expand in place to show the full SQL + verdict -- no separate
    // review page needed here (that's what Approvals is for).
    function wireRowToggles() {
        listEl.querySelectorAll("[data-toggle]").forEach((head) => {
            head.addEventListener("click", () => {
                head.closest(".sub-row").classList.toggle("open");
            });
        });
    }

    loadList();
});
