// ===========================
// ApprovalsController -- wires approvals.html together. Approver/Admin only.
// Loads pending submissions, handles single + bulk approve/reject via the
// shared ModalView instead of native confirm()/prompt(). 
// ===========================
document.addEventListener("DOMContentLoaded", () => {
    const session = initPageShell("approvals.html", ["Approver", "Admin"]);
    if (!session) return;

    const listEl = document.getElementById("approvalsList");
    const bulkBarEl = document.getElementById("bulkBar");
    const selected = new Set();

    async function loadList() {
        listEl.innerHTML = `<div class="empty-state">Loading...</div>`;
        selected.clear();
        renderBulkBar();
        try {
            const submissions = await SubmissionModel.list("Pending");
            listEl.innerHTML = ApprovalsView.renderList(submissions);
            wireRowEvents();
        } catch (err) {
            listEl.innerHTML = `<div class="error-box">${err.message}</div>`;
        }
    }

    function renderBulkBar() {
        bulkBarEl.innerHTML = ApprovalsView.renderBulkBar(selected.size);
        if (!selected.size) return;

        document.getElementById("bulkClearBtn").addEventListener("click", () => {
            selected.clear();
            listEl.querySelectorAll(".pr-select").forEach((cb) => (cb.checked = false));
            const selectAll = document.getElementById("selectAllCheckbox");
            if (selectAll) selectAll.checked = false;
            renderBulkBar();
        });

        document.getElementById("bulkApproveBtn").addEventListener("click", () => {
            const ids = [...selected];
            ModalView.confirm({
                title: "Approve selected changes?",
                message: `${ids.length} submission${ids.length === 1 ? "" : "s"} will be merged. DDL deploys automatically; DML is written out for manual execution.`,
                confirmLabel: "Approve",
                onConfirm: async () => {
                    try {
                        await SubmissionModel.bulkApprove(ids);
                        loadList();
                    } catch (err) {
                        listEl.insertAdjacentHTML("beforebegin", `<div class="error-box">${err.message}</div>`);
                    }
                },
            });
        });

        document.getElementById("bulkRejectBtn").addEventListener("click", () => {
            const ids = [...selected];
            ModalView.prompt({
                title: "Reject selected changes?",
                message: `${ids.length} submission${ids.length === 1 ? "" : "s"} will be rejected. This reason is recorded in the audit trail.`,
                placeholder: "Why are these being rejected?",
                confirmLabel: "Reject",
                onSubmit: async (reason) => {
                    try {
                        await SubmissionModel.bulkReject(ids, reason);
                        loadList();
                    } catch (err) {
                        listEl.insertAdjacentHTML("beforebegin", `<div class="error-box">${err.message}</div>`);
                    }
                },
            });
        });
    }

    function wireRowEvents() {
        // Expand/collapse the SQL detail panel.
        listEl.querySelectorAll("[data-toggle]").forEach((el) => {
            el.addEventListener("click", () => {
                el.closest(".sub-row").classList.toggle("open");
            });
        });

        // Row selection -> bulk bar.
        listEl.querySelectorAll(".pr-select").forEach((cb) => {
            cb.addEventListener("click", (e) => e.stopPropagation());
            cb.addEventListener("change", () => {
                const id = Number(cb.dataset.id);
                if (cb.checked) selected.add(id);
                else selected.delete(id);
                renderBulkBar();
            });
        });

        const selectAll = document.getElementById("selectAllCheckbox");
        if (selectAll) {
            selectAll.addEventListener("change", () => {
                listEl.querySelectorAll(".pr-select").forEach((cb) => {
                    cb.checked = selectAll.checked;
                    const id = Number(cb.dataset.id);
                    if (selectAll.checked) selected.add(id);
                    else selected.delete(id);
                });
                renderBulkBar();
            });
        }

        // Quick single-row approve.
        listEl.querySelectorAll(".quick-approve-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const id = Number(btn.dataset.id);
                ModalView.confirm({
                    title: `Approve #${id}?`,
                    message: "DDL deploys automatically. DML is written out for manual execution.",
                    confirmLabel: "Approve",
                    onConfirm: async () => {
                        try {
                            await SubmissionModel.approve(id);
                            loadList();
                        } catch (err) {
                            listEl.insertAdjacentHTML("beforebegin", `<div class="error-box">${err.message}</div>`);
                        }
                    },
                });
            });
        });

        // Quick single-row reject.
        listEl.querySelectorAll(".quick-reject-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const id = Number(btn.dataset.id);
                ModalView.prompt({
                    title: `Reject #${id}?`,
                    message: "This reason is recorded in the audit trail.",
                    placeholder: "Why is this being rejected?",
                    confirmLabel: "Reject",
                    onSubmit: async (reason) => {
                        try {
                            await SubmissionModel.reject(id, reason);
                            loadList();
                        } catch (err) {
                            listEl.insertAdjacentHTML("beforebegin", `<div class="error-box">${err.message}</div>`);
                        }
                    },
                });
            });
        });
    }

    loadList();
});