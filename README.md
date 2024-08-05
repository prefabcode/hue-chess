# Hue Chess

Hue Chess is a chrome extension for Lichess.org that adds a new and unique reward mechanism for winning chess games. At its' core, this extension changes the hue color of your chess board by a certain amount as you win games. When you win games, you earn "hue points" that change your chessboard color by a certain amount (dependent upon how many points you earned). 

Once you exhaust all of the possible colors for a given board, you "level up" and move on to the next chess board available on lichess. Hue Chess keeps track of your progress in the form of an experience bar. Once that hue point experience bar reaches completion, you level up and move on to the next board. 

As you level up your chess boards, you unlock perks that act as modifiers, that allow you to earn more hue points from your wins, in exchange for performing certain tasks within the chess game. 

*Note: Hue Chess is currently under heavy development, and not all features may be implemented / working as intended.* 

## Features

- **Hue Points System**: Accumulate hue points by winning chess games. The hue of your chess board changes as you earn more points. Progress through 25 unique levels. 
- **Time Control-Based Rewards**: Different time controls grant varying ranges of hue points:
  - Bullet: 1-3 points
  - Blitz: 3-6 points
  - Rapid: 6-10 points
  - Classical: 10-15 points
- **Progress Tracking**: A progress bar displays your current level and how far you are from reaching the next level.
- **Perk System (10/13 perks implemented)**: As you level up in Hue Chess, you will unlock new perks that allow you to gain bonus hue points from your wins. At launch, Hue chess will feature 13 perks to unlock spread across 25 levels. 
- **Prestige System (not yet implemented)**: Once you complete your journey and beat level 25, you have the option to prestige, reseting your level to 1 and obtaining a new avatar visible near your Hue Chess Xp bar. Hue Chess is planned to ship with 10 prestige levels at launch. 
- **Import / Export functionality**: Encode your progress in a BASE64 string, which you can then import on another machine to sync your progress on hue chess across multiple computers.

## Installation

1. Clone or download this repository.
2. Run `npm install` to install project dependencies
3. Run `npm run build` to bundle extension assets (you currently have to do this every time you make a change while developing). 
4. Open your browser's extensions page (usually found in the settings menu).
5. Enable "Developer mode" (if not already enabled).
6. Click on "Load unpacked" and select the `build` directory of the project. 

## Usage

1. Once installed, navigate to Lichess. You will want to open the hue chess settings menu, which will allow you to select perks. At level 1, there will be 2-3 perks that you can select. You will unlock more perks as you level. 

> The hue chess menu can be accessed via the hue-chess extension icon within the chrome extensions menu. It can also be accessed by going through Username -> Board -> click "Open Hue Chess Settings" button. (Soon this will be accessible by simply clicking on the Hue Chess xp bar that is drawn next to your username on lichess). 

2. Once you have selected your perks, go play some games! When you win, you'll now earn hue points! 

*Note: There is currently a bug with installation that occurs sometimes. The extension is installed correctly when you have a hue chess xp progress bar visible within the lichess navigation (next to your username). As mentioned previously, the project is under heavy development. This critical issue will be fixed upon release. If you do not see a xp progress bar visible when loading lichess.org for the first time, click on your username on the top right, that might fix the issue.* 

### File Structure

- `content_scripts/*.js`: Contains extension logic for all functionality within hue chess.
- `imgs/*.svg`: contains image assets used throughout the project. 
- `background.js`: Handles the browser action click to open the settings modal.
- `content.js`: Entry point for the project. 
- `settings.html`: This is the player stats / perk selection modal.
- `customStyles.css`: Style file for the extension.
- `manifest.json`: Extension manifest file.
- `build.js`: Contains logic for gathering assets and piping them to the build directory within the project. 

## Future Features

- **Feats of Strength**: These intend to be passive, large hue point bonuses for feats that occur more rarely, such as winning a minature or playing on lichess for extended periods of time.
- **More Perks**: While Hue Chess will initially ship with 13 unique perks, I have ideas for introducing more perks after v1.  

## Contributing

Feel free to submit issues or pull requests if you have suggestions or improvements.

## License

This project is licensed under the MIT License.
