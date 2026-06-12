# Plants vs Zombies

A browser-based tower-defense game inspired by Plants vs Zombies. Pick your plants, defend the lawn through escalating waves, and defeat **Dr. Zomboss** every 20 waves.

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

1. **Choose a level** on the main menu (Front Yard, Night, Pool, or Roof).
2. **Pick your loadout** — select up to **8 plants** from the full roster (no default loadout; your choices are saved per level).
3. **Collect sun** by hovering over it — sun auto-collects when your cursor is nearby.
4. **Click a plant card**, then **click a lawn tile** to place it.
5. **Stop zombies** from reaching the left side of the lawn.
6. Each wave begins with a **Flag Zombie**. When it raises the flag, the full assault begins.
7. Survive as many waves as you can. Every **20th wave**, **Dr. Zomboss** appears.

### Lose Condition

A zombie reaches your house after that row's **lawnmower** has already been used.

There is no fixed win screen — the goal is to survive and climb the wave count.

## Controls

| Key / Action | Effect |
|---|---|
| Click plant card | Select plant to place |
| Click lawn tile | Place selected plant |
| Hover over sun | Auto-collect sun |
| **U** | Toggle upgrade mode |
| Click plant (upgrade mode) | Open upgrade panel |
| **🪏 Shovel** card | Remove a plant (no sun refund) |
| **P** | Pause / resume |
| **G** | Toggle admin panel |
| **Esc** | Deselect plant / close panels / exit shovel mode |

### In-Game HUD

- **⬆️ Upgrade** — power up plants on the lawn
- **🔊** — mute / unmute procedural audio
- **⏸** — pause menu (resume, restart, or return to main menu)

## Levels

| Level | Starting Sun | Rows | Special Rules |
|---|---|---|---|
| ☀️ **Front Yard** | 150 | 5 | Sun falls from the sky |
| 🌙 **Night** | 175 | 5 | No sky sun — mushrooms are awake; use Sun-shrooms and Sunflowers |
| 🏊 **Backyard Pool** | 150 | 6 | Pool tiles in the middle rows; Lily Pads required on water |
| 🏠 **Roof** | 200 | 5 | No sky sun; slope blocks straight shooters; Flower Pots required; 3 starter pots per row on the left |

### Level-Specific Rules

- **Night** — Mushrooms are awake by default. On other levels, mushrooms sleep until woken with a Coffee Bean.
- **Pool** — Only regular, Conehead, and Buckethead zombies swim in water rows (shown with ducky tubes). Lily Pads let you plant on water; Tangle Kelp goes directly in water.
- **Roof** — Peashooters, Snow Peas, Gatling Peas, and Puff-shrooms cannot shoot over the slope. Use lobbers (Cabbage-pult, Kernel-pult, Melon-pult). Roof starts with Flower Pots in the leftmost 3 columns.

## Plants (27 total)

### Sun Production

| Plant | Cost | Cooldown | Notes |
|---|---|---|---|
| 🌻 Sunflower | 50 | 5s | Produces sun; upgradeable (faster / more sun) |
| 🌻 Twin Sunflower | 150 | 10s | Place on a Sunflower — doubles sun output; upgradeable |
| 🍄 Sun-shroom | 25 | 5s | Starts small, grows over time for better sun; upgradeable |
| 🍄 Puff-shroom | 0 | 7s | Free short-range spore shooter; upgradeable range/damage |

### Shooters

| Plant | Cost | Cooldown | Notes |
|---|---|---|---|
| 🌱 Peashooter | 100 | 7s | Straight shooter; upgradeable |
| 🔫 Gatling Pea | 400 | 10s | Place on Peashooter — rapid fire; upgradeable |
| ❄️ Snow Pea | 175 | 7s | Slows zombies; upgradeable |
| 🔥 Torchwood | 175 | 7s | Ignites peas that pass through (see Torchwood tiers below); upgradeable to level 4 |
| 🥬 Cabbage-pult | 100 | 7s | Lobs cabbages over roof slope; upgradeable |
| 🌽 Kernel-pult | 100 | 7s | Lobs kernels; butter stuns zombies; upgradeable |
| 🌽 Cob Cannon | 500 | 7s | Place on **two adjacent Kernel-pults** in the same row — click cannon, then click target to fire |
| 🍈 Melon-pult | 300 | 10s | Lob with splash damage; upgradeable |
| ❄️ Winter Melon | 200 | 7s | Place on Melon-pult — icy splash + slow; upgradeable |

### Defensive

| Plant | Cost | Cooldown | Notes |
|---|---|---|---|
| 🥜 Wall-nut | 50 | 20s | High-HP blocker; upgradeable |
| 🌰 Tall-nut | 125 | 30s | Taller, tougher wall; upgradeable |
| 🎃 Squash | 50 | 30s | Waits for a zombie on its tile, one tile left, or one tile right — jumps and crushes (same tile + left tile always crushed; Gargantuars need multiple hits) |

### Instant-Use / Explosives

| Plant | Cost | Cooldown | Notes |
|---|---|---|---|
| 🍒 Cherry Bomb | 150 | 30s | 3×3 explosion; Gargantuars/bosses use multi-hit rules |
| 🌶️ Jalapeno | 125 | 30s | Burns every zombie in its row; Gargantuars need 2 hits, Giga-gargs 4, boss 1 hit per use |
| 🥔 Potato Mine | 25 | 10s | Buries, arms in 7s, detonates on contact |
| 🍄 Ice-shroom | 75 | 50s | Freezes **all** zombies on screen for 4s |
| 💀 Doom Shroom | 5000 | 300s | Wipes all zombies; leaves a **2-minute crater** (blocks planting; toggle craters in admin) |
| 💥 Boom Shroom | 125 | 50s | Mushroom — sleeps on day levels; wake with Coffee Bean → 1.5s fuse → screen-wide boom (bosses take 1 instant-kill hit) |

### Mushrooms & Support

| Plant | Cost | Cooldown | Notes |
|---|---|---|---|
| 🍄 Hypno-shroom | 75 | 7s | Hypnotizes zombie that eats it (not Gargantuars/bosses); upgradeable HP |
| ☕ Coffee Bean | 75 | 5s | Place on sleeping mushroom to wake it on day/pool/roof |

### Pool / Roof Carriers

| Plant | Cost | Cooldown | Notes |
|---|---|---|---|
| 🪷 Lily Pad | 25 | 5s | Pool only — platform on water; upgradeable |
| 🌿 Tangle Kelp | 25 | 7s | Pool only — placed in water; drags one zombie under (not Gargantuars) |
| 🏺 Flower Pot | 25 | 5s | Roof only — required before planting on roof tiles; upgradeable |

## Plant Upgrades

Press **U** or click **⬆️ Upgrade**, then click a plant on the lawn.

- Most non-instant plants upgrade to **level 3** (Torchwood and Cob Cannon have special max levels).
- Upgrade cost scales with plant cost and current level.
- **Fusion plants** (Twin Sunflower, Gatling Pea, Winter Melon, Cob Cannon) are placed on an existing plant instead of an empty tile.

### Torchwood Tiers (max level 4)

| Level | Pea Color | Damage Multiplier |
|---|---|---|
| 1 (base) | Orange | 2× |
| 2 | Blue | 3× |
| 3 | Purple | 4× |
| 4 | White | 5× |

### Cob Cannon Tiers (max level 3)

| Level | Blast | Reload | Boss Hits |
|---|---|---|---|
| 1 | 3×3 | 36s | 1 |
| 2 | 3×3 | 28s | 2 |
| 3 | 5×5 | 20s | 3 |

### Non-Upgradeable Plants

Cherry Bomb, Jalapeno, Potato Mine, Ice-shroom, Squash, Doom Shroom, Boom Shroom, Coffee Bean, Tangle Kelp, and fusion cards themselves (Twin Sunflower, Gatling Pea, Winter Melon, Cob Cannon) cannot be leveled through the upgrade panel — fusion plants inherit a new upgrade track after placement.

## Zombies

| Zombie | HP | Notes |
|---|---|---|
| Regular | 100 | Basic walker |
| Conehead | 200 | Extra durability |
| Buckethead | 350 | Heavy armor |
| All-Star | 450 | Fast; appears wave 6+ |
| Gargantuar | 600 | Slow, smashes plants; **2 instant-kill hits** to destroy; throws **Imp** at 50% HP |
| Giga-gargantuar | 1200 | Wave 12+; **4 instant-kill hits**; throws Imp at 50% HP |
| Imp | 70 | Small, fast — thrown by Gargantuars |
| Flag Zombie | 100 | Marches in first; raising the flag starts the wave assault |
| **Dr. Zomboss** | **5000** | Boss; **10 instant-kill hits**; spawns minions while alive |

### Wave Scaling

- Wave 1: 5 zombies. Later waves: `8 + wave × 3`.
- Spawn mix by wave: Conehead (3+), Buckethead (5+), All-Star (6+), Gargantuar (7+), Giga-gargantuar (12+).
- **Every 20 waves** (20, 40, 60…): Dr. Zomboss replaces the normal flag wave. Normal spawning pauses until the boss and all minions are defeated.

## Combat Mechanics

### Hypnotized Zombies

- Hypno-shroom converts a zombie (except Gargantuars and bosses) to fight for you.
- Hypnotized zombies walk **right**, attacking enemies to their right.
- Normal zombies **stop and attack** hypnotized zombies to their left (closer plants still take priority).
- Admin panel can spawn pre-hypnotized zombies of any type.

### Instant-Kill vs Tough Zombies

Cherry Bomb, Jalapeno, Squash, Potato Mine, Cob Cannon, Boom Shroom, and similar effects use a shared **instant-kill hit** system for Gargantuars, Giga-gargantuars, and Dr. Zomboss instead of one-shotting them.

### Lawnmowers

One per row on the left edge. When a zombie passes the mower, it activates, dashes right, and clears zombies in that lane. Each mower works **once per game**.

### Doom Shroom Craters

Doom Shroom leaves a crater for **120 seconds** that blocks planting. Toggle whether craters appear via the admin panel.

### Freeze

Ice-shroom and frozen zombies (`freezeTimer`) stop movement. Snow Pea and Winter Melon apply slow.

## Admin Panel

Press **G** during gameplay to open the debug panel:

| Button | Effect |
|---|---|
| **Infinite Sun** | Toggle free planting (restores previous sun when turned off) |
| **Zombie Spawning** | Toggle automatic wave spawning off (clears all zombies on lawn; turning back on does not restore cleared zombies) |
| **Spawn Zombie / Conehead / Buckethead / All-Star / Gargantuar / Giga-garg / Imp** | Spawn that enemy immediately |
| **Hypno …** buttons | Spawn hypnotized versions of each zombie type (including Zomboss) |
| **Spawn Dr. Zomboss** | Spawn the boss (skips to boss fight state) |
| **Spawn Wave** | Instantly spawn a diverse wave of enemies |
| **Cooldowns** | Toggle plant cooldowns on/off |
| **Doom Craters** | Toggle whether Doom Shroom leaves craters |

Manual admin spawns still work when automatic zombie spawning is disabled.

## Project Structure

```
PvZ/
├── index.html   # Game shell, menus, HUD, admin panel
├── game.js      # Game logic, rendering, audio (~5,600 lines)
├── styles.css   # Layout and styling
└── README.md    # This file
```

## Development

### Quality Checks

An automated QC script lives in the parent repo:

```bash
node ../.grok/skills/qc-agent/scripts/qc-pvz.mjs
```

It validates syntax, DOM wiring, game constants, admin panel hooks, plant/zombie definitions, and boss logic.

### Tech Stack

- **HTML5 Canvas** for rendering
- **Vanilla JavaScript** — no frameworks or bundler
- **CSS** with the [Fredoka](https://fonts.google.com/specimen/Fredoka) font
- **Web Audio API** for procedural sound effects

## License

Part of the [game](https://github.com) monorepo. See the repository root for license details.