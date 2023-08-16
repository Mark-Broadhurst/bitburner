/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();
  const hostname = ns.args[0];
  const filename = ns.args[1];
  const data = ns.codingcontract.getData(filename, hostname);
  
  ns.print(ns.codingcontract.getDescription(filename, hostname));
}