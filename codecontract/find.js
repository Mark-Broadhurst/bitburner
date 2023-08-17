import network from "./network/scan";

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("scan");
  ns.clearLog();
  let contracts = [];

  ns.codingcontract.createDummyContract("Subarray with Maximum Sum");


  for (const server of network(ns)) {
    for (const contract of ns.ls(server.hostname, ".cct")) {
      contracts.push({
        hostname: server.hostname,
        contract: contract,
        type: ns.codingcontract.getContractType(contract, server.hostname)
      });
    }
  }

  for (const contract of ns.ls("home", ".cct")) {
    contracts.push({
      hostname: "home",
      contract: contract,
      type: ns.codingcontract.getContractType(contract, "home")
    });
  }

  for (const x of contracts) {
    ns.print(x.hostname + " : " + x.contract + " : " + x.type);
    /*
    switch (x.type) {
      case "Find Largest Prime Factor":
        ns.exec("codecontract/largestprime.js", "home", 1, x.hostname, x.contract);
        break;
      case "Subarray with Maximum Sum":
        ns.exec("codecontract/subArrayWithMaximumSum.js", "home", 1, x.hostname, x.contract);
        break;
      case "Total Ways to Sum":
        //ns.exec("codecontract/totalWaysToSum.js", "home", 1, x.hostname, x.contract);
        break;
      case "Total Ways to Sum II":
        //ns.exec("codecontract/totalWaysToSum2.js", "home", 1, x.hostname, x.contract);
        break;
      case "Spiralize Matrix":
        //ns.exec("codecontract/spiralizeMatrix.js", "home", 1, x.hostname, x.contract);
        break;
      case "Array Jumping Game":
        //ns.exec("codecontract/arrayJumpingGame.js", "home", 1, x.hostname, x.contract);
        break;
      case "Array Jumping Game II":
        //ns.exec("codecontract/arrayJumpingGame2.js", "home", 1, x.hostname, x.contract);
        break;
      case "Merge Overlapping Intervals":
        //ns.exec("codecontract/mergeOverlappingIntervals.js", "home", 1, x.hostname, x.contract);
        break;
      case "Generate IP Addresses":
        //ns.exec("codecontract/generateIpAddresses.js", "home", 1, x.hostname, x.contract);
        break;
      case "Algorithmic Stock Trader I":
        //ns.exec("codecontract/algorithmicStockTrader.js", "home", 1, x.hostname, x.contract);
        break;
      case "Algorithmic Stock Trader II":
        //ns.exec("codecontract/algorithmicStockTrader2.js", "home", 1, x.hostname, x.contract);
        break;
      case "Algorithmic Stock Trader III":
        //ns.exec("codecontract/algorithmicStockTrader3.js", "home", 1, x.hostname, x.contract);
        break;
      case "Algorithmic Stock Trader IV":
        //ns.exec("codecontract/algorithmicStockTrader4.js", "home", 1, x.hostname, x.contract);
        break;
      case "Minimum Path Sum in a Triangle":
        //ns.exec("codecontract/minimumPathSumInATriangle.js", "home", 1, x.hostname, x.contract);
        break;
      case "Unique Paths in a Grid I":
        //ns.exec("codecontract/uniquePathsInAGrid.js", "home", 1, x.hostname, x.contract);
        break;
      case "Unique Paths in a Grid II":
        //ns.exec("codecontract/uniquePathsInAGrid2.js", "home", 1, x.hostname, x.contract);
        break;
      case "Shortest Path in a Grid":
        //ns.exec("codecontract/shortestPathInAGrid.js", "home", 1, x.hostname, x.contract);
        break;
      case "Sanitize Parentheses in Expression":
        //ns.exec("codecontract/sanitizeParentheses.js", "home", 1, x.hostname, x.contract);
        break;
      case "Find All Valid Math Expressions":
        //ns.exec("codecontract/findAllValidMath.js", "home", 1, x.hostname, x.contract);
        break;
      case "HammingCodes: Integer to Encoded Binary":
        //ns.exec("codecontract/hammingCodesIntToBin.js", "home", 1, x.hostname, x.contract);
        break;
      case "HammingCodes: Encoded Binary to Integer":
        //ns.exec("codecontract/hammingCodesBinToInt.js", "home", 1, x.hostname, x.contract);
        break;
      case "Proper 2-Coloring of a Graph":
        //ns.exec("codecontract/2ColorGraph.js", "home", 1, x.hostname, x.contract);
        break;
      case "Compression I: RLE Compression":
        //ns.exec("codecontract/compression1.js", "home", 1, x.hostname, x.contract);
        break;
      case "Compression II: LZ Decompression":
        //ns.exec("codecontract/compression2.js", "home", 1, x.hostname, x.contract);
        break;
      case "Compression III: LZ Compression":
        //ns.exec("codecontract/compression3.js", "home", 1, x.hostname, x.contract);
        break;
      case "Encryption I: Caesar Cipher":
        //ns.exec("codecontract/encryption1.js", "home", 1, x.hostname, x.contract);
        break;
      case "Encryption II: Vigenère Cipher":
        //ns.exec("codecontract/encryption2.js", "home", 1, x.hostname, x.contract);
        break;
    }
    */
  }
}