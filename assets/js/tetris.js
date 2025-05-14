// ─── Tetris jsPsych Plugin ───────────────────────────────────────────────
//  For jsPsych v7+  (ES‑module syntax; no global jsPsych var needed)
//  Author: 2025‑05‑14
// ------------------------------------------------------------------------
(function () {
/* ----- Compatibility shim -------------------------------------------------
   If the global jsPsychPlugin base class isn't defined (e.g. when using the
   classic non‑module build of jsPsych), create a no‑op stand‑in so that
   `class TetrisPlugin extends jsPsychPlugin { ... }` doesn't throw.
--------------------------------------------------------------------------- */
if (typeof window.jsPsychPlugin === "undefined") {
  window.jsPsychPlugin = function () {};
  window.jsPsychPlugin.parametersType = {
    INT: "int",
    STRING: "string",
    BOOL: "bool",
  };
  window.jsPsychPlugin.dataType = {
    INT: "int",
    FLOAT: "float",
    STRING: "string",
    BOOL: "bool"
  };
}

const SHAPES = {
  I: [[1, 1, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]],
  O: [[1, 1], [1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  T: [[0, 1, 0], [1, 1, 1]],
  Z: [[1, 1, 0], [0, 1, 1]],
};
const COLORS = {
  I: "#00f0f0",
  J: "#0000f0",
  L: "#f0a000",
  O: "#f0f000",
  S: "#00f000",
  T: "#a000f0",
  Z: "#f00000",
};
const rotateCW = (m) => m[0].map((_, i) => m.map((r) => r[i]).reverse());

class TetrisPlugin extends jsPsychPlugin {
  // ─── Static metadata ────────────────────────────────────────────
  static get info() {
    return {
      name: "tetris",
      version: "0.1.0",
      description: "Playable Tetris mini‑game inside a jsPsych trial.",
      parameters: {
        grid_cols:     { type: jsPsychPlugin.parametersType.INT,    default: 10 },
        grid_rows:     { type: jsPsychPlugin.parametersType.INT,    default: 20 },
        cell_px:       { type: jsPsychPlugin.parametersType.INT,    default: 30 },
        drop_interval: { type: jsPsychPlugin.parametersType.INT,    default: 500 },
        background:    { type: jsPsychPlugin.parametersType.STRING, default: "#111" },
        show_score:    { type: jsPsychPlugin.parametersType.BOOL,   default: true },
        total_duration_ms: { type: jsPsychPlugin.parametersType.INT, default: null }  // null = unlimited
      },
      data: {
        score:   { type: jsPsychPlugin.dataType.INT,    default: null },
        lines:   { type: jsPsychPlugin.dataType.INT,    default: null },
        level:   { type: jsPsychPlugin.dataType.INT,    default: null },
        moves:   { type: jsPsychPlugin.dataType.INT,    default: null },
        key_log: { type: jsPsychPlugin.dataType.STRING, default: null }
      }
    };
  }

  // ─── Trial constructor ─────────────────────────────────────────
  constructor(jsPsych) {
    super(jsPsych);
  }

  trial(display_element, trial) {
    /* ---------- Canvas + HUD ---------- */
    const W = trial.grid_cols * trial.cell_px;
    const H = trial.grid_rows * trial.cell_px;
    display_element.innerHTML = `
      <canvas id="tetris-cv" width="${W}" height="${H}"></canvas>
      <div id="tetris-hud" style="color:white;font-family:monospace;margin-top:8px;"></div>`;
    const ctx = display_element.querySelector("#tetris-cv").getContext("2d");

    /* ---------- Game state ---------- */
    // track how long this trial has been running
    const startTime = performance.now();

    const blank = () =>
      Array.from({ length: trial.grid_rows }, () =>
        Array(trial.grid_cols).fill(null)
      );
    let grid = blank();

    // resets all per‑game variables, keeps cumulative score
    const resetGame = () => {
      grid = blank();
      current = randPiece();
      next    = randPiece();
      level   = 0;
      lines   = 0;
      moves   = 0;
      lastDrop = 0;
      paused  = false;
    };

    const randPiece = () => {
      const ids = Object.keys(SHAPES);
      const id = ids[Math.random() * ids.length | 0];
      return { id, shape: SHAPES[id], row: 0, col: trial.grid_cols / 2 - 2 | 0 };
    };

    let current = randPiece(),
      next = randPiece();
    let score = 0,
      lines = 0,
      level = 0,
      moves = 0,
      paused = false,
      lastDrop = 0;
    const keyLog = [];

    /* ---------- Helpers ---------- */
    const collide = (shape, r, c) => {
      for (let y = 0; y < shape.length; y++)
        for (let x = 0; x < shape[0].length; x++)
          if (
            shape[y][x] &&
            (c + x < 0 ||
              c + x >= trial.grid_cols ||
              r + y >= trial.grid_rows ||
              (r + y >= 0 && grid[r + y][c + x]))
          )
            return true;
      return false;
    };

    const lock = () => {
      current.shape.forEach((row, y) =>
        row.forEach((v, x) => {
          if (v && current.row + y >= 0)
            grid[current.row + y][current.col + x] = COLORS[current.id];
        })
      );
      /* clear lines */
      const original = grid.length;
      grid = grid.filter((r) => r.some((c) => !c));
      const cleared = original - grid.length;
      while (grid.length < trial.grid_rows)
        grid.unshift(Array(trial.grid_cols).fill(null));
      if (cleared) {
        score += [0, 40, 100, 300, 1200][cleared] * (level + 1);
        lines += cleared;
        level = (lines / 10) | 0;
      }
    };

    const drawCell = (x, y, col) => {
      ctx.fillStyle = col;
      ctx.fillRect(
        x * trial.cell_px,
        y * trial.cell_px,
        trial.cell_px,
        trial.cell_px
      );
      ctx.strokeStyle = "#222";
      ctx.strokeRect(
        x * trial.cell_px,
        y * trial.cell_px,
        trial.cell_px,
        trial.cell_px
      );
    };

    const render = () => {
      ctx.fillStyle = trial.background;
      ctx.fillRect(0, 0, W, H);
      grid.forEach((r, y) =>
        r.forEach((c, x) => c && drawCell(x, y, c))
      );
      current.shape.forEach((r, y) =>
        r.forEach((v, x) =>
          v && drawCell(current.col + x, current.row + y, COLORS[current.id])
        )
      );
      if (trial.show_score)
        display_element.querySelector(
          "#tetris-hud"
        ).textContent = `Score ${score}    Lines ${lines}    Lv ${level}`;
    };

    /* ---------- Movement ---------- */
    const tryMove = (dr, dc) => {
      if (!collide(current.shape, current.row + dr, current.col + dc)) {
        current.row += dr;
        current.col += dc;
        return true;
      }
      return false;
    };

    const rotatePiece = () => {
      const n = rotateCW(current.shape);
      if (!collide(n, current.row, current.col)) current.shape = n;
    };

    /* ---------- Keyboard ---------- */
    const onKey = (e) => {
      keyLog.push({ key: e.key, t: performance.now() });
      switch (e.key) {
        case "ArrowLeft":
          tryMove(0, -1);
          moves++;
          break;
        case "ArrowRight":
          tryMove(0, 1);
          moves++;
          break;
        case "ArrowDown":
          tryMove(1, 0);
          moves++;
          break;
        case "ArrowUp":
          rotatePiece();
          moves++;
          break;
        case " ":
          while (tryMove(1, 0)) {}
          lock();
          moves++;
          break;
        case "p":
        case "P":
          paused = !paused;
          break;
      }
    };
    window.addEventListener("keydown", onKey);

    /* ---------- Main loop ---------- */
    const loop = (ts) => {
      if (paused) {
        requestAnimationFrame(loop);
        return;
      }
      // end the trial when the allotted time has passed
      if (trial.total_duration_ms && ts - startTime >= trial.total_duration_ms) {
        finish();
        return;
      }
      if (
        ts - lastDrop >
        trial.drop_interval * Math.pow(0.8, level)
      ) {
        if (!tryMove(1, 0)) {
          lock();
          current = next;
          next = randPiece();
          if (collide(current.shape, current.row, current.col)) {
            // game over → start a new one without ending the trial
            resetGame();
          }
        }
        lastDrop = ts;
      }
      render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    /* ---------- Finish ---------- */
    const finish = () => {
      window.removeEventListener("keydown", onKey);
      render(); // final board
      jsPsych.finishTrial({
        score,
        lines,
        level,
        moves,
        key_log: JSON.stringify(keyLog),
      });
    };
  }
}  // ← closes class TetrisPlugin

// -- expose plugin for classic jsPsych setup (guarded) --
window.TetrisPlugin = TetrisPlugin;
if (window.jsPsych && window.jsPsych.plugins) {
  window.jsPsych.plugins["tetris"] = TetrisPlugin;
}
})();