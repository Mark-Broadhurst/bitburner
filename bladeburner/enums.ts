export enum Type {
  General = "general",
  Contract = "contract",
  Operation = "op",
  BlackOp = "blackop"
}

export enum Action {
  Training = "Training",
  FieldAnalysis = "Field Analysis",
  Recruitment = "Recruitment",
  Diplomacy = "Diplomacy",
  HyperbolicRegenerationChamber = "Hyperbolic Regeneration Chamber",
  InciteViolence = "Incite Violence"
}

export enum Contract {
  Tracking = "Tracking",
  BountyHunter = "Bounty Hunter",
  Retirement = "Retirement",
}

export enum Operation {
  Investigation = "Investigation",
  UndercoverOperation = "Undercover Operation",
  StingOperation = "Sting Operation",
  Raid = "Raid",
  StealthRetirementOperation = "Stealth Retirement Operation",
  Assassination = "Assassination"
}

export enum BlackOp {
  Typhoon = "Operation Typhoon",
  Zero = "Operation Zero",
  X = "Operation X",
  Titan = "Operation Titan",
  Ares = "Operation Ares",
  Archangel = "Operation Archangel",
  Juggernaut = "Operation Juggernaut",
  Red = "Operation Red Dragon",
  K = "Operation K",
  Deckard = "Operation Deckard",
  Tyrell = "Operation Tyrell",
  Wallace = "Operation Wallace",
  Shoulder = "Operation Shoulder of Orion",
  Hyron = "Operation Hyron",
  Morpheus = "Operation Morpheus",
  Ion = "Operation Ion Storm",
  Annihilus = "Operation Annihilus",
  Ultron = "Operation Ultron",
  Centurion = "Operation Centurion",
  Vindictus = "Operation Vindictus",
  Daedalus = "Operation Daedalus"
}

export enum Skill {
  BladesIntuition = "Blade's Intuition",
  Cloak = "Cloak",
  ShortCircuit = "Short-Circuit",
  DigitalObserver = "Digital Observer",
  Tracer = "Tracer",
  Overclock = "Overclock",
  Reaper = "Reaper",
  EvasiveSystem = "Evasive System",
  Datamancer = "Datamancer",
  CybersEdge = "Cyber's Edge",
  HandsofMidas = "Hands of Midas",
  Hyperdrive = "Hyperdrive"
}

export class BladeburnerAction {
  static Training = [Type.General, Action.Training] as [Type,Action];
  static FieldAnalysis = [Type.General, Action.FieldAnalysis] as [Type,Action];
  static Recruitment = [Type.General, Action.Recruitment] as [Type,Action];
  static Diplomacy = [Type.General, Action.Diplomacy] as [Type,Action];
  static HyperbolicRegenerationChamber = [Type.General, Action.HyperbolicRegenerationChamber]  as [Type,Action];
  static InciteViolence = [Type.General, Action.InciteViolence] as [Type,Action];
  static Tracking = [Type.Contract, Contract.Tracking] as [Type,Contract];
  static BountyHunter = [Type.Contract, Contract.BountyHunter] as [Type,Contract];
  static Retirement = [Type.Contract, Contract.Retirement] as [Type,Contract];
  static Investigation = [Type.Operation, Operation.Investigation] as [Type,Operation];
  static UndercoverOperation = [Type.Operation, Operation.UndercoverOperation] as [Type,Operation];
  static StingOperation = [Type.Operation, Operation.StingOperation] as [Type,Operation];
  static Raid = [Type.Operation, Operation.Raid] as [Type,Operation];
  static StealthRetirementOperation = [Type.Operation, Operation.StealthRetirementOperation] as [Type,Operation];
  static Assassination = [Type.Operation, Operation.Assassination] as [Type,Operation];
  static Typhoon = [Type.BlackOp, BlackOp.Typhoon] as [Type,BlackOp];
  static Zero = [Type.BlackOp, BlackOp.Zero] as [Type,BlackOp];
  static X = [Type.BlackOp, BlackOp.X] as [Type,BlackOp];
  static Titan = [Type.BlackOp, BlackOp.Titan] as [Type,BlackOp];
  static Ares = [Type.BlackOp, BlackOp.Ares] as [Type,BlackOp];
  static Archangel = [Type.BlackOp, BlackOp.Archangel] as [Type,BlackOp];
  static Juggernaut = [Type.BlackOp, BlackOp.Juggernaut] as [Type,BlackOp];
  static Red = [Type.BlackOp, BlackOp.Red] as [Type,BlackOp];
  static K = [Type.BlackOp, BlackOp.K] as [Type,BlackOp];
  static Deckard = [Type.BlackOp, BlackOp.Deckard] as [Type,BlackOp];
  static Tyrell = [Type.BlackOp, BlackOp.Tyrell] as [Type,BlackOp];
  static Wallace = [Type.BlackOp, BlackOp.Wallace] as [Type,BlackOp];
  static Shoulder = [Type.BlackOp, BlackOp.Shoulder] as [Type,BlackOp];
  static Hyron = [Type.BlackOp, BlackOp.Hyron] as [Type,BlackOp];
  static Morpheus = [Type.BlackOp, BlackOp.Morpheus] as [Type,BlackOp];
  static Ion = [Type.BlackOp, BlackOp.Ion] as [Type,BlackOp];
  static Annihilus = [Type.BlackOp, BlackOp.Annihilus] as [Type,BlackOp];
  static Ultron = [Type.BlackOp, BlackOp.Ultron] as [Type,BlackOp];
  static Centurion = [Type.BlackOp, BlackOp.Centurion] as [Type,BlackOp];
  static Vindictus = [Type.BlackOp, BlackOp.Vindictus] as [Type,BlackOp];
  static Daedalus = [Type.BlackOp, BlackOp.Daedalus] as [Type,BlackOp];
}
