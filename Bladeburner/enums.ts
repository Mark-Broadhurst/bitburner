import { BladeburnerActionType, BladeburnerActionName, BladeburnerGeneralActionName, BladeburnerContractName, BladeburnerOperationName, BladeburnerBlackOpName, BladeburnerSkillName } from "@ns";

// Re-export the @ns types so callers can import from one place
export type { BladeburnerActionType, BladeburnerContractName, BladeburnerOperationName, BladeburnerBlackOpName };

// General action names — not exposed via ns.enums, so kept here as a convenience
export type Action = BladeburnerGeneralActionName;

export const actions: Action[] = [
    "Training", "Field Analysis", "Recruitment",
    "Diplomacy", "Hyperbolic Regeneration Chamber", "Incite Violence",
];

export type BlackOp = BladeburnerBlackOpName;

export const blackOps: BlackOp[] = [
    "Operation Typhoon", "Operation Zero", "Operation X", "Operation Titan",
    "Operation Ares", "Operation Archangel", "Operation Juggernaut",
    "Operation Red Dragon", "Operation K", "Operation Deckard",
    "Operation Tyrell", "Operation Wallace", "Operation Shoulder of Orion",
    "Operation Hyron", "Operation Morpheus", "Operation Ion Storm",
    "Operation Annihilus", "Operation Ultron", "Operation Centurion",
    "Operation Vindictus", "Operation Daedalus",
];

export type Skill = BladeburnerSkillName;

export const skills: Skill[] = [
    "Blade's Intuition", "Cloak", "Short-Circuit", "Digital Observer",
    "Tracer", "Overclock", "Reaper", "Evasive System", "Datamancer",
    "Cyber's Edge", "Hands of Midas", "Hyperdrive",
];

/** Typed convenience constants for the most common bladeburner actions. */
export class BladeburnerAction {
    static Training                  = ["General",           "Training"                       ] as [BladeburnerActionType, BladeburnerActionName];
    static FieldAnalysis             = ["General",           "Field Analysis"                 ] as [BladeburnerActionType, BladeburnerActionName];
    static Recruitment               = ["General",           "Recruitment"                    ] as [BladeburnerActionType, BladeburnerActionName];
    static Diplomacy                 = ["General",           "Diplomacy"                      ] as [BladeburnerActionType, BladeburnerActionName];
    static HyperbolicRegenerationChamber = ["General",       "Hyperbolic Regeneration Chamber"] as [BladeburnerActionType, BladeburnerActionName];
    static InciteViolence            = ["General",           "Incite Violence"                ] as [BladeburnerActionType, BladeburnerActionName];
    static Tracking                  = ["Contracts",         "Tracking"                       ] as [BladeburnerActionType, BladeburnerActionName];
    static BountyHunter              = ["Contracts",         "Bounty Hunter"                  ] as [BladeburnerActionType, BladeburnerActionName];
    static Retirement                = ["Contracts",         "Retirement"                     ] as [BladeburnerActionType, BladeburnerActionName];
    static Investigation             = ["Operations",        "Investigation"                  ] as [BladeburnerActionType, BladeburnerActionName];
    static UndercoverOperation       = ["Operations",        "Undercover Operation"           ] as [BladeburnerActionType, BladeburnerActionName];
    static StingOperation            = ["Operations",        "Sting Operation"                ] as [BladeburnerActionType, BladeburnerActionName];
    static Raid                      = ["Operations",        "Raid"                           ] as [BladeburnerActionType, BladeburnerActionName];
    static StealthRetirementOperation= ["Operations",        "Stealth Retirement Operation"   ] as [BladeburnerActionType, BladeburnerActionName];
    static Assassination             = ["Operations",        "Assassination"                  ] as [BladeburnerActionType, BladeburnerActionName];
    static Typhoon                   = ["Black Operations",  "Operation Typhoon"              ] as [BladeburnerActionType, BladeburnerActionName];
    static Zero                      = ["Black Operations",  "Operation Zero"                 ] as [BladeburnerActionType, BladeburnerActionName];
    static X                         = ["Black Operations",  "Operation X"                    ] as [BladeburnerActionType, BladeburnerActionName];
    static Titan                     = ["Black Operations",  "Operation Titan"                ] as [BladeburnerActionType, BladeburnerActionName];
    static Ares                      = ["Black Operations",  "Operation Ares"                 ] as [BladeburnerActionType, BladeburnerActionName];
    static Archangel                 = ["Black Operations",  "Operation Archangel"            ] as [BladeburnerActionType, BladeburnerActionName];
    static Juggernaut                = ["Black Operations",  "Operation Juggernaut"           ] as [BladeburnerActionType, BladeburnerActionName];
    static Red                       = ["Black Operations",  "Operation Red Dragon"           ] as [BladeburnerActionType, BladeburnerActionName];
    static K                         = ["Black Operations",  "Operation K"                    ] as [BladeburnerActionType, BladeburnerActionName];
    static Deckard                   = ["Black Operations",  "Operation Deckard"              ] as [BladeburnerActionType, BladeburnerActionName];
    static Tyrell                    = ["Black Operations",  "Operation Tyrell"               ] as [BladeburnerActionType, BladeburnerActionName];
    static Wallace                   = ["Black Operations",  "Operation Wallace"              ] as [BladeburnerActionType, BladeburnerActionName];
    static Shoulder                  = ["Black Operations",  "Operation Shoulder of Orion"    ] as [BladeburnerActionType, BladeburnerActionName];
    static Hyron                     = ["Black Operations",  "Operation Hyron"                ] as [BladeburnerActionType, BladeburnerActionName];
    static Morpheus                  = ["Black Operations",  "Operation Morpheus"             ] as [BladeburnerActionType, BladeburnerActionName];
    static Ion                       = ["Black Operations",  "Operation Ion Storm"            ] as [BladeburnerActionType, BladeburnerActionName];
    static Annihilus                 = ["Black Operations",  "Operation Annihilus"            ] as [BladeburnerActionType, BladeburnerActionName];
    static Ultron                    = ["Black Operations",  "Operation Ultron"               ] as [BladeburnerActionType, BladeburnerActionName];
    static Centurion                 = ["Black Operations",  "Operation Centurion"            ] as [BladeburnerActionType, BladeburnerActionName];
    static Vindictus                 = ["Black Operations",  "Operation Vindictus"            ] as [BladeburnerActionType, BladeburnerActionName];
    static Daedalus                  = ["Black Operations",  "Operation Daedalus"             ] as [BladeburnerActionType, BladeburnerActionName];
}
