import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    let target = ns.args[0] as string;
    let wait = (ns.args[1] ?? 0) as number;
    await ns.hack(target, {additionalMsec: wait});
}