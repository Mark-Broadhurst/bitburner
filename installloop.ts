import { NS, PlayerRequirement, BackdoorRequirement, SkillRequirement } from "@ns";
import { Factions } from "./utils";

export async function main(ns: NS) {
    ns.clearLog();
    const player = ns.getPlayer();
    const currentGroup = getCurrentGroup(ns);
    for (let faction of currentGroup) {
        ns.print(`Joining ${faction}`);
        joinFaction(ns, faction);
        gainRep(ns, faction);
        buyAugs(ns, faction);
    }
    //ns.singularity.installAugmentations("installloop.js")
    ns.singularity.destroyW0r1dD43m0n(12, "startup.js");
}

function joinFaction(ns: NS, faction: Factions) {
    const requirements = ns.singularity.getFactionInviteRequirements(faction);
    for (const req of requirements) {
        ns.print(req.type);
        switch (req.type) {
            case "backdoorInstalled":
                {
                    const bd = req as BackdoorRequirement;
                    ns.run("requirement/backdoor.js", 1, bd.server);
                }
                break;
            case "skills":
                {
                    const skill = req as SkillRequirement;
                    ns.print(skill.skills);
                }
                break;
        }
    }
}

function gainRep(ns: NS, faction: Factions) {
}
function buyAugs(ns: NS, faction: Factions) {
}

function getCurrentGroup(ns: NS): Factions[] {
    const factionGroups : Factions[][] = [
        ["CyberSec", "Netburners"],
        ["Tian Di Hui", "Slum Snakes"],
        ["Sector-12", "Tetrads"],
        ["NiteSec", "The Black Hand"],
        ["Ishima", "New Tokyo", "Chongqing"],
        ["Volhaven"],
        ["The Dark Army", "The Syndicate", "Speakers for the Dead"],
        ["Bachman & Associates"],
        ["ECorp", "MegaCorp"],
        ["Blade Industries"],
        ["Clarke Incorporated"],
        ["OmniTek Incorporated"],
        ["Four Sigma"],
        ["KuaiGong International"],
        ["Fulcrum Secret Technologies"],
        ["NWO"],
        ["BitRunners", "Silhouette"],
        ["The Covenant"],
        ["Illuminati"],
        ["Daedalus"],
    ];

    const ownAugs = ns.singularity.getOwnedAugmentations(true);
    for (const factionGroup of factionGroups) {
        for (const faction of factionGroup) {
            const factionAugs = ns.singularity.getAugmentationsFromFaction(faction);
            if (!ownAugs.every(a => factionAugs.includes(a))) {
                return factionGroup as Factions[];
            }
        }
    }
    return [];
}