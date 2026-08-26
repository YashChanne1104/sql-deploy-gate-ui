// ===========================
// ModalView -- a small reusable modal for confirmations and reason prompts.
// Replaces native confirm()/prompt() so it matches the app's theme.
// Pure UI utility: takes callbacks, doesn't know about submissions/API.
// ===========================
const ModalView = {
    close() {
        const existing = document.getElementById("modalOverlay");
        if (existing) existing.remove();
    },

    // Simple yes/no confirmation.
    confirm({ title, message, confirmLabel = "Confirm", danger = false, onConfirm }) {
        this.close();
        const overlay = document.createElement("div");
        overlay.id = "modalOverlay";
        overlay.className = "modal-overlay";
        overlay.innerHTML = `
      <div class="modal-card">
        <h3>${title}</h3>
        <p>${message}</p>
        <div class="modal-actions">
          <button class="btn btn-secondary btn-sm" id="modalCancel">Cancel</button>
          <button class="btn ${danger ? "btn-reject" : "btn-approve"} btn-sm" id="modalConfirm">${confirmLabel}</button>
        </div>
      </div>
    `;
        document.body.appendChild(overlay);

        overlay.addEventListener("click", (e) => { if (e.target === overlay) this.close(); });
        document.getElementById("modalCancel").addEventListener("click", () => this.close());
        document.getElementById("modalConfirm").addEventListener("click", () => {
            this.close();
            onConfirm();
        });
    },

    // Confirmation that also collects a required text reason (used for rejects).
    prompt({ title, message, placeholder = "", confirmLabel = "Submit", onSubmit }) {
        this.close();
        const overlay = document.createElement("div");
        overlay.id = "modalOverlay";
        overlay.className = "modal-overlay";
        overlay.innerHTML = `
      <div class="modal-card">
        <h3>${title}</h3>
        <p>${message}</p>
        <textarea id="modalReason" placeholder="${placeholder}"></textarea>
        <div class="modal-actions">
          <button class="btn btn-secondary btn-sm" id="modalCancel">Cancel</button>
          <button class="btn btn-reject btn-sm" id="modalConfirm">${confirmLabel}</button>
        </div>
      </div>
    `;
        document.body.appendChild(overlay);
        const textarea = document.getElementById("modalReason");
        textarea.focus();

        overlay.addEventListener("click", (e) => { if (e.target === overlay) this.close(); });
        document.getElementById("modalCancel").addEventListener("click", () => this.close());
        document.getElementById("modalConfirm").addEventListener("click", () => {
            const reason = textarea.value.trim();
            if (!reason) {
                textarea.style.borderColor = "var(--remove)";
                return;
            }
            this.close();
            onSubmit(reason);
        });
    },
};