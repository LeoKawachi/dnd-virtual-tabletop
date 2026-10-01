export const spellTranslations = {
  en: {
    // CANTRIPS
    spell_iguinis: "Iguinis",
    spell_iguinis_description: "Launch a burst of magical fire at an enemy.",

    spell_acid_throw: "Acid Throw",
    spell_acid_throw_description:
      "Hurl an acid bubble that explodes upon contact with the enemy, applying {condition:acid}.",

    spell_frosting_legs: "Frosting Legs",
    spell_frosting_legs_description:
      "Cast a magical snow cloud around the enemy's legs, causing them to suffer from {condition:freezed} and take damage.",

    spell_multi_missiles: "Multi Missiles",
    spell_multi_missiles_description:
      "Invoke a barrage of missiles that will hit the focused enemy. The remaining missiles will hit other enemies within a 3m radius of the main target.",

    spell_poison_gas: "Poison Gas",
    spell_poison_gas_description:
      "Create a cloud of poisonous gas at the enemy's position, causing them to take damage and suffer from {condition:poisoned}.",

    spell_blessing_from_the_dead: "Blessing From The Dead",
    spell_blessing_from_the_dead_description:
      "Receive the blessing of the dead and hurl this spell at an enemy, dealing damage and leaving them {condition:cursed}.",

    spell_get_over_here: "Get Over Here",
    spell_get_over_here_description:
      "Pull the enemy toward you by up to 10m, damaging them in the process.{condition:pulled}",

    spell_shadow_bolt: "Shadow Bolt",
    spell_shadow_bolt_description:
      "Concentrate on a colorless bolt and launch it at the enemy. If they have any {tooltip:condition}, deal 25% additional damage.",

    // SUPPORT Cantrips

    spell_on_the_dot: "On The Dot",
    spell_on_the_dot_description:
      "Concentrate on your target's movements, making your {tooltip:precision} 25% better against them.",

    spell_tank_that: "Tank That",
    spell_tank_that_description:
      "Encourage your companion or yourself to withstand incoming damage. For 3 turns, gain +5 {tooltip:armor} and +5 {tooltip:magic_resistance}.",

    spell_helping_hand: "Helping Hand",
    spell_helping_hand_description:
      "Give yourself or an ally an additional 1 {tooltip:dice}4 on their next roll.",

    //SPELLS LVL 1

    spell_burning_ray: "Burning Ray",
    spell_burning_ray_description:
      "Shine a powerful ray at a 3m circular area, dealing damage and making affected enemies {condition:burning}.",

    spell_ice_shard: "Ice Shard",
    spell_ice_shard_description:
      "Throw a giant spike of ice at the target, causing them to be {condition:pushed} 4m and making them {condition:slowed} for 3 rounds.",

    spell_hand_pistol_gun: "Hand Pistol Gun",
    spell_hand_pistol_gun_description:
      "Fire magical projectiles at up to three enemies.",

    spell_lightning_arc: "Lightning Arc",
    spell_lightning_arc_description:
      "Strike an enemy with a powerful arc of lightning, then have the lightning jump to another nearby enemy. Each jump can continue to another enemy, allowing the lightning to chain between multiple targets.",

    spell_blood_thirster: "Blood Thirster",
    spell_blood_thirster_description:
      "Invoke a mist that hungers for blood, dealing heavy damage. If the target's HP is below the required threshold, the spike deals additional damage.",

    spell_earth_spike: "Earth Spike",
    spell_earth_spike_description:
      "Summon a massive spike of earth beneath an enemy, dealing damage and applying {condition:armor-penetration}, allowing the attack to ignore part of the target's {tooltip:armor}.",

    spell_radiant_bolt: "Radiant Bolt",
    spell_radiant_bolt_description:
      "Fire a powerful bolt of radiant energy at an enemy, dealing magic damage. The bolt deals additional damage against {race:undead}.",

    spell_detect_magic: "Detect Magic",
    spell_detect_magic_description:
      "Sense magical effects, objects, and creatures within the spell's range that can use magic. Roll 1{tooltip:dice}20 to determine how many magical things are revealed. The Master determines which ones are revealed.",

    spell_telepathy: "Telepathy",
    spell_telepathy_description:
      "Establish mental communication with a creature within range. The spell has no automated gameplay effect. The Master determines how the communication works. Roll 1{tooltip:dice}20 to determine how the communication goes.",

    spell_pink: "pink",
    spell_pink_description:
      "Create a magical trinket around an area. Reveal enemies that move inside its range even in fog of war or that were hidden. Enemies can destroy it making everything in its range clear of fog of war and reveling everyone hidden or enemies can try to defuse by rolling the die",

    spell_contact_spirits: "Contact Spirits",
    spell_contact_spirits_description:
      "Summon a spirit to answer one question. This spell has no automated gameplay effect. Ask the Master how the spirit responds based on a 1{tooltip:dice}20 roll.",

    spell_charm_person: "Charm Person",
    spell_charm_person_description:
      "Charm a person you touch, making them consider you a friend. The spell does not work on animals or monsters. The effect ends if the target takes damage, if the Master determines that you have proven yourself to be an enemy or caster enters combat(Cannot be used in combat).",

    spell_entangle: "Entangle",
    spell_entangle_description:
      "Spawn a field of vines that feeds on magic, ensnaring creatures caught within it. Creatures affected by the vines are {condition:silenced} and {condition:slowed}.",

    spell_moonbeam: "Moonbeam",
    spell_moonbeam_description:
      "Create a field of moonlight that damages all creatures within it and lulls them into a deep sleep.Everyone in the area falls into {condition:sleeping}",

    spell_goodberry: "Goodberry",
    spell_goodberry_description:
      "Create magical berries infused with restorative energy. A creature can consume a berry to restore a small amount of HP.",

    spell_speak_with_animals: "Speak With Animals",
    spell_speak_with_animals_description:
      "Gain the ability to communicate with beasts. The Master determines what the beast understands, what it can communicate, and how it responds.",

    spell_fog_cloud: "Fog Cloud",
    spell_fog_cloud_description:
      "Create a dense cloud of fog that obscures vision within the area, making it impossible to see through the fog.",

    spell_longstrider: "Longstrider",
    spell_longstrider_description:
      "Increase a creature's movement speed by 7m.",

    spell_wild_shape: "Wild Shape",
    spell_wild_shape_description:
      "Transform yourself into a beast, gaining its physical traits, abilities, and attacks.",

    spell_smoke_bomb: "Smoke Bomb",
    spell_smoke_bomb_description:
      "Throw a smoke bomb that creates a dense cloud of smoke, obscuring vision within the area.",

    spell_dissonant_whispers: "Dissonant Whispers",
    spell_dissonant_whispers_description:
      "Whisper unsettling words into a creature's mind, dealing magic damage and leaving it frightened.",

    spell_vicious_mockery: "Vicious Mockery",
    spell_vicious_mockery_description:
      "Unleash a string of insults that deals magic damage and disrupts the target's next attack.",

    spell_healing_word: "Healing Word",
    spell_healing_word_description:
      "Speak a healing word to restore the target's vitality.",

    spell_hunters_mark: "Hunter's Mark",
    spell_hunters_mark_description:
      "Mark a creature as your quarry. Your attacks against the marked target deal additional damage.",

    spell_piercing_shot: "Piercing Shot",
    spell_piercing_shot_description:
      "Your next attack pierces through armor, ignoring 5 points of the target's armor.",

    spell_second_wind: "Second Wind",
    spell_second_wind_description:
      "Regain 1d10 + your Fighter level hit points.",

    spell_action_surge: "Action Surge",
    spell_action_surge_description: "Gain one additional action this turn.",

    spell_rage: "Rage",
    spell_rage_description:
      "Enter a furious rage, dealing additional damage with your attacks.",

    spell_reckless_attack: "Reckless Attack",
    spell_reckless_attack_description:
      "Your next attack is made with advantage.",

    spell_acid_arrow: "Acid Arrow",
    spell_acid_arrow_description:
      "Fire a corrosive arrow at a target, dealing acid damage. The impact leaves a pool of acid on the ground that damages creatures that enter it or begin their turn within it.",

    spell_arcane_lock: "Arcane Lock",
    spell_arcane_lock_description:
      "Magically lock a door, chest, or other lockable object. The object's lock becomes harder to bypass, increasing its lock DC by 10 until the magic is removed.",

    spell_blur: "Blur",
    spell_blur_description:
      "Blur your form, causing attacks against you to have disadvantage. Requires concentration.",

    spell_fog_vision: "Fog Vision",
    spell_fog_vision_description:
      "Grant yourself the ability to see through fog and other normal visual obstructions.",

    spell_enlarge: "Enlarge",
    spell_enlarge_description:
      "Increase the target's Strength by 2 while concentrating on the spell.",

    spell_reduce: "Reduce",
    spell_reduce_description:
      "Reduce the target's Strength by 2 while concentrating on the spell.",

    spell_lesser_restoration: "Restauração Menor",
    spell_lesser_restoration_description:
      "Remove poison, acid, and burning from the target.",

    spell_flaming_sphere: "Flaming Sphere",
    spell_flaming_sphere_description:
      "Create a flaming sphere that damages nearby creatures",

    spell_misty_step: "Misty Step",
    spell_misty_step_description:
      "Teleport to an unoccupied space you can see within 9 meters.",

    spell_scorching_ray: "Scorching Ray",
    spell_scorching_ray_description:
      "Fire three scorching rays at your enemies, each dealing fire damage.",

    spell_shatter: "Shatter",
    spell_shatter_description:
      "Create a burst of thunderous energy that damages creatures in the area.",

    spell_revenge: "Revenge",
    spell_revenge_description:
      "Deals physical damage equal to 1d1 plus the total damage taken by the caster during the previous 3 rounds.",

    spell_back_to_the_battle: "Back To The Battle",
    spell_back_to_the_battle_description:
      "Restore 1d10 health plus 50% of the healing received during the previous 3 rounds.",

    spell_consumer: "Consumer",
    spell_consumer_description:
      "Consumes the target's damage-over-time conditions, dealing damage equal to their total accumulated damage before removing them.",

    spell_hold_person: "Hold Person",
    spell_hold_person_description:
      "Paralyzes a humanoid target, preventing it from acting for 3 rounds. Requires concentration.",

    spell_invisibility: "Invisibility",
    spell_invisibility_description:
      "Makes the target invisible, causing attacks against them to have disadvantage for 3 rounds. Requires concentration.",

    spell_agility: "Agility",
    spell_agility_description:
      "Allows the target to move through difficult terrain and perform movement actions such as jumping and climbing without penalties for 3 rounds. Requires concentration.",

    spell_web: "Web",
    spell_web_description:
      "Creates an area covered in sticky webs that roots creatures that enter or move through it. Requires concentration.",

    spell_spiritual_weapon: "Spiritual Weapon",
    spell_spiritual_weapon_description:
      "Summons a spiritual weapon that fights alongside the caster for several rounds.",

    spell_aid: "Aid",
    spell_aid_description:
      "Strengthens up to three allies, increasing their maximum HP for 3 rounds.",

    spell_silence: "Silence",
    spell_silence_description:
      "Create a zone of magical silence that prevents creatures within it from casting spells.",

    spell_prayer_of_healing: "Prayer of Healing",
    spell_prayer_of_healing_description:
      "Heal all allies within the area for 2d8 hit points.",

    spell_blindness: "Blindness",
    spell_blindness_description:
      "Blind a creature, severely limiting its ability to attack and defend.",

    spell_warding_bond: "Warding Bond",
    spell_warding_bond_description:
      "Protect an ally, causing you to suffer 50% of the damage they take.",

    spell_spike_growth: "Spike Growth",
    spell_spike_growth_description:
      "Cover an area with razor-sharp vegetation. Enemies that enter or move through the area take damage, become slowed, and begin bleeding.",

    spell_barkskin: "Barkskin",
    spell_barkskin_description:
      "Protect yourself or an ally with tough bark, increasing Armor by 3 for 4 turns.",

    spell_plant_growth: "Plant Growth",
    spell_plant_growth_description:
      "Cause dense vegetation to rapidly grow across an area, hindering movement through it.",

    spell_pass_without_trace: "Pass Without Trace",
    spell_pass_without_trace_description:
      "Surround yourself and nearby allies with a veil of nature that makes movement and concealment easier.",

    spell_summon_beast: "Summon Beast",
    spell_summon_beast_description:
      "Summon a fierce beast from the wild to fight alongside you.",

    spell_natures_dread: "Nature's Dread",
    spell_natures_dread_description:
      "Unleash the wrath of nature upon an enemy, dealing magic damage and cursing them for 3 turns.",

    spell_harrowing_wounds: "Harrowing Wounds",
    spell_harrowing_wounds_description:
      "Inflict a grievous magical wound upon an enemy, dealing magic damage and reducing healing received by 50% for 3 turns.",

    spell_cloud_of_daggers: "Cloud of Daggers",
    spell_cloud_of_daggers_description:
      "Fill an area with whirling magical blades that tear through enemies who enter or remain within it.",

    spell_crown_of_madness: "Crown of Madness",
    spell_crown_of_madness_description:
      "Drive an enemy into madness, causing them to attack their own allies for 3 turns.",
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  pt: {
    // CANTRIPS
    spell_iguinis: "Iguinis",
    spell_iguinis_description:
      "Lance uma explosão de fogo mágico contra um inimigo.",

    spell_acid_throw: "Arremesso Ácido",
    spell_acid_throw_description:
      "Arremesse uma bolha de ácido que explode ao entrar em contato com o inimigo, aplicando {condition:acid}.",

    spell_frosting_legs: "Pernas Congelantes",
    spell_frosting_legs_description:
      "Conjure uma nuvem de neve mágica ao redor das pernas do inimigo, fazendo com que ele sofra {condition:freezed} e receba dano.",

    spell_multi_missiles: "Múltiplos Mísseis",
    spell_multi_missiles_description:
      "Invoque uma saraivada de mísseis que atingirá o inimigo principal. Os mísseis restantes atingirão outros inimigos em um raio de 3 m ao redor do alvo principal.",

    spell_poison_gas: "Gás Venenoso",
    spell_poison_gas_description:
      "Crie uma nuvem de gás venenoso na posição do inimigo, fazendo com que ele receba dano e sofra {condition:poisoned}.",

    spell_blessing_from_the_dead: "Bênção dos Mortos",
    spell_blessing_from_the_dead_description:
      "Receba a bênção dos mortos e lance este feitiço contra um inimigo, causando dano e deixando-o {condition:cursed}.",

    spell_get_over_here: "Venha Aqui",
    spell_get_over_here_description:
      "Puxe o inimigo em sua direção por até 10 m, causando dano durante o processo e deixando-o {condition:pulled}.",

    spell_shadow_bolt: "Raio Sombrio",
    spell_shadow_bolt_description:
      "Concentre-se em um raio incolor e lance-o contra o inimigo. Se ele possuir qualquer {tooltip:condition}, cause 25% de dano adicional.",

    // CANTRIPS DE SUPORTE

    spell_on_the_dot: "Na Mosca",
    spell_on_the_dot_description:
      "Concentre-se nos movimentos do seu alvo, aumentando sua {tooltip:precision} em 25% contra ele.",

    spell_tank_that: "Aguente Essa",
    spell_tank_that_description:
      "Incentive seu companheiro ou você mesmo a resistir ao dano recebido. Por 3 turnos, ganhe +5 de {tooltip:armor} e +5 de {tooltip:magic_resistance}.",

    spell_helping_hand: "Mão Amiga",
    spell_helping_hand_description:
      "Conceda a você ou a um aliado 1{tooltip:dice}4 adicional na próxima rolagem.",

    // SPELLS LVL 1

    spell_burning_ray: "Raio Flamejante",
    spell_burning_ray_description:
      "Lance um poderoso raio em uma área circular de 3 m, causando dano e deixando os inimigos afetados {condition:burning}.",

    spell_ice_shard: "Fragmento de Gelo",
    spell_ice_shard_description:
      "Arremesse um enorme fragmento de gelo contra o alvo, fazendo com que ele seja {condition:pushed} por 4 m e fique {condition:slowed} por 3 rodadas.",

    spell_hand_pistol_gun: "Pistola de Mão",
    spell_hand_pistol_gun_description:
      "Dispare projéteis mágicos contra até três inimigos.",

    spell_lightning_arc: "Arco de Relâmpago",
    spell_lightning_arc_description:
      "Acerte um inimigo com um poderoso arco de relâmpago, fazendo com que o raio salte para outro inimigo próximo. Cada salto pode continuar para outro inimigo, permitindo que o relâmpago atinja vários alvos em sequência.",

    spell_blood_thirster: "Sede de Sangue",
    spell_blood_thirster_description:
      "Invoque uma névoa sedenta por sangue, causando dano elevado. Se o HP do alvo estiver abaixo do limite necessário, a névoa causará dano adicional.",

    spell_earth_spike: "Espinho de Terra",
    spell_earth_spike_description:
      "Conjure um enorme espinho de terra sob um inimigo, causando dano e aplicando {condition:armor-penetration}, permitindo que o ataque ignore parte da {tooltip:armor} do alvo.",

    spell_radiant_bolt: "Raio Radiante",
    spell_radiant_bolt_description:
      "Dispare um poderoso raio de energia radiante contra um inimigo, causando dano mágico. O raio causa dano adicional contra certos tipos de criaturas.",

    spell_detect_magic: "Detectar Magia",
    spell_detect_magic_description:
      "Sinta efeitos mágicos, objetos e criaturas dentro do alcance da magia que sejam capazes de usar magia. Role 1{tooltip:dice}20 para determinar quantas coisas mágicas são reveladas. O Mestre determina quais delas são reveladas.",

    spell_telepathy: "Telepatia",
    spell_telepathy_description:
      "Estabeleça uma comunicação mental com uma criatura dentro do alcance. A magia não possui efeito automatizado no jogo. O Mestre determina como a comunicação funciona. Role 1{tooltip:dice}20 para determinar como a comunicação acontece.",

    spell_pink: "Sentinela Mágica",
    spell_pink_description:
      "Crie uma sentinela mágica ao redor de uma área. Revele todos os inimigos que se movem dentro de seu alcance mesmo dentro da névoa de guerra ou que estejam escondidos.Inimigos podem destruir-la o que resulta nela limpando a névoa de guerra dentro de sua área e revelando os que estavam escondidos ou podem tentar desativar-la rodando o dado ",
    spell_contact_spirits: "Contatar Espíritos",
    spell_contact_spirits_description:
      "Invoque um espírito para responder a uma pergunta. A magia não possui efeito automatizado no jogo. Pergunte ao Mestre como o espírito responde com base em uma rolagem de 1{tooltip:dice}20.",

    spell_charm_person: "Encantar Pessoa",
    spell_charm_person_description:
      "Encante uma pessoa que você tocar, fazendo com que ela considere você um amigo. A magia não funciona em animais ou monstros. O efeito termina se o alvo sofrer dano ou se o Mestre determinar que você provou ser um inimigo.",

    spell_entangle: "Enredar",
    spell_entangle_description:
      "Crie um campo de vinhas que se alimentam de magia, enredando as criaturas que forem pegas nele. As criaturas afetadas pelas vinhas ficam {condition:silenced} e {condition:slowed}.",

    spell_moonbeam: "Raio Lunar",
    spell_moonbeam_description:
      "Crie um campo de luar que causa dano a todas as criaturas dentro dele e as faz cair em um sono profundo.Pessoas dentro da habilidade sofrem {condition:sleeping}",

    spell_goodberry: "Boa Fruta",
    spell_goodberry_description:
      "Crie frutas mágicas imbuídas de energia restauradora. Uma criatura pode consumir uma fruta para recuperar uma pequena quantidade de HP.",

    spell_speak_with_animals: "Falar com Animais",
    spell_speak_with_animals_description:
      "Obtenha a capacidade de se comunicar com feras. O Mestre determina o que a fera compreende, o que ela pode comunicar e como ela responde.",

    spell_fog_cloud: "Nuvem de Névoa",
    spell_fog_cloud_description:
      "Crie uma densa nuvem de névoa que obscurece a visão dentro da área, tornando impossível enxergar através da névoa.",

    spell_longstrider: "Passos Longos",
    spell_longstrider_description:
      "Aumente o deslocamento de uma criatura em 7m.",

    spell_wild_shape: "Forma Selvagem",
    spell_wild_shape_description:
      "Transforme-se em uma fera, assumindo seus atributos físicos, habilidades e ataques.",

    spell_smoke_bomb: "Bomba de Fumaça",
    spell_smoke_bomb_description:
      "Jogue uma bomba de fumaça que cria uma densa nuvem de fumaça, obscurecendo a visão dentro da área.",

    spell_dissonant_whispers: "Sussurros Dissonantes",
    spell_dissonant_whispers_description:
      "Sussurre palavras perturbadoras na mente de uma criatura, causando dano mágico e deixando-a amedrontada.",

    spell_vicious_mockery: "Escárnio Vicioso",
    spell_vicious_mockery_description:
      "Lance uma sequência de insultos que causa dano mágico e atrapalha o próximo ataque do alvo.",

    spell_healing_word: "Palavra Curativa",
    spell_healing_word_description:
      "Pronuncie uma palavra de cura para restaurar a vitalidade do alvo.",

    spell_hunters_mark: "Marca do Caçador",
    spell_hunters_mark_description:
      "Marque uma criatura como sua presa. Seus ataques contra o alvo marcado causam dano adicional.",

    spell_piercing_shot: "Disparo Perfurante",
    spell_piercing_shot_description:
      "Seu próximo ataque perfura a armadura, ignorando 5 pontos da armadura do alvo.",

    spell_second_wind: "Segundo Fôlego",
    spell_second_wind_description:
      "Recupere 1d10 + seu nível de Guerreiro em pontos de vida.",

    spell_action_surge: "Surto de Ação",
    spell_action_surge_description: "Ganhe uma ação adicional neste turno.",

    spell_rage: "Fúria",
    spell_rage_description:
      "Entre em uma fúria, causando dano adicional com seus ataques.",

    spell_reckless_attack: "Ataque Imprudente",
    spell_reckless_attack_description:
      "Seu próximo ataque é feito com vantagem.",

    spell_acid_arrow: "Flecha Ácida",
    spell_acid_arrow_description:
      "Dispare uma flecha corrosiva contra um alvo, causando dano ácido. O impacto deixa uma poça de ácido no chão que causa dano às criaturas que entrarem nela ou começarem seu turno dentro dela.",

    spell_arcane_lock: "Tranca Arcana",
    spell_arcane_lock_description:
      "Tranque magicamente uma porta, baú ou outro objeto que possa ser trancado. Aumenta em 10 a CD da fechadura para dificultar que ela seja aberta até que a magia seja removida.",

    spell_blur: "Desfoque",
    spell_blur_description:
      "Desfoque sua forma, fazendo com que ataques contra você tenham desvantagem. Requer concentração.",

    spell_fog_vision: "Fog Vision",
    spell_fog_vision_description:
      "Conceda a si mesmo a capacidade de enxergar através de neblina e outras obstruções visuais comuns.",

    spell_enlarge: "Gigantizar",
    spell_enlarge_description:
      "Aumenta a Força do alvo em 2 enquanto mantém a concentração.",

    spell_reduce: "Reduzir",
    spell_reduce_description:
      "Reduz a Força do alvo em 2 enquanto mantém a concentração.",

    spell_lesser_restoration: "Restauração Menor",
    spell_lesser_restoration_description:
      "Restauração Menor remove veneno, ácido e queimadura do alvo.",

    spell_flaming_sphere: "Esfera Flamejante",
    spell_flaming_sphere_description:
      "Cria uma esfera flamejante que causa dano às criaturas próximas.",

    spell_misty_step: "Passo Nebuloso",
    spell_misty_step_description:
      "Teleporta-se para um espaço desocupado que possa ver a até 9 metros de distância.",

    spell_scorching_ray: "Raio Ardente",
    spell_scorching_ray_description:
      "Dispare três raios ardentes contra seus inimigos, cada um causando dano de fogo.",

    spell_shatter: "Estilhaçar",
    spell_shatter_description:
      "Cria uma explosão de energia trovejante que causa dano às criaturas na área.",

    spell_revenge: "Vingança",
    spell_revenge_description:
      "Causa dano físico igual a 1d1 mais o dano total recebido pelo conjurador durante os 3 turnos anteriores.",

    spell_back_to_the_battle: "Volte a Batalha",
    spell_back_to_the_battle_description:
      "Recupere 1d10 de vida mais 50% da cura recebida durante os 3 turnos anteriores.",

    spell_consumer_pt: "Consumidor",
    spell_consumer_description_pt:
      "Consome as condições de dano contínuo do alvo, causando dano igual ao dano total acumulado por elas antes de removê-las.",

    spell_hold_person: "Prender Pessoa",
    spell_hold_person_description:
      "Paralisa um alvo humanoide, impedindo-o de agir por 3 rodadas. Requer concentração.",

    spell_invisibility: "Invisibilidade",
    spell_invisibility_description:
      "Torna o alvo invisível, fazendo com que ataques contra ele tenham desvantagem por 3 rodadas. Requer concentração.",

    spell_agility: "Agilidade",
    spell_agility_description:
      "Permite que o alvo atravesse terrenos difíceis e realize ações de movimento, como pular e escalar, sem penalidades por 3 rodadas. Requer concentração.",

    spell_web: "Teia",
    spell_web_description:
      "Cria uma área coberta por teias pegajosas que imobiliza criaturas que entram ou se movem por ela. Requer concentração.",

    spell_spiritual_weapon: "Arma Espiritual",
    spell_spiritual_weapon_description:
      "Invoca uma arma espiritual que luta ao lado do conjurador por várias rodadas.",

    spell_aid: "Auxílio",
    spell_aid_description:
      "Fortalece até três aliados, aumentando seus pontos de vida máximos em 5 por 3 rodadas.",

    spell_silence: "Silêncio",
    spell_silence_description:
      "Crie uma área de silêncio mágico que impede as criaturas dentro dela de conjurar feitiços.",

    spell_prayer_of_healing: "Oração de Cura",
    spell_prayer_of_healing_description:
      "Cure todos os aliados dentro da área em 2d8 pontos de vida.",

    spell_blindness: "Cegueira",
    spell_blindness_description:
      "Cegue uma criatura, reduzindo severamente sua capacidade de atacar e se defender.",

    spell_warding_bond: "Vínculo de Proteção",
    spell_warding_bond_description:
      "Proteja um aliado, fazendo com que você sofra 50% do dano que ele receber.",

    spell_spike_growth: "Crescimento de Espinhos",
    spell_spike_growth_description:
      "Cubra uma área com vegetação repleta de espinhos afiados. Inimigos que entrarem ou se moverem pela área sofrem dano, ficam lentos e começam a sangrar.",

    spell_barkskin: "Pele de Árvore",
    spell_barkskin_description:
      "Proteja a si mesmo ou um aliado com uma casca resistente, aumentando a Armadura e Resistência Mágica  em 3 por 4 turnos.",

    spell_plant_growth: "Plant Growth",
    spell_plant_growth_description:
      "Faça uma vegetação densa crescer rapidamente por uma área, dificultando o movimento através dela.",

    spell_pass_without_trace: "Passar sem Rastros",
    spell_pass_without_trace_description:
      "Envolva a si mesmo e aliados próximos com um véu da natureza que facilita o movimento e a ocultação.",

    spell_summon_beast: "Invocar Fera",
    spell_summon_beast_description:
      "Invoque uma fera selvagem para lutar ao seu lado.",

    spell_natures_dread: "Pavor da Natureza",
    spell_natures_dread_description:
      "Desencadeie a fúria da natureza contra um inimigo, causando dano mágico e amaldiçoando-o por 3 turnos.",

    spell_harrowing_wounds: "Feridas Devastadoras",
    spell_harrowing_wounds_description:
      "Inflija uma ferida mágica devastadora em um inimigo, causando dano mágico e reduzindo a cura recebida em 50% por 3 turnos.",

    spell_cloud_of_daggers: "Nuvem de Adagas",
    spell_cloud_of_daggers_description:
      "Preencha uma área com lâminas mágicas giratórias que dilaceram os inimigos que entrarem ou permanecerem nela.",

    spell_crown_of_madness: "Coroa da Loucura",
    spell_crown_of_madness_description:
      "Leve um inimigo à loucura, fazendo com que ele ataque seus próprios aliados por 3 turnos.",
  },
};
