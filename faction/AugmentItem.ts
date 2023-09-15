import { NS } from "@ns";

export default class AugmentItem {

    faction: string;
    factionRep: number;
    augment: string;
    augmentPrice: number;
    augmentRep: number;
    requiredRep: number;

    constructor(ns: NS, faction: string, augment: string) {
        this.faction = faction;
        this.factionRep = ns.singularity.getFactionRep(faction);
        this.augment = augment;
        this.augmentPrice = ns.singularity.getAugmentationPrice(augment);
        this.augmentRep = ns.singularity.getAugmentationRepReq(augment);
        this.requiredRep = this.augmentRep - this.factionRep
        if (this.requiredRep < 0) {
            this.requiredRep = 0;
        }
    }
}