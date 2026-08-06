// ===========================
// Core HTTP client. Every Model calls this -- it's the ONLY place that
// knows how to reach the backend. Change API_BASE here if the backend
// ever moves to a different host/port.
// ===========================
const API_BASE = "http://127.0.0.1:8000";

async function apiFetch(path, options = {}) {
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    const token = localStorage.getItem("access_token");
    if (token) {
        headers["Authorization"] = "Bearer " + token;
    }

    const response = await fetch(API_BASE + path, { ...options, headers });

    let data = null;
    try {
        data = await response.json();
    } catch (e) {
        // some endpoints return no body -- fine
    }

    if (!response.ok) {
        const message = (data && data.detail) ? data.detail : `Request failed (${response.status})`;
        throw new Error(typeof message === "string" ? message : JSON.stringify(message));
    }

    return data;
}
