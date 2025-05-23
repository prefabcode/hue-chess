export const PERK_MARKUP_TEMPLATE = "<div class='perk-box' id='{internalName}-perk' data-tippy-content='' data-tippy-content-original='{description}' data-unlock-level='{unlockLevel}'><img src='' id='{internalName}-icon'><span>{displayName}</span></div>"

export const PERK_METADATA = [
  {
    id: 1,
    internalName: 'opportunist',
    displayName: 'Opportunist',
    description: 'Earn an additional [3-4] hue points for winning a game after being up in material for more than one move.'
  },
  {
    id: 2,
    internalName: 'endgame-specialist',
    displayName: 'Endgame Specialist',
    description: 'Earn an additional [4-5] hue points for winning a game that reaches the endgame phase. For the purpose of this perk, the endgame begins when both sides have 13 points of material each, not counting pawns.'
  },
  {
    id: 3,
    internalName: 'knight-moves',
    displayName: 'Knight Moves',
    description: 'Earn an additional [2-4] hue points for winning a game in which your first move is a Knight move.'
  },
  {
    id: 4,
    internalName: 'preparation',
    displayName: 'Preparation',
    description: 'Earn an additional [8-11] hue points for spending 5 minutes in post-game analysis or the analysis board.'
  },
  {
    id: 5,
    internalName: 'kings-gambit',
    displayName: 'King\'s Gambit',
    description: 'Earn an additional [5-7] hue points for winning a game in which you have not castled your king.'
  },
  {
    id: 6,
    internalName: 'rivalry',
    displayName: 'Rivalry',
    description: 'Earn an additional [4-6] hue points for beating an opponent you faced more than once.'
  },
  {
    id: 7,
    internalName: 'equalizer',
    displayName: 'Equalizer',
    description: 'Earn an additional [4-6] hue points for winning a game after being down in material for more than one move.'
  },
  {
    id: 8,
    internalName: 'aggression',
    displayName: 'Aggression',
    description: 'Earn an additional [8-11] hue points for winning a game in 20 moves or fewer, [5-7] for winning in 30 moves, or [3-4] for winning in 40 moves. No points are awarded for games longer than 40 moves.'
  },
  {
    id: 9,
    internalName: 'gambiteer',
    displayName: 'Gambiteer',
    description: 'Earn an additional [2-4] hue points for winning a game after playing a known gambit, countergambit, or by queenside castling at any time in the game.'
  },
  {
    id: 10,
    internalName: 'gladiator',
    displayName: 'Gladiator',
    description: 'Enter the gladiator arena to earn significant hue points for every win. However, you are only allowed to lose one game at your current level. If you lose more than one game, you will lose 35 hue points. Each victory increases the number of games you can lose within that level by 1. Once you select this perk, it remains active until you level up or incur the hue point penalty.'
  },
  {
    id: 11,
    internalName: 'berzerker',
    displayName: 'Berzerker',
    description: 'Earn an additional [8-10] hue points for winning while using half your allotted time or less.'
  },
  {
    id: 12,
    internalName: 'versatility',
    displayName: 'Versatility',
    description: 'Earn additional hue points for winning with different named openings. Earn [1-2] hue points for the first two unique openings, [2-3] for the next two, and [4-5] for any additional unique openings played in the current level. Unique openings played will reset upon leveling up. '
  },
]

export const PERK_UNLOCK_ORDERS = [
  // Prestige 0
  [
    { id: 1, level: 1, },
    { id: 2, level: 2, },
    { id: 3, level: 3, },
    { id: 4, level: 4, },
    { id: 5, level: 5 },
    { id: 6, level: 6 },
    { id: 7, level: 7 },
    { id: 8, level: 7 },
    { id: 9, level: 8 },
    { id: 10, level: 9 },
    { id: 11, level: 11 },
    { id: 12, level: 13 }
  ],
  // Prestige 1
  [
    { id: 4, level: 1 }, // preparation
    { id: 8, level: 2 }, // aggression
    { id: 7, level: 3 }, // equalizer
    { id: 11, level: 4 }, // berzerker
    { id: 9, level: 5 }, // gambiteer 
    { id: 10, level: 6 }, // gladiator
    { id: 5, level: 7 }, // king's gambit
    { id: 2, level: 8, }, // endgame specialist
    { id: 12, level: 9 }, // versatility
    { id: 6, level: 10 }, // rivalry 
    { id: 3, level: 11, }, // knight moves
    { id: 1, level: 13, }, // opportunist
  ],
  // Prestige 2
  [
    { id: 4, level: 1 }, // preparation
    { id: 12, level: 2 }, // versatility
    { id: 1, level: 3, }, // opportunist
    { id: 7, level: 4 }, // equalizer
    { id: 9, level: 5 }, // gambiteer
    { id: 6, level: 5 }, // rivalry 
    { id: 3, level: 6, }, // knight moves
    { id: 5, level: 7 }, // king's gambit
    { id: 2, level: 8, }, // endgame specialist
    { id: 8, level: 9 }, // aggression
    { id: 10, level: 11 }, // gladiator 
    { id: 11, level: 13 }, // berzerker
  ],
  // Prestige 3
  [
    { id: 4, level: 1 }, // preparation
    { id: 10, level: 2 }, // gladiator
    { id: 7, level: 3 }, // equalizer
    { id: 2, level: 4, }, // endgame specialist
    { id: 6, level: 5 }, // rivalry
    { id: 11, level: 6 }, // berzerker 
    { id: 9, level: 7 }, // gambiteer
    { id: 5, level: 8 }, // king's gambit
    { id: 8, level: 9 }, // aggression
    { id: 1, level: 10, }, // opportunist
    { id: 3, level: 11, }, // knight moves
    { id: 12, level: 13 }, // versatility
  ],
  // Prestige 4
  [
    { id: 4, level: 1 }, // preparation
    { id: 11, level: 2 }, // berzerker 
    { id: 8, level: 3 }, // aggression
    { id: 10, level: 4 }, // gladiator
    { id: 5, level: 5 }, // king's gambit
    { id: 6, level: 6 }, // rivalry
    { id: 1, level: 7, }, // opportunist
    { id: 12, level: 8 }, // versatility
    { id: 9, level: 9 }, // gambiteer
    { id: 7, level: 10 }, // equalizer
    { id: 2, level: 11, }, // endgame specialist
    { id: 3, level: 13, }, // knight moves
  ],

]



