import { NS } from "@ns";
import { getUnownedAugmentationsFromFaction } from "Utils/augments";

const INSTALL_OVERHEAD_TICKS = 5;

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.ui.openTail();
    ns.ui.resizeTail(520, 400);

    if (!ns.isRunning("Hacking/hackCommander.js")) ns.run("Hacking/hackCommander.js");
    if (!ns.isRunning("Stock/trade.js"))            ns.run("Stock/trade.js");
    if (!ns.isRunning("Darknet/crawler.js"))        ns.run("Darknet/crawler.js");
    ns.run("Hacking/nuke-all.js");

    const faction = ns.gang.getGangInformation().faction;

    const unownedAtStart = getUnownedAugmentationsFromFaction(ns, faction)
        .sort((a, b) => ns.singularity.getAugmentationPrice(a)
                      - ns.singularity.getAugmentationPrice(b));

    if (unownedAtStart.length === 0) {
        ns.tprint("Gang loop: all augs purchased — launching init");
        ns.singularity.installAugmentations("init.js");
        return;
    }

    const moneyBefore = ns.getServerMoneyAvailable("home");
    await ns.gang.nextUpdate();
    await ns.gang.nextUpdate();
    const moneyPerTick = Math.max(1, ns.getServerMoneyAvailable("home") - moneyBefore) / 2;

    const targetCount = optimalBatchSize(ns, unownedAtStart, moneyPerTick, INSTALL_OVERHEAD_TICKS);
    const installWhenRemaining = unownedAtStart.length - targetCount;

    ns.tprint(`Gang loop: ${unownedAtStart.length} augs remaining — buying ${targetCount} this session ($${ns.format.number(moneyPerTick)}/tick)`);

    while (true) {
        ns.clearLog();

        const members = ns.gang.getMemberNames();
        const rep     = ns.singularity.getFactionRep(faction);
        const money   = ns.getServerMoneyAvailable("home");
        const unowned = getUnownedAugmentationsFromFaction(ns, faction)
            .sort((a, b) => ns.singularity.getAugmentationPrice(a)
                          - ns.singularity.getAugmentationPrice(b));

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

        let bought = false;
        for (const aug of unowned) {
            const price  = ns.singularity.getAugmentationPrice(aug);
            const repReq = ns.singularity.getAugmentationRepReq(aug);
            if (money >= price && rep >= repReq) {
                ns.singularity.purchaseAugmentation(faction, aug);
                ns.tprint(`Gang loop: bought ${aug}  ($${ns.format.number(price)})`);
                bought = true;
                break;
            }
        }
        if (bought) continue;

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

function optimalBatchSize(
    ns: NS,
    augs: string[],
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
