// ===========================
// NavView -- renders the topbar nav based on role hierarchy:
//   Developer -> Submissions, Audit
//   Approver  -> Submissions, Audit, Approvals
//   Admin     -> Submissions, Audit, Approvals, Users
// Each role sees everything the role "below" it sees, plus one more page.
// Pure rendering -- never touches localStorage or the API directly.
// ===========================
const NAV_ITEMS = [
    { href: "submissions.html", label: "Submissions", roles: ["Developer", "Approver", "Admin"] },
    { href: "activity.html", label: "Audit", roles: ["Developer", "Approver", "Admin"] },
    { href: "approvals.html", label: "Approvals", roles: ["Approver", "Admin"] },
    { href: "users.html", label: "Users", roles: ["Admin"] },
];

const NavView = {
    init(activeHref) {
        const navEl = document.getElementById("navLinks");
        if (!navEl) return;

        const role = AuthModel.getRole();
        const items = NAV_ITEMS.filter((item) => item.roles.includes(role));

        navEl.innerHTML = items
            .map((item) => `<a href="${item.href}" class="${item.href === activeHref ? "active" : ""}">${item.label}</a>`)
            .join("");
    },
};
