// ===========================
// ActivityController -- wires activity.html together.
// Open to every logged-in role -- the backend scopes what each role sees
// (Developers get their own actions, Approver/Admin get the full trail).
// Filters by status/sql_type and paginates with offset/limit since
// /audit/summary doesn't return a total count.
// ===========================
document.addEventListener("DOMContentLoaded", () => {
    const session = initPageShell("activity.html");
    if (!session) return;

    const listEl = document.getElementById("auditList");
    const pagerEl = document.getElementById("auditPager");
    const statusFilter = document.getElementById("statusFilter");
    const typeFilter = document.getElementById("typeFilter");

    const LIMIT = 20;
    let offset = 0;
    let lastPageCount = 0;

    async function load() {
        listEl.innerHTML = `<div class="empty-state">Loading...</div>`;
        pagerEl.innerHTML = "";

        try {
            const records = await AuditModel.list({
                offset,
                limit: LIMIT,
                status: statusFilter.value || null,
                sqlType: typeFilter.value || null,
            });
            lastPageCount = records.length;
            listEl.innerHTML = AuditView.renderList(records);
            renderPager();
        } catch (err) {
            listEl.innerHTML = `<div class="error-box">${err.message}</div>`;
        }
    }

    function renderPager() {
        const page = Math.floor(offset / LIMIT) + 1;
        const hasPrev = offset > 0;
        const hasNext = lastPageCount === LIMIT;

        if (!hasPrev && !hasNext && lastPageCount === 0) return;

        pagerEl.innerHTML = `
      <button class="btn btn-secondary btn-sm" id="prevPageBtn" ${hasPrev ? "" : "disabled"}>&larr; Prev</button>
      <span>Page ${page}</span>
      <button class="btn btn-secondary btn-sm" id="nextPageBtn" ${hasNext ? "" : "disabled"}>Next &rarr;</button>
    `;

        if (hasPrev) {
            document.getElementById("prevPageBtn").addEventListener("click", () => {
                offset = Math.max(0, offset - LIMIT);
                load();
            });
        }
        if (hasNext) {
            document.getElementById("nextPageBtn").addEventListener("click", () => {
                offset += LIMIT;
                load();
            });
        }
    }

    statusFilter.addEventListener("change", () => { offset = 0; load(); });
    typeFilter.addEventListener("change", () => { offset = 0; load(); });

    load();
});

