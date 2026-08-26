// ===========================
// SubmissionsView -- pure rendering. Takes submission data, returns HTML.
// Never calls the API. Field names assumed from SubmissionOut:
//   id, sql_text, sql_type, object_type, status, ai_verdict, ai_summary,
//   submitted_by_id, submitted_by_email, created_at, target_database,
//   reject_reason, optional_suggestions, suggested_sql.
// Adjust here if your schema differs.
// ===========================
const SubmissionsView = {
  escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : str;
    return div.innerHTML;
  },

  // Shared block: optional_suggestions (string[]) + suggested_sql (string|null).
  // Returns "" if neither is present, so callers can splice it in unconditionally.
  renderSuggestions(s) {
    const hasSuggestions = Array.isArray(s.optional_suggestions) && s.optional_suggestions.length > 0;
    const hasSuggestedSql = !!s.suggested_sql;

    if (!hasSuggestions && !hasSuggestedSql) return "";

    const suggestionItems = hasSuggestions
      ? s.optional_suggestions
        .map(
          (tip) => `
            <div class="check-item" style="align-items:flex-start;">
              <span class="icon">→</span>
              <span>${this.escapeHtml(tip)}</span>
            </div>`
        )
        .join("")
      : "";

    const suggestedSqlBlock = hasSuggestedSql
      ? `
          <div style="margin-top:10px;">
            <div class="sub-meta" style="margin-bottom:4px;">Suggested SQL</div>
            <div class="code-block">${this.escapeHtml(s.suggested_sql)}</div>
          </div>`
      : "";

    return `
      <div class="suggestions-block" style="margin-top:6px;">
        ${suggestionItems}
        ${suggestedSqlBlock}
      </div>
    `;
  },

  // Card shown right after a push, with the AI verdict.
  renderResult(s) {
    const passed = s.ai_verdict === "approved";
    return `
      <div class="repo-card" style="margin-top:24px;">
        <div class="repo-card-head">
          <h1 style="font-size:15px;">
            <span class="sub-number">#${s.id}</span>
            ${s.object_type ? `[${this.escapeHtml(s.object_type)}] ` : ""}${s.sql_type} pushed
          </h1>
          <span class="status-pill ${(s.status || "pending").toLowerCase()}">${s.status}</span>
        </div>
        <div class="check-item ${passed ? "pass" : "fail"}">
          <span class="icon">${passed ? "✓" : "!"}</span>
          <span>AI verdict: ${this.escapeHtml(s.ai_verdict)}</span>
        </div>
        ${s.ai_summary ? `<div class="check-item pass"><span class="icon">•</span><span>${this.escapeHtml(s.ai_summary)}</span></div>` : ""}
        ${this.renderSuggestions(s)}
      </div>
    `;
  },

  renderList(submissions) {
    if (!submissions || !submissions.length) {
      return `<div class="empty-state">Nothing pushed yet.</div>`;
    }
    return `<div class="sub-list">${submissions.map((s) => this.renderRow(s)).join("")}</div>`;
  },

  renderRow(s) {
    const statusCls = (s.status || "pending").toLowerCase();
    const labelCls = s.sql_type === "DDL" ? "label-ddl" : "label-dml";
    const date = s.created_at
      ? new Date(s.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
      : "—";
    const who = s.submitted_by_email || (s.submitted_by_id ? `User #${s.submitted_by_id}` : "");

    return `
      <div class="sub-row" data-id="${s.id}">
        <div class="sub-row-head" data-toggle="${s.id}">
          <span class="sub-status-dot ${statusCls}"></span>
          <div class="sub-main">
            <div class="sub-title">
              <span class="sub-number">#${s.id}</span>
              ${s.object_type ? `[${this.escapeHtml(s.object_type)}] ` : ""}${s.sql_type} submission
            </div>
            <div class="sub-meta">
              ${who ? `${this.escapeHtml(who)} · ` : ""}pushed ${date}
              <span class="label ${labelCls}">${s.sql_type}</span>
            </div>
          </div>
          <span class="status-pill ${statusCls}">${s.status}</span>
          <span class="sub-chevron">▸</span>
        </div>
        <div class="sub-detail">
          ${s.ai_verdict ? `<div class="check-item ${s.ai_verdict === "approved" ? "pass" : "fail"}"><span class="icon">${s.ai_verdict === "approved" ? "✓" : "!"}</span><span>AI verdict: ${this.escapeHtml(s.ai_verdict)}</span></div>` : ""}
          ${s.ai_summary ? `<div class="check-item pass"><span class="icon">•</span><span>${this.escapeHtml(s.ai_summary)}</span></div>` : ""}
          ${s.status === "Rejected" && s.reject_reason ? `<div class="check-item fail"><span class="icon">•</span><span>Rejected: ${this.escapeHtml(s.reject_reason)}</span></div>` : ""}
          ${s.target_database ? `<div class="check-item pass"><span class="icon">•</span><span>Target: ${this.escapeHtml(s.target_database)}</span></div>` : ""}
          ${this.renderSuggestions(s)}
          <div class="sub-meta" style="margin:8px 0 4px;">Submitted SQL</div>
          <div class="code-block">${this.escapeHtml(s.sql_text || "")}</div>
        </div>
      </div>
    `;
  },
};