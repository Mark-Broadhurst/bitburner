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

/**
 * Polls home RAM every 3 s and launches `script` as soon as there is enough
 * free RAM to fit it.  Gives up after 10 minutes and prints a warning.
 * Concurrent calls interleave at each sleep so multiple scripts queue in
 * parallel without blocking each other.
 */
async function launchWhenReady(ns: NS, script: string, ...args: (string | number | boolean)[]): Promise<void> {
    const needed   = ns.getScriptRam(script, "home");
    const deadline = Date.now() + 10 * 60_000; // 10-minute timeout
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
async function bn8(ns: NS, level: number) {
    ns.killall();

    // ── 1. Bootstrap home RAM ─────────────────────────────────────────────────
    // Keep $150M liquid; with ~$250M start this naturally stops at 128 GB.
    //   32→64  costs ~$22M  → $228M remaining ✓
    //   64→128 costs ~$44M  → $184M remaining ✓
    //   128→256 costs ~$88M → $96M remaining  ✗ (stop — too little for trading)
    // The monitor loop (step 4) continues buying upgrades as trading profits grow,
    // eventually pushing to 256 GB which lets stockHack.js start automatically.
    const RAM_RESERVE = 150_000_000;
    while (true) {
        const cost = ns.singularity.getUpgradeHomeRamCost();
        if (ns.getServerMoneyAvailable("home") - cost >= RAM_RESERVE) {
            ns.singularity.upgradeHomeRam();
        } else break;
    }
    ns.tprint(`INFO BN8: home RAM = ${ns.getServer("home").maxRam} GB  cash = ${ns.format.number(ns.getServerMoneyAvailable("home"))}`);

    // ── 2. Scripts that launch and self-terminate ─────────────────────────────
    ns.run("Hacking/nuke-all.js");
    ns.run("Hacking/backdoor.js");
    ns.run("Programs/create.js");      // exits when all programs are created
    ns.run("CodingContract/solve.js"); // exits when no contracts remain
    ns.run("Faction/join.js");
    ns.run("Cloud/purchase.js");       // buys initial server fleet for hacking workers

    // ── 3. Critical daemons — wait for enough RAM ─────────────────────────────
    await Promise.all([
        launchWhenReady(ns, "Stock/trade.js"),
        launchWhenReady(ns, "installloop.js"),
    ]);

    // ── 4. Monitor loop ───────────────────────────────────────────────────────
    // init.js stays alive as the BN8 orchestrator:
    //   • Buys RAM upgrades every minute as trading capital grows.
    //     128→256 GB unlocks when cash exceeds ~$238M (≈ $88M cost + $150M reserve).
    //   • Relaunches optional daemons once RAM is available (or if they crashed).
    //   • Watches the win condition once The Red Pill aug is installed.
    while (true) {
        await ns.sleep(60_000);

        // Incremental RAM upgrade — runs every minute, buys when affordable.
        const cost = ns.singularity.getUpgradeHomeRamCost();
        if (ns.getServerMoneyAvailable("home") - cost >= RAM_RESERVE) {
            ns.singularity.upgradeHomeRam();
            ns.tprint(`INFO BN8: home RAM → ${ns.getServer("home").maxRam} GB  cash = ${ns.format.number(ns.getServerMoneyAvailable("home"))}`);
        }

        // Launch optional daemons (no-op if already running, silently fails if not enough RAM).
        if (!ns.isRunning("Stock/stockHack.js"))       ns.run("Stock/stockHack.js");
        if (!ns.isRunning("Hacking/hackCommander.js")) ns.run("Hacking/hackCommander.js");
        if (!ns.isRunning("Hacking/nuke-all.js"))      ns.run("Hacking/nuke-all.js");
        if (!ns.isRunning("Hacking/backdoor.js"))      ns.run("Hacking/backdoor.js");

        // Win condition (only relevant after The Red Pill aug is installed).
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
async function bn15(ns: NS, level: number) {}
