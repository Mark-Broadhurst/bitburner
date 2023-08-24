export default class NodeCosts {
    /**
     * 
     * @param {NS} ns 
     * @param {Number} index 
     */
    constructor(ns, index) {
        this.coreCost = ns.hacknet.getCoreUpgradeCost(index);
        this.cacheCost = ns.hacknet.getCacheUpgradeCost(index);
        this.levelCost = ns.hacknet.getLevelUpgradeCost(index);
        this.ramCost = ns.hacknet.getRamUpgradeCost(index);
    }
}