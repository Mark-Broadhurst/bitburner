/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();
  const maxNodes = ns.hacknet.maxNumNodes();
  
  while(ns.hacknet.numNodes() < maxNodes) {
    if(ns.getServerMoneyAvailable("home") > ns.hacknet.getPurchaseNodeCost())
    {
      ns.toast("Buying Hacknet Node");
      ns.hacknet.purchaseNode();
    }
    await ns.sleep(1000);
  }
}