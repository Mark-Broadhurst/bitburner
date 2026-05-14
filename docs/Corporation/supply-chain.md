# Corporation Supply Chain

## Overview

The corporation strategy is anchored on a **Restaurant** product division, supported by a full
supply chain of material-producing divisions. Each feeder division reduces the amount the
corporation has to buy from the open market, lowering costs and increasing production efficiency.

**Real Estate** (the material) cannot be produced cheaply early on, so it is purchased from the
market via `warehouseManagement` until the Real Estate division is online.

---

## Industry reference

| Industry | Produces | Requires |
|----------|----------|---------|
| Agriculture | Plants, Food | Water, Chemicals, Hardware |
| Chemical | Chemicals | Plants, Water, Hardware |
| Computer Hardware | Hardware | Metal, AI Cores |
| Fishing | Food | Hardware |
| Healthcare | *(products)* | Robots, AI Cores, Hardware, Real Estate |
| Mining | Metal, Ore, Minerals | Hardware, AI Cores, Real Estate |
| Pharmaceutical | *(products)* | Plants, Water, Chemicals |
| Real Estate | Real Estate | Hardware, Chemicals, Robots, AI Cores |
| Refinery | Metal | Ore |
| Restaurant | *(products)* | Water, Hardware, Real Estate |
| Robotics | Robots | Hardware, AI Cores |
| Software | AI Cores | Hardware, Real Estate |
| Tobacco | *(products)* | Plants, Water |
| Water Utilities | Water | Hardware, Chemicals, Real Estate |

---

## Restaurant supply chain (dependency tree)

```
Restaurant  ←  Water          (Water Utilities)
            ←  Hardware       (Computer Hardware)
            ←  Real Estate*   (Real Estate div / market)

Water Utilities  ←  Hardware ✓
                 ←  Chemicals      (Chemical)
                 ←  Real Estate* ✓

Chemical  ←  Plants    (Agriculture)
          ←  Water   ✓
          ←  Hardware ✓

Agriculture  ←  Water     ✓
             ←  Chemicals ✓   ← closes the Chemical ↔ Agriculture loop
             ←  Hardware  ✓

Computer Hardware  ←  Metal     (Mining → Refinery)
                   ←  AI Cores  (Software)

Software  ←  Hardware    ✓
          ←  Real Estate* ✓

Mining  ←  Hardware    ✓
        ←  AI Cores    ✓
        ←  Real Estate* ✓

Refinery  ←  Ore  (Mining ✓)

Robotics  ←  Hardware  ✓       ← needed to supply the Real Estate division
           ←  AI Cores  ✓

Real Estate div  ←  Hardware  ✓
                 ←  Chemicals ✓
                 ←  Robots    (Robotics ✓)
                 ←  AI Cores  ✓
```

`*` = bought from market until the Real Estate division is online.

---

## Circular dependencies

These are all resolved by buying from the market initially, then gradually replacing with
internal exports as each division comes online.

| Loop | Detail |
|------|--------|
| Chemical ↔ Agriculture | Chemical needs Plants; Agriculture needs Chemicals |
| Computer Hardware ↔ Software | Computer Hardware needs AI Cores; Software needs Hardware |
| Computer Hardware ↔ Mining | Computer Hardware needs Metal; Mining needs Hardware |

---

## Division creation order

Ordered so that each division's inputs are either already covered by an earlier division or
sourced from the market while waiting.

```
1.  Restaurant          — anchor product division
2.  Agriculture         — cheap; Plants + Food; breaks even fast
3.  Water Utilities     — Water for Restaurant, Chemical, Agriculture
4.  Chemical            — Chemicals; Plants ✓  Water ✓  closes the loop with Agriculture
5.  Computer Hardware   — Hardware for everything; buy Metal + AI Cores from market initially
6.  Mining              — Metal for Computer Hardware; Hardware ✓  also produces Ore
7.  Refinery            — converts Mining's Ore into additional Metal
8.  Software            — AI Cores for Computer Hardware + Robotics; Hardware ✓
9.  Robotics            — Robots for the Real Estate division; Hardware ✓  AI Cores ✓
10. Real Estate         — eliminates Real Estate market purchases; all inputs ✓
11. Fishing             — cheap extra Food alongside Restaurant; only needs Hardware ✓
12. Pharmaceutical      — product div; Plants ✓  Water ✓  Chemicals ✓
13. Tobacco             — product div; Plants ✓  Water ✓
14. Healthcare          — most expensive product div; all inputs ✓ by this point
```

---

## Notes

- Exact per-unit multipliers for `requiredMaterials` are runtime data from
  `ns.corporation.getIndustryData(industry).requiredMaterials` — verify in-game if tuning
  export quantities.
- `setupExports` in `officeManagement.ts` handles cross-division material routing
  automatically based on the same runtime data.
- `warehouseManagement.ts` bulk-purchases the best production-factor material (Real Estate,
  AI Cores, Hardware, or Robots) for each division — this is separate from required inputs
  and boosts production multipliers.
