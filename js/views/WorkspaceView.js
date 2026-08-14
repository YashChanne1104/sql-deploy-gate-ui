// ===========================
// WorkspaceView -- pure rendering for the dashboard "Your workspace" hero.
// Never calls the API directly (stats are handed in already-computed).
// Matches session shape from PageShell: { email, role }.
// ===========================
const ROLE_ACTIONS = {
    Developer: [
        { href: "submissions.html", icon: "↑", title: "Push a change", sub: "Submit SQL for AI review" },
        { href: "submissions.html", icon: "≡", title: "My submissions", sub: "Track status & verdicts" },
        { href: "activity.html", icon: "•", title: "Audit", sub: "See recent activity" },
    ],
    Approver: [
        { href: "approvals.html", icon: "✓", title: "Review queue", sub: "Approve or reject pushes" },
        { href: "submissions.html", icon: "≡", title: "All submissions", sub: "Browse everyone's pushes" },
        { href: "activity.html", icon: "•", title: "Audit", sub: "See recent activity" },
    ],
    Admin: [
        { href: "approvals.html", icon: "✓", title: "Review queue", sub: "Approve or reject pushes" },
        { href: "users.html", icon: "◆", title: "Users", sub: "Assign roles & access" },
        { href: "activity.html", icon: "•", title: "Audit", sub: "See recent activity" },
    ],
};

const WorkspaceView = {
    escapeHtml(str) {
        const div = document.createElement("div");
        div.textContent = str == null ? "" : str;
        return div.innerHTML;
    },

    // counts: { Pending, Approved, Rejected } or null while loading.
    render(session, counts) {
        const role = session.role || "Developer";
        const actions = ROLE_ACTIONS[role] || ROLE_ACTIONS.Developer;

        return `
      <div class="workspace-hero">
        <span class="workspace-eyebrow">Your workspace</span>
        <h1>Welcome back</h1>
        <div class="workspace-identity">
          <span class="email">${this.escapeHtml(session.email)}</span>
          <span class="role-tag role-${role.toLowerCase()}">${this.escapeHtml(role)}</span>
        </div>

        <div class="workspace-stats" id="workspaceStats">
          ${this.renderStatPill("pending", counts ? counts.Pending : null, "Pending")}
          ${this.renderStatPill("approved", counts ? counts.Approved : null, "Approved")}
          ${this.renderStatPill("rejected", counts ? counts.Rejected : null, "Rejected")}
        </div>

        <div class="workspace-actions">
          ${actions.map((a) => this.renderAction(a)).join("")}
        </div>
      </div>
    `;
    },

    renderStatPill(cls, value, label) {
        const loading = value === null || value === undefined;
        return `
      <div class="stat-pill ${cls}${loading ? " loading" : ""}">
        <span class="stat-value">${loading ? "—" : value}</span>
        <span class="stat-label">${label}</span>
      </div>
    `;
    },

    renderAction(a) {
        return `
      <a class="action-card" href="${a.href}">
        <span class="action-icon">${a.icon}</span>
        <span class="action-text">
          <div class="title">${this.escapeHtml(a.title)}</div>
          <div class="sub">${this.escapeHtml(a.sub)}</div>
        </span>
      </a>
    `;
    },
};