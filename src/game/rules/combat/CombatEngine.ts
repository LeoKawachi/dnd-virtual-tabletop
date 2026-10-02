import type { CombatState } from "./CombatState";
import { startTurn, getCurrentCombatant } from "./Turn";
import type { Combatant } from "./Combatant";
import type { CombatActionType } from "./Action";
import { roundToOneDecimal } from "../dice/Dice";
import {
  resolveAttack,
  rollAttackDamage,
  resolveAbilityInstanceAttack,
  type AttackResult,
  type AttackType,
  type AbilityInstanceAttackResult,
} from "./Attack";
import type { CombatAttackRequest, CombatAttackResult } from "./CombatAttack";
import type { ConditionId } from "../condition/Condition";
import type { ConditionState } from "../condition/ConditionState";
import {
  calculateDistance,
  calculateMovementCost,
  type MovementType,
  type Position,
} from "./Movement";
import {
  canMove,
  canMoveTo,
  canUseAction,
  canUseBonusAction,
  canUseReaction,
  canUseSpecialMovement,
  canAttackTarget,
  createMovementRestrictions,
} from "../condition/ConditionRestrictions";
import { getConditionDamage } from "../condition/ConditionDamage";
import { calculateForcedMovement } from "../condition/ConditionForcedMovement";
import { shouldWakeFromDamage } from "../condition/ConditionWake";
import { getTotalConditionResistance } from "../condition/ConditionResistanceResolver";
import type { DamageResult, DamageExpression } from "./Damage";
import { rollDamage } from "./Damage";
import {
  increaseConditionResistance,
  rollConditionResistance,
} from "./EffectResistance";

import { CONDITION_RESISTANCE_CONFIG } from "../condition/ConditionResistance";
import { getOpportunityAttackers } from "./OpportunityAttack";
import { isInMeleeRange } from "./Engagement";
import { getConditionMovementMultiplier } from "../condition/ConditionMovement";
import { recordObservedAttack } from "../combat/PatternKnowledgeManager";
import type { CharacterStats } from "../stats/Stats";
import type { DefenseChoice } from "./Defense";
import { succeedsPercentage } from "../dice/Dice";
import { getDefenseStats } from "./Defense";
import { applyParry } from "./Parry";
import { getEffectiveArmor } from "../condition/ConditionArmor";
import { getEffectiveMagicResistance } from "../condition/ConditionMagicResistance";
import { getIncomingDamageMultiplier } from "../condition/ConditionDamageModifier";
import { getConditionDodgeMultiplier } from "../condition/ConditionDefense";
import type {
  AbilityEffect,
  AbilityInstanceTrigger,
} from "../abilities/AbilityEffect";
import {
  consumeModifier,
  getModifierValue,
  getModifierMultiplier,
  type CombatModifier,
} from "./CombatModifier";
import { executeAbilityEffects } from "../abilities/AbilityEffectExecutor";
import type {
  AbilityInstance,
  AbilityInstanceEffect,
} from "../abilities/AbilityInstance";
import type { AbilityArea } from "../abilities/Ability";
import { resolveAbilityCheck } from "../abilities/AbilityCheck";
import { resolveConcentrationCheck } from "./Concentration";

import { CombatRegister } from "./CombatRegister";

interface PendingDefense {
  attackerId: string;
  defenderId: string;
  attack: AttackResult;
  damage: DamageResult;
  damageExpression: DamageExpression;
  attackerStats: CharacterStats;
  defenderStats: CharacterStats;
  defenderHpBefore: number;
  type: AttackType;
  abilityId?: string;
  remainingEffects?: AbilityEffect[];
}
export class CombatEngine {
  private state: CombatState;
  private abilityInstances: AbilityInstance[] = [];
  private readonly random: () => number;
  private pendingDefenses: PendingDefense[] = [];
  private lastCombatResult: CombatAttackResult | null = null;
  private readonly combatRegister = new CombatRegister();

  constructor(state: CombatState, random: () => number = Math.random) {
    this.state = state;
    this.random = random;
  }

  private pendingMovement: {
    combatantId: string;
    previousPosition: Position;
    position: Position;
    movementCost: number;
  } | null = null;

  public getState(): CombatState {
    return this.state;
  }

  public getCurrentCombatant(): Combatant | undefined {
    return getCurrentCombatant(this.state);
  }

  public getCombatRegister(): CombatRegister {
    return this.combatRegister;
  }

  public rollRandom(): number {
    return this.random();
  }

  public getPendingDefense(): PendingDefense | null {
    return this.pendingDefenses[0] ?? null;
  }

  public getPendingDefenseCount(): number {
    return this.pendingDefenses.length;
  }

  public startCombat(): void {
    this.startTurn();
  }

  public startTurn(): void {
    this.state = startTurn(this.state);

    const current = this.getCurrentCombatant();

    if (!current) {
      return;
    }
    this.processAbilityInstanceDurations(current);
    this.processAbilityInstanceEffects(current, "turn-start");
  }

  endTurn(): void {
    const current = this.getCurrentCombatant();

    if (current) {
      this.processTurnModifierDurations(current);
      this.processAbilityInstanceEffects(current, "turn-end");
    }

    const nextIndex = this.state.currentTurnIndex + 1;

    if (nextIndex >= this.state.combatants.length) {
      this.state.round += 1;
      this.state.currentTurnIndex = 0;

      this.processConditionDamage();
      this.state.conditionManager.processRoundStart();

      this.startTurn();
      return;
    }

    this.state.currentTurnIndex = nextIndex;
    this.startTurn();
  }

  useAction(type: CombatActionType): boolean {
    const current = this.getCurrentCombatant();

    if (!current || !current.alive) {
      return false;
    }

    const conditions = this.state.conditionManager.getConditions(current.id);

    if (type === "action" && !canUseAction(conditions)) {
      return false;
    }

    if (type === "bonus-action" && !canUseBonusAction(conditions)) {
      return false;
    }

    if (type === "reaction" && !canUseReaction(conditions)) {
      return false;
    }

    if (!this.isActionAvailable(type, current)) {
      return false;
    }

    switch (type) {
      case "action":
        current.actionAvailable = false;
        break;

      case "bonus-action":
        current.bonusActionAvailable = false;
        break;

      case "reaction":
        current.reactionAvailable = false;
        break;
    }

    return true;
  }

  private isActionAvailable(
    type: CombatActionType,
    combatant: Combatant,
  ): boolean {
    switch (type) {
      case "action":
        return combatant.actionAvailable;

      case "bonus-action":
        return combatant.bonusActionAvailable;

      case "reaction":
        return combatant.reactionAvailable;
    }
  }

  public attack(request: CombatAttackRequest): CombatAttackResult {
    const attacker = this.state.combatants.find(
      (combatant) => combatant.id === request.attackerId,
    );

    if (!attacker || this.getCurrentCombatant()?.id !== attacker.id) {
      return {
        success: false,
        attackerId: request.attackerId,
        defenderId: request.defenderId,
      };
    }

    const conditions = this.state.conditionManager.getConditions(attacker.id);

    if (!canUseAction(conditions)) {
      return {
        success: false,
        attackerId: request.attackerId,
        defenderId: request.defenderId,
      };
    }

    if (!attacker.actionAvailable) {
      return {
        success: false,
        attackerId: request.attackerId,
        defenderId: request.defenderId,
      };
    }

    return this.resolveCombatAttack(request, "action", true);
  }

  public attackMultiple(requests: CombatAttackRequest[]): CombatAttackResult[] {
    if (requests.length === 0) {
      return [];
    }

    const attackerId = requests[0].attackerId;

    if (requests.some((request) => request.attackerId !== attackerId)) {
      return requests.map((request) => ({
        success: false,
        attackerId: request.attackerId,
        defenderId: request.defenderId,
      }));
    }

    const attacker = this.state.combatants.find(
      (combatant) => combatant.id === attackerId,
    );

    if (!attacker || this.getCurrentCombatant()?.id !== attacker.id) {
      return requests.map((request) => ({
        success: false,
        attackerId: request.attackerId,
        defenderId: request.defenderId,
      }));
    }

    const conditions = this.state.conditionManager.getConditions(attacker.id);

    if (!canUseAction(conditions) || !attacker.actionAvailable) {
      return requests.map((request) => ({
        success: false,
        attackerId: request.attackerId,
        defenderId: request.defenderId,
      }));
    }

    attacker.actionAvailable = false;

    return requests.map((request) =>
      this.resolveCombatAttack(request, "action", false),
    );
  }

  public getLastCombatResult(): CombatAttackResult | null {
    return this.lastCombatResult;
  }

  move(position: Position, type: MovementType = "walk"): boolean {
    const current = this.getCurrentCombatant();

    if (!current || !current.alive) {
      return false;
    }

    const conditions = this.state.conditionManager.getConditions(current.id);

    if (!canMove(conditions)) {
      return false;
    }

    if (
      !canMoveTo(current.position, position, conditions, this.state.combatants)
    ) {
      return false;
    }

    if (type !== "walk" && !canUseSpecialMovement(conditions)) {
      return false;
    }

    const distance = calculateDistance(current.position, position);
    const movementCost = calculateMovementCost(distance, type);

    const movementMultiplier = getConditionMovementMultiplier(conditions);
    const effectiveMovementRemaining =
      current.movementRemaining * movementMultiplier;

    const previousPosition = { ...current.position };

    if (movementCost > effectiveMovementRemaining) {
      return false;
    }

    // Only walking can trigger opportunity attacks.
    const opportunityAttackers =
      type === "walk"
        ? getOpportunityAttackers(
            current,
            previousPosition,
            position,
            this.state.combatants,
          )
        : [];

    for (const opportunityAttacker of opportunityAttackers) {
      const defender = this.state.combatants.find(
        (combatant) => combatant.id === current.id,
      );

      if (!defender || !defender.alive) {
        break;
      }

      const attacker = this.state.combatants.find(
        (combatant) => combatant.id === opportunityAttacker.id,
      );

      if (!attacker || !attacker.alive) {
        continue;
      }

      const aooResult = this.performOpportunityAttack(attacker, defender);

      this.lastCombatResult = aooResult;
    }

    // If the AOO hit, the defender must choose
    // Dodge or Parry before movement continues.
    if (this.pendingDefenses.length > 0) {
      this.pendingMovement = {
        combatantId: current.id,
        previousPosition,
        position: { ...position },
        movementCost,
      };

      return true;
    }

    // No defense is required, so movement happens immediately.
    current.position = { ...position };
    current.movementRemaining -= movementCost;

    this.processAbilityInstanceMovementEffects(current, previousPosition);

    return true;
  }

  public teleport(targetId: string, position: Position): boolean {
    const target = this.state.combatants.find(
      (combatant) => combatant.id === targetId,
    );

    if (!target || !target.alive) {
      return false;
    }

    target.position = { ...position };

    return true;
  }

  public getDistanceBetween(
    firstId: string,
    secondId: string,
  ): number | undefined {
    const first = this.state.combatants.find(
      (combatant) => combatant.id === firstId,
    );

    const second = this.state.combatants.find(
      (combatant) => combatant.id === secondId,
    );

    if (!first || !second) {
      return undefined;
    }

    return calculateDistance(first.position, second.position);
  }

  public addModifier(combatantId: string, modifier: CombatModifier): void {
    const combatant = this.state.combatants.find(
      (current) => current.id === combatantId,
    );

    if (!combatant) {
      throw new Error(`Combatant "${combatantId}" not found.`);
    }

    // Temporary HP is a single pool.
    // Applying new temporary HP replaces the old pool.
    if (modifier.temporaryHp !== undefined) {
      combatant.modifiers = combatant.modifiers.filter(
        (current) => current.temporaryHp === undefined,
      );

      combatant.temporaryHp = modifier.temporaryHp;

      combatant.modifiers.push({ ...modifier });
      return;
    }

    const existingModifier = modifier.id
      ? combatant.modifiers.find((current) => current.id === modifier.id)
      : undefined;

    if (existingModifier) {
      existingModifier.value = modifier.value;
      existingModifier.amount = modifier.amount;
      existingModifier.duration = modifier.duration;
      existingModifier.diceCount = modifier.diceCount;
      existingModifier.diceSides = modifier.diceSides;
      return;
    }

    combatant.modifiers.push({ ...modifier });
  }

  public applyCondition(
    targetId: string,
    conditionId: ConditionId,
    duration: number,
    stacks = 1,
    value?: number,
    sourceId?: string,
  ): ConditionState | undefined {
    const target = this.state.combatants.find(
      (combatant) => combatant.id === targetId,
    );

    if (!target || !target.alive) {
      throw new Error("Cannot apply condition to an invalid combatant.");
    }

    const resistanceState = this.state.conditionManager.getConditionResistance(
      targetId,
      conditionId,
    );

    const totalResistance = getTotalConditionResistance(
      target.stats,
      conditionId,
      resistanceState,
    );

    if (
      totalResistance > 0 &&
      rollConditionResistance(
        {
          ...resistanceState,
          resistance: totalResistance,
        },
        this.random,
      )
    ) {
      return undefined;
    }

    let source: Combatant | undefined;

    if (sourceId) {
      source = this.state.combatants.find(
        (combatant) => combatant.id === sourceId,
      );

      if (!source) {
        throw new Error("Condition source must exist.");
      }
    }

    const movementRestrictions =
      (conditionId === "charmed" || conditionId === "frightened") && source
        ? createMovementRestrictions(
            conditionId,
            source.position,
            target.position,
          )
        : undefined;

    const condition = this.state.conditionManager.applyCondition(
      targetId,
      conditionId,
      duration,
      stacks,
      value,
      sourceId,
      movementRestrictions,
    );

    const updatedResistance = increaseConditionResistance(
      resistanceState,
      CONDITION_RESISTANCE_CONFIG.applicationResistanceIncrease,
    );

    this.state.conditionManager.setConditionResistance(
      targetId,
      updatedResistance,
    );

    if (conditionId === "pulled" || conditionId === "pushed") {
      if (!sourceId) {
        throw new Error("Forced movement conditions require a source.");
      }

      const forcedMovementSource = this.state.combatants.find(
        (combatant) => combatant.id === sourceId,
      );

      if (!forcedMovementSource) {
        throw new Error("Forced movement source and target must exist.");
      }

      target.position = calculateForcedMovement(
        target.position,
        forcedMovementSource.position,
        condition,
      );
    }

    return condition;
  }

  removeCondition(targetId: string, conditionId: ConditionId): boolean {
    return this.state.conditionManager.removeCondition(targetId, conditionId);
  }

  hasCondition(targetId: string, conditionId: ConditionId): boolean {
    return this.state.conditionManager.hasCondition(targetId, conditionId);
  }

  getConditions(targetId: string): ConditionState[] {
    return this.state.conditionManager.getConditions(targetId);
  }

  getCondition(
    targetId: string,
    conditionId: ConditionId,
  ): ConditionState | undefined {
    return this.state.conditionManager.getCondition(targetId, conditionId);
  }

  public consumeConditions(
    targetId: string,
    conditionIds: ConditionId[],
  ): void {
    const conditions = this.state.conditionManager.getConditions(targetId);

    for (const conditionId of conditionIds) {
      const condition = conditions.find(
        (currentCondition) => currentCondition.id === conditionId,
      );

      if (!condition) {
        continue;
      }

      const damage = getConditionDamage(condition);

      if (!damage) {
        continue;
      }

      this.state.conditionManager.removeCondition(targetId, conditionId);
    }
  }

  private processConditionDamage(): void {
    const allConditions = this.state.conditionManager.getAllConditions();

    for (const [targetId, conditions] of allConditions) {
      const combatant = this.state.combatants.find(
        (current) => current.id === targetId,
      );

      if (!combatant || !combatant.alive) {
        continue;
      }

      for (const condition of conditions) {
        const damage = getConditionDamage(condition);

        if (!damage) {
          continue;
        }

        const actualDamage = this.applyDamageToCombatant(
          combatant,
          damage.totalDamage,
        );

        if (actualDamage > 0) {
          this.combatRegister.record({
            type: "damage",
            round: this.state.round,
            targetId: combatant.id,
            amount: actualDamage,
            damageType: "magic",
            conditionId: condition.id,
          });
        }

        if (combatant.hp === 0) {
          combatant.alive = false;
          this.endConcentration(combatant);
        }

        if (damage.totalDamage > 0) {
          this.checkConcentration(combatant);
        }
      }
    }
  }

  public grantAction(combatantId: string): void {
    const combatant = this.state.combatants.find(
      (combatant) => combatant.id === combatantId,
    );

    if (!combatant || !combatant.alive) {
      return;
    }

    combatant.actionAvailable = true;
  }

  public getOpportunityAttackersForMove(
    position: Position,
    type: MovementType = "walk",
  ): Combatant[] {
    const current = this.getCurrentCombatant();

    if (!current || !current.alive || type !== "walk") {
      return [];
    }

    return getOpportunityAttackers(
      current,
      current.position,
      position,
      this.state.combatants,
    );
  }

  public damage(
    targetId: string,
    expression: DamageExpression,
    damageShareSourceId?: string,
  ): number {
    const target = this.getState().combatants.find(
      (combatant) => combatant.id === targetId,
    );

    if (!target) {
      return 0;
    }

    if (!target.alive) {
      return 0;
    }

    const conditions = this.state.conditionManager.getConditions(target.id);

    const result = rollDamage(expression);

    const damageSplit = this.splitDamageSharing(target, result.rawDamage);
    const targetDamage = this.calculateMitigatedDamage(
      target,
      damageSplit.targetDamage,
      expression.type === "magic" ? "spell" : "melee",
      damageShareSourceId ?? "",
    );

    const actualDamage = this.applyDamageToCombatant(
      target,
      roundToOneDecimal(targetDamage),
    );

    if (damageSplit.partner && damageSplit.partnerDamage > 0) {
      const partnerDamage = this.calculateMitigatedDamage(
        damageSplit.partner,
        damageSplit.partnerDamage,
        expression.type === "magic" ? "spell" : "melee",
        damageShareSourceId ?? "",
      );

      const actualPartnerDamage = this.applyDamageToCombatant(
        damageSplit.partner,
        roundToOneDecimal(partnerDamage),
      );

      if (actualPartnerDamage > 0) {
        this.combatRegister.record({
          type: "damage",
          round: this.state.round,
          targetId: damageSplit.partner.id,
          amount: actualPartnerDamage,
          damageType: expression.type ?? "physical",
        });
      }
      if (damageSplit.partner.hp === 0) {
        damageSplit.partner.alive = false;
        this.endConcentration(damageSplit.partner);
      }
    }

    //const hpBefore = target.hp;

    /*console.log("[DAMAGE]", {
      target: target.name,
      type: expression.type,
      hpBefore,
      hpAfter: target.hp,
      temporaryHpAfter: target.temporaryHp,
      armor: target.armor,
      magicResistance: target.magicResistance,
      finalDamage: result.finalDamage,
      damageResult: result,
    });*/

    if (actualDamage > 0) {
      this.combatRegister.record({
        type: "damage",
        round: this.state.round,
        targetId: target.id,
        amount: actualDamage,
        damageType: expression.type ?? "physical",
      });
    }

    if (target.hp === 0) {
      target.alive = false;
      this.endConcentration(target);
    }

    if (actualDamage > 0) {
      this.checkConcentration(target);
    }

    if (shouldWakeFromDamage(conditions, actualDamage)) {
      this.state.conditionManager.removeCondition(target.id, "sleeping");
    }

    return actualDamage;
  }

  private applyDamageToCombatant(target: Combatant, damage: number): number {
    if (damage <= 0) {
      return 0;
    }

    const currentTemporaryHp = target.temporaryHp ?? 0;
    const temporaryDamage = Math.min(currentTemporaryHp, damage);
    target.temporaryHp = currentTemporaryHp - temporaryDamage;

    const remainingDamage = damage - temporaryDamage;

    const hpBefore = target.hp;

    target.hp = roundToOneDecimal(Math.max(0, target.hp - remainingDamage));

    return temporaryDamage + (hpBefore - target.hp);
  }

  private getDamageSharingModifier(
    target: Combatant,
  ): CombatModifier | undefined {
    return target.modifiers.find(
      (modifier) => modifier.damageSharing !== undefined,
    );
  }

  private splitDamageSharing(
    target: Combatant,
    rawDamage: number,
  ): {
    targetDamage: number;
    partner?: Combatant;
    partnerDamage: number;
  } {
    const modifier = this.getDamageSharingModifier(target);

    if (!modifier?.damageSharing || rawDamage <= 0) {
      return {
        targetDamage: rawDamage,
        partnerDamage: 0,
      };
    }

    const { partnerId, percentage } = modifier.damageSharing;

    const partner = this.state.combatants.find(
      (combatant) => combatant.id === partnerId,
    );

    if (!partner || !partner.alive) {
      return {
        targetDamage: rawDamage,
        partnerDamage: 0,
      };
    }

    const partnerDamage = Math.max(1, rawDamage * (percentage / 100));

    const targetDamage = Math.max(1, rawDamage * (1 - percentage / 100));

    return {
      targetDamage,
      partner,
      partnerDamage,
    };
  }

  private calculateMitigatedDamage(
    target: Combatant,
    rawDamage: number,
    attackType: AttackType,
    attackerId: string,
  ): number {
    if (rawDamage <= 0) {
      return 0;
    }

    const conditions = this.state.conditionManager.getConditions(target.id);

    let damage = rawDamage;

    if (attackType === "spell") {
      const conditionMagicResistance = getEffectiveMagicResistance(
        target.magicResistance,
        conditions,
      );

      const modifierMagicResistanceBonus = getModifierValue(
        target.modifiers,
        "magic-resistance",
        "add",
        "turn",
      );

      const modifierMagicResistanceMultiplier = getModifierMultiplier(
        target.modifiers,
        "magic-resistance",
        "turn",
      );

      const effectiveMagicResistance =
        (conditionMagicResistance + modifierMagicResistanceBonus) *
        modifierMagicResistanceMultiplier;

      const attacker = this.state.combatants.find(
        (combatant) => combatant.id === attackerId,
      );

      const magicPenetration = getModifierValue(
        attacker?.modifiers ?? [],
        "magic-penetration",
        "add",
        "spell",
      );

      const magicResistanceAfterPenetration = Math.max(
        0,
        effectiveMagicResistance - magicPenetration,
      );

      damage = Math.max(0, damage - magicResistanceAfterPenetration);
    } else {
      const conditionArmor = getEffectiveArmor(target.armor, conditions);

      const modifierArmorBonus = getModifierValue(
        target.modifiers,
        "armor",
        "add",
        "turn",
      );

      const modifierArmorMultiplier = getModifierMultiplier(
        target.modifiers,
        "armor",
        "turn",
      );

      const effectiveArmor =
        (conditionArmor + modifierArmorBonus) * modifierArmorMultiplier;

      const attacker = this.state.combatants.find(
        (combatant) => combatant.id === attackerId,
      );

      const armorPenetration = getModifierValue(
        attacker?.modifiers ?? [],
        "armor-penetration",
        "add",
        "attack",
      );

      const armorAfterPenetration = Math.max(
        0,
        effectiveArmor - armorPenetration,
      );

      damage = Math.max(0, damage - armorAfterPenetration);
    }

    const damageMultiplier = getIncomingDamageMultiplier(conditions);

    return Math.max(1, damage * damageMultiplier);
  }

  public heal(targetId: string, amount: number): number {
    const target = this.state.combatants.find(
      (combatant) => combatant.id === targetId,
    );

    if (!target || !target.alive || amount <= 0) {
      return 0;
    }

    const conditions = this.state.conditionManager.getConditions(targetId);

    // Cursed completely prevents healing.
    if (conditions.some((condition) => condition.id === "cursed")) {
      return 0;
    }

    //Anti heal reduces healing by 50%.
    if (conditions.some((condition) => condition.id === "anti-heal")) {
      amount = Math.round(amount * 0.5 * 100) / 100;
    }

    // Bleeding reduces healing by 25%.
    if (conditions.some((condition) => condition.id === "bleeding")) {
      amount = Math.round(amount * 0.25 * 100) / 100;
    }

    console.log(`Healing ${targetId}: ${amount}`);

    if (amount <= 0) {
      return 0;
    }

    const hpBefore = target.hp;

    target.hp = roundToOneDecimal(Math.min(target.maxHp, target.hp + amount));
    const actualHealing = target.hp - hpBefore;

    if (actualHealing > 0) {
      this.combatRegister.record({
        type: "healing",
        round: this.state.round,
        targetId: target.id,
        amount: actualHealing,
      });
    }

    return actualHealing;
  }

  private performOpportunityAttack(
    attacker: Combatant,
    defender: Combatant,
  ): CombatAttackResult {
    const distance = calculateDistance(attacker.position, defender.position);

    const request: CombatAttackRequest = {
      attackerId: attacker.id,
      defenderId: defender.id,
      type: "melee",
      distance,
      target: "body",
      attackerLevel: attacker.level,

      // Temporary until equipment provides the weapon attack.
      damage: {
        count: 1,
        sides: 8,
        type: "physical",
      },

      attackerConditions: this.state.conditionManager.getConditions(
        attacker.id,
      ),

      defenderConditions: this.state.conditionManager.getConditions(
        defender.id,
      ),
    };

    return this.resolveCombatAttack(request, "opportunity");
  }

  private resolveCombatAttack(
    request: CombatAttackRequest,
    resource: "action" | "opportunity",
    consumeAction = false,
  ): CombatAttackResult {
    const attackerIndex = this.state.combatants.findIndex(
      (combatant) => combatant.id === request.attackerId,
    );

    const defenderIndex = this.state.combatants.findIndex(
      (combatant) => combatant.id === request.defenderId,
    );

    if (attackerIndex === -1 || defenderIndex === -1) {
      return {
        success: false,
        attackerId: request.attackerId,
        defenderId: request.defenderId,
      };
    }

    const attacker = this.state.combatants[attackerIndex];
    const defender = this.state.combatants[defenderIndex];

    if (!attacker.alive || !defender.alive) {
      return {
        success: false,
        attackerId: request.attackerId,
        defenderId: request.defenderId,
      };
    }

    if (
      request.type === "melee" &&
      !isInMeleeRange(attacker.position, defender.position)
    ) {
      return {
        success: false,
        attackerId: request.attackerId,
        defenderId: request.defenderId,
      };
    }

    const attackerConditions = this.state.conditionManager.getConditions(
      attacker.id,
    );

    if (!canAttackTarget(defender.id, attackerConditions)) {
      return {
        success: false,
        attackerId: request.attackerId,
        defenderId: request.defenderId,
      };
    }

    const defenderConditions = this.state.conditionManager.getConditions(
      defender.id,
    );

    this.state.patternKnowledge = recordObservedAttack(
      this.state.patternKnowledge,
      defender.id,
      attacker.id,
      defender.stats.intelligence,
    );

    const patternKnowledge = this.state.patternKnowledge[defender.id]?.find(
      (knowledge) => knowledge.targetId === attacker.id,
    );

    const attack = resolveAttack({
      attackerId: attacker.id,
      defenderId: defender.id,
      type: request.type,
      attackerStats: attacker.stats,
      defenderStats: defender.stats,
      distance: request.distance,
      target: request.target,
      damage: request.damage,
      armor: defender.armor,
      magicResistance: defender.magicResistance,
      attackerConditions,
      defenderConditions,
      patternBonus: patternKnowledge?.bonus ?? 0,
      attackerLevel: attacker.level,
      attackerModifiers: [
        ...attacker.modifiers,
        ...(request.temporaryModifiers ?? []),
      ],
      defenderModifiers: defender.modifiers,
    });

    this.consumeAttackRollModifiers(attacker);

    if (resource === "action" && consumeAction) {
      attacker.actionAvailable = false;
    }

    const hpBefore = defender.hp;

    if (!attack.hit) {
      this.consumeAttackModifiers(attacker, request.type);
      return {
        success: true,
        status: "resolved",
        attackerId: attacker.id,
        defenderId: defender.id,
        attack,
        attackerStats: attacker.stats,
        defenderStats: defender.stats,
        defenderHpBefore: hpBefore,
        defenderHpAfter: hpBefore,
      };
    }

    const damageBlocked = this.isDamageBlocked(attacker.id, defender.id);

    if (damageBlocked) {
      this.consumeAttackModifiers(attacker, request.type);

      return {
        success: true,
        status: "resolved",
        attackerId: attacker.id,
        defenderId: defender.id,
        attack,
        attackerStats: attacker.stats,
        defenderStats: defender.stats,
        defenderHpBefore: hpBefore,
        defenderHpAfter: hpBefore,
      };
    }

    const attackDamage = rollAttackDamage(
      {
        attackerId: attacker.id,
        defenderId: defender.id,
        type: request.type,
        attackerStats: attacker.stats,
        defenderStats: defender.stats,
        distance: request.distance,
        target: request.target,
        damage: request.damage,
        armor: defender.armor,
        magicResistance: defender.magicResistance,
        attackerConditions,
        defenderConditions,
        patternBonus: patternKnowledge?.bonus ?? 0,
        attackerLevel: attacker.level,
        attackerModifiers: [
          ...attacker.modifiers,
          ...(request.temporaryModifiers ?? []),
        ],
        defenderModifiers: defender.modifiers,
      },
      {
        casterHealthPercent: (attacker.hp / attacker.maxHp) * 100,
        targetHealthPercent: (defender.hp / defender.maxHp) * 100,
        distance: request.distance,
        turn: this.state.round,
        targetCreatureType: defender.creatureType,
        targetId: defender.id,
      },
    );

    const damageMultiplier = request.damageMultiplier ?? 1;

    const adjustedDamage: DamageResult = {
      ...attackDamage.damage,
      rawDamage: attackDamage.damage.rawDamage * damageMultiplier,
      finalDamage: attackDamage.damage.finalDamage * damageMultiplier,
    };

    this.consumeAttackModifiers(attacker, request.type);

    const isAllyTarget = attacker.team === defender.team;

    if (isAllyTarget) {
      // Friendly attacks still roll to hit, but the ally never gets
      // a Dodge/Parry reaction.
      this.applyDamageAndEffectsImmediately(
        attacker.id,
        defender.id,
        adjustedDamage,
        request.remainingEffects,
        request.abilityId,
        request.type,
      );

      return {
        success: true,
        status: "resolved",
        attackerId: attacker.id,
        defenderId: defender.id,
        attack,
        damage: adjustedDamage,
        attackerStats: attacker.stats,
        defenderStats: defender.stats,
        defenderHpBefore: hpBefore,
        defenderHpAfter: defender.hp,
      };
    }

    this.pendingDefenses.push({
      attackerId: attacker.id,
      defenderId: defender.id,
      attack,
      damage: adjustedDamage,
      damageExpression: request.damage,
      attackerStats: attacker.stats,
      defenderStats: defender.stats,
      defenderHpBefore: hpBefore,
      type: request.type,
      abilityId: request.abilityId,
      remainingEffects: request.remainingEffects,
    });

    return {
      success: true,
      status: "awaiting-defense",
      attackerId: attacker.id,
      defenderId: defender.id,
      attack,
      damage: adjustedDamage,
    };
  }

  public resolveDefense(choice: DefenseChoice): CombatAttackResult {
    const pending = this.pendingDefenses[0];
    if (!pending) {
      return {
        success: false,
        attackerId: "",
        defenderId: "",
      };
    }

    const defender = this.state.combatants.find(
      (combatant) => combatant.id === pending.defenderId,
    );

    if (!defender || !defender.alive) {
      this.pendingDefenses.shift();
      if (this.pendingMovement) {
        const movingCombatant = this.state.combatants.find(
          (combatant) => combatant.id === this.pendingMovement!.combatantId,
        );

        if (movingCombatant && movingCombatant.alive) {
          const previousPosition = this.pendingMovement.previousPosition;

          movingCombatant.position = {
            ...this.pendingMovement.position,
          };

          movingCombatant.movementRemaining -=
            this.pendingMovement.movementCost;

          this.processAbilityInstanceMovementEffects(
            movingCombatant,
            previousPosition,
          );
        }

        this.pendingMovement = null;
      }

      return {
        success: false,
        attackerId: pending.attackerId,
        defenderId: pending.defenderId,
      };
    }

    const defenderConditions = this.state.conditionManager.getConditions(
      defender.id,
    );

    const hpBefore = defender.hp;

    let finalDamage = pending.damage.rawDamage;
    let dodged = false;
    let parried = false;

    if (choice === "dodge") {
      const defenseStats = getDefenseStats(defender.stats);

      const baseDodge =
        pending.type === "spell"
          ? defenseStats.spellDodge
          : defenseStats.physicalDodge;

      const conditionDodge =
        baseDodge * getConditionDodgeMultiplier(defenderConditions);

      const modifierDodgeBonus = getModifierValue(
        defender.modifiers,
        "defense",
        "add",
        "turn",
      );

      const modifierDodgeMultiplier = getModifierMultiplier(
        defender.modifiers,
        "defense",
        "turn",
      );

      const dodgeChance = Math.max(
        0,
        Math.min(
          100,
          (conditionDodge + modifierDodgeBonus) * modifierDodgeMultiplier,
        ),
      );

      const dodgeRoll = this.random() * 100;

      dodged = succeedsPercentage(dodgeChance, dodgeRoll);

      if (dodged) {
        finalDamage = 0;
      }
    }

    if (choice === "parry") {
      if (!defender.reactionAvailable) {
        return {
          success: false,
          attackerId: pending.attackerId,
          defenderId: pending.defenderId,
        };
      }

      defender.reactionAvailable = false;
      parried = true;

      finalDamage = applyParry(defender.stats, finalDamage);
    }

    const damageSplit = this.splitDamageSharing(defender, finalDamage);

    finalDamage = damageSplit.targetDamage;

    const sharedPartner = damageSplit.partner;
    const sharedPartnerDamage = damageSplit.partnerDamage;

    let finalPartnerDamage = 0;

    if (!dodged && sharedPartner) {
      finalPartnerDamage = this.calculateMitigatedDamage(
        sharedPartner,
        sharedPartnerDamage,
        pending.type,
        pending.attackerId,
      );

      finalPartnerDamage = roundToOneDecimal(finalPartnerDamage);
    }

    if (!dodged) {
      finalDamage = this.calculateMitigatedDamage(
        defender,
        finalDamage,
        pending.type,
        pending.attackerId,
      );
    }

    finalDamage = roundToOneDecimal(finalDamage);

    const shouldWake = shouldWakeFromDamage(defenderConditions, finalDamage);

    if (shouldWake) {
      this.state.conditionManager.removeCondition(defender.id, "sleeping");
    }

    const actualDamage = this.applyDamageToCombatant(defender, finalDamage);

    let actualPartnerDamage = 0;

    if (sharedPartner && finalPartnerDamage > 0) {
      actualPartnerDamage = this.applyDamageToCombatant(
        sharedPartner,
        finalPartnerDamage,
      );

      sharedPartner.alive = sharedPartner.hp > 0;

      if (!sharedPartner.alive) {
        this.endConcentration(sharedPartner);
      }
    }

    /*console.log("[COMBAT DAMAGE]", {
      attacker: pending.attackerId,
      defender: defender.id,
      abilityId: pending.abilityId,
      finalDamage,
      actualDamage,
      defenderHpBefore: defender.hp + actualDamage,
      defenderHpAfter: defender.hp,
      wardingBond: this.getDamageSharingModifier(defender)?.damageSharing,
    });*/

    defender.alive = defender.hp > 0;

    if (!defender.alive) {
      this.endConcentration(defender);
    }

    if (finalDamage > 0) {
      this.checkConcentration(defender);
    }

    if (actualDamage > 0) {
      this.combatRegister.record({
        type: "damage",
        round: this.state.round,
        sourceId: pending.attackerId,
        targetId: defender.id,
        amount: actualDamage,
        damageType: pending.type === "spell" ? "magic" : "physical",
        abilityId: pending.abilityId,
      });
    }

    if (sharedPartner && actualPartnerDamage > 0) {
      this.combatRegister.record({
        type: "damage",
        round: this.state.round,
        sourceId: pending.attackerId,
        targetId: sharedPartner.id,
        amount: actualPartnerDamage,
        damageType: pending.type === "spell" ? "magic" : "physical",
        abilityId: pending.abilityId,
      });
    }

    if (actualDamage > 0 && pending.damageExpression.consumeConditions) {
      this.consumeConditions(
        defender.id,
        pending.damageExpression.consumeConditions,
      );
    }

    if (!dodged && defender.alive && pending.remainingEffects?.length) {
      executeAbilityEffects(
        pending.remainingEffects,
        {
          casterId: pending.attackerId,
          targetId: pending.defenderId,
        },
        this,
        pending.abilityId ?? "",
      );
    }

    this.pendingDefenses.shift();

    if (this.pendingMovement) {
      const movingCombatant = this.state.combatants.find(
        (combatant) => combatant.id === this.pendingMovement!.combatantId,
      );

      if (movingCombatant && movingCombatant.alive) {
        const previousPosition = this.pendingMovement.previousPosition;

        movingCombatant.position = {
          ...this.pendingMovement.position,
        };

        movingCombatant.movementRemaining -= this.pendingMovement.movementCost;

        this.processAbilityInstanceMovementEffects(
          movingCombatant,
          previousPosition,
        );
      }

      this.pendingMovement = null;
    }

    return {
      success: true,
      status: "resolved",
      attackerId: pending.attackerId,
      defenderId: pending.defenderId,
      attack: pending.attack,
      damage: {
        ...pending.damage,
        finalDamage,
      },
      parried,
      dodged,
      attackerStats: pending.attackerStats,
      defenderStats: pending.defenderStats,
      defenderHpBefore: hpBefore,
      defenderHpAfter: defender.hp,
    };
  }

  private applyDamageAndEffectsImmediately(
    attackerId: string,
    defenderId: string,
    damage: DamageResult,
    remainingEffects?: AbilityEffect[],
    abilityId?: string,
    attackType: AttackType = "melee",
  ): void {
    const defender = this.state.combatants.find(
      (combatant) => combatant.id === defenderId,
    );

    if (!defender) {
      return;
    }

    const defenderConditions =
      this.state.conditionManager.getConditions(defenderId);

    const rawDamage = roundToOneDecimal(Math.max(1, damage.rawDamage));

    const damageSplit = this.splitDamageSharing(defender, rawDamage);
    const targetDamage = this.calculateMitigatedDamage(
      defender,
      damageSplit.targetDamage,
      attackType,
      attackerId,
    );

    const actualDamage = this.applyDamageToCombatant(
      defender,
      roundToOneDecimal(targetDamage),
    );

    const shouldWake = shouldWakeFromDamage(defenderConditions, actualDamage);
    if (shouldWake) {
      this.state.conditionManager.removeCondition(defenderId, "sleeping");
    }

    if (damageSplit.partner && damageSplit.partnerDamage > 0) {
      const partnerDamage = this.calculateMitigatedDamage(
        damageSplit.partner,
        damageSplit.partnerDamage,
        attackType,
        attackerId,
      );

      const actualPartnerDamage = this.applyDamageToCombatant(
        damageSplit.partner,
        roundToOneDecimal(partnerDamage),
      );

      if (actualPartnerDamage > 0) {
        this.combatRegister.record({
          type: "damage",
          round: this.state.round,
          sourceId: attackerId,
          targetId: damageSplit.partner.id,
          amount: actualPartnerDamage,
          damageType: attackType === "spell" ? "magic" : "physical",
          abilityId,
        });
      }

      if (damageSplit.partner.hp === 0) {
        damageSplit.partner.alive = false;
        this.endConcentration(damageSplit.partner);
      }
    }

    if (actualDamage > 0) {
      this.combatRegister.record({
        type: "damage",
        round: this.state.round,
        sourceId: attackerId,
        targetId: defender.id,
        amount: actualDamage,
        damageType: attackType === "spell" ? "magic" : "physical",
        abilityId,
      });
    }

    defender.alive = defender.hp > 0;
    if (!defender.alive) {
      this.endConcentration(defender);
    }

    if (actualDamage > 0) {
      this.checkConcentration(defender);
    }

    if (defender.alive && remainingEffects?.length) {
      executeAbilityEffects(
        remainingEffects,
        {
          casterId: attackerId,
          targetId: defenderId,
        },
        this,
        abilityId ?? "",
      );
    }
  }

  private consumeAttackRollModifiers(attacker: Combatant): void {
    const modifiers = [...attacker.modifiers];

    for (const modifier of modifiers) {
      if (
        modifier.trigger === "roll" &&
        modifier.behavior === "attack-roll" &&
        (modifier.amount === undefined || modifier.amount > 0)
      ) {
        consumeModifier(attacker.modifiers, modifier);
      }
    }
  }

  private consumeAttackModifiers(
    attacker: Combatant,
    attackType: AttackType,
  ): void {
    const modifiers = [...attacker.modifiers];

    for (const modifier of modifiers) {
      if (modifier.amount !== undefined && modifier.amount <= 0) {
        continue;
      }

      if (modifier.trigger === "attack") {
        consumeModifier(attacker.modifiers, modifier);

        continue;
      }

      if (modifier.trigger === "spell" && attackType === "spell") {
        consumeModifier(attacker.modifiers, modifier);
      }
    }
  }

  private processTurnModifierDurations(combatant: Combatant): void {
    const modifiers = [...combatant.modifiers];

    for (const modifier of modifiers) {
      if (modifier.duration === undefined) {
        continue;
      }

      modifier.duration -= 1;

      if (modifier.duration <= 0) {
        if (modifier.temporaryHp !== undefined) {
          const activeTemporaryHpModifier = combatant.modifiers.find(
            (current) => current.temporaryHp !== undefined,
          );

          if (activeTemporaryHpModifier?.id === modifier.id) {
            combatant.temporaryHp = 0;
          }
        }

        const index = combatant.modifiers.indexOf(modifier);

        if (index !== -1) {
          combatant.modifiers.splice(index, 1);
        }
      }
    }
  }

  private checkConcentration(combatant: Combatant): void {
    if (!combatant.alive || !combatant.concentration) {
      return;
    }

    const result = resolveConcentrationCheck(combatant, this.random);

    if (!result.success) {
      this.endConcentration(combatant);
    }
  }

  public startConcentration(
    casterId: string,
    abilityId: string,
    instanceId?: string,
    remainingDuration?: number,
  ): void {
    const caster = this.state.combatants.find(
      (combatant) => combatant.id === casterId,
    );

    if (!caster) {
      return;
    }

    this.endConcentration(caster);

    caster.concentration = {
      abilityId,
      instanceId,
      remainingDuration,
    };
  }

  private endConcentration(combatant: Combatant): void {
    const concentration = combatant.concentration;

    if (!concentration) {
      return;
    }

    if (concentration.instanceId) {
      this.removeAbilityInstance(concentration.instanceId);
    }

    for (const currentCombatant of this.state.combatants) {
      currentCombatant.modifiers = currentCombatant.modifiers.filter(
        (modifier) =>
          !(
            modifier.sourceCasterId === combatant.id &&
            modifier.sourceAbilityId === concentration.abilityId
          ),
      );
    }

    combatant.concentration = undefined;
  }

  public createAbilityInstance(
    abilityId: string,
    casterId: string,
    position: Position,
    area: AbilityArea,
    options?: {
      hp?: number;
      maxHp?: number;
      armor?: number;
      magicResistance?: number;
      duration?: number;
      disarmable?: boolean;
      disarmDC?: number;
      disarmRange?: number;
      blocksDamage?: boolean;
      effects?: AbilityInstanceEffect[];
    },
  ): AbilityInstance {
    const instance: AbilityInstance = {
      id: `${abilityId}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      abilityId,
      casterId,
      position: {
        x: Math.floor(position.x),
        y: Math.floor(position.y),
      },
      area: { ...area },
      hp: options?.hp,
      maxHp: options?.maxHp,
      armor: options?.armor,
      magicResistance: options?.magicResistance,
      duration: options?.duration,
      disarmable: options?.disarmable,
      disarmDC: options?.disarmDC,
      disarmRange: options?.disarmRange,
      blocksDamage: options?.blocksDamage,
      effects: options?.effects,
    };

    this.abilityInstances.push(instance);

    return instance;
  }

  public getAbilityInstances(): AbilityInstance[] {
    return this.abilityInstances;
  }

  public attackAbilityInstance(
    instanceId: string,
    attackType: AttackType,
    target: import("./TargetLocation").TargetLocation = "body",
    damage: DamageExpression = {
      count: 1,
      sides: 8,
      type: "physical",
    },
  ): AbilityInstanceAttackResult & {
    success: boolean;
    instanceId: string;
    attackerId: string;
    damageDealt: number;
  } {
    const attacker = this.getCurrentCombatant();
    const instance = this.getAbilityInstance(instanceId);

    if (!attacker || !attacker.alive || !instance) {
      return {
        success: false,
        instanceId,
        attackerId: attacker?.id ?? "",
        hit: false,
        chance: 0,
        roll: 0,
        damageDealt: 0,
      };
    }

    if (instance.hp === undefined) {
      return {
        success: false,
        instanceId,
        attackerId: attacker.id,
        hit: false,
        chance: 0,
        roll: 0,
        damageDealt: 0,
      };
    }

    const distance = calculateDistance(attacker.position, instance.position);

    const attackerConditions = this.state.conditionManager.getConditions(
      attacker.id,
    );

    const result = resolveAbilityInstanceAttack(
      {
        attackerStats: attacker.stats,
        attackerConditions,
        type: attackType,
        distance,
        target,
        damage,
        armor: instance.armor,
        magicResistance: instance.magicResistance,
      },
      this.random,
    );

    if (!result.hit || !result.damage) {
      attacker.actionAvailable = false;

      return {
        success: true,
        instanceId,
        attackerId: attacker.id,
        ...result,
        damageDealt: 0,
      };
    }

    const damageDealt = this.damageAbilityInstance(
      instanceId,
      result.damage.finalDamage,
    );

    attacker.actionAvailable = false;

    return {
      success: true,
      instanceId,
      attackerId: attacker.id,
      ...result,
      damageDealt,
    };
  }

  public disarmAbilityInstance(instanceId: string): {
    success: boolean;
    instanceId: string;
    attackerId: string;
    roll: number;
    modifier: number;
    total: number;
    dc: number;
    distance: number;
    range: number;
  } {
    const attacker = this.getCurrentCombatant();
    const instance = this.getAbilityInstance(instanceId);

    if (!attacker || !attacker.alive || !instance) {
      return {
        success: false,
        instanceId,
        attackerId: attacker?.id ?? "",
        roll: 0,
        modifier: 0,
        total: 0,
        dc: 0,
        distance: 0,
        range: 0,
      };
    }

    if (!instance.disarmable) {
      return {
        success: false,
        instanceId,
        attackerId: attacker.id,
        roll: 0,
        modifier: 0,
        total: 0,
        dc: instance.disarmDC ?? 10,
        distance: 0,
        range: instance.disarmRange ?? 1,
      };
    }

    const distance = this.getDistanceBetweenPosition(
      attacker.position,
      instance.position,
    );

    const range = instance.disarmRange ?? 1;

    if (distance > range) {
      return {
        success: false,
        instanceId,
        attackerId: attacker.id,
        roll: 0,
        modifier: 0,
        total: 0,
        dc: instance.disarmDC ?? 10,
        distance,
        range,
      };
    }

    const check = resolveAbilityCheck(
      attacker.stats,
      "dexterity",
      instance.disarmDC ?? 10,
      this.random,
    );

    if (check.success) {
      this.removeAbilityInstance(instance.id);
    }

    attacker.bonusActionAvailable = false;

    return {
      success: check.success,
      instanceId,
      attackerId: attacker.id,
      roll: check.roll,
      modifier: check.modifier,
      total: check.total,
      dc: check.dc,
      distance,
      range,
    };
  }

  public damageAbilityInstance(instanceId: string, amount: number): number {
    const instance = this.getAbilityInstance(instanceId);

    if (!instance || instance.hp === undefined || amount <= 0) {
      return 0;
    }

    const hpBefore = instance.hp;

    instance.hp = Math.max(0, instance.hp - amount);

    if (instance.hp === 0) {
      this.removeAbilityInstance(instance.id);
    }

    return hpBefore - instance.hp;
  }

  public getAbilityInstance(instanceId: string): AbilityInstance | undefined {
    return this.abilityInstances.find((instance) => instance.id === instanceId);
  }

  public getAbilityInstancesAtPosition(position: Position): AbilityInstance[] {
    return this.abilityInstances.filter(
      (instance) =>
        instance.position.x === position.x &&
        instance.position.y === position.y,
    );
  }

  public removeAbilityInstance(instanceId: string): boolean {
    const index = this.abilityInstances.findIndex(
      (instance) => instance.id === instanceId,
    );

    if (index === -1) {
      return false;
    }

    const instance = this.abilityInstances[index];

    this.abilityInstances.splice(index, 1);

    const caster = this.state.combatants.find(
      (combatant) => combatant.id === instance.casterId,
    );

    if (caster?.concentration?.instanceId === instanceId) {
      caster.concentration = undefined;
    }

    return true;
  }

  private processAbilityInstanceDurations(combatant: Combatant): void {
    const instances = [...this.abilityInstances];

    for (const instance of instances) {
      if (instance.duration === undefined) {
        continue;
      }

      if (instance.casterId !== combatant.id) {
        continue;
      }

      instance.duration -= 1;

      if (instance.duration <= 0) {
        this.removeAbilityInstance(instance.id);
      }
    }
  }

  private processAbilityInstanceEffects(
    combatant: Combatant,
    trigger: AbilityInstanceTrigger,
    instanceId?: string,
  ): void {
    const instances = [...this.abilityInstances].filter(
      (instance) => instanceId === undefined || instance.id === instanceId,
    );
    for (const instance of instances) {
      if (!instance.effects || instance.effects.length === 0) {
        continue;
      }

      const inside = this.isCombatantInsideAbilityInstance(
        combatant.id,
        instance.id,
      );

      if (!inside) {
        continue;
      }

      const effects = instance.effects
        .filter((instanceEffect) => instanceEffect.trigger === trigger)
        .map((instanceEffect) => instanceEffect.effect);

      if (effects.length === 0) {
        continue;
      }

      executeAbilityEffects(
        effects,
        {
          casterId: instance.casterId,
          targetId: combatant.id,
        },
        this,
        instance.abilityId,
      );
    }
  }

  private processAbilityInstanceMovementEffects(
    combatant: Combatant,
    previousPosition: Position,
  ): void {
    const instances = [...this.abilityInstances];

    for (const instance of instances) {
      if (!instance.effects || instance.effects.length === 0) {
        continue;
      }

      const wasInside = this.isPositionInsideAbilityInstance(
        previousPosition,
        instance,
      );

      const isInside = this.isPositionInsideAbilityInstance(
        combatant.position,
        instance,
      );

      if (!isInside) {
        continue;
      }

      const trigger: AbilityInstanceTrigger = wasInside
        ? "move-inside-area"
        : "enter-area";

      this.processAbilityInstanceEffects(combatant, trigger, instance.id);
    }
  }

  public getDistanceBetweenPosition(first: Position, second: Position): number {
    return calculateDistance(first, second);
  }

  private isPositionInsideAbilityInstance(
    position: Position,
    instance: AbilityInstance,
  ): boolean {
    const { area } = instance;

    switch (area.shape) {
      case "circle": {
        if (area.radius === undefined) {
          return false;
        }

        const distance = this.getDistanceBetweenPosition(
          position,
          instance.position,
        );

        return distance <= area.radius;
      }

      case "rectangle": {
        if (area.width === undefined || area.height === undefined) {
          return false;
        }

        const halfWidth = area.width / 2;
        const halfHeight = area.height / 2;

        return (
          Math.abs(position.x - instance.position.x) <= halfWidth &&
          Math.abs(position.y - instance.position.y) <= halfHeight
        );
      }

      default:
        return false;
    }
  }

  public isCombatantInsideAbilityInstance(
    combatantId: string,
    instanceId: string,
  ): boolean {
    const combatant = this.state.combatants.find((c) => c.id === combatantId);

    const instance = this.getAbilityInstance(instanceId);

    if (!combatant || !instance) {
      return false;
    }

    return this.isPositionInsideAbilityInstance(combatant.position, instance);
  }

  public isDamageBlocked(attackerId: string, defenderId: string): boolean {
    const instances = this.getAbilityInstances();

    return instances.some((instance) => {
      if (!instance.blocksDamage) {
        return false;
      }

      const attackerInside = this.isCombatantInsideAbilityInstance(
        attackerId,
        instance.id,
      );

      const defenderInside = this.isCombatantInsideAbilityInstance(
        defenderId,
        instance.id,
      );

      return attackerInside || defenderInside;
    });
  }

  public isConditionBlocked(
    targetId: string,
    conditionId: ConditionId,
  ): boolean {
    return this.abilityInstances.some((instance) => {
      if (!instance.effects) {
        return false;
      }

      const inside = this.isCombatantInsideAbilityInstance(
        targetId,
        instance.id,
      );

      if (!inside) {
        return false;
      }

      return instance.effects.some(
        (instanceEffect) =>
          instanceEffect.effect.type === "block-condition" &&
          instanceEffect.effect.conditionIds?.includes(conditionId),
      );
    });
  }
}
