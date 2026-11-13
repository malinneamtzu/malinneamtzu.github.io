// ===========================================================================
// script.js: the few things that move.
//   1. Segmentor follows the mouse (desktop) or the tilt of the phone.
//      Only the big menu on the splash uses it (class .seg).
//   2. Splash: underline a menu link while a finger is on it; close the
//      Contact list when clicking elsewhere.
//   3. Projects list: the hovered row's cover fills the background.
//   4. Type page: each name fills the width; size and axis sliders, styles.
//   5. Intro: the menu runs through its shapes once per visit.
// ===========================================================================

const root = document.documentElement;
const isTouch = window.matchMedia("(pointer: coarse)").matches;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// --- 1. Segmentor axes ------------------------------------------------------
// The screen is split into four areas. Moving up drives AAAA, down BBBB,
// left CCCC, right DDDD. The further from the centre, the stronger.
const AXIS_MAX = 1000;
const hasSeg = !!document.querySelector(".seg");

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

if (hasSeg && !isTouch) {
  window.addEventListener("mousemove", (e) =>
    queueFont(e.clientX / window.innerWidth, e.clientY / window.innerHeight)
  );
} else if (hasSeg && typeof DeviceOrientationEvent !== "undefined") {
  const needsPermission = typeof DeviceOrientationEvent.requestPermission === "function";

  if (!needsPermission) {
    // Android: the sensor just works.
    window.addEventListener("deviceorientation", onOrientation);
  } else {
    // iPhone/iPad: Apple only allows the sensor after a tap. A small
    // "Tilt to play" button asks once; later visits re-enable it on the
    // first touch anywhere.
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

// --- 2. Tap underline on the splash menu ----------------------------------
// Phones have no hover, so the underline appears while the link is touched.
for (const a of document.querySelectorAll(".splash-menu a")) {
  a.addEventListener("touchstart", () => a.classList.add("is-tapped"), { passive: true });
  for (const ev of ["touchend", "touchcancel"])
    a.addEventListener(ev, () => setTimeout(() => a.classList.remove("is-tapped"), 400));
}
const contactMenu = document.querySelector(".contact-menu");
if (contactMenu) {
  document.addEventListener("click", (e) => {
    if (!contactMenu.contains(e.target)) contactMenu.open = false;
  });
}

// --- 3. Projects list: big cover behind the list ---------------------------
// Hovering (or tabbing to) a row shows that project's cover full-screen in
// the background; leaving the list fades back to black.
const indexBg = document.querySelector(".index-bg");
if (indexBg && !isTouch) {
  const covers = new Map([...indexBg.querySelectorAll("img")].map((img) => [img.dataset.for, img]));
  let active = null;
  const show = (id) => {
    const next = covers.get(id) || null;
    if (next === active) return;
    if (active) active.classList.remove("is-active");
    if (next) next.classList.add("is-active");
    active = next;
  };
  for (const row of document.querySelectorAll(".index-row")) {
    row.addEventListener("mouseenter", () => show(row.dataset.id));
    row.addEventListener("focus", () => show(row.dataset.id));
  }
  document.querySelector(".index").addEventListener("mouseleave", () => show(null));
}

// --- 4. Type tester ------------------------------------------------------------
const fitters = [];
// Each font row has a size slider, optional style buttons, and for variable
// fonts one slider per axis (read from data-axes, written by fonts.json).
for (const box of document.querySelectorAll("[data-tester]")) {
  const sample = box.querySelector(".tester-sample");
  const size = box.querySelector("[data-size]");
  const axesBox = box.querySelector("[data-axes-box]");

  // Default size: as big as fits the width on one line. Measured on an
  // invisible copy of the text at 100px, then scaled. Stops once you move
  // the size slider yourself.
  let userSized = false;
  const fit = async () => {
    if (userSized) return;
    const family = sample.style.fontFamily.split(",")[0].replace(/['"]/g, "");
    try { await document.fonts.load(`100px "${family}"`, sample.textContent); } catch (e) { /* measure anyway */ }
    const probe = document.createElement("span");
    probe.textContent = sample.textContent;
    Object.assign(probe.style, {
      position: "absolute", visibility: "hidden", whiteSpace: "nowrap", fontSize: "100px",
      fontFamily: sample.style.fontFamily, fontVariationSettings: sample.style.fontVariationSettings,
    });
    document.body.append(probe);
    const w = probe.getBoundingClientRect().width;
    probe.remove();
    if (!w) return;
    const px = Math.floor((100 * sample.clientWidth * 0.97) / w);
    sample.style.setProperty("--size", px + "px");
    size.max = Math.max(400, px);
    size.value = px;
  };
  fitters.push(fit);
  size.addEventListener("input", () => {
    userSized = true;
    sample.style.setProperty("--size", size.value + "px");
  });

  const buildAxes = (axes) => {
    axesBox.replaceChildren();
    const values = {};
    const apply = () => {
      sample.style.fontVariationSettings =
        Object.entries(values).map(([t, v]) => `"${t}" ${v}`).join(", ") || "normal";
    };
    for (const a of axes) {
      values[a.tag] = a.min;
      const label = document.createElement("label");
      const input = Object.assign(document.createElement("input"), {
        type: "range", min: a.min, max: a.max, step: "any", value: a.min,
      });
      input.addEventListener("input", () => { values[a.tag] = input.value; apply(); });
      label.append(a.tag, input);
      axesBox.append(label);
    }
    apply();
  };

  const useStyle = (family, axes) => {
    sample.style.fontFamily = `'${family}', var(--font)`;
    buildAxes(axes);
    fit();
  };
  useStyle(sample.dataset.family, JSON.parse(sample.dataset.axes || "[]"));

  for (const btn of box.querySelectorAll(".tester-styles button")) {
    btn.addEventListener("click", () => {
      box.querySelectorAll(".tester-styles button").forEach((b) => b.removeAttribute("aria-pressed"));
      btn.setAttribute("aria-pressed", "true");
      useStyle(btn.dataset.family, JSON.parse(btn.dataset.axes || "[]"));
    });
  }
}

// --- 5. Intro sweep -----------------------------------------------------------------
// First visit of the splash: the menu runs through the four Segmentor
// shapes once, then the mouse or tilt takes over.
function introSweep() {
  if (!hasSeg || reducedMotion || sessionStorage.getItem("introDone")) return;
  sessionStorage.setItem("introDone", "1");
  const DURATION = 1800, t0 = performance.now();
  let stopped = false;
  window.addEventListener("mousemove", () => { stopped = true; }, { once: true });
  const step = (now) => {
    if (stopped) return;
    const t = Math.min(1, (now - t0) / DURATION);
    const r = 0.5 * Math.sin(Math.PI * t);          // out and back to the centre
    const a = t * Math.PI * 2;                      // one turn round the screen
    updateFont(0.5 + Math.cos(a) * r, 0.5 + Math.sin(a) * r);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// --- Start ------------------------------------------------------------------------
introSweep();
window.addEventListener("resize", () => fitters.forEach((f) => f()));
