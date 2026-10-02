import type { AbilityDefinition } from "../Ability";

export const LEVELTHREESPELLS: AbilityDefinition[] = [
  //COMBAT DEALING DAMAGE SPELLS

  {
    id: "burning_floor",
    nameKey: "spell_burning_floor",
    descriptionKey: "spell_burning_floor_description",

    actionType: "action",
    targetType: "location",
    targetingMode: "area",

    range: 15,

    area: {
      shape: "circle",
      radius: 6,
    },

    effects: [
      {
        type: "damage",
        damage: {
          count: 3,
          sides: 10,
          type: "physical",
        },
      },
    ],

    recovery: "unlimited",

    instance: {
      lifetime: "duration",
      duration: 5,

      effects: [
        {
          trigger: "enter-area",
          effect: {
            type: "damage",
            damage: {
              count: 1,
              sides: 6,
              type: "physical",
            },
          },
        },
        {
          trigger: "enter-area",
          effect: {
            type: "apply-condition",
            conditionId: "burning",
            duration: 2,
          },
        },
        {
          trigger: "move-inside-area",
          effect: {
            type: "damage",
            damage: {
              count: 1,
              sides: 6,
              type: "physical",
            },
          },
        },
        {
          trigger: "move-inside-area",
          effect: {
            type: "apply-condition",
            conditionId: "burning",
            duration: 2,
          },
        },
        {
          trigger: "turn-start",
          effect: {
            type: "damage",
            damage: {
              count: 1,
              sides: 6,
              type: "physical",
            },
          },
        },
        {
          trigger: "turn-start",
          effect: {
            type: "apply-condition",
            conditionId: "burning",
            duration: 2,
          },
        },
      ],
    },

    isSpell: true,
    spellLevel: 3,

    imagePath: "/assets/abilities/",
  },

  //OTP SPELL CHOOSE ONE EFFECT AND IT WILL LAST UNTIL LONG REST, SOMETIMES IT WILL BE BETTER TO USE ANOTHER THING BUT FUCK IT YOU ARE AN OTP
];
