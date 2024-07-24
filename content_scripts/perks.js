import * as pgnParser from '@mliebelt/pgn-parser';
import { Chess } from 'chess.js'
import { getActivePerks, getPlayingId, getWinningStreak } from "./storageManagement.js";
import { materialValues } from "./constants.js";

const isBerzerkerFulfilled = (userName, game) => {
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
      return;
  }

  console.log(`Player ${userName} is playing as ${playerColor}.`);

  // Extract time control information
  const timeControl = game.tags['TimeControl'] || '';
  const { seconds: initialTime, increment } = timeControl[0];

  if (!initialTime) {
      console.error('Time control not found or invalid.');
      return;
  }

  console.log(`Initial Time: ${initialTime} seconds, Increment: ${increment || 0} seconds`);

  // Check the last two moves made in the game
  const moves = game.moves;
  let lastMove = null;

  if (moves.length > 0) {
      const lastMoveIndex = moves.length - 1;
      const secondLastMoveIndex = moves.length - 2;

      const lastMoveData = moves[lastMoveIndex];
      const secondLastMoveData = moves[secondLastMoveIndex];

      if (lastMoveData.turn === playerColor.charAt(0)) {
          lastMove = lastMoveData;
      } else if (secondLastMoveData.turn === playerColor.charAt(0)) {
          lastMove = secondLastMoveData;
      }
  }

  if (!lastMove || !lastMove.commentDiag || !lastMove.commentDiag.clk) {
      console.error('No valid last move with time information for the player.');
      return;
  }

  console.log('last move:', lastMove);

  const timeMatch = lastMove.commentDiag.clk;
  const [hours, minutes, seconds] = timeMatch.split(':').map(Number);
  const remainingTimeInSeconds = hours * 3600 + minutes * 60 + seconds;

  console.log(`Last Move Remaining Time for ${playerColor}: ${remainingTimeInSeconds} seconds`);

  const totalTimeAllowed = initialTime;

  if (remainingTimeInSeconds >= totalTimeAllowed / 2) {
    const bonus = Math.floor(Math.random() * (8 - 6 + 1)) + 6;
    console.log(`Berzerker bonus applied: ${bonus}`);
    return bonus;
  } 
  return 0;
}

const isGladiatorFulfilled = (initialIncrementValue, gameType) => {
  let bonus = 0;
  switch (gameType) {
    case 'Bullet':
      bonus = (5 - initialIncrementValue) + Math.floor(Math.random() * 3); // Ensure total is 5-7
      break;
    case 'Blitz':
      bonus = (8 - initialIncrementValue) + Math.floor(Math.random() * 3); // Ensure total is 8-10
      break;
    case 'Rapid':
      bonus = (11 - initialIncrementValue) + Math.floor(Math.random() * 4); // Ensure total is 11-14
      break;
    case 'Classical':
      bonus = (15 - initialIncrementValue) + Math.floor(Math.random() * 4); // Ensure total is 15-18
      break;
    case 'Unknown':
      bonus = (8 - initialIncrementValue) + Math.floor(Math.random() * 3); // Ensure total is 8-10, for variants
      break;
  }
  return bonus;
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

const isEndgameSpecialistFulfilled = (game) => {
  const moves = game.moves;
  if (containsEndgame(moves)) {
   const bonus = Math.floor(Math.random() * (4 - 3 + 1)) + 3;
   console.log(`Endgame bonus points: ${bonus}`);
   return bonus;
  }
  return 0;
};

const isHueMasterFulfilled = () => {
  const hasNoRatingClass = document.body.classList.contains('no-rating');
  if (hasNoRatingClass) console.log('body has no-rating class, adding 1 hue point to bonus');
  return hasNoRatingClass ? 1 : 0;
}

const isHotStreakFulfilled = async () => {
  const winningStreak = await getWinningStreak();

  let bonus = 0;

  if (winningStreak === 1) {
      bonus = Math.floor(Math.random() * (3 - 2 + 1)) + 2;
  } else if (winningStreak === 2) {
      bonus = Math.floor(Math.random() * (5 - 4 + 1)) + 4;
  } else if (winningStreak >= 3) {
      bonus = Math.floor(Math.random() * (7 - 6 + 1)) + 6;
  }

  console.log(`Hot Streak bonus points: ${bonus}`);
  return bonus;
}

const calculateMaterialFromFEN = (fen) => {
  const pieceCount = { white: 0, black: 0 };
  const pieces = fen.split(' ')[0].split('');
  
  pieces.forEach(piece => {
      if (/[rnbq]/.test(piece)) {
          pieceCount.black += materialValues[piece.toUpperCase()];
      } else if (/[RNBQ]/.test(piece)) {
          pieceCount.white += materialValues[piece];
      }
  });

  return pieceCount;
};

const containsEndgame = (moves) => {
  const chess = new Chess();
  
  console.log("Checking endgame condition for moves:");
  return moves.some((move, index) => {
      chess.move(move.notation.notation);
      const fen = chess.fen();
      const material = calculateMaterialFromFEN(fen);
      if (material.white <= 13 && material.black <= 13) {
          console.log("Endgame condition met.");
          return true;
      }
  });
};

export const calculatePerkBonuses = async (initialIncrementValue, gameType, game) => {
  let bonus = 0;
  // code that retrieves username.
  const userTag = document.getElementById('user_tag');
  if (!userTag) {
    console.log("User tag not found");
    return 0;
  }

  const userName = userTag.innerText.trim();
  const activePerks = await getActivePerks(); // Function to get active perks from storage

  if (activePerks.includes('berzerker')) {
    bonus += isBerzerkerFulfilled(userName, game);
  }
  if (activePerks.includes('gladiator')) {
    bonus += isGladiatorFulfilled(initialIncrementValue, gameType);
  }
  if (activePerks.includes('bongcloud')) {
    bonus += isBongcloudFulfilled(userName, game);
  }
  if (activePerks.includes('gambiteer')) {
    bonus += isGambiteerFulfilled(game);
  }
  if (activePerks.includes('hue-master')) {
    bonus += isHueMasterFulfilled();
  }
  if (activePerks.includes('endgame-specialist')) {
    bonus += isEndgameSpecialistFulfilled(game);
  }
  if (activePerks.includes('hot-streak')) {
    bonus += await isHotStreakFulfilled();
  }
  
  return bonus;
};
