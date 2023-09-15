/** @param {NS} ns */
export async function main(ns) {
	ns.clearLog();
	ns.disableLog('ALL');
	ns.tail();

}