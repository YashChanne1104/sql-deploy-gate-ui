// ===========================
// NavView -- pure rendering for the topbar nav. Same nav logic is shared
// across every authenticated page instead of being hardcoded per-page.
//
// Developer -> "Submit" and "Activity" (their own actions only, per backend)
// Approver  -> "Queue" and "Activity" (full trail, per backend)
// Admin     -> "Submit", "Queue", "Activity" (full trail), and "Users"
//
// "Home" is always present so there's a way back to the landing page.
// ===========================
const NavView = {
    init(activePage) {
        const navEl = document.getElementById("navLinks");
        if (!navEl) return;

        const role = AuthModel.getRole();
        const links = [{ href: "home.html", label: "Home" }];

        if (role === "Developer") {
            links.push({ href: "submit.html", label: "Submit" });
            links.push({ href: "activity.html", label: "Activity" });
        } else if (role === "Approver") {
            links.push({ href: "queue.html", label: "Queue" });
            links.push({ href: "activity.html", label: "Activity" });
        } else if (role === "Admin") {
            links.push({ href: "submit.html", label: "Submit" });
            links.push({ href: "queue.html", label: "Queue" });
            links.push({ href: "activity.html", label: "Activity" });
            links.push({ href: "users.html", label: "Users" });
        }

        navEl.innerHTML = links
            .map(l => `<a href="${l.href}" class="${l.href === activePage ? "active" : ""}">${l.label}</a>`)
            .join("");
    },
};