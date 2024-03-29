import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    let target = ns.args[0] as string;
    let wait = (ns.args[1] ?? 0) as number;
    const secReduction = await ns.weaken(target, {additionalMsec: wait});
    //ns.tprint(`Weakened ${target} for ${ns.formatNumber(secReduction)}`);
}