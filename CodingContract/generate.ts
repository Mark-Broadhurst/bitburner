import { NS } from "@ns";


export async function main(ns: NS) {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.ls("home", "*.cct").forEach(file => ns.rm(file));

    const type = ns.args[0] as string | undefined;
    if (type) {
        ns.codingcontract.createDummyContract(type as any);
    } else {
        ns.codingcontract.getContractTypes().forEach(t => ns.codingcontract.createDummyContract(t));
    }
}

export function autocomplete(data: any) {
    return ["Square Root", "Total Number of Primes", "Largest Rectangle in a Matrix",
            "Compression III: LZ Compression", "Compression II: LZ Decompression",
            "HammingCodes: Integer to Encoded Binary", "HammingCodes: Encoded Binary to Integer"];
}