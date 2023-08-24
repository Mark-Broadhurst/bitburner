/** 
 * @param {NS} ns
 * @returns {number}
 */
export default function getHashLimit (ns) {
  const nodeCount = ns.hacknet.numNodes();
  let hashCap = 0;
  for(let i  = 0; i < nodeCount; i++)
  {
    const node = ns.hacknet.getNodeStats(i);
    hashCap += node.hashCapacity;
  }
  return hashCap;
}
