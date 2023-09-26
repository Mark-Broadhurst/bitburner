import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    const list = ns.grafting.getGraftableAugmentations();
    let totalPrice = 0;
    let totalTime = 0;
    ns.print("Augmentation\t\t\t\t\tPrice\t\tTime");
    ns.print("".padEnd(100, "-"));
    for (const aug of list) {
        const stats = ns.singularity.getAugmentationStats(aug)
        const price = ns.grafting.getAugmentationGraftPrice(aug);
        const time = ns.grafting.getAugmentationGraftTime(aug);
        totalPrice += price;
        totalTime += time;
        ns.print(`${aug.padEnd(43)}\t${ns.formatNumber(price).padEnd(9)}\t${ns.tFormat(time)}`);
    }
    ns.print("".padEnd(100, "-"));
    ns.print(`Total\t\t\t\t\t\t${ns.formatNumber(totalPrice).padEnd(9)}\t${ns.tFormat(totalTime)}`);

}
