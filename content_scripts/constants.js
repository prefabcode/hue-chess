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

export const timeControlIncrements = {
    'Bullet': [1, 3],
    'Blitz': [3, 6],
    'Rapid': [6, 10],
    'Classical': [10, 15]
};

export const MAX_PERKS = 2;

export const gameIdPattern = /^https:\/\/lichess\.org\/([a-zA-Z0-9]{9,})/; 
export const postGamePattern = /^https:\/\/lichess\.org\/([a-zA-Z0-9]{8})(\/(white|black)(#\d+)?)?/; 
export const analysisPattern = /^https:\/\/lichess\.org\/analysis/;