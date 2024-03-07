import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  ns.clearLog();

  if(!ns.stanek.acceptGift()){
    return;
  }
  for (let i = 0; i < ns.stanek.giftHeight(); i++) {
    for (let j = 0; j < ns.stanek.giftWidth(); j++) {
      ns.kill("charge.js", "home",i, j);
    }
  }
  
  const home = ns.getServer("home");
  const ram = home.maxRam - home.ramUsed + ns.getScriptRam("stanek/charge.js");
  const fragments = ns.stanek.activeFragments().filter(f => f.id < 100);
  const threads = Math.floor(ram / 2 / fragments.length);
  ns.print(`Running ${threads} threads for each of ${fragments.length} fragments`);
  for (let i = 0; i < fragments.length; i++) {
    const fragment = fragments[i];
    if (i == fragments.length - 1) {
      ns.spawn("charge.js", threads, fragment.x, fragment.y);
    }
    else {
      ns.run("charge.js", threads, fragment.x, fragment.y);
    }
  }
}