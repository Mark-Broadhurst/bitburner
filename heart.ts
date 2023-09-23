import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.tprint(eval("ns.heart.break()"));
}
