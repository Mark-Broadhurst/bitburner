import { NS } from "@ns";

export async function main(ns: NS) {
  ns.disableLog("ALL");
  ns.clearLog();

  const hostname = ns.args[0] as string;
  const filename = ns.args[1] as string;
  const data = ns.codingcontract.getData(filename, hostname);
  let primes = primeFactors(data);

  let result = ns.codingcontract.attempt(primes[primes.length - 1], filename, hostname);
  ns.tprint(`Solving Code Contract on ${hostname}:${filename} ${result}`)
}

function primeFactors(n: number): number[] {
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