import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    const target = ns.args[0] as string;
    const wait = (ns.args[1] ?? 0) as number;
    const stock = (ns.args[2] ?? false) as boolean;
    await ns.hack(target, { additionalMsec: wait, stock });
    //ns.tprint(`Hacked ${target} for ${ns.format.number(money)}`);
}