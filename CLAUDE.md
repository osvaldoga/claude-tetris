# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the game

No build step or dependencies. Two options:

```bash
# Open directly
open index.html

# Or serve locally (avoids any browser file:// restrictions)
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Architecture

Three files, no framework:

- **`index.html`** — DOM structure: `<canvas id="board">` (300×600px) for the playfield, `<canvas id="next-canvas">` (120×120px) for the piece preview, `#overlay` div for pause/game-over states.
- **`style.css`** — Dark/retro arcade theme. No classes are toggled by JS except `hidden` on `#overlay`.
- **`game.js`** — All game logic (~305 lines, `'use strict'`). Module-free; everything lives in one flat scope.

### game.js internals

**State** — mutable globals: `board` (2D array ROWS×COLS, `0` = empty, `1–7` = piece color index), `current`/`next` (piece objects `{type, shape, x, y}`), plus `score`, `lines`, `level`, `paused`, `gameOver`, `dropInterval`, `dropAccum`, `lastTime`, `animId`.

**Key functions:**
| Function | Role |
|---|---|
| `init()` | Resets all state, starts the `requestAnimationFrame` loop |
| `loop(ts)` | Game tick: accumulates time, drops piece when `dropAccum ≥ dropInterval`, calls `draw()` |
| `collide(shape, ox, oy)` | Bounds + overlap check; used everywhere before moving/rotating |
| `tryRotate()` | Clockwise rotation with ±1/±2 column wall kicks |
| `lockPiece()` | `merge()` → `clearLines()` → `spawn()` |
| `clearLines()` | Scans bottom-up, splices full rows, updates score/level/speed |
| `ghostY()` | Projects current piece straight down for ghost rendering |
| `draw()` | Clears canvas, draws grid + locked board + ghost (alpha 0.2) + current piece |

**Speed formula:** `dropInterval = Math.max(100, 1000 − (level − 1) × 90)` ms. Level increments every 10 lines.

**Scoring:** `LINE_SCORES = [0, 100, 300, 500, 800]` × level. Hard drop: +2 pts/cell. Soft drop: +1 pt/row.

### Tunable constants (top of game.js)

`COLS` (10), `ROWS` (20), `BLOCK` (30px), `COLORS` (array indexed 1–7), `LINE_SCORES`. If you change `COLS`, `ROWS`, or `BLOCK`, also update the `width`/`height` attributes on `<canvas id="board">` in `index.html` (`COLS×BLOCK` / `ROWS×BLOCK`).
