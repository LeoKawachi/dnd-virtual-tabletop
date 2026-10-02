export type ConditionId =
  | "stunned"
  | "poisoned"
  | "slowed"
  | "burning"
  | "blinded"
  | "charmed"
  | "cursed"
  | "frightened"
  | "petrified"
  | "sleeping"
  | "rooted"
  | "suppressed"
  | "silenced"
  | "freezed"
  | "acid"
  | "bleeding"
  | "marked"
  | "armor-penetration"
  | "magic-penetration"
  | "pulled"
  | "pushed"
  | "feared"
  | "anti-heal"
  | "taunted"
  | "confused"
  | "short-sighted";

export interface ConditionDefinition {
  id: ConditionId;
  nameKey: string;
  descriptionKey: string;
  maxStacks: number;
  advantageWhenTargeted: boolean;
  disadvantageOnAttacks: boolean;
}

export const CONDITIONS: ConditionDefinition[] = [
  {
    id: "stunned",
    nameKey: "condition_stunned",
    descriptionKey: "condition_stunned_description",
    maxStacks: 1,
    advantageWhenTargeted: true,
    disadvantageOnAttacks: true,
  },
  {
    id: "poisoned",
    nameKey: "condition_poisoned",
    descriptionKey: "condition_poisoned_description",
    maxStacks: 5,
    advantageWhenTargeted: false,
    disadvantageOnAttacks: false,
  },
  {
    id: "slowed",
    nameKey: "condition_slowed",
    descriptionKey: "condition_slowed_description",
    maxStacks: 1,
    advantageWhenTargeted: true,
    disadvantageOnAttacks: true,
  },
  {
    id: "burning",
    nameKey: "condition_burning",
    descriptionKey: "condition_burning_description",
    maxStacks: 5,
    advantageWhenTargeted: false,
    disadvantageOnAttacks: false,
  },
  {
    id: "blinded",
    nameKey: "condition_blinded",
    descriptionKey: "condition_blinded_description",
    maxStacks: 1,
    advantageWhenTargeted: true,
    disadvantageOnAttacks: true,
  },
  {
    id: "charmed",
    nameKey: "condition_charmed",
    descriptionKey: "condition_charmed_description",
    maxStacks: 1,
    advantageWhenTargeted: false,
    disadvantageOnAttacks: false,
  },
  {
    id: "cursed",
    nameKey: "condition_cursed",
    descriptionKey: "condition_cursed_description",
    maxStacks: 1,
    advantageWhenTargeted: true,
    disadvantageOnAttacks: true,
  },
  {
    id: "frightened",
    nameKey: "condition_frightened",
    descriptionKey: "condition_frightened_description",
    maxStacks: 1,
    advantageWhenTargeted: false,
    disadvantageOnAttacks: false,
  },
  {
    id: "petrified",
    nameKey: "condition_petrified",
    descriptionKey: "condition_petrified_description",
    maxStacks: 1,
    advantageWhenTargeted: true,
    disadvantageOnAttacks: true,
  },
  {
    id: "sleeping",
    nameKey: "condition_sleeping",
    descriptionKey: "condition_sleeping_description",
    maxStacks: 1,
    advantageWhenTargeted: true,
    disadvantageOnAttacks: true,
  },
  {
    id: "rooted",
    nameKey: "condition_rooted",
    descriptionKey: "condition_rooted_description",
    maxStacks: 1,
    advantageWhenTargeted: true,
    disadvantageOnAttacks: true,
  },
  {
    id: "suppressed",
    nameKey: "condition_suppressed",
    descriptionKey: "condition_suppressed_description",
    maxStacks: 1,
    advantageWhenTargeted: true,
    disadvantageOnAttacks: true,
  },
  {
    id: "silenced",
    nameKey: "condition_silenced",
    descriptionKey: "condition_silenced_description",
    maxStacks: 1,
    advantageWhenTargeted: false,
    disadvantageOnAttacks: false,
  },

  {
    id: "freezed",
    nameKey: "condition_freezed",
    descriptionKey: "condition_freezed_description",
    maxStacks: 1,
    advantageWhenTargeted: true,
    disadvantageOnAttacks: true,
  },
  {
    id: "acid",
    nameKey: "condition_acid",
    descriptionKey: "condition_acid_description",
    maxStacks: 5,
    advantageWhenTargeted: false,
    disadvantageOnAttacks: false,
  },
  {
    id: "bleeding",
    nameKey: "condition_bleeding",
    descriptionKey: "condition_bleeding_description",
    maxStacks: 5,
    advantageWhenTargeted: false,
    disadvantageOnAttacks: false,
  },
  {
    id: "marked",
    nameKey: "condition_marked",
    descriptionKey: "condition_marked_description",
    maxStacks: 1,
    advantageWhenTargeted: true,
    disadvantageOnAttacks: false,
  },
  {
    id: "armor-penetration",
    nameKey: "condition_armor_penetration",
    descriptionKey: "condition_armor_penetration_description",
    maxStacks: 1,
    advantageWhenTargeted: false,
    disadvantageOnAttacks: false,
  },
  {
    id: "magic-penetration",
    nameKey: "condition_magic_penetration",
    descriptionKey: "condition_magic_penetration_description",
    maxStacks: 1,
    advantageWhenTargeted: false,
    disadvantageOnAttacks: false,
  },
  {
    id: "pulled",
    nameKey: "condition_pulled",
    descriptionKey: "condition_pulled_description",
    maxStacks: 1,
    advantageWhenTargeted: false,
    disadvantageOnAttacks: false,
  },
  {
    id: "pushed",
    nameKey: "condition_pushed",
    descriptionKey: "condition_pushed_description",
    maxStacks: 1,
    advantageWhenTargeted: false,
    disadvantageOnAttacks: false,
  },
  {
    id: "feared",
    nameKey: "condition_feared",
    descriptionKey: "condition_feared_description",
    maxStacks: 1,
    advantageWhenTargeted: true,
    disadvantageOnAttacks: true,
  },
  {
    id: "anti-heal",
    nameKey: "condition_anti_heal",
    descriptionKey: "condition_anti_heal_description",
    maxStacks: 1,
    advantageWhenTargeted: false,
    disadvantageOnAttacks: false,
  },
  {
    id: "taunted",
    nameKey: "condition_taunted",
    descriptionKey: "condition_taunted_description",
    maxStacks: 1,
    advantageWhenTargeted: false,
    disadvantageOnAttacks: true,
  },
  {
    id: "confused",
    nameKey: "condition_confused",
    descriptionKey: "condition_confused_description",
    maxStacks: 1,
    advantageWhenTargeted: false,
    disadvantageOnAttacks: false,
  },
];

export function getConditionDefinition(
  id: ConditionId,
): ConditionDefinition | undefined {
  return CONDITIONS.find((condition) => condition.id === id);
}
