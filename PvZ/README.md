# Plants vs Zombies

A browser-based tower-defense game inspired by Plants vs Zombies. Defend your lawn with plants, survive escalating waves, and defeat **Dr. Zomboss** every 20 waves.

No build step required — open `index.html` in a modern browser and play.

## Quick Start

```bash
# From the PvZ folder, open index.html in your browser
start index.html        # Windows
open index.html         # macOS
xdg-open index.html     # Linux
```

Or serve the folder locally:

```bash
npx serve .
```

## How to Play

1. **Choose a level** on the menu (Front Yard, Night, Pool, or Roof).
2. **Collect sun** by hovering over it — sun auto-collects when your cursor is nearby.
3. **Click a plant card**, then **click a lawn tile** to place it.
4. **Stop zombies** from reaching the left side of the lawn.
5. Each wave starts with a **Flag Zombie**. When it raises the flag, the full assault begins.
6. Survive as many waves as you can. Every **20th wave**, **Dr. Zomboss** appears.

### Lose Condition

A zombie reaches your house after its row's lawnmower has already been used.

### Wave Boss — Dr. Zomboss

- Appears on waves **20, 40, 60**, and so on.
- Stays anchored on the **right side** of the lawn inside a giant zombie robot.
- **Spawns minions** continuously while alive.
- **5,000 HP** — the tankiest enemy in the game.
- Normal wave spawning **pauses** until he is defeated.
- The next wave does not start until Zomboss and all his minions are cleared.

## Controls

| Key / Action | Effect |
|---|---|
| Click plant card | Select plant to place |
| Click lawn tile | Place selected plant |
| Hover over sun | Auto-collect sun |
| **U** | Toggle upgrade mode |
| Click plant (upgrade mode) | Open upgrade panel |
| **🪏 Shovel** card | Remove a plant (no refund) |
| **P** | Pause / resume |
| **G** | Toggle admin panel |
| **Esc** | Deselect plant / close panels |

## Plants

| Plant | Cost | Cooldown | Role |
|---|---|---|---|
| 🌻 Sunflower | 50 | 5s | Produces sun |
| 🌱 Peashooter | 100 | 7s | Shoots peas |
| 🥜 Wall-nut | 50 | 20s | High-HP blocker |
| 🍒 Cherry Bomb | 150 | 30s | 3×3 explosion |
| 🥔 Potato Mine | 25 | 10s | Buried trap, arms in 7s |
| ❄️ Snow Pea | 175 | 7s | Slowing projectiles |

### Upgrades

Sunflower, Peashooter, Wall-nut, and Snow Pea can be upgraded to **level 3**:

- Press **U** or click **⬆️ Upgrade**, then click a plant.
- Cherry Bomb and Potato Mine cannot be upgraded.

## Zombies

| Zombie | HP | Notes |
|---|---|---|
| Regular | 100 | Basic walker |
| Conehead | 200 | Extra durability |
| Buckethead | 350 | Heavy armor |
| Gargantuar | 600 | Slow, powerful; takes 2 instant-kill hits |
| Flag Zombie | 100 | Signals wave start |
| **Dr. Zomboss** | **5,000** | Boss; spawns minions; takes 10 instant-kill hits |

Gargantuars and tougher zombies appear more often at higher waves.

## Levels

| Level | Starting Sun | Special Rules |
|---|---|---|
| ☀️ Front Yard | 150 | Sun falls from the sky |
| 🌙 Night | 175 | No sky sun — rely on Sunflowers |
| 🏊 Backyard Pool | 150 | 6 rows; pool tiles block planting |
| 🏠 Roof | 200 | No sky sun; zombies move 15% faster |

## Other Mechanics

- **Lawnmowers** — One per row on the left. Activates when a zombie enters the lane; dashes right and clears zombies in that row. Each mower can only be used once per game.
- **Procedural audio** — Web Audio sound effects with mute toggle.
- **Score** — Earn points for each zombie defeated.

## Admin Panel

Press **G** during gameplay to open the debug panel:

| Button | Effect |
|---|---|
| Infinite Sun | Toggle free planting (restores previous sun when off) |
| Spawn Zombie / Conehead / Buckethead / Gargantuar | Spawn enemies immediately |
| Start Wave Assault | Skip the flag zombie wait |
| Cooldowns | Toggle plant cooldowns on/off |

## Project Structure

```
PvZ/
├── index.html   # Game shell and UI
├── game.js      # Game logic, rendering, audio
├── styles.css   # Layout and styling
└── README.md    # This file
```

## Development

### Quality Checks

An automated QC script lives in the parent repo:

```bash
node ../.grok/skills/qc-agent/scripts/qc-pvz.mjs
```

It validates syntax, DOM wiring, game constants, admin panel hooks, and boss logic.

### Tech Stack

- **HTML5 Canvas** for rendering
- **Vanilla JavaScript** — no frameworks or bundler
- **CSS** with the [Fredoka](https://fonts.google.com/specimen/Fredoka) font
- **Web Audio API** for procedural sound effects

## License

Part of the [game](https://github.com) monorepo. See the repository root for license details.