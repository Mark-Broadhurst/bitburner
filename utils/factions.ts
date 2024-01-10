import { NS, FactionWorkType } from '@ns';

export type Factions =
    | "Illuminati"
    | "Daedalus"
    | "The Covenant"
    | "ECorp"
    | "MegaCorp"
    | "Bachman & Associates"
    | "Blade Industries"
    | "NWO"
    | "Clarke Incorporated"
    | "OmniTek Incorporated"
    | "Four Sigma"
    | "KuaiGong International"
    | "Fulcrum Secret Technologies"
    | "BitRunners"
    | "The Black Hand"
    | "NiteSec"
    | "Aevum"
    | "Chongqing"
    | "Ishima"
    | "New Tokyo"
    | "Sector-12"
    | "Volhaven"
    | "Speakers for the Dead"
    | "The Dark Army"
    | "The Syndicate"
    | "Silhouette"
    | "Tetrads"
    | "Slum Snakes"
    | "Netburners"
    | "Tian Di Hui"
    | "CyberSec"
    | "Bladeburners"
    | "Church of the Machine God"
    | "Shadows of Anarchy"


export const FactionsList = [
    "CyberSec",
    "Netburners",
    "Tian Di Hui",
    "Slum Snakes",
    "Sector-12",
    "Aevum",
    "The Black Hand",
    "Tetrads",
    "NiteSec",
    "BitRunners",
    "Ishima",
    "New Tokyo",
    "Chongqing",
    "Volhaven",
    "The Dark Army",
    "The Syndicate",
    "Speakers for the Dead",
    "Bachman & Associates",
    "ECorp",
    "MegaCorp",
    "Blade Industries",
    "NWO",
    "Clarke Incorporated",
    "OmniTek Incorporated",
    "Four Sigma",
    "KuaiGong International",
    "Fulcrum Secret Technologies",
    "The Covenant",
    "Illuminati",
    "Daedalus",
    "Silhouette",
    "Bladeburners",
    "Church of the Machine God",
    "Shadows of Anarchy"
] as Factions[];

export function FactionWork(ns: NS): { faction: Factions, work: FactionWorkType[] }[] {
    const FactionWorkType = ns.enums.FactionWorkType;
    return [
        { faction: "Illuminati", work: [FactionWorkType.hacking, FactionWorkType.field] },
        { faction: "Daedalus", work: [FactionWorkType.hacking, FactionWorkType.field] },
        { faction: "The Covenant", work: [FactionWorkType.hacking, FactionWorkType.field] },
        { faction: "ECorp", work: [FactionWorkType.hacking, FactionWorkType.security, FactionWorkType.field] },
        { faction: "MegaCorp", work: [FactionWorkType.hacking, FactionWorkType.security, FactionWorkType.field] },
        { faction: "Bachman & Associates", work: [FactionWorkType.hacking, FactionWorkType.security, FactionWorkType.field] },
        { faction: "Blade Industries", work: [FactionWorkType.hacking, FactionWorkType.security, FactionWorkType.field] },
        { faction: "NWO", work: [FactionWorkType.hacking, FactionWorkType.security, FactionWorkType.field] },
        { faction: "Clarke Incorporated", work: [FactionWorkType.hacking, FactionWorkType.security, FactionWorkType.field] },
        { faction: "OmniTek Incorporated", work: [FactionWorkType.hacking, FactionWorkType.security, FactionWorkType.field] },
        { faction: "Four Sigma", work: [FactionWorkType.hacking, FactionWorkType.security, FactionWorkType.field] },
        { faction: "KuaiGong International", work: [FactionWorkType.hacking, FactionWorkType.security, FactionWorkType.field] },
        { faction: "Fulcrum Secret Technologies", work: [FactionWorkType.hacking, FactionWorkType.security, FactionWorkType.field] },
        { faction: "BitRunners", work: [FactionWorkType.hacking] },
        { faction: "The Black Hand", work: [FactionWorkType.hacking] },
        { faction: "NiteSec", work: [FactionWorkType.hacking] },
        { faction: "Aevum", work: [FactionWorkType.hacking, FactionWorkType.security, FactionWorkType.field] },
        { faction: "Chongqing", work: [FactionWorkType.hacking, FactionWorkType.security, FactionWorkType.field] },
        { faction: "Ishima", work: [FactionWorkType.hacking, FactionWorkType.security, FactionWorkType.field] },
        { faction: "New Tokyo", work: [FactionWorkType.hacking, FactionWorkType.security, FactionWorkType.field] },
        { faction: "Sector-12", work: [FactionWorkType.hacking, FactionWorkType.security, FactionWorkType.field] },
        { faction: "Volhaven", work: [FactionWorkType.hacking, FactionWorkType.security, FactionWorkType.field] },
        { faction: "Speakers for the Dead", work: [FactionWorkType.hacking, FactionWorkType.security, FactionWorkType.field] },
        { faction: "The Dark Army", work: [FactionWorkType.hacking, FactionWorkType.field] },
        { faction: "The Syndicate", work: [FactionWorkType.hacking, FactionWorkType.security, FactionWorkType.field] },
        { faction: "Silhouette", work: [] },
        { faction: "Tetrads", work: [FactionWorkType.security, FactionWorkType.field] },
        { faction: "Slum Snakes", work: [FactionWorkType.security, FactionWorkType.field] },
        { faction: "Netburners", work: [FactionWorkType.hacking] },
        { faction: "Tian Di Hui", work: [FactionWorkType.hacking, FactionWorkType.security] },
        { faction: "CyberSec", work: [FactionWorkType.hacking] },
        { faction: "Bladeburners", work: [] },
        { faction: "Church of the Machine God", work: [] },
        { faction: "Shadows of Anarchy", work: [] },
    ]
}

export function FactionsWithAugs(ns: NS): Factions[] {
    return ns.getPlayer().factions
        .map((faction) => faction as Factions)
        .filter(f => !isSpecialFaction(f))
        .filter(f => !isGangFaction(ns, f))
        .filter(f => hasFactionAugs(ns, f));
}

export function RegularFactions(ns: NS): Factions[] {
    return FactionsList
        .map((faction) => faction as Factions)
        .filter(f => !isSpecialFaction(f))
        .filter(f => !isGangFaction(ns, f))
}

export function PlayerRegularFactions(ns: NS): Factions[] {
    return ns.getPlayer().factions
        .map((faction) => faction as Factions)
        .sort((a, b) => {
            const aIndex = FactionsList.indexOf(a);
            const bIndex = FactionsList.indexOf(b);
            return aIndex - bIndex;
        })
        .filter(f => !isSpecialFaction(f))
        .filter(f => !isGangFaction(ns, f))
}

export function hasFactionAugs(ns: NS, faction: Factions): boolean {
    var augments = ns.singularity.getAugmentationsFromFaction(faction)
        .filter((aug) => !ns.singularity.getOwnedAugmentations(true).includes(aug));
    return augments.length > 0;
}

export function isSpecialFaction(faction: Factions): boolean {
    return faction === "Shadows of Anarchy"
        || faction === "Church of the Machine God"
        || faction === "Bladeburners";
}

export function isExclusiveFaction(faction: Factions): boolean {
    return faction === "Sector-12"
        || faction === "Aevum"
        || faction === "Chongqing"
        || faction === "Ishima"
        || faction === "New Tokyo"
        || faction === "Volhaven";
}

export function isGangFaction(ns: NS, faction: Factions): boolean {
    if (ns.gang.inGang()) {
        return faction == ns.gang.getGangInformation().faction
    } else {
        return false;
    }
}
