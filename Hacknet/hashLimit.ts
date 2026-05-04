import { NS } from "@ns";

export function getHashLimit(ns: NS): number {
    return forEachNode(ns, node => node.hashCapacity);
}

export function getHashProduction(ns: NS): number {
    return forEachNode(ns, node => node.production);
}

function forEachNode(ns: NS, callback: (node: any) => number): number {
    const nodeCount = ns.hacknet.numNodes();
    let acc = 0;
    for (let i = 0; i < nodeCount; i++) {
        const node = ns.hacknet.getNodeStats(i);
        acc += callback(node);
    }
    return acc;
}
