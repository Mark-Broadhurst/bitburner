import { NS } from "@ns";

export type Augmentation =
    | "BitWire"
    | "Synaptic Enhancement Implant"
    | "Cranial Signal Processors - Gen I"
    | "Cranial Signal Processors - Gen II"
    | "Neurotrainer I"
    | "Hacknet Node CPU Architecture Neural-Upload"
    | "Hacknet Node Cache Architecture Neural-Upload"
    | "Hacknet Node NIC Architecture Neural-Upload"
    | "Hacknet Node Kernel Direct-Neural Interface"
    | "Hacknet Node Core Direct-Neural Interface"
    | "Nanofiber Weave"
    | "Wired Reflexes"
    | "Speech Processor Implant"
    | "Neuroreceptor Management Implant"
    | "Nuoptimal Nootropic Injector Implant"
    | "Speech Enhancement"
    | "ADR-V1 Pheromone Gene"
    | "Social Negotiation Assistant (S.N.A"
    | "Augmented Targeting I"
    | "Combat Rib I"
    | "LuminCloaking-V1 Skin Implant"
    | "LuminCloaking-V2 Skin Implant"
    | "SmartSonar Implant"
    | "Augmented Targeting II"
    | "Neuralstimulator"
    | "CashRoot Starter Kit"
    | "PCMatrix"
    | "Artificial Synaptic Potentiation"
    | "Enhanced Myelin Sheathing"
    | "DataJack"
    | "Embedded Netburner Module"
    | "Embedded Netburner Module Core Implant"
    | "Cranial Signal Processors - Gen III"
    | "Cranial Signal Processors - Gen IV"
    | "The Black Hand"
    | "HemoRecirculator"
    | "Power Recirculation Core"
    | "Bionic Arms"
    | "Neural-Retention Enhancement"
    | "Neurotrainer II"
    | "CRTX42-AA Gene Modification"
    | "Artificial Bio-neural Network Implant"
    | "Embedded Netburner Module Core V2 Upgrade"
    | "Neural Accelerator"
    | "Cranial Signal Processors - Gen V"
    | "BitRunners Neurolink"
    | "INFRARET Enhancement"
    | "NutriGen Implant"
    | "Neuregen Gene Modification"
    | "Combat Rib II"
    | "DermaForce Particle Barrier"
    | "Augmented Targeting III"
    | "Combat Rib III"
    | "The Shadow's Simulacrum"
    | "Graphene Bionic Arms Upgrade"
    | "NEMEAN Subdermal Weave"
    | "Bionic Spine"
    | "Bionic Legs"
    | "BrachiBlades"
    | "Synthetic Heart"
    | "Synfibril Muscle"
    | "Unstable Circadian Modulator"
    | "Graphene BrachiBlades Upgrade"
    | "Enhanced Social Interaction Implant"
    | "FocusWire"
    | "ADR-V2 Pheromone Gene"
    | "SmartJaw"
    | "Graphene Bionic Spine Upgrade"
    | "Graphene Bionic Legs Upgrade"
    | "Embedded Netburner Module Core V3 Upgrade"
    | "Embedded Netburner Module Analyze Engine"
    | "Embedded Netburner Module Direct Memory Access Upgrade"
    | "PC Direct-Neural Interface"
    | "PC Direct-Neural Interface Optimization Submodule"
    | "ECorp HVMind Implant"
    | "CordiARC Fusion Reactor"
    | "HyperSight Corneal Implant"
    | "Neotra"
    | "Neurotrainer III"
    | "Xanipher"
    | "Hydroflame Left Arm"
    | "Neuronal Densification"
    | "nextSENS Gene Modification"
    | "OmniTek InfoLoad"
    | "Photosynthetic Cells"
    | "Graphene Bone Lacings"
    | "PC Direct-Neural Interface NeuroNet Injector"
    | "SPTN-97 Gene Modification"
    | "QLink"
    | "The Red Pill"
    | "TITN-41 Gene-Modification Injection"

export const Augmentations: Augmentation[] = [
    "BitWire",
    "Synaptic Enhancement Implant",
    "Cranial Signal Processors - Gen I",
    "Cranial Signal Processors - Gen II",
    "Neurotrainer I",
    "Hacknet Node CPU Architecture Neural-Upload",
    "Hacknet Node Cache Architecture Neural-Upload",
    "Hacknet Node NIC Architecture Neural-Upload",
    "Hacknet Node Kernel Direct-Neural Interface",
    "Hacknet Node Core Direct-Neural Interface",
    "Nanofiber Weave",
    "Wired Reflexes",
    "Speech Processor Implant",
    "Neuroreceptor Management Implant",
    "Nuoptimal Nootropic Injector Implant",
    "Speech Enhancement",
    "ADR-V1 Pheromone Gene",
    "Social Negotiation Assistant (S.N.A",
    "Augmented Targeting I",
    "Combat Rib I",
    "LuminCloaking-V1 Skin Implant",
    "LuminCloaking-V2 Skin Implant",
    "SmartSonar Implant",
    "Augmented Targeting II",
    "Neuralstimulator",
    "CashRoot Starter Kit",
    "PCMatrix",
    "Artificial Synaptic Potentiation",
    "Enhanced Myelin Sheathing",
    "DataJack",
    "Embedded Netburner Module",
    "Embedded Netburner Module Core Implant",
    "Cranial Signal Processors - Gen III",
    "Cranial Signal Processors - Gen IV",
    "The Black Hand",
    "HemoRecirculator",
    "Power Recirculation Core",
    "Bionic Arms",
    "Neural-Retention Enhancement",
    "Neurotrainer II",
    "CRTX42-AA Gene Modification",
    "Artificial Bio-neural Network Implant",
    "Embedded Netburner Module Core V2 Upgrade",
    "Neural Accelerator",
    "Cranial Signal Processors - Gen V",
    "BitRunners Neurolink",
    "INFRARET Enhancement",
    "NutriGen Implant",
    "Neuregen Gene Modification",
    "Combat Rib II",
    "DermaForce Particle Barrier",
    "Augmented Targeting III",
    "Combat Rib III",
    "The Shadow's Simulacrum",
    "Graphene Bionic Arms Upgrade",
    "NEMEAN Subdermal Weave",
    "Bionic Spine",
    "Bionic Legs",
    "BrachiBlades",
    "Synthetic Heart",
    "Synfibril Muscle",
    "Unstable Circadian Modulator",
    "Graphene BrachiBlades Upgrade",
    "Enhanced Social Interaction Implant",
    "FocusWire",
    "ADR-V2 Pheromone Gene",
    "SmartJaw",
    "Graphene Bionic Spine Upgrade",
    "Graphene Bionic Legs Upgrade",
    "Embedded Netburner Module Core V3 Upgrade",
    "Embedded Netburner Module Analyze Engine",
    "Embedded Netburner Module Direct Memory Access Upgrade",
    "PC Direct-Neural Interface",
    "PC Direct-Neural Interface Optimization Submodule",
    "ECorp HVMind Implant",
    "CordiARC Fusion Reactor",
    "HyperSight Corneal Implant",
    "Neotra",
    "Neurotrainer III",
    "Xanipher",
    "Hydroflame Left Arm",
    "Neuronal Densification",
    "nextSENS Gene Modification",
    "OmniTek InfoLoad",
    "Photosynthetic Cells",
    "Graphene Bone Lacings",
    "PC Direct-Neural Interface NeuroNet Injector",
    "SPTN-97 Gene Modification",
    "QLink",
    "The Red Pill",
    "TITN-41 Gene-Modification Injection",
];

export type SleeveAugmentation =
    | "Wired Reflexes"
    | "Neurotrainer I"
    | "LuminCloaking-V1 Skin Implant"
    | "BitWire"
    | "Augmented Targeting I"
    | "LuminCloaking-V2 Skin Implant"
    | "Cranial Signal Processors - Gen I"
    | "Speech Enhancement"
    | "ADR-V1 Pheromone Gene"
    | "Nuoptimal Nootropic Injector Implant"
    | "Combat Rib I"
    | "Social Negotiation Assistant (S.N.A)"
    | "Augmented Targeting II"
    | "HemoRecirculator"
    | "Speech Processor Implant"
    | "Cranial Signal Processors - Gen II"
    | "Power Recirculation Core"
    | "SmartSonar Implant"
    | "Nanofiber Weave"
    | "Z.O.Ë."

export const SleeveAugmentations: SleeveAugmentation[] = [
    "Wired Reflexes",
    "Neurotrainer I",
    "LuminCloaking-V1 Skin Implant",
    "BitWire",
    "Augmented Targeting I",
    "LuminCloaking-V2 Skin Implant",
    "Cranial Signal Processors - Gen I",
    "Speech Enhancement",
    "ADR-V1 Pheromone Gene",
    "Nuoptimal Nootropic Injector Implant",
    "Combat Rib I",
    "Social Negotiation Assistant (S.N.A)",
    "Augmented Targeting II",
    "HemoRecirculator",
    "Speech Processor Implant",
    "Cranial Signal Processors - Gen II",
    "Power Recirculation Core",
    "SmartSonar Implant",
    "Nanofiber Weave",
    "Z.O.Ë.",
];

export function getAugmentationsFromFaction(ns: NS, faction: string): string[] {
    return ns.singularity.getAugmentationsFromFaction(faction)
        .filter(x => x != "NeuroFlux Governor");
}

export function getAugmentationsFromFactionsExcludeOwned(ns: NS, faction: string): string[] {
    const augs = getAugmentationsFromFaction(ns, faction);
    const ownedAugs = ns.singularity.getOwnedAugmentations(true);
    return augs.filter(aug => !ownedAugs.includes(aug));
}

export function getAugmentationsExcludeOwned(ns: NS): string[] {
    const ownedAugs = ns.singularity.getOwnedAugmentations(true);
    return Augmentations.filter(aug => !ownedAugs.includes(aug));
}

export function getAugmentationDetails(ns: NS) {
    const ownedAugs = ns.singularity.getOwnedAugmentations(true);
    return Augmentations.map(aug => {
        const owned = ownedAugs.includes(aug);
        const cost = ns.singularity.getAugmentationBasePrice(aug);
        const rep = ns.singularity.getAugmentationRepReq(aug);
        const faction = ns.singularity.getAugmentationFactions(aug);
        return {
            name: aug,
            owned,
            cost,
            rep,
            faction,
        }
    });
}