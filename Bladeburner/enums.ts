import { BladeburnerSkillName } from "@ns";

export type Type =
  | "General"
  | "Contracts"
  | "Operations"
  | "Black Operations";

export const types = ["General", "Contracts", "Operations", "Black Operations"] as Type[];

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

export const operations = ["Raid","Assassination","Stealth Retirement Operation", "Sting Operation", "Undercover Operation", "Investigation"] as Operation[];

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

export type Skill = BladeburnerSkillName;

export const skills = ["Blade's Intuition", "Cloak", "Short-Circuit", "Digital Observer", "Tracer", "Overclock", "Reaper", "Evasive System", "Datamancer", "Cyber's Edge", "Hands of Midas", "Hyperdrive"] as Skill[];

export class BladeburnerAction {
  static Training = ["General", "Training"] as [Type, Action];
  static FieldAnalysis = ["General", "Field Analysis"] as [Type, Action];
  static Recruitment = ["General", "Recruitment"] as [Type, Action];
  static Diplomacy = ["General", "Diplomacy"] as [Type, Action];
  static HyperbolicRegenerationChamber = ["General", "Hyperbolic Regeneration Chamber"] as [Type, Action];
  static InciteViolence = ["General", "Incite Violence"] as [Type, Action];
  static Tracking = ["Contracts", "Tracking"] as [Type, Contract];
  static BountyHunter = ["Contracts", "Bounty Hunter"] as [Type, Contract];
  static Retirement = ["Contracts", "Retirement"] as [Type, Contract];
  static Investigation = ["Operations", "Investigation"] as [Type, Operation];
  static UndercoverOperation = ["Operations", "Undercover Operation"] as [Type, Operation];
  static StingOperation = ["Operations", "Sting Operation"] as [Type, Operation];
  static Raid = ["Operations", "Raid"] as [Type, Operation];
  static StealthRetirementOperation = ["Operations", "Stealth Retirement Operation"] as [Type, Operation];
  static Assassination = ["Operations", "Assassination"] as [Type, Operation];
  static Typhoon = ["Black Operations", "Operation Typhoon"] as [Type, BlackOp];
  static Zero = ["Black Operations", "Operation Zero"] as [Type, BlackOp];
  static X = ["Black Operations", "Operation X"] as [Type, BlackOp];
  static Titan = ["Black Operations", "Operation Titan"] as [Type, BlackOp];
  static Ares = ["Black Operations", "Operation Ares"] as [Type, BlackOp];
  static Archangel = ["Black Operations", "Operation Archangel"] as [Type, BlackOp];
  static Juggernaut = ["Black Operations", "Operation Juggernaut"] as [Type, BlackOp];
  static Red = ["Black Operations", "Operation Red Dragon"] as [Type, BlackOp];
  static K = ["Black Operations", "Operation K"] as [Type, BlackOp];
  static Deckard = ["Black Operations", "Operation Deckard"] as [Type, BlackOp];
  static Tyrell = ["Black Operations", "Operation Tyrell"] as [Type, BlackOp];
  static Wallace = ["Black Operations", "Operation Wallace"] as [Type, BlackOp];
  static Shoulder = ["Black Operations", "Operation Shoulder of Orion"] as [Type, BlackOp];
  static Hyron = ["Black Operations", "Operation Hyron"] as [Type, BlackOp];
  static Morpheus = ["Black Operations", "Operation Morpheus"] as [Type, BlackOp];
  static Ion = ["Black Operations", "Operation Ion Storm"] as [Type, BlackOp];
  static Annihilus = ["Black Operations", "Operation Annihilus"] as [Type, BlackOp];
  static Ultron = ["Black Operations", "Operation Ultron"] as [Type, BlackOp];
  static Centurion = ["Black Operations", "Operation Centurion"] as [Type, BlackOp];
  static Vindictus = ["Black Operations", "Operation Vindictus"] as [Type, BlackOp];
  static Daedalus = ["Black Operations", "Operation Daedalus"] as [Type, BlackOp];
}
