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

const incrementHue = () => {
  console.log("Incrementing hue...");
  const userTag = document.getElementById('user_tag');
  
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
              let newValue = currentValue + 5;
              console.log(`Current hue value: ${currentValue}, New hue value: ${newValue}`);
  
              if (newValue > 100) {
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

const init = () => {
  console.log("Initializing extension...");
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

init();
