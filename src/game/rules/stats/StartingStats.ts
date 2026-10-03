import type { CharacterStats } from "./Stats";

export const DEFAULT_STARTING_STATS: CharacterStats = {
  strength: 8,
  dexterity: 8,
  constitution: 8,
  intelligence: 8,
  wisdom: 8,
  charisma: 8,
};

export const STARTING_ATTRIBUTE_POINTS = 27;

export function getAttributePointCost(value: number): number {
  if (value < 8 || value > 15) {
    throw new Error(`Invalid starting attribute value: ${value}`);
  }

  if (value <= 13) {
    return value - 8;
  }

  return 5 + (value - 13) * 2;
}

export function getTotalAttributePointCost(stats: CharacterStats): number {
  return (
    getAttributePointCost(stats.strength) +
    getAttributePointCost(stats.dexterity) +
    getAttributePointCost(stats.constitution) +
    getAttributePointCost(stats.intelligence) +
    getAttributePointCost(stats.wisdom) +
    getAttributePointCost(stats.charisma)
  );
}

export function isValidStartingStats(stats: CharacterStats): boolean {
  return getTotalAttributePointCost(stats) <= STARTING_ATTRIBUTE_POINTS;
}

export function canIncreaseAttribute(
  stats: CharacterStats,
  attribute: keyof CharacterStats,
): boolean {
  if (stats[attribute] >= 15) {
    return false;
  }

  const newStats = {
    ...stats,
    [attribute]: stats[attribute] + 1,
  };

  return getTotalAttributePointCost(newStats) <= STARTING_ATTRIBUTE_POINTS;
}

export function canDecreaseAttribute(
  stats: CharacterStats,
  attribute: keyof CharacterStats,
): boolean {
  return stats[attribute] > 8;
}
