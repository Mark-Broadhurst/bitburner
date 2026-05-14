import { NS, Server } from "@ns";

export async function main(ns: NS): Promise<void> {
    const { currentNode, ownedSF } = ns.getResetInfo();
    const level = (ownedSF.get(currentNode) ?? 0) + 1;

    ns.tprint(`INFO BitNode ${currentNode}.${level}`);

    switch (currentNode) {
        case 1:  // Source Genesis
            await bn1(ns, level);
            break;
        case 2:  // Rise of the Underworld
            await bn2(ns, level);
            break;
        case 3:  // Corporatocracy
            await bn3(ns, level);
            break;
        case 4:  // The Singularity
            await bn4(ns, level);
            break;
        case 5:  // Artificial Intelligence
            await bn5(ns, level);
            break;
        case 6:  // Bladeburners
            await bn6(ns, level);
            break;
        case 7:  // Bladeburners 2079
            await bn7(ns, level);
            break;
        case 8:  // Ghost of Wall Street
            await bn8(ns, level);
            break;
        case 9:  // Hacktocracy
            await bn9(ns, level);
            break;
        case 10: // Digital Carbon
            await bn10(ns, level);
            break;
        case 11: // The Big Crash
            await bn11(ns, level);
            break;
        case 12: // The Recursion
            await bn1(ns, level);
            break;
        case 13: // They're Lunatics
            await bn13(ns, level);
            break;
        case 14: // IPvGO Subnet Takeover
            await bn14(ns, level);
            break;
        case 15: // The Eye of the Sun
            await bn15(ns, level);
            break;
        default:
            ns.tprint(`ERROR No strategy defined for BitNode ${currentNode}`);
    }
}

async function bn1(ns: NS, level: number) {
    ns.killall();
    ns.run("CodingContract/solve.js");
    ns.run("Darknet/startup.js");
    // Sequential: buy servers → buy programs → launch upgrade daemon.
    // scriptManager waits for each to finish before starting the next,
    // then spawns upgrade.js so it runs as a daemon.
    ns.run("scriptManager.js", 1, "Cloud/purchase.js", "Programs/buy.js", "upgrade.js");
    // Parallel daemons
    ns.run("Hacking/nuke-all.js");
    ns.run("Hacking/backdoor.js");
    ns.run("Hacknet/spendHashes.js");
    ns.run("Stock/trade.js");            // waits internally for TIX API (upgrade.js buys it)
    ns.run("Stock/manipulateStocks.js"); // waits internally for TIX API
    ns.run("Faction/join.js");
    ns.run("Sleeve/train.js"); // no-op if SF10 not owned
    // Train stats before grinding factions
    const trainPid = ns.run("train.js", 1, "--hacking", 200, "--charisma", 200);
    if (trainPid === 0) {
        ns.tprint("ERROR init: failed to start train.js");
        return;
    }
    while (ns.isRunning(trainPid)) {
        await ns.sleep(1000);
    }
    // hackCommander starts after training — servers are purchased by then so
    // there is enough RAM to run batches without starving the management scripts.
    ns.run("Hacking/hackCommander.js");
    ns.run("installloop.js");

    // Win condition: need The Red Pill installed before w0r1d_d43m0n is
    // accessible.  If it's not installed yet, installloop is still cycling —
    // just exit and let the next init.js invocation pick this up.
    if (!ns.singularity.getOwnedAugmentations(false).includes("The Red Pill")) return;

    // Red Pill installed — server is in the network, safe to query.
    // Required hacking skill varies by BitNode so we read it from the server.
    while (true) {
        const required = (ns.getServer("w0r1d_d43m0n") as Server).requiredHackingSkill ?? 3000;
        const current  = ns.getHackingLevel();
        if (current >= required) break;
        ns.tprint(`INFO BN1 win condition: hacking ${current} / ${required}`);
        await ns.sleep(60000);
    }
    ns.singularity.destroyW0r1dD43m0n(12, "init.js");
}
async function bn2(ns: NS, level: number) {}
async function bn3(ns: NS, level: number) {}
async function bn4(ns: NS, level: number) {}
async function bn5(ns: NS, level: number) {}
async function bn6(ns: NS, level: number) {}
async function bn7(ns: NS, level: number) {}
async function bn8(ns: NS, level: number) {}
async function bn9(ns: NS, level: number) {}
async function bn10(ns: NS, level: number) {}
async function bn11(ns: NS, level: number) {}
async function bn12(ns: NS, level: number) {}
async function bn13(ns: NS, level: number) {}
async function bn14(ns: NS, level: number) {}
async function bn15(ns: NS, level: number) {}
