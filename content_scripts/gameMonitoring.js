import { incrementHue } from "./rewardCalculation.js";
import { applyGladiatorPenalty } from "./rewardCalculation.js";
import {
  getActivePerks,
  setGladiatorLossBuffer,
  getGladiatorLossBuffer,
  resetGladiatorLossBuffer,
  setAllowGladiatorPerkRemoval,
  setPlayingId,
  getPlayingId,
  setHasPlayedBefore,
  setPreparationStatus,
  getPreparationStatus,
} from "./storageManagement.js";
import { PREPARATION_TIME } from "./constants.js";
import { startAnalysisTimer, updateProgressBarTooltip } from "./uiUpdates.js";
import * as pgnParser from '@mliebelt/pgn-parser';

export const getUserColor = () => {
  console.log("Attempting to get user color...");
  const userTag = document.getElementById('user_tag');
  if (!userTag) {
    console.log("User tag not found");
    return null;
  }

  const userName = userTag.innerText.trim();
  console.log(`Username found: ${userName}`);

  const playerContainers = document.querySelectorAll('.game__meta__players .player');
  for (const player of playerContainers) {
    const anchor = player.querySelector('a');
    if (anchor && anchor.href.includes(userName)) {
      const color = player.classList.contains('black') ? 'black' : 'white';
      console.log(`User is playing as: ${color}`);
      return color;
    }
  }
  console.log("User color not determined");
  return null;
};

export const checkForWinOrLoss = (userColor, game) => {
  console.log("Checking for win or loss using PGN data...");
  const result = { win: false, loss: false };

  if ((userColor === 'white' && game.tags.Result === '1-0') ||
    (userColor === 'black' && game.tags.Result === '0-1')) {
    result.win = true;
  } else if ((userColor === 'white' && game.tags.Result === '0-1') ||
    (userColor === 'black' && game.tags.Result === '1-0')) {
    result.loss = true;
  }

  console.log("Returning result:", result);
  return result;
};

export const fetchParsedGame = async () => {
  const playingId = await getPlayingId();
  if (!playingId) {
    console.log("No playing ID found");
    return null;
  }
  console.log(`Playing ID found: ${playingId}`);

  const apiUrl = `https://lichess.org/game/export/${playingId}?pgnInJson=true`;
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.text();
    const parsedGames = pgnParser.parse(data);
    const game = parsedGames[0];

    return game;

  } catch (error) {
    console.error("Error fetching game data from Lichess API:", error);
    return null;
  }
};

function generateStreamId() {
  return Math.random().toString(36).substring(2, 12);
}

export const fetchGameStream = async (streamId, playingId, userColor) => {
  const apiUrl = `https://lichess.org/api/stream/games/${streamId}`;
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: playingId
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let ndjsonBuffer = '';

    const read = async () => {
      try {
        const { done, value } = await reader.read();
        if (done) {
          console.log('Stream ended.');
          return;
        }

        ndjsonBuffer += decoder.decode(value, { stream: true });
        let lines = ndjsonBuffer.split('\n');
        ndjsonBuffer = lines.pop(); // Keep the last incomplete line in the buffer

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              console.log(`[${new Date().toISOString()}] Received data:`, data);

              // Check if the game has started
              if (data.statusName === 'started') {
                const user1 = data.players.white.userId;
                const user2 = data.players.black.userId;

                // Reset the global variable
                await setHasPlayedBefore(false);

                // Fetch the crosstable data
                const crosstableResponse = await fetch(`https://lichess.org/api/crosstable/${user1}/${user2}`);
                const crosstableData = await crosstableResponse.json();
                if (crosstableData.nbGames > 0) {
                  await setHasPlayedBefore(true);
                }
              }

              // Handle the data (e.g., check if the game has finished)
              if (data.statusName && data.statusName !== 'started') {
                console.log('The game has finished.', data);
                const game = await fetchParsedGame();
                if (game) {
                  const result = checkForWinOrLoss(userColor, game);
                  const activePerks = await getActivePerks();
                  if (result.win) {
                    if (activePerks.includes('gladiator')) {
                      const gladiatorLossBuffer = await getGladiatorLossBuffer();
                      await setGladiatorLossBuffer(gladiatorLossBuffer + 1);
                    }
                    await incrementHue(game);
                  } else if (result.loss) {
                    if (activePerks.includes('gladiator')) {
                      const gladiatorLossBuffer = await getGladiatorLossBuffer();
                      if (gladiatorLossBuffer > 0) {
                        await setGladiatorLossBuffer(gladiatorLossBuffer - 1);
                      } else {
                        await resetGladiatorLossBuffer();
                        await applyGladiatorPenalty();
                        await setAllowGladiatorPerkRemoval(true);
                      }
                    }
                    if (activePerks.includes('preparation')) {
                      await setPreparationStatus(false);
                    }
                  }
                  await setPlayingId(null);
                  updateProgressBarTooltip();
                  reader.cancel();
                }
              }
            } catch (error) {
              console.error('Error parsing NDJSON line:', error);
            }
          }
        }

        read(); // Continue reading
      } catch (error) {
        console.error('Error reading stream:', error);
      }
    };

    read();

  } catch (error) {
    console.error("Error fetching game stream from Lichess API:", error);
  }
};

export const isPlayingGame = () => {
  return new Promise((resolve, reject) => {
    const userTag = document.getElementById('user_tag');
    if (!userTag) {
      console.log("User tag not found");
      resolve(false);
      return;
    }

    const userName = userTag.innerText.trim();
    const apiUrl = `https://lichess.org/api/users/status?ids=${userName}&withGameIds=true`;

    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data && data.length > 0) {
          const userStatus = data[0];
          const currentGameId = window.location.pathname.split('/')[1];
          const isPlaying = userStatus.playing && currentGameId.includes(userStatus.playingId);

          if (isPlaying) {
            setPlayingId(userStatus.playingId).then(() => {
              console.log("Playing ID stored:", userStatus.playingId);
            });
          }

          console.log(isPlaying ? "User is playing a game" : "User is not playing a game");
          resolve(isPlaying);
        } else {
          console.log("No data received from API or user not found");
          resolve(false);
        }
      })
      .catch(error => {
        console.error("Error fetching user status from Lichess API:", error);
        resolve(false);
      });
  });
};

export const monitorGame = async () => {
  console.log("Monitoring game...");
  const userColor = getUserColor();
  if (!userColor) return;

  const playingId = await getPlayingId();
  if (!playingId) return;

  const streamId = generateStreamId();
  fetchGameStream(streamId, playingId, userColor);
};

export const checkUrlAndStartMonitoring = async () => {
  const url = window.location.href;
  const activePerks = await getActivePerks();
  const gameIdPattern = /https:\/\/lichess\.org\/[a-zA-Z0-9]{8,}/;
  if (gameIdPattern.test(url)) {
    isPlayingGame().then((isPlaying) => {
      if (isPlaying) {
        monitorGame();
      } else {
        console.log("User is not playing in this game, no monitoring needed");
      }
    });
  }
  if (activePerks.includes('preparation')) {
    const isPreparationMet = await getPreparationStatus();
    if (document.querySelector('.analyse__board.main-board') && !isPreparationMet) {
      console.log('Preparation perk selected and analysis board detected, starting timer');
      startAnalysisTimer(PREPARATION_TIME);
    }
  } else {
    console.log('No monitoring needed');
  }
};
