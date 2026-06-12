# Elsacorn & Unicorn — Magical Rainbow Race

A colorful, touch-friendly board game for two players (or one player vs. the computer). Race your magical unicorn tokens along a winding rainbow track from Start to the Rainbow Castle.

## Quick Start

No build step or dependencies required. Open `index.html` in any modern browser:

```bash
# From the project folder, open index.html in your default browser (Windows)
start index.html
```

Or double-click `index.html` in your file explorer.

Works on desktop, tablet, and mobile — optimized for iPad touch controls.

## How to Play

1. **Choose a mode** — **2 Players** (local hot-seat) or **Play vs Computer**
2. **Take turns spinning** — Tap **SPIN** on your turn. The wheel lands on 1–6.
3. **Move automatically** — Your token hops forward that many spaces, leaving a trail of magical star particles.
4. **Reach the castle** — The first player to land on or pass the Rainbow Castle wins.
5. **Celebrate** — Confetti flies, then tap **Play Again** to return to the mode menu.

### Players

| Player | Token | Description |
|--------|-------|-------------|
| Player 1 | **Elsacorn** | Ice-blue, Elsa-inspired magical unicorn with a golden horn |
| Player 2 | **Unicorn** | Classic rainbow unicorn with a golden horn |
| Computer | **Elsacorn** | Controls the Elsacorn token; spins automatically after your turn |

## Features

- **Rainbow pastel theme** — Sky-blue background, cotton-candy clouds, lollipop trees, and pink/blue grass
- **Winding board** — 26-step Candy Land-style track with distinct colored tiles
- **3D spinner wheel** — Six numbered segments with smooth spin animation (replaces dice)
- **Turn indicator** — Shows whose turn it is, including "Computer is spinning..."
- **Particle effects** — Star tail follows tokens as they move
- **Win celebration** — Confetti overlay and Play Again button
- **Touch optimized** — Large buttons, no accidental zoom/scroll, `touch-action: manipulation`

## Project Structure

```
unicorn-elsacorn/
├── index.html       # Complete game (HTML, CSS, and JavaScript)
├── Instructions.md    # Original design specification
└── README.md        # This file
```

The entire game lives in a single self-contained `index.html` file. All graphics are CSS, SVG, and emoji — no external images or assets.

## Technical Notes

- **Stack:** Vanilla HTML, CSS, and JavaScript (no frameworks)
- **Board rendering:** SVG path with absolutely positioned SVG token overlays
- **Effects:** HTML5 Canvas for star particles and confetti
- **Viewport:** `maximum-scale=1.0, user-scalable=no` to prevent pinch-zoom on touch devices
- **Responsive layout:** Board scales to fill available space; spinner and header compact on smaller screens

## Browser Support

Tested in modern browsers that support CSS transforms, SVG, and Canvas (Chrome, Firefox, Safari, Edge). Requires JavaScript enabled.