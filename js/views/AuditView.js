// ===========================
// AuditView -- pure rendering for the audit log.
// Matches the real /audit response: id, actor_id, action, target_type,
// target_id, details (action-specific object), created_at.
// Falls back to actor_email if the backend ever adds one.
// ===========================
const AUDIT_META = {
  SUBMISSION_CREATED: { verb: "submitted", icon: "+", cls: "audit-created" },
  SUBMISSION_APPROVED: { verb: "approved", icon: "\u2713", cls: "audit-approved" },
  SUBMISSION_REJECTED: { verb: "rejected", icon: "\u2715", cls: "audit-rejected" },
};

const AuditView = {
  renderTable(logs) {
    if (!logs || !logs.length) {
      return `<div class="empty-state">No audit records.</div>`;
    }

    return `<div class="audit-feed">${logs.map(l => this.renderRow(l)).join("")}</div>`;
  },

  renderRow(log) {
    const meta = AUDIT_META[log.action] || { verb: (log.action || "").toLowerCase().replace(/_/g, " ") || "—", icon: "\u2022", cls: "audit-default" };

    const who = log.actor_email || (log.actor_id ? `User #${log.actor_id}` : "system");

    const when = log.created_at
      ? new Date(log.created_at).toLocaleString("en-GB", {
        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
      })
      : "—";

    const target = this.renderTarget(log);

    return `
      <div class="audit-row">
        <span class="audit-icon ${meta.cls}">${meta.icon}</span>
        <div class="audit-main">
          <div class="audit-line">
            <span class="audit-actor">${this.escapeHtml(who)}</span>
            <span class="audit-verb">${meta.verb}</span>
            ${target}
            <span class="audit-time">${when}</span>
          </div>
          ${this.renderDetails(log)}
        </div>
      </div>
    `;
  },

  renderTarget(log) {
    if (!log.target_type) return "";
    const label = `${log.target_type}${log.target_id ? ` #${log.target_id}` : ""}`;

    if (log.target_type === "Submission" && log.target_id) {
      return `<a href="review.html?id=${log.target_id}" class="audit-target">${label}</a>`;
    }
    return `<span class="audit-target-plain">${label}</span>`;
  },

  // Renders the action-specific `details` payload. Each action type has a
  // known shape; anything unrecognized falls back to a generic key/value list.
  renderDetails(log) {
    const d = log.details;
    if (!d || !Object.keys(d).length) return "";

    if (log.action === "SUBMISSION_CREATED") {
      return `
        <div class="audit-badges">
          ${d.sql_type ? `<span class="label ${d.sql_type === "DDL" ? "label-ddl" : "label-dml"}">${d.sql_type}</span>` : ""}
          ${d.ai_verdict ? `<span class="verdict-${d.ai_verdict}">${d.ai_verdict.replace(/_/g, " ")}</span>` : ""}
          ${d.target_database ? `<span class="audit-chip">target: ${this.escapeHtml(d.target_database)}</span>` : ""}
        </div>
      `;
    }

    if (log.action === "SUBMISSION_APPROVED") {
      const exec = d.execution_result;
      return `
        <div class="audit-badges">
          ${d.sql_type ? `<span class="label ${d.sql_type === "DDL" ? "label-ddl" : "label-dml"}">${d.sql_type}</span>` : ""}
          ${d.target_database ? `<span class="audit-chip">target: ${this.escapeHtml(d.target_database)}</span>` : ""}
          ${exec ? `<span class="audit-chip audit-chip-muted">${this.escapeHtml(exec.reason || exec.status || "")}</span>` : ""}
        </div>
      `;
    }

    if (log.action === "SUBMISSION_REJECTED" && d.reason) {
      return `<div class="audit-reason">${this.escapeHtml(d.reason)}</div>`;
    }

    // Generic fallback for any other action shape.
    return `
      <div class="audit-kv">
        ${Object.entries(d).map(([k, v]) => `<span><strong>${this.escapeHtml(k)}:</strong> ${this.escapeHtml(typeof v === "object" ? JSON.stringify(v) : String(v))}</span>`).join("")}
      </div>
    `;
  },

  escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : str;
    return div.innerHTML;
  },
};