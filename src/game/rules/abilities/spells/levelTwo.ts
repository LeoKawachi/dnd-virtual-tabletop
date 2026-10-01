import type { AbilityDefinition } from "../Ability";

export const LEVELTWOSPELLS: AbilityDefinition[] = [
  //COMBAT DEALING DAMAGE SPELLS

  {
    id: "acid_arrow",

    nameKey: "spell_acid_arrow",
    descriptionKey: "spell_acid_arrow_description",

    actionType: "action",
    targetType: "location",
    targetingMode: "area",

    range: 8,

    allowedClasses: ["wizard"],

    area: {
      shape: "circle",
      radius: 2,
    },

    effects: [
      {
        type: "damage",
        damage: {
          count: 3,
          sides: 7,
          type: "magic",
          scaling: {
            type: "character-level",
            modifier: {
              9: +2,
            },
          },
        },
      },
    ],

    recovery: "unlimited",

    instance: {
      lifetime: "duration",
      duration: 2,

      effects: [
        {
          trigger: "enter-area",
          effect: {
            type: "damage",
            damage: {
              count: 2,
              sides: 4,
              type: "magic",
            },
          },
        },
        {
          trigger: "turn-start",
          effect: {
            type: "damage",
            damage: {
              count: 2,
              sides: 4,
              type: "magic",
            },
          },
        },
      ],
    },

    isSpell: true,
    spellLevel: 2,

    concentration: true,

    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  {
    id: "scorching_ray",
    nameKey: "spell_scorching_ray",
    descriptionKey: "spell_scorching_ray_description",
    actionType: "action",
    targetType: "enemy",
    targetingMode: "multi",
    range: 15,
    maxTargets: 4,
    allowedClasses: ["wizard"],
    effects: [
      {
        type: "damage",
        damage: {
          count: 2,
          sides: 10,
          type: "magic",
          scaling: {
            type: "character-level",
            modifier: {
              9: +2,
            },
          },
        },
      },
    ],
    recovery: "unlimited",
    isSpell: true,
    spellLevel: 2,
    imagePath: "/assets/abilities/",
  },

  {
    id: "shatter",
    nameKey: "spell_shatter",
    descriptionKey: "spell_shatter_description",

    actionType: "action",
    targetType: "location",
    targetingMode: "area",

    range: 10,

    allowedClasses: ["wizard", "druid"],

    area: {
      shape: "circle",
      radius: 4,
    },

    effects: [
      {
        type: "damage",
        damage: {
          count: 3,
          sides: 8,
          type: "magic",
        },
      },
    ],

    recovery: "unlimited",

    isSpell: true,
    spellLevel: 2,

    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  {
    id: "revenge",

    nameKey: "spell_revenge",
    descriptionKey: "spell_revenge_description",

    actionType: "action",
    targetType: "enemy",
    targetingMode: "single",
    attackType: "spell",

    range: 4,

    allowedClasses: ["barbarian"],

    effects: [
      {
        type: "damage",
        damage: {
          count: 2,
          sides: 10,
          type: "physical",
          registerModifier: {
            type: "damage-taken",
            rounds: 1,
            multiplier: 1,
          },
        },
      },
    ],

    recovery: "short-rest",

    isSpell: true,
    spellLevel: 2,

    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  {
    id: "consumer",

    nameKey: "spell_consumer",
    descriptionKey: "spell_consumer_description",

    actionType: "action",
    targetType: "enemy",
    targetingMode: "single",
    attackType: "spell",

    range: 10,

    allowedClasses: ["wizard", "druid", "cleric", "bard"],

    effects: [
      {
        type: "damage",
        damage: {
          count: 2,
          sides: 10,
          type: "magic",

          consumeConditions: ["poisoned", "burning", "acid", "bleeding"],
        },
      },
    ],

    recovery: "unlimited",

    isSpell: true,
    spellLevel: 2,

    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  {
    id: "spike_growth",
    nameKey: "spell_spike_growth",
    descriptionKey: "spell_spike_growth_description",

    actionType: "action",
    targetType: "location",
    targetingMode: "area",

    range: 10,
    allowedClasses: ["druid", "ranger"],

    area: {
      shape: "circle",
      radius: 5,
    },

    effects: [
      {
        type: "damage",
        damage: {
          count: 3,
          sides: 7,
          type: "magic",
        },
      },
    ],

    recovery: "unlimited",

    instance: {
      lifetime: "duration",
      duration: 4,

      effects: [
        {
          trigger: "enter-area",
          effect: {
            type: "damage",
            damage: {
              count: 1,
              sides: 6,
              type: "magic",
            },
          },
        },
        {
          trigger: "enter-area",
          effect: {
            type: "apply-condition",
            conditionId: "bleeding",
            duration: 2,
            stacks: 1,
          },
        },
        {
          trigger: "enter-area",
          effect: {
            type: "apply-condition",
            conditionId: "slowed",
            duration: 1,
            stacks: 1,
          },
        },
        {
          trigger: "move-inside-area",
          effect: {
            type: "damage",
            damage: {
              count: 1,
              sides: 6,
              type: "magic",
            },
          },
        },
        {
          trigger: "move-inside-area",
          effect: {
            type: "apply-condition",
            conditionId: "bleeding",
            duration: 2,
            stacks: 1,
          },
        },
        {
          trigger: "move-inside-area",
          effect: {
            type: "apply-condition",
            conditionId: "slowed",
            duration: 1,
            stacks: 1,
          },
        },
      ],
    },

    concentration: true,

    isSpell: true,
    spellLevel: 2,

    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  {
    id: "natures_dread",

    nameKey: "spell_natures_dread",
    descriptionKey: "spell_natures_dread_description",

    actionType: "action",
    targetType: "enemy",
    targetingMode: "single",
    attackType: "spell",

    range: 7,
    allowedClasses: ["druid"],

    effects: [
      {
        type: "damage",
        damage: {
          count: 3,
          sides: 8,
          type: "magic",
        },
      },
      {
        type: "apply-condition",
        conditionId: "cursed",
        duration: 3,
        stacks: 1,
      },
    ],

    recovery: "unlimited",

    isSpell: true,
    spellLevel: 2,

    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  {
    id: "cloud_of_daggers",

    nameKey: "spell_cloud_of_daggers",
    descriptionKey: "spell_cloud_of_daggers_description",

    actionType: "action",
    targetType: "location",
    targetingMode: "area",

    range: 10,
    allowedClasses: ["bard", "wizard"],

    area: {
      shape: "circle",
      radius: 3,
    },

    effects: [
      {
        type: "damage",
        damage: {
          count: 3,
          sides: 5,
          type: "magic",
        },
      },
    ],

    recovery: "unlimited",

    instance: {
      lifetime: "duration",
      duration: 3,

      effects: [
        {
          trigger: "enter-area",
          effect: {
            type: "damage",
            damage: {
              count: 1,
              sides: 9,
              type: "magic",
            },
          },
        },
        {
          trigger: "enter-area",
          effect: {
            type: "apply-condition",
            conditionId: "bleeding",
            duration: 2,
            stacks: 1,
            value: 2,
          },
        },

        {
          trigger: "turn-start",
          effect: {
            type: "damage",
            damage: {
              count: 1,
              sides: 9,
              type: "magic",
            },
          },
        },
        {
          trigger: "turn-start",
          effect: {
            type: "apply-condition",
            conditionId: "bleeding",
            duration: 2,
            stacks: 1,
            value: 2,
          },
        },

        {
          trigger: "move-inside-area",
          effect: {
            type: "damage",
            damage: {
              count: 1,
              sides: 9,
              type: "magic",
            },
          },
        },
        {
          trigger: "move-inside-area",
          effect: {
            type: "apply-condition",
            conditionId: "bleeding",
            duration: 2,
            stacks: 1,
            value: 2,
          },
        },
      ],
    },

    concentration: true,

    isSpell: true,
    spellLevel: 2,

    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  // NEEDS FIX
  // ANTI HEAL
  {
    id: "harrowing_wounds",

    nameKey: "spell_harrowing_wounds",
    descriptionKey: "spell_harrowing_wounds_description",

    actionType: "action",
    targetType: "enemy",
    targetingMode: "single",
    attackType: "spell",

    range: 8,
    allowedClasses: ["cleric", "druid", "wizard", "bard"],

    effects: [
      {
        type: "damage",
        damage: {
          count: 3,
          sides: 9,
          type: "magic",
        },
      },
      {
        type: "apply-condition",
        //conditionId: "anti-heal",
        duration: 3,
        stacks: 1,
      },
    ],

    recovery: "unlimited",

    isSpell: true,
    spellLevel: 2,

    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  // NEEDS FIX
  // SUMMONING
  {
    id: "flaming_sphere",
    nameKey: "spell_flaming_sphere",
    descriptionKey: "spell_flaming_sphere_description",
    actionType: "action",
    targetType: "location",
    targetingMode: "single",
    range: 6,
    allowedClasses: ["wizard", "druid"],
    effects: [],
    recovery: "unlimited",
    isSpell: true,
    spellLevel: 2,
    resourceCost: {
      amount: 1,
    },
    imagePath: "/assets/abilities/",
  },

  // NEEDS FIX
  // SUMMONING
  {
    id: "spiritual_weapon",
    nameKey: "spell_spiritual_weapon",
    descriptionKey: "spell_spiritual_weapon_description",

    allowedClasses: ["cleric"],

    actionType: "action",
    targetType: "self",
    targetingMode: "single",

    effects: [],

    isSpell: true,
    recovery: "unlimited",
    spellLevel: 2,
    resourceCost: {
      amount: 1,
    },
  },

  //NEEDS FIX
  //AREA / MOVEMENT SET
  {
    id: "plant_growth",

    nameKey: "spell_plant_growth",
    descriptionKey: "spell_plant_growth_description",

    actionType: "action",
    targetType: "location",
    targetingMode: "area",

    range: 10,

    allowedClasses: ["druid"],

    area: {
      shape: "circle",
      radius: 6,
    },

    effects: [],

    recovery: "unlimited",

    isSpell: true,
    spellLevel: 2,

    concentration: true,

    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  //NEEDS FIX
  //SUMMON SET
  {
    id: "summon_beast",

    nameKey: "spell_summon_beast",
    descriptionKey: "spell_summon_beast_description",

    actionType: "action",
    targetType: "location",
    targetingMode: "single",

    range: 5,

    allowedClasses: ["druid"],

    effects: [],

    recovery: "unlimited",

    isSpell: true,
    spellLevel: 2,

    concentration: true,

    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  //UTILITY SPELLS

  {
    id: "blur",

    nameKey: "spell_blur",
    descriptionKey: "spell_blur_description",

    actionType: "action",
    targetType: "self",
    targetingMode: "single",

    allowedClasses: ["wizard", "cleric", "thief", "bard"],

    concentration: true,

    effects: [
      {
        type: "modify-behavior",
        duration: 3,
        modifier: {
          behavior: "defense",
          operation: "disadvantage",
          trigger: "attack",
        },
      },
    ],

    recovery: "unlimited",

    isSpell: true,
    spellLevel: 2,
    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  {
    id: "enlarge",
    nameKey: "spell_enlarge",
    descriptionKey: "spell_enlarge_description",
    actionType: "action",
    targetType: "self-or-ally",
    targetingMode: "single",
    range: 6,
    allowedClasses: ["wizard", "barbarian", "fighter"],
    concentration: true,

    effects: [
      {
        type: "modify-behavior",
        duration: 3,
        modifier: {
          behavior: "stat",
          operation: "add",
          stat: "strength",
          value: 2,
          trigger: "turn",
        },
      },
    ],

    recovery: "unlimited",
    isSpell: true,
    spellLevel: 2,
    resourceCost: {
      amount: 1,
    },
    imagePath: "/assets/abilities/",
  },

  {
    id: "reduce",
    nameKey: "spell_reduce",
    descriptionKey: "spell_reduce_description",
    actionType: "action",
    targetType: "enemy",
    targetingMode: "single",
    range: 6,
    allowedClasses: ["wizard"],
    concentration: true,

    effects: [
      {
        type: "modify-behavior",
        duration: 3,
        modifier: {
          behavior: "stat",
          operation: "add",
          stat: "strength",
          value: -2,
          trigger: "turn",
        },
      },
    ],

    recovery: "unlimited",
    isSpell: true,
    spellLevel: 2,
    resourceCost: {
      amount: 1,
    },
    imagePath: "/assets/abilities/",
  },

  {
    id: "lesser_restoration",
    nameKey: "spell_lesser_restoration",
    descriptionKey: "spell_lesser_restoration_description",
    actionType: "action",
    targetType: "self-or-ally",
    targetingMode: "single",
    range: 6,
    allowedClasses: ["wizard", "cleric", "paladin", "bard", "druid"],

    classModifiers: {
      paladin: {
        range: 1,
      },
    },

    effects: [
      {
        type: "remove-condition",
        conditionIds: ["poisoned", "acid", "burning"],
      },
    ],

    recovery: "unlimited",
    isSpell: true,
    spellLevel: 2,
    resourceCost: {
      amount: 1,
    },
    imagePath: "/assets/abilities/",
  },

  {
    id: "back_to_the_battle",

    nameKey: "spell_back_to_the_battle",
    descriptionKey: "spell_back_to_the_battle_description",

    actionType: "action",
    targetType: "self-or-ally",
    targetingMode: "single",

    allowedClasses: ["cleric"],

    effects: [
      {
        type: "heal",
        healing: {
          count: 1,
          sides: 10,
          registerModifier: {
            type: "healing-received",
            rounds: 3,
            multiplier: 0.5,
          },
        },
      },
    ],

    recovery: "cooldown",
    cooldown: 3,

    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  {
    id: "hold_person",

    nameKey: "spell_hold_person",
    descriptionKey: "spell_hold_person_description",

    actionType: "action",
    targetType: "enemy",
    targetingMode: "single",

    range: 10,

    allowedClasses: ["wizard", "cleric", "bard"],

    effects: [
      {
        type: "apply-condition",
        conditionId: "stunned",
        duration: 3,
        targetCreatureType: "humanoid",
      },
    ],

    recovery: "unlimited",

    isSpell: true,
    spellLevel: 2,

    concentration: true,

    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  {
    id: "web",

    nameKey: "spell_web",
    descriptionKey: "spell_web_description",

    actionType: "action",
    targetType: "location",
    targetingMode: "area",

    range: 10,

    allowedClasses: ["wizard", "ranger"],

    area: {
      shape: "circle",
      radius: 4,
    },

    effects: [
      {
        type: "apply-condition",
        conditionId: "rooted",
        duration: 1,
      },
    ],

    recovery: "unlimited",

    instance: {
      lifetime: "duration",
      duration: 3,

      effects: [
        {
          trigger: "enter-area",
          effect: {
            type: "apply-condition",
            conditionId: "rooted",
            duration: 1,
          },
        },
        {
          trigger: "move-inside-area",
          effect: {
            type: "apply-condition",
            conditionId: "rooted",
            duration: 1,
          },
        },
      ],
    },

    isSpell: true,
    spellLevel: 2,

    concentration: true,

    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  {
    id: "aid",
    nameKey: "spell_aid",
    descriptionKey: "spell_aid_description",
    actionType: "action",
    targetType: "ally",
    targetingMode: "multi",
    range: 6,
    maxTargets: 3,
    allowedClasses: ["cleric", "bard"],

    effects: [
      {
        type: "temporary-hp",
        value: 5,
        duration: 3,
      },
    ],

    recovery: "unlimited",
    isSpell: true,
    spellLevel: 2,
    resourceCost: {
      amount: 1,
    },
    imagePath: "/assets/abilities/",
  },

  {
    id: "silence",

    nameKey: "spell_silence",
    descriptionKey: "spell_silence_description",

    actionType: "action",
    targetType: "location",
    targetingMode: "area",

    range: 10,

    allowedClasses: ["cleric", "bard"],

    area: {
      shape: "circle",
      radius: 4,
    },

    effects: [
      {
        type: "apply-condition",
        conditionId: "silenced",
        duration: 1,
      },
    ],

    recovery: "unlimited",

    instance: {
      lifetime: "duration",
      duration: 3,

      effects: [
        {
          trigger: "enter-area",
          effect: {
            type: "apply-condition",
            conditionId: "silenced",
            duration: 1,
          },
        },
        {
          trigger: "turn-start",
          effect: {
            type: "apply-condition",
            conditionId: "silenced",
            duration: 1,
          },
        },
      ],
    },

    isSpell: true,
    spellLevel: 2,

    concentration: true,

    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  {
    id: "prayer_of_healing",

    nameKey: "spell_prayer_of_healing",
    descriptionKey: "spell_prayer_of_healing_description",

    actionType: "action",
    targetType: "location",
    targetingMode: "area",

    range: 10,

    allowedClasses: ["cleric"],

    area: {
      shape: "circle",
      radius: 5,
    },

    effects: [
      {
        type: "heal",
        healing: {
          count: 2,
          sides: 8,
          type: "magic",
        },
      },
    ],

    recovery: "unlimited",

    isSpell: true,
    spellLevel: 2,

    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  {
    id: "blindness",

    nameKey: "spell_blindness",
    descriptionKey: "spell_blindness_description",

    actionType: "action",
    targetType: "enemy",
    targetingMode: "single",

    range: 8,

    allowedClasses: ["cleric", "bard", "wizard"],

    effects: [
      {
        type: "apply-condition",
        conditionId: "blinded",
        duration: 2,
      },
    ],

    recovery: "unlimited",

    isSpell: true,
    spellLevel: 2,

    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  {
    id: "warding_bond",

    nameKey: "spell_warding_bond",
    descriptionKey: "spell_warding_bond_description",

    actionType: "action",
    targetType: "ally",
    targetingMode: "single",
    range: 8,

    allowedClasses: ["cleric", "paladin"],

    classModifiers: {
      paladin: {
        range: 1,
      },
    },
    effects: [
      {
        type: "damage-share",
        value: 50,
        duration: 10,
      },
    ],

    recovery: "unlimited",

    isSpell: true,
    spellLevel: 2,

    resourceCost: { amount: 1 },
    imagePath: "/assets/abilities/",
  },

  {
    id: "barkskin",
    nameKey: "spell_barkskin",
    descriptionKey: "spell_barkskin_description",

    actionType: "action",
    targetType: "self-or-ally",
    targetingMode: "single",

    range: 8,
    allowedClasses: ["druid"],

    effects: [
      {
        type: "modify-behavior",
        duration: 4,
        modifier: {
          behavior: "armor",
          operation: "add",
          trigger: "turn",
          value: 5,
          amount: 1,
        },
      },
      {
        type: "modify-behavior",
        duration: 4,
        modifier: {
          behavior: "magic-resistance",
          operation: "add",
          trigger: "turn",
          value: 5,
          amount: 1,
        },
      },
    ],

    recovery: "unlimited",
    concentration: true,

    isSpell: true,
    spellLevel: 2,

    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  // NEEDS FIX
  // TELEPORT
  {
    id: "misty_step",
    nameKey: "spell_misty_step",
    descriptionKey: "spell_misty_step_description",
    actionType: "bonus-action",
    targetType: "self",
    targetingMode: "single",
    range: 9,
    allowedClasses: ["wizard", "ranger", "fighter"],

    classModifiers: {
      fighter: {
        range: 5,
      },
    },
    effects: [
      {
        type: "teleport",
        distance: 9,
      },
    ],
    recovery: "unlimited",
    isSpell: true,
    spellLevel: 2,
    resourceCost: {
      amount: 1,
    },
    imagePath: "/assets/abilities/",
  },

  // NEEDS FIX
  // Arcane Lock requires the generic interactable/lock system.
  {
    id: "arcane_lock",

    nameKey: "spell_arcane_lock",
    descriptionKey: "spell_arcane_lock_description",

    actionType: "action",
    targetType: "location",
    targetingMode: "single",

    range: 1,

    allowedClasses: ["wizard"],

    effects: [],

    recovery: "unlimited",

    isSpell: true,
    spellLevel: 2,
    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  //NEEDS FIX
  //FOG/ VISION
  {
    id: "fog_vision",

    nameKey: "spell_fog_vision",
    descriptionKey: "spell_fog_vision_description",

    actionType: "action",
    targetType: "self",
    targetingMode: "single",

    allowedClasses: ["wizard", "ranger", "thief"],

    effects: [],

    recovery: "unlimited",

    isSpell: true,
    spellLevel: 2,
    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  //NEEDS FIX
  //INVISIBILITY
  {
    id: "invisibility",

    nameKey: "spell_invisibility",
    descriptionKey: "spell_invisibility_description",

    actionType: "action",
    targetType: "self-or-ally",
    targetingMode: "single",

    range: 6,

    allowedClasses: ["wizard", "thief", "bard"],

    effects: [
      {
        type: "modify-behavior",
        duration: 3,
        modifier: {
          behavior: "defense",
          operation: "disadvantage",
          trigger: "attack",
        },
      },
    ],

    recovery: "unlimited",

    isSpell: true,
    spellLevel: 2,

    concentration: true,

    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  //NEEDS FIX
  //MOVEMENT SET
  {
    id: "agility",

    nameKey: "spell_agility",
    descriptionKey: "spell_agility_description",

    actionType: "action",
    targetType: "self-or-ally",
    targetingMode: "single",

    range: 6,

    allowedClasses: ["wizard", "ranger", "thief"],

    effects: [],

    recovery: "unlimited",

    isSpell: true,
    spellLevel: 2,

    concentration: true,

    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  //NEEDS FIX
  //STEALTH / VISION SET
  {
    id: "pass_without_trace",

    nameKey: "spell_pass_without_trace",
    descriptionKey: "spell_pass_without_trace_description",

    actionType: "action",
    targetType: "self",
    targetingMode: "single",

    range: 0,

    allowedClasses: ["druid", "ranger"],

    effects: [],

    recovery: "unlimited",

    isSpell: true,
    spellLevel: 2,

    concentration: true,

    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  //NEEDS FIX
  //CONFUSED
  {
    id: "crown_of_madness",

    nameKey: "spell_crown_of_madness",
    descriptionKey: "spell_crown_of_madness_description",

    actionType: "action",
    targetType: "enemy",
    targetingMode: "single",
    attackType: "spell",

    range: 8,
    allowedClasses: ["bard"],

    effects: [
      {
        type: "apply-condition",
        //conditionId: "confused",
        duration: 3,
        stacks: 1,
      },
    ],

    recovery: "unlimited",

    concentration: true,

    isSpell: true,
    spellLevel: 2,

    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },
];
