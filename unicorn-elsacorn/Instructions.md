Create a complete, single-file HTML, CSS, and JavaScript web game based on the following specifications. The game must be fully responsive, optimized for iPad/mobile touch controls, and feature a vibrant, colorful aesthetic.

## 1. Visual Theme & Aesthetic
*   **Color Palette:** The entire game should have an all-rainbow, pastel, and magical aesthetic. 
*   **Background:** A beautiful sky-blue background filled with fluffy, pink/purple "cotton candy" clouds.
*   **Environment Art:** Decorate the board and surroundings with cute CSS-styled elements: lollipop trees, and fields of dual-toned pink and blue grass.

## 2. Game Board & Mechanics
*   **Board Layout:** A classic linear board game track (like Candy Land) winding through the magical environment. It should have around 20 to 30 colorful, distinct tiles leading from a "Start" zone to a "Rainbow Castle" finish line.
*   **Players:** 
    *   Player 1: Controls an "Elsacorn" token (an Elsa-inspired magical unicorn).
    *   Player 2 / Computer: Controls a classic "Unicorn" token.
*   **Game Mode:** At the start, give the user a toggle or menu to select "2 Players" or "Play vs Computer". If Computer is selected, the AI automatically takes Player 2's turn after a brief delay.
*   **Movement Indicator:** Whenever a token moves from one tile to another, create a magical "star tail" particle effect that forms behind the token as it travels.

## 3. UI & Controls
*   **The Spinner:** Instead of dice, include a colorful, interactive 3D-looking spinning wheel divided into 6 numbered sections (1 to 6). 
    *   Clicking or tapping "SPIN" plays a smooth rotation animation before landing on a random number.
    *   The active player's token then automatically moves that many spaces forward.
*   **Turn Indicator:** Clearly display whose turn it is (e.g., "Elsacorn's Turn!" or "Computer is spinning...").
*   **Win Condition:** The first token to land exactly on or pass the final tile wins. Show a celebratory confetti pop-up with a "Play Again" button.

## 4. Technical Requirements
*   **Single File:** Deliver the entire project in one self-contained `index.html` file containing all CSS (`<style>`) and JavaScript (`<script>`). Use clean CSS graphics, emojis, or SVGs for the tokens, lollipops, and clouds so no external image assets are required.
*   **iPad Optimization:** Ensure all buttons and the spinner are large, easily clickable for touch screens, and that the viewport prevents accidental zooming or scrolling.