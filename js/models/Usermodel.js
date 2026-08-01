// ===========================
// UserModel -- admin-only user management API calls.
// Matches /admin/users routes: list, get, update role, delete.
// Admin-only server-side (auth.require_role("Admin")); this model assumes
// the caller has already been guarded (see AuthModel.guard(["Admin"])).
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