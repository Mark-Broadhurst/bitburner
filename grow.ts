import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    let target = ns.args[0] as string;
    let wait = (ns.args[1] ?? 0) as number;
    let stock = (ns.args[2] ?? false) as boolean;
    const growPercent = await ns.grow(target, {additionalMsec: wait, stock: stock});
    //ns.tprint(`Grew ${target} for ${ns.formatPercent(growPercent)}`);
}