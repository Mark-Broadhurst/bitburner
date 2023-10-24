import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  const now = performance.now;
  try {
    performance.now = () => -1;
    while (true) {
      await ns.sleep(1000);
    }
  }
  finally {
    performance.now = now;
  }
}
