import { incrementHue } from "./rewardCalculation.js";
import { getActivePerks, setPlayingId, setWinningStreak, getWinningStreak } from "./storageManagement.js";

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

export const checkForWinOrLoss = (userColor) => {
    console.log("Checking for win or loss...");
    const status = document.querySelector('section.status');
    if (!status) {
        console.log("Status element not found");
        return { win: false, loss: false };
    }

    const statusText = status.innerText;
    console.log(`Status text: ${statusText}`);

    if (userColor === 'white' && statusText.includes('White is victorious')) {
        console.log("User (white) has won");
        return { win: true, loss: false };
    } else if (userColor === 'black' && statusText.includes('Black is victorious')) {
        console.log("User (black) has won");
        return { win: true, loss: false };
    } else if (userColor === 'white' && statusText.includes('Black is victorious')) {
        console.log("User (white) has lost");
        return { win: false, loss: true };
    } else if (userColor === 'black' && statusText.includes('White is victorious')) {
        console.log("User (black) has lost");
        return { win: false, loss: true };
    }

    console.log("No win or loss detected");
    return { win: false, loss: false };
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

export const monitorGame = () => {
    console.log("Monitoring game...");
    const userColor = getUserColor();
    if (!userColor) return;

    const intervalId = setInterval(async () => {
        const result = checkForWinOrLoss(userColor);
        if (result.win) {
            const activePerks = await getActivePerks(); 
            if (activePerks.includes('hot-streak')) {
                const winningStreak = await getWinningStreak();
                await setWinningStreak(winningStreak + 1);
            }
            incrementHue();
            clearInterval(intervalId);  // Stop checking after a win is detected
            console.log("Win detected, stopped checking");
        } else if (result.loss) {
            setWinningStreak(0); // Reset the winning streak on a loss
            clearInterval(intervalId);  // Stop checking after a loss is detected
            console.log("Loss detected, stopped checking");
        }
    }, 1000);
};


export const checkUrlAndStartMonitoring = () => {
    const url = window.location.href;
    const gameIdPattern = /https:\/\/lichess\.org\/[a-zA-Z0-9]{8,}/;
    if (gameIdPattern.test(url)) {
        isPlayingGame().then((isPlaying) => {
            if (isPlaying) {
                monitorGame();
            } else {
                console.log("User is not playing in this game, no monitoring needed");
            }
        });
    } else {
        console.log("Not a game URL, no monitoring needed");
    }
};
