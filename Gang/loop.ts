import { NS } from "@ns";
import { getUnownedAugmentationsFromFaction } from "Utils/augments";

/**
 * Post-territory gang aug loop.
 *
 * Buys gang-faction augs in optimal batches, installing between sessions to
 * reset the 1.9× per-purchase price multiplier.  The batch size is computed
 * each session to minimise total gang ticks across all sessions.
 *
 * Mid-session installs restart into Gang/loop.js (not init.js) so that init
 * cannot spend money on servers / hacknet before this loop runs again.
 * Once all augs are purchased the final install hands off to init.js.
 */

// Estimated gang ticks lost per install + restart cycle.
// Small because the gang keeps earning during the transition.
const INSTALL_OVERHEAD_TICKS = 5;

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.ui.openTail();
    ns.ui.resizeTail(520, 400);

    // ── Launch support scripts (guard against duplicate launches on restart) ─
    if (!ns.isRunning("Hacking/hackCommander.js")) ns.run("Hacking/hackCommander.js");
    if (!ns.isRunning("Stock/trade.js"))            ns.run("Stock/trade.js");
    if (!ns.isRunning("Darknet/crawler.js"))        ns.run("Darknet/crawler.js");
    ns.run("Hacking/nuke-all.js");  // one-shot; always safe to re-run

    const faction = ns.gang.getGangInformation().faction;

    // ── Nothing left to buy — final install into init ────────────────────────
    const unownedAtStart = getUnownedAugmentationsFromFaction(ns, faction)
        .sort((a, b) => ns.singularity.getAugmentationPrice(a)
                      - ns.singularity.getAugmentationPrice(b));

    if (unownedAtStart.length === 0) {
        ns.tprint("Gang loop: all augs purchased — launching init");
        ns.singularity.installAugmentations("init.js");
        return;
    }

    // ── Measure total income per gang tick ───────────────────────────────────
    // Wait two ticks and take the delta so hacking + stocks + gang are all counted.
    const moneyBefore = ns.getServerMoneyAvailable("home");
    await ns.gang.nextUpdate();
    await ns.gang.nextUpdate();
    const moneyPerTick = Math.max(1, ns.getServerMoneyAvailable("home") - moneyBefore) / 2;

    // ── Choose optimal batch size for this session ───────────────────────────
    const targetCount = optimalBatchSize(ns, unownedAtStart, moneyPerTick, INSTALL_OVERHEAD_TICKS);
    const installWhenRemaining = unownedAtStart.length - targetCount;

    ns.tprint(`Gang loop: ${unownedAtStart.length} augs remaining — buying ${targetCount} this session ($${ns.format.number(moneyPerTick)}/tick)`);

    // ── Main buy loop ────────────────────────────────────────────────────────
    while (true) {
        ns.clearLog();

        const members = ns.gang.getMemberNames();
        const rep     = ns.singularity.getFactionRep(faction);
        const money   = ns.getServerMoneyAvailable("home");
        const unowned = getUnownedAugmentationsFromFaction(ns, faction)
            .sort((a, b) => ns.singularity.getAugmentationPrice(a)
                          - ns.singularity.getAugmentationPrice(b));

        // ── Session target met — install and continue ────────────────────────
        if (unowned.length <= installWhenRemaining) {
            if (unowned.length === 0) {
                ns.tprint("Gang loop: all augs purchased — launching init");
                ns.singularity.installAugmentations("init.js");
            } else {
                ns.tprint(`Gang loop: ${targetCount} bought this session — installing (${unowned.length} remaining)`);
                ns.singularity.installAugmentations("Gang/loop.js");
            }
            return;
        }

        const boughtThisSession = unownedAtStart.length - unowned.length;
        ns.print(`Session: ${boughtThisSession}/${targetCount} bought   Total remaining: ${unowned.length}`);
        ns.print(`Income:  $${ns.format.number(moneyPerTick)}/tick   Money: $${ns.format.number(money)}`);
        ns.print(`Rep:     ${ns.format.number(rep)}`);
        ns.print("─".repeat(52));

        // ── Buy anything we can afford right now ─────────────────────────────
        let bought = false;
        for (const aug of unowned) {
            const price  = ns.singularity.getAugmentationPrice(aug);
            const repReq = ns.singularity.getAugmentationRepReq(aug);
            if (money >= price && rep >= repReq) {
                ns.singularity.purchaseAugmentation(faction, aug);
                ns.tprint(`Gang loop: bought ${aug}  ($${ns.format.number(price)})`);
                bought = true;
                break;  // prices just changed — re-sort next iteration
            }
        }
        if (bought) continue;

        // ── Blocked — show bottleneck and assign task ─────────────────────────
        const next     = unowned[0];
        const tPrice   = ns.singularity.getAugmentationPrice(next);
        const tRepReq  = ns.singularity.getAugmentationRepReq(next);
        const needRep  = rep   < tRepReq;
        const needMoney = money < tPrice;

        ns.print(`Next: ${next}`);
        ns.print(`  price $${ns.format.number(tPrice)}  have $${ns.format.number(money)}  ${needMoney ? "⏳" : "✅"}`);
        ns.print(`  rep   ${ns.format.number(tRepReq)}  have  ${ns.format.number(rep)}  ${needRep  ? "⏳" : "✅"}`);

        const task = needRep ? "Terrorism" : "Human Trafficking";
        ns.print(`\nTask → ${task}`);
        for (const m of members) ns.gang.setMemberTask(m, task);

        await ns.gang.nextUpdate();
    }
}

// ---------------------------------------------------------------------------
// Optimal batch size
// ---------------------------------------------------------------------------

/**
 * Find K — the number of augs to buy per session — that minimises total gang
 * ticks across all sessions to buy every aug.
 *
 * Buying more in one session inflates costs via the 1.9× per-purchase price
 * multiplier but saves the fixed overhead of an install cycle.  The sweet spot
 * depends on the magnitude of the aug prices relative to income per tick.
 *
 * Uses base prices (not current prices) since after each install the multiplier
 * resets, so subsequent sessions always start from base.
 */
function optimalBatchSize(
    ns: NS,
    augs: string[],         // sorted cheapest-first
    moneyPerTick: number,
    overheadTicks: number,
): number {
    const n = augs.length;
    if (n === 0) return 0;

    const prices = augs.map(a => ns.singularity.getAugmentationBasePrice(a));

    let bestTicks = Infinity;
    let bestK     = n;

    for (let k = 1; k <= n; k++) {
        let totalTicks = 0;
        let i = 0;

        while (i < n) {
            const end = Math.min(i + k, n);
            let batchCost = 0;
            for (let pos = 0; pos < end - i; pos++) {
                batchCost += prices[i + pos] * Math.pow(1.9, pos);
            }
            totalTicks += batchCost / moneyPerTick + overheadTicks;
            i = end;
        }

        if (totalTicks < bestTicks) {
            bestTicks = totalTicks;
            bestK     = k;
        }
    }

    return bestK;
}
