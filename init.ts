import { NS, Server } from "@ns";

export async function main(ns: NS): Promise<void> {
    const { currentNode, ownedSF } = ns.getResetInfo();
    const level = (ownedSF.get(currentNode) ?? 0) + 1;

    ns.tprint(`INFO BitNode ${currentNode}.${level}`);

    switch (currentNode) {
        case 1:
            await bn1(ns, level);
            break;
        case 2:
            await bn2(ns, level);
            break;
        case 3:
            await bn3(ns, level);
            break;
        case 4:
            await bn4(ns, level);
            break;
        case 5:
            await bn5(ns, level);
            break;
        case 6:
            await bn6(ns, level);
            break;
        case 7:
            await bn7(ns, level);
            break;
        case 8:
            await bn8(ns, level);
            break;
        case 9:
            await bn9(ns, level);
            break;
        case 10:
            await bn10(ns, level);
            break;
        case 11:
            await bn11(ns, level);
            break;
        case 12:
            await bn1(ns, level);
            break;
        case 13:
            await bn13(ns, level);
            break;
        case 14:
            await bn14(ns, level);
            break;
        case 15:
            await bn15(ns, level);
            break;
        default:
            ns.tprint(`ERROR No strategy defined for BitNode ${currentNode}`);
    }
}

async function launchWhenReady(ns: NS, script: string, ...args: (string | number | boolean)[]): Promise<void> {
    const needed   = ns.getScriptRam(script, "home");
    const deadline = Date.now() + 10 * 60_000;
    while (Date.now() < deadline) {
        const { maxRam, ramUsed } = ns.getServer("home");
        if (maxRam - ramUsed >= needed) {
            const pid = ns.run(script, 1, ...args);
            if (pid !== 0) {
                ns.tprint(`INFO init: launched ${script}`);
                return;
            }
        }
        await ns.sleep(3_000);
    }
    ns.tprint(`WARN init: could not launch ${script} — needs ${needed.toFixed(1)} GB, only ${(ns.getServer("home").maxRam - ns.getServer("home").ramUsed).toFixed(1)} GB free`);
}

async function bn1(ns: NS, level: number) {
    ns.killall();
    ns.run("CodingContract/solve.js");
    ns.run("Darknet/startup.js");
    ns.run("scriptManager.js", 1, "Cloud/purchase.js", "Programs/buy.js", "upgrade.js");
    ns.run("Hacking/nuke-all.js");
    ns.run("Hacking/backdoor.js");
    ns.run("Hacknet/spendHashes.js");
    ns.run("Stock/trade.js");
    ns.run("Stock/manipulateStocks.js");
    ns.run("Faction/join.js");
    ns.run("Sleeve/train.js");
    const trainPid = ns.run("train.js", 1, "--hacking", 200, "--charisma", 200);
    if (trainPid === 0) {
        ns.tprint("ERROR init: failed to start train.js");
        return;
    }
    while (ns.isRunning(trainPid)) {
        await ns.sleep(1000);
    }
    ns.run("Hacking/hackCommander.js");
    ns.run("installloop.js");

    if (!ns.singularity.getOwnedAugmentations(false).includes("The Red Pill")) return;

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
async function bn8(ns: NS, level: number) {
    ns.killall();

    const RAM_RESERVE = 150_000_000;
    while (true) {
        const cost = ns.singularity.getUpgradeHomeRamCost();
        if (ns.getServerMoneyAvailable("home") - cost >= RAM_RESERVE) {
            ns.singularity.upgradeHomeRam();
        } else break;
    }
    ns.tprint(`INFO BN8: home RAM = ${ns.getServer("home").maxRam} GB  cash = ${ns.format.number(ns.getServerMoneyAvailable("home"))}`);

    ns.run("Hacking/nuke-all.js");
    ns.run("Hacking/backdoor.js");
    ns.run("Programs/create.js");
    ns.run("CodingContract/solve.js");
    ns.run("Faction/join.js");
    ns.run("Cloud/purchase.js");

    await Promise.all([
        launchWhenReady(ns, "Stock/trade.js"),
        launchWhenReady(ns, "installloop.js"),
    ]);

    while (true) {
        await ns.sleep(60_000);

        const cost = ns.singularity.getUpgradeHomeRamCost();
        if (ns.getServerMoneyAvailable("home") - cost >= RAM_RESERVE) {
            ns.singularity.upgradeHomeRam();
            ns.tprint(`INFO BN8: home RAM → ${ns.getServer("home").maxRam} GB  cash = ${ns.format.number(ns.getServerMoneyAvailable("home"))}`);
        }

        if (!ns.isRunning("Stock/stockHack.js"))       ns.run("Stock/stockHack.js");
        if (!ns.isRunning("Hacking/hackCommander.js")) ns.run("Hacking/hackCommander.js");
        if (!ns.isRunning("Hacking/nuke-all.js"))      ns.run("Hacking/nuke-all.js");
        if (!ns.isRunning("Hacking/backdoor.js"))      ns.run("Hacking/backdoor.js");

        if (!ns.singularity.getOwnedAugmentations(false).includes("The Red Pill")) continue;
        const required = (ns.getServer("w0r1d_d43m0n") as Server).requiredHackingSkill ?? 3000;
        const current  = ns.getHackingLevel();
        if (current >= required) {
            ns.singularity.destroyW0r1dD43m0n(9, "init.js");
            return;
        }
        ns.tprint(`INFO BN8 win condition: hacking ${current} / ${required}`);
    }
}
async function bn9(ns: NS, level: number) {}
async function bn10(ns: NS, level: number) {}
async function bn11(ns: NS, level: number) {}
async function bn12(ns: NS, level: number) {}
async function bn13(ns: NS, level: number) {}
async function bn14(ns: NS, level: number) {}
async function bn15(ns: NS, level: number) {
    ns.killall();
    ns.tprint(`INFO BN15.${level}: starting`);

    ns.run("Cloud/purchase.js");
    ns.run("Darknet/startup.js");
    ns.run("Hacking/nuke-all.js");
    ns.run("Hacking/backdoor.js");
    ns.run("Hacking/hackCommander.js");
}
