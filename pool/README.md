 Features Implemented:
   * Physics Engine: Realistic 2D rigid-body physics for ball-to-ball and ball-to-rail collisions, including friction and deceleration.
   * Game Modes: Supports both 1-Player (vs. AI) and 2-Player (Local) modes.
   * Player Interaction:
       * Aiming: Intuitively aim the cue ball with your mouse.
       * Striking: Click and hold to build power, then release to shoot.
       * Aiming Line & Cue Stick: Visual aids to help plan your shots.
   * Game Rules:
       * Pocketing: Six pockets correctly handle ball removal and scoring.
       * Turn Management: Players alternate turns, with bonuses for successful shots and penalties for fouling (pocketing the cue ball).
       * Cue Ball Reset: Automatic reset if the cue ball is pocketed.
   * UI Overlay: Real-time scoring, turn announcements, power meter, and game mode controls.
   * AI Opponent: A simple AI that takes shots when it's the computer's turn in 1-player mode.

  How to Play:
   1. Select Mode: Choose between "1 Player" or "2 Players" using the buttons at the top.
   2. Aim: Move your mouse around the cue ball to set the shot angle.
   3. Shoot: Press and hold the mouse button to charge the power meter (top left), then release to strike.
   4. Score: Pocket red or yellow balls to gain points and continue your turn.

  The project is structured with a clean separation between the physics engine (src/engine), game types (src/types), and the React-based UI (src/components). You can start the
  development server to try it out by running npm run dev.
