export default class ServerHackingDetail {
    hostname;
    maxRam;
    moneyMax;
    requiredHackingSkill;
    minDifficulty;
    serverGrowth;

    hackAnalyzeChance;
    hackAnalyzeSecurity;
    hackAnalyzeThreads;
    getHackTime;
    hackExp;
    hackPercent;

    growthAnalyze;
    growthAnalyzeSecurity;
    getGrowTime;
    growPercent;
    growThreads;

    weakenAnalyze;
    getWeakenTime;

    /** 
     * @param {NS} ns
     * @param {string} hostname
     */
    constructor(ns, hostname) {
        this.ns = ns;

        const server = ns.getServer(hostname);
        const player = ns.getPlayer();
        const threads = 1;
        const cores = 1;

        // Server
        this.hostname = hostname;
        this.maxRam = server.maxRam;
        this.moneyMax = server.moneyMax;
        this.requiredHackingSkill = server.requiredHackingSkill;
        this.minDifficulty = server.minDifficulty;
        this.serverGrowth = server.serverGrowth;

        // Hack
        this.hackAnalyzeChance = ns.hackAnalyzeChance(hostname);
        this.hackAnalyzeSecurity = ns.hackAnalyzeSecurity(threads, hostname);
        this.hackAnalyzeThreads = ns.hackAnalyzeThreads(hostname, server.moneyAvailable * 0.8);
        this.getHackTime = ns.getHackTime(hostname);

        this.hackExp = ns.formulas.hacking.hackExp(server, player);
        this.hackPercent = ns.formulas.hacking.hackPercent(server, player);

        // Grow
        this.growthAnalyze = ns.growthAnalyze(hostname, server.serverGrowth, cores);
        this.growthAnalyzeSecurity = ns.growthAnalyzeSecurity(threads, hostname, cores);
        this.getGrowTime = ns.getGrowTime(hostname);

        this.growPercent = ns.formulas.hacking.growPercent(server, threads, player, cores);
        this.growThreads = ns.formulas.hacking.growThreads(server, player, server.moneyAvailable * 0.8, cores);

        // Weaken
        this.weakenAnalyze = ns.weakenAnalyze(threads, cores);
        this.getWeakenTime = ns.getWeakenTime(hostname);

        this.totalTime = this.getHackTime + this.getGrowTime + this.getWeakenTime;
    }

    formatString() {
        return [
            this.hostname.padEnd(15),
            this.ns.formatRam(this.maxRam,0).padEnd(5),
            this.ns.formatNumber(this.moneyMax,2),
            this.requiredHackingSkill,
            this.minDifficulty,
            this.serverGrowth,
            this.ns.formatPercent(this.hackAnalyzeChance),
            this.hackAnalyzeSecurity,
            Math.round(this.hackAnalyzeThreads),
            Math.round(this.getHackTime / 1000),
            Math.round(this.hackExp),
            this.ns.formatPercent(this.hackPercent),
            Math.round(this.growthAnalyze),
            this.growthAnalyzeSecurity,
            Math.round(this.getGrowTime / 1000),
            this.ns.formatPercent(this.growPercent),
            this.growThreads,
            this.weakenAnalyze,
            Math.round(this.getWeakenTime / 1000),
            Math.round(this.totalTime / 1000)
        ].join("\t");
    }
}