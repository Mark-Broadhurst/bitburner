import { NS } from "@ns";


const starterAugs = [
    "CashRoot Starter Kit",
    "PCMatrix",
    "ECorp HVMind Implant",
    "nickofolas Congruity Implant",
]
const hackAugs = [
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
]
const skillAugs = [
    "Neurotrainer I",
    "Neurotrainer II",
    "Neurotrainer III",
    "Power Recirculation Core",
    "nextSENS Gene Modification",
    "Xanipher",
]
const hacknetAugs = [
    "Hacknet Node NIC Architecture Neural-Upload",
    "Hacknet Node Cache Architecture Neural-Upload",
    "Hacknet Node CPU Architecture Neural-Upload",
    "Hacknet Node Kernel Direct-Neural Interface",
    "Hacknet Node Core Direct-Neural Interface",
]
const charAugs = [
    "Speech Enhancement",
    "ADR-V1 Pheromone Gene",
    "Nuoptimal Nootropic Injector Implant",
    "Social Negotiation Assistant (S.N.A)",
    "Speech Processor Implant",
    "The Shadow's Simulacrum",
    "ADR-V2 Pheromone Gene",
    "FocusWire",
    "Enhanced Social Interaction Implant",
    "SmartJaw",
]

const combatAugs = [
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
]

const augs = [
    ...starterAugs,
    ...hackAugs,
    ...skillAugs,
    ...hacknetAugs,
    ...charAugs,
    ...combatAugs,
]

export async function main(ns: NS): Promise<void> {
    ns.clearLog();
    const listofAugs = hackAugs.filter(aug => !ns.singularity.getOwnedAugmentations(true).includes(aug));
    for (const aug of listofAugs) {
        const price = ns.grafting.getAugmentationGraftPrice(aug) + 200_000;
        const time = ns.grafting.getAugmentationGraftTime(aug);
        while(ns.getServerMoneyAvailable("home") < price){
            ns.print(`Waiting for ${aug} ${ns.formatNumber(price)} ${ns.formatNumber(ns.getServerMoneyAvailable("home"))}`);
            await ns.sleep(1000);
        }

        if(ns.getPlayer().city != ns.enums.CityName.NewTokyo){
            ns.singularity.travelToCity(ns.enums.CityName.NewTokyo);
        }
        ns.print(`Grafting ${aug} ${ns.formatNumber(price)} ${ns.tFormat(time)} `);
        ns.grafting.graftAugmentation(aug);
        await ns.sleep(time);
    }
}
