// ===========================
// SubmissionModel -- all submission-related API calls in one place.
// Every method returns plain data (objects/arrays), never HTML.
// ===========================
const SubmissionModel = {
    async create(sqlText) {
        return apiFetch("/submissions", {
            method: "POST",
            body: JSON.stringify({ sql_text: sqlText }),
        });
    },

    async list(status = null) {
        const query = status ? `?status=${encodeURIComponent(status)}` : "";
        return apiFetch(`/submissions${query}`);
    },

    async get(id) {
        return apiFetch(`/submissions/${id}`);
    },

    async approve(id) {
        return apiFetch(`/submissions/${id}/approve`, {
            method: "POST",
            body: JSON.stringify({ confirmed: true }),
        });
    },

    async reject(id, reason) {
        return apiFetch(`/submissions/${id}/reject`, {
            method: "POST",
            body: JSON.stringify({ reason }),
        });
    },

    async bulkApprove(ids) {
        return apiFetch("/submissions/bulk-approve", {
            method: "POST",
            body: JSON.stringify({ submission_ids: ids, confirmed: true }),
        });
    },

    async bulkReject(ids, reason) {
        return apiFetch("/submissions/bulk-reject", {
            method: "POST",
            body: JSON.stringify({ submission_ids: ids, reason }),
        });
    },
};