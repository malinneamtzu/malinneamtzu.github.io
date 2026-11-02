// ===========================================================================
// script.js: everything that moves.
//   1. Segmentor follows the mouse (desktop) or the tilt of the phone.
//   2. The name in the header is sized to fill the full width.
//   3. The home grid is arranged into masonry columns.
//   4. The Info page picks the right background video.
//   5. The splash page: project covers floating in 3D.
// ===========================================================================

const root = document.documentElement;
const isTouch = window.matchMedia("(pointer: coarse)").matches;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// --- 1. Segmentor axes ------------------------------------------------------
// The screen is split into four areas. Moving up drives AAAA, down BBBB,
// left CCCC, right DDDD. The further from the centre, the stronger.
const AXIS_MAX = 1000;

function updateFont(x, y) {
  // x and y go from 0 (left/top) to 1 (right/bottom)
  const distX = Math.abs(x - 0.5) * 2;
  const distY = Math.abs(y - 0.5) * 2;
  root.style.setProperty("--aaaa", y < 0.5 ? (distY * AXIS_MAX).toFixed(1) : 0);
  root.style.setProperty("--bbbb", y >= 0.5 ? (distY * AXIS_MAX).toFixed(1) : 0);
  root.style.setProperty("--cccc", x < 0.5 ? (distX * AXIS_MAX).toFixed(1) : 0);
  root.style.setProperty("--dddd", x >= 0.5 ? (distX * AXIS_MAX).toFixed(1) : 0);
}

// requestAnimationFrame: update at most once per screen refresh, however
// many mouse or sensor events arrive in between.
let pending = null;
function queueFont(x, y) {
  if (!pending) requestAnimationFrame(() => { updateFont(...pending); pending = null; });
  pending = [x, y];
}

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);

function onOrientation(e) {
  // gamma = left/right tilt, beta = front/back tilt, in degrees
  queueFont(clamp01((e.gamma || 0) / 60 + 0.5), clamp01((e.beta || 0) / 60 + 0.5));
}

if (!isTouch) {
  window.addEventListener("mousemove", (e) =>
    queueFont(e.clientX / window.innerWidth, e.clientY / window.innerHeight)
  );
} else if (typeof DeviceOrientationEvent !== "undefined") {
  const needsPermission = typeof DeviceOrientationEvent.requestPermission === "function";

  if (!needsPermission) {
    // Android: the sensor just works.
    window.addEventListener("deviceorientation", onOrientation);
  } else {
    // iPhone/iPad: Apple only allows the sensor after a tap. The site stays
    // fully usable; a small "Tilt to play" button asks once, and on later
    // pages the first touch anywhere quietly re-enables it.
    const btn = document.querySelector(".motion-btn");
    const enable = async () => {
      try {
        if ((await DeviceOrientationEvent.requestPermission()) === "granted") {
          window.addEventListener("deviceorientation", onOrientation);
          sessionStorage.setItem("motionEnabled", "1");
          if (btn) btn.hidden = true;
        }
      } catch (err) { /* not called from a tap; ignore */ }
    };
    if (sessionStorage.getItem("motionEnabled")) {
      window.addEventListener("touchend", enable, { once: true });
    } else if (btn) {
      btn.hidden = false;
      btn.addEventListener("click", enable);
    }
  }
}

// --- 2. Fit the name to the width ---------------------------------------------
// Measures the name at the default shape (all axes 0) and scales the font
// size so it fills the header. Runs again when the window is resized.
const nameEl = document.querySelector(".site-name");

function fitName() {
  if (!nameEl) return;
  const probe = nameEl.cloneNode(true);
  Object.assign(probe.style, {
    position: "absolute", visibility: "hidden", width: "auto",
    fontSize: "100px", fontVariationSettings: "normal",
  });
  document.body.appendChild(probe);
  const textWidth = probe.scrollWidth;
  probe.remove();
  const available = nameEl.parentElement.clientWidth -
    parseFloat(getComputedStyle(nameEl.parentElement).paddingLeft) * 2;
  // 0.97 leaves room for the letters to grow wider while they move
  nameEl.style.fontSize = (100 * available * 0.97) / textWidth + "px";
}

// --- 3. Masonry grid ------------------------------------------------------------
// Cards are dealt one by one into whichever column is currently shortest, so
// the order (newest first) still reads left to right, top to bottom. Heights
// come from each cover's ratio (data-ratio), so this works before images load.
const grid = document.querySelector("[data-masonry]");
const cards = grid ? [...grid.children] : [];
let currentCols = 0;

function columnCount() {
  const w = window.innerWidth;
  return w >= 1200 ? 4 : w >= 800 ? 3 : 2;
}

function layoutGrid() {
  if (!grid) return;
  const n = columnCount();
  if (n === currentCols) return;
  currentCols = n;

  const cols = Array.from({ length: n }, () => {
    const c = document.createElement("div");
    c.className = "grid-col";
    return c;
  });
  const heights = new Array(n).fill(0);
  for (const card of cards) {
    const i = heights.indexOf(Math.min(...heights));
    cols[i].appendChild(card);
    // ratio + a little extra for the caption under the image
    heights[i] += (parseFloat(card.dataset.ratio) || 1) + 0.12;
  }
  grid.replaceChildren(...cols);
  grid.classList.add("is-masonry");
}

// --- 4. Info page video ---------------------------------------------------------
const video = document.querySelector(".video-bg");
if (video) {
  if (isTouch) video.poster = video.dataset.posterMobile;
  if (!reducedMotion) {
    video.src = isTouch ? video.dataset.srcMobile : video.dataset.srcDesktop;
    video.play().catch(() => {});
  }
}

// --- 5. Splash ------------------------------------------------------------------
// Every cover is an <a> placed in 3D with CSS transforms (no WebGL needed).
// Two arrangements, blended by `progress`:
//   0   → a sphere (points spread evenly with the "Fibonacci sphere" recipe)
//   1   → an open field of images spread across the screen and into depth
//   > 1 → flying forward through the field (images loop round endlessly)
// Scrolling / dragging / swiping changes the target progress; the mouse or
// the phone's tilt turns the sphere.
const splash = document.querySelector("[data-splash]");
if (splash) initSplash(splash);

function initSplash(root) {
  const items = [...root.querySelectorAll(".splash-item")];
  const caption = root.querySelector(".splash-caption");
  const n = items.length;
  if (!n) return;
  root.classList.add("is-live");

  // Sphere: n points evenly over a ball of radius 1.
  const sphere = items.map((_, i) => {
    const y = 1 - ((i + 0.5) / n) * 2;
    const r = Math.sqrt(1 - y * y);
    const a = i * Math.PI * (3 - Math.sqrt(5)); // golden angle
    return [Math.cos(a) * r, y, Math.sin(a) * r];
  });

  // Field: fixed "random" spots (seeded, so it is the same on every visit).
  let seed = 11;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const field = items.map(() => [rand() * 2 - 1, rand() * 2 - 1, rand()]);
  const DEPTH = 3600; // how deep the field is, in px

  let W = 0, H = 0, R = 0;
  const resize = () => {
    W = window.innerWidth;
    H = window.innerHeight;
    R = Math.min(W, H) * (isTouch ? 0.42 : 0.36);
  };
  resize();
  window.addEventListener("resize", resize);

  // Interaction state. "target" values are where we want to be; the drawn
  // values ease towards them each frame, which makes everything glide.
  let rotX = 0, rotY = 0, aimX = 0, aimY = 0, spin = 0;
  let progress = 0, aim = 0;
  const MAX = 6; // how far you can fly
  const push = (d) => { aim = Math.min(MAX, Math.max(0, aim + d)); };

  // Turn: mouse position (desktop) or tilt (phone).
  window.addEventListener("mousemove", (e) => {
    aimY = (e.clientX / W - 0.5) * 1.8;
    aimX = -(e.clientY / H - 0.5) * 1.2;
  });
  window.addEventListener("deviceorientation", (e) => {
    aimY = Math.max(-1, Math.min(1, (e.gamma || 0) / 45)) * 1.4;
    aimX = -Math.max(-1, Math.min(1, ((e.beta || 0) - 45) / 45)) * 1.0;
  });

  // Fly: mouse wheel / trackpad.
  root.addEventListener("wheel", (e) => { e.preventDefault(); push(e.deltaY * 0.0012); }, { passive: false });

  // Fly: drag with mouse or finger. A drag is not a click, so a link under
  // the pointer does not open when you let go after dragging.
  let down = null, dragged = false;
  root.addEventListener("pointerdown", (e) => { down = { x: e.clientX, y: e.clientY }; dragged = false; });
  window.addEventListener("pointermove", (e) => {
    if (!down) return;
    const dx = e.clientX - down.x, dy = e.clientY - down.y;
    if (Math.abs(dx) + Math.abs(dy) > 6) dragged = true;
    push(-(dy + dx * 0.5) * 0.004);
    down = { x: e.clientX, y: e.clientY };
  });
  window.addEventListener("pointerup", () => { down = null; });
  items.forEach((a) => a.addEventListener("click", (e) => { if (dragged) e.preventDefault(); }));

  // Caption: title and year of the cover under the pointer (or in focus).
  const show = (a) => { caption.textContent = a ? `— ${a.dataset.title}${a.dataset.year ? "   " + a.dataset.year : ""}` : ""; };
  items.forEach((a) => {
    a.addEventListener("mouseenter", () => show(a));
    a.addEventListener("focus", () => show(a));
    a.addEventListener("mouseleave", () => show(null));
  });

  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  function frame() {
    progress += (aim - progress) * 0.07;
    rotX += (aimX - rotX) * 0.05;
    rotY += (aimY - rotY) * 0.05;
    const open = ease(Math.min(1, progress)); // 0 sphere … 1 field
    if (!reducedMotion) spin += 0.0025 * (1 - open);
    const travel = Math.max(0, progress - 1) * DEPTH;

    const cy = Math.cos(rotY + spin), sy = Math.sin(rotY + spin);
    const cx = Math.cos(rotX), sx = Math.sin(rotX);

    for (let i = 0; i < n; i++) {
      // sphere position, turned around the vertical then the horizontal axis
      let [x, y, z] = sphere[i];
      [x, z] = [x * cy - z * sy, x * sy + z * cy];
      [y, z] = [y * cx - z * sx, y * sx + z * cx];
      const s = [x * R, y * R, z * R];

      // field position, moving towards the viewer as you fly, looping round
      const fz = (((field[i][2] * DEPTH + travel) % DEPTH) + DEPTH) % DEPTH - DEPTH * 0.8;
      const f = [field[i][0] * W * 0.62, field[i][1] * H * 0.5, fz];

      const X = s[0] + (f[0] - s[0]) * open;
      const Y = s[1] + (f[1] - s[1]) * open;
      const Z = s[2] + (f[2] - s[2]) * open;

      // fade covers far away, and ones about to pass the viewer
      const fade = Z > 400 ? Math.max(0, 1 - (Z - 400) / 400) : Z < -DEPTH * 0.6 ? Math.max(0.15, 1 + (Z + DEPTH * 0.6) / 1200) : 1;
      const el = items[i];
      el.style.transform = `translate3d(${X.toFixed(1)}px, ${Y.toFixed(1)}px, ${Z.toFixed(1)}px)`;
      el.style.opacity = fade.toFixed(2);
      el.style.zIndex = String(Math.round(Z + 5000));
      el.style.pointerEvents = fade < 0.3 ? "none" : "";
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// --- Start ------------------------------------------------------------------------
layoutGrid();
fitName();
document.fonts.ready.then(fitName);
window.addEventListener("resize", () => { layoutGrid(); fitName(); });
