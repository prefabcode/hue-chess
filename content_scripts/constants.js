
export const materialValues = {
  'Q': 9,
  'R': 5,
  'B': 3,
  'N': 3,
  'P': 1
};

export const PREPARATION_TIME = 300;

export const TIPS = [
  "You can earn a bonus [1-2] XP points per win if you have 'Show Player Ratings' turned off in the lichess settings. This can be configured under Lichess preferences, display settings section.",
  "Some perks may not function with Lichess variants due to incompatibilities. The following perks are affected: Opportunist, Equalizer, Endgame Specialist. These perks will work in the Chess960 variant, as it is similar to standard chess.",
  "Wins in slower time controls award more XP points than wins in shorter time controls.",
  "You can only earn XP points if you are signed in to Lichess.",
  "Beating all 15 levels of Perk Chess unlocks Specializations and Prestige mode."
];

export const BOARD_LEVEL_MAP = {
  0: 'imgs/boards/level-1.png',
  1: 'imgs/boards/level-2.jpg',
  2: 'imgs/boards/level-3.jpg',
  3: 'imgs/boards/level-4.jpg',
  4: 'imgs/boards/level-5.jpg',
  5: 'imgs/boards/level-6.jpg',
  6: 'imgs/boards/level-7.jpg',
  7: 'imgs/boards/level-8.jpg',
  8: 'imgs/boards/level-9.jpg',
  9: 'imgs/boards/level-10.png', 
  10: 'imgs/boards/level-11.jpg',
  11: 'imgs/boards/level-12.jpg',
  12: 'imgs/boards/level-13.jpg',
  13: 'imgs/boards/level-14.jpg',
  14: 'imgs/boards/level-15.png',
};


export const browser = typeof chrome !== "undefined" ? chrome : browser;

export const MAX_PERKS = 2;

export const LEVEL_CAP = 15;

export const CURRENT_VERSION = '2.0.4';

export const GLADIATOR_PENALTY = 35;