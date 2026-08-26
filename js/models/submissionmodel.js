// ===========================
// SubmissionModel -- wraps /submissions exactly as the backend defines it.
// Every method returns plain data, never HTML.
//
// Matches the router:
//   POST   /submissions                 { sql_text }              -> SubmissionOut
//   GET    /submissions?status=...      (Developer sees own only,
//                                         Approver/Admin see all)  -> SubmissionOut[]
//   GET    /submissions/{id}                                      -> SubmissionOut
//   POST   /submissions/{id}/approve    { confirmed: true }        -> SubmissionOut
//   POST   /submissions/{id}/reject     { reason }                 -> SubmissionOut
//   POST   /submissions/bulk-approve    { submission_ids, confirmed: true } -> BulkActionResult
//   POST   /submissions/bulk-reject     { submission_ids, reason }           -> BulkActionResult
// ===========================
const SubmissionModel = {
    async create(sqlText) {
        return apiFetch("/submissions", {
            method: "POST",
            body: JSON.stringify({ sql_text: sqlText }),
        });
    },

    // status: "Pending" | "Approved" | "Rejected" (backend enum) or omit for all.
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
