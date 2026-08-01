// ===========================
// QueueController -- the "glue" for queue.html.
// Fetches data via SubmissionModel, renders it via QueueView,
// wires up the DOM. This is the ONLY file that touches document.*
// on this page.
//
// Supports both single-row (Approve/Reject buttons per row) and
// bulk (checkbox selection + action bar) approve/reject, backed by
// SubmissionModel's single and bulk-* endpoints respectively.
// ===========================
document.addEventListener("DOMContentLoaded", async () => {
    if (!AuthModel.guard(["Approver", "Admin"])) return;

    NavView.init("queue.html");
    document.getElementById("userEmail").textContent = AuthModel.getEmail();
    document.getElementById("logoutBtn").addEventListener("click", () => AuthModel.logout());

    const listEl = document.getElementById("queueList");
    const countEl = document.getElementById("queueCount");
    const bulkBarEl = document.getElementById("bulkBar");
    const selected = new Set();

    async function loadQueue() {
        listEl.innerHTML = `<div class="empty-state">Loading...</div>`;
        selected.clear();
        renderBulkBar();
        try {
            const submissions = await SubmissionModel.list("Pending");
            countEl.textContent = `${submissions.length} open`;
            listEl.innerHTML = QueueView.renderList(submissions);
            wireRowActions();
        } catch (err) {
            listEl.innerHTML = `<div class="error-box">${err.message}</div>`;
        }
    }

    function wireRowActions() {
        const selectAll = document.getElementById("selectAllCheckbox");
        if (selectAll) {
            selectAll.addEventListener("change", () => {
                listEl.querySelectorAll(".pr-select").forEach(cb => {
                    cb.checked = selectAll.checked;
                    toggleSelected(cb.dataset.id, selectAll.checked);
                });
            });
        }

        listEl.querySelectorAll(".pr-select").forEach(cb => {
            cb.addEventListener("change", () => toggleSelected(cb.dataset.id, cb.checked));
        });

        listEl.querySelectorAll(".quick-approve-btn").forEach(btn => {
            btn.addEventListener("click", () => confirmApprove([btn.dataset.id]));
        });

        listEl.querySelectorAll(".quick-reject-btn").forEach(btn => {
            btn.addEventListener("click", () => promptReject([btn.dataset.id]));
        });
    }

    function toggleSelected(id, isChecked) {
        if (isChecked) selected.add(id);
        else selected.delete(id);
        renderBulkBar();
    }

    function renderBulkBar() {
        bulkBarEl.innerHTML = QueueView.renderBulkBar(selected.size);
        if (!selected.size) return;

        document.getElementById("bulkClearBtn").addEventListener("click", () => {
            selected.clear();
            listEl.querySelectorAll(".pr-select").forEach(cb => (cb.checked = false));
            const selectAll = document.getElementById("selectAllCheckbox");
            if (selectAll) selectAll.checked = false;
            renderBulkBar();
        });
        document.getElementById("bulkApproveBtn").addEventListener("click", () => confirmApprove([...selected]));
        document.getElementById("bulkRejectBtn").addEventListener("click", () => promptReject([...selected]));
    }

    function confirmApprove(ids) {
        showModal({
            title: ids.length > 1 ? `Approve ${ids.length} submissions?` : `Approve submission #${ids[0]}?`,
            body: `<p>DDL changes deploy automatically once approved. DML changes are written out for manual execution.</p>`,
            confirmLabel: "Approve",
            confirmClass: "btn-approve",
            onConfirm: async () => {
                try {
                    if (ids.length > 1) {
                        await SubmissionModel.bulkApprove(ids);
                    } else {
                        await SubmissionModel.approve(ids[0]);
                    }
                    loadQueue();
                } catch (err) {
                    alert(err.message);
                }
            },
        });
    }

    function promptReject(ids) {
        showModal({
            title: ids.length > 1 ? `Reject ${ids.length} submissions?` : `Reject submission #${ids[0]}?`,
            body: `
        <div class="field" style="margin-bottom:0;">
          <label for="rejectReasonInput">Reason</label>
          <textarea id="rejectReasonInput" rows="3" placeholder="Why is this being rejected?"></textarea>
        </div>
      `,
            confirmLabel: "Reject",
            confirmClass: "btn-danger-solid",
            onConfirm: async (overlay) => {
                const reason = overlay.querySelector("#rejectReasonInput").value.trim();
                if (!reason) {
                    overlay.querySelector("#rejectReasonInput").focus();
                    return false; // keep the modal open until a reason is given
                }
                try {
                    if (ids.length > 1) {
                        await SubmissionModel.bulkReject(ids, reason);
                    } else {
                        await SubmissionModel.reject(ids[0], reason);
                    }
                    loadQueue();
                } catch (err) {
                    alert(err.message);
                }
            },
        });
    }

    // Generic styled confirm/action modal, replacing native confirm()/prompt().
    function showModal({ title, body, confirmLabel, confirmClass, onConfirm }) {
        const overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.innerHTML = `
      <div class="modal-box">
        <h3>${title}</h3>
        ${body}
        <div class="modal-actions" style="margin-top:20px;">
          <button class="btn btn-secondary btn-sm" id="modalCancel">Cancel</button>
          <button class="btn btn-sm ${confirmClass}" id="modalConfirm">${confirmLabel}</button>
        </div>
      </div>
    `;
        document.body.appendChild(overlay);

        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) overlay.remove();
        });
        overlay.querySelector("#modalCancel").addEventListener("click", () => overlay.remove());
        overlay.querySelector("#modalConfirm").addEventListener("click", async () => {
            const result = await onConfirm(overlay);
            if (result !== false) overlay.remove();
        });
    }

    loadQueue();
});