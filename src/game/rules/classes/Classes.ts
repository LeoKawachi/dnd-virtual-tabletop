import type { CharacterClass } from "./Class";

export const FULL_CASTER_RESOURCE_PROGRESSION: number[][] = [
  [2, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0],
  [4, 2, 0, 0, 0, 0],
  [4, 3, 0, 0, 0, 0],
  [4, 3, 2, 0, 0, 0],
  [4, 3, 3, 0, 0, 0],
  [4, 3, 3, 1, 0, 0],
  [4, 3, 3, 2, 0, 0],
  [4, 3, 3, 3, 1, 0],
  [4, 3, 3, 3, 2, 0],
  [4, 3, 3, 3, 2, 1],
  [4, 3, 3, 3, 2, 1],
];

export const HALF_CASTER_RESOURCE_PROGRESSION: number[][] = [
  [2, 0, 0, 0, 0, 0],
  [2, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0],
  [4, 2, 0, 0, 0, 0],
  [4, 2, 0, 0, 0, 0],
  [4, 3, 0, 0, 0, 0],
  [4, 3, 0, 0, 0, 0],
  [4, 3, 2, 0, 0, 0],
  [4, 3, 2, 0, 0, 0],
  [4, 3, 3, 0, 0, 0],
  [4, 3, 3, 0, 0, 0],
];

export const CHARACTER_CLASSES: CharacterClass[] = [
  {
    id: "barbarian",
    nameKey: "class_barbarian",
    descriptionKey: "class_barbarian_description",
    baseHp: 12,
    hpPerLevel: 7,
    resourceProgression: HALF_CASTER_RESOURCE_PROGRESSION,
  },

  {
    id: "bard",
    nameKey: "class_bard",
    descriptionKey: "class_bard_description",
    baseHp: 8,
    hpPerLevel: 5,
    resourceProgression: FULL_CASTER_RESOURCE_PROGRESSION,
  },

  {
    id: "cleric",
    nameKey: "class_cleric",
    descriptionKey: "class_cleric_description",
    baseHp: 8,
    hpPerLevel: 5,
    resourceProgression: FULL_CASTER_RESOURCE_PROGRESSION,
  },

  {
    id: "druid",
    nameKey: "class_druid",
    descriptionKey: "class_druid_description",
    baseHp: 8,
    hpPerLevel: 5,
    resourceProgression: FULL_CASTER_RESOURCE_PROGRESSION,
  },

  {
    id: "fighter",
    nameKey: "class_fighter",
    descriptionKey: "class_fighter_description",
    baseHp: 10,
    hpPerLevel: 6,
    resourceProgression: HALF_CASTER_RESOURCE_PROGRESSION,
  },

  {
    id: "ranger",
    nameKey: "class_ranger",
    descriptionKey: "class_ranger_description",
    baseHp: 10,
    hpPerLevel: 6,
    resourceProgression: HALF_CASTER_RESOURCE_PROGRESSION,
  },

  {
    id: "thief",
    nameKey: "class_thief",
    descriptionKey: "class_thief_description",
    baseHp: 8,
    hpPerLevel: 5,
    resourceProgression: HALF_CASTER_RESOURCE_PROGRESSION,
  },

  {
    id: "wizard",
    nameKey: "class_wizard",
    descriptionKey: "class_wizard_description",
    baseHp: 6,
    hpPerLevel: 4,
    resourceProgression: FULL_CASTER_RESOURCE_PROGRESSION,
  },

  {
    id: "paladin",
    nameKey: "class_paladin",
    descriptionKey: "class_paladin_description",
    baseHp: 10,
    hpPerLevel: 6,
    resourceProgression: HALF_CASTER_RESOURCE_PROGRESSION,
  },
];
