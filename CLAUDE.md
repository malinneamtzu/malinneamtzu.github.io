# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

## Working with Mălin

Mălin (repo owner, type and graphic designer, Type and Media graduate) is a relative beginner at web development. In every session:

- **Explain as you go.** Before or after each change, say in plain language what changed, why, and which web concept it involves (e.g. "this is a CSS media query: it applies styles only above a screen width"). Define jargon the first time it appears.
- **Teach, don't just fix.** When a bug comes up, explain the cause and how to spot it next time (e.g. which DevTools panel shows it).
- **Keep changes small** so they can be followed in `git diff`, and **show the result**: run the site locally and check it (desktop and a ~390px phone width) before calling something done.
- **Never invent content.** Project texts, dates and clients come from Mălin, the portfolio PDF or Mălin's Instagram. When unsure, put a `check:` note on the project (see below) and ask.
- **Ask before anything goes live** (pushing to `main`, changing Netlify or domain settings).
- Mălin's pronouns are not recorded here; write about Mălin in the first person on the site, and use "they" or the name elsewhere unless told otherwise.

## Overview

Portfolio website of Mălin Neamțu, live at https://malinneamtzu.com. Built with **Eleventy 3** (Nunjucks templates) into plain static HTML, deployed on **Netlify**. No tests or linter.

Design: a masonry grid of project covers (layout inspired by eloileco.xyz) styled after Mălin's 2026 portfolio PDF: black pages, light grey text, thin 1px outlines around images, narrow margins, small letter-spaced capitals, magenta (`--accent`) links and the "— " dash before titles. **Every letter on the site is Segmentor-03**, Mălin's own variable typeface. Text with class `.seg` (the name, project titles, the Info bio) reacts to the mouse (desktop) or phone tilt (mobile); all other text stays at the default shape so it remains readable. The Info page keeps the background video from the original 2026 splash site, dimmed behind the bio and CV.

## Commands

```sh
npm install      # once, after cloning
npm start        # dev server with live reload at http://localhost:8080
npm run build    # outputs the finished site to _site/ (gitignored)
```

## Deploying (Netlify, same workflow as the TM2425 site)

- Netlify is connected to the GitHub repo `malinneamtzu/malinneamtzu.github.io`. On every push it runs `npm run build` and publishes `_site/` (settings in `netlify.toml`).
- Pushes to `main` go to the live site. Other branches get a deploy preview URL. Work on a branch, check the preview, then merge.
- `netlify.toml` also holds redirects (old `/links.html` → `/info/`) and cache headers.
- The domain malinneamtzu.com: until the DNS is switched to Netlify, it is still served by GitHub Pages from the old `main` branch (plain HTML at the repo root). GitHub Pages does not run the Eleventy build, so **do not merge `portfolio` into `main` before the domain points to Netlify**, or the live site breaks.

## Architecture

- **`src/_data/projects.js`**: the single list of all projects (field docs at the top of the file). Order is automatic: newest first by `date` ("YYYY" or "YYYY-MM"; a bare year counts as December, i.e. ongoing work). Undated entries go last. Images are found automatically from `src/assets/<id>/`: `cover.jpg` is the card, every other image is the gallery in filename order. Each cover's height/width ratio is read at build time for the masonry.
  - `check:` on a project is a private to-do note (never rendered). Search for `check:` to see what still needs Mălin's confirmation.
  - `source:` records where the content came from (`pdf` or `instagram`).
- **`src/_data/site.js`**: name, tagline, email, bio (Info page), external links and social links.
- **`src/_data/cv.js`**: the CV on the Info page (Awards, Education, Experience, Talks & teaching, Exhibitions, Press, Workshops attended), copied from `~/Desktop/work/Malin/CV-Portofolio/2026/CV/PDF/CV-MalinNeamtu-2026.pdf`. The phone number is deliberately left off the website. When the CV PDF changes, update this file to match.
- **`src/_includes/base.njk`**: the one layout: header (name + bar + nav), `<main>`, footer, meta tags for link previews (Open Graph image is `src/media/og-image.jpg`).
- **Pages and navigation** (nav: Work · Timeline · Info):
  - **`src/index.njk`** (`/`): the splash. Every project cover floats in 3D: a sphere that turns with the mouse/tilt, which opens into a field you fly through when scrolling/dragging/swiping. Click a cover to open the project. Inspired by two cables.gl patches Mălin picked (an image sphere and an image flythrough), but built with plain CSS 3D transforms in `script.js`, no WebGL library.
  - **`src/work.njk`** (`/work/`): the masonry grid of all projects.
  - **`src/project.njk`**: paginates over `projects` to make `/work/<id>/`.
  - **`src/timeline.njk`** (`/timeline/`): one row per year, newest first, with sticky year buttons on top. A project spanning years (e.g. `2020–present`) appears in each year; undated ones under "Undated". Sections have ids `y2025` etc.
  - **`src/info.njk`**: bio, contact, links, CV, background video. **`src/404.njk`**.
- **Year buttons**: every year on the site (cards, project meta, CV) is a link to `/timeline/#y<year>`, made by the `yearLinks` filter.
- **Automatic links**: the `autolink` filter turns every name listed in **`src/_data/links.js`** into a link (CV entries, project clients and intros). Add a name + URL there and it becomes clickable everywhere. Only add URLs that were checked to open the right page. Known unlinked so far (no confirmed page): NewOneAwards, Local Design Awards, Most Beautiful Books in Romania, HBO Max/Netflix titles, The Come N Go.
- **`eleventy.config.js`**: filters `yearLinks`, `autolink`, `byYear` (timeline grouping), `neighbour` (prev/next). The image plugin turns every `<img>` into a `<picture>` with 600/1200/2000px WebP + JPEG in `_site/img/`, so `src/assets/` is never copied as-is. Add `eleventy:ignore` to an `<img>` to skip it. Also: the `neighbour` filter (prev/next project) and the `year` global.
- **`src/script.js`**:
  1. Segmentor axes: screen split into four zones; up → `AAAA`, down → `BBBB`, left → `CCCC`, right → `DDDD` (0–1000), written to CSS variables `--aaaa`…`--dddd` on `<html>`. Any element with class `.seg` follows them. Desktop: `mousemove`. Android: `deviceorientation` directly. iOS needs a tap for permission: a small "Tilt to play" button in the nav; after it is granted once, later pages re-enable on the first touch (`sessionStorage.motionEnabled`).
  2. `fitName()` scales the header name to fill the width.
  3. Masonry: cards are dealt into the shortest of 2/3/4 columns (by window width) using `data-ratio`, so date order reads left to right. Without JS the grid is a plain CSS grid.
  4. Info video: mobile vs desktop file; skipped under `prefers-reduced-motion`.
  5. Splash (`initSplash`): Fibonacci-sphere positions vs seeded random field positions, blended by `progress` (0 sphere, 1 field, >1 flying; wheel/drag/swipe change it). Drags do not count as clicks. Tune `R` (sphere radius), `DEPTH` (field depth), `MAX` (how far you can fly) and `--splash-size` (cover width, CSS).
- **`src/style.css`**: single stylesheet, tokens in `:root` (`--bg`, `--fg`, `--muted`, `--line`, `--accent`, `--pad`, `--gap`, `--tracking`, text sizes). Labels (nav, card titles, meta, CV headings, footer) share one rule: small, uppercase, `letter-spacing: var(--tracking)`. To make *all* text move with the mouse, add `.seg` to `<body>` in `base.njk`.
- **Image outlines** are 1pt (`--stroke: 1.333px`, since 1pt = 1.333 CSS px), colour `--stroke-color`.
- **Font**: `src/fonts/Segmentor.woff2` is what the site loads (converted from `Segmentor-03.ttf`, which is kept as the source and not deployed). Segmentor has 9 axes (`AAAA`–`IIII`, 0–1000); the site uses the first four. To update the font, convert the new TTF with fontTools: `f = TTFont(path); f.flavor = "woff2"; f.save("src/fonts/Segmentor.woff2")`. It has no `Ţ/ţ` (cedilla) and no arrows (← → ↗); use `Ț/ț` (comma below) and « ». Check other special characters before using them (e.g. render a test), since missing glyphs silently fall back to another font.

## Adding or editing a project

1. Make a folder `src/assets/<id>/` with `cover.jpg` (any ratio; portrait works best in the grid) and gallery images named `<id>-01.jpg`, `<id>-02.jpg`, … Keep each image under ~2500px wide.
2. Add an entry to `src/_data/projects.js` with at least `id`, `title`, `date`, `year`, `tags`, `intro`. No template changes needed.
3. `npm start` and check both the grid and the project page.

## Content sources

- **Portfolio PDF**: `~/Desktop/work/2026/Portfolio-CV-2026/Portfolio/PDF/MalinNeamtzu-Portofolio-2026-25mb.pdf` (102 slides, 1920×1080). Current images were exported from it: covers are the original embedded images, galleries are full slides rendered at 2400px. Which slides belong to which project is listed in `scripts/export_from_pdf.py`; re-run it to re-export.
- **Instagram** `@malin.neamtzu`: needs a logged-in browser (the public API refuses without login and rate-limits quickly). What worked: Claude in Chrome on Mălin's logged-in profile, scroll the grid and read each tile's link + `alt` text (the alt is the caption); the post date can be decoded from the shortcode (`id >> 23` + 1314220021721 ms). Full-size images: open each post, click through the carousel and collect the `<img>` sources. Instagram's CSP blocks sending data to localhost via fetch/iframe/popup, but navigating the tab to `http://127.0.0.1:<port>/#<data>` works. Mark entries `source: "instagram"` and keep the post link in `links`. Many posts in the grid are collaborations owned by other accounts (Type and Media, Page Not Found, Zefir7…); those fed the CV, not projects.

## Gotchas

- Image paths are case-sensitive on Netlify (Linux) even though macOS is not.
- `intro` paragraphs are rendered as HTML (`| safe`); escape a literal `<` as `&lt;`.
- In Nunjucks, filters bind tighter than `+`: write `(a + 1) | filter`.
- The name in the header uses `overflow: hidden`; the extra bottom padding keeps the comma of `ț` visible. Check it after changing `line-height`.
