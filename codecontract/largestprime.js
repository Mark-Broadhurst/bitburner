/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();

  const hostname = ns.args[0];
  const filename = ns.args[1];
  const data = ns.codingcontract.getData(filename, hostname);
  let primes = primeFactors(data);
  
  let result = ns.codingcontract.attempt(primes[primes.length-1], filename, hostname);
  ns.toast(`Solving Code Contract on ${hostname}:${filename} ${result}`)
}

/** @param {number} n
 * @returns {number[]}
 */
function primeFactors(n) {
  let factors = []
  let d = 2;
  while (n > 1) {
    while (n % d == 0) {
      factors.push(d);
      n /= d;
    }
    d = d + 1;
  }

  return factors
}