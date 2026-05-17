import { NS, LocationName } from "@ns";

/**
 * Infiltration runner.
 *
 * 1. Launches the automator (installs the isTrusted hook) before the game
 *    mounts its keydown listener.
 * 2. Ranks infiltration locations by intelligence XP yield and navigates
 *    to the best one.
 * 3. DOM-clicks the "Infiltrate" button to start.
 * 4. Waits for mini-games to complete, then loops back for the next run.
 *
 * Usage:
 *   run Infiltration/infiltrate.js                    ← best location, 1 run
 *   run Infiltration/infiltrate.js "Noodle Bar"       ← override location, 1 run
 *   run Infiltration/infiltrate.js "" 5               ← best location, 5 runs
 *   run Infiltration/infiltrate.js "Noodle Bar" 5     ← override, 5 runs
 *   run Infiltration/infiltrate.js "" Infinity        ← run forever
 */

const AUTOMATOR = "Infiltration/automator.js";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.ui.openTail();
    ns.ui.resizeTail(660, 480);

    const override  = (ns.args[0] as string | undefined) || undefined;
    const maxRuns   = ns.args[1] !== undefined ? Number(ns.args[1]) : 1;
    const doc       = eval("document") as Document;

    // ── 1. Launch automator first so its hook is installed before infiltration ──
    if (!ns.isRunning(AUTOMATOR)) {
        const pid = ns.run(AUTOMATOR);
        if (pid === 0) {
            ns.tprint(`ERROR infiltrate: could not start ${AUTOMATOR}`);
            return;
        }
        // Give the automator a moment to install its addEventListener hook
        await ns.sleep(200);
    }

    // ── 2. Rank locations ──────────────────────────────────────────────────────
    const locations = ns.infiltration.getPossibleLocations();
    const infos = locations
        .map(loc => {
            const info  = ns.infiltration.getInfiltration(loc.name);
            const score = info.maxClearanceLevel * info.difficulty;
            return { info, score };
        })
        .sort((a, b) => b.score - a.score);

    const target = (override ?? infos[0]?.info.location.name) as LocationName | undefined;
    if (!target) {
        ns.tprint("ERROR infiltrate: no infiltration locations found.");
        return;
    }

    // Print ranked table once
    ns.clearLog();
    ns.print("Ranked by intelligence XP  (levels × difficulty)");
    ns.print("─".repeat(64));
    ns.print("  " + "Location".padEnd(30) + "Diff".padEnd(7) + "Lvls".padEnd(6) + "Cash".padEnd(12) + "Score");
    ns.print("─".repeat(64));
    for (let i = 0; i < infos.length; i++) {
        const { info, score } = infos[i];
        const star = i === 0 || info.location.name === target ? "★ " : "  ";
        const nm   = info.location.name.substring(0, 28).padEnd(30);
        const df   = info.difficulty.toFixed(2).padEnd(7);
        const lv   = String(info.maxClearanceLevel).padEnd(6);
        const ca   = ns.format.number(info.reward.sellCash).padEnd(12);
        ns.print(`${star}${nm}${df}${lv}${ca}${score.toFixed(1)}`);
    }
    ns.print("─".repeat(64));

    // ── 3. Main loop ───────────────────────────────────────────────────────────
    ns.print(`\nRunning ${maxRuns === Infinity ? "∞" : maxRuns} infiltration(s) at: ${target}`);

    let runCount = 0;
    while (runCount < maxRuns) {
        ns.print(`\n[Run ${runCount + 1}${maxRuns !== Infinity ? `/${maxRuns}` : ""}] Navigating to: ${target}`);

        const moved = ns.singularity.goToLocation(target);
        if (!moved) {
            ns.print("⚠ Navigation failed — retrying in 2 s");
            await ns.sleep(2_000);
            continue;
        }

        // Wait for the location UI to render, then click "Infiltrate"
        await ns.sleep(300);
        const clicked = clickInfiltrate(doc);
        if (!clicked) {
            ns.print("⚠ 'Infiltrate' button not found — waiting for UI...");
            // Retry a few times
            let found = false;
            for (let i = 0; i < 10; i++) {
                await ns.sleep(300);
                if (clickInfiltrate(doc)) { found = true; break; }
            }
            if (!found) {
                ns.print("⚠ Could not click Infiltrate — is the automator still running?");
                await ns.sleep(2_000);
                continue;
            }
        }

        ns.print("🎮 Infiltration started — automator is solving mini-games...");

        // Give the UI 4 s to load the first mini-game before we start polling.
        await ns.sleep(4_000);

        // Wait for infiltration to finish.
        // gameVisible() mirrors the h4 detection in automator.ts — a mini-game
        // is active whenever an h4 with text is present in the DOM.
        // We require 3 consecutive "quiet" reads (1.5 s) before declaring done,
        // so brief transitions between mini-games don't prematurely end the loop.
        // Hard cap at 10 minutes in case something goes wrong.
        const deadline = Date.now() + 10 * 60_000;
        let quietTicks = 0;
        while (Date.now() < deadline) {
            await ns.sleep(500);
            if (gameVisible(doc)) { quietTicks = 0; continue; }
            if (++quietTicks >= 3) break;
        }

        ns.print("✅ Infiltration complete.");
        runCount++;
        if (runCount < maxRuns) await ns.sleep(500); // brief pause before next run
    }

    ns.print(`\n🏁 Done — completed ${runCount} infiltration(s).`);
}

/**
 * Returns true while a mini-game h4 is visible in the DOM.
 * Mirrors the h4-scanning logic in automator.ts.
 * Replaces the removed ns.isWorking() API.
 */
function gameVisible(doc: Document): boolean {
    for (const h4 of doc.querySelectorAll("h4")) {
        if (h4.textContent?.trim()) return true;
    }
    return false;
}

/**
 * Finds and clicks the "Infiltrate" button in the game UI.
 * Returns true if the button was found and clicked.
 */
function clickInfiltrate(doc: Document): boolean {
    // Look for a button whose text contains "Infiltrate"
    const buttons = doc.querySelectorAll("button");
    for (const btn of buttons) {
        if (btn.textContent?.trim().toLowerCase().includes("infiltrate")
            && !btn.disabled) {
            btn.click();
            return true;
        }
    }
    return false;
}
