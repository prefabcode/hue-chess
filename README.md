# Hue Chess

Hue Chess is a browser extension designed to enhance your chess-playing experience on Lichess by providing a unique visual reward system. This extension changes the hue of your chess board as you win games, offering a fun and engaging way to track your progress and celebrate your victories.

## Features

- **Hue Points System**: Accumulate hue points by winning chess games. The hue of your chess board changes as you earn more points. Progress through 25 unique levels. 
- **Time Control-Based Rewards**: Different time controls grant varying ranges of hue points:
  - Bullet: 1-3 points
  - Blitz: 3-6 points
  - Rapid: 6-10 points
  - Classical: 10-15 points
- **Progress Tracking**: A progress bar displays your current level and how far you are from reaching the next level.
- **Hue Board Settings**: Overhauls the default lichess board menu, allowing a player to view detailed progress related to their level, hue points acquired. Also allows to import / export game state (so you can use the extension on multiple browsers without losing progress).

## Installation

1. Clone or download this repository.
2. Run `npm install` to install project dependencies
3. Run `npm run build` to bundle extension assets. 
4. Open your browser's extensions page (usually found in the settings menu).
5. Enable "Developer mode" (if not already enabled).
6. Click on "Load unpacked" and select the `build` directory of the project. 

## Usage

1. Once installed, navigate to Lichess and start playing games.
2. The extension will track your wins and update the hue of your chess board accordingly.
3. Hue chess settings can be accessed via the hue-chess extension icon within the chrome extensions menu. It can also be accessed by going through Username -> Board -> click "Open Hue Chess Settings" button.  

### File Structure

- `content_scripts/*.js`: Contains extension logic for monitoring game state and updating hue points.
- `background.js`: Handles the browser action click to open the settings modal.
- `settings.html`: The HTML structure for the settings modal.
- `customStyles.css`: Various styling for the extension.
- `manifest.json`: Extension manifest file.

## Future Features

- **Support for chess variants**: Earn hue-points from playing chess variants. 
- **Time Control Challenges**: Specific challenges that restrict hue point accumulation to a particular time control (e.g., Bullet-only challenge).
- **Trophy System**: Reward players with unique trophies for completing the Hue Chess challenge. 

## Contributing

Feel free to submit issues or pull requests if you have suggestions or improvements.

## License

This project is licensed under the MIT License.
