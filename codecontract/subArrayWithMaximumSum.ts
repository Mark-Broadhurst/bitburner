import { NS } from "@ns";

export async function main(ns: NS) {
  ns.disableLog("ALL");
  ns.clearLog();
  const hostname = ns.args[0] as string;
  const filename = ns.args[1] as string;
  const data = ns.codingcontract.getData(filename, hostname);
  const answer = subArrayWithMaximumSum(data);
  const result = ns.codingcontract.attempt(answer, filename, hostname);
  ns.toast(`Solving Code Contract on ${hostname}:${filename} ${result}`)
}

function subArrayWithMaximumSum(data: number[]): number {
  let max = 0;
  let sum = 0;
  for (const element of data) {
    sum += element;
    if (sum < 0) {
      sum = 0;
    }
    if (sum > max) {
      max = sum;
    }
  }
  return max;
}