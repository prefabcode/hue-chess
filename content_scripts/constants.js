
export const materialValues = {
  'Q': 9,
  'R': 5,
  'B': 3,
  'N': 3,
  'P': 1
};

export const PREPARATION_TIME = 300;

export const TIPS = [
  "You can earn a bonus [1-2] hue points per win if you have 'Show Player Ratings' turned off in the lichess settings. This can be configured under Lichess preferences, display settings section.",
  "In the medieval era, it was not uncommon for kings to actively participate in battles and lead their armies into war.",
  "Some perks may not function with Lichess variants due to incompatibilities. The following perks are affected: Opportunist, Equalizer, Endgame Specialist. These perks will work in the Chess960 variant, as it is similar to standard chess.",
  "Wins in slower time controls award more hue points than wins in shorter time controls.",
  "You can only earn hue points if you are signed in to Lichess.",
  "You can look at other tabs while the preparation timer is counting down. Just make sure that it's chess related material so that you're getting the most out of the perk!",
  "Got feedback? Want to tell everyone about your favorite perk setup? Join the Hue Chess League team: <a href='https://lichess.org/team/hue-chess-league' target='_blank'>Join Team</a>",
];

export const PERK_DISPLAY_NAMES = {
  'berzerker': 'Berzerker',
  'preparation': 'Preparation',
  'gambiteer': 'Gambiteer',
  'endgame-specialist': 'Endgame Specialist',
  'gladiator': 'Gladiator',
  'equalizer': 'Equalizer',
  'rivalry': 'Rivalry',
  'opportunist': 'Opportunist',
  'versatility': 'Versatility',
  'knight-moves': 'Knight Moves',
  'aggression': 'Aggression',
  'kings-gambit': 'King\'s Gambit'
};

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

export const CURRENT_VERSION = '0.9.60';

export const GLADIATOR_PENALTY = 35;