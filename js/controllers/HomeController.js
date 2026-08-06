// ===========================
// HomeController -- drives the terminal signature element on home.html.
// Types out a real push -> AI review -> merge sequence, matching the
// product's actual mental model. Falls back to a static final frame if
// the user prefers reduced motion.
// ===========================
document.addEventListener("DOMContentLoaded", () => {
    const body = document.getElementById("termBody");
    if (!body) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Each block: a typed command line, followed by static output lines
    // that fade in once the command finishes typing.
    const blocks = [
        {
            prompt: "$", cmd: "git push origin fix/inventory-index",
            out: [{ text: "1 change pushed → sql-deploy-gate", cls: "dim" }],
        },
        {
            prompt: "→", cmd: "ai review inventory.sp_RebuildIndex",
            out: [
                { text: "+ safe: ALTER INDEX ... WITH (ONLINE = ON)", cls: "add" },
                { text: "+ no table lock, no blocking reads", cls: "add" },
                { text: "verdict: approved", cls: "dim" },
            ],
        },
        {
            prompt: "$", cmd: "awaiting approver merge...",
            out: [{ text: "✓ merged by @priya — DDL deployed to UAT", cls: "merge" }],
        },
    ];

    if (reduceMotion) {
        body.innerHTML = blocks.map(renderStaticBlock).join("");
        return;
    }

    runSequence();

    async function runSequence() {
        body.innerHTML = "";
        for (const block of blocks) {
            await typeLine(block.prompt, block.cmd);
            await sleep(220);
            for (const line of block.out) {
                appendOutput(line.text, line.cls);
                await sleep(260);
            }
            await sleep(500);
        }
        await sleep(1600);
        runSequence(); // loop
    }

    function typeLine(prompt, cmd) {
        return new Promise((resolve) => {
            const lineEl = document.createElement("div");
            lineEl.className = "term-line";
            const promptSpan = `<span class="term-prompt">${prompt}</span> `;
            lineEl.innerHTML = promptSpan + `<span class="term-cmd"></span><span class="term-cursor"></span>`;
            body.appendChild(lineEl);
            const cmdSpan = lineEl.querySelector(".term-cmd");

            let i = 0;
            const interval = setInterval(() => {
                cmdSpan.textContent += cmd[i];
                i++;
                if (i >= cmd.length) {
                    clearInterval(interval);
                    lineEl.querySelector(".term-cursor").remove();
                    resolve();
                }
            }, 28);
        });
    }

    function appendOutput(text, cls) {
        const el = document.createElement("div");
        el.className = `term-line term-out ${cls}`;
        el.style.opacity = "0";
        el.textContent = text;
        body.appendChild(el);
        requestAnimationFrame(() => {
            el.style.transition = "opacity 0.25s";
            el.style.opacity = "1";
        });
    }

    function sleep(ms) {
        return new Promise((r) => setTimeout(r, ms));
    }

    function renderStaticBlock(block) {
        return `
      <div class="term-line"><span class="term-prompt">${block.prompt}</span> <span class="term-cmd">${block.cmd}</span></div>
      ${block.out.map(o => `<div class="term-line term-out ${o.cls}">${o.text}</div>`).join("")}
    `;
    }
});
