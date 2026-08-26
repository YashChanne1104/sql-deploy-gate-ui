// ===========================
// HomeController -- animates the terminal window on the landing page.
// Purely cosmetic: types out a realistic push -> AI review -> merge
// sequence for sp_RebuildIndex.sql, then loops. No API calls, no auth.
// ===========================
document.addEventListener("DOMContentLoaded", () => {
    const body = document.getElementById("termBody");
    if (!body) return;

    // Each line: { type: 'prompt'|'out', text, cls }
    // 'prompt' lines are typed char-by-char (no leading $, just the command).
    // 'out' lines appear instantly under the prompt, styled by cls.
    const SCRIPT = [
        { type: "prompt", text: "sqlgate push sp_RebuildIndex.sql" },
        { type: "out", text: "detected: DDL — ALTER PROCEDURE", cls: "dim" },
        { type: "out", text: "target: ACPL-TMS.dbo", cls: "dim" },
        { type: "out", text: "queued for AI review...", cls: "dim" },
        { type: "prompt", text: "sqlgate status --watch" },
        { type: "out", text: "✓ no destructive statements (DROP/TRUNCATE) found", cls: "add" },
        { type: "out", text: "✓ WITH (ONLINE = ON) present for index rebuild", cls: "add" },
        { type: "out", text: "✓ transaction scope matches existing procedure", cls: "add" },
        { type: "out", text: "verdict: approved", cls: "add" },
        { type: "prompt", text: "sqlgate merge #482" },
        { type: "out", text: "approved by: yashchanne64@gmail.com", cls: "dim" },
        { type: "out", text: "merging DDL to ACPL-TMS...", cls: "merge" },
        { type: "out", text: "✓ merged — sp_RebuildIndex.sql is live", cls: "merge" },
    ];

    const TYPE_SPEED = 28;      // ms per character on prompt lines
    const LINE_PAUSE = 260;     // pause after a line completes
    const OUT_PAUSE = 160;      // pause between instant output lines
    const RESTART_PAUSE = 2200; // pause before looping

    let cursorEl = null;

    function ensureCursor() {
        if (!cursorEl) {
            cursorEl = document.createElement("span");
            cursorEl.className = "term-cursor";
        }
        return cursorEl;
    }

    function sleep(ms) {
        return new Promise((res) => setTimeout(res, ms));
    }

    async function typeLine(text) {
        const line = document.createElement("div");
        line.className = "term-line";

        const cmdSpan = document.createElement("span");
        cmdSpan.className = "term-cmd";
        line.appendChild(cmdSpan);
        line.appendChild(ensureCursor());

        body.appendChild(line);

        for (let i = 0; i < text.length; i++) {
            cmdSpan.textContent += text[i];
            await sleep(TYPE_SPEED);
        }
        cursorEl.remove();
        await sleep(LINE_PAUSE);
    }

    function printOut(text, cls) {
        const line = document.createElement("div");
        line.className = `term-line term-out${cls ? ` ${cls}` : ""}`;
        line.textContent = text;
        body.appendChild(line);
    }

    async function runScript() {
        body.innerHTML = "";
        for (const step of SCRIPT) {
            if (step.type === "prompt") {
                await typeLine(step.text);
            } else {
                printOut(step.text, step.cls);
                await sleep(OUT_PAUSE);
            }
        }
        // idle cursor on its own line after the script finishes
        const idle = document.createElement("div");
        idle.className = "term-line";
        idle.appendChild(ensureCursor());
        body.appendChild(idle);

        await sleep(RESTART_PAUSE);
        runScript();
    }

    runScript();
});