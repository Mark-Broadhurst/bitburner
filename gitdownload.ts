/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();
  await ns.wget("https://api.github.com/repos/mark-broadhurst/bitburner/contents/", "files.js");
  const fileContent = ns.read("files.js");
  const files = JSON.parse(fileContent);
  ns.rm("files.js");
  for(entry of files)
  {
    
  }
}