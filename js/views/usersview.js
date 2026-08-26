// ===========================
// UsersView -- pure rendering for the admin role-assignment table.
// Never calls the API, never touches localStorage.
// Matches UserOut: id, email, role.
// ===========================
const ROLES = ["Developer", "Approver", "Admin"];

const UsersView = {
    escapeHtml(str) {
        const div = document.createElement("div");
        div.textContent = str == null ? "" : str;
        return div.innerHTML;
    },

    renderStats(users) {
        const counts = ROLES.reduce((acc, r) => {
            acc[r] = users.filter((u) => u.role === r).length;
            return acc;
        }, {});

        return `
      <div class="users-stats">
        <span class="role-tag">${users.length} total</span>
        ${ROLES.map((r) => `<span class="role-tag role-${r.toLowerCase()}">${counts[r]} ${r}${counts[r] === 1 ? "" : "s"}</span>`).join("")}
      </div>
    `;
    },

    renderTable(users, currentUserEmail) {
        if (!users || !users.length) {
            return `<div class="empty-state">No users match your search.</div>`;
        }

        return `
      <table class="users-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${users.map((u) => this.renderRow(u, currentUserEmail)).join("")}
        </tbody>
      </table>
    `;
    },

    initials(email) {
        return (email || "?").slice(0, 2).toUpperCase();
    },

    renderRow(user, currentUserEmail) {
        const isSelf = user.email === currentUserEmail;

        return `
      <tr data-user-id="${user.id}" data-email="${this.escapeHtml(user.email)}">
        <td>
          <div class="user-row-identity">
            <span class="avatar">${this.initials(user.email)}</span>
            <div>
              <div class="email">${this.escapeHtml(user.email)}${isSelf ? ` <span class="sub">(you)</span>` : ""}</div>
              <div class="sub">#${user.id}</div>
            </div>
          </div>
        </td>
        <td>
          <div class="role-cell">
            <span class="role-tag role-${user.role.toLowerCase()}" data-role-badge="${user.id}">${user.role}</span>
            <select class="select-input role-select" data-user-id="${user.id}">
              ${ROLES.map((r) => `<option value="${r}" ${r === user.role ? "selected" : ""}>${r}</option>`).join("")}
            </select>
            <button class="btn btn-secondary btn-sm save-role-btn" data-user-id="${user.id}" hidden>Save</button>
          </div>
        </td>
        <td style="text-align:right;">
          <button class="btn btn-reject btn-sm delete-user-btn" data-user-id="${user.id}" ${isSelf ? `disabled title="You can't delete your own account"` : ""
            }>Delete</button>
        </td>
      </tr>
    `;
    },
};