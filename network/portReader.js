/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();
  while(true){
    let portData = ns.readPort(1);
    if(portData == "NULL PORT DATA") {
      await ns.sleep(100);
      continue;
    }

    let [command,target,threads] = portData.split(",");

    switch(command){
      case "weaken":
        ns.run("hacking/threads/weaken.js",threads,target);
        break;
      case "grow":
        ns.run("hacking/threads/grow.js",threads,target);
        break;
      case "hack":
        ns.run("hacking/threads/hack.js",threads,target);
        break;
    }
    
    await ns.sleep(100);
  }
}