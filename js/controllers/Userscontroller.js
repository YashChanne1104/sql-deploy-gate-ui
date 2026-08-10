// ===========================
// UsersController -- wires users.html together. Admin only.
// Loads every user, lets an Admin reassign roles or delete accounts.
// Backend enforces "can't demote the last Admin" and "can't delete
// yourself" -- this controller just surfaces those errors inline rather
// than trying to duplicate the logic client-side.
// ===========================
document.addEventListener("DOMContentLoaded", () => {
    const session = initPageShell("users.html", ["Admin"]);
    if (!session) return;

    const statsEl = document.getElementById("usersStats");
    const listEl = document.getElementById("usersList");
    const messageEl = document.getElementById("usersMessage");
    const searchEl = document.getElementById("usersSearch");

    let allUsers = [];

    async function load() {
        listEl.innerHTML = `<div class="empty-state">Loading...</div>`;
        try {
            allUsers = await UserModel.list();
            render();
        } catch (err) {
            listEl.innerHTML = `<div class="error-box">${err.message}</div>`;
        }
    }

    function render() {
        statsEl.innerHTML = UsersView.renderStats(allUsers);

        const q = searchEl.value.trim().toLowerCase();
        const filtered = q ? allUsers.filter((u) => u.email.toLowerCase().includes(q)) : allUsers;

        listEl.innerHTML = UsersView.renderTable(filtered, session.email);
        wireRowEvents();
    }

    function showMessage(text, isError) {
        messageEl.innerHTML = `<div class="${isError ? "error-box" : "success-box"}">${text}</div>`;
        setTimeout(() => { messageEl.innerHTML = ""; }, 4000);
    }

    function wireRowEvents() {
        listEl.querySelectorAll(".role-select").forEach((select) => {
            const originalRole = select.value;
            select.addEventListener("change", () => {
                const saveBtn = listEl.querySelector(`.save-role-btn[data-user-id="${select.dataset.userId}"]`);
                saveBtn.hidden = select.value === originalRole;
            });
        });

        listEl.querySelectorAll(".save-role-btn").forEach((btn) => {
            btn.addEventListener("click", async () => {
                const userId = Number(btn.dataset.userId);
                const select = listEl.querySelector(`.role-select[data-user-id="${userId}"]`);
                const newRole = select.value;

                btn.disabled = true;
                btn.textContent = "Saving...";
                try {
                    await UserModel.updateRole(userId, newRole);
                    showMessage(`Role updated.`, false);
                    load();
                } catch (err) {
                    showMessage(err.message, true);
                    btn.disabled = false;
                    btn.textContent = "Save";
                }
            });
        });

        listEl.querySelectorAll(".delete-user-btn").forEach((btn) => {
            if (btn.disabled) return;
            btn.addEventListener("click", () => {
                const userId = Number(btn.dataset.userId);
                const row = btn.closest("tr");
                const email = row.dataset.email;

                ModalView.confirm({
                    title: `Delete ${email}?`,
                    message: "This permanently removes the account. This can't be undone.",
                    confirmLabel: "Delete",
                    danger: true,
                    onConfirm: async () => {
                        try {
                            await UserModel.remove(userId);
                            showMessage(`${email} deleted.`, false);
                            load();
                        } catch (err) {
                            showMessage(err.message, true);
                        }
                    },
                });
            });
        });
    }

    searchEl.addEventListener("input", render);

    load();
});