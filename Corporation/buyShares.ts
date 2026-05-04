import { NS } from "@ns";

export async function main(ns: NS) {
  manageShares(ns);
}


async function manageShares(ns: NS) {
  let corpInfo = ns.corporation.getCorporation();
  if (!ns.corporation.getCorporation().public) {
    return;
  }
  do {
    corpInfo = ns.corporation.getCorporation();
    const shares = Math.min(corpInfo.issuedShares, 1e9) * 1.1;
    const cash = ns.getServerMoneyAvailable("home");
    const sharesToBuy = Math.min(cash / corpInfo.sharePrice, shares);
    ns.print(`Buying back shares`);
    ns.tprint(`Buying back shares`);
    try {
      ns.corporation.buyBackShares(sharesToBuy);
    } catch (error) {
      ns.print(error);
    }
    await ns.sleep(1000);
  } while (corpInfo.issuedShares > 0);
}
