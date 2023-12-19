import { NS, FactionWorkType } from '@ns';

export enum Factions {
    Illuminati = "Illuminati",
    Daedalus = "Daedalus",
    TheCovenant = "The Covenant",
    ECorp = "ECorp",
    MegaCorp = "MegaCorp",
    BachmanAndAssociates = "Bachman & Associates",
    BladeIndustries = "Blade Industries",
    NWO = "NWO",
    ClarkeIncorporated = "Clarke Incorporated",
    OmniTekIncorporated = "OmniTek Incorporated",
    FourSigma = "Four Sigma",
    KuaiGongInternational = "KuaiGong International",
    FulcrumSecretTechnologies = "Fulcrum Secret Technologies",
    BitRunners = "BitRunners",
    TheBlackHand = "The Black Hand",
    NiteSec = "NiteSec",
    Aevum = "Aevum",
    Chongqing = "Chongqing",
    Ishima = "Ishima",
    NewTokyo = "New Tokyo",
    Sector12 = "Sector-12",
    Volhaven = "Volhaven",
    SpeakersForTheDead = "Speakers for the Dead",
    TheDarkArmy = "The Dark Army",
    TheSyndicate = "The Syndicate",
    Silhouette = "Silhouette",
    Tetrads = "Tetrads",
    SlumSnakes = "Slum Snakes",
    Netburners = "Netburners",
    TianDiHui = "Tian Di Hui",
    CyberSec = "CyberSec",
    Bladeburners = "Bladeburners",
    ChurchOfTheMachineGod = "Church of the Machine God",
    ShadowsOfAnarchy = "Shadows of Anarchy",
}

export const FactionsList = [
    Factions.Illuminati,
    Factions.Daedalus,
    Factions.TheCovenant,
    Factions.ECorp,
    Factions.MegaCorp,
    Factions.BachmanAndAssociates,
    Factions.BladeIndustries,
    Factions.NWO,
    Factions.ClarkeIncorporated,
    Factions.OmniTekIncorporated,
    Factions.FourSigma,
    Factions.KuaiGongInternational,
    Factions.FulcrumSecretTechnologies,
    Factions.BitRunners,
    Factions.TheBlackHand,
    Factions.NiteSec,
    Factions.Aevum,
    Factions.Chongqing,
    Factions.Ishima,
    Factions.NewTokyo,
    Factions.Sector12,
    Factions.Volhaven,
    Factions.SpeakersForTheDead,
    Factions.TheDarkArmy,
    Factions.TheSyndicate,
    Factions.Silhouette,
    Factions.Tetrads,
    Factions.SlumSnakes,
    Factions.Netburners,
    Factions.TianDiHui,
    Factions.CyberSec,
    Factions.Bladeburners,
    Factions.ChurchOfTheMachineGod,
    Factions.ShadowsOfAnarchy,
];

export const RegularFactions = [
    Factions.Illuminati,
    Factions.Daedalus,
    Factions.TheCovenant,
    Factions.ECorp,
    Factions.MegaCorp,
    Factions.BachmanAndAssociates,
    Factions.BladeIndustries,
    Factions.NWO,
    Factions.ClarkeIncorporated,
    Factions.OmniTekIncorporated,
    Factions.FourSigma,
    Factions.KuaiGongInternational,
    Factions.FulcrumSecretTechnologies,
    Factions.BitRunners,
    Factions.TheBlackHand,
    Factions.NiteSec,
    Factions.Aevum,
    Factions.Chongqing,
    Factions.Ishima,
    Factions.NewTokyo,
    Factions.Sector12,
    Factions.Volhaven,
    Factions.SpeakersForTheDead,
    Factions.TheDarkArmy,
    Factions.TheSyndicate,
    Factions.Silhouette,
    Factions.Tetrads,
    Factions.SlumSnakes,
    Factions.Netburners,
    Factions.TianDiHui,
    Factions.CyberSec,
];

export const FactionsToJoin = [
    Factions.Illuminati,
    Factions.Daedalus,
    Factions.TheCovenant,
    Factions.ECorp,
    Factions.MegaCorp,
    Factions.BachmanAndAssociates,
    Factions.BladeIndustries,
    Factions.NWO,
    Factions.ClarkeIncorporated,
    Factions.OmniTekIncorporated,
    Factions.FourSigma,
    Factions.KuaiGongInternational,
    Factions.FulcrumSecretTechnologies,
    Factions.BitRunners,
    Factions.TheBlackHand,
    Factions.NiteSec,
    Factions.SpeakersForTheDead,
    Factions.TheDarkArmy,
    Factions.TheSyndicate,
    Factions.Silhouette,
    Factions.Tetrads,
    Factions.SlumSnakes,
    Factions.Netburners,
    Factions.TianDiHui,
    Factions.CyberSec,
    Factions.Bladeburners,
    Factions.ChurchOfTheMachineGod,
    Factions.ShadowsOfAnarchy,
];

export function FactionWork(ns: NS): { faction: Factions, work: FactionWorkType[] }[] {
    const FactionWorkType = ns.enums.FactionWorkType;
    return [
        { faction: Factions.Illuminati, work: [FactionWorkType.hacking, FactionWorkType.field] },
        { faction: Factions.Daedalus, work: [FactionWorkType.hacking, FactionWorkType.field] },
        { faction: Factions.TheCovenant, work: [FactionWorkType.hacking, FactionWorkType.field] },
        { faction: Factions.ECorp, work: [FactionWorkType.hacking, FactionWorkType.security, FactionWorkType.field] },
        { faction: Factions.MegaCorp, work: [FactionWorkType.hacking, FactionWorkType.security, FactionWorkType.field] },
        { faction: Factions.BachmanAndAssociates, work: [FactionWorkType.hacking, FactionWorkType.security, FactionWorkType.field] },
        { faction: Factions.BladeIndustries, work: [FactionWorkType.hacking, FactionWorkType.security, FactionWorkType.field] },
        { faction: Factions.NWO, work: [FactionWorkType.hacking, FactionWorkType.security, FactionWorkType.field] },
        { faction: Factions.ClarkeIncorporated, work: [FactionWorkType.hacking, FactionWorkType.security, FactionWorkType.field] },
        { faction: Factions.OmniTekIncorporated, work: [FactionWorkType.hacking, FactionWorkType.security, FactionWorkType.field] },
        { faction: Factions.FourSigma, work: [FactionWorkType.hacking, FactionWorkType.security, FactionWorkType.field] },
        { faction: Factions.KuaiGongInternational, work: [FactionWorkType.hacking, FactionWorkType.security, FactionWorkType.field] },
        { faction: Factions.FulcrumSecretTechnologies, work: [FactionWorkType.hacking, FactionWorkType.security, FactionWorkType.field] },
        { faction: Factions.BitRunners, work: [FactionWorkType.hacking] },
        { faction: Factions.TheBlackHand, work: [FactionWorkType.hacking] },
        { faction: Factions.NiteSec, work: [FactionWorkType.hacking] },
        { faction: Factions.Aevum, work: [FactionWorkType.hacking, FactionWorkType.security, FactionWorkType.field] },
        { faction: Factions.Chongqing, work: [FactionWorkType.hacking, FactionWorkType.security, FactionWorkType.field] },
        { faction: Factions.Ishima, work: [FactionWorkType.hacking, FactionWorkType.security, FactionWorkType.field] },
        { faction: Factions.NewTokyo, work: [FactionWorkType.hacking, FactionWorkType.security, FactionWorkType.field] },
        { faction: Factions.Sector12, work: [FactionWorkType.hacking, FactionWorkType.security, FactionWorkType.field] },
        { faction: Factions.Volhaven, work: [FactionWorkType.hacking, FactionWorkType.security, FactionWorkType.field] },
        { faction: Factions.SpeakersForTheDead, work: [FactionWorkType.hacking, FactionWorkType.security, FactionWorkType.field] },
        { faction: Factions.TheDarkArmy, work: [FactionWorkType.hacking, FactionWorkType.field] },
        { faction: Factions.TheSyndicate, work: [FactionWorkType.hacking, FactionWorkType.security, FactionWorkType.field] },
        { faction: Factions.Silhouette, work: [] },
        { faction: Factions.Tetrads, work: [FactionWorkType.security, FactionWorkType.field] },
        { faction: Factions.SlumSnakes, work: [FactionWorkType.security, FactionWorkType.field] },
        { faction: Factions.Netburners, work: [FactionWorkType.hacking] },
        { faction: Factions.TianDiHui, work: [FactionWorkType.hacking, FactionWorkType.security] },
        { faction: Factions.CyberSec, work: [FactionWorkType.hacking] },
        { faction: Factions.Bladeburners, work: [] },
        { faction: Factions.ChurchOfTheMachineGod, work: [] },
        { faction: Factions.ShadowsOfAnarchy, work: [] },
    ]
}

export function FactionsWithAugs(ns: NS): Factions[] {
    return ns.getPlayer().factions
        .map((faction) => faction as Factions)
        .filter((faction) => faction != Factions.ShadowsOfAnarchy)
        .filter((faction) => faction != Factions.ChurchOfTheMachineGod)
        .filter((faction) => faction != Factions.Bladeburners)
        .filter((faction) => {
            if(ns.gang.inGang()) { 
                return faction != ns.gang.getGangInformation().faction
            } else {
                return true;
            }
        })
        .filter((faction) => hasFactionAugs(ns, faction));
}

export function hasFactionAugs(ns: NS, faction: Factions): boolean {
    var augments = ns.singularity.getAugmentationsFromFaction(faction)
        .filter((aug) =>  !ns.singularity.getOwnedAugmentations(true).includes(aug));
    return augments.length > 0;
}