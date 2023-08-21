/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();
  const hostname = ns.args[0];
  const filename = ns.args[1];
  const data = ns.codingcontract.getData(filename, hostname);
  const answer = subArrayWithMaximumSum(data);
  const result = ns.codingcontract.attempt(answer,filename,hostname);
  ns.toast(`Solving Code Contract on ${hostname}:${filename} ${result}`)
}

function subArrayWithMaximumSum(data) {
  let max = 0;
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i];
    if (sum < 0) {
      sum = 0;
    }
    if (sum > max) {
      max = sum;
    }
  }
  return max;
}