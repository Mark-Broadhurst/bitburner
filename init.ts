import { NS } from "@ns";

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
    // Sequential setup: buy programs → fill server slots → upgrade RAM → grow hacknet
    ns.run("scriptManager.js", 1, "Programs/buy.js", "Cloud/purchase.js", "Cloud/upgrade.js", "Hacknet/upgrade.js");
    // Daemons: run continuously in parallel
    ns.run("Hacking/nuke-all.js");
    ns.run("Home/upgrade.js");
    ns.run("Hacknet/spendHashes.js");
    ns.run("Faction/join.js");
    ns.run("Hacking/hackCommander.js");
    // Train stats before grinding factions
    const trainPid = ns.run("train.js", 1, "--hacking", 200, "--charisma", 200);
    if (trainPid === 0) {
        ns.tprint("ERROR init: failed to start train.js");
        return;
    }
    while (ns.isRunning(trainPid)) {
        await ns.sleep(1000);
    }
    ns.run("Faction/workForAugs.js");

    // Wait until hacking level is high enough to destroy w0r1d_d43m0n
    const daemon = "w0r1d_d43m0n";
    while (true) {
        const required = ns.getServer(daemon).requiredHackingSkill ?? 3000;
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
