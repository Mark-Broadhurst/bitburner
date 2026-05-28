import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    const target = ns.args[0] as string;
    const wait   = (ns.args[1] ?? 0) as number;
    await ns.weaken(target, { additionalMsec: wait });
}
