// ===========================
// AuditView -- pure rendering for the audit trail.
// Matches AuditSummaryOut exactly: id, user, type, query_summary,
// ai_verdict, status, approved_by, approved_at, reject_reason, raised_at,
// target_database. Never calls the API, never touches localStorage.
// Renders as a report-style table.
// ===========================
const AuditView = {
  escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : str;
    return div.innerHTML;
  },

  formatDate(val) {
    return val
      ? new Date(val).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
      : "—";
  },

  renderList(records) {
    if (!records || !records.length) {
      return `<div class="empty-state">No audit records.</div>`;
    }
    return `
      <div class="report-table-wrap">
        <table class="report-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>User</th>
              <th>Type</th>
              <th>Query Summary</th>
              <th>AI Verdict</th>
              <th>Target DB</th>
              <th>Raised</th>
              <th>Resolution</th>
            </tr>
          </thead>
          <tbody>
            ${records.map((r) => this.renderRow(r)).join("")}
          </tbody>
        </table>
      </div>
    `;
  },

  renderRow(r) {
    const statusCls = (r.status || "pending").toLowerCase();
    const labelCls = r.type === "DDL" ? "label-ddl" : "label-dml";

    let resolution = "—";
    if (r.status === "Rejected" && r.reject_reason) {
      const text = `Rejected${r.approved_by ? ` by ${r.approved_by}` : ""}: ${r.reject_reason}`;
      resolution = `<span class="audit-reason" title="${this.escapeHtml(text)}">${this.escapeHtml(text)}</span>`;
    } else if (r.status === "Approved" && r.approved_by) {
      const when = this.formatDate(r.approved_at);
      const text = `Merged by ${r.approved_by}${r.approved_at ? ` on ${when}` : ""}`;
      resolution = `<span class="audit-resolved" title="${this.escapeHtml(text)}">${this.escapeHtml(text)}</span>`;
    }

    return `
      <tr class="report-row">
        <td><span class="audit-status-dot ${statusCls}"></span><span class="status-pill ${statusCls}">${r.status}</span></td>
        <td class="audit-user">${this.escapeHtml(r.user || "unknown")}</td>
        <td><span class="label ${labelCls}">${r.type}</span></td>
        <td class="report-summary" title="${this.escapeHtml(r.query_summary || "")}">${this.escapeHtml(r.query_summary || "(no summary)")}</td>
        <td>${r.ai_verdict ? this.escapeHtml(r.ai_verdict) : "—"}</td>
        <td>${r.target_database ? this.escapeHtml(r.target_database) : "—"}</td>
        <td>${this.formatDate(r.raised_at)}</td>
        <td>${resolution}</td>
      </tr>
    `;
  },
};