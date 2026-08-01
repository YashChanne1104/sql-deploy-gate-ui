// ===========================
// AuditModel -- audit log API calls.
// GET /audit -- paginated (5 per page by default on the backend), optional
// filters by action / target_type / target_id. Approver/Admin see the full
// trail; other roles are auto-filtered server-side to their own actions.
// ===========================
const AuditModel = {
    async list({ offset = 0, limit = 5, action = null, targetType = null, targetId = null } = {}) {
        const params = new URLSearchParams();
        params.set("offset", offset);
        params.set("limit", limit);
        if (action) params.set("action", action);
        if (targetType) params.set("target_type", targetType);
        if (targetId) params.set("target_id", targetId);

        return apiFetch(`/audit?${params.toString()}`);
    },
};