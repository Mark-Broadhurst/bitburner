import { NS } from "@ns";
import { getServerNames } from "Utils/network";

export async function main(ns: NS) {
  ns.disableLog("ALL");
  ns.clearLog();
  let contracts = [];

  const servers = ["home", ...getServerNames(ns)];
  for (const hostname of servers) {
    for (const contract of ns.ls(hostname, ".cct")) {
      contracts.push({
        hostname,
        contract,
        type: ns.codingcontract.getContractType(contract, hostname)
      });
    }
  }
  ns.print("Hostname\tContract\t\tType");
  for (const x of contracts) {
    ns.print(`${x.hostname}\t${x.contract}\t${x.type}`);
    switch (x.type) {
      case "Find Largest Prime Factor":
        ns.run("CodingContract/largestprime.js", 1, x.hostname, x.contract);
        break;
      case "Subarray with Maximum Sum":
        ns.run("CodingContract/subArrayWithMaximumSum.js", 1, x.hostname, x.contract);
        break;
      case "Total Ways to Sum":
        ns.run("CodingContract/totalWaysToSum.js", 1, x.hostname, x.contract);
        break;
      case "Total Ways to Sum II":
        ns.run("CodingContract/totalWaysToSum2.js", 1, x.hostname, x.contract);
        break;
      case "Spiralize Matrix":
        ns.run("CodingContract/spiralizeMatrix.js", 1, x.hostname, x.contract);
        break;
      case "Array Jumping Game":
        ns.run("CodingContract/arrayJumpingGame.js", 1, x.hostname, x.contract);
        break;
      case "Array Jumping Game II":
        ns.run("CodingContract/arrayJumpingGame2.js", 1, x.hostname, x.contract);
        break;
      case "Merge Overlapping Intervals":
        ns.run("CodingContract/mergeOverlappingIntervals.js", 1, x.hostname, x.contract);
        break;
      case "Generate IP Addresses":
        ns.run("CodingContract/generateIpAddresses.js", 1, x.hostname, x.contract);
        break;
      case "Algorithmic Stock Trader I":
        ns.run("CodingContract/algorithmicStockTrader.js", 1, x.hostname, x.contract);
        break;
      case "Algorithmic Stock Trader II":
        ns.run("CodingContract/algorithmicStockTrader2.js", 1, x.hostname, x.contract);
        break;
      case "Algorithmic Stock Trader III":
        ns.run("CodingContract/algorithmicStockTrader3.js", 1, x.hostname, x.contract);
        break;
      case "Algorithmic Stock Trader IV":
        ns.run("CodingContract/algorithmicStockTrader4.js", 1, x.hostname, x.contract);
        break;
      case "Minimum Path Sum in a Triangle":
        ns.run("CodingContract/minimumPathSumInATriangle.js", 1, x.hostname, x.contract);
        break;
      case "Unique Paths in a Grid I":
        ns.run("CodingContract/uniquePathsInAGrid.js", 1, x.hostname, x.contract);
        break;
      case "Unique Paths in a Grid II":
        ns.run("CodingContract/uniquePathsInAGrid2.js", 1, x.hostname, x.contract);
        break;
      case "Shortest Path in a Grid":
        ns.run("CodingContract/shortestPathInAGrid.js", 1, x.hostname, x.contract);
        break;
      case "Sanitize Parentheses in Expression":
        ns.run("CodingContract/sanitizeParentheses.js", 1, x.hostname, x.contract);
        break;
      case "Find All Valid Math Expressions":
        ns.run("CodingContract/findAllValidMath.js", 1, x.hostname, x.contract);
        break;
      case "HammingCodes: Integer to Encoded Binary":
        ns.run("CodingContract/hammingCodesIntToBin.js", 1, x.hostname, x.contract);
        break;
      case "HammingCodes: Encoded Binary to Integer":
        ns.run("CodingContract/hammingCodesBinToInt.js", 1, x.hostname, x.contract);
        break;
      case "Proper 2-Coloring of a Graph":
        ns.run("CodingContract/2ColorGraph.js", 1, x.hostname, x.contract);
        break;
      case "Compression I: RLE Compression":
        ns.run("CodingContract/compression1.js", 1, x.hostname, x.contract);
        break;
      case "Compression II: LZ Decompression":
        ns.run("CodingContract/compression2.js", 1, x.hostname, x.contract);
        break;
      case "Compression III: LZ Compression":
        ns.run("CodingContract/compression3.js", 1, x.hostname, x.contract);
        break;
      case "Encryption I: Caesar Cipher":
        ns.run("CodingContract/encryption1.js", 1, x.hostname, x.contract);
        break;
      case "Encryption II: Vigenère Cipher":
        ns.run("CodingContract/encryption2.js", 1, x.hostname, x.contract);
        break;
    }
    await ns.sleep(100);
  }
}