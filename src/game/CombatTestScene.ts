import Phaser from "phaser";
import { cellSize } from "./scenes/Grid";

import { CombatEngine } from "./rules/combat/CombatEngine";
import { createCombatState } from "./rules/combat/CombatState";
import type { Combatant } from "./rules/combat/Combatant";
import type { CharacterStats } from "./rules/stats/Stats";
import { getDefenseStats } from "./rules/combat/Defense";
import type { ConditionId } from "./rules/condition/Condition";

import {
  resolveAbility,
  type AbilityUseRequest,
} from "./rules/abilities/AbilityResolver";
import type { AbilityDefinition } from "./rules/abilities/Ability";
import { createAbilityState } from "./rules/abilities/AbilityState";
import { createEmptyResources } from "./rules/abilities/Resource";
import { CANTRIPS } from "./rules/abilities/spells/cantrips";
import { LEVELONESPELLS } from "./rules/abilities/spells/levelOne";

export class CombatTestScene extends Phaser.Scene {
  private ranger!: Phaser.GameObjects.Arc;
  private goblin!: Phaser.GameObjects.Arc;
  private goblin2!: Phaser.GameObjects.Arc;
  private ranger2!: Phaser.GameObjects.Arc;

  private combatEngine!: CombatEngine;

  private targetingAbility: AbilityDefinition | null = null;
  private targetingActive = false;
  private targetingTargetId: string | null = null;
  private targetingTargetIds: string[] = [];
  private targetingLocation: { x: number; y: number } | null = null;
  private targetingAttackType: "melee" | "ranged" | null = null;
  private targetingInstanceId: string | null = null;
  private disarmTargeting = false;

  private targetingGraphics?: Phaser.GameObjects.Graphics;
  private abilityInstanceGraphics?: Phaser.GameObjects.Graphics;
  private targetingText?: Phaser.GameObjects.Text;

  private combatText!: Phaser.GameObjects.Text;

  private rangerHpText!: Phaser.GameObjects.Text;
  private goblinHpText!: Phaser.GameObjects.Text;
  private goblin2HpText!: Phaser.GameObjects.Text;
  private ranger2HpText!: Phaser.GameObjects.Text;

  private movementActive = false;
  private draggingCombatantId: string | null = null;

  //private rangerMovementText!: Phaser.GameObjects.Text;
  //private goblinMovementText!: Phaser.GameObjects.Text;

  //private rangerDefenseText!: Phaser.GameObjects.Text;
  //private goblinDefenseText!: Phaser.GameObjects.Text;
  //private rangerPatternText!: Phaser.GameObjects.Text;
  private attributeTargetText!: Phaser.GameObjects.Text;
  private attributeSelectorText!: Phaser.GameObjects.Text;
  private attributeValueText!: Phaser.GameObjects.Text;

  private rangerStatusText!: Phaser.GameObjects.Text;
  private goblinStatusText!: Phaser.GameObjects.Text;

  private turnText!: Phaser.GameObjects.Text;
  private resourcesText!: Phaser.GameObjects.Text;
  private defenseText!: Phaser.GameObjects.Text;

  private conditionTargetText!: Phaser.GameObjects.Text;
  private conditionSelectorText!: Phaser.GameObjects.Text;
  private conditionDurationText!: Phaser.GameObjects.Text;
  private conditionStacksText!: Phaser.GameObjects.Text;
  private conditionValueText!: Phaser.GameObjects.Text;

  private conditionTargetId: "ranger" | "goblin" = "goblin";
  private selectedConditionIndex = 0;
  private conditionDuration = 3;
  private conditionStacks = 1;
  private conditionValue = 2;

  private targetingConfirmButton?: Phaser.GameObjects.Rectangle;
  private targetingConfirmText?: Phaser.GameObjects.Text;

  private attributeTargetId: "ranger" | "goblin" = "ranger";
  private selectedAttribute: keyof CharacterStats = "dexterity";

  private readonly conditionIds: ConditionId[] = [
    "stunned",
    "poisoned",
    "slowed",
    "burning",
    "blinded",
    "charmed",
    "cursed",
    "frightened",
    "petrified",
    "sleeping",
    "rooted",
    "suppressed",
    "silenced",
    "freezed",
    "acid",
    "bleeding",
    "marked",
    "armor-penetration",
    "magic-penetration",
    "pulled",
    "pushed",
  ];

  private readonly rangerStats: CharacterStats = {
    strength: 10,
    dexterity: 15,
    constitution: 2,
    intelligence: 18,
    wisdom: 14,
    charisma: 8,
  };

  private readonly ranger2Stats: CharacterStats = {
    strength: 10,
    dexterity: 16,
    constitution: 4,
    intelligence: 12,
    wisdom: 14,
    charisma: 8,
  };

  private readonly goblinStats: CharacterStats = {
    strength: 10,
    dexterity: 14,
    constitution: 10,
    intelligence: 16,
    wisdom: 8,
    charisma: 8,
  };

  constructor() {
    super("CombatTestScene");
  }

  create(): void {
    this.drawGrid();
    this.createCombat();
    this.createCharacters();
    this.createInterface();
    this.input.on("pointerdown", this.handleMapPointerDown, this);
    this.input.on("pointermove", this.handleMovementDrag, this);
    this.input.on("pointerup", this.handleMovementDrop, this);
    this.abilityInstanceGraphics = this.add.graphics();
    this.abilityInstanceGraphics.setDepth(5);

    this.updateInterface();

    this.setCombatLog([
      "Combat sandbox ready.",
      "",
      "Test combat, abilities and conditions.",
    ]);
  }

  private drawGrid(): void {
    const graphics = this.add.graphics();

    graphics.lineStyle(1, 0x444444, 1);

    const visibleColumns = 15;
    const visibleRows = 15;

    for (let column = 0; column <= visibleColumns; column++) {
      const x = column * cellSize;

      graphics.lineBetween(x, 0, x, visibleRows * cellSize);
    }

    for (let row = 0; row <= visibleRows; row++) {
      const y = row * cellSize;

      graphics.lineBetween(0, y, visibleColumns * cellSize, y);
    }
  }

  private createCombat(): void {
    const ranger: Combatant = {
      id: "ranger",
      name: "Ranger",
      level: 1,
      team: "player",
      creatureType: "humanoid",
      class: "bard",

      modifiers: [],

      stats: this.rangerStats,

      hp: 21,
      maxHp: 21,

      armor: 0,
      magicResistance: 0,

      position: {
        x: 3,
        y: 6,
      },

      movement: 6,
      movementRemaining: 6,

      actionAvailable: false,
      bonusActionAvailable: false,
      reactionAvailable: false,

      initiative: 10,

      alive: true,
    };

    const ranger2: Combatant = {
      id: "ranger2",
      name: "Ranger2",
      level: 1,
      team: "player",
      creatureType: "humanoid",
      class: "cleric",

      modifiers: [],

      stats: this.ranger2Stats,

      hp: 21,
      maxHp: 21,

      armor: 0,
      magicResistance: 0,

      position: {
        x: 4,
        y: 6,
      },

      movement: 6,
      movementRemaining: 6,

      actionAvailable: false,
      bonusActionAvailable: false,
      reactionAvailable: false,

      initiative: 10,

      alive: true,
    };

    const goblin: Combatant = {
      id: "goblin",
      name: "Goblin",
      level: 1,
      team: "enemy",
      creatureType: "humanoid",
      class: "bard",

      modifiers: [],

      stats: this.goblinStats,

      hp: 30,
      maxHp: 30,

      armor: 2,
      magicResistance: 0,

      position: {
        x: 11,
        y: 6,
      },

      movement: 6,
      movementRemaining: 6,

      actionAvailable: false,
      bonusActionAvailable: false,
      reactionAvailable: false,

      initiative: 5,

      alive: true,
    };

    const goblin2: Combatant = {
      id: "goblin2",
      name: "Goblin 2",
      level: 1,
      team: "enemy",
      creatureType: "humanoid",
      class: "cleric",

      modifiers: [],

      stats: this.goblinStats,

      hp: 30,
      maxHp: 30,

      armor: 2,
      magicResistance: 0,

      position: {
        x: 11,
        y: 8,
      },

      movement: 6,
      movementRemaining: 6,

      actionAvailable: false,
      bonusActionAvailable: false,
      reactionAvailable: false,

      initiative: 4,

      alive: true,
    };

    const state = createCombatState([ranger, ranger2, goblin, goblin2]);
    this.combatEngine = new CombatEngine(state);

    this.combatEngine.startCombat();
  }

  private createCharacters(): void {
    const ranger = this.getCombatant("ranger");
    const ranger2 = this.getCombatant("ranger2");

    const goblin = this.getCombatant("goblin");
    const goblin2 = this.getCombatant("goblin2");

    if (!ranger || !ranger2 || !goblin || !goblin2) {
      return;
    }

    this.ranger = this.add.circle(
      ranger.position.x * cellSize + cellSize / 2,
      ranger.position.y * cellSize + cellSize / 2,
      16,
      0xff3333,
    );

    this.ranger2 = this.add.circle(
      ranger2.position.x * cellSize + cellSize / 2,
      ranger2.position.y * cellSize + cellSize / 2,
      16,
      0xff3333,
    );

    this.goblin = this.add.circle(
      goblin.position.x * cellSize + cellSize / 2,
      goblin.position.y * cellSize + cellSize / 2,
      16,
      0x3388ff,
    );

    this.goblin2 = this.add.circle(
      goblin2.position.x * cellSize + cellSize / 2,
      goblin2.position.y * cellSize + cellSize / 2,
      16,
      0x3388ff,
    );

    this.goblin2.setInteractive({ useHandCursor: true });

    this.ranger.setInteractive({ useHandCursor: true });
    this.ranger2.setInteractive({ useHandCursor: true });

    this.goblin.setInteractive({ useHandCursor: true });

    this.ranger.on("pointerdown", () => {
      this.handleCharacterPointerDown("ranger");
    });

    this.ranger2.on("pointerdown", () => {
      this.handleCharacterPointerDown("ranger2");
    });

    this.goblin.on("pointerdown", () => {
      this.handleCharacterPointerDown("goblin");
    });

    this.goblin2.on("pointerdown", () => {
      this.handleCharacterPointerDown("goblin2");
    });

    this.add.text(this.ranger.x - 25, this.ranger.y + 25, "Ranger", {
      fontSize: "16px",
      color: "#ffffff",
    });

    this.add.text(this.ranger2.x - 25, this.ranger2.y + 25, "Ranger2", {
      fontSize: "16px",
      color: "#ffffff",
    });

    this.add.text(this.goblin.x - 25, this.goblin.y + 25, "Goblin", {
      fontSize: "16px",
      color: "#ffffff",
    });

    this.add.text(this.goblin2.x - 35, this.goblin2.y + 25, "Goblin 2", {
      fontSize: "16px",
      color: "#ffffff",
    });
  }

  private createInterface(): void {
    const panelX = 720;

    this.add.rectangle(panelX, 0, 240, 720, 0x151515).setOrigin(0, 0);

    this.add.text(panelX + 15, 15, "COMBAT DEBUG", {
      fontSize: "18px",
      color: "#ffffff",
      fontStyle: "bold",
    });

    this.rangerHpText = this.add.text(panelX + 15, 50, "", {
      fontSize: "13px",
      color: "#ffffff",
    });
    this.ranger2HpText = this.add.text(panelX + 15, 60, "", {
      fontSize: "13px",
      color: "#ffffff",
    });
    this.goblinHpText = this.add.text(panelX + 15, 73, "", {
      fontSize: "13px",
      color: "#ffffff",
    });
    this.goblin2HpText = this.add.text(panelX + 15, 85, "", {
      fontSize: "13px",
      color: "#ffffff",
    });
    this.createButton(panelX + 120, 230, 150, 28, "DISARM", 0x6b4a20, () =>
      this.startDisarmTargeting(),
    );
    /*this.rangerMovementText = this.add.text(panelX + 15, 110, "", {
      fontSize: "11px",
      color: "#ffffff",
    });
    this.goblinMovementText = this.add.text(panelX + 15, 120, "", {
      fontSize: "11px",
      color: "#ffffff",
    });
    this.rangerDefenseText = this.add.text(panelX + 15, 130, "", {
      fontSize: "9px",
      color: "#ffffff",
    });
    this.goblinDefenseText = this.add.text(panelX + 15, 158, "", {
      fontSize: "9px",
      color: "#ffffff",
    });
    this.rangerPatternText = this.add.text(panelX + 15, 178, "", {
      fontSize: "9px",
      color: "#ffffff",
      wordWrap: { width: 210 },
    });*/
    this.turnText = this.add.text(panelX + 15, 130, "", {
      fontSize: "11px",
      color: "#ffffff",
    });
    this.resourcesText = this.add.text(panelX + 15, 140, "", {
      fontSize: "10px",
      color: "#ffffff",
      wordWrap: { width: 210 },
    });

    this.rangerStatusText = this.add.text(panelX + 15, 160, "", {
      fontSize: "10px",
      color: "#ff9999",
      wordWrap: { width: 210 },
    });
    this.goblinStatusText = this.add.text(panelX + 15, 180, "", {
      fontSize: "10px",
      color: "#9999ff",
      wordWrap: { width: 210 },
    });

    this.add.text(panelX + 15, 250, "COMBAT", {
      fontSize: "12px",
      color: "#aaaaaa",
      fontStyle: "bold",
    });

    this.createButton(
      panelX + 120,
      275,
      150,
      28,
      "RANGED ATTACK",
      0x8b2020,
      () => this.startBasicAttackTargeting("ranged"),
    );
    this.createButton(
      panelX + 120,
      307,
      150,
      28,
      "MELEE ATTACK",
      0x7a3030,
      () => this.startBasicAttackTargeting("melee"),
    );
    this.createButton(panelX + 45, 339, 65, 28, "MOVE", 0x285c35, () =>
      this.toggleMovementMode(),
    );

    this.createButton(panelX + 120, 339, 65, 28, "DODGE", 0x285c35, () =>
      this.chooseDefense("dodge"),
    );

    this.createButton(panelX + 195, 339, 65, 28, "PARRY", 0x5c4a28, () =>
      this.chooseDefense("parry"),
    );

    this.defenseText = this.add.text(panelX + 15, 380, "", {
      fontSize: "10px",
      color: "#ffcc66",
      wordWrap: { width: 210 },
    });

    this.add.text(panelX + 15, 405, "ABILITIES", {
      fontSize: "12px",
      color: "#aaaaaa",
      fontStyle: "bold",
    });

    this.createButton(
      panelX + 120,
      430,
      150,
      26,
      "calm_emotions",
      0x5a2875,
      () => this.useAbility("calm_emotions"),
    );

    this.createButton(panelX + 120, 460, 150, 26, "test", 0x5a2875, () =>
      this.useAbility("test"),
    );

    this.createButton(
      panelX + 120,
      490,
      150,
      26,
      "intimidation",
      0x5a2875,
      () => this.useAbility("intimidation"),
    );

    this.add.text(panelX + 15, 522, "CONDITION TESTER", {
      fontSize: "12px",
      color: "#aaaaaa",
      fontStyle: "bold",
    });

    this.conditionTargetText = this.add
      .text(panelX + 120, 548, "", {
        fontSize: "10px",
        color: "#ffffff",
        fontStyle: "bold",
        align: "center",
        wordWrap: { width: 140 },
      })
      .setOrigin(0.5);
    this.add.rectangle(panelX + 120, 548, 150, 27, 0x3d3d3d).setDepth(-1);
    this.conditionTargetText.setInteractive({ useHandCursor: true });
    this.conditionTargetText.on("pointerdown", () =>
      this.toggleConditionTarget(),
    );

    this.conditionSelectorText = this.add
      .text(panelX + 120, 577, "", {
        fontSize: "10px",
        color: "#ffffff",
        fontStyle: "bold",
        align: "center",
        wordWrap: { width: 140 },
      })
      .setOrigin(0.5);
    this.add.rectangle(panelX + 120, 577, 150, 27, 0x3d3d3d).setDepth(-1);
    this.conditionSelectorText.setInteractive({ useHandCursor: true });
    this.conditionSelectorText.on("pointerdown", () => this.nextCondition());

    this.conditionDurationText = this.add.text(panelX + 15, 606, "", {
      fontSize: "10px",
      color: "#ffffff",
    });
    this.conditionStacksText = this.add.text(panelX + 15, 627, "", {
      fontSize: "10px",
      color: "#ffffff",
    });
    this.conditionValueText = this.add.text(panelX + 15, 648, "", {
      fontSize: "10px",
      color: "#ffffff",
    });

    this.createButton(panelX + 178, 606, 32, 20, "-", 0x444444, () =>
      this.adjustCondition("duration", -1),
    );
    this.createButton(panelX + 220, 606, 32, 20, "+", 0x444444, () =>
      this.adjustCondition("duration", 1),
    );
    this.createButton(panelX + 178, 627, 32, 20, "-", 0x444444, () =>
      this.adjustCondition("stacks", -1),
    );
    this.createButton(panelX + 220, 627, 32, 20, "+", 0x444444, () =>
      this.adjustCondition("stacks", 1),
    );
    this.createButton(panelX + 178, 648, 32, 20, "-", 0x444444, () =>
      this.adjustCondition("value", -1),
    );
    this.createButton(panelX + 220, 648, 32, 20, "+", 0x444444, () =>
      this.adjustCondition("value", 1),
    );

    this.createButton(panelX + 80, 675, 105, 25, "APPLY", 0x754040, () =>
      this.applyCondition(),
    );
    this.createButton(panelX + 195, 675, 105, 25, "REMOVE", 0x555555, () =>
      this.removeSelectedCondition(),
    );
    this.createButton(panelX + 120, 707, 150, 20, "END TURN", 0x444444, () =>
      this.endTurn(),
    );

    this.add.rectangle(15, 500, 690, 75, 0x111111, 0.92).setOrigin(0, 0);

    this.attributeTargetText = this.add
      .text(105, 515, "", {
        fontSize: "10px",
        color: "#ffffff",
        fontStyle: "bold",
        align: "center",
        wordWrap: { width: 160 },
      })
      .setOrigin(0.5);

    this.attributeSelectorText = this.add
      .text(290, 515, "", {
        fontSize: "10px",
        color: "#ffffff",
        fontStyle: "bold",
        align: "center",
        wordWrap: { width: 160 },
      })
      .setOrigin(0.5);

    this.attributeValueText = this.add.text(15, 542, "", {
      fontSize: "10px",
      color: "#ffffff",
    });

    this.createButton(105, 555, 150, 20, "TARGET", 0x3d3d3d, () =>
      this.toggleAttributeTarget(),
    );
    this.createButton(290, 555, 150, 20, "ATTRIBUTE", 0x3d3d3d, () =>
      this.nextAttribute(),
    );
    this.createButton(475, 555, 70, 20, "-1", 0x444444, () =>
      this.adjustSelectedAttribute(-1),
    );
    this.createButton(570, 555, 70, 20, "+1", 0x444444, () =>
      this.adjustSelectedAttribute(1),
    );

    this.add.rectangle(15, 590, 690, 120, 0x111111, 0.92).setOrigin(0, 0);
    this.combatText = this.add.text(28, 603, "Ready...", {
      fontSize: "11px",
      color: "#ffffff",
      wordWrap: { width: 660 },
      lineSpacing: 3,
    });

    this.updateConditionControls();
  }

  private createButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    color: number,
    callback: () => void,
  ): void {
    const button = this.add
      .rectangle(x, y, width, height, color)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(x, y, label, {
        fontSize: "10px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    button.on("pointerdown", callback);
  }

  private executeRangedAttack(defenderId: string): void {
    const attacker = this.combatEngine.getCurrentCombatant();

    if (!attacker || !attacker.alive) {
      this.setCombatLog(["No valid current combatant."]);
      return;
    }

    const distance =
      this.combatEngine.getDistanceBetween(attacker.id, defenderId) ?? 0;

    const attackerConditions = this.combatEngine
      .getState()
      .conditionManager.getConditions(attacker.id);

    const defenderConditions = this.combatEngine
      .getState()
      .conditionManager.getConditions(defenderId);

    const result = this.combatEngine.attack({
      attackerId: attacker.id,
      defenderId,
      attackerConditions,
      defenderConditions,
      attackerLevel: attacker.level,
      type: "ranged",
      distance,
      target: "body",
      damage: {
        count: 1,
        sides: 8,
        type: "physical",
      },
    });

    if (!result.success) {
      this.setCombatLog([
        `${attacker.name} cannot attack.`,
        "",
        "Attack failed.",
      ]);
      return;
    }

    this.showAttackResult(`${attacker.name} RANGED ATTACK`, result, distance);
  }

  private executeMeleeAttack(defenderId: string): void {
    const attacker = this.combatEngine.getCurrentCombatant();

    if (!attacker || !attacker.alive) {
      this.setCombatLog(["No valid current combatant."]);
      return;
    }

    const distance =
      this.combatEngine.getDistanceBetween(attacker.id, defenderId) ?? 0;

    if (distance > 1) {
      this.setCombatLog([
        `${attacker.name} cannot use a melee attack.`,
        "",
        `Distance: ${distance.toFixed(1)}m`,
        "Melee range is limited to 1m from the target center.",
      ]);
      return;
    }

    const attackerConditions = this.combatEngine
      .getState()
      .conditionManager.getConditions(attacker.id);

    const defenderConditions = this.combatEngine
      .getState()
      .conditionManager.getConditions(defenderId);

    const result = this.combatEngine.attack({
      attackerId: attacker.id,
      defenderId,
      attackerConditions,
      defenderConditions,
      attackerLevel: attacker.level,
      type: "melee",
      distance,
      target: "body",
      damage: {
        count: 1,
        sides: 8,
        type: "physical",
      },
    });

    if (!result.success) {
      this.setCombatLog([
        `${attacker.name} cannot attack.`,
        "",
        "Attack failed.",
      ]);
      return;
    }

    this.showAttackResult(`${attacker.name} MELEE ATTACK`, result, distance);
  }

  private showAttackResult(title: string, result: any, distance: number): void {
    const attack = result.attack;

    if (!attack) {
      this.setCombatLog([title, "", "No attack result."]);
      return;
    }

    if (!attack.hit) {
      this.setCombatLog([
        title,
        "",
        `Distance: ${distance.toFixed(1)}m`,
        `Hit chance: ${attack.chance.toFixed(1)}%`,
        `Roll: ${attack.rolls ?? "?"}`,
        "",
        "MISS!",
      ]);

      this.updateInterface();
      return;
    }

    const damage = result.damage;

    if (!damage) {
      this.setCombatLog([
        title,
        "",
        "Attack hit, but no damage result was returned.",
      ]);
      this.updateInterface();
      return;
    }

    const defender = this.getCombatant(result.defenderId);

    this.setCombatLog([
      title,
      "",
      `Distance: ${distance.toFixed(1)}m`,
      `Hit chance: ${attack.chance?.toFixed(1) ?? "?"}%`,
      `Roll: ${attack.rolls ?? "?"}`,
      "",
      "HIT!",
      "",
      `Incoming damage: ${damage.rawDamage}`,
      "",
      `Defender: ${defender?.name ?? result.defenderId}`,
      "Choose DODGE or PARRY.",
      defender
        ? `Dodge: ${getDefenseStats(defender.stats).physicalDodge}% | Parry: ${getDefenseStats(defender.stats).parry}%`
        : "",
    ]);

    this.updateInterface();
  }

  private chooseDefense(choice: "dodge" | "parry"): void {
    const result = this.combatEngine.resolveDefense(choice);

    if (!result.success) {
      this.setCombatLog([
        "Defense failed.",
        "",
        choice === "parry"
          ? "Parry requires an available Reaction."
          : "There is no pending attack to defend against.",
      ]);
      this.updateInterface();
      return;
    }

    const defender = this.getCombatant(result.defenderId);
    const damage = result.damage;

    this.updateCharacterPositions();

    this.setCombatLog([
      `${defender?.name ?? result.defenderId} defends`,
      "",
      result.dodged
        ? "DODGE — attack avoided!"
        : result.parried
          ? "PARRY — damage reduced!"
          : "NO DEFENSE",
      "",
      `Incoming damage: ${damage?.rawDamage ?? 0}`,
      result.parried ? "Parry reduction: applied" : "",
      `Final damage: ${damage?.finalDamage ?? 0}`,
      "",
      `HP: ${result.defenderHpAfter ?? "?"}/${result.defenderHpBefore ?? "?"}`,
      result.defenderHpAfter === 0 ? "" : "",
    ]);

    if (result.defenderHpAfter === 0) {
      this.setCombatLog([
        `${defender?.name ?? result.defenderId} defends`,
        "",
        result.dodged
          ? "DODGE — attack avoided!"
          : result.parried
            ? "PARRY — damage reduced!"
            : "NO DEFENSE",
        "",
        `Final damage: ${damage?.finalDamage ?? 0}`,
        "",
        "💀 TARGET DEFEATED",
      ]);
    }

    this.updateInterface();
  }

  /*private performMove(): void {
    const current = this.combatEngine.getCurrentCombatant();

    if (!current || !current.alive) {
      return;
    }

    const targetId = current.team === "player" ? "goblin" : "ranger";

    const target = this.getCombatant(targetId);

    if (!target) {
      return;
    }

    const direction = Math.sign(target.position.x - current.position.x);

    const newPosition = {
      x: current.position.x + direction * 3,
      y: current.position.y,
    };

    const success = this.combatEngine.move(newPosition, "walk");

    if (!success) {
      this.setCombatLog([
        `${current.name} cannot move.`,
        "",
        "Not enough movement or movement is restricted.",
      ]);
      return;
    }

    this.updateCharacterPositions();
    this.updateInterface();

    this.setCombatLog([
      `${current.name} moves 3m.`,
      "",
      `Movement remaining: ${
        this.combatEngine.getCurrentCombatant()?.movementRemaining
      }m`,
      "",
      "Walking can trigger Attack of Opportunity",
      "when leaving melee range.",
    ]);
  }*/

  /*private performJump(): void {
    const current = this.combatEngine.getCurrentCombatant();

    if (!current || !current.alive) {
      return;
    }

    const direction = current.team === "player" ? 1 : -1;

    const newPosition = {
      x: current.position.x + direction * 2,
      y: current.position.y,
    };

    const success = this.combatEngine.move(newPosition, "jump");

    if (!success) {
      this.setCombatLog([
        `${current.name} cannot jump.`,
        "",
        "Not enough movement or movement is restricted.",
      ]);
      return;
    }

    this.updateCharacterPositions();
    this.updateInterface();

    this.setCombatLog([
      `${current.name} jumps 2m.`,
      "",
      "Jump does not trigger normal Attack of Opportunity.",
      "",
      `Movement remaining: ${
        this.combatEngine.getCurrentCombatant()?.movementRemaining
      }m`,
    ]);
  }*/

  private getAbility(id: string): AbilityDefinition | undefined {
    return [...CANTRIPS, ...LEVELONESPELLS].find(
      (ability) => ability.id === id,
    );
  }

  private useAbility(abilityId: string): void {
    const caster = this.combatEngine.getCurrentCombatant();

    if (!caster || !caster.alive) {
      this.setCombatLog(["No valid current caster."]);
      return;
    }

    const ability = this.getAbility(abilityId);

    if (!ability) {
      this.setCombatLog([`Ability not found: ${abilityId}`]);
      return;
    }

    if (ability.targetType === "self") {
      this.confirmSelfCast(ability);
      return;
    }

    this.startAbilityTargeting(ability);
  }

  private startAbilityTargeting(ability: AbilityDefinition): void {
    this.cancelAbilityTargeting();

    this.targetingAbility = ability;
    this.targetingActive = true;
    this.targetingTargetId = null;
    this.targetingTargetIds = [];
    this.targetingLocation = null;

    this.targetingText = this.add.text(
      15,
      470,
      `TARGET: ${ability.id}\n${
        ability.targetType === "location"
          ? "Click a location."
          : "Click a valid target."
      } Press ESC to cancel.`,
      {
        fontSize: "12px",
        color: "#ffffff",
        backgroundColor: "#222222",
        padding: {
          x: 8,
          y: 6,
        },
      },
    );

    this.targetingGraphics = this.add.graphics();

    if (ability.targetingMode === "multi") {
      this.targetingConfirmButton = this.add
        .rectangle(600, 470, 150, 28, 0x754040)
        .setInteractive({ useHandCursor: true })
        .setDepth(100);

      this.targetingConfirmText = this.add
        .text(600, 470, "CAST", {
          fontSize: "11px",
          color: "#ffffff",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setDepth(101);

      this.targetingConfirmButton.on("pointerdown", () => {
        if (this.targetingTargetIds.length === 0) {
          this.setCombatLog([
            "No targets selected.",
            "",
            "Select at least one target.",
          ]);
          return;
        }

        this.confirmTargetedAbility(ability, this.targetingTargetIds[0], [
          ...this.targetingTargetIds,
        ]);
      });
    }

    this.setCombatLog([
      `Targeting: ${ability.id}`,
      "",
      this.getTargetingInstruction(ability),
      "",
      "Click a target.",
      "Press ESC to cancel.",
    ]);

    this.input.keyboard?.on("keydown-ESC", this.handleTargetingEscape, this);
  }

  private getTargetingInstruction(ability: AbilityDefinition): string {
    switch (ability.targetType) {
      case "enemy":
        return "Select an enemy.";

      case "ally":
        return "Select an ally.";

      case "self-or-ally":
        return "Select yourself or an ally.";

      case "self":
        return "This ability targets yourself.";

      case "location":
        return "Select a location.";

      default:
        return "Select a target.";
    }
  }

  private handleAbilityTargetClick(targetId: string): void {
    if (!this.targetingActive) {
      return;
    }

    // Normal attack targeting
    if (this.targetingAttackType) {
      this.handleBasicAttackTargetClick(targetId);
      return;
    }

    // Ability targeting
    if (!this.targetingAbility) {
      return;
    }

    const ability = this.targetingAbility;
    const caster = this.combatEngine.getCurrentCombatant();
    const target = this.getCombatant(targetId);

    if (!caster || !target || !target.alive) {
      return;
    }

    if (!this.isValidAbilityTarget(ability, caster, target)) {
      this.setCombatLog([
        `Invalid target: ${target.name}`,
        "",
        this.getTargetingInstruction(ability),
      ]);

      return;
    }

    // Multi-target ability
    if (ability.targetingMode === "multi") {
      const selectedIndex = this.targetingTargetIds.indexOf(targetId);

      // Clicking an already selected target removes it.
      if (selectedIndex !== -1) {
        this.targetingTargetIds.splice(selectedIndex, 1);

        this.targetingTargetId =
          this.targetingTargetIds[this.targetingTargetIds.length - 1] ?? null;

        this.updateTargetingPreview();

        this.setCombatLog([
          `Removed target: ${target.name}`,
          "",
          `Targets selected: ${this.targetingTargetIds.length}/${ability.maxTargets}`,
          "Click enemies to select them.",
          "Press ESC to cancel.",
        ]);

        return;
      }

      // Add target
      // Add target
      if (this.targetingTargetIds.length >= ability.maxTargets) {
        this.setCombatLog([
          `Maximum targets selected: ${ability.maxTargets}`,
          "",
          "Press CAST to confirm.",
          "Press ESC to cancel.",
        ]);

        return;
      }

      this.targetingTargetIds.push(targetId);
      this.targetingTargetId = targetId;

      this.updateTargetingPreview();

      this.setCombatLog([
        `Selected target: ${target.name}`,
        "",
        `Targets selected: ${this.targetingTargetIds.length}/${ability.maxTargets}`,
        "Click another target or press CAST.",
        "Press ESC to cancel.",
      ]);

      return;
    }

    // Single / area / chain targeting
    if (this.targetingTargetId !== targetId) {
      this.targetingTargetId = targetId;

      this.updateTargetingPreview();

      this.setCombatLog([
        `Selected target: ${target.name}`,
        "",
        ability.targetingMode === "area"
          ? "AoE preview shown."
          : ability.targetingMode === "chain"
            ? "Click the target again to cast."
            : "Click the target again to cast.",
      ]);

      return;
    }

    this.confirmTargetedAbility(ability, targetId);
  }

  private handleCharacterPointerDown(combatantId: string): void {
    if (this.movementActive) {
      this.startCharacterDrag(combatantId);
      return;
    }

    this.handleAbilityTargetClick(combatantId);
  }

  private toggleMovementMode(): void {
    if (this.movementActive) {
      this.movementActive = false;
      this.draggingCombatantId = null;

      this.updateCharacterPositions();

      this.setCombatLog(["Movement cancelled."]);

      return;
    }

    const current = this.combatEngine.getCurrentCombatant();

    if (!current || !current.alive) {
      this.setCombatLog([
        "Cannot move.",
        "",
        "There is no valid current combatant.",
      ]);
      return;
    }

    if (this.combatEngine.getPendingDefenseCount() > 0) {
      this.setCombatLog([
        "Cannot move.",
        "",
        "Resolve the pending defense first.",
      ]);
      return;
    }

    if (current.movementRemaining <= 0) {
      this.setCombatLog([`${current.name} has no movement remaining.`]);
      return;
    }

    this.cancelAbilityTargeting();

    this.movementActive = true;

    this.setCombatLog([
      `${current.name} is ready to move.`,
      "",
      "Drag the character to a new position.",
      "Release the mouse to move.",
    ]);
  }

  private handleMapPointerDown(pointer: Phaser.Input.Pointer): void {
    if (!this.targetingActive) {
      return;
    }

    if (this.disarmTargeting) {
      const gridPosition = {
        x: Math.floor(pointer.worldX / cellSize),
        y: Math.floor(pointer.worldY / cellSize),
      };

      const instances =
        this.combatEngine.getAbilityInstancesAtPosition(gridPosition);

      if (instances.length > 0) {
        const instance = instances[instances.length - 1];
        this.handleAbilityInstanceDisarmClick(instance.id);
      }

      return;
    }

    if (this.targetingAttackType) {
      const gridPosition = {
        x: Math.floor(pointer.worldX / cellSize),
        y: Math.floor(pointer.worldY / cellSize),
      };

      const instances =
        this.combatEngine.getAbilityInstancesAtPosition(gridPosition);

      if (instances.length > 0) {
        const instance = instances[instances.length - 1];

        this.handleAbilityInstanceAttackClick(instance.id);
        return;
      }

      return;
    }

    if (!this.targetingAbility) {
      return;
    }

    if (this.targetingAbility.targetType !== "location") {
      return;
    }

    const location = {
      x: Math.floor(pointer.worldX / cellSize),
      y: Math.floor(pointer.worldY / cellSize),
    };

    const ability = this.targetingAbility;

    if (this.targetingLocation) {
      const sameLocation =
        this.targetingLocation.x === location.x &&
        this.targetingLocation.y === location.y;

      if (sameLocation) {
        this.confirmLocationAbility(ability, location);
        return;
      }
    }

    this.targetingLocation = location;
    this.updateTargetingPreview();

    this.setCombatLog([
      `Selected location: (${location.x.toFixed(1)}m, ${location.y.toFixed(1)}m)`,
      "",
      ability.targetingMode === "area"
        ? "AoE preview shown."
        : "Click the location again to cast.",
      "",
      "Press ESC to cancel.",
    ]);
  }

  private startCharacterDrag(combatantId: string): void {
    const current = this.combatEngine.getCurrentCombatant();

    if (!current || current.id !== combatantId) {
      return;
    }

    if (!current.alive || current.movementRemaining <= 0) {
      return;
    }

    this.draggingCombatantId = combatantId;
  }

  private handleMovementDrag(pointer: Phaser.Input.Pointer): void {
    if (!this.movementActive || !this.draggingCombatantId) {
      return;
    }

    const position = this.getCharacterDisplayObject(this.draggingCombatantId);

    if (!position) {
      return;
    }

    const gridX = Math.floor(pointer.worldX / cellSize);
    const gridY = Math.floor(pointer.worldY / cellSize);

    position.setPosition(
      gridX * cellSize + cellSize / 2,
      gridY * cellSize + cellSize / 2,
    );
  }

  private getCharacterDisplayObject(
    combatantId: string,
  ): Phaser.GameObjects.Arc | undefined {
    switch (combatantId) {
      case "ranger":
        return this.ranger;

      case "ranger2":
        return this.ranger2;

      case "goblin":
        return this.goblin;

      case "goblin2":
        return this.goblin2;

      default:
        return undefined;
    }
  }

  private handleMovementDrop(pointer: Phaser.Input.Pointer): void {
    if (!this.movementActive || !this.draggingCombatantId) {
      return;
    }

    const combatantId = this.draggingCombatantId;
    const current = this.getCombatant(combatantId);

    this.draggingCombatantId = null;

    if (!current) {
      this.movementActive = false;
      this.updateCharacterPositions();
      return;
    }

    const newPosition = {
      x: Math.floor(pointer.worldX / cellSize),
      y: Math.floor(pointer.worldY / cellSize),
    };

    const samePosition =
      newPosition.x === current.position.x &&
      newPosition.y === current.position.y;

    if (samePosition) {
      this.movementActive = false;
      this.updateCharacterPositions();

      this.setCombatLog([
        "Movement cancelled.",
        "",
        "The character was not moved.",
      ]);

      return;
    }

    const success = this.combatEngine.move(newPosition, "walk");

    this.movementActive = false;

    if (!success) {
      this.updateCharacterPositions();

      this.setCombatLog([
        `${current.name} cannot move there.`,
        "",
        `Movement remaining: ${current.movementRemaining}m`,
      ]);

      return;
    }

    this.updateCharacterPositions();
    this.updateInterface();
    this.redrawAbilityInstances();

    this.setCombatLog([
      `${current.name} moved.`,
      "",
      `Position: (${newPosition.x}, ${newPosition.y})`,
      `Movement remaining: ${current.movementRemaining}m`,
    ]);
  }

  private isValidAbilityTarget(
    ability: AbilityDefinition,
    caster: Combatant,
    target: Combatant,
  ): boolean {
    switch (ability.targetType) {
      case "self":
        return target.id === caster.id;

      case "ally":
        return target.team === caster.team;

      case "self-or-ally":
        return target.id === caster.id || target.team === caster.team;

      case "enemy":
        return target.team !== caster.team;

      default:
        return false;
    }
  }

  private confirmLocationAbility(
    ability: AbilityDefinition,
    location: { x: number; y: number },
  ): void {
    const caster = this.combatEngine.getCurrentCombatant();

    if (!caster) {
      this.cancelAbilityTargeting();
      return;
    }

    const result = this.resolveTestAbility(
      ability,
      caster.id,
      undefined,
      [],
      location,
    );

    this.cancelAbilityTargeting();

    if (result.success) {
      this.redrawAbilityInstances();
    }

    this.handleAbilityResult(ability, caster.id, "", result);
  }

  private confirmTargetedAbility(
    ability: AbilityDefinition,
    targetId: string,
    targetIds?: string[],
  ): void {
    const caster = this.combatEngine.getCurrentCombatant();

    if (!caster) {
      this.cancelAbilityTargeting();
      return;
    }

    const selectedTargetIds = targetIds ?? [targetId];

    const result = this.resolveTestAbility(
      ability,
      caster.id,
      targetId,
      selectedTargetIds,
    );

    this.cancelAbilityTargeting();

    this.handleAbilityResult(ability, caster.id, targetId, result);
  }

  private resolveTestAbility(
    ability: AbilityDefinition,
    casterId: string,
    targetId?: string,
    targetIds: string[] = targetId ? [targetId] : [],
    location?: { x: number; y: number },
  ) {
    const combatState = this.combatEngine.getState();

    const resources = createEmptyResources();

    resources.spellSlots[1] = 1;
    resources.maxSpellSlots[1] = 1;

    const request: AbilityUseRequest = {
      ability,
      state: createAbilityState(ability.id),
      resources,
      casterId,
      target: targetId
        ? {
            id: targetId,
          }
        : location
          ? {
              position: location,
            }
          : undefined,
      targets:
        ability.targetingMode === "multi"
          ? targetIds.map((id) => ({ id }))
          : undefined,
      combatState,
      combatEngine: this.combatEngine,
    };

    return resolveAbility(request);
  }

  private confirmSelfCast(ability: AbilityDefinition): void {
    const caster = this.combatEngine.getCurrentCombatant();

    if (!caster) {
      return;
    }

    const background = this.add.rectangle(360, 300, 360, 150, 0x151515, 0.98);

    background.setDepth(100);
    background.setInteractive();

    const text = this.add.text(360, 270, `Cast ${ability.id}?`, {
      fontSize: "18px",
      color: "#ffffff",
      fontStyle: "bold",
      align: "center",
    });

    text.setOrigin(0.5);
    text.setDepth(101);

    const cancel = this.add
      .rectangle(290, 330, 100, 35, 0x555555)
      .setInteractive({ useHandCursor: true });

    cancel.setDepth(100);

    const cancelText = this.add.text(290, 330, "CANCEL", {
      fontSize: "11px",
      color: "#ffffff",
      fontStyle: "bold",
    });

    cancelText.setOrigin(0.5);
    cancelText.setDepth(101);

    const cast = this.add
      .rectangle(430, 330, 100, 35, 0x754040)
      .setInteractive({ useHandCursor: true });

    cast.setDepth(100);

    const castText = this.add.text(430, 330, "CAST", {
      fontSize: "11px",
      color: "#ffffff",
      fontStyle: "bold",
    });

    castText.setOrigin(0.5);
    castText.setDepth(101);

    const close = (): void => {
      background.destroy();
      text.destroy();
      cancel.destroy();
      cancelText.destroy();
      cast.destroy();
      castText.destroy();
    };

    cancel.on("pointerdown", () => {
      close();

      this.setCombatLog(["Cast cancelled."]);
    });

    cast.on("pointerdown", () => {
      close();

      const result = this.resolveTestAbility(ability, caster.id, caster.id);

      this.handleAbilityResult(ability, caster.id, caster.id, result);
    });
  }

  private updateTargetingPreview(): void {
    if (!this.targetingGraphics) {
      return;
    }

    this.targetingGraphics.clear();

    if (!this.targetingAbility) {
      return;
    }

    const ability = this.targetingAbility;

    if (ability.targetingMode !== "area") {
      return;
    }

    let position: { x: number; y: number } | null = null;

    if (ability.targetType === "location") {
      position = this.targetingLocation;
    } else if (this.targetingTargetId) {
      const target = this.getCombatant(this.targetingTargetId);

      if (target) {
        position = target.position;
      }
    }

    if (!position) {
      return;
    }

    const x = position.x * cellSize + cellSize / 2;
    const y = position.y * cellSize + cellSize / 2;

    this.targetingGraphics.lineStyle(2, 0xffcc33, 0.9);
    this.targetingGraphics.fillStyle(0xffcc33, 0.15);

    if (ability.area.shape === "circle" && ability.area.radius !== undefined) {
      const radius = ability.area.radius * cellSize;

      this.targetingGraphics.fillCircle(x, y, radius);
      this.targetingGraphics.strokeCircle(x, y, radius);

      return;
    }

    if (
      ability.area.shape === "rectangle" &&
      ability.area.width !== undefined &&
      ability.area.height !== undefined
    ) {
      const width = ability.area.width * cellSize;
      const height = ability.area.height * cellSize;

      this.targetingGraphics.fillRect(
        x - width / 2,
        y - height / 2,
        width,
        height,
      );

      this.targetingGraphics.strokeRect(
        x - width / 2,
        y - height / 2,
        width,
        height,
      );
    }
  }

  private handleTargetingEscape = (): void => {
    if (!this.targetingActive) {
      return;
    }

    this.cancelAbilityTargeting();

    this.setCombatLog(["Targeting cancelled."]);
  };

  private cancelAbilityTargeting(): void {
    this.targetingActive = false;
    this.targetingAbility = null;
    this.targetingAttackType = null;
    this.targetingTargetId = null;
    this.targetingTargetIds = [];
    this.targetingLocation = null;
    this.targetingInstanceId = null;
    this.disarmTargeting = false; // ADD THIS

    this.targetingGraphics?.destroy();
    this.targetingGraphics = undefined;

    this.targetingText?.destroy();
    this.targetingText = undefined;
    this.targetingConfirmButton?.destroy();
    this.targetingConfirmButton = undefined;

    this.targetingConfirmText?.destroy();
    this.targetingConfirmText = undefined;

    this.input.keyboard?.off("keydown-ESC", this.handleTargetingEscape, this);
  }

  private handleAbilityResult(
    ability: AbilityDefinition,
    casterId: string,
    targetId: string,
    result: ReturnType<typeof resolveAbility>,
  ): void {
    if (!result.success) {
      this.setCombatLog([
        `Ability failed: ${result.reason ?? "Unknown reason."}`,
      ]);
      this.updateInterface();
      return;
    }

    const caster = this.getCombatant(casterId);
    const primaryTarget = this.getCombatant(targetId);

    // Multiple attacks: AoE / multi-target
    if (result.attackResults && result.attackResults.length > 0) {
      const log: string[] = [
        `Ability used: ${ability.nameKey}`,
        `Caster: ${caster?.name ?? casterId}`,
        `Primary target: ${primaryTarget?.name ?? targetId}`,
        "",
        `Targets hit: ${result.attackResults.length}`,
        "",
      ];

      let pendingDefenseCount = 0;

      for (const attackResult of result.attackResults) {
        const defender = this.getCombatant(attackResult.defenderId);

        if (!defender) {
          continue;
        }

        const distance =
          this.combatEngine.getDistanceBetween(
            casterId,
            attackResult.defenderId,
          ) ?? 0;

        log.push(`${defender.name}`);
        log.push(`Distance from caster: ${distance.toFixed(1)}m`);

        if (!attackResult.attack) {
          log.push("No attack result.");
          log.push("");
          continue;
        }

        log.push(
          `Hit chance: ${attackResult.attack.chance?.toFixed(1) ?? "?"}%`,
        );

        log.push(`Roll: ${attackResult.attack.rolls ?? "?"}`);

        if (!attackResult.attack.hit) {
          log.push("MISS!");
          log.push("");
          continue;
        }

        log.push("HIT!");

        if (attackResult.damage) {
          log.push(`Incoming damage: ${attackResult.damage.rawDamage}`);
        }

        if (attackResult.status === "awaiting-defense") {
          pendingDefenseCount++;
        }

        log.push("");
      }

      if (pendingDefenseCount > 0) {
        log.push(
          `Defense required: ${pendingDefenseCount} target${
            pendingDefenseCount === 1 ? "" : "s"
          }`,
        );
        log.push("");
        log.push("Choose DODGE or PARRY.");
      }

      this.setCombatLog(log);
      this.updateInterface();
      return;
    }

    // Single-target attack
    const attack = result.attackResult;

    if (!attack) {
      this.setCombatLog([
        `Ability used: ${ability.nameKey}`,
        `Caster: ${caster?.name ?? casterId}`,
        `Target: ${primaryTarget?.name ?? targetId}`,
      ]);

      this.updateInterface();
      return;
    }

    if (!attack.attack?.hit) {
      this.setCombatLog([
        `Ability used: ${ability.nameKey}`,
        `Caster: ${caster?.name ?? casterId}`,
        `Target: ${primaryTarget?.name ?? targetId}`,
        "",
        "MISS!",
        "",
        `Hit chance: ${attack.attack?.chance?.toFixed(1) ?? "?"}%`,
        `Roll: ${attack.attack?.rolls ?? "?"}`,
      ]);

      this.updateInterface();
      return;
    }

    if (attack.status === "awaiting-defense") {
      const distance =
        this.combatEngine.getDistanceBetween(casterId, targetId) ?? 0;

      const defender = this.getCombatant(attack.defenderId);

      this.setCombatLog([
        `Ability used: ${ability.nameKey}`,
        `Caster: ${caster?.name ?? casterId}`,
        `Target: ${primaryTarget?.name ?? targetId}`,
        "",
        `Distance: ${distance.toFixed(1)}m`,
        `Hit chance: ${attack.attack?.chance?.toFixed(1) ?? "?"}%`,
        `Roll: ${attack.attack?.rolls ?? "?"}`,
        "",
        "HIT!",
        "",
        `Incoming damage: ${attack.damage?.rawDamage ?? 0}`,
        "",
        `Defender: ${defender?.name ?? attack.defenderId}`,
        "Choose DODGE or PARRY.",
        defender
          ? `Dodge: ${
              getDefenseStats(defender.stats).physicalDodge
            }% | Parry: ${getDefenseStats(defender.stats).parry}%`
          : "",
      ]);

      this.updateInterface();
      return;
    }

    this.setCombatLog([
      `Ability used: ${ability.nameKey}`,
      `Caster: ${caster?.name ?? casterId}`,
      `Target: ${primaryTarget?.name ?? targetId}`,
      "",
      "HIT!",
      "",
      `Damage: ${attack.damage?.finalDamage ?? 0}`,
    ]);

    this.updateInterface();
  }

  private nextCondition(): void {
    this.selectedConditionIndex =
      (this.selectedConditionIndex + 1) % this.conditionIds.length;
    this.updateConditionControls();
    this.setCombatLog([
      `Selected condition: ${this.getSelectedConditionId()}`,
      "",
      "Click the condition selector again to cycle.",
    ]);
  }

  private getSelectedConditionId(): ConditionId {
    return this.conditionIds[this.selectedConditionIndex];
  }

  private adjustCondition(
    field: "duration" | "stacks" | "value",
    amount: number,
  ): void {
    if (field === "duration")
      this.conditionDuration = Math.max(1, this.conditionDuration + amount);
    if (field === "stacks")
      this.conditionStacks = Math.max(1, this.conditionStacks + amount);
    if (field === "value")
      this.conditionValue = Math.max(0, this.conditionValue + amount);
    this.updateConditionControls();
  }

  private startBasicAttackTargeting(attackType: "melee" | "ranged"): void {
    const attacker = this.combatEngine.getCurrentCombatant();

    if (!attacker || !attacker.alive) {
      this.setCombatLog(["No valid current combatant."]);
      return;
    }

    this.cancelAbilityTargeting();

    this.targetingAttackType = attackType;
    this.targetingActive = true;
    this.targetingTargetId = null;

    this.targetingText = this.add.text(
      15,
      470,
      `TARGET: ${attackType.toUpperCase()} ATTACK\nClick a target. Press ESC to cancel.`,
      {
        fontSize: "12px",
        color: "#ffffff",
        backgroundColor: "#222222",
        padding: {
          x: 8,
          y: 6,
        },
      },
    );

    this.setCombatLog([
      `${attackType.toUpperCase()} attack targeting`,
      "",
      "Click a target.",
      "Press ESC to cancel.",
    ]);

    this.input.keyboard?.on("keydown-ESC", this.handleTargetingEscape, this);
  }

  private handleBasicAttackTargetClick(targetId: string): void {
    const attacker = this.combatEngine.getCurrentCombatant();
    const target = this.getCombatant(targetId);
    const attackType = this.targetingAttackType;

    if (!attacker || !target || !attackType) {
      return;
    }

    if (!target.alive) {
      this.setCombatLog([
        `Invalid target: ${target.name}`,
        "",
        "Target is defeated.",
      ]);
      return;
    }

    const distance =
      this.combatEngine.getDistanceBetween(attacker.id, target.id) ?? 0;

    if (attackType === "melee" && distance > 1) {
      this.setCombatLog([
        `Invalid target: ${target.name}`,
        "",
        `Distance: ${distance.toFixed(1)}m`,
        "Melee range is limited to 1m.",
      ]);
      return;
    }

    // First click = select target
    if (this.targetingTargetId !== targetId) {
      this.targetingTargetId = targetId;

      this.setCombatLog([
        `Selected target: ${target.name}`,
        "",
        `Distance: ${distance.toFixed(1)}m`,
        `Click ${target.name} again to confirm the ${attackType} attack.`,
        "Press ESC to cancel.",
      ]);

      return;
    }

    // Second click = confirm attack
    this.targetingAttackType = null;
    this.targetingActive = false;
    this.targetingTargetId = null;

    this.targetingText?.destroy();
    this.targetingText = undefined;

    this.input.keyboard?.off("keydown-ESC", this.handleTargetingEscape, this);

    if (attackType === "ranged") {
      this.executeRangedAttack(target.id);
    } else {
      this.executeMeleeAttack(target.id);
    }
  }

  private redrawAbilityInstances(): void {
    if (!this.abilityInstanceGraphics) {
      return;
    }

    this.abilityInstanceGraphics.clear();

    const instances = this.combatEngine.getAbilityInstances();

    for (const instance of instances) {
      const x = instance.position.x * cellSize + cellSize / 2;
      const y = instance.position.y * cellSize + cellSize / 2;

      this.abilityInstanceGraphics.lineStyle(2, 0xffcc33, 0.9);
      this.abilityInstanceGraphics.fillStyle(0xffcc33, 0.18);

      if (
        instance.area.shape === "circle" &&
        instance.area.radius !== undefined
      ) {
        const radius = instance.area.radius * cellSize;

        this.abilityInstanceGraphics.fillCircle(x, y, radius);
        this.abilityInstanceGraphics.strokeCircle(x, y, radius);

        continue;
      }

      if (
        instance.area.shape === "rectangle" &&
        instance.area.width !== undefined &&
        instance.area.height !== undefined
      ) {
        const width = instance.area.width * cellSize;
        const height = instance.area.height * cellSize;

        this.abilityInstanceGraphics.fillRect(
          x - width / 2,
          y - height / 2,
          width,
          height,
        );

        this.abilityInstanceGraphics.strokeRect(
          x - width / 2,
          y - height / 2,
          width,
          height,
        );
      }
    }
  }

  private handleAbilityInstanceAttackClick(instanceId: string): void {
    const attacker = this.combatEngine.getCurrentCombatant();
    const attackType = this.targetingAttackType;

    if (!attacker || !attacker.alive || !attackType) {
      return;
    }

    const instance = this.combatEngine.getAbilityInstance(instanceId);

    if (!instance) {
      return;
    }

    if (instance.hp === undefined) {
      this.setCombatLog([
        "This ability instance cannot be attacked.",
        "",
        "It has no HP.",
      ]);
      return;
    }

    const distance = this.combatEngine.getDistanceBetweenPosition(
      attacker.position,
      instance.position,
    );

    if (attackType === "melee" && distance > 1) {
      this.setCombatLog([
        "Instance is out of melee range.",
        "",
        `Distance: ${distance.toFixed(1)}m`,
        "Melee range is limited to 1m.",
      ]);
      return;
    }

    if (this.targetingInstanceId !== instanceId) {
      this.targetingInstanceId = instanceId;

      this.setCombatLog([
        `Selected instance: ${instance.abilityId}`,
        "",
        `HP: ${instance.hp}/${instance.maxHp ?? instance.hp}`,
        `Distance: ${distance.toFixed(1)}m`,
        "",
        `Click the instance again to confirm the ${attackType} attack.`,
        "Press ESC to cancel.",
      ]);

      return;
    }

    this.targetingAttackType = null;
    this.targetingInstanceId = null;
    this.targetingActive = false;

    this.targetingText?.destroy();
    this.targetingText = undefined;

    this.input.keyboard?.off("keydown-ESC", this.handleTargetingEscape, this);

    const result = this.combatEngine.attackAbilityInstance(
      instanceId,
      attackType,
    );

    if (!result.success) {
      this.setCombatLog([
        "Attack failed.",
        "",
        "This instance cannot be attacked.",
      ]);
      return;
    }

    const currentInstance = this.combatEngine.getAbilityInstance(instanceId);

    const log = [
      `${attacker.name} attacks ${instance.abilityId}`,
      "",
      `Hit chance: ${result.chance.toFixed(1)}%`,
      `Roll: ${result.roll.toFixed(1)}`,
      "",
    ];

    if (!result.hit) {
      log.push("MISS!");
    } else {
      log.push("HIT!");
      log.push("");
      log.push(`Damage: ${result.damageDealt}`);

      if (currentInstance) {
        log.push(
          `Instance HP: ${currentInstance.hp}/${currentInstance.maxHp ?? currentInstance.hp}`,
        );
      } else {
        log.push("Instance destroyed!");
      }
    }

    this.setCombatLog(log);
    this.redrawAbilityInstances();
    this.updateInterface();
  }

  private handleAbilityInstanceDisarmClick(instanceId: string): void {
    const attacker = this.combatEngine.getCurrentCombatant();

    if (!attacker || !attacker.alive) {
      return;
    }

    const instance = this.combatEngine.getAbilityInstance(instanceId);

    if (!instance) {
      return;
    }

    if (!instance.disarmable) {
      this.setCombatLog([
        "This ability cannot be disarmed.",
        "",
        `Instance: ${instance.abilityId}`,
      ]);
      return;
    }

    const distance = this.combatEngine.getDistanceBetweenPosition(
      attacker.position,
      instance.position,
    );

    if (this.targetingInstanceId !== instanceId) {
      this.targetingInstanceId = instanceId;

      this.setCombatLog([
        `Selected instance: ${instance.abilityId}`,
        "",
        `Distance: ${distance.toFixed(1)}m`,
        "",
        "Click the instance again to disarm it.",
        "Press ESC to cancel.",
      ]);

      return;
    }

    this.disarmTargeting = false;
    this.targetingInstanceId = null;
    this.targetingActive = false;

    this.targetingText?.destroy();
    this.targetingText = undefined;

    this.input.keyboard?.off("keydown-ESC", this.handleTargetingEscape, this);

    const result = this.combatEngine.disarmAbilityInstance(instanceId);

    if (result.distance > result.range) {
      this.setCombatLog([
        "Too far away.",
        "",
        `Distance: ${result.distance.toFixed(1)}m`,
        `Disarm range: ${result.range}m`,
      ]);
      return;
    }

    if (!result.success) {
      const modifierText =
        result.modifier >= 0 ? `+${result.modifier}` : `${result.modifier}`;

      this.setCombatLog([
        `${attacker.name} failed to disarm ${instance.abilityId}.`,
        "",
        `Roll: ${result.roll}`,
        `Dexterity: ${modifierText}`,
        `Total: ${result.total}`,
        `DC: ${result.dc}`,
        "",
        "DISARM FAILED",
      ]);

      return;
    }

    const modifierText =
      result.modifier >= 0 ? `+${result.modifier}` : `${result.modifier}`;

    this.setCombatLog([
      `${attacker.name} disarmed ${instance.abilityId}.`,
      "",
      `Roll: ${result.roll}`,
      `Dexterity: ${modifierText}`,
      `Total: ${result.total}`,
      `DC: ${result.dc}`,
      "",
      "DISARM SUCCESSFUL",
    ]);

    this.redrawAbilityInstances();
    this.updateInterface();

    this.setCombatLog([
      `${attacker.name} disarmed ${instance.abilityId}.`,
      "",
      `Roll: ${result.roll} vs DC ${result.dc}`,
      "The ability instance was removed.",
    ]);

    this.redrawAbilityInstances();
    this.updateInterface();
  }

  private toggleConditionTarget(): void {
    this.conditionTargetId =
      this.conditionTargetId === "goblin" ? "ranger" : "goblin";
    this.updateConditionControls();
    this.setCombatLog([
      `Condition target: ${this.getCombatant(this.conditionTargetId)?.name ?? this.conditionTargetId}`,
      "",
      "Click the target selector to switch between Ranger and Goblin.",
    ]);
  }

  private startDisarmTargeting(): void {
    const attacker = this.combatEngine.getCurrentCombatant();

    if (!attacker || !attacker.alive) {
      return;
    }

    if (!attacker.actionAvailable) {
      this.setCombatLog(["Cannot disarm.", "", "No action available."]);
      return;
    }

    this.disarmTargeting = true;
    this.targetingActive = true;
    this.targetingInstanceId = null;

    this.targetingText?.destroy();

    this.targetingText = this.add.text(
      20,
      100,
      "Select an ability instance to disarm.\nPress ESC to cancel.",
      {
        fontSize: "18px",
        color: "#ffffff",
        backgroundColor: "#222222",
        padding: {
          left: 10,
          right: 10,
          top: 8,
          bottom: 8,
        },
      },
    );
  }

  private updateConditionControls(): void {
    const conditionId = this.getSelectedConditionId();
    const target = this.getCombatant(this.conditionTargetId);

    this.conditionTargetText?.setText(
      `Target: ${target?.name ?? this.conditionTargetId}`,
    );
    this.conditionSelectorText?.setText(`Condition: ${conditionId}`);
    this.conditionDurationText?.setText(`Duration: ${this.conditionDuration}`);
    this.conditionStacksText?.setText(`Stacks: ${this.conditionStacks}`);
    this.conditionValueText?.setText(`Value: ${this.conditionValue}`);
  }

  private applyCondition(): void {
    const caster = this.combatEngine.getCurrentCombatant();
    if (!caster || !caster.alive) return;

    const targetId = this.conditionTargetId;
    const conditionId = this.getSelectedConditionId();

    const result = this.combatEngine.applyCondition(
      targetId,
      conditionId,
      this.conditionDuration,
      this.conditionStacks,
      this.conditionValue,
      caster.id,
    );

    /*console.log(
      `[Condition Test] ${conditionId} on ${targetId}: ${
        result ? "APPLIED" : "RESISTED / FAILED"
      }`,
    );*/

    this.updateCharacterPositions();
    this.updateInterface();

    this.updateInterface();

    if (!result) {
      this.setCombatLog([
        `Could not apply ${conditionId}.`,
        "",
        "Condition was resisted or could not be applied.",
      ]);
      return;
    }

    this.setCombatLog([
      `${this.getCombatant(targetId)?.name} gains ${conditionId}.`,
      "",
      `Duration: ${this.conditionDuration} rounds`,
      `Stacks: ${this.conditionStacks}`,
      `Value: ${this.conditionValue}`,
    ]);
  }

  private removeSelectedCondition(): void {
    const targetId = this.conditionTargetId;
    const target = this.getCombatant(targetId);
    const conditionId = this.getSelectedConditionId();

    if (!target) return;

    this.combatEngine.removeCondition(target.id, conditionId);
    this.updateInterface();
    this.setCombatLog([`Removed ${conditionId} from ${target.name}.`]);
  }

  private endTurn(): void {
    const current = this.combatEngine.getCurrentCombatant();

    if (!current) {
      return;
    }

    this.combatEngine.endTurn();

    // Refresh persistent ability visuals after durations are processed.
    this.redrawAbilityInstances();

    const next = this.combatEngine.getCurrentCombatant();

    this.updateInterface();

    this.setCombatLog([
      `${current.name} ended their turn.`,
      "",
      `Now acting: ${next?.name ?? "-"}`,
      "",
      `Round: ${this.combatEngine.getState().round}`,
    ]);
  }

  private updateInterface(): void {
    this.rangerHpText.setText(this.getRangerHpText());

    this.ranger2HpText.setText(this.getRanger2HpText());

    this.goblinHpText.setText(this.getGoblinHpText());

    this.goblin2HpText.setText(this.getGoblin2HpText());

    //this.rangerMovementText.setText(this.getRangerMovementText());

    //this.goblinMovementText.setText(this.getGoblinMovementText());
    //this.rangerDefenseText.setText(this.getRangerDefenseText());
    //this.goblinDefenseText.setText(this.getGoblinDefenseText());
    //this.rangerPatternText.setText(this.getRangerPatternText());

    this.turnText.setText(this.getTurnText());

    this.resourcesText.setText(this.getActionResourceText());
    this.defenseText.setText(this.getDefensePromptText());

    this.rangerStatusText.setText(this.getConditionText("ranger"));

    this.goblinStatusText.setText(this.getConditionText("goblin"));
    this.updateConditionControls();
  }

  /*private getRangerPatternText(): string {
    const ranger = this.getCombatant("ranger");

    if (!ranger) {
      return "Ranger Pattern: ?";
    }

    const state = this.combatEngine.getState();
    const knowledge = state.patternKnowledge.ranger?.find(
      (pattern) => pattern.targetId === "goblin",
    );

    if (!knowledge) {
      return "Ranger → Goblin Pattern: 0/5 (0%)";
    }

    return `Ranger → Goblin Pattern: ${knowledge.attacksObserved}/5 (${knowledge.bonus}%)`;
  }*/

  private getRangerHpText(): string {
    const ranger = this.getCombatant("ranger");

    if (!ranger) {
      return "Ranger HP: ?";
    }

    return `Ranger HP: ${ranger.hp}/${ranger.maxHp}`;
  }

  private getRanger2HpText(): string {
    const ranger2 = this.getCombatant("ranger2");

    if (!ranger2) {
      return "Ranger2 HP: ?";
    }

    return `Ranger2 HP: ${ranger2.hp}/${ranger2.maxHp}`;
  }

  private getGoblinHpText(): string {
    const goblin = this.getCombatant("goblin");

    if (!goblin) {
      return "Goblin HP: ?";
    }

    return `Goblin HP: ${goblin.hp}/${goblin.maxHp}`;
  }

  private getGoblin2HpText(): string {
    const goblin2 = this.getCombatant("goblin2");

    if (!goblin2) {
      return "Goblin 2 HP: ?";
    }

    return `Goblin 2 HP: ${goblin2.hp}/${goblin2.maxHp}`;
  }

  /*private getRangerMovementText(): string {
    const ranger = this.getCombatant("ranger");

    if (!ranger) {
      return "Ranger Move: ?";
    }

    return `Ranger Move: ${ranger.movementRemaining}/${ranger.movement}m`;
  }

  private getGoblinMovementText(): string {
    const goblin = this.getCombatant("goblin");

    if (!goblin) {
      return "Goblin Move: ?";
    }

    return `Goblin Move: ${goblin.movementRemaining}/${goblin.movement}m`;
  }

  private getRangerDefenseText(): string {
    const ranger = this.getCombatant("ranger");

    if (!ranger) {
      return "Ranger Defense: ?";
    }

    const defense = getDefenseStats(ranger.stats);

    return `Ranger Armor: ${ranger.armor} | MR: ${ranger.magicResistance}
    Dodge: ${defense.physicalDodge}% | Spell: ${defense.spellDodge}%
    Parry: ${defense.parry}% | Effect Res: ${defense.effectResistance}% | Mental Res: ${defense.mentalResistance}%`;
  }*/

  /*private getGoblinDefenseText(): string {
    const goblin = this.getCombatant("goblin");

    if (!goblin) {
      return "Goblin Dodge: ?";
    }

    const defense = getDefenseStats(goblin.stats);
    return `Goblin Dodge: ${defense.physicalDodge}% | Spell: ${defense.spellDodge}%\nParry: ${defense.parry}% | Effect Res: ${defense.effectResistance}% | Mental Res: ${defense.mentalResistance}%`;
  }}*/

  private toggleAttributeTarget(): void {
    this.attributeTargetId =
      this.attributeTargetId === "ranger" ? "goblin" : "ranger";
    this.updateAttributeControls();
  }

  private nextAttribute(): void {
    const attributes: (keyof CharacterStats)[] = [
      "strength",
      "dexterity",
      "constitution",
      "intelligence",
      "wisdom",
      "charisma",
    ];

    const index = attributes.indexOf(this.selectedAttribute);
    this.selectedAttribute = attributes[(index + 1) % attributes.length];
    this.updateAttributeControls();
  }

  private adjustSelectedAttribute(amount: number): void {
    const combatant = this.getCombatant(this.attributeTargetId);

    if (!combatant) {
      return;
    }

    combatant.stats[this.selectedAttribute] = Math.max(
      1,
      Math.min(18, combatant.stats[this.selectedAttribute] + amount),
    );

    this.updateAttributeControls();
    this.updateInterface();
  }

  private updateAttributeControls(): void {
    const combatant = this.getCombatant(this.attributeTargetId);

    if (!combatant) {
      return;
    }

    this.attributeTargetText?.setText(`Target: ${combatant.name}`);
    this.attributeSelectorText?.setText(`Attribute: ${this.selectedAttribute}`);
    this.attributeValueText?.setText(
      `${combatant.name} ${this.selectedAttribute}: ${combatant.stats[this.selectedAttribute]}`,
    );
  }

  private getTurnText(): string {
    const current = this.combatEngine.getCurrentCombatant();

    if (!current) {
      return "Turn: -";
    }

    const state = this.combatEngine.getState();

    return [`Turn: ${current.name}`, `Round: ${state.round}`].join(" | ");
  }

  private getActionResourceText(): string {
    const current = this.combatEngine.getCurrentCombatant();

    if (!current) {
      return "";
    }

    return [
      `Action: ${current.actionAvailable ? "YES" : "NO"}`,
      `Bonus: ${current.bonusActionAvailable ? "YES" : "NO"}`,
      `Reaction: ${current.reactionAvailable ? "YES" : "NO"}`,
    ].join(" | ");
  }

  private getDefensePromptText(): string {
    const pendingCount = this.combatEngine.getPendingDefenseCount();

    if (pendingCount === 0) {
      return "";
    }

    const pending = this.combatEngine.getPendingDefense();

    if (!pending) {
      return "";
    }

    const defender = this.getCombatant(pending.defenderId);

    if (pendingCount === 1) {
      return defender
        ? `DEFENSE: ${defender.name} — choose Dodge or Parry`
        : "";
    }

    return defender
      ? `DEFENSE: ${defender.name} — choose Dodge or Parry (${pendingCount} pending)`
      : `DEFENSE: ${pendingCount} attacks pending`;
  }

  private getConditionText(combatantId: string): string {
    const combatant = this.getCombatant(combatantId);

    if (!combatant) {
      return "";
    }

    const conditions = this.combatEngine
      .getState()
      .conditionManager.getConditions(combatantId);

    if (conditions.length === 0) {
      return `${combatant.name}: no conditions`;
    }

    const conditionText = conditions
      .map((condition) => {
        const stacks = condition.stacks > 1 ? ` x${condition.stacks}` : "";
        const value =
          condition.value !== undefined ? ` [${condition.value}]` : "";

        const source =
          condition.sourceId !== undefined ? ` <- ${condition.sourceId}` : "";

        return `${condition.id}${stacks} (${condition.duration})${value}${source}`;
      })
      .join(", ");

    return `${combatant.name}: ${conditionText}`;
  }

  private updateCharacterPositions(): void {
    const ranger = this.getCombatant("ranger");
    const ranger2 = this.getCombatant("ranger2");

    const goblin = this.getCombatant("goblin");
    const goblin2 = this.getCombatant("goblin2");

    if (ranger) {
      this.ranger.setPosition(
        ranger.position.x * cellSize + cellSize / 2,
        ranger.position.y * cellSize + cellSize / 2,
      );
    }

    if (ranger2) {
      this.ranger2.setPosition(
        ranger2.position.x * cellSize + cellSize / 2,
        ranger2.position.y * cellSize + cellSize / 2,
      );
    }

    if (goblin) {
      this.goblin.setPosition(
        goblin.position.x * cellSize + cellSize / 2,
        goblin.position.y * cellSize + cellSize / 2,
      );
    }

    if (goblin2) {
      this.goblin2.setPosition(
        goblin2.position.x * cellSize + cellSize / 2,
        goblin2.position.y * cellSize + cellSize / 2,
      );
    }
  }

  private getCombatant(id: string): Combatant | undefined {
    return this.combatEngine
      ?.getState()
      .combatants.find((combatant) => combatant.id === id);
  }

  private setCombatLog(lines: string[]): void {
    this.combatText.setText(lines.join("\n"));
  }
}
