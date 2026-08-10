// ===========================
// AuditModel -- wraps GET /audit/summary exactly as the backend defines it.
//
//   GET /audit/summary?status=&sql_type=&offset=&limit=
//     -> AuditSummaryOut[]: id, user, type, query_summary, ai_verdict,
//        status, approved_by, approved_at, reject_reason, raised_at,
//        target_database
//
// Backend auto-scopes: Developer sees own submissions only, Approver/Admin
// see everyone's. No count/total is returned, so pagination is inferred
// from whether a full page came back (see ActivityController).
// ===========================
const AuditModel = {
    async list({ offset = 0, limit = 20, status = null, sqlType = null } = {}) {
        const params = new URLSearchParams();
        params.set("offset", offset);
        params.set("limit", limit);
        if (status) params.set("status", status);
        if (sqlType) params.set("sql_type", sqlType);

        return apiFetch(`/audit/summary?${params.toString()}`);
    },
};