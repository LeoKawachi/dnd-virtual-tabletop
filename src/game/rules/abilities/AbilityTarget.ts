import type { AbilityDefinition } from "./Ability";
import type { CombatState } from "../combat/CombatState";
import type { Position } from "../combat/Movement";
import { calculateDistance } from "../combat/Movement";

export interface AbilityTarget {
  id?: string;
  position?: Position;
}

export interface AbilityTargetValidation {
  valid: boolean;
  reason?: string;
}

export function validateAbilityTarget(
  ability: AbilityDefinition,
  casterId: string,
  target: AbilityTarget,
  state: CombatState,
): AbilityTargetValidation {
  const caster = state.combatants.find(
    (combatant) => combatant.id === casterId,
  );

  if (!caster) {
    return {
      valid: false,
      reason: "Caster is invalid.",
    };
  }

  // Location-targeted abilities don't require a combatant.
  if (ability.targetType === "location") {
    if (!target.position) {
      return {
        valid: false,
        reason: "Target location is invalid.",
      };
    }

    if (
      ability.range !== undefined &&
      calculateDistance(caster.position, target.position) > ability.range
    ) {
      return {
        valid: false,
        reason: "Target location is out of range.",
      };
    }

    return {
      valid: true,
    };
  }

  if (!target.id) {
    return {
      valid: false,
      reason: "Target is invalid.",
    };
  }

  const targetCombatant = state.combatants.find(
    (combatant) => combatant.id === target.id,
  );

  if (!targetCombatant) {
    return {
      valid: false,
      reason: "Target does not exist.",
    };
  }

  if (!targetCombatant.alive) {
    return {
      valid: false,
      reason: "Target is not alive.",
    };
  }

  const taunted = state.conditionManager.getCondition(casterId, "taunted");

  if (taunted?.sourceId && taunted.sourceId !== target.id) {
    return {
      valid: false,
      reason: "Taunted creatures can only target their taunter.",
    };
  }

  if (
    ability.range !== undefined &&
    !isAbilityInRange(ability, casterId, target.id, state)
  ) {
    return {
      valid: false,
      reason: "Target is out of range.",
    };
  }

  switch (ability.targetType) {
    case "self":
      if (target.id !== casterId) {
        return {
          valid: false,
          reason: "Ability can only target the caster.",
        };
      }
      break;

    case "ally":
      if (targetCombatant.team !== caster.team) {
        return {
          valid: false,
          reason: "Target is not an ally.",
        };
      }
      break;

    case "self-or-ally":
      if (target.id !== casterId && targetCombatant.team !== caster.team) {
        return {
          valid: false,
          reason: "Target must be the caster or an ally.",
        };
      }
      break;

    case "enemy":
      if (targetCombatant.team === caster.team) {
        return {
          valid: false,
          reason: "Target is not an enemy.",
        };
      }
      break;
  }

  return {
    valid: true,
  };
}

export function isAbilityInRange(
  ability: AbilityDefinition,
  casterId: string,
  targetId: string,
  state: CombatState,
): boolean {
  if (ability.range === undefined) {
    return true;
  }

  const caster = state.combatants.find(
    (combatant) => combatant.id === casterId,
  );

  const target = state.combatants.find(
    (combatant) => combatant.id === targetId,
  );

  if (!caster || !target) {
    return false;
  }

  const distance = calculateDistance(caster.position, target.position);

  return distance <= ability.range;
}
