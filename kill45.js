/** @param {NS} ns */
export async function main(ns) {
    ns.singularity.commitCrime("Homicide",false);
    while(ns.getPlayer().numPeopleKilled < 45)
    {
      await ns.sleep(5000);
    }
}