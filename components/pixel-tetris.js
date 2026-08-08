/**
 * <pixel-tetris> — a footer easter egg.
 *
 * Purpose
 *   A small, blocky Tetris tucked behind a disclosure in the site
 *   footer. Opt-in, self-contained, and built in the same register as
 *   the rest of the site: monospace, signal green on obsidian.
 *
 * Public API
 *   Attributes:
 *     cols   — board width in cells.  Default 10
 *     rows   — board height in cells. Default 18
 *     label  — text on the disclosure summary. Default "./tetris"
 *   Events: none.
 *
 * Usage
 *   <pixel-tetris></pixel-tetris>
 *
 * Controls
 *   ← →  move        ↑ / X  rotate
 *   ↓    soft drop   Space  hard drop
 *   P    pause       R      restart
 *   Every control also has an on-screen button, so the game is fully
 *   playable by keyboard, pointer, or touch without a physical
 *   keyboard.
 *
 * Accessibility
 *   Nothing moves until the visitor opens the disclosure — no
 *   auto-playing motion (WCAG 2.2.2). The game pauses itself when
 *   closed, scrolled away, or when the tab is hidden. Arrow keys are
 *   only intercepted while the board itself has focus, so they never
 *   hijack page scrolling. Score is not announced on every tick; a
 *   polite live region reports only line clears, level ups and game
 *   over. Board colours are decorative — the game never requires
 *   distinguishing two colours to be playable.
 *
 * Offline / degraded-network behaviour
 *   No network dependency. If the element never upgrades (JS off), it
 *   renders nothing at all, which is the correct outcome for an
 *   optional easter egg — no broken affordance is left behind.
 *
 * Known limitations
 *   Rotation uses simple offset wall-kicks rather than full SRS, so a
 *   few advanced T-spin kicks are not available. No hold queue.
 */

/* Tetromino shapes, as square matrices so rotation is a transpose. */
const SHAPES = {
  I: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
  S: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
  Z: [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
  J: [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
  L: [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
};

/* Drawn from the site palette, then spread across hue and lightness so
   adjacent pieces stay tellable apart without relying on hue alone. */
const COLORS = {
  I: "#29e17a",
  O: "#e8d5b0",
  T: "#7aa2d0",
  S: "#00a344",
  Z: "#d9825f",
  J: "#5fc9bd",
  L: "#b58ad0",
};

const KEYS = new Set([
  "ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp",
  " ", "x", "X", "p", "P", "r", "R",
]);

const POINTS = [0, 100, 300, 500, 800];

function rotateCW(matrix) {
  const n = matrix.length;
  const out = matrix.map(() => new Array(n).fill(0));
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) { out[x][n - 1 - y] = matrix[y][x]; }
  }
  return out;
}

/* Seven-bag randomiser — guarantees every piece appears once per bag,
   which is what stops the run of four S-pieces that makes people quit. */
function newBag() {
  const bag = Object.keys(SHAPES);
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

const STYLES = `
  :host { display: block; }

  details {
    border-top: 1px solid #1e2224;
    padding-top: var(--space-3, 1.5rem);
    margin-top: var(--space-3, 1.5rem);
  }

  summary {
    display: inline-flex;
    align-items: center;
    gap: 0.5em;
    font-family: var(--font-mono, ui-monospace, monospace);
    font-size: var(--text-caption, 0.8125rem);
    color: #a8b1b5;
    cursor: pointer;
    list-style: none;
    padding: 0.35rem 0;
    min-height: 44px;
    box-sizing: border-box;
  }

  summary::-webkit-details-marker { display: none; }

  summary::before {
    content: "$";
    color: var(--brand-signal, #00c853);
  }

  summary:hover { color: #fff; }

  summary:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring, 0 0 0 3px #00c853);
    border-radius: 2px;
  }

  /* #7f8b90 is the site's muted-on-obsidian tone: 5.5:1, clears AA.
     Anything dimmer fails at this 13px size. */
  .hint {
    color: #7f8b90;
    margin-inline-start: 0.5em;
  }

  details[open] .hint { display: none; }

  .body {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3, 1.5rem);
    padding-block: var(--space-3, 1.5rem) var(--space-1, 0.5rem);
    font-family: var(--font-mono, ui-monospace, monospace);
  }

  canvas {
    display: block;
    background: #07090a;
    border: 1px solid #1e2224;
    image-rendering: pixelated;
    touch-action: none;
  }

  canvas:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring, 0 0 0 3px #00c853);
  }

  .hud {
    display: flex;
    flex-direction: column;
    gap: var(--space-2, 1rem);
    font-size: var(--text-caption, 0.8125rem);
    color: #a8b1b5;
    min-width: 11rem;
  }

  dl { display: grid; grid-template-columns: auto auto; gap: 0.15rem 0.75rem; margin: 0; }
  dt { color: #7f8b90; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.6875rem; align-self: center; }
  dd { margin: 0; color: #fff; font-variant-numeric: tabular-nums; }

  .legend { color: #7f8b90; line-height: 1.7; font-size: 0.6875rem; margin: 0; }
  .legend b { color: #a8b1b5; font-weight: 400; }

  .pad { display: grid; grid-template-columns: repeat(3, 2.75rem); gap: 0.25rem; }

  .pad button,
  .actions button {
    font-family: inherit;
    font-size: 0.75rem;
    min-height: 44px;
    padding: 0.4rem 0.6rem;
    background: transparent;
    color: #d7dee1;
    border: 1px solid #2c3336;
    border-radius: 2px;
    cursor: pointer;
    transition: border-color 120ms ease, color 120ms ease;
  }

  .pad button:hover,
  .actions button:hover {
    border-color: var(--brand-signal, #00c853);
    color: #fff;
  }

  .pad button:focus-visible,
  .actions button:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring, 0 0 0 3px #00c853);
  }

  /* Keep the d-pad shaped like a d-pad: soft drop centred beneath
     rotate rather than falling into the first free grid cell. */
  .pad button[data-act="down"] { grid-column: 2; }

  .pad .wide { grid-column: 1 / -1; }

  .actions { display: flex; gap: 0.25rem; flex-wrap: wrap; }

  .status {
    color: var(--brand-signal, #00c853);
    font-size: 0.6875rem;
    min-height: 1.2em;
    margin: 0;
  }

  @media (max-width: 30rem) {
    .hud { min-width: 0; }
  }
`;

export class PixelTetris extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: "open" });

    this.cols = Math.max(6, Number.parseInt(this.getAttribute("cols") ?? "10", 10) || 10);
    this.rows = Math.max(8, Number.parseInt(this.getAttribute("rows") ?? "18", 10) || 18);
    const label = this.getAttribute("label") ?? "./tetris";

    this.shadowRoot.innerHTML = `
      <style>${STYLES}</style>
      <details>
        <summary>${label}<span class="hint">— press to play</span></summary>
        <div class="body">
          <canvas tabindex="0" role="application"
                  aria-label="Tetris board. Use the arrow keys to move and rotate, space to drop, P to pause. On-screen buttons are provided beside the board."></canvas>
          <div class="hud">
            <dl>
              <dt>Score</dt><dd data-score>0</dd>
              <dt>Lines</dt><dd data-lines>0</dd>
              <dt>Level</dt><dd data-level>1</dd>
              <dt>Next</dt><dd data-next>—</dd>
            </dl>

            <p class="status" role="status" aria-live="polite" data-status></p>

            <div class="pad">
              <button type="button" data-act="left" aria-label="Move left">←</button>
              <button type="button" data-act="rotate" aria-label="Rotate">↻</button>
              <button type="button" data-act="right" aria-label="Move right">→</button>
              <button type="button" data-act="down" aria-label="Soft drop">↓</button>
              <button type="button" data-act="drop" class="wide" aria-label="Hard drop">drop</button>
            </div>

            <div class="actions">
              <button type="button" data-act="pause">pause</button>
              <button type="button" data-act="restart">restart</button>
            </div>

            <p class="legend">
              <b>← →</b> move &nbsp; <b>↑</b> rotate<br>
              <b>↓</b> soft drop &nbsp; <b>space</b> drop<br>
              <b>P</b> pause &nbsp; <b>R</b> restart
            </p>
          </div>
        </div>
      </details>
    `;

    this._details = this.shadowRoot.querySelector("details");
    this._canvas = this.shadowRoot.querySelector("canvas");
    this._ctx = this._canvas.getContext("2d");
    this._els = {
      score: this.shadowRoot.querySelector("[data-score]"),
      lines: this.shadowRoot.querySelector("[data-lines]"),
      level: this.shadowRoot.querySelector("[data-level]"),
      next: this.shadowRoot.querySelector("[data-next]"),
      status: this.shadowRoot.querySelector("[data-status]"),
    };

    this._sizeCanvas();
    this._reset();

    this._details.addEventListener("toggle", () => {
      if (this._details.open) {
        this._canvas.focus();
        this._resume();
      } else {
        this._pause();
      }
    });

    /* Only capture arrows while the board has focus — otherwise the
       game would steal page scrolling from everyone else. */
    this._canvas.addEventListener("keydown", (e) => {
      if (!KEYS.has(e.key)) { return; }
      e.preventDefault();
      this._input(e.key);
    });

    this.shadowRoot.querySelectorAll("[data-act]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this._act(btn.dataset.act);
        /* Keep focus on the button so repeated taps work, but make sure
           the game is running again after a restart. */
        if (btn.dataset.act === "restart") { this._canvas.focus(); }
      });
    });

    this._onVisibility = () => { if (document.hidden) { this._pause(); } };
    document.addEventListener("visibilitychange", this._onVisibility);

    this._io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) { this._pause(); }
    }, { threshold: 0 });
    this._io.observe(this);

    this._draw();
  }

  disconnectedCallback() {
    this._pause();
    this._io?.disconnect();
    document.removeEventListener("visibilitychange", this._onVisibility);
  }

  _sizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    /* Cell size is chosen so the board fits a footer column comfortably
       at any width without ever producing a fractional grid. */
    this._cell = window.innerWidth < 420 ? 13 : 17;
    const w = this.cols * this._cell;
    const h = this.rows * this._cell;
    this._canvas.width = w * dpr;
    this._canvas.height = h * dpr;
    this._canvas.style.width = `${w}px`;
    this._canvas.style.height = `${h}px`;
    this._ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  _reset() {
    this.grid = Array.from({ length: this.rows }, () => new Array(this.cols).fill(null));
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.over = false;
    this.paused = true;
    this._bag = [];
    this._acc = 0;
    this._last = 0;
    this._next = this._pull();
    this._spawn();
    this._say("");
    this._sync();
  }

  _pull() {
    if (this._bag.length === 0) { this._bag = newBag(); }
    return this._bag.pop();
  }

  _spawn() {
    this.type = this._next;
    this._next = this._pull();
    this.piece = SHAPES[this.type].map((row) => [...row]);
    this.px = Math.floor((this.cols - this.piece.length) / 2);
    this.py = -this._topPadding(this.piece);

    if (this._collides(this.piece, this.px, this.py)) {
      this.over = true;
      this.paused = true;
      this._say("Game over — press restart");
    }
    this._sync();
  }

  /* Empty rows at the top of the matrix, so pieces enter flush with the
     ceiling instead of hovering a row or two above it. */
  _topPadding(matrix) {
    let pad = 0;
    for (const row of matrix) {
      if (row.some(Boolean)) { break; }
      pad++;
    }
    return pad;
  }

  _collides(matrix, ox, oy) {
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix.length; x++) {
        if (!matrix[y][x]) { continue; }
        const gx = ox + x;
        const gy = oy + y;
        if (gx < 0 || gx >= this.cols || gy >= this.rows) { return true; }
        if (gy >= 0 && this.grid[gy][gx]) { return true; }
      }
    }
    return false;
  }

  _move(dx) {
    if (this.over || this.paused) { return; }
    if (!this._collides(this.piece, this.px + dx, this.py)) { this.px += dx; }
    this._draw();
  }

  _rotate() {
    if (this.over || this.paused) { return; }
    const next = rotateCW(this.piece);
    /* Offset kicks: try in place, then nudge sideways, which covers
       rotating against a wall or a stack. */
    for (const kick of [0, -1, 1, -2, 2]) {
      if (!this._collides(next, this.px + kick, this.py)) {
        this.piece = next;
        this.px += kick;
        this._draw();
        return;
      }
    }
  }

  _softDrop() {
    if (this.over || this.paused) { return; }
    if (this._collides(this.piece, this.px, this.py + 1)) {
      this._lock();
    } else {
      this.py++;
      this.score += 1;
      this._sync();
    }
    this._draw();
  }

  _hardDrop() {
    if (this.over || this.paused) { return; }
    let dropped = 0;
    while (!this._collides(this.piece, this.px, this.py + 1)) {
      this.py++;
      dropped++;
    }
    this.score += dropped * 2;
    this._lock();
    this._draw();
  }

  _lock() {
    for (let y = 0; y < this.piece.length; y++) {
      for (let x = 0; x < this.piece.length; x++) {
        if (!this.piece[y][x]) { continue; }
        const gy = this.py + y;
        if (gy < 0) {
          /* Locked above the ceiling — the stack has topped out. */
          this.over = true;
          this.paused = true;
          this._say("Game over — press restart");
          return;
        }
        this.grid[gy][this.px + x] = this.type;
      }
    }
    this._clearLines();
    if (!this.over) { this._spawn(); }
  }

  _clearLines() {
    let cleared = 0;
    for (let y = this.rows - 1; y >= 0; y--) {
      if (this.grid[y].every(Boolean)) {
        this.grid.splice(y, 1);
        this.grid.unshift(new Array(this.cols).fill(null));
        cleared++;
        y++;   /* re-test the row that dropped into this position */
      }
    }
    if (cleared === 0) { return; }

    this.lines += cleared;
    this.score += POINTS[cleared] * this.level;

    const level = Math.floor(this.lines / 10) + 1;
    if (level !== this.level) {
      this.level = level;
      this._say(`Level ${level}`);
    } else {
      this._say(cleared === 4 ? "Tetris — 4 lines" : `${cleared} line${cleared > 1 ? "s" : ""}`);
    }
    this._sync();
  }

  _input(key) {
    if (key === "ArrowLeft") { this._move(-1); }
    else if (key === "ArrowRight") { this._move(1); }
    else if (key === "ArrowDown") { this._softDrop(); }
    else if (key === "ArrowUp" || key === "x" || key === "X") { this._rotate(); }
    else if (key === " ") { this._hardDrop(); }
    else if (key === "p" || key === "P") { this._act("pause"); }
    else if (key === "r" || key === "R") { this._act("restart"); }
  }

  _act(action) {
    if (action === "left") { this._move(-1); }
    else if (action === "right") { this._move(1); }
    else if (action === "rotate") { this._rotate(); }
    else if (action === "down") { this._softDrop(); }
    else if (action === "drop") { this._hardDrop(); }
    else if (action === "restart") { this._reset(); this._resume(); }
    else if (action === "pause") {
      if (this.over) { return; }
      if (this.paused) { this._resume(); } else { this._pause(); this._say("Paused"); }
    }
  }

  _resume() {
    if (this.over || !this._details.open) { return; }
    if (!this.paused) { return; }
    this.paused = false;
    this._say("");
    this._last = performance.now();
    this._acc = 0;
    const loop = (now) => {
      if (this.paused) { return; }
      const dt = now - this._last;
      this._last = now;
      this._acc += dt;

      const interval = Math.max(90, 780 - (this.level - 1) * 70);
      while (this._acc >= interval) {
        this._acc -= interval;
        if (this._collides(this.piece, this.px, this.py + 1)) { this._lock(); } else { this.py++; }
        if (this.over) { break; }
      }

      this._draw();
      if (!this.paused) { this._raf = requestAnimationFrame(loop); }
    };
    this._raf = requestAnimationFrame(loop);
  }

  _pause() {
    this.paused = true;
    if (this._raf) { cancelAnimationFrame(this._raf); }
    this._raf = null;
  }

  _say(message) {
    if (this._els.status.textContent !== message) {
      this._els.status.textContent = message;
    }
  }

  _sync() {
    this._els.score.textContent = String(this.score).padStart(5, "0");
    this._els.lines.textContent = String(this.lines).padStart(3, "0");
    this._els.level.textContent = String(this.level).padStart(2, "0");
    this._els.next.textContent = this._next ?? "—";
  }

  /* Beveled cell — a lighter top-left and darker body reads as a chunky
     pixel sprite rather than a flat rectangle. */
  _cellAt(x, y, color) {
    const ctx = this._ctx;
    const s = this._cell;
    const px = x * s;
    const py = y * s;

    ctx.fillStyle = color;
    ctx.fillRect(px + 1, py + 1, s - 2, s - 2);

    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.fillRect(px + 1, py + 1, s - 2, 2);
    ctx.fillRect(px + 1, py + 1, 2, s - 2);

    ctx.fillStyle = "rgba(0,0,0,0.32)";
    ctx.fillRect(px + 1, py + s - 3, s - 2, 2);
    ctx.fillRect(px + s - 3, py + 1, 2, s - 2);
  }

  _draw() {
    const ctx = this._ctx;
    const s = this._cell;
    const w = this.cols * s;
    const h = this.rows * s;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#07090a";
    ctx.fillRect(0, 0, w, h);

    /* Faint grid, so an empty board still reads as a playfield */
    ctx.strokeStyle = "rgba(255,255,255,0.045)";
    ctx.lineWidth = 1;
    for (let x = 1; x < this.cols; x++) {
      ctx.beginPath();
      ctx.moveTo(x * s + 0.5, 0);
      ctx.lineTo(x * s + 0.5, h);
      ctx.stroke();
    }
    for (let y = 1; y < this.rows; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * s + 0.5);
      ctx.lineTo(w, y * s + 0.5);
      ctx.stroke();
    }

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const cell = this.grid[y][x];
        if (cell) { this._cellAt(x, y, COLORS[cell]); }
      }
    }

    if (!this.over) {
      /* Landing preview — where a hard drop would put the piece */
      let ghostY = this.py;
      while (!this._collides(this.piece, this.px, ghostY + 1)) { ghostY++; }

      ctx.strokeStyle = "rgba(255,255,255,0.22)";
      for (let y = 0; y < this.piece.length; y++) {
        for (let x = 0; x < this.piece.length; x++) {
          if (!this.piece[y][x] || ghostY + y < 0) { continue; }
          ctx.strokeRect((this.px + x) * s + 1.5, (ghostY + y) * s + 1.5, s - 3, s - 3);
        }
      }

      for (let y = 0; y < this.piece.length; y++) {
        for (let x = 0; x < this.piece.length; x++) {
          if (this.piece[y][x] && this.py + y >= 0) {
            this._cellAt(this.px + x, this.py + y, COLORS[this.type]);
          }
        }
      }
    }

    if (this.over || this.paused) {
      ctx.fillStyle = "rgba(7,9,10,0.82)";
      ctx.fillRect(0, h / 2 - 18, w, 36);
      ctx.fillStyle = this.over ? "#d9825f" : "#29e17a";
      ctx.font = `600 12px ${getComputedStyle(this).getPropertyValue("--font-mono") || "monospace"}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.over ? "GAME OVER" : "PAUSED", w / 2, h / 2);
    }
  }
}
