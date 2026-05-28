import { NS, CityName, CompanyName } from "@ns";
import { FactionsList, isSpecialFaction, isGangFaction, isExclusiveFaction, Factions } from "Utils/factions";
import { CompaniesJobs } from "Utils/companies";

type Route = "hacking" | "physical";

const PHYSICAL_BITNODES  = new Set([2, 6, 7]);
const INSTALL_THRESHOLD  = 9;

const HACKING_STATS  = ["hacking", "hacking_exp", "hacking_chance", "hacking_speed", "hacking_money", "hacking_grow"];
const PHYSICAL_STATS = ["strength", "strength_exp", "defense", "defense_exp",
                        "dexterity", "dexterity_exp", "agility", "agility_exp"];
const CHARISMA_STATS = ["charisma", "charisma_exp"];

const FACTION_CITY: Partial<Record<string, string>> = {
    "Sector-12":   "Sector-12",
    "Aevum":       "Aevum",
    "Chongqing":   "Chongqing",
    "New Tokyo":   "New Tokyo",
    "Ishima":      "Ishima",
    "Volhaven":    "Volhaven",
    "Tian Di Hui": "Chongqing",
};

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.ui.openTail();
    ns.ui.resizeTail(760, 500);

    const { currentNode } = ns.getResetInfo();
    const route   = PHYSICAL_BITNODES.has(currentNode) ? "physical" : "hacking";
    const ordered = getOrderedFactions(ns, route);

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

    const JOIN_RETRY_MS = 30_000;

    for (const faction of ordered) {
        ns.print(`\n▶ ${faction}`);

        let joinResult: JoinResult;
        do {
            joinResult = await joinFactionIfNeeded(ns, faction);
            if (joinResult === "retry") {
                ns.print(`  ⏳ Requirements not met — retrying in ${JOIN_RETRY_MS / 1_000}s`);
                await ns.sleep(JOIN_RETRY_MS);
            }
        } while (joinResult === "retry");

        if (joinResult !== "joined") continue;

        ns.print("  Grinding rep...");
        const repPid = ns.run("Faction/workForAugs.js", 1, faction);
        if (repPid > 0) {
            while (ns.isRunning(repPid)) await ns.sleep(5_000);
            ns.print("  ✅ Rep targets met");
        } else {
            ns.print("  WARN: could not start workForAugs.js");
        }

        processedFactions.push(faction);

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
        return;
    }

    ns.print(`Buying augs from: ${processedFactions.join(", ")}`);
    const buyPid = ns.run("Faction/buyAugs.js", 1, ...processedFactions);
    if (buyPid > 0) {
        while (ns.isRunning(buyPid)) await ns.sleep(1_000);
    } else {
        ns.print("WARN: could not start buyAugs.js");
    }

    ns.print("Nothing new to install — augment cycle complete.");
}

type JoinResult = "joined" | "skip" | "retry";

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

async function joinFactionIfNeeded(ns: NS, faction: Factions): Promise<JoinResult> {
    if (ns.getPlayer().factions.includes(faction)) return "joined";

    if (ns.singularity.checkFactionInvitations().some(f => f === faction)) {
        ns.singularity.joinFaction(faction);
        ns.print(`  ✅ Accepted pending invitation to ${faction}`);
        return "joined";
    }

    if (isExclusiveFaction(faction)) {
        const alreadyInOne = (FactionsList as Factions[])
            .some(f => isExclusiveFaction(f) && ns.getPlayer().factions.includes(f));
        if (alreadyInOne) return "skip";
    }

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

    const company = getCompanyForFaction(ns, faction);
    if (company !== null) {
        const companyCity = getCityForCompany(ns, company);
        if (companyCity && ns.getPlayer().city !== companyCity) {
            ns.singularity.travelToCity(companyCity as CityName);
            ns.print(`  ✈ Traveled to ${companyCity} to work for ${company}`);
        }

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
            if (Date.now() - lastPromotion >= 60_000) {
                for (const field of fields) ns.singularity.applyToCompany(company, field);
                ns.singularity.workForCompany(company, false);
                lastPromotion = Date.now();
            }
            await ns.sleep(5_000);
        }
    }

    return "retry";
}

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

function getOrderedFactions(ns: NS, route: Route): Factions[] {
    const ownedAugs = ns.singularity.getOwnedAugmentations(true);

    return (FactionsList as Factions[])
        .filter(f => !isSpecialFaction(f) && !isGangFaction(ns, f))
        .filter(f => hasUnownedAug(ns, f, ownedAugs))
        .map(f => ({ faction: f, score: scoreFaction(ns, f, route, ownedAugs) }))
        .sort((a, b) => b.score - a.score)
        .map(x => x.faction);
}

function hasUnownedAug(ns: NS, faction: Factions, ownedAugs: string[]): boolean {
    return ns.singularity.getAugmentationsFromFaction(faction)
        .some(a => a !== "NeuroFlux Governor" && !ownedAugs.includes(a));
}

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
