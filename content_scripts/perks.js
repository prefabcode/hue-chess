import { getActivePerks, getPlayingId } from "./storageManagement.js";
import * as pgnParser from '@mliebelt/pgn-parser';

const isBerzerkerFulfilled = () => {
    // will return either bonusValue or 0. 
    return 0;
}

const isGladiatorFulfilled = () => {
    return 0;
}

const isBongcloudFulfilled = async (userName) => {
	const playingId = await getPlayingId();
	if (playingId) {
			const apiUrl = `https://lichess.org/game/export/${playingId}`;

			try {
					const response = await fetch(apiUrl);
					if (!response.ok) {
							throw new Error(`API request failed with status ${response.status}`);
					}

					const data = await response.text();
					console.log("PGN Data:", data);

					const parsedGames = pgnParser.parse(data);
					console.log("Parsed Games:", parsedGames);

					const game = parsedGames[0];
					console.log("Parsed Game:", game);

					// Determine the player's color
					const whitePlayer = game.tags.White;
					const blackPlayer = game.tags.Black;
					console.log(`White Player: ${whitePlayer}, Black Player: ${blackPlayer}`);

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

					console.log(`Player ${userName} is playing as ${playerColor}.`);

					// Check if the player played Ke2 on the second move
					const moves = game.moves;
					console.log("Moves:", moves);

					let secondMove = null;

					if (playerColor === 'white' && moves.length > 2) {
							secondMove = moves[2].notation.notation;
					} else if (playerColor === 'black' && moves.length > 3) {
							secondMove = moves[3].notation.notation;
					}

					console.log(`Second Move for ${playerColor}: ${secondMove}`);

					if ((playerColor === 'white' && secondMove === 'Ke2') || (playerColor === 'black' && secondMove === 'Ke7')) {
							console.log('Ke2 / Ke7 detected. Bongcloud bonus applied');
							const bonus = Math.floor(Math.random() * (4 - 2 + 1)) + 2;
							console.log(`Bongcloud bonus points: ${bonus}`);
							return bonus;
					} else {
							console.log('Player did not play Ke2 on the second move.');
					}
			} catch (error) {
					console.error("Error fetching game data from Lichess API:", error);
			}
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

export const calculatePerkBonuses = async () => {
    let bonus = 0;
    // code that retrieves username.
    const userTag = document.getElementById('user_tag');
        if (!userTag) {
            console.log("User tag not found");
            resolve(false);
            return;
        }

    const userName = userTag.innerText.trim();

    const activePerks = await getActivePerks(); // Function to get active perks from storage

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
        bonus += isBongcloudFulfilled(userName);
    }
    if (activePerks.includes('analysis')) {
        bonus += isAnalysisFulfilled();
    }
    if (activePerks.includes('revenge')) {
        bonus += isRevengeFulfilled();
    }

    return bonus;
};


