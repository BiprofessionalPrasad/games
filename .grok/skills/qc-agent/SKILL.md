---
name: qc-agent
description: >
  Quality-control agent that verifies code changes work before declaring a task
  complete. Runs automated checks, spawns a verifier subagent, and blocks
  "good to go" until VERDICT: PASS. Use when asked to "QC", "quality check",
  "verify it works", "good to go", "/qc", "/qc-agent", or before finishing any
  implementation task in this repo.
metadata:
  short-description: "QC gate before declaring done"
---

# /qc-agent -- Quality Control Gate

Do **not** tell the user work is complete until QC passes. Run this skill at the
end of every implementation task (features, bug fixes, refactors).

## Usage

`/qc-agent [focus area]`

Optional focus area narrows verification (e.g. "admin panel G key toggle").

## Mode Detection

- **Post-task mode**: You just finished implementing something. Run QC before
  your final summary.
- **Standalone mode**: User invoked `/qc-agent` only. Verify current repo state.

## Step 1 -- Automated Checks

Run the project QC script from repo root:

```bash
node .grok/skills/qc-agent/scripts/qc-pvz.mjs
```

If the script exits non-zero, fix every reported issue before continuing.

For non-PvZ subprojects (`zombie_pacman`, `rust_game`, etc.), also run their
native build/test commands from `Claude.md`:

```bash
cd zombie_pacman && cargo check && cargo test
cd rust_game && cargo check
```

## Step 2 -- Verifier Subagent

Call the `task` tool with:
- `description`: `"[QC agent]"` + short label
- `subagent_type`: `"generalPurpose"`
- `prompt`: Copy **QC VERIFIER PROMPT** below. Append focus area if given.

## Step 3 -- Verdict Loop

1. Read subagent result for `VERDICT: PASS` or `VERDICT: FAIL`.
2. **PASS** + automated checks green → you may declare work complete.
3. **FAIL** or script failures → fix issues, re-run Step 1, then Step 2.
4. Repeat up to 3 cycles. If still failing, report blockers honestly.

## What "Good to Go" Requires

All must be true:
- `qc-pvz.mjs` exits 0
- Verifier returns `VERDICT: PASS`
- No known runtime regressions in changed areas
- User request fully addressed (not just code written)

## QC VERIFIER PROMPT

You are the QC verifier for the game monorepo. Your job is to prove the work
actually works — not just that code was written.

You have full tool access. Do not trust prior claims; gather evidence yourself.

=== SCOPE ===

- With a focus area: verify that area plus anything it depends on.
- Without focus: verify all recent changes and critical game paths.

=== CHECKLIST (PvZ) ===

Build this checklist from the user request and recent diffs:

1. **Syntax & wiring** — `game.js` parses; all `getElementById` targets exist in
   `index.html`; event listeners bound for new UI.
2. **Core loop** — `PvZGame` instantiates; `update()` runs without throw;
   `updatePlantBar` guards non-plant cards (shovel).
3. **Requested feature** — every acceptance criterion from the user message.
4. **Regressions** — existing features touched by the diff still behave.
5. **Styles** — new UI has CSS; `hidden` toggle pattern matches existing overlays.

=== WORKFLOW ===

1. `git diff` + `git diff --cached` + read changed files.
2. Run `node .grok/skills/qc-agent/scripts/qc-pvz.mjs` — record output.
3. Read `game.js`, `index.html`, `styles.css` around changed areas.
4. For browser games: write a small Node smoke test if automated script gaps exist
   (e.g. simulate class methods by extracting testable logic).
5. Manually trace critical paths in code (keydown handlers, game state guards).

=== VERDICT RULES ===

- Automatic **FAIL** if `qc-pvz.mjs` fails, syntax errors, missing DOM IDs,
  or a requested feature is absent/incomplete.
- Automatic **FAIL** if a known prior bug would recur (e.g. `updatePlantBar`
  crashing on shovel card).
- **PASS** only with concrete evidence for each checklist item.

End with exactly:
`VERDICT: PASS` or `VERDICT: FAIL`

If FAIL: file paths, line numbers, exact errors, and required fixes.

=== OUTPUT FORMAT ===

## Checklist
## Automated QC Results
## Code Review
## Issues (skip if none)
## VERDICT: PASS|FAIL