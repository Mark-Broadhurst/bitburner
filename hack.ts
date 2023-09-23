import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    const target = ns.args[0] as string;
    const wait = (ns.args[1] ?? 0) as number;
    const money = await ns.hack(target, {additionalMsec: wait});
    //ns.toast(`Hacked ${target} for ${ns.formatNumber(money)}`);
}