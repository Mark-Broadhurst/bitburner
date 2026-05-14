import { NS, CityName, CompanyName } from "@ns";
import { FactionsList, isSpecialFaction, isGangFaction, isExclusiveFaction, Factions } from "Utils/factions";
import { CompaniesJobs } from "Utils/companies";

/**
 * Route-aware faction progression loop.
 *
 * Scores ALL factions (not just joined ones) by route-relevant aug multipliers
 * divided by the rep × cost barrier to entry.  For each faction in score order:
 *   1. Join it if needed (accept pending invitation / travel to city / work for
 *      company to earn the invitation)
 *   2. Grind faction rep until every aug is unlocked
 *
 * Once INSTALL_THRESHOLD augs are available across all processed factions (or
 * all factions have been processed), delegates the entire purchase to
 * Faction/buyAugs.js — which sorts expensive-first across all factions at once
 * and handles prerequisite chains correctly — then installs.
 */

type Route = "hacking" | "physical";

const PHYSICAL_BITNODES  = new Set([2, 6, 7]);
const INSTALL_THRESHOLD  = 9;

const HACKING_STATS  = ["hacking", "hacking_exp", "hacking_chance", "hacking_speed", "hacking_money", "hacking_grow"];
const PHYSICAL_STATS = ["strength", "strength_exp", "defense", "defense_exp",
                        "dexterity", "dexterity_exp", "agility", "agility_exp"];
// Charisma speeds up rep grinding for all routes — always included in scoring.
const CHARISMA_STATS = ["charisma", "charisma_exp"];

// City the player must be in to receive a faction invitation.
const FACTION_CITY: Partial<Record<string, string>> = {
    "Sector-12":   "Sector-12",
    "Aevum":       "Aevum",
    "Chongqing":   "Chongqing",
    "New Tokyo":   "New Tokyo",
    "Ishima":      "Ishima",
    "Volhaven":    "Volhaven",
    "Tian Di Hui": "Chongqing",  // also works from Ishima / New Tokyo
};

// ── Entry point ───────────────────────────────────────────────────────────────

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.ui.openTail();
    ns.ui.resizeTail(760, 500);

    const { currentNode } = ns.getResetInfo();
    const route   = PHYSICAL_BITNODES.has(currentNode) ? "physical" : "hacking";
    const ordered = getOrderedFactions(ns, route);

    // Stop any background workForAugs daemon — we run it per-faction below.
    ns.scriptKill("Faction/workForAugs.js", "home");

    ns.print(`BitNode ${currentNode}  |  Route: ${route.toUpperCase()}`);
    ns.print("─".repeat(60));
    if (ordered.length === 0) {
        ns.print("No factions with relevant unowned augments.");
    } else {
        ns.print("Faction order:");
        const ownedAugs      = ns.singularity.getOwnedAugmentations(true);
        const playerFactions = ns.getPlayer().factions;
        for (const f of ordered) {
            const score  = scoreFaction(ns, f, route, ownedAugs);
            const joined = playerFactions.includes(f) ? "" : " ⬡ not joined";
            ns.print(`  ${f.padEnd(34)} ${score.toExponential(2)}${joined}`);
        }
    }
    ns.print("─".repeat(60));

    const processedFactions: Factions[] = [];

    // Retry every 30 s for stat/city/karma-gated factions until requirements
    // are met.  Company factions are handled inside joinFactionIfNeeded itself
    // (works continuously until the invite arrives) so they rarely retry.
    // There is no timeout — we wait as long as it takes.
    const JOIN_RETRY_MS = 30_000;

    for (const faction of ordered) {
        ns.print(`\n▶ ${faction}`);

        // Keep retrying until joined or permanently skipped (exclusive conflict).
        let joinResult: JoinResult;
        do {
            joinResult = await joinFactionIfNeeded(ns, faction);
            if (joinResult === "retry") {
                ns.print(`  ⏳ Requirements not met — retrying in ${JOIN_RETRY_MS / 1_000}s`);
                await ns.sleep(JOIN_RETRY_MS);
            }
        } while (joinResult === "retry");

        if (joinResult !== "joined") continue;

        // Grind rep until all this faction's augs are unlocked.
        ns.print("  Grinding rep...");
        const repPid = ns.run("Faction/workForAugs.js", 1, faction);
        if (repPid > 0) {
            while (ns.isRunning(repPid)) await ns.sleep(5_000);
            ns.print("  ✅ Rep targets met");
        } else {
            ns.print("  WARN: could not start workForAugs.js");
        }

        processedFactions.push(faction);

        // Check how many augs are now unlocked across all processed factions.
        // Once we hit the threshold, stop grinding more factions and go buy.
        const available = countAvailableAugs(ns, processedFactions);
        ns.print(`  Unlocked augs so far: ${available} / ${INSTALL_THRESHOLD} threshold`);

        if (available >= INSTALL_THRESHOLD) {
            ns.print(`\n⚡ ${available} augs unlocked — proceeding to buy.`);
            break;
        }
    }

    ns.print("\n" + "─".repeat(60));

    if (processedFactions.length === 0) {
        ns.print("Nothing new to install — augment cycle complete.");
        return; // init.js win-condition loop takes over
    }

    // Single buy pass across all processed factions — sorts expensive-first,
    // handles prerequisite chains, then installs and soft-resets via init.js.
    ns.print(`Buying augs from: ${processedFactions.join(", ")}`);
    const buyPid = ns.run("Faction/buyAugs.js", 1, ...processedFactions);
    if (buyPid > 0) {
        while (ns.isRunning(buyPid)) await ns.sleep(1_000);
    } else {
        ns.print("WARN: could not start buyAugs.js");
    }

    // buyAugs.js calls installAugmentations("init.js") itself, which resets the
    // game — execution below is only reached if it exited without installing
    // (e.g. nothing affordable).
    ns.print("Nothing new to install — augment cycle complete.");
}

// ── Join helpers ──────────────────────────────────────────────────────────────

/**
 * "joined"  — we are now a member
 * "skip"    — permanently impossible this cycle (exclusive-city conflict)
 * "retry"   — failed for now but should be tried again (stats too low, no hire, etc.)
 */
type JoinResult = "joined" | "skip" | "retry";

/** CompanyName the player must work for to receive a faction invitation, or null. */
function getCompanyForFaction(ns: NS, faction: Factions): CompanyName | null {
    const cn = ns.enums.CompanyName;
    const map: Partial<Record<string, CompanyName>> = {
        "ECorp":                       cn.ECorp,
        "MegaCorp":                    cn.MegaCorp,
        "Bachman & Associates":        cn.BachmanAndAssociates,
        "Blade Industries":            cn.BladeIndustries,
        "NWO":                         cn.NWO,
        "Clarke Incorporated":         cn.ClarkeIncorporated,
        "OmniTek Incorporated":        cn.OmniTekIncorporated,
        "Four Sigma":                  cn.FourSigma,
        "KuaiGong International":      cn.KuaiGongInternational,
        "Fulcrum Secret Technologies": cn.FulcrumTechnologies,
    };
    return map[faction] ?? null;
}

/** City the company HQ is in (for travel before applying). */
function getCityForCompany(ns: NS, company: CompanyName): string | null {
    const cn = ns.enums.CompanyName;
    const map: Partial<Record<string, string>> = {
        [cn.ECorp]:                 "Aevum",
        [cn.BachmanAndAssociates]:  "Aevum",
        [cn.ClarkeIncorporated]:    "Aevum",
        [cn.FulcrumTechnologies]:   "Aevum",
        [cn.MegaCorp]:              "Sector-12",
        [cn.BladeIndustries]:       "Sector-12",
        [cn.FourSigma]:             "Sector-12",
        [cn.NWO]:                   "Volhaven",
        [cn.OmniTekIncorporated]:   "Volhaven",
        [cn.KuaiGongInternational]: "Chongqing",
    };
    return map[company] ?? null;
}

/**
 * Attempts to join the given faction, taking proactive steps where possible.
 *
 * Returns:
 *   "joined" — now a member
 *   "skip"   — permanently impossible this cycle (already in a rival exclusive city faction)
 *   "retry"  — failed for now; caller should wait and try again (stats too low,
 *              can't get hired yet, waiting for stat-gated invitation, etc.)
 */
async function joinFactionIfNeeded(ns: NS, faction: Factions): Promise<JoinResult> {
    if (ns.getPlayer().factions.includes(faction)) return "joined";

    // 1. Accept any pending invitation immediately.
    if (ns.singularity.checkFactionInvitations().some(f => f === faction)) {
        ns.singularity.joinFaction(faction);
        ns.print(`  ✅ Accepted pending invitation to ${faction}`);
        return "joined";
    }

    // 2. Exclusive city factions — permanently skip if already in a rival one.
    if (isExclusiveFaction(faction)) {
        const alreadyInOne = (FactionsList as Factions[])
            .some(f => isExclusiveFaction(f) && ns.getPlayer().factions.includes(f));
        if (alreadyInOne) return "skip";
        // Not in any exclusive faction yet — fall through to city travel.
    }

    // 3. City-based faction — travel there and poll up to 30 s for the invitation.
    //    If it doesn't arrive, return "retry" so the caller waits and tries again
    //    once hacking/money requirements improve.
    const city = FACTION_CITY[faction];
    if (city) {
        if (ns.getPlayer().city !== city) {
            ns.singularity.travelToCity(city as CityName);
            ns.print(`  ✈ Traveled to ${city} for ${faction}`);
        }
        for (let i = 0; i < 30; i++) {
            if (ns.singularity.checkFactionInvitations().some(f => f === faction)) {
                ns.singularity.joinFaction(faction);
                ns.print(`  ✅ Joined ${faction}`);
                return "joined";
            }
            await ns.sleep(1_000);
        }
        ns.print(`  ⚠ ${faction} invite not received — stat/money requirements not met yet`);
        return "retry";
    }

    // 4. Company faction — travel, get hired, then work continuously until the
    //    invitation arrives.  No time limit; promotion is attempted every minute.
    //    Returns "retry" only if we cannot get hired yet (stats too low).
    const company = getCompanyForFaction(ns, faction);
    if (company !== null) {
        const companyCity = getCityForCompany(ns, company);
        if (companyCity && ns.getPlayer().city !== companyCity) {
            ns.singularity.travelToCity(companyCity as CityName);
            ns.print(`  ✈ Traveled to ${companyCity} to work for ${company}`);
        }

        // Apply in every valid field to get the best available starting position.
        const fields = CompaniesJobs(ns).find(x => x.company === company)?.jobField ?? [];
        for (const field of fields) ns.singularity.applyToCompany(company, field);

        if (!ns.getPlayer().jobs[company]) {
            ns.print(`  ⚠ Could not get hired at ${company} — will retry when stats improve`);
            return "retry";
        }

        ns.singularity.workForCompany(company, false);
        ns.print(`  🏢 Working at ${company} for ${faction} invitation...`);

        let lastPromotion = Date.now();
        while (true) {
            if (ns.singularity.checkFactionInvitations().some(f => f === faction)) {
                ns.singularity.stopAction();
                ns.singularity.joinFaction(faction);
                ns.print(`  ✅ Joined ${faction}`);
                return "joined";
            }
            // Attempt promotion every 60 s to climb to the rep threshold faster.
            if (Date.now() - lastPromotion >= 60_000) {
                for (const field of fields) ns.singularity.applyToCompany(company, field);
                ns.singularity.workForCompany(company, false);
                lastPromotion = Date.now();
            }
            await ns.sleep(5_000);
        }
    }

    // 5. No proactive strategy (stat-gated, karma-gated, end-game requirements).
    //    Return "retry" so the caller keeps polling for an invitation that arrives
    //    once the relevant requirements (hacking level, karma, installed augs) are met.
    return "retry";
}

// ── Helpers ───────────────────────────────────────────────────────────────────


/**
 * Count of unowned augs available across the given factions for which the
 * player already has sufficient rep.  Used to check the install threshold
 * without actually purchasing anything.
 */
function countAvailableAugs(ns: NS, factions: Factions[]): number {
    const owned = new Set(ns.singularity.getOwnedAugmentations(true));
    const seen  = new Set<string>();
    let count   = 0;
    for (const faction of factions) {
        const rep = ns.singularity.getFactionRep(faction);
        for (const aug of ns.singularity.getAugmentationsFromFaction(faction)) {
            if (aug === "NeuroFlux Governor") continue;
            if (owned.has(aug) || seen.has(aug)) continue;
            seen.add(aug);
            if (rep >= ns.singularity.getAugmentationRepReq(aug)) count++;
        }
    }
    return count;
}

// ── Faction ordering ──────────────────────────────────────────────────────────

/**
 * Returns ALL non-special, non-gang factions that still have unowned augs,
 * sorted by efficiency score (highest first).  Includes both joined and
 * unjoined factions — proactive joining is handled by joinFactionIfNeeded().
 */
function getOrderedFactions(ns: NS, route: Route): Factions[] {
    const ownedAugs = ns.singularity.getOwnedAugmentations(true);

    return (FactionsList as Factions[])
        .filter(f => !isSpecialFaction(f) && !isGangFaction(ns, f))
        .filter(f => hasUnownedAug(ns, f, ownedAugs))
        .map(f => ({ faction: f, score: scoreFaction(ns, f, route, ownedAugs) }))
        .sort((a, b) => b.score - a.score)
        .map(x => x.faction);
}

/** True if the faction has at least one unowned aug other than NeuroFlux Governor. */
function hasUnownedAug(ns: NS, faction: Factions, ownedAugs: string[]): boolean {
    return ns.singularity.getAugmentationsFromFaction(faction)
        .some(a => a !== "NeuroFlux Governor" && !ownedAugs.includes(a));
}

/**
 * Score = sum of per-aug (statBonus / rep / log2(cost)) for all relevant unowned augs.
 *
 * Summing per-aug rather than dividing total bonus by maxRep/maxCost prevents
 * one hard aug (high rep or price) from dragging down the score of cheap augs
 * in the same faction.  E.g. Tian Di Hui's Speech Enhancement (2.8k rep) should
 * not be penalised by Neuroreceptor Management Implant (84k rep) sitting alongside it.
 */
function scoreFaction(ns: NS, faction: Factions, route: Route, ownedAugs: string[]): number {
    const keys = [...(route === "hacking" ? HACKING_STATS : PHYSICAL_STATS), ...CHARISMA_STATS];

    const augs = ns.singularity.getAugmentationsFromFaction(faction)
        .filter(a => a !== "NeuroFlux Governor" && !ownedAugs.includes(a));

    if (augs.length === 0) return 0;

    return augs.reduce((total, aug) => {
        const stats  = ns.singularity.getAugmentationStats(aug) as unknown as Record<string, number>;
        const bonus  = keys.reduce((s, k) => s + ((stats[k] ?? 1) - 1), 0);
        if (bonus <= 0) return total;
        const rep  = Math.max(ns.singularity.getAugmentationRepReq(aug),   1);
        const cost = Math.max(ns.singularity.getAugmentationPrice(aug),     2);
        return total + bonus / rep / Math.log2(cost + 2);
    }, 0);
}
