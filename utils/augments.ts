import { NS } from "@ns";
import { Factions } from "./factions";

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
    | "Social Negotiation Assistant (S.N.A)"
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
    "Social Negotiation Assistant (S.N.A)",
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
    | "Artificial Synaptic Potentiation"
    | "Neural-Retention Enhancement"
    | "Embedded Netburner Module"
    | "Neurotrainer II"
    | "Neuralstimulator"
    | "PCMatrix"
    | "Augmented Targeting III"
    | "Combat Rib II"
    | "Combat Rib III"
    | "The Shadow's Simulacrum"
    | "BrachiBlades"
    | "Bionic Arms"
    | "NutriGen Implant"
    | "INFRARET Enhancement"
    | "Bionic Spine"
    | "Neuregen Gene Modification"
    | "CRTX42-AA Gene Modification"
    | "Cranial Signal Processors - Gen III"
    | "DermaForce Particle Barrier"
    | "Neurotrainer III"
    | "Bionic Legs"
    | "ADR-V2 Pheromone Gene"
    | "FocusWire"
    | "The Black Hand"
    | "Enhanced Myelin Sheathing"
    | "Embedded Netburner Module Core Implant"
    | "Synfibril Muscle"
    | "Enhanced Social Interaction Implant"
    | "HyperSight Corneal Implant"
    | "Synthetic Heart"
    | "Artificial Bio-neural Network Implant"
    | "PC Direct-Neural Interface"
    | "Graphene Bionic Legs Upgrade"
    | "PC Direct-Neural Interface Optimization Submodule"
    | "Graphene BrachiBlades Upgrade"
    | "NEMEAN Subdermal Weave"
    | "Graphene Bone Lacings"
    | "Embedded Netburner Module Core V2 Upgrade"
    | "SPTN-97 Gene Modification"
    | "Graphene Bionic Spine Upgrade"
    | "Embedded Netburner Module Core V3 Upgrade"
    | "Neuronal Densification"
    | "Neural Accelerator"
    | "nextSENS Gene Modification"
    | "Cranial Signal Processors - Gen V"
    | "SmartJaw"
    | "TITN-41 Gene-Modification Injection"
    | "Photosynthetic Cells"
    | "Neotra"
    | "OmniTek InfoLoad"
    | "Graphene Bionic Arms Upgrade"
    | "Xanipher"
    | "BitRunners Neurolink"
    | "CordiARC Fusion Reactor"
    | "Z.O.Ë."
    | "Unstable Circadian Modulator"
    | "Hydroflame Left Arm"
    | "QLink"

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
    "Artificial Synaptic Potentiation",
    "Neural-Retention Enhancement",
    "Embedded Netburner Module",
    "Neurotrainer II",
    "Neuralstimulator",
    "PCMatrix",
    "Augmented Targeting III",
    "Combat Rib II",
    "Combat Rib III",
    "The Shadow's Simulacrum",
    "BrachiBlades",
    "Bionic Arms",
    "NutriGen Implant",
    "INFRARET Enhancement",
    "Bionic Spine",
    "Neuregen Gene Modification",
    "CRTX42-AA Gene Modification",
    "Cranial Signal Processors - Gen III",
    "DermaForce Particle Barrier",
    "Neurotrainer III",
    "Bionic Legs",
    "ADR-V2 Pheromone Gene",
    "FocusWire",
    "The Black Hand",
    "Enhanced Myelin Sheathing",
    "Embedded Netburner Module Core Implant",
    "Synfibril Muscle",
    "Enhanced Social Interaction Implant",
    "HyperSight Corneal Implant",
    "Synthetic Heart",
    "Artificial Bio-neural Network Implant",
    "PC Direct-Neural Interface",
    "Graphene Bionic Legs Upgrade",
    "PC Direct-Neural Interface Optimization Submodule",
    "Graphene BrachiBlades Upgrade",
    "NEMEAN Subdermal Weave",
    "Graphene Bone Lacings",
    "Embedded Netburner Module Core V2 Upgrade",
    "SPTN-97 Gene Modification",
    "Graphene Bionic Spine Upgrade",
    "Embedded Netburner Module Core V3 Upgrade",
    "Neuronal Densification",
    "Neural Accelerator",
    "nextSENS Gene Modification",
    "Cranial Signal Processors - Gen V",
    "SmartJaw",
    "TITN-41 Gene-Modification Injection",
    "Photosynthetic Cells",
    "Neotra",
    "OmniTek InfoLoad",
    "Graphene Bionic Arms Upgrade",
    "Xanipher",
    "BitRunners Neurolink",
    "CordiARC Fusion Reactor",
    "Z.O.Ë.",
    "Unstable Circadian Modulator",
    "Hydroflame Left Arm",
    "QLink",
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

export function getAugmentationDetails(ns: NS) : AugmentationDetails[] {
    return Augmentations.map(aug => 
        new AugmentationDetails(
            aug,
            ns.singularity.getOwnedAugmentations(true).includes(aug),
            ns.singularity.getAugmentationBasePrice(aug),
            ns.singularity.getAugmentationRepReq(aug),
            ns.singularity.getAugmentationFactions(aug) as Factions[],
            ns.singularity.getAugmentationPrereq(aug) as Augmentation[]
        )
    );
}

export class AugmentationDetails {
    name: Augmentation;
    owned: boolean;
    cost: number;
    rep: number;
    faction: Factions[];
    preReq: Augmentation[];
    constructor(name: Augmentation, owned: boolean, cost: number, rep: number, faction: Factions[], preReq: Augmentation[]) {
        this.name = name;
        this.owned = owned;
        this.cost = cost;
        this.rep = rep;
        this.faction = faction;
        this.preReq = preReq;
    }
};