import type { RulesCharacter } from "./RulesCharacter";
import type { CharacterStats } from "../stats/Stats";
import { getAbilityModifier } from "../stats/Stats";
import {
  DEFAULT_STARTING_STATS,
  isValidStartingStats,
} from "../stats/StartingStats";
import { CHARACTER_CLASSES } from "../classes/Classes";
import type { CharacterClassId, CharacterClass } from "../classes/Class";
import type { CharacterResources } from "../abilities/Resource";
import { rollDie } from "../dice/Dice";

export function createRulesCharacter(
  id: string,
  name: string,
  classId: CharacterClassId,
  stats: CharacterStats = DEFAULT_STARTING_STATS,
): RulesCharacter {
  const characterClass = CHARACTER_CLASSES.find(
    (characterClass) => characterClass.id === classId,
  );

  if (!characterClass) {
    throw new Error(`Unknown character class: ${classId}`);
  }

  if (!isValidStartingStats(stats)) {
    throw new Error("Invalid starting attributes");
  }

  const maxHp = calculateLevelOneHp(
    characterClass,
    getAbilityModifier(stats.constitution),
  );

  const progression = characterClass.resourceProgression[0];

  const resources: CharacterResources = {
    spellSlots: {
      1: progression[0],
      2: progression[1],
      3: progression[2],
      4: progression[3],
      5: progression[4],
      6: progression[5],
    },
    maxSpellSlots: {
      1: progression[0],
      2: progression[1],
      3: progression[2],
      4: progression[3],
      5: progression[4],
      6: progression[5],
    },
  };

  return {
    id,
    name,
    classId,
    level: 1,
    xp: 0,
    stats: { ...stats },
    hp: maxHp,
    maxHp,
    resources,
  };
}

function calculateLevelOneHp(
  characterClass: CharacterClass,
  constitutionModifier: number,
): number {
  return characterClass.baseHp + constitutionModifier;
}

export function calculateLevelUpHp(
  characterClass: CharacterClass,
  constitutionModifier: number,
): number {
  return characterClass.hpPerLevel + rollDie(4) + constitutionModifier;
}
