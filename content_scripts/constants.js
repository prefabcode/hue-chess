export const levelNames = [
  "Brown", "Wood", "Wood2", "Wood3", "Wood4", "Maple", "Maple2", "Horsey", "Leather", "Blue",
  "Blue2", "Blue3", "Canvas", "Blue-Marble", "IC", "Green", "Marble", "Green-Plastic", "Olive", "Grey",
  "Metal", "Newspaper", "Purple", "Purple-Diag", "Pink"
];

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
  "If your Lichess board settings are out of sync with your Hue Chess profile, simply re-synchronize them through the Hue Chess settings. You can access these settings by clicking the extension icon in your browser.",
  "Got feedback? Want to tell everyone about your favorite perk setup? Join the Hue Chess Discord community: <a href='https://discord.gg/Q5zKzcJA2b' target='_blank'>Join Discord</a>",
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
};

export const browser = typeof chrome !== "undefined" ? chrome : browser;

export const MAX_PERKS = 2;

export const LEVEL_CAP = 15;