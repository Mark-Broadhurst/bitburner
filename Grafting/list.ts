import { NS } from "@ns";
import { Path, buildPhase1, buildPhase2 } from "Grafting/shared";

export function autocomplete(): string[] {
    return ["hacking", "physical"];
}

export async function main(ns: NS): Promise<void> {
    const path: Path = (ns.args[0] as Path) === "physical" ? "physical" : "hacking";

    ns.disableLog("ALL");
    ns.clearLog();
    ns.ui.openTail();
    ns.ui.resizeTail(720, 800);

    const phase1 = buildPhase1(ns, path);
    const phase2 = buildPhase2(ns, phase1);

    let totalPrice = 0;
    let totalTime  = 0;

    ns.print(`Phase 1 — ${path} path (${phase1.length} augs, cheapest first)`);
    ns.print("─".repeat(72));
    ns.print(`${"#".padEnd(4)} ${"Augmentation".padEnd(44)} ${"Price".padStart(10)}  ${"Time".padStart(10)}`);
    ns.print("─".repeat(72));
    for (let i = 0; i < phase1.length; i++) {
        const aug   = phase1[i];
        const price = ns.grafting.getAugmentationGraftPrice(aug);
        const time  = ns.grafting.getAugmentationGraftTime(aug);
        totalPrice += price;
        totalTime  += time;
        ns.print(`${String(i + 1).padEnd(4)} ${aug.padEnd(44)} ${ns.format.number(price).padStart(10)}  ${ns.format.time(time).padStart(10)}`);
    }
    ns.print("─".repeat(72));
    ns.print(`${"Total".padEnd(48)} ${ns.format.number(totalPrice).padStart(10)}  ${ns.format.time(totalTime).padStart(10)}`);

    ns.print("");

    let p2Price = 0;
    let p2Time  = 0;

    ns.print(`Phase 2 — all remaining (${phase2.length} augs, shortest first)`);
    ns.print("─".repeat(72));
    ns.print(`${"#".padEnd(4)} ${"Augmentation".padEnd(44)} ${"Price".padStart(10)}  ${"Time".padStart(10)}`);
    ns.print("─".repeat(72));
    for (let i = 0; i < phase2.length; i++) {
        const aug   = phase2[i];
        const price = ns.grafting.getAugmentationGraftPrice(aug);
        const time  = ns.grafting.getAugmentationGraftTime(aug);
        p2Price += price;
        p2Time  += time;
        ns.print(`${String(i + 1).padEnd(4)} ${aug.padEnd(44)} ${ns.format.number(price).padStart(10)}  ${ns.format.time(time).padStart(10)}`);
    }
    ns.print("─".repeat(72));
    ns.print(`${"Total".padEnd(48)} ${ns.format.number(p2Price).padStart(10)}  ${ns.format.time(p2Time).padStart(10)}`);
}
