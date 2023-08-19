/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.scriptKill("hacking/hack.js", "home");
    ns.scriptKill("hacking/grow.js", "home");
    ns.scriptKill("hacking/weaken.js", "home");
    ns.scriptKill("hacking/threads/hack.js", "home");
    ns.scriptKill("hacking/threads/grow.js", "home");
    ns.scriptKill("hacking/threads/weaken.js", "home");
    ns.scriptKill("hacking/hwgw/hack.js", "home");
    ns.scriptKill("hacking/hwgw/grow.js", "home");
    ns.scriptKill("hacking/hwgw/weaken.js", "home");
    ns.scriptKill("hacking/simple.js", "home");
    ns.exec("hacking/remote.js","home");
    ns.exec("servers/refreshtargets.js","home");
    ns.exec("hacking/local.js","home");
    
}