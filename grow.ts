import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    let target = ns.args[0] as string;
    let wait = (ns.args[1] ?? 0) as number;
    const growPercent = await ns.grow(target, {additionalMsec: wait});
    //ns.toast(`Grew ${target} for ${ns.formatPercent(growPercent)}`);
}