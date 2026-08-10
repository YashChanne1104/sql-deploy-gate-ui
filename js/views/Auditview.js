// ===========================
// AuditView -- pure rendering for the audit trail.
// Matches AuditSummaryOut exactly: id, user, type, query_summary,
// ai_verdict, status, approved_by, approved_at, reject_reason, raised_at,
// target_database. Never calls the API, never touches localStorage.
// ===========================
const AuditView = {
    escapeHtml(str) {
        const div = document.createElement("div");
        div.textContent = str == null ? "" : str;
        return div.innerHTML;
    },

    renderList(records) {
        if (!records || !records.length) {
            return `<div class="empty-state">No audit records.</div>`;
        }
        return `<div class="audit-list">${records.map((r) => this.renderRow(r)).join("")}</div>`;
    },

    renderRow(r) {
        const statusCls = (r.status || "pending").toLowerCase();
        const labelCls = r.type === "DDL" ? "label-ddl" : "label-dml";
        const raised = r.raised_at
            ? new Date(r.raised_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
            : "—";

        let resolution = "";
        if (r.status === "Rejected" && r.reject_reason) {
            resolution = `<div class="audit-reason">Rejected${r.approved_by ? ` by ${this.escapeHtml(r.approved_by)}` : ""}: ${this.escapeHtml(r.reject_reason)}</div>`;
        } else if (r.status === "Approved" && r.approved_by) {
            const when = r.approved_at
                ? new Date(r.approved_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                : "";
            resolution = `<div class="audit-resolved">Merged by ${this.escapeHtml(r.approved_by)}${when ? ` on ${when}` : ""}</div>`;
        }

        return `
      <div class="audit-row">
        <span class="audit-status-dot ${statusCls}"></span>
        <div class="audit-main">
          <div class="audit-summary">
            <span class="audit-user">${this.escapeHtml(r.user || "unknown")}</span>
            &mdash; ${this.escapeHtml(r.query_summary || "(no summary)")}
          </div>
          <div class="audit-meta">
            <span class="label ${labelCls}">${r.type}</span>
            <span class="status-pill ${statusCls}">${r.status}</span>
            ${r.ai_verdict ? `<span>verdict: ${this.escapeHtml(r.ai_verdict)}</span>` : ""}
            ${r.target_database ? `<span>target: ${this.escapeHtml(r.target_database)}</span>` : ""}
            <span>raised ${raised}</span>
          </div>
          ${resolution}
        </div>
      </div>
    `;
    },
};