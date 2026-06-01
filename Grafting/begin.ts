import { NS } from "@ns";
import { Path, buildPhase1, buildPhase2 } from "Grafting/shared";

export function autocomplete(): string[] {
    return ["hacking", "physical"];
}

export async function main(ns: NS): Promise<void> {
    const path: Path = (ns.args[0] as Path) === "physical" ? "physical" : "hacking";

    ns.disableLog("ALL");
    ns.clearLog();

    const phase1 = buildPhase1(ns, path);
    ns.tprint(`INFO Grafting ${phase1.length} augmentations (phase 1 — ${path}).`);

    for (let i = 0; i < phase1.length; i++) {
        const aug   = phase1[i];
        const price = ns.grafting.getAugmentationGraftPrice(aug) + 200_000;
        const time  = ns.grafting.getAugmentationGraftTime(aug);

        while (ns.getServerMoneyAvailable("home") < price) {
            ns.print(`Waiting for ${aug} ${ns.format.number(price)} ${ns.format.number(ns.getServerMoneyAvailable("home"))}`);
            await ns.sleep(1000);
        }

        if (ns.getPlayer().city !== ns.enums.CityName.NewTokyo) {
            ns.singularity.travelToCity(ns.enums.CityName.NewTokyo);
        }
        ns.print(`Grafting [${i + 1}/${phase1.length}] ${aug}  cost=${ns.format.number(price)}  time=${ns.format.time(time)}`);
        ns.grafting.graftAugmentation(aug);

        await ns.sleep(time + 1000);
        while (ns.singularity.isBusy()) {
            await ns.sleep(1000);
        }
    }

    ns.tprint("INFO Phase 1 complete — starting phase 2.");

    const phase2 = buildPhase2(ns);
    for (let i = 0; i < phase2.length; i++) {
        const aug   = phase2[i];
        const price = ns.grafting.getAugmentationGraftPrice(aug) + 200_000;
        const time  = ns.grafting.getAugmentationGraftTime(aug);

        while (ns.getServerMoneyAvailable("home") < price) {
            ns.print(`Waiting for ${aug} ${ns.format.number(price)} ${ns.format.number(ns.getServerMoneyAvailable("home"))}`);
            await ns.sleep(1000);
        }

        if (ns.getPlayer().city !== ns.enums.CityName.NewTokyo) {
            ns.singularity.travelToCity(ns.enums.CityName.NewTokyo);
        }
        ns.print(`Grafting [${i + 1}/${phase2.length}] ${aug}  cost=${ns.format.number(price)}  time=${ns.format.time(time)}`);
        ns.grafting.graftAugmentation(aug);

        await ns.sleep(time + 1000);
        while (ns.singularity.isBusy()) {
            await ns.sleep(1000);
        }
    }

    ns.tprint("INFO Grafting complete.");
}
