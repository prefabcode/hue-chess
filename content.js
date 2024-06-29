const timeControlIncrements = {
    'Bullet': 1,
    'Blitz': 4,
    'Rapid': 7,
    'Classical': 11
};

const levelNames = [
    "Brown", "Wood", "Wood2", "Wood3", "Wood4", "Maple", "Maple2", "Horsey", "Leather", "Blue",
    "Blue2", "Blue3", "Canvas", "Blue-Marble", "IC", "Green", "Marble", "Green-Plastic", "Olive", "Grey",
    "Metal", "Newspaper", "Purple", "Purple-Diag", "Pink"
];

const getGameType = () => {
    return new Promise((resolve) => {
        waitForElm('.game__meta .header .setup').then((setupElement) => {
            const setupText = setupElement.innerText;

            for (const [key, value] of Object.entries(timeControlIncrements)) {
                if (setupText.includes(key)) {
                    console.log(`Detected game type: ${key}, setting increment value to ${value}`);
                    resolve(value);
                    return;
                }
            }

            // Default to 1 if no game type is detected
            console.log("No game type detected, defaulting increment value to 1");
            resolve(1);
        });
    });
};

const getUserColor = () => {
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

const checkForWin = (userColor) => {
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

const checkTimeElement = () => {
    const timeElement = document.querySelector('.game__meta .header time.set');
    if (timeElement && timeElement.innerText === 'right now') {
        console.log("Game is ongoing (time element shows 'right now')");
        return true;
    }
    console.log("Game is not ongoing (time element does not show 'right now')");
    return false;
};

const incrementHue = async () => {
    const incrementValue = await getGameType();
    console.log(`Incrementing hue by ${incrementValue} points...`);

    waitForElm('#user_tag').then((userTag) => {
        userTag.click();

        const dasherApp = document.getElementById('dasher_app');
        if (!dasherApp) {
            console.log("Dasher app not found");
            return;
        }

        waitForElm('.subs').then((subsDiv) => {
            console.log('Subs div detected');
            const boardButton = Array.from(subsDiv.querySelectorAll('button')).find(button => button.textContent === 'Board');
            if (!boardButton) {
                console.log("Board button not found");
                return;
            }

            boardButton.click();
            console.log("Clicked board button");

            waitForElm('.board-hue').then((boardHueDiv) => {
                const hueSlider = boardHueDiv.querySelector('input.range');
                if (!hueSlider) {
                    console.log("Hue slider not found");
                    return;
                }

                // Get the current hue value
                let currentValue = parseInt(hueSlider.value, 10);
                let newValue = currentValue + incrementValue;
                console.log(`Current hue value: ${currentValue}, New hue value: ${newValue}`);

                if (newValue >= 100) {
                    newValue = 0;
                    console.log("Max hue reached, resetting to 0 and changing board");

                    // Change to the next board
                    const boardList = dasherApp.querySelector('.list');
                    const activeButton = boardList.querySelector('button.active');
                    const nextButton = activeButton.nextElementSibling;
                    if (nextButton) {
                        nextButton.click();
                        console.log("Clicked next board button");
                    }

                    // Increment completedBoards
                    chrome.storage.local.get(['completedBoards'], (result) => {
                        const completedBoards = (result.completedBoards || 0) + 1;
                        chrome.storage.local.set({ completedBoards, currentHue: newValue }, () => {
                            console.log(`Completed boards incremented, now: ${completedBoards}`);
                            updateProgressBar(completedBoards, newValue);
                        });
                    });
                } else {
                    // Update current hue in storage
                    chrome.storage.local.set({ currentHue: newValue }, () => {
                        updateProgressBar(null, newValue);
                    });
                }

                // Set the new value to the hue slider and dispatch the event
                hueSlider.value = newValue;
                hueSlider.dispatchEvent(new Event('input'));
                console.log("Updated hue slider value");
                userTag.click();
            });
        });
    });
};

const isPlayingGame = () => {
    return new Promise((resolve) => {
        waitForElm('.game__meta .header time.set').then((timeElement) => {
            const userTag = document.getElementById('user_tag');
            const isPlaying = userTag && document.querySelector('.game__meta__players .player a[href*="' + userTag.innerText.trim() + '"]') && checkTimeElement();
            console.log(isPlaying ? "User is playing a game" : "User is not playing a game");
            resolve(isPlaying);
        });
    });
};

const monitorGame = () => {
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

const checkUrlAndStartMonitoring = () => {
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

const initializeExtension = () => {
    console.log("Initializing extension for the first time...");

    // Click the user tag to open the menu
    const userTag = document.getElementById('user_tag');
    userTag.click();

    const dasherApp = document.getElementById('dasher_app');
    if (!dasherApp) {
        console.log("Dasher app not found");
        return;
    }

    waitForElm('.subs').then((subsDiv) => {
        console.log('Subs div detected');
        const boardButton = Array.from(subsDiv.querySelectorAll('button')).find(button => button.textContent === 'Board');
        if (!boardButton) {
            console.log("Board button not found");
            return;
        }
    
        boardButton.click();
        console.log("Clicked board button");

        waitForElm('.board').then((boardSettingsDiv) => {
            const dimensionSelector = boardSettingsDiv.querySelector('.selector');
            if (!dimensionSelector) {
                console.error('Dimension selector element not detected, initialization failed');
                return;
            }
            const the2DButton = Array.from(dimensionSelector.querySelectorAll('button')).find(button => button.textContent === '2D');
            if (!the2DButton) {
                console.error('2d button not found, initialization failed');
                return;
            }
            the2DButton.click();
            console.log('Clicked 2d button');

            waitForElm('.list').then((boardList) => {
                const brownBoardButton = boardList.querySelector('button[title="brown"]');
                if (!brownBoardButton) {
                    console.log("Brown board button not found");
                    return;
                }
    
                brownBoardButton.click();
                console.log("Clicked brown board button");
    
                const isTransparentMode = document.body.classList.contains('transp');
                if (isTransparentMode) {
                    waitForElm('.board-opacity').then((boardOpacityDiv) => {
                        const opacitySlider = boardOpacityDiv.querySelector('input.range');
                        if (!opacitySlider) {
                            console.error('transparency mode detected but opacity not found');
                            return;
                        }
                        opacitySlider.value = 100;
                        opacitySlider.dispatchEvent(new Event('input'));
                        console.log('Opacity slider set to 100');
                    });
                } else {
                    waitForElm('.board-brightness').then((boardBrightnessDiv) => {
                        const brightnessSlider = boardBrightnessDiv.querySelector('input.range');
                        if (!brightnessSlider) {
                            console.error('light/dark mode detected but brightness not found');
                            return;
                        }
                        brightnessSlider.value = 100;
                        brightnessSlider.dispatchEvent(new Event('input'));
                        console.log('Brightness slider set to 100');
                    });
                }
    
                waitForElm('.board-hue').then((boardHueDiv) => {
                    const hueSlider = boardHueDiv.querySelector('input.range');
                    if (!hueSlider) {
                        console.log("Hue slider not found");
                        return;
                    }
    
                    hueSlider.value = 0;
                    hueSlider.dispatchEvent(new Event('input'));
                    console.log("Set hue slider to 0");
                    userTag.click(); // Close the user menu
    
                    // Mark the initialization as done
                    chrome.storage.local.set({ initialized: true, completedBoards: 0 }, () => {
                        console.log("Initialization complete, flag set in storage");
                        // TODO: Understand how this works, wouldn't passing 0 in this method break updateProgressBar? 
                        updateProgressBar(0, 0);
                    });
                });
            });
        });

    });
};

const updateProgressBar = (completedBoards = null, hueValue = null) => {
    chrome.storage.local.get(['completedBoards'], (result) => {
        const level = (completedBoards !== null ? completedBoards : result.completedBoards) + 1;
        const progress = hueValue !== null ? hueValue : 0;
        const levelName = levelNames[level - 1];

        let progressBar = document.getElementById('hue-progress-bar');
        if (!progressBar) {
            // Create progress bar
            progressBar = document.createElement('div');
            progressBar.id = 'hue-progress-bar';
            progressBar.style.display = 'flex';
            progressBar.style.alignItems = 'center';
            progressBar.style.margin = '0 10px';
            progressBar.style.flexGrow = '1';
            progressBar.style.justifyContent = 'flex-end';

            const progressBarContainer = document.createElement('div');
            progressBarContainer.id = 'progress-bar-container';
            progressBarContainer.style.flexBasis = '180px';
            progressBarContainer.style.height = '10px';
            progressBarContainer.style.borderRadius = '5px';
            progressBarContainer.style.backgroundColor = '#8c8c8c';

            const progressFill = document.createElement('div');
            progressFill.id = 'progress-fill';
            progressFill.style.height = '100%';
            progressFill.style.borderRadius = '5px';
            progressFill.style.backgroundColor = 'hsl(88, 62%, 37%)';
            progressFill.style.width = `${progress}%`;

            progressBarContainer.appendChild(progressFill);
            progressBar.appendChild(progressBarContainer);

            const levelText = document.createElement('span');
            levelText.id = 'level-text';
            levelText.style.marginLeft = '10px';
            levelText.style.marginBottom = '1px';
            levelText.textContent = `Level ${level} - ${levelName}`;

            progressBar.appendChild(levelText);

            const header = document.querySelector('header');
            const siteButtons = header.querySelector('.site-buttons');
            header.insertBefore(progressBar, siteButtons);
        } else {
            const progressFill = progressBar.querySelector('#progress-fill');
            const levelText = document.getElementById('level-text');
            progressFill.style.width = `${progress}%`;
            levelText.textContent = `Level ${level} - ${levelName}`;
        }

        // Adapt to light and dark modes
        const isDarkMode = document.body.classList.contains('dark') || document.body.classList.contains('transp');
        if (isDarkMode) {
            const progressBarContainer = progressBar.querySelector('#progress-bar-container');
            const progressFill = progressBar.querySelector('#progress-fill');
            progressFill.style.backgroundColor = '#f7f7f7';
            progressBarContainer.style.backgroundColor = 'hsl(37, 5%, 22%)';
        }
    });
};


const init = () => {
    console.log("Initializing extension...");

    chrome.storage.local.get(['initialized'], (result) => {
        if (!result.initialized) {
            initializeExtension();
        } else {
            console.log("Extension already initialized");
            // Initialize the progress bar with current values
            chrome.storage.local.get(['completedBoards', 'currentHue'], (result) => {
                updateProgressBar(result.completedBoards, result.currentHue);
            });
        }
    });

    monitorBoardDiv();

    checkUrlAndStartMonitoring();
    let currentUrl = window.location.href;

    setInterval(() => {
        if (currentUrl !== window.location.href) {
            currentUrl = window.location.href;
            checkUrlAndStartMonitoring();
        }
    }, 1000);
};

function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

function monitorBoardDiv() {
    const observer = new MutationObserver(() => {
        const boardDiv = document.querySelector('.sub.board');
        const injectedDiv = document.querySelector('#injected-div');
        if (boardDiv && !injectedDiv) {
            injectDiv(boardDiv);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function injectDiv(boardDiv) {
    // Create the injected div
    const injectedDiv = document.createElement('div');
    injectedDiv.id = 'injected-div';

    // Create the message
    const message = document.createElement('p');
    message.innerText = 'Board Settings controlled by Hue Chess Extension';

    // Create the settings button
    const settingsButton = document.createElement('button');
    settingsButton.innerText = 'Open Hue Chess Settings';
    settingsButton.addEventListener('click', () => {
        openSettingsModal();
    });

    // Append the message and button to the injected div
    injectedDiv.appendChild(message);
    injectedDiv.appendChild(settingsButton);

    // Append the injected div to the board div
    boardDiv.appendChild(injectedDiv);

    console.log('Injected div added to .sub .board');
}

function openSettingsModal() {
    // Check if the modal already exists
    let modal = document.querySelector('#hue-chess-settings-modal');
    if (modal) {
        modal.style.display = 'block';
        return;
    }

    // Create the modal
    modal = document.createElement('div');
    modal.id = 'hue-chess-settings-modal';
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = 'white';
    modal.style.padding = '20px';
    modal.style.zIndex = '1000';
    modal.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';

    // Create the modal content
    const modalContent = `
        <h2>Hue Chess Challenge Extension Settings</h2>
        <button id="export-progress">Export Progress</button>
        <button id="import-progress">Import Progress</button>
        <h3>Default Challenge (Active)</h3>
        <p>Accumulate hue points from any game.</p>
        <h3>Time Control Challenges</h3>
        <p>(Selecting one will reset progress)</p>
        <button class="challenge-button" data-challenge="bullet">Bullet Challenge</button>
        <button class="challenge-button" data-challenge="blitz">Blitz Challenge</button>
        <button class="challenge-button" data-challenge="rapid">Rapid Challenge</button>
        <button class="challenge-button" data-challenge="classical">Classical Challenge</button>
        <button id="reset-challenge">Reset Current Challenge</button>
        <p>Current Challenge: Default</p>
        <p>Current Level: 5</p>
        <p>Hue Progress: 43/100</p>
        <button id="close-settings-modal">Close</button>
    `;
    modal.innerHTML = modalContent;

    // Append the modal to the body
    document.body.appendChild(modal);

    // Add event listeners for modal buttons
    document.getElementById('close-settings-modal').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Add event listeners for other buttons as needed
}

init();
