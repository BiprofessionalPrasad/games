# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Multi-language game development repository containing four independent game projects:

| Project | Language | Framework | Description |
|---------|----------|-----------|-------------|
| `zombie_pacman/` | Rust | macroquad | Pac-Man clone with zombie enemies, power pellets, and maze navigation |
| `rust_game/` | Rust | std | CLI trivia game ("The Borrow Checker's Dungeon") teaching Rust ownership |
| `ice-hockey/` | JavaScript | Canvas API | 2D ice hockey with 1-player (vs AI) and 2-player modes |
| `ping_pong/` | JavaScript | Canvas API | Customizable ping pong with per-player settings (paddle size, speed, ball size) |

## Build & Run Commands

### Rust Projects (zombie_pacman, rust_game)
```bash
cd zombie_pacman  # or rust_game
cargo build       # Build
cargo run         # Run
```

### JavaScript Games (ice-hockey, ping_pong)
Open `index.html` in a browser. No build step required.

## Architecture Summary

### zombie_pacman
- **Entry**: `src/main.rs` - macroquad game loop with Menu/Playing/GameOver states
- **Modules**:
  - `game.rs` - `Game` struct managing score, lives, level, power-mode timer, pellet tracking
  - `maze.rs` - 20x15 grid maze (1=wall, 0=pellet, 2=power pellet, 3=ghost house), collision detection
  - `entities.rs` - `Player` (Pac-Man with animated mouth) and `Zombie` (chase AI, scared mode)
- **Key mechanics**: Power pills make zombies vulnerable (8s), screen wrapping, pellet collection wins

### rust_game
- **Entry**: `src/main.rs` - CLI loop presenting challenges
- **Module**: `game_logic.rs` - `Challenge` struct (id, description, code_snippet, answer, hint), `GameState` (score, health)
- **Gameplay**: Answer Rust ownership/borrowing questions; wrong answers deal damage

### ice-hockey
- **Entry**: `game.js` - `IceHockeyGame` class
- **Features**: Physics (friction, collision), AI with difficulty levels, 3-minute timer, first-to-5-goals wins
- **UI**: Menu → setup → game → pause → game over screens

### ping_pong
- **Entry**: `game.js` - Canvas-based with setup screen for per-player customization
- **Features**: Independent paddle size/speed per player, AI opponent, winning score of 10

## Code Patterns

**Rust collision detection** (`zombie_pacman/maze.rs:160-162`):
```rust
fn rects_overlap(a: &Rect, b: &Rect) -> bool {
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}
```

**JavaScript game loop pattern** (both JS games):
```javascript
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
```

## Configuration

Claude Code permissions for Rust projects are configured in `.claude/settings.local.json` to allow `cargo build` and `cargo run` commands.

## Behavioral guidelines for coding agents. 
Use these rules to reduce common LLM coding mistakes. 
Merge with project-specific instructions when needed. 
These guidelines favor correctness, clarity, and minimal diffs over speed. For trivial tasks, use judgment. 
## 1. Think Before You Code 
Do not silently guess. 
Before making changes: 
	• State your assumptions clearly. 
	• If anything is ambiguous, ask instead of choosing one interpretation silently. 
	• If there are multiple valid approaches, briefly present the tradeoff. 
	• If the request seems mistaken, inefficient, or overcomplicated, say so. 
	• If a simpler solution exists, recommend it before implementing. 
	• If you are confused, stop and explain what is unclear. 
Do not 
act certain when you are uncertain. 
## 2. Keep the Solution Simple 
Solve the requested problem with the minimum necessary code. 
add features 
that were 
not asked 
introduce abstractions for one-time use. add configurability, extensibility, or generalization add defensive error handling for unrealistic cases. simple, readable code over clever code. 
solution feels too large, step back and simplify it. 
requested. 
Ask yourself: 
	• Is this the smallest change 
	• that solves the problem? 
	• Would a senior 
engineer consider this unnecessarily complex? 
If yes, simplify. 
## 3. Stay Strictly Within Scope 
Only change what the task requires. 
When editing 
existing code: 
	• Do not refactor unrelated code. 
	• Do not rewrite comments, formatting, or naming unless necessary for the 
	• Match the existing style and 
conventions of the codebase. 
	• Do not fix neighboring issues unless the user asked. 
	• If you notice unrelated problems, mention them separately instead of changing them. 
Every changed line should be easy to justify from the request. 
## 4. Make Surgical Diffs 
Keep edits local, focused, and easy to review. 
	• Touch as few files as possible. 
	• Change as little code as necessary. 
	• Avoid broad rewrites when a targeted fix is enough. 
	• Preserve existing 
structure unless changing it is required. 
	• Remove only the dead code, imports, or variables created by your own changes. 
	• Do not delete pre-existing unused code unless asked. 
Prefer small diffs over sweeping cleanup. 
## 5. Work Toward Verifiable Outcomes 
Do not treat "done" as a guess. 
Turn requests into clear success criteria whenever possible. 
Examples: 
	• "Fix the bug" -> reproduce it, fix it, then verify the fix 
	• "Add validation" -> add checks for invalid input and 
verify behavior 
	• "Refactor this" -> preserve behavior and confirm tests still pass 
	• "Optimize this" -> improve performance without changing correctness 
For multi-step tasks, make a short plan with verification points. 
ExampLe: 
	1. Inspect the current behavior - verify: identify the real issue 
	2. Implement the minimal fix - verify: affected behavior changes as expected 
	3. Run tests or checks -> verify: no regressions introduced 
Prefer tests, existing checks, or concrete validation over verbal confidence. 
## 6. Read Before You Write 
Understand the surrounding 
code before 
editing it. 
	• Read enough nearby code to understand how the target piece fits in. 
	• Identify the local conventions before introducing new patterns. 
	• Do not infer architecture from one file when other relevant files are available. 
	• If context is missing, say so. 
Do not patch blindly. 
## 7. Preserve Intent 
Do not accidentally erase meaning while making changes. 
- Preserve 
comments unless they are clearly outdated 
and directly affected by the task. 
	• Preserve behavior unless the requested change is meant to alter it. 
	• Preserve public interfaces unless changing them is necessary. 
	• Call out any intentional behavior change explicitly. 
Do not make hidden product or design decisions on the user's behalf. 
## 8. Ask for Help at the Right Time 
Do not continue blindly when the risk is high. 
Pause and ask if: 
	• the request is ambiguous in a way that affects implementation 
	• the codebase contains conflicting patterns 
	• the correct behavior is unclear 
	• the task requires a product or architectural decision 
	• you are choosing between tradeoffs the user should approve 
Do not fabricate certainty to stay moving. 
## 9. Final Check Before You Finish 
Before considering the task complete, confirm: 
	• the request was actually addressed 
	• the change is no 
Larger than necessary 
	• unrelated
code was not modified 
	• assumptions were surfaced 
	• affected tests or checks were run when possible 
the final result matches the requested 