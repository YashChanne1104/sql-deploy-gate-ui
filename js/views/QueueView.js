// ===========================
// QueueView -- pure rendering. Takes submission data, returns HTML strings.
// Never calls the API, never touches localStorage.
// ===========================
const QueueView = {
  renderRow(submission) {
    const initials = submission.submitted_by_email
      ? submission.submitted_by_email.slice(0, 2).toUpperCase()
      : submission.submitted_by_id
        ? "U" + submission.submitted_by_id
        : "??";

    const labelClass = submission.sql_type === "DDL" ? "label-ddl" : "label-dml";
    const date = new Date(submission.created_at).toLocaleDateString("en-GB", {
      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
    });

    return `
      <div class="pr-row" data-id="${submission.id}">
        <input type="checkbox" class="pr-select" data-id="${submission.id}" aria-label="Select submission #${submission.id}">
        <svg class="pr-status-icon ${submission.ai_verdict}" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8"/></svg>
        <a class="pr-main" href="review.html?id=${submission.id}">
          <div class="pr-title">
            <span class="pr-number">#${submission.id}</span>
            ${submission.object_type ? `[${submission.object_type}] ` : ""}${submission.sql_type} submission
          </div>
          <div class="pr-meta">
            <span class="avatar">${initials}</span>
            submitted ${date}
            <span class="label ${labelClass}">${submission.sql_type}</span>
            <span class="verdict-${submission.ai_verdict}">${submission.ai_verdict}</span>
          </div>
        </a>
        <div class="pr-quick-actions">
          <button class="btn btn-reject btn-sm quick-reject-btn" data-id="${submission.id}">Reject</button>
          <button class="btn btn-approve btn-sm quick-approve-btn" data-id="${submission.id}">Approve</button>
        </div>
      </div>
    `;
  },

  renderList(submissions) {
    if (!submissions.length) {
      return `<div class="empty-state">Nothing pending right now.</div>`;
    }
    return `
      <div class="select-all-row">
        <label><input type="checkbox" id="selectAllCheckbox"> Select all</label>
      </div>
      <div class="pr-list">${submissions.map(s => this.renderRow(s)).join("")}</div>
    `;
  },

  // Sticky bar shown above the list once one or more rows are checked.
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