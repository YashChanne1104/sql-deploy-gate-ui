// ===========================
// UserModel -- admin-only user management, wraps /admin/users exactly.
//
//   GET    /admin/users            -> UserOut[]
//   GET    /admin/users/{id}       -> UserOut
//   PUT    /admin/users/{id}/role  { role } -> UserOut
//   DELETE /admin/users/{id}       -> { detail }
//
// Admin-only server-side (auth.require_role("Admin")); assumes the caller
// has already been guarded (see users.html -> initPageShell([..., "Admin"])).
// Backend also protects: can't demote the last remaining Admin, can't
// delete your own account -- both surface as thrown errors from apiFetch.
// ===========================
const UserModel = {
    async list() {
        return apiFetch("/admin/users");
    },

    async get(id) {
        return apiFetch(`/admin/users/${id}`);
    },

    async updateRole(id, role) {
        return apiFetch(`/admin/users/${id}/role`, {
            method: "PUT",
            body: JSON.stringify({ role }),
        });
    },

    async remove(id) {
        return apiFetch(`/admin/users/${id}`, {
            method: "DELETE",
        });
    },
};