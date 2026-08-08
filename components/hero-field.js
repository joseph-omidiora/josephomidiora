/**
 * <hero-field> — the converging particle swarm behind the hero.
 *
 * Purpose
 *   A decorative WebGL2 field of particles spiralling inward from a
 *   turbulent outer shell into a stable, bright core. Reads as data
 *   converging on infrastructure — the site's thesis, rendered.
 *
 * Public API
 *   Attributes (all optional; each maps to a shader uniform):
 *     count      — particle count. Default: chosen from viewport size.
 *     speed      — inward velocity.        Default 0.4
 *     chaos      — outer-shell turbulence. Default 20
 *     core-size  — radius of the core.     Default 10
 *     hue-start  — outer hue, 0–1.         Default 0.58 (slate blue)
 *     hue-end    — core hue, 0–1.          Default 0.40 (signal green)
 *   Events: none.
 *
 * Usage
 *   <hero-field></hero-field>
 *
 * Why no three.js
 *   The whole simulation is a closed-form function of particle index and
 *   time, so it runs entirely in the vertex shader — no per-frame CPU
 *   work, no instanced matrix uploads, no scene graph. The glow is
 *   additive blending on soft point sprites rather than a bloom
 *   post-process pass, which costs one draw call instead of several
 *   full-screen passes and needs no library.
 *
 * Accessibility
 *   Purely decorative: aria-hidden, never focusable, and it sits behind
 *   a CSS scrim that guarantees hero text contrast. Under
 *   prefers-reduced-motion it draws one static frame and stops — no
 *   animation loop is ever started.
 *
 * Offline / degraded-network behaviour
 *   No network dependency of any kind. If WebGL2 is unavailable, the
 *   element renders nothing and the hero falls back to flat obsidian,
 *   which is exactly how it looked before this component existed.
 *
 * Known limitations
 *   Requires WebGL2 (no WebGL1 path). Pauses when the hero scrolls out
 *   of view or the tab is hidden, so it never burns battery in the
 *   background.
 */

const VERT = `#version 300 es
precision highp float;

in float a_index;

uniform float u_time;
uniform float u_count;
uniform float u_speed;
uniform float u_chaos;
uniform float u_coreSize;
uniform vec2  u_hue;        /* x = outer hue, y = core hue */
uniform mat4  u_viewProj;
uniform float u_pointScale;
uniform float u_brightness;

out vec3  v_color;
out float v_alpha;

const float TAU = 6.283185307179586;
const float GOLDEN_RATIO = 1.618033988749895;

/* Standard HSL → RGB, matching THREE.Color.setHSL */
vec3 hsl2rgb(vec3 hsl) {
  vec3 rgb = clamp(abs(mod(hsl.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return hsl.z + hsl.y * (rgb - 0.5) * (1.0 - abs(2.0 * hsl.z - 1.0));
}

float hash(float n) { return fract(sin(n * 78.233) * 43758.5453); }

void main() {
  float i = a_index;
  float norm = i / u_count;
  float jitter = hash(i);

  /* Progression from the outer edge (0.0) to the core (1.0). fract()
     wraps it, so particles recycle outward once they arrive.
     Without the per-particle jitter, progress is a perfect function of
     index and the Fibonacci lattice collapses into visible moiré rings;
     the offset dissolves them into a swarm. */
  float progress = fract(norm + jitter * 0.07 + u_time * u_speed * 0.2);
  float easeProgress = pow(progress, 1.5);   /* accelerate near the core */

  /* Fibonacci sphere — even distribution through the shell volume */
  float theta = TAU * i / GOLDEN_RATIO;
  float phi = acos(1.0 - 2.0 * norm);

  /* Jittered so the core reads as a filled volume rather than a hollow
     shell with a hole punched through the middle. */
  float radius = u_coreSize * (0.25 + 0.75 * jitter) + 150.0 * (1.0 - easeProgress);

  /* Turbulence is maximal at the edge and falls to exactly zero at the
     core — the incoming signal is noisy, the settled record is not. */
  float instability = pow(1.0 - progress, 2.0);
  vec3 wobble = vec3(
    sin(u_time * 2.0 + norm * 100.0),
    cos(u_time * 1.5 + norm * 200.0),
    sin(u_time * 3.0 - norm * 300.0)
  ) * u_chaos * instability;

  float sinPhi = sin(phi);
  vec3 pos = vec3(
    radius * sinPhi * cos(theta),
    radius * sinPhi * sin(theta),
    radius * cos(phi)
  ) + wobble;

  vec4 clip = u_viewProj * vec4(pos, 1.0);
  gl_Position = clip;

  float dist = max(clip.w, 1.0);

  /* Converged particles render larger as well as brighter, so the core
     reads as mass rather than just as a brighter patch of the same dust. */
  gl_PointSize = clamp((u_pointScale / dist) * (0.75 + 1.15 * progress), 1.0, 22.0);

  /* Colour travels from the outer hue to the core hue as it converges,
     with a pulse at the moment of arrival. */
  float hue = mix(u_hue.x, u_hue.y, progress);
  float saturation = 0.8 + 0.2 * progress;
  float corePulse = progress > 0.95 ? sin(u_time * 10.0) * 0.25 : 0.0;
  float lightness = clamp(0.18 + 0.62 * progress + corePulse, 0.0, 1.0);

  v_color = hsl2rgb(vec3(hue, saturation, lightness));

  /* Depth fade, standing in for the original scene fog. Particles far
     out on the intake shell stay dim so the core reads as the subject. */
  float fog = clamp(1.0 - (dist - 60.0) / 300.0, 0.04, 1.0);

  /* The camera orbits inside the intake shell, so particles regularly
     pass very close to it. Without this they project as huge, bright
     squares drifting across the copy. */
  float nearFade = smoothstep(12.0, 55.0, dist);

  /* Squared so the outer shell stays as faint dust and the energy is
     concentrated where the data lands. */
  v_alpha = fog * nearFade * u_brightness * (0.1 + 0.9 * progress * progress);
}`;

const FRAG = `#version 300 es
precision highp float;

in vec3  v_color;
in float v_alpha;

out vec4 fragColor;

void main() {
  /* Soft round sprite: a tight bright centre inside a wide falloff.
     Summed additively across overlapping particles, this is what
     produces the bloom without a post-processing pass. */
  float d = length(gl_PointCoord - 0.5);
  float mask = smoothstep(0.5, 0.0, d);
  mask *= mask;

  float energy = mask * v_alpha;

  /* Premultiplied. The alpha channel MUST carry the same mask as the
     colour: the canvas composites over the hero's obsidian, so writing
     a flat alpha here stamps an opaque square the size of the whole
     point sprite instead of a soft dot. */
  fragColor = vec4(v_color * energy, energy);
}`;

/* Orbit radius. The intake shell reaches 150, so the camera sits inside
   it — particles stream in past the viewer toward the core. */
const CAMERA_DISTANCE = 130;

/* ---- Minimal column-major mat4 helpers (replaces three's math) ---- */

function perspective(fovY, aspect, near, far) {
  const f = 1 / Math.tan(fovY / 2);
  const nf = 1 / (near - far);
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0,
  ]);
}

function lookAt(eye, center, up) {
  let zx = eye[0] - center[0];
  let zy = eye[1] - center[1];
  let zz = eye[2] - center[2];
  const zl = Math.hypot(zx, zy, zz) || 1;
  zx /= zl; zy /= zl; zz /= zl;

  let xx = up[1] * zz - up[2] * zy;
  let xy = up[2] * zx - up[0] * zz;
  let xz = up[0] * zy - up[1] * zx;
  const xl = Math.hypot(xx, xy, xz) || 1;
  xx /= xl; xy /= xl; xz /= xl;

  const yx = zy * xz - zz * xy;
  const yy = zz * xx - zx * xz;
  const yz = zx * xy - zy * xx;

  return new Float32Array([
    xx, yx, zx, 0,
    xy, yy, zy, 0,
    xz, yz, zz, 0,
    -(xx * eye[0] + xy * eye[1] + xz * eye[2]),
    -(yx * eye[0] + yy * eye[1] + yz * eye[2]),
    -(zx * eye[0] + zy * eye[1] + zz * eye[2]),
    1,
  ]);
}

function multiply(a, b) {
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      out[c * 4 + r] =
        a[r] * b[c * 4] +
        a[4 + r] * b[c * 4 + 1] +
        a[8 + r] * b[c * 4 + 2] +
        a[12 + r] * b[c * 4 + 3];
    }
  }
  return out;
}

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`hero-field shader: ${log}`);
  }
  return shader;
}

/** Particle budget scaled to the device — a phone GPU does not need
 *  20,000 points to read as a swarm. */
function defaultCount(width) {
  if (width < 640) { return 6000; }
  if (width < 1100) { return 12000; }
  return 20000;
}

export class HeroField extends HTMLElement {
  connectedCallback() {
    this.setAttribute("aria-hidden", "true");

    this._canvas = document.createElement("canvas");
    this.appendChild(this._canvas);

    const gl = this._canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      depth: false,
      powerPreference: "low-power",
      failIfMajorPerformanceCaveat: true,
    });

    /* No WebGL2 (or the driver flagged itself as slow) — leave the hero
       as flat obsidian rather than shipping a janky animation. */
    if (!gl) { return; }
    this._gl = gl;

    try {
      this._initGL();
    } catch {
      this._gl = null;
      this._canvas.remove();
      return;
    }

    this._reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    this._running = false;
    this._start = performance.now();

    this._onResize = () => this._resize();
    this._observer = new ResizeObserver(this._onResize);
    this._observer.observe(this);

    this._onVisibility = () => this._sync();
    document.addEventListener("visibilitychange", this._onVisibility);

    /* Stop entirely once the hero is scrolled past. */
    this._visible = true;
    this._io = new IntersectionObserver((entries) => {
      this._visible = entries[0].isIntersecting;
      this._sync();
    }, { threshold: 0 });
    this._io.observe(this);

    this._onMotionChange = () => this._sync();
    this._reducedMotion.addEventListener?.("change", this._onMotionChange);

    this._resize();
    this._sync();
  }

  disconnectedCallback() {
    this._stop();
    this._observer?.disconnect();
    this._io?.disconnect();
    document.removeEventListener("visibilitychange", this._onVisibility);
    this._reducedMotion?.removeEventListener?.("change", this._onMotionChange);

    /* Release the GL context rather than waiting for GC — browsers cap
       the number of live contexts per page. */
    this._gl?.getExtension("WEBGL_lose_context")?.loseContext();
    this._gl = null;
  }

  _num(attr, fallback) {
    const raw = Number.parseFloat(this.getAttribute(attr));
    return Number.isFinite(raw) ? raw : fallback;
  }

  _initGL() {
    const gl = this._gl;

    const program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`hero-field link: ${gl.getProgramInfoLog(program)}`);
    }
    gl.useProgram(program);
    this._program = program;

    this._count = Math.max(1, Math.round(
      this._num("count", defaultCount(window.innerWidth))
    ));

    /* The only attribute is the particle's own index — position and
       colour are derived from it in the shader. */
    const indices = new Float32Array(this._count);
    for (let i = 0; i < this._count; i++) { indices[i] = i; }

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, "a_index");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 1, gl.FLOAT, false, 0, 0);

    this._u = {
      time: gl.getUniformLocation(program, "u_time"),
      count: gl.getUniformLocation(program, "u_count"),
      speed: gl.getUniformLocation(program, "u_speed"),
      chaos: gl.getUniformLocation(program, "u_chaos"),
      coreSize: gl.getUniformLocation(program, "u_coreSize"),
      hue: gl.getUniformLocation(program, "u_hue"),
      viewProj: gl.getUniformLocation(program, "u_viewProj"),
      pointScale: gl.getUniformLocation(program, "u_pointScale"),
      brightness: gl.getUniformLocation(program, "u_brightness"),
    };

    gl.uniform1f(this._u.count, this._count);
    gl.uniform1f(this._u.speed, this._num("speed", 0.4));
    gl.uniform1f(this._u.chaos, this._num("chaos", 20));
    gl.uniform1f(this._u.coreSize, this._num("core-size", 14));
    gl.uniform2f(this._u.hue, this._num("hue-start", 0.58), this._num("hue-end", 0.40));
    /* Deliberately restrained: this sits behind body copy, so it reads
       as atmosphere rather than as the subject of the page. */
    gl.uniform1f(this._u.brightness, this._num("brightness", 1.15));

    /* Additive, depth-free — every particle contributes light. */
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.clearColor(0, 0, 0, 0);
  }

  _resize() {
    if (!this._gl) { return; }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(this.clientWidth * dpr));
    const h = Math.max(1, Math.round(this.clientHeight * dpr));
    if (w === this._w && h === this._h) { return; }

    this._w = w;
    this._h = h;
    this._canvas.width = w;
    this._canvas.height = h;
    this._gl.viewport(0, 0, w, h);

    const fov = (60 * Math.PI) / 180;
    const aspect = w / h;
    this._proj = perspective(fov, aspect, 0.1, 1000);
    this._gl.uniform1f(this._u.pointScale, 620 * dpr);

    /* Push the swarm out of the copy's column on wide viewports so the
       core lands in the clear part of the scrim. Expressed as a fraction
       of the frustum half-width at the camera's distance, so the framing
       holds at every resolution. Below the breakpoint the copy spans the
       full width and the field becomes an even background texture. */
    const halfWidth = CAMERA_DISTANCE * Math.tan(fov / 2) * aspect;
    this._offsetX = this.clientWidth >= 1200 ? halfWidth * 0.46 : 0;

    if (!this._running) { this._draw(0); }
  }

  /* Single source of truth for whether the loop should be running. */
  _sync() {
    const shouldRun =
      this._visible &&
      !document.hidden &&
      !this._reducedMotion.matches;

    if (shouldRun) {
      this._run();
    } else {
      this._stop();
      /* Reduced motion still gets one composed frame — the imagery
         without the movement. */
      if (this._reducedMotion.matches) { this._draw(0); }
    }
  }

  _run() {
    if (this._running || !this._gl) { return; }
    this._running = true;
    const loop = () => {
      if (!this._running) { return; }
      this._draw((performance.now() - this._start) / 1000);
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }

  _stop() {
    this._running = false;
    if (this._raf) { cancelAnimationFrame(this._raf); }
    this._raf = null;
  }

  _draw(time) {
    const gl = this._gl;
    if (!gl || !this._proj) { return; }

    /* Slow orbit, standing in for OrbitControls autoRotate. */
    const angle = time * 0.12;
    const eye = [
      Math.sin(angle) * CAMERA_DISTANCE,
      14,
      Math.cos(angle) * CAMERA_DISTANCE,
    ];
    const view = lookAt(eye, [0, 0, 0], [0, 1, 0]);

    /* Shift in eye space, after the orbit — a world-space offset would
       swing around with the camera instead of holding its framing. */
    view[12] += this._offsetX;

    gl.uniformMatrix4fv(this._u.viewProj, false, multiply(this._proj, view));
    gl.uniform1f(this._u.time, time);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, this._count);
  }
}
