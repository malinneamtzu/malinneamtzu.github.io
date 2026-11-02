// ===========================================================================
// script.js: everything that moves.
//   1. Segmentor follows the mouse (desktop) or the tilt of the phone.
//   2. The name in the header is sized to fill the full width.
//   3. The home grid is arranged into masonry columns.
//   4. The Info page picks the right background video.
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

// --- Start ------------------------------------------------------------------------
layoutGrid();
fitName();
document.fonts.ready.then(fitName);
window.addEventListener("resize", () => { layoutGrid(); fitName(); });
