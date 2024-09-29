# Hue Chess

Hue Chess is a chrome extension that adds gamification elements to Lichess. With this extension enabled, you'll earn **Hue Points** every time you win a game. These points slightly change the color of your chessboard and are also used to track your progress throughout each level.

### Discover Perks
Hue Chess features a **Perk System** that boosts the number of Hue Points you earn for every win in exchange for completing specific challenges on Lichess. As you progress and gain levels in Hue Chess, you'll unlock new perks that provide different ways to accumulate even more Hue Points for your victories.

### Level Up with Hue Points
Each level requires 100 Hue Points, and every level features a unique chessboard theme. Journey through 17 distinct levels, discover 9 unique perks, and complete the Hue Chess Challenge!

### Get Started
To choose your perks, simply click on the **Hue Progress Bar** in the top right corner of your navigation bar.

## Features

- **Hue Points System (implemented)**: Accumulate hue points by winning chess games. The hue of your chess board changes as you earn more points. Progress through 18 unique levels. 
- **Time Control-Based Rewards (implemented)** : Different time controls grant varying ranges of hue points. 
- **Progress Tracking (implemented)**: A progress bar displays your current level and how far you are from reaching the next level.
- **Perk System (9/9 perks implemented)**: As you level up in Hue Chess, you will unlock new perks that allow you to gain bonus hue points from your wins. At launch, Hue chess will feature 9 perks to unlock spread across 18 levels. 
- **Easter Egg Perks (implemented)**: Hue Chess will ship with a few easter eggs. 
- **Import / Export functionality (implemented)**: Encode your progress in a BASE64 string, which you can then import on another machine to sync your progress on hue chess across multiple computers.
- **Prestige System (implemented)**: When you complete all 17 levels on Hue Chess, your progress will reset to level 1 and you will enter prestige mode. Prestige mode adds a unique icon to your perk selection menu, that changes as you obtain more prestige.

## Installation

1. Clone or download this repository.
2. Run `npm install` to install project dependencies
3. Run `npm run build` to bundle extension assets (you currently have to do this every time you make a change while developing). 
4. Navigate to `chrome://extensions` in your chrome browser.
5. Enable "Developer mode" on the top right corner (if not already enabled).
6. Click on "Load unpacked" and select the `build` directory of the Hue-Chess project. 
7. Navigate to lichess.org, if installed you should see a welcome dialog that explains how Hue-Chess works!

## Usage

1. Once installed, navigate to Lichess. You will want to open the hue chess perk selection menu, which will allow you to select perks. You can select perks by clicking on the **Hue Progress Bar** in the top right corner of your navigation bar. At level 1, there will be 2 perks that you can select. You will unlock more perks as you level up in Hue Chess. 

2. Once you have selected your perks, go play some games! When you win, you'll now earn hue points! 

### File Structure

- `content_scripts/*.js`: Contains extension logic for all functionality within hue chess.
- `imgs/*.svg`: contains image assets used throughout the project. 
- `background.js`: Handles the browser action click to open the settings modal.
- `content.js`: Entry point for the project. 
- `settings.html`: This is the extension settings modal (accessable by clicking the Hue-Chess chrome icon).
- `perks.html`: This is the perk selection modal. 
- `customStyles.css`: Style file for the extension.
- `manifest.json`: Extension manifest file.
- `build.js`: Contains logic for gathering assets and piping them to the build directory within the project. 

## Future Features

- **Feats of Strength**: These intend to be passive, large hue point bonuses for feats that occur more rarely, such as winning a minature or playing on lichess for extended periods of time.
- **More Perks**: While Hue Chess will initially ship with 9 unique perks, I have ideas for introducing more perks after v1.  
- **Themed Prestige System**: Once you complete your journey and beat level 18, future runs of Hue-Chess should offer unique bonuses for playing certain openings (that change based on the number of times you've beaten Hue Chess).

## Contributing

Feel free to submit issues or pull requests if you have suggestions or improvements.

## License

This project is licensed under the MIT License.
