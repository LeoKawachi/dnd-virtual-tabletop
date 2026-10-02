import type { DamageExpression } from "../combat/Damage";
import type { ConditionId } from "../condition/Condition";
import type { CombatModifier } from "../combat/CombatModifier";
import type { CreatureType } from "../combat/Combatant";
import type { CharacterClassId } from "../classes/Class";

export type AbilityEffectType =
  | "damage"
  | "heal"
  | "temporary-hp"
  | "apply-condition"
  | "remove-condition"
  | "move"
  | "teleport"
  | "modify-stat"
  | "modify-behavior"
  | "damage-share"
  | "grant-action"
  | "block-condition";

export type AbilityInstanceTrigger =
  | "enter-area"
  | "move-inside-area"
  | "turn-start"
  | "turn-end";

export interface AbilityEffect {
  type: AbilityEffectType;

  value?: number;

  damage?: DamageExpression;

  healing?: DamageExpression;

  levelScaling?: {
    [level: number]: {
      count?: number;
      sides?: number;
      modifier?: number;
    };
  };

  conditionId?: ConditionId;

  conditionIds?: ConditionId[];

  duration?: number;

  stacks?: number;

  distance?: number;

  modifier?: CombatModifier;

  targetCreatureType?: CreatureType;

  areaDamage?: {
    falloff: number;
  };

  classDamageScaling?: Partial<
    Record<
      CharacterClassId,
      {
        count?: number;
        sides?: number;
        modifier?: number;

        levelScaling?: {
          [level: number]: {
            count?: number;
            sides?: number;
            modifier?: number;
          };
        };
      }
    >
  >;

  classConditionScaling?: Partial<
    Record<
      CharacterClassId,
      {
        duration?: number;
        stacks?: number;
        value?: number;
      }
    >
  >;
}

export interface ClassDamageScaling {
  [classId: string]: {
    count?: number;
    sides?: number;
    modifier?: number;
  };
}

export interface ClassConditionScaling {
  [classId: string]: {
    duration?: number;
    stacks?: number;
    value?: number;
  };
}
