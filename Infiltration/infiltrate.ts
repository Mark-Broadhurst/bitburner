import { NS, LocationName } from "@ns";

const AUTOMATOR = "Infiltration/automator.js";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.ui.openTail();
    ns.ui.resizeTail(660, 480);

    const override  = (ns.args[0] as string | undefined) || undefined;
    const maxRuns   = ns.args[1] !== undefined ? Number(ns.args[1]) : 1;
    const doc       = eval("document") as Document;

    if (!ns.isRunning(AUTOMATOR)) {
        const pid = ns.run(AUTOMATOR);
        if (pid === 0) {
            ns.tprint(`ERROR infiltrate: could not start ${AUTOMATOR}`);
            return;
        }
        await ns.sleep(200);
    }

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

        await ns.sleep(300);
        const clicked = clickInfiltrate(doc);
        if (!clicked) {
            ns.print("⚠ 'Infiltrate' button not found — waiting for UI...");
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

        await ns.sleep(4_000);

        const deadline = Date.now() + 10 * 60_000;
        let quietTicks = 0;
        while (Date.now() < deadline) {
            await ns.sleep(500);
            if (gameVisible(doc)) { quietTicks = 0; continue; }
            if (++quietTicks >= 3) break;
        }

        ns.print("✅ Infiltration complete.");
        runCount++;
        if (runCount < maxRuns) await ns.sleep(500);
    }

    ns.print(`\n🏁 Done — completed ${runCount} infiltration(s).`);
}

function gameVisible(doc: Document): boolean {
    for (const h4 of doc.querySelectorAll("h4")) {
        if (h4.textContent?.trim()) return true;
    }
    return false;
}

function clickInfiltrate(doc: Document): boolean {
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
