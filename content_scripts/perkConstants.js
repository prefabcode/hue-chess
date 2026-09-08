export const PERK_MARKUP_TEMPLATE = "<div class='perk-box' id='{internalName}-perk' data-tippy-content='' data-tippy-content-original='{description}' data-unlock-level='{unlockLevel}'><img src='' id='{internalName}-icon'><span>{displayName}</span></div>"

export const PERK_METADATA = [
  {
    id: 1,
    internalName: 'opportunist',
    displayName: 'Opportunist',
    description: 'Earn an additional [3-4] XP points for winning a game after being up in material for more than one move.'
  },
  {
    id: 2,
    internalName: 'endgame-specialist',
    displayName: 'Endgame Specialist',
    description: 'Earn an additional [4-5] XP points for winning a game that reaches the endgame phase. For the purpose of this perk, the endgame begins when both sides have 13 points of material each, not counting pawns.'
  },
  {
    id: 3,
    internalName: 'hypermodern',
    displayName: 'Hypermodern',
    description: 'Earn an additional [3-5] XP points for winning a game in which you do not move a pawn to one of the four central squares (e4, e5, d4, d5) within your first four moves.'
  },
  {
    id: 4,
    internalName: 'preparation',
    displayName: 'Preparation',
    description: 'Earn an additional [8-11] XP points for spending 5 minutes in post-game analysis or the analysis board.'
  },
  {
    id: 5,
    internalName: 'kings-gambit',
    displayName: 'King\'s Gambit',
    description: 'Earn an additional [5-7] XP points for winning a game in which you have not castled your king.'
  },
  {
    id: 6,
    internalName: 'rivalry',
    displayName: 'Rivalry',
    description: 'Earn an additional [4-6] XP points for beating an opponent you faced more than once.'
  },
  {
    id: 7,
    internalName: 'equalizer',
    displayName: 'Equalizer',
    description: 'Earn an additional [4-6] XP points for winning a game after being down in material for more than one move.'
  },
  {
    id: 8,
    internalName: 'aggression',
    displayName: 'Aggression',
    description: 'Earn an additional [8-11] XP points for winning a game in 20 moves or fewer, [5-7] for winning in 30 moves, or [3-4] for winning in 40 moves. No points are awarded for games longer than 40 moves.'
  },
  {
    id: 9,
    internalName: 'gambiteer',
    displayName: 'Gambiteer',
    description: 'Earn an additional [3-5] XP points for winning a game after playing a known gambit, countergambit, or by queenside castling at any time in the game.'
  },
  {
    id: 10,
    internalName: 'gladiator',
    displayName: 'Gladiator',
    description: 'Enter the gladiator arena to earn significant XP points for every win. However, you are only allowed to lose one game at your current level. If you lose more than one game, you will lose 35% accumulated XP in your current level. Each victory increases the number of games you can lose within that level by 1. Once you select this perk, it remains active until you level up or incur the XP penalty.'
  },
  {
    id: 11,
    internalName: 'berserker',
    displayName: 'Berserker',
    description: 'Earn an additional [8-10] XP points for winning while using half your allotted time or less.'
  },
  {
    id: 12,
    internalName: 'versatility',
    displayName: 'Versatility',
    description: 'Earn additional XP points for winning with different named openings. Earn [1-2] XP points for the first two unique openings, [2-3] for the next two, and [4-5] for any additional unique openings played in the current level. Unique openings played will reset upon leveling up. '
  },
]

export const RANDOMIZER_INDEX = 6;

export const RANDOMIZER_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13];

export const SPECIALIZATION_NAMES = [
  'Strategist',
  'Gladiator',
  'Gambiteer',
  'Chaos Agent',
  'Berserker',
  'Experimentalist',
  'Randomizer',
];

export const PERK_GRADIENTS = {
  'berserker': 'linear-gradient(to right, #8b0000, #ff0000)',
  'bongcloud': 'linear-gradient(to right, #a18cd1, #fbc2eb)',
  'hue-focus': 'linear-gradient(to right, #43cea2, #185a9d)',
  'gambiteer': 'linear-gradient(to right, #4a148c, #880e4f)',
  'endgame-specialist': 'linear-gradient(to right, #00c6ff, #0072ff)',
  'hot-streak': 'linear-gradient(to right, #f12711, #f5af19)',
  'gladiator': 'linear-gradient(to right, #434343, #000000)',
  'equalizer': 'linear-gradient(to right, #1b5e20, #4a9e4d)',
  'rivalry': 'linear-gradient(to right, #7f1d1d, #c0392b)',
  'total-earned': 'linear-gradient(to right, #0f2027, #2c5364)',
  'preparation': 'linear-gradient(to right, #093a5e, #0077b6)',
  'opportunist': 'linear-gradient(to right, #daa520, #b8860b)',
  'versatility': 'linear-gradient(to right, #8e44ad, #f39c12)',
  'hypermodern': 'linear-gradient(to right, #18371e, #6b8e23)',
  'aggression': 'linear-gradient(to right, #d50000, #ff6f00)',
  'kings-gambit': 'linear-gradient(to right, #a50034, #88113f)'
};

export const PERK_UNLOCK_ORDERS = [
  // Strategist  
  [
    { id: 1, level: 1, }, // Opportunist
    { id: 2, level: 2, }, // Endgame Specialist
    { id: 4, level: 3, }, // Preparation
    { id: 3, level: 4, }, // hypermodern
    { id: 6, level: 5 }, // Rivalry 
    { id: 5, level: 6 }, // King's Gambit
    { id: 8, level: 7 }, // Aggression
    { id: 7, level: 8 }, // Equalizer
    { id: 9, level: 9 }, // gambiteer
    { id: 10, level: 10 }, // gladiator
    { id: 11, level: 11 }, // berserker
    { id: 12, level: 13 } // versatility
  ],
  // Gladiator
  [
    { id: 10, level: 1 }, // gladiator
    { id: 2, level: 2, }, // endgame specialist
    { id: 6, level: 3 }, // rivalry
    { id: 7, level: 4 }, // equalizer
    { id: 11, level: 5 }, // berserker 
    { id: 9, level: 6 }, // gambiteer
    { id: 4, level: 7 }, // preparation
    { id: 5, level: 8 }, // king's gambit
    { id: 12, level: 9 }, // versatility
    { id: 8, level: 10 }, // aggression
    { id: 1, level: 11, }, // opportunist
    { id: 3, level: 13, }, // hypermodern
  ],
  // Gambiteer
  [
    { id: 9, level: 1 }, // gambiteer 
    { id: 8, level: 2 }, // aggression
    { id: 4, level: 3 }, // preparation
    { id: 7, level: 4 }, // equalizer
    { id: 11, level: 5 }, // berserker
    { id: 5, level: 6 }, // king's gambit
    { id: 3, level: 7 }, // hypermodern
    { id: 12, level: 8 }, // versatility
    { id: 6, level: 9 }, // rivalry 
    { id: 10, level: 10 }, // gladiator
    { id: 1, level: 11 }, // opportunist
    { id: 2, level: 13 }, // endgame specialist
  ],
  // Chaos Agent
  [
    { id: 5, level: 1 }, // king's gambit
    { id: 2, level: 2, }, // endgame specialist
    { id: 11, level: 3 }, // berserker
    { id: 3, level: 4, }, // hypermodern
    { id: 12, level: 5 }, // versatility
    { id: 7, level: 6 }, // equalizer
    { id: 1, level: 7, }, // opportunist
    { id: 4, level: 8 }, // preparation
    { id: 10, level: 9 }, // gladiator 
    { id: 6, level: 10 }, // rivalry 
    { id: 8, level: 11 }, // aggression
    { id: 9, level: 13 }, // gambiteer
  ],
  // Berserker
  [
    { id: 11, level: 1 }, // berserker
    { id: 5, level: 2 }, // king's gambit
    { id: 8, level: 3 }, // aggression
    { id: 10, level: 4 }, // gladiator 
    { id: 1, level: 5, }, // opportunist
    { id: 4, level: 6 }, // preparation
    { id: 9, level: 7 }, // gambiteer
    { id: 12, level: 8 }, // versatility
    { id: 7, level: 9 }, // equalizer
    { id: 6, level: 10 }, // rivalry 
    { id: 2, level: 11, }, // endgame specialist
    { id: 3, level: 13, }, // hypermodern
  ],
  // Experimentalist
  [
    { id: 12, level: 1 }, // versatility
    { id: 1, level: 2, }, // opportunist
    { id: 3, level: 3, }, // hypermodern
    { id: 5, level: 4 }, // king's gambit
    { id: 10, level: 5 }, // gladiator 
    { id: 9, level: 6 }, // gambiteer
    { id: 4, level: 7 }, // preparation
    { id: 2, level: 8, }, // endgame specialist
    { id: 11, level: 9 }, // berserker
    { id: 6, level: 10 }, // rivalry 
    { id: 7, level: 11 }, // equalizer
    { id: 8, level: 13 }, // aggression
  ],

]



