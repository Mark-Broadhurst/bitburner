/** 
 * Deep scan network for hosts
 * @param {NS} ns
 * @returns {Server[]} 
 */
export default function (ns) {

  let hosts = ["home"];

  /** @param {string} item */
  function add(item) {
    if (!hosts.includes(item) && !item.startsWith("pserv-") && !item.startsWith("hacknet-server-")) {
      hosts.push(item);
    }
  }

  for (const host of hosts) {
    ns.scan(host).forEach(add);
  }

  return hosts.map(host => ns.getServer(host)).slice(1);
}