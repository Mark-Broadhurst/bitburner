import { NS } from "@ns";
export async function main(ns: NS) {
    ns.disableLog("ALL");
    ns.clearLog();

    const hostname = ns.args[0] as string;
    const filename = ns.args[1] as string;
    const data = ns.codingcontract.getData(filename, hostname);

    ns.tprint(`Solving Code Contract on ${hostname}:${filename} ${result}`)
}