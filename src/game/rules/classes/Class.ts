import type { RulesCharacter } from "../personage/RulesCharacter";

export type CharacterClassId =
  | "barbarian"
  | "bard"
  | "cleric"
  | "druid"
  | "fighter"
  | "ranger"
  | "thief"
  | "wizard"
  | "paladin";

export interface CharacterClass {
  id: CharacterClassId;

  nameKey: string;
  descriptionKey: string;

  baseHp: number;
  hpPerLevel: number;
  resourceProgression: number[][];

  setupCharacter?: (character: RulesCharacter) => void;
}
