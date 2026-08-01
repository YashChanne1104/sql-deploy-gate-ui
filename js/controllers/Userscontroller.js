// ===========================
// UsersController -- the "glue" for users.html. Admin-only.
// Fetches data via UserModel, renders via UsersView, wires up
// search, role-save, and delete actions. This is the ONLY file that
// touches document.* on this page.
// ===========================
document.addEventListener("DOMContentLoaded", async () => {
    if (!AuthModel.guard(["Admin"])) return;

    NavView.init("users.html");
    document.getElementById("userEmail").textContent = AuthModel.getEmail();
    document.getElementById("logoutBtn").addEventListener("click", () => AuthModel.logout());

    const statsEl = document.getElementById("usersStats");
    const listEl = document.getElementById("usersList");
    const messageEl = document.getElementById("usersMessage");
    const searchEl = document.getElementById("usersSearch");
    const currentUserEmail = AuthModel.getEmail();

    let allUsers = [];

    async function loadUsers() {
        listEl.innerHTML = `<div class="empty-state">Loading...</div>`;
        try {
            allUsers = await UserModel.list();
            statsEl.innerHTML = UsersView.renderStats(allUsers);
            renderFiltered();
        } catch (err) {
            listEl.innerHTML = `<div class="error-box">${err.message}</div>`;
        }
    }

    function renderFiltered() {
        const q = searchEl.value.trim().toLowerCase();
        const filtered = q ? allUsers.filter(u => u.email.toLowerCase().includes(q)) : allUsers;
        listEl.innerHTML = UsersView.renderTable(filtered, currentUserEmail);
        wireRowActions();
    }

    searchEl.addEventListener("input", renderFiltered);

    function wireRowActions() {
        listEl.querySelectorAll(".role-select").forEach(select => {
            const originalRole = select.value;
            select.addEventListener("change", () => {
                const saveBtn = listEl.querySelector(`.save-role-btn[data-user-id="${select.dataset.userId}"]`);
                saveBtn.hidden = select.value === originalRole;
            });
        });

        listEl.querySelectorAll(".save-role-btn").forEach(btn => {
            btn.addEventListener("click", () => handleSaveRole(btn.dataset.userId));
        });

        listEl.querySelectorAll(".delete-user-btn").forEach(btn => {
            if (btn.disabled) return;
            btn.addEventListener("click", () => confirmDelete(btn.dataset.userId));
        });
    }

    async function handleSaveRole(userId) {
        const select = listEl.querySelector(`.role-select[data-user-id="${userId}"]`);
        const role = select.value;

        messageEl.innerHTML = "";
        try {
            await UserModel.updateRole(userId, role);
            messageEl.innerHTML = `<div class="success-box">Role updated.</div>`;
            loadUsers();
        } catch (err) {
            messageEl.innerHTML = `<div class="error-box">${err.message}</div>`;
        }
    }

    // Styled confirmation dialog, replacing the native confirm() popup.
    function confirmDelete(userId) {
        const row = listEl.querySelector(`tr[data-user-id="${userId}"]`);
        const email = row ? row.dataset.email : `user #${userId}`;

        const overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.innerHTML = `
      <div class="modal-box">
        <h3>Delete ${email}?</h3>
        <p>This permanently removes the account. This cannot be undone.</p>
        <div class="modal-actions">
          <button class="btn btn-secondary btn-sm" id="modalCancel">Cancel</button>
          <button class="btn btn-reject btn-sm" id="modalConfirm" style="background:var(--danger-emphasis); color:#fff; border-color:transparent;">Delete user</button>
        </div>
      </div>
    `;
        document.body.appendChild(overlay);

        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) overlay.remove();
        });
        overlay.querySelector("#modalCancel").addEventListener("click", () => overlay.remove());
        overlay.querySelector("#modalConfirm").addEventListener("click", async () => {
            overlay.remove();
            messageEl.innerHTML = "";
            try {
                await UserModel.remove(userId);
                messageEl.innerHTML = `<div class="success-box">User deleted.</div>`;
                loadUsers();
            } catch (err) {
                messageEl.innerHTML = `<div class="error-box">${err.message}</div>`;
            }
        });
    }

    loadUsers();
});