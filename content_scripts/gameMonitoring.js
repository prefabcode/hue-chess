import { waitForElm } from "./uiUpdates";
import { incrementHue } from "./rewardCalculation.js";

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

export const checkForWin = (userColor) => {
    console.log("Checking for win...");
    const status = document.querySelector('section.status');
    if (!status) {
        console.log("Status element not found");
        return false;
    }

    const statusText = status.innerText;
    console.log(`Status text: ${statusText}`);

    if (userColor === 'white' && statusText.includes('White is victorious')) {
        console.log("User (white) has won");
        return true;
    } else if (userColor === 'black' && statusText.includes('Black is victorious')) {
        console.log("User (black) has won");
        return true;
    }
    console.log("No win detected");
    return false;
};

export const checkTimeElement = () => {
    const timeElement = document.querySelector('.game__meta .header time.set');
    if (timeElement && timeElement.innerText === 'right now') {
        console.log("Game is ongoing (time element shows 'right now')");
        return true;
    }
    console.log("Game is not ongoing (time element does not show 'right now')");
    return false;
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
                    const isPlaying = userStatus.playing && userStatus.playingId === currentGameId;
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

    const intervalId = setInterval(() => {
        if (checkForWin(userColor)) {
            incrementHue();
            clearInterval(intervalId);  // Stop checking after a win is detected
            console.log("Win detected, stopped checking");
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
