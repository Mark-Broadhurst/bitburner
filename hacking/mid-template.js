/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();

  const player = ns.getPlayer();

  const hostname = "n00dles";
  ns.scp(["/hacking/hack.js","/hacking/grow.js","/hacking/weaken.js"], hostname, "home");
  
  while(true){
    ns.clearLog();
    let maxMoney = ns.getServerMaxMoney(hostname);
    let minSec = ns.getServerMinSecurityLevel(hostname);
    let maxSec = ns.getServerSecurityLevel(hostname);
    let sec = maxSec - minSec + 1;

    let weakTime = ns.tFormat(ns.getWeakenTime(hostname),true);
    let weakAnal = ns.weakenAnalyze(1);
    let weakThreads = Math.ceil(sec / weakAnal);

    let growAnal = ns.growthAnalyze(hostname,1);
    let growSec = ns.growthAnalyzeSecurity(1,hostname);
    let growTime = ns.tFormat(ns.getGrowTime(hostname),true);
    let growThreads = 0.8 / growSec;

    let hackAnal = ns.hackAnalyze(hostname);
    let hackChan = ns.hackAnalyzeChance(hostname);
    let hackSec = ns.hackAnalyzeSecurity(1,hostname);
    let hackTime = ns.tFormat(ns.getHackTime(hostname),true);
    let hackThreads = ns.hackAnalyzeThreads(hostname,maxMoney * 0.8);

    let totalThreads = weakThreads + growThreads + hackThreads;
    
    ns.print(`Server: ${hostname}\n`);
    ns.print(`Security: ${maxSec}\n\n`)
    ns.print(`Weaken Time: ${ns.tFormat(weakTime)}\n`);
    ns.print(`Weaken Anal: ${weakAnal}\n`);
    ns.print(`weaken Threads: ${weakThreads}\n\n`);
    ns.print(`Grow Anal: ${growAnal}\n`);
    ns.print(`Grow Sec: ${growSec}\n`);
    ns.print(`Grow Time: ${growTime}`)
    ns.print(`Grow Threads: ${growThreads}\n\n`)
    ns.print(`Hack Anal: ${ns.formatPercent(hackAnal,2)}\n`);
    ns.print(`Hack Chan: ${ns.formatPercent(hackChan,2)}\n`);
    ns.print(`Hack Sec: ${hackSec}\n`);
    ns.print(`Hack Time: ${hackTime}\n`)
    ns.print(`hack Threads: ${hackThreads}\n\n`);

    ns.print(`Total Threads: ${totalThreads}\n`);
    
    let hackRatio = ns.formatPercent(hackThreads / totalThreads,2);
    let weakRatio = ns.formatPercent(weakThreads / totalThreads,2);
    let growRatio = ns.formatPercent(growThreads / totalThreads,2);

    ns.print(`Hack Ratio: ${hackRatio}\nWeaken Ratio: ${weakRatio}\nGrow Ratio: ${growRatio}`)

    await ns.sleep(1000);
  }
}

