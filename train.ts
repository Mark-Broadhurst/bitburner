import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    const flags = ns.flags([
        ["hacking",   0],
        ["strength",  0],
        ["defense",   0],
        ["dexterity", 0],
        ["agility",   0],
        ["charisma",  0],
    ]);

    const L = ns.enums.LocationName;
    const uc = ns.enums.UniversityClassType;
    const gt = ns.enums.GymType;
    const focus = true;

    const cityFacilities: Record<string, { university?: string; gym?: string }> = {
        [L.Sector12]:  { university: L.Sector12RothmanUniversity,         gym: L.Sector12PowerhouseGym         },
        [L.Aevum]:     { university: L.AevumSummitUniversity,             gym: L.AevumCrushFitnessGym          },
        [L.Volhaven]:  { university: L.VolhavenZBInstituteOfTechnology,   gym: L.VolhavenMilleniumFitnessGym   },
        [L.Chongqing]: {},
        [L.NewTokyo]:  {},
        [L.Ishima]:    {},
    };

    const city = ns.getPlayer().city;
    const fac  = cityFacilities[city] ?? {};

    if (!fac.university && ((flags.hacking as number) > 0 || (flags.charisma as number) > 0)) {
        ns.tprint(`WARN train: ${city} has no university — hacking/charisma targets skipped`);
    }
    if (!fac.gym && ((flags.strength as number) > 0 || (flags.defense as number) > 0
                  || (flags.dexterity as number) > 0 || (flags.agility as number) > 0)) {
        ns.tprint(`WARN train: ${city} has no gym — combat stat targets skipped`);
    }

    while (true) {
        const s = ns.getPlayer().skills;

        if (fac.university && s.hacking  < (flags.hacking   as number)) {
            ns.singularity.universityCourse(fac.university as any, uc.algorithms, focus);
        } else if (fac.gym && s.strength  < (flags.strength  as number)) {
            ns.singularity.gymWorkout(fac.gym as any, gt.strength,  focus);
        } else if (fac.gym && s.defense   < (flags.defense   as number)) {
            ns.singularity.gymWorkout(fac.gym as any, gt.defense,   focus);
        } else if (fac.gym && s.dexterity < (flags.dexterity as number)) {
            ns.singularity.gymWorkout(fac.gym as any, gt.dexterity, focus);
        } else if (fac.gym && s.agility   < (flags.agility   as number)) {
            ns.singularity.gymWorkout(fac.gym as any, gt.agility,   focus);
        } else if (fac.university && s.charisma < (flags.charisma as number)) {
            ns.singularity.universityCourse(fac.university as any, uc.leadership, focus);
        } else {
            ns.singularity.stopAction();
            return;
        }

        await ns.sleep(1000);
    }
}
