import { NS } from "@ns";

/**
 * Territory warfare engagement script.
 *
 * Targets the weakest enemy gang first (not the most powerful), which lets us
 * start claiming territory much earlier.  Uses hysteresis on win-chance so we
 * don't rapidly toggle on/off near the threshold.
 *
 *   engage  when win-chance vs weakest > ENGAGE_THRESHOLD   (55 %)
 *   pause   when win-chance vs weakest < DISENGAGE_THRESHOLD (45 %)
 */

const ENGAGE_THRESHOLD    = 0.55;
const DISENGAGE_THRESHOLD = 0.45;

const ALL_GANG_NAMES = [
    "Slum Snakes", "Tetrads", "The Syndicate", "The Dark Army",
    "Speakers for the Dead", "NiteSec", "The Black Hand",
];

export async function main(ns: NS): Promise<void> {
    ns.clearLog();
    ns.disableLog("ALL");
    ns.ui.openTail();
    ns.ui.resizeTail(480, 220);

    while (true) {
        await ns.gang.nextUpdate();
        ns.clearLog();

        const gang      = ns.gang.getGangInformation();
        const otherInfo = ns.gang.getAllGangInformation();

        if (gang.territory >= 1) {
            ns.print("✅ Full territory — warfare complete.");
            if (gang.territoryWarfareEngaged) ns.gang.setTerritoryWarfare(false);
            break;
        }

        // Enemies that still hold territory (exclude our own faction).
        const enemies = ALL_GANG_NAMES
            .filter(name => name !== gang.faction)
            .filter(name => otherInfo[name]?.territory > 0)
            .map(name => ({ name, power: otherInfo[name].power }));

        if (enemies.length === 0) {
            ns.print("✅ No enemies with territory remaining.");
            if (gang.territoryWarfareEngaged) ns.gang.setTerritoryWarfare(false);
            break;
        }

        // Pick the weakest target — easiest win first.
        const weakest   = enemies.reduce((a, b) => a.power < b.power ? a : b);
        const winChance = gang.power / (gang.power + weakest.power);

        ns.print(`Our power    : ${ns.format.number(gang.power)}`);
        ns.print(`Target       : ${weakest.name} (${ns.format.number(weakest.power)})`);
        ns.print(`Win chance   : ${(winChance * 100).toFixed(1)}%`);
        ns.print(`Territory    : ${(gang.territory * 100).toFixed(1)}%`);
        ns.print(`Engaged      : ${gang.territoryWarfareEngaged}`);

        // Hysteresis: if currently engaged, keep going until chance < DISENGAGE;
        // if not engaged, only start when chance > ENGAGE.
        const shouldEngage = gang.territoryWarfareEngaged
            ? winChance >= DISENGAGE_THRESHOLD
            : winChance >= ENGAGE_THRESHOLD;

        if (shouldEngage !== gang.territoryWarfareEngaged) {
            ns.gang.setTerritoryWarfare(shouldEngage);
            ns.tprint(`Gang: territory warfare ${shouldEngage ? "▶ started" : "⏸ paused"} (win ${(winChance * 100).toFixed(1)}%)`);
        }
    }
}
