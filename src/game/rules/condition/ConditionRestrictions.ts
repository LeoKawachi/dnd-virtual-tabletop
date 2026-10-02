import type { ConditionId } from "./Condition";
import type {
  ConditionMovementRestriction,
  ConditionState,
} from "./ConditionState";
import type { Combatant } from "../combat/Combatant";
import type { Position } from "../combat/Movement";

export function hasCondition(
  conditions: ConditionState[],
  conditionId: ConditionId,
): boolean {
  return conditions.some((condition) => condition.id === conditionId);
}

export function canMove(conditions: ConditionState[]): boolean {
  if (hasCondition(conditions, "stunned")) return false;
  if (hasCondition(conditions, "rooted")) return false;
  if (hasCondition(conditions, "suppressed")) return false;
  if (hasCondition(conditions, "petrified")) return false;
  if (hasCondition(conditions, "sleeping")) return false;

  return true;
}

export function canUseAction(conditions: ConditionState[]): boolean {
  if (hasCondition(conditions, "stunned")) return false;
  if (hasCondition(conditions, "petrified")) return false;
  if (hasCondition(conditions, "sleeping")) return false;

  return true;
}

export function canUseBonusAction(conditions: ConditionState[]): boolean {
  if (hasCondition(conditions, "stunned")) return false;
  if (hasCondition(conditions, "freezed")) return false;
  if (hasCondition(conditions, "petrified")) return false;
  if (hasCondition(conditions, "sleeping")) return false;

  return true;
}

export function canUseReaction(conditions: ConditionState[]): boolean {
  if (hasCondition(conditions, "stunned")) return false;
  if (hasCondition(conditions, "petrified")) return false;
  if (hasCondition(conditions, "sleeping")) return false;

  return true;
}

export function canUseSpells(conditions: ConditionState[]): boolean {
  if (hasCondition(conditions, "stunned")) return false;
  if (hasCondition(conditions, "suppressed")) return false;
  if (hasCondition(conditions, "silenced")) return false;
  if (hasCondition(conditions, "sleeping")) return false;

  return true;
}

export function canUseSpecialMovement(conditions: ConditionState[]): boolean {
  if (hasCondition(conditions, "stunned")) return false;
  if (hasCondition(conditions, "freezed")) return false;
  if (hasCondition(conditions, "rooted")) return false;
  if (hasCondition(conditions, "suppressed")) return false;

  return true;
}

export function canAttackTarget(
  targetId: string,
  conditions: ConditionState[],
): boolean {
  return !conditions.some(
    (condition) =>
      (condition.id === "charmed" && condition.sourceId === targetId) ||
      (condition.id === "taunted" && condition.sourceId !== targetId),
  );
}

function isPointInsideRectangle(
  point: Position,
  rectangle: ConditionMovementRestriction,
): boolean {
  const dx = point.x - rectangle.center.x;
  const dy = point.y - rectangle.center.y;

  const cos = Math.cos(-rectangle.rotation);
  const sin = Math.sin(-rectangle.rotation);

  const localX = dx * cos - dy * sin;
  const localY = dx * sin + dy * cos;

  return (
    Math.abs(localX) <= rectangle.width / 2 &&
    Math.abs(localY) <= rectangle.length / 2
  );
}

export function createMovementRestrictions(
  conditionId: ConditionId,
  sourcePosition: Position,
  targetPosition: Position,
): ConditionMovementRestriction[] {
  if (conditionId !== "charmed" && conditionId !== "frightened") {
    return [];
  }

  const dx = targetPosition.x - sourcePosition.x;
  const dy = targetPosition.y - sourcePosition.y;

  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance === 0) {
    return [];
  }

  const directionX = dx / distance;
  const directionY = dy / distance;
  const rotation = Math.atan2(dy, dx);

  const width = 10;
  const extension = 5;

  if (conditionId === "charmed") {
    const length = distance + extension;

    const centerDistance = (distance + extension) / 2;

    return [
      {
        shape: "rectangle",
        center: {
          x: sourcePosition.x + directionX * centerDistance,
          y: sourcePosition.y + directionY * centerDistance,
        },
        width,
        length,
        rotation,
      },
    ];
  }

  const length = distance + extension * 2;

  const centerDistance = distance / 2;

  return [
    {
      shape: "rectangle",
      center: {
        x: sourcePosition.x + directionX * centerDistance,
        y: sourcePosition.y + directionY * centerDistance,
      },
      width,
      length,
      rotation,
    },
  ];
}

export function canMoveTo(
  currentPosition: Position,
  targetPosition: Position,
  conditions: ConditionState[],
  _combatants: Combatant[],
): boolean {
  for (const condition of conditions) {
    if (
      (condition.id === "charmed" ||
        condition.id === "frightened" ||
        condition.id === "feared") &&
      condition.movementRestrictions
    ) {
      for (const restriction of condition.movementRestrictions) {
        const currentInside = isPointInsideRectangle(
          currentPosition,
          restriction,
        );

        const targetInside = isPointInsideRectangle(
          targetPosition,
          restriction,
        );

        // The character can move freely while inside
        // the fixed restriction.
        //
        // They cannot cross the boundary and leave it.
        if (currentInside && !targetInside) {
          return false;
        }
      }
    }
  }

  return true;
}
