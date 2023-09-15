import { NS } from "@ns";

export async function main(ns: NS) {
  ns.disableLog("ALL");
  ns.clearLog();
  let contracts = [];

  /*
    for (const server of network(ns)) {
      for (const contract of ns.ls(server.hostname, ".cct")) {
        contracts.push({
          hostname: server.hostname,
          contract: contract,
          type: ns.codingcontract.getContractType(contract, server.hostname)
        });
      }
    }
  */
  for (const contract of ns.ls("home", ".cct")) {
    contracts.push({
      hostname: "home",
      contract: contract,
      type: ns.codingcontract.getContractType(contract, "home")
    });
  }
  ns.print("Hostname\tContract\t\tType");
  for (const x of contracts) {
    ns.print(`${x.hostname}\t${x.contract}\t${x.type}`);
    switch (x.type) {
      case "Find Largest Prime Factor":
        ns.run("codecontract/largestprime.js", 1, x.hostname, x.contract);
        break;
      case "Subarray with Maximum Sum":
        ns.run("codecontract/subArrayWithMaximumSum.js", 1, x.hostname, x.contract);
        break;
      case "Total Ways to Sum":
        ns.run("codecontract/totalWaysToSum.js", 1, x.hostname, x.contract);
        break;
      case "Total Ways to Sum II":
        ns.run("codecontract/totalWaysToSum2.js", 1, x.hostname, x.contract);
        break;
      case "Spiralize Matrix":
        ns.run("codecontract/spiralizeMatrix.js", 1, x.hostname, x.contract);
        break;
      case "Array Jumping Game":
        ns.run("codecontract/arrayJumpingGame.js", 1, x.hostname, x.contract);
        break;
      case "Array Jumping Game II":
        ns.run("codecontract/arrayJumpingGame2.js", 1, x.hostname, x.contract);
        break;
      case "Merge Overlapping Intervals":
        ns.run("codecontract/mergeOverlappingIntervals.js", 1, x.hostname, x.contract);
        break;
      case "Generate IP Addresses":
        ns.run("codecontract/generateIpAddresses.js", 1, x.hostname, x.contract);
        break;
      case "Algorithmic Stock Trader I":
        ns.run("codecontract/algorithmicStockTrader.js", 1, x.hostname, x.contract);
        break;
      case "Algorithmic Stock Trader II":
        ns.run("codecontract/algorithmicStockTrader2.js", 1, x.hostname, x.contract);
        break;
      case "Algorithmic Stock Trader III":
        ns.run("codecontract/algorithmicStockTrader3.js", 1, x.hostname, x.contract);
        break;
      case "Algorithmic Stock Trader IV":
        ns.run("codecontract/algorithmicStockTrader4.js", 1, x.hostname, x.contract);
        break;
      case "Minimum Path Sum in a Triangle":
        ns.run("codecontract/minimumPathSumInATriangle.js", 1, x.hostname, x.contract);
        break;
      case "Unique Paths in a Grid I":
        ns.run("codecontract/uniquePathsInAGrid.js", 1, x.hostname, x.contract);
        break;
      case "Unique Paths in a Grid II":
        ns.run("codecontract/uniquePathsInAGrid2.js", 1, x.hostname, x.contract);
        break;
      case "Shortest Path in a Grid":
        ns.run("codecontract/shortestPathInAGrid.js", 1, x.hostname, x.contract);
        break;
      case "Sanitize Parentheses in Expression":
        ns.run("codecontract/sanitizeParentheses.js", 1, x.hostname, x.contract);
        break;
      case "Find All Valid Math Expressions":
        ns.run("codecontract/findAllValidMath.js", 1, x.hostname, x.contract);
        break;
      case "HammingCodes: Integer to Encoded Binary":
        ns.run("codecontract/hammingCodesIntToBin.js", 1, x.hostname, x.contract);
        break;
      case "HammingCodes: Encoded Binary to Integer":
        ns.run("codecontract/hammingCodesBinToInt.js", 1, x.hostname, x.contract);
        break;
      case "Proper 2-Coloring of a Graph":
        ns.run("codecontract/2ColorGraph.js", 1, x.hostname, x.contract);
        break;
      case "Compression I: RLE Compression":
        ns.run("codecontract/compression1.js", 1, x.hostname, x.contract);
        break;
      case "Compression II: LZ Decompression":
        ns.run("codecontract/compression2.js", 1, x.hostname, x.contract);
        break;
      case "Compression III: LZ Compression":
        ns.run("codecontract/compression3.js", 1, x.hostname, x.contract);
        break;
      case "Encryption I: Caesar Cipher":
        ns.run("codecontract/encryption1.js", 1, x.hostname, x.contract);
        break;
      case "Encryption II: Vigenère Cipher":
        ns.run("codecontract/encryption2.js", 1, x.hostname, x.contract);
        break;
    }
    await ns.sleep(100);
  }
}