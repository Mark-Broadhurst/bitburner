import { NS, Multipliers } from "@ns";

export const VIOLET_CONGRUITY = "Violet Congruity Implant";

export type Path = "hacking" | "physical";

export const HACKING_STATS: (keyof Multipliers)[] = [
    "hacking", "hacking_exp", "hacking_chance", "hacking_speed", "hacking_money", "hacking_grow",
];

export const PHYSICAL_STATS: (keyof Multipliers)[] = [
    "strength", "strength_exp",
    "defense",  "defense_exp",
    "agility",  "agility_exp",
    "dexterity","dexterity_exp",
];

export const augs = [
    "CashRoot Starter Kit",
    "PCMatrix",
    "ECorp HVMind Implant",
    "nickofolas Congruity Implant",
    "Neurotrainer I",
    "Neurotrainer II",
    "Neurotrainer III",
    "Power Recirculation Core",
    "nextSENS Gene Modification",
    "Xanipher",
    "Synaptic Enhancement Implant",
    "BitWire",
    "Cranial Signal Processors - Gen I",
    "Artificial Synaptic Potentiation",
    "Cranial Signal Processors - Gen II",
    "CRTX42-AA Gene Modification",
    "Neural-Retention Enhancement",
    "Embedded Netburner Module",
    "DataJack",
    "Cranial Signal Processors - Gen III",
    "The Black Hand",
    "Cranial Signal Processors - Gen IV",
    "Enhanced Myelin Sheathing",
    "Cranial Signal Processors - Gen V",
    "Embedded Netburner Module Core Implant",
    "OmniTek InfoLoad",
    "Artificial Bio-neural Network Implant",
    "Neuralstimulator",
    "PC Direct-Neural Interface",
    "BitRunners Neurolink",
    "Embedded Netburner Module Core V2 Upgrade",
    "PC Direct-Neural Interface Optimization Submodule",
    "Embedded Netburner Module Analyze Engine",
    "Embedded Netburner Module Direct Memory Access Upgrade",
    "Embedded Netburner Module Core V3 Upgrade",
    "PC Direct-Neural Interface NeuroNet Injector",
    "QLink",
    "Wired Reflexes",
    "NutriGen Implant",
    "LuminCloaking-V1 Skin Implant",
    "Augmented Targeting I",
    "Combat Rib I",
    "LuminCloaking-V2 Skin Implant",
    "INFRARET Enhancement",
    "Augmented Targeting II",
    "HemoRecirculator",
    "DermaForce Particle Barrier",
    "Combat Rib II",
    "SmartSonar Implant",
    "BrachiBlades",
    "Augmented Targeting III",
    "Combat Rib III",
    "Nanofiber Weave",
    "Bionic Spine",
    "TITN-41 Gene-Modification Injection",
    "Bionic Arms",
    "Bionic Legs",
    "Neuregen Gene Modification",
    "Neuroreceptor Management Implant",
    "Synfibril Muscle",
    "Neuronal Densification",
    "Neural Accelerator",
    "Graphene BrachiBlades Upgrade",
    "HyperSight Corneal Implant",
    "Photosynthetic Cells",
    "Synthetic Heart",
    "Neotra",
    "NEMEAN Subdermal Weave",
    "Graphene Bionic Arms Upgrade",
    "Graphene Bone Lacings",
    "Graphene Bionic Legs Upgrade",
    "SPTN-97 Gene Modification",
    "CordiARC Fusion Reactor",
    "Unstable Circadian Modulator",
    "Graphene Bionic Spine Upgrade",
    "Hydroflame Left Arm",
    "The Blade's Simulacrum",
    "EsperTech Bladeburner Eyewear",
    "EMS-4 Recombination",
    "ORION-MKIV Shoulder",
    "Blade's Runners",
    "GOLEM Serum",
    "I.N.T.E.R.L.I.N.K.E.D",
    "Hyperion Plasma Cannon V1",
    "Hyperion Plasma Cannon V2",
    "Vangelis Virus",
    "Vangelis Virus 3.0",
    "BLADE-51b Tesla Armor",
    "BLADE-51b Tesla Armor: Power Cells Upgrade",
    "BLADE-51b Tesla Armor: Energy Shielding Upgrade",
    "BLADE-51b Tesla Armor: Unibeam Upgrade",
    "BLADE-51b Tesla Armor: Omnibeam Upgrade",
    "BLADE-51b Tesla Armor: IPU Upgrade",
];

export function isWorthGrafting(ns: NS, aug: string, path: Path): boolean {
    if (aug === VIOLET_CONGRUITY) return true;
    const stats     = ns.singularity.getAugmentationStats(aug);
    const pathStats = path === "hacking" ? HACKING_STATS : PHYSICAL_STATS;
    return pathStats.some(stat => stats[stat] > 1.01);
}

export function buildPhase1(ns: NS, path: Path): string[] {
    const graftable = new Set(ns.grafting.getGraftableAugmentations());
    const owned     = ns.singularity.getOwnedAugmentations(true);
    const list = augs
        .filter(aug => aug !== VIOLET_CONGRUITY && !owned.includes(aug) && graftable.has(aug) && isWorthGrafting(ns, aug, path))
        .map(aug => ({ aug, price: ns.grafting.getAugmentationGraftPrice(aug) }))
        .sort((a, b) => a.price - b.price)
        .map(({ aug }) => aug);
    if (graftable.has(VIOLET_CONGRUITY) && !owned.includes(VIOLET_CONGRUITY)) {
        list.push(VIOLET_CONGRUITY);
    }
    return list;
}

export function buildPhase2(ns: NS, alreadyCounted: string[] = []): string[] {
    const owned   = ns.singularity.getOwnedAugmentations(true);
    const exclude = new Set([...owned, ...alreadyCounted]);
    return ns.grafting.getGraftableAugmentations()
        .filter(aug => !exclude.has(aug))
        .map(aug => ({ aug, time: ns.grafting.getAugmentationGraftTime(aug) }))
        .sort((a, b) => a.time - b.time)
        .map(({ aug }) => aug);
}
