// ===========================
// SubmitController -- wires submit.html together.
// Posts SQL text, shows the AI verdict as soon as the backend returns it.
// ===========================
document.addEventListener("DOMContentLoaded", () => {
    if (!AuthModel.guard(["Developer", "Admin"])) return;

    NavView.init("submit.html");
    document.getElementById("userEmail").textContent = AuthModel.getEmail();
    document.getElementById("logoutBtn").addEventListener("click", () => AuthModel.logout());

    const form = document.getElementById("submitForm");
    const textarea = document.getElementById("sqlText");
    const resultEl = document.getElementById("submitResult");
    const btn = document.getElementById("submitBtn");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const sqlText = textarea.value.trim();
        if (!sqlText) return;

        resultEl.innerHTML = "";
        btn.disabled = true;
        btn.textContent = "Running AI review...";

        try {
            const submission = await SubmissionModel.create(sqlText);
            resultEl.innerHTML = renderResult(submission);
            textarea.value = "";
        } catch (err) {
            resultEl.innerHTML = `<div class="error-box">${err.message}</div>`;
        } finally {
            btn.disabled = false;
            btn.textContent = "Submit for review";
        }
    });

    function renderResult(s) {
        const passed = s.ai_verdict === "approved";
        return `
      <div class="result-card">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
          <span class="pr-number">#${s.id} — ${s.object_type ? `[${s.object_type}] ` : ""}${s.sql_type}</span>
          <span class="status-pill status-${s.status.toLowerCase()}">${s.status}</span>
        </div>
        <div class="check-item ${passed ? "pass" : "fail"}">
          <span class="icon">${passed ? "✓" : "✕"}</span>
          <span>AI verdict: ${s.ai_verdict}</span>
        </div>
        ${s.ai_summary ? `<div class="check-item pass"><span class="icon">•</span><span>${s.ai_summary}</span></div>` : ""}
        <div style="margin-top:16px;">
          <a href="review.html?id=${s.id}" class="btn btn-secondary btn-sm">View submission →</a>
        </div>
      </div>
    `;
    }
});