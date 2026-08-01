// ===========================
// ReviewView -- pure rendering for review.html. Takes a submission object,
// returns HTML strings. Never calls the API, never touches localStorage.
// ===========================
const ReviewView = {
    renderHeader(s) {
        const statusClass = `status-${s.status.toLowerCase()}`;
        const date = new Date(s.created_at).toLocaleString("en-GB", {
            day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
        });

        const submitter = s.submitted_by_email || (s.submitted_by_id ? `User #${s.submitted_by_id}` : "unknown");

        return `
      <div class="review-header">
        <h1>
          <span class="pr-number">#${s.id}</span>
          ${s.object_type ? `[${s.object_type}] ` : ""}${s.sql_type} submission
          <span class="status-pill ${statusClass}">${s.status}</span>
        </h1>
        <div class="review-meta">submitted by ${submitter} on ${date}${s.target_database ? ` · target: ${s.target_database}` : ""}</div>
      </div>
    `;
    },

    renderChecks(s) {
        const passed = s.ai_verdict === "approved";

        return `
      <div class="checks-panel">
        <h3>AI review</h3>
        <div class="check-item ${passed ? "pass" : "fail"}">
          <span class="icon">${passed ? "✓" : "✕"}</span>
          <span>Verdict: ${s.ai_verdict}</span>
        </div>
        <div class="check-item pass">
          <span class="icon">•</span>
          <span>Type: ${s.sql_type}${s.object_type ? ` / ${s.object_type}` : ""}</span>
        </div>
        ${s.ai_summary ? `<div class="check-item pass"><span class="icon">•</span><span>${this.escapeHtml(s.ai_summary)}</span></div>` : ""}
        ${s.status === "Rejected" && s.reject_reason ? `<div class="check-item fail"><span class="icon">•</span><span>Rejected: ${this.escapeHtml(s.reject_reason)}</span></div>` : ""}
      </div>
    `;
    },

    renderDiff(s) {
        const lineCount = (s.sql_text || "").split("\n").length;
        return `
      <div class="diff-panel">
        <div class="diff-header">
          <span>SQL</span>
          <span>${lineCount} line${lineCount === 1 ? "" : "s"}</span>
        </div>
        <div class="diff-body">${this.escapeHtml(s.sql_text || "")}</div>
      </div>
    `;
    },

    renderActions(s) {
        if (s.status !== "Pending") {
            const cls = s.status === "Approved" ? "approved" : "rejected";
            const label = s.status === "Approved" ? "✓ Approved" : "✕ Rejected";
            return `
        <div class="review-actions">
          <span class="merge-badge ${cls}">${label}</span>
          <div class="spacer"></div>
        </div>
      `;
        }

        return `
      <div class="review-actions">
        <button class="btn btn-reject btn-sm" id="rejectBtn">Reject</button>
        <div class="spacer"></div>
        <button class="btn btn-approve btn-sm" id="approveBtn">Approve</button>
      </div>
    `;
    },

    escapeHtml(str) {
        const div = document.createElement("div");
        div.textContent = str;
        return div.innerHTML;
    },
};