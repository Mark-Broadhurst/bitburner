/** 
 * @param {NS} ns
 * @returns {number}
 */
export function getHashLimit (ns) {
  return forEachNode(ns, node => node.hashCapacity);
} 


/** 
 * @param {NS} ns
 * @returns {number}
 */
export function getHashProduction (ns) {
  return forEachNode(ns, node => node.production);
} 

function forEachNode(ns, callback) {
  const nodeCount = ns.hacknet.numNodes();
  let acc = 0;
  for(let i  = 0; i < nodeCount; i++)
  {
    const node = ns.hacknet.getNodeStats(i);
    acc += callback(node);
  }
  return acc;
}
