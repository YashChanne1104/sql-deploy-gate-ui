// ===========================
// ActivityController -- the "glue" for activity.html. Open to every
// logged-in role (Developer, Approver, Admin) -- the backend does the
// actual scoping: Developers only get their own actions back, while
// Approvers and Admins get the full trail. See AuditModel.js.
// Handles pagination since /audit returns 5 records per page.
// ===========================
document.addEventListener("DOMContentLoaded", async () => {
    if (!AuthModel.guard()) return;

    NavView.init("activity.html");
    document.getElementById("userEmail").textContent = AuthModel.getEmail();
    document.getElementById("logoutBtn").addEventListener("click", () => AuthModel.logout());

    const listEl = document.getElementById("auditList");
    const pagerEl = document.getElementById("auditPager");
    const PAGE_SIZE = 5;
    let offset = 0;

    async function loadPage() {
        listEl.innerHTML = `<div class="empty-state">Loading...</div>`;
        try {
            const logs = await AuditModel.list({ offset, limit: PAGE_SIZE });
            listEl.innerHTML = AuditView.renderTable(logs);
            renderPager(logs.length);
        } catch (err) {
            listEl.innerHTML = `<div class="error-box">${err.message}</div>`;
            pagerEl.innerHTML = "";
        }
    }

    function renderPager(resultCount) {
        if (resultCount === 0 && offset === 0) {
            pagerEl.innerHTML = "";
            return;
        }

        const hasPrev = offset > 0;
        const hasNext = resultCount === PAGE_SIZE;

        pagerEl.innerHTML = `
      <button class="btn btn-secondary btn-sm" id="prevPage" ${hasPrev ? "" : "disabled"}>← Prev</button>
      <span style="color: var(--fg-muted); font-size: 13px;">Showing ${offset + 1}–${offset + resultCount}</span>
      <button class="btn btn-secondary btn-sm" id="nextPage" ${hasNext ? "" : "disabled"}>Next →</button>
    `;

        if (hasPrev) {
            document.getElementById("prevPage").addEventListener("click", () => {
                offset = Math.max(0, offset - PAGE_SIZE);
                loadPage();
            });
        }
        if (hasNext) {
            document.getElementById("nextPage").addEventListener("click", () => {
                offset += PAGE_SIZE;
                loadPage();
            });
        }
    }

    loadPage();
});