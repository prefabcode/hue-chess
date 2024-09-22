import { Chess } from 'chess.js'
import {
  getActivePerks, 
  getWinningStreak, 
  getHasPlayedBefore, 
  setPreparationStatus, 
  getPreparationStatus, 
  getSecondWindStatus,
  setSecondWindStatus,
  getPlayedOpenings,
  setPlayedOpenings,
} from "./storageManagement.js";
import { materialValues } from "./constants.js";
import Toastify from 'toastify-js';

export function showPerkToast(perkId, message) {
  const gradientMap = {
    'berzerker': 'linear-gradient(to right, #8b0000, #ff0000)',
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
    'second-wind': 'linear-gradient(to right, #007a7e, #009688)',
    'versatility': 'linear-gradient(to right, #8e44ad, #f39c12)',
  };

  const gradient = gradientMap[perkId];
  const imageUrl = perkId !== 'total-earned' ? chrome.runtime.getURL(`imgs/${perkId}.svg`) : '';

  Toastify({
    text: message,
    duration: 6000,
    close: true,
    gravity: "top", // `top` or `bottom`
    position: "right", // `left`, `center` or `right`
    backgroundColor: gradient,
    stopOnFocus: true, // Prevents dismissing of toast on hover
    avatar: imageUrl,
  }).showToast();
}

const calculateRandomBonus = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

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
    const bonus = calculateRandomBonus(8, 10);
    console.log(`Berzerker bonus applied: ${bonus}`);
    const message = `Berzerker: ${bonus} points`;
    showPerkToast('berzerker', message);
    return bonus;
  } 
  return 0;
}
// UltraBullet, Bullet, Blitz, Rapid, Classical, Default
const isGladiatorFulfilled = (gameType) => {
  let bonus = 0;
  switch (gameType) {
    case 'UltraBullet': 
      bonus = calculateRandomBonus(8, 9);
      break;
    case 'Bullet':
      bonus = calculateRandomBonus(7, 8);
      break;
    case 'Blitz':
      bonus = calculateRandomBonus(6, 7);
      break;
    case 'Rapid':
      bonus = calculateRandomBonus(5, 6);
      break;
    default: 
      bonus = calculateRandomBonus(4, 5);
      break;
  }
  const message = `Gladiator: ${bonus} points`;
  showPerkToast('gladiator', message);
  return bonus;
}

const isBongcloudFulfilled = (userName, game) => {
  if (game.tags.Variant !== 'Standard' && game.tags.Variant !== 'Chess960') {
    console.log('Standard or Chess960 not detected. Bongcloud disabled.')
    return 0;
  }
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
    const bonus = calculateRandomBonus(3, 4);
    console.log(`Bongcloud bonus points: ${bonus}`);
    const message = `Bongcloud: ${bonus} points`;
    showPerkToast('bongcloud', message);
    return bonus;
  } else {
    console.log('Player did not play a King move on move 2.');
  }

  return 0;
};

const isGambiteerFulfilled = (userName, game) => {
  const opening = game.tags.Opening || '';
  const moves = game.moves;

  if (opening.toLowerCase().includes('gambit')) {
    const bonus = calculateRandomBonus(3, 5);
    console.log(`Gambiteer bonus points: ${bonus}`);
    const message = `Gambiteer: ${bonus} points`;
    showPerkToast('gambiteer', message);
    return bonus;
  }

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

  for (const move of moves) {
    if (move.notation.notation === 'O-O-O' && move.turn === playerColor.charAt(0)) {
      const bonus = calculateRandomBonus(3, 5);
      console.log(`Gambiteer bonus points: ${bonus}`);
      const message = `Gambiteer: ${bonus} points`;
      showPerkToast('gambiteer', message);
      return bonus;
    }
  }
  
  return 0;
};

const isEndgameSpecialistFulfilled = (game) => {
  if (game.tags.Variant !== 'Standard' && game.tags.Variant !== 'Chess960') {
    console.log('Standard or Chess960 not detected. Endgame Specialist disabled.')
    return 0;
  }
  const moves = game.moves;
  if (containsEndgame(moves)) {
   const bonus = calculateRandomBonus(4, 5);
   console.log(`Endgame bonus points: ${bonus}`);
   const message = `Endgame Specialist: ${bonus} points`;
   showPerkToast('endgame-specialist', message);
   return bonus;
  }
  return 0;
};

const isHueFocusFulfilled = () => {
  const hasNoRatingClass = document.body.classList.contains('no-rating');
  if (hasNoRatingClass) {
    const bonus = calculateRandomBonus(1, 2);
    const message = `Hue Focus: ${bonus} points`;
    showPerkToast('hue-focus', message); 
    console.log(`body has no-rating class, adding ${bonus} hue points to bonus`); 
    return bonus;
  }
  return 0;
}

const isHotStreakFulfilled = async () => {
  const winningStreak = await getWinningStreak();

  let bonus = 0;

  if (winningStreak === 1) {
      bonus = calculateRandomBonus(2, 3);
  } else if (winningStreak === 2) {
      bonus = calculateRandomBonus(4, 5);
  } else if (winningStreak >= 3) {
      bonus = calculateRandomBonus(6, 8);
  }
  const message = `Hot Streak: ${bonus} points`;
  showPerkToast('hot-streak', message);
  console.log(`Hot Streak bonus points: ${bonus}`);
  return bonus;
}

const isEqualizerFulfilled = (userName, game) => {
  if (game.tags.Variant !== 'Standard' && game.tags.Variant !== 'Chess960') {
    console.log('Standard or Chess960 not detected. Equalizer disabled.')
    return 0;
  }
  const chess = new Chess();
  let wasDownInMaterial = false;

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

  for (let i = 0; i < game.moves.length; i++) {
    chess.move(game.moves[i].notation.notation);
    const fen = chess.fen();
    const materialBalance = calculateMaterialBalanceFromFEN(fen, playerColor);

    if (materialBalance < 0) {
      if (wasDownInMaterial) {
        const bonus = calculateRandomBonus(4, 6);
        const message = `Equalizer: ${bonus} points`;
        showPerkToast('equalizer', message);
        return bonus; 
      }
      wasDownInMaterial = true;
    } else {
      wasDownInMaterial = false;
    }
  }

  return 0;
};


const isRivalryFulfilled = async () => {
  const hasPlayedBefore = await getHasPlayedBefore();
  let bonus = calculateRandomBonus(1, 3);
  if (hasPlayedBefore) {
    bonus = calculateRandomBonus(4, 5);
  }
  console.log(`Rivalry bonus: ${bonus}`);
  const message = `Rivalry: ${bonus} points`;
  showPerkToast('rivalry', message);
  return bonus;
};

const isOpportunistFulfilled = (userName, game) => {
  if (game.tags.Variant !== 'Standard' && game.tags.Variant !== 'Chess960') {
    console.log('Standard or Chess960 not detected. Opportunist disabled.')
    return 0;
  }
  
  const chess = new Chess();
  let wasUpInMaterial = false;

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

  for (let i = 0; i < game.moves.length; i++) {
    chess.move(game.moves[i].notation.notation);
    const fen = chess.fen();
    const materialBalance = calculateMaterialBalanceFromFEN(fen, playerColor);

    if (materialBalance > 0) {
      if (wasUpInMaterial) {
        const bonus = calculateRandomBonus(2, 3);
        const message = `Opportunist: ${bonus} points`;
        showPerkToast('opportunist', message);
        return bonus;
      }
      wasUpInMaterial = true;
    } else {
      wasUpInMaterial = false;
    }
  }

  return 0;
};

const isPreparationFulfilled = async () => {
  const preparationStatusMet = await getPreparationStatus();
  let bonus = 0;
  if (preparationStatusMet) {
    bonus = calculateRandomBonus(8, 11);
    const message = `Preparation: ${bonus} points`;
    showPerkToast('preparation', message);
    await setPreparationStatus(false);
  }
  return bonus;
};

const isSecondWindFulfilled = async () => {
  const secondWindStatus = await getSecondWindStatus();
  if (secondWindStatus) {
    await setSecondWindStatus(false);
    const bonus = calculateRandomBonus(1, 2);
    const message = `Second Wind: ${bonus} points`;
    console.log(`Second Wind: adding ${bonus} points`);
    showPerkToast('second-wind', message);
    return bonus;
  }
  return 0;
}

const isVersatilityFulfilled = async (game) => {
  const opening = game.tags.Opening || '';
  let playedOpenings = await getPlayedOpenings();

  if (!playedOpenings.includes(opening)) {
    playedOpenings.push(opening);
    await setPlayedOpenings(playedOpenings);

    let bonus = 0;
    if (playedOpenings.length <= 2) {
      bonus = calculateRandomBonus(1, 2);

    } else if (playedOpenings.length <= 4) {
      bonus = calculateRandomBonus(3, 4);

    } else {
      bonus = calculateRandomBonus(5, 6);
    }

    const message = `Versatility: ${bonus} points`;
    showPerkToast('versatility', message);
    return bonus;
  }

  return 0;
};

const calculateEndgameMaterialFromFEN = (fen) => {
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

const calculateMaterialBalanceFromFEN = (fen, playerColor) => {
  const pieceCount = { white: 0, black: 0 };
  const pieces = fen.split(' ')[0].split('');
  
  pieces.forEach(piece => {
      if (/[rnbqp]/.test(piece)) {
          pieceCount.black += materialValues[piece.toUpperCase()];
      } else if (/[RNBQP]/.test(piece)) {
          pieceCount.white += materialValues[piece];
      }
  });

  return playerColor === 'white' ? pieceCount.white - pieceCount.black : pieceCount.black - pieceCount.white;
};

const containsEndgame = (moves) => {
  const chess = new Chess();
  
  console.log("Checking endgame condition for moves:");
  return moves.some((move, index) => {
      chess.move(move.notation.notation);
      const fen = chess.fen();
      const material = calculateEndgameMaterialFromFEN(fen);
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
    bonus += isGladiatorFulfilled(gameType);
  }
  if (activePerks.includes('gambiteer')) {
    bonus += isGambiteerFulfilled(userName, game);
  }
  if (activePerks.includes('endgame-specialist')) {
    bonus += isEndgameSpecialistFulfilled(game);
  }
  if (activePerks.includes('hot-streak')) {
    bonus += await isHotStreakFulfilled();
  }
  if (activePerks.includes('equalizer')) {
    bonus += isEqualizerFulfilled(userName, game);
  }
  if (activePerks.includes('rivalry')) {
    bonus += await isRivalryFulfilled();
  }
  if (activePerks.includes('preparation')) {
    bonus += await isPreparationFulfilled();
  }
  if (activePerks.includes('opportunist')) {
    bonus += isOpportunistFulfilled(userName, game);
  }
  if (activePerks.includes('versatility')) {
    bonus += await isVersatilityFulfilled(game);
  }
  
  bonus += await isSecondWindFulfilled();
  bonus += isHueFocusFulfilled();
  bonus += isBongcloudFulfilled(userName, game);

  const message = `Total Hue Earned: ${initialIncrementValue + bonus} points`;
  showPerkToast('total-earned', message);
  return bonus;
};
