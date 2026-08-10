// ===========================
// ApprovalsView -- pure rendering for the approve/reject queue.
// Never calls the API, never touches localStorage.
// Reuses the .sub-row pattern from SubmissionsView but adds selection
// checkboxes and quick approve/reject actions.
// ===========================
const ApprovalsView = {
    escapeHtml(str) {
        const div = document.createElement("div");
        div.textContent = str == null ? "" : str;
        return div.innerHTML;
    },

    renderList(submissions) {
        if (!submissions || !submissions.length) {
            return `<div class="empty-state">Nothing pending right now.</div>`;
        }
        return `
      <div class="select-all-row">
        <label><input type="checkbox" id="selectAllCheckbox"> Select all</label>
      </div>
      <div class="sub-list">${submissions.map((s) => this.renderRow(s)).join("")}</div>
    `;
    },

    renderRow(s) {
        const labelCls = s.sql_type === "DDL" ? "label-ddl" : "label-dml";
        const date = s.created_at
            ? new Date(s.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
            : "—";
        const who = s.submitted_by_email || (s.submitted_by_id ? `User #${s.submitted_by_id}` : "unknown");

        return `
      <div class="sub-row" data-id="${s.id}">
        <div class="sub-row-head">
          <input type="checkbox" class="pr-select" data-id="${s.id}" aria-label="Select submission #${s.id}">
          <span class="sub-status-dot pending"></span>
          <div class="sub-main" data-toggle="${s.id}" style="cursor:pointer;">
            <div class="sub-title">
              <span class="sub-number">#${s.id}</span>
              ${s.object_type ? `[${this.escapeHtml(s.object_type)}] ` : ""}${s.sql_type} submission
            </div>
            <div class="sub-meta">
              ${this.escapeHtml(who)} · pushed ${date}
              <span class="label ${labelCls}">${s.sql_type}</span>
              ${s.ai_verdict ? `<span class="status-pill ${s.ai_verdict === "approved" ? "approved" : "pending"}">${this.escapeHtml(s.ai_verdict)}</span>` : ""}
            </div>
          </div>
          <div class="pr-quick-actions">
            <button class="btn btn-reject btn-sm quick-reject-btn" data-id="${s.id}">Reject</button>
            <button class="btn btn-approve btn-sm quick-approve-btn" data-id="${s.id}">Approve</button>
          </div>
          <span class="sub-chevron" data-toggle="${s.id}" style="cursor:pointer;">▸</span>
        </div>
        <div class="sub-detail">
          ${s.ai_summary ? `<div class="check-item pass"><span class="icon">•</span><span>${this.escapeHtml(s.ai_summary)}</span></div>` : ""}
          ${s.target_database ? `<div class="check-item pass"><span class="icon">•</span><span>Target: ${this.escapeHtml(s.target_database)}</span></div>` : ""}
          <div class="code-block">${this.escapeHtml(s.sql_text || "")}</div>
        </div>
      </div>
    `;
    },

    renderBulkBar(count) {
        if (!count) return "";
        return `
      <div class="bulk-action-bar">
        <span>${count} selected</span>
        <div class="spacer"></div>
        <button class="btn btn-secondary btn-sm" id="bulkClearBtn">Clear</button>
        <button class="btn btn-reject btn-sm" id="bulkRejectBtn">Reject selected</button>
        <button class="btn btn-approve btn-sm" id="bulkApproveBtn">Approve selected</button>
      </div>
    `;
    },
};