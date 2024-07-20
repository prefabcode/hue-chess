import { getActivePerks, getPlayingId } from "./storageManagement.js";
import * as pgnParser from '@mliebelt/pgn-parser';

const isBerzerkerFulfilled = () => {
  // will return either bonusValue or 0.
  return 0;
}

const isGladiatorFulfilled = () => {
  return 0;
}

const isBongcloudFulfilled = (userName, game) => {
  // Determine the player's color
  const whitePlayer = game.tags.White;
  const blackPlayer = game.tags.Black;

  let playerColor = null;

  if (whitePlayer === userName) {
    playerColor = 'white';
  } else if (blackPlayer === userName) {
    playerColor = 'black';
  }

  if (!playerColor) {
    console.error('Player not found in this game.');
    return 0;
  }

  // Check if player played king move on move 2.
  const moves = game.moves;

  let secondMove = null;

  if (playerColor === 'white' && moves.length > 2) {
    secondMove = moves[2].notation.notation;
  } else if (playerColor === 'black' && moves.length > 3) {
    secondMove = moves[3].notation.notation;
  }

  console.log(`Second Move for ${playerColor}: ${secondMove}`);

  if (secondMove.startsWith('K')) {
    console.log('King move detected on move 2. Bongcloud bonus applied');
    const bonus = Math.floor(Math.random() * (5 - 3 + 1)) + 3;
    console.log(`Bongcloud bonus points: ${bonus}`);
    return bonus;
  } else {
    console.log('Player did not play a King move on move 2.');
  }

  return 0;
};

const isGambiteerFulfilled = (game) => {
  const opening = game.tags.Opening || '';
  if (opening.toLowerCase().includes('gambit')) {
    console.log('Gambit detected. Gambiteer bonus applied');
    const bonus = Math.floor(Math.random() * (3 - 2 + 1)) + 2; // Random number between 2 and 3
    console.log(`Gambiteer bonus points: ${bonus}`);
    return bonus;
  } else {
    console.log('Player did not play a known gambit or countergambit.');
  }
  return 0;
};

const isAnalysisFulfilled = () => {
  return 0;
}

const isSpeedrunFulfilled = () => {
  return 0;
}

const isRevengeFulfilled = () => {
  return 0;
}

const isHueMasterFulfilled = () => {
  const hasNoRatingClass = document.body.classList.contains('no-rating');
  if (hasNoRatingClass) console.log('body has no-rating class, adding 1 hue point to bonus');
  return hasNoRatingClass ? 1 : 0;
}

export const calculatePerkBonuses = async () => {
  let bonus = 0;
  // code that retrieves username.
  const userTag = document.getElementById('user_tag');
  if (!userTag) {
    console.log("User tag not found");
    return 0;
  }

  const userName = userTag.innerText.trim();
  const activePerks = await getActivePerks(); // Function to get active perks from storage

  const playingId = await getPlayingId();
  if (!playingId) {
    return bonus;
  }

  const apiUrl = `https://lichess.org/game/export/${playingId}?pgnInJson=true`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.text();
    const parsedGames = pgnParser.parse(data);
    const game = parsedGames[0];

    if (activePerks.includes('berzerker')) {
      bonus += isBerzerkerFulfilled();
    }
    if (activePerks.includes('gladiator')) {
      bonus += isGladiatorFulfilled();
    }
    if (activePerks.includes('speedrun')) {
      bonus += isSpeedrunFulfilled();
    }
    if (activePerks.includes('bongcloud')) {
      bonus += isBongcloudFulfilled(userName, game);
    }
    if (activePerks.includes('gambiteer')) {
      bonus += isGambiteerFulfilled(game);
    }
    if (activePerks.includes('analysis')) {
      bonus += isAnalysisFulfilled();
    }
    if (activePerks.includes('revenge')) {
      bonus += isRevengeFulfilled();
    }
    if (activePerks.includes('hue-master')) {
      bonus += isHueMasterFulfilled();
    }
  } catch (error) {
    console.error("Error fetching game data from Lichess API:", error);
  }

  return bonus;
};
