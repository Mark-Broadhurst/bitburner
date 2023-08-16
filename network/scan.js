/** 
 * Deep scan network for hosts
 * @param {NS} ns
 * @returns {Array} 
 */
export default function (ns) {

  let hosts = ["home"];

  /** @param {string} item */
  function add(item) {
    if (!hosts.includes(item) && !item.startsWith("pserv-")) {
      hosts.push(item);
    }
  }

  for (let i = 0; i < hosts.length; i++) {
    ns.scan(hosts[i]).forEach(add);
  }

  return hosts.map(host => ns.getServer(host)).slice(1);
}