export type Type =
  | "general"
  | "contract"
  | "op"
  | "blackop";

export const types = ["general", "contract", "op", "blackop"] as Type[];

export type Action =
  | "Training"
  | "Field Analysis"
  | "Recruitment"
  | "Diplomacy"
  | "Hyperbolic Regeneration Chamber"
  | "Incite Violence";

export const actions = ["Training", "Field Analysis", "Recruitment", "Diplomacy", "Hyperbolic Regeneration Chamber", "Incite Violence"] as Action[];

export type Contract =
  | "Tracking"
  | "Bounty Hunter"
  | "Retirement";

export const contracts = ["Tracking", "Bounty Hunter", "Retirement"] as Contract[];

export type Operation =
  | "Investigation"
  | "Undercover Operation"
  | "Sting Operation"
  | "Raid"
  | "Stealth Retirement Operation"
  | "Assassination";

export const operations = ["Investigation", "Undercover Operation", "Sting Operation", "Raid", "Stealth Retirement Operation", "Assassination"] as Operation[];

export type BlackOp =
  | "Operation Typhoon"
  | "Operation Zero"
  | "Operation X"
  | "Operation Titan"
  | "Operation Ares"
  | "Operation Archangel"
  | "Operation Juggernaut"
  | "Operation Red Dragon"
  | "Operation K"
  | "Operation Deckard"
  | "Operation Tyrell"
  | "Operation Wallace"
  | "Operation Shoulder of Orion"
  | "Operation Hyron"
  | "Operation Morpheus"
  | "Operation Ion Storm"
  | "Operation Annihilus"
  | "Operation Ultron"
  | "Operation Centurion"
  | "Operation Vindictus"
  | "Operation Daedalus";

export const blackOps = ["Operation Typhoon", "Operation Zero", "Operation X", "Operation Titan", "Operation Ares", "Operation Archangel", "Operation Juggernaut", "Operation Red Dragon", "Operation K", "Operation Deckard", "Operation Tyrell", "Operation Wallace", "Operation Shoulder of Orion", "Operation Hyron", "Operation Morpheus", "Operation Ion Storm", "Operation Annihilus", "Operation Ultron", "Operation Centurion", "Operation Vindictus", "Operation Daedalus"] as BlackOp[];

export type Skill =
  | "Blade's Intuition"
  | "Cloak"
  | "Short-Circuit"
  | "Digital Observer"
  | "Tracer"
  | "Overclock"
  | "Reaper"
  | "Evasive System"
  | "Datamancer"
  | "Cyber's Edge"
  | "Hands of Midas"
  | "Hyperdrive";

export const skills = ["Blade's Intuition", "Cloak", "Short-Circuit", "Digital Observer", "Tracer", "Overclock", "Reaper", "Evasive System", "Datamancer", "Cyber's Edge", "Hands of Midas", "Hyperdrive"] as Skill[];

export class BladeburnerAction {
  static Training = ["general", "Training"] as [Type, Action];
  static FieldAnalysis = ["general", "Field Analysis"] as [Type, Action];
  static Recruitment = ["general", "Recruitment"] as [Type, Action];
  static Diplomacy = ["general", "Diplomacy"] as [Type, Action];
  static HyperbolicRegenerationChamber = ["general", "Hyperbolic Regeneration Chamber"] as [Type, Action];
  static InciteViolence = ["general", "Incite Violence"] as [Type, Action];
  static Tracking = ["contract", "Tracking"] as [Type, Contract];
  static BountyHunter = ["contract", "Bounty Hunter"] as [Type, Contract];
  static Retirement = ["contract", "Retirement"] as [Type, Contract];
  static Investigation = ["op", "Investigation"] as [Type, Operation];
  static UndercoverOperation = ["op", "Undercover Operation"] as [Type, Operation];
  static StingOperation = ["op", "Sting Operation"] as [Type, Operation];
  static Raid = ["op", "Raid"] as [Type, Operation];
  static StealthRetirementOperation = ["op", "Stealth Retirement Operation"] as [Type, Operation];
  static Assassination = ["op", "Assassination"] as [Type, Operation];
  static Typhoon = ["blackop", "Operation Typhoon"] as [Type, BlackOp];
  static Zero = ["blackop", "Operation Zero"] as [Type, BlackOp];
  static X = ["blackop", "Operation X"] as [Type, BlackOp];
  static Titan = ["blackop", "Operation Titan"] as [Type, BlackOp];
  static Ares = ["blackop", "Operation Ares"] as [Type, BlackOp];
  static Archangel = ["blackop", "Operation Archangel"] as [Type, BlackOp];
  static Juggernaut = ["blackop", "Operation Juggernaut"] as [Type, BlackOp];
  static Red = ["blackop", "Operation Red Dragon"] as [Type, BlackOp];
  static K = ["blackop", "Operation K"] as [Type, BlackOp];
  static Deckard = ["blackop", "Operation Deckard"] as [Type, BlackOp];
  static Tyrell = ["blackop", "Operation Tyrell"] as [Type, BlackOp];
  static Wallace = ["blackop", "Operation Wallace"] as [Type, BlackOp];
  static Shoulder = ["blackop", "Operation Shoulder of Orion"] as [Type, BlackOp];
  static Hyron = ["blackop", "Operation Hyron"] as [Type, BlackOp];
  static Morpheus = ["blackop", "Operation Morpheus"] as [Type, BlackOp];
  static Ion = ["blackop", "Operation Ion Storm"] as [Type, BlackOp];
  static Annihilus = ["blackop", "Operation Annihilus"] as [Type, BlackOp];
  static Ultron = ["blackop", "Operation Ultron"] as [Type, BlackOp];
  static Centurion = ["blackop", "Operation Centurion"] as [Type, BlackOp];
  static Vindictus = ["blackop", "Operation Vindictus"] as [Type, BlackOp];
  static Daedalus = ["blackop", "Operation Daedalus"] as [Type, BlackOp];
}
