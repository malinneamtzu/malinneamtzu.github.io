# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

## Working with Mălin

Mălin (repo owner, type and graphic designer, Type and Media graduate) is a relative beginner at web development. In every session:

- **Explain as you go.** Before or after each change, say in plain language what changed, why, and which web concept it involves (e.g. "this is a CSS media query: it applies styles only above a screen width"). Define jargon the first time it appears.
- **Teach, don't just fix.** When a bug comes up, explain the cause and how to spot it next time (e.g. which DevTools panel shows it).
- **Keep changes small** so they can be followed in `git diff`, and **show the result**: run the site locally and check it (desktop and a ~390px phone width) before calling something done.
- **Never invent content.** Project texts, dates and clients come from Mălin, the portfolio PDF or Mălin's Instagram. When unsure, write it in the project's `notes` field (see below) and ask.
- **Mălin edits content through the dashboard (`/admin`)** and those edits arrive as commits on the deploy branch. Always `git pull` before starting work, and keep content in the JSON files the dashboard edits (never move it back into code), so both ways keep working.
- **Ask before anything goes live** (pushing to `main`, changing Netlify or domain settings).
- Mălin's pronouns are not recorded here; write about Mălin in the first person on the site, and use "they" or the name elsewhere unless told otherwise.

## Overview

Portfolio website of Mălin Neamțu, live at https://malinneamtzu.com. Built with **Eleventy 3** (Nunjucks templates) into plain static HTML, deployed on **Netlify**. No tests or linter.

Design: a masonry grid of project covers (layout inspired by eloileco.xyz) styled after Mălin's 2026 portfolio PDF: black pages, light grey text, 1pt outlines around images, narrow margins, small letter-spaced capitals, magenta links and the "— " dash before titles. Titles (`.seg`: the name, project titles, timeline years) are always **Segmentor-03**, Mălin's own variable typeface, and react to the mouse (desktop) or phone tilt (mobile). All other text is Segmentor-03 too unless another text font is uploaded in the dashboard (Theme). Colours and stroke also come from the dashboard. The Info page keeps the background video from the original 2026 splash site, dimmed behind the bio and CV.

## Commands

```sh
npm install      # once, after cloning
npm start        # dev server with live reload at http://localhost:8080
npm run build    # outputs the finished site to _site/ (gitignored)
npm run cms      # local dashboard backend; with npm start running, open http://localhost:8080/admin/
```

## Deploying (Netlify, same workflow as the TM2425 site)

- Netlify is connected to the GitHub repo `malinneamtzu/malinneamtzu.github.io`. On every push it runs `npm run build` and publishes `_site/` (settings in `netlify.toml`).
- Pushes to `main` go to the live site. Other branches get a deploy preview URL. Work on a branch, check the preview, then merge.
- `netlify.toml` also holds redirects (old `/links.html` → `/info/`) and cache headers.
- The domain malinneamtzu.com: until the DNS is switched to Netlify, it is still served by GitHub Pages from the old `main` branch (plain HTML at the repo root). GitHub Pages does not run the Eleventy build, so **do not merge `portfolio` into `main` before the domain points to Netlify**, or the live site breaks.

## Architecture

- **Content lives in JSON files** (edited by the dashboard or by hand):
  - **`src/content/projects/<id>.json`**: one file per project; the file name is the id and URL (`/work/<id>/`). Fields are documented at the top of `src/_data/projects.js`, which loads them, reads each cover's ratio (for the masonry), works out the `years` a project spans (for the timeline) and sorts newest first by `date` ("YYYY" or "YYYY-MM"; a bare year counts as December, i.e. ongoing work; undated last). `cover` and each `gallery[].image` are paths like `/assets/<id>/x.jpg` (files in `src/assets/`); dashboard uploads go to `src/assets/uploads/`. `notes` is a private to-do note (never rendered); search for `"notes": "` with text to see what still needs Mălin's confirmation. `source` records where content came from.
  - **`src/_data/site.json`**: name, tagline, location, email, description, bio (Info page), external links and social links.
  - **`src/_data/cv.json`**: `sections[]` of `{ title, items[]: { when, what } }`: the CV on the Info page, first copied from `~/Desktop/work/Malin/CV-Portofolio/2026/CV/PDF/CV-MalinNeamtu-2026.pdf`. The phone number is deliberately left off the website.
  - **`src/_data/links.json`**: `links[]` of `{ name, url }` for automatic links (see below).
  - **`src/_data/theme.json`**: colours (`background`, `text`, `muted`, `lines`, `stroke`, `highlight`), `strokeWidth` in pt, optional `textFont` (path to an uploaded font in `src/fonts/uploads/`). `base.njk` writes these into an inline `<style>` that overrides the defaults in `style.css`.
- **`src/_includes/base.njk`**: the one layout: header (name + bar + nav), `<main>`, footer, meta tags for link previews (Open Graph image is `src/media/og-image.jpg`).
- **Pages and navigation** (nav: Work · Timeline · Info):
  - **`src/index.njk`** (`/`): the splash. Every project cover floats in 3D: a sphere that turns with the mouse/tilt, which opens into a field you fly through when scrolling/dragging/swiping. Click a cover to open the project. Inspired by two cables.gl patches Mălin picked (an image sphere and an image flythrough), but built with plain CSS 3D transforms in `script.js`, no WebGL library.
  - **`src/work.njk`** (`/work/`): the masonry grid of all projects.
  - **`src/project.njk`**: paginates over `projects` to make `/work/<id>/`.
  - **`src/timeline.njk`** (`/timeline/`): one row per year, newest first, with sticky year buttons on top. A project spanning years (e.g. `2020–present`) appears in each year; undated ones under "Undated". Sections have ids `y2025` etc.
  - **`src/info.njk`**: bio, contact, links, CV, background video. **`src/404.njk`**.
- **Year buttons**: every year on the site (cards, project meta, CV) is a link to `/timeline/#y<year>`, made by the `yearLinks` filter.
- **Automatic links**: the `autolink` filter turns every name listed in **`src/_data/links.json`** into a link (CV entries, project clients and intros). Add a name + URL there and it becomes clickable everywhere. Only add URLs that were checked to open the right page. Known unlinked so far (no confirmed page): NewOneAwards, Local Design Awards, Most Beautiful Books in Romania, HBO Max/Netflix titles, The Come N Go.
- **`eleventy.config.js`**: filters `yearLinks`, `autolink`, `byYear` (timeline grouping), `neighbour` (prev/next). The image plugin turns every `<img>` into a `<picture>` with 600/1200/2000px WebP + JPEG in `_site/img/`, which is what pages use. `src/assets/` is also copied as-is (so the dashboard can show the originals), but no page links to the originals. Add `eleventy:ignore` to an `<img>` to skip the plugin. Also the `year` global.
- **`src/script.js`**:
  1. Segmentor axes: screen split into four zones; up → `AAAA`, down → `BBBB`, left → `CCCC`, right → `DDDD` (0–1000), written to CSS variables `--aaaa`…`--dddd` on `<html>`. Any element with class `.seg` follows them. Desktop: `mousemove`. Android: `deviceorientation` directly. iOS needs a tap for permission: a small "Tilt to play" button in the nav; after it is granted once, later pages re-enable on the first touch (`sessionStorage.motionEnabled`).
  2. `fitName()` scales the header name to fill the width.
  3. Masonry: cards are dealt into the shortest of 2/3/4 columns (by window width) using `data-ratio`, so date order reads left to right. Without JS the grid is a plain CSS grid.
  4. Info video: mobile vs desktop file; skipped under `prefers-reduced-motion`.
  5. Splash (`initSplash`): Fibonacci-sphere positions vs seeded random field positions, blended by `progress` (0 sphere, 1 field, >1 flying; wheel/drag/swipe change it). Drags do not count as clicks. Tune `R` (sphere radius), `DEPTH` (field depth), `MAX` (how far you can fly) and `--splash-size` (cover width, CSS).
- **`src/style.css`**: single stylesheet, tokens in `:root` (`--bg`, `--fg`, `--muted`, `--line`, `--stroke`, `--stroke-color`, `--accent`, `--font` (titles, always Segmentor), `--font-text` (everything else), `--pad`, `--gap`, `--tracking`, text sizes). Colour/stroke/text-font tokens are overridden from `theme.json`. Labels (nav, card titles, meta, CV headings, footer) share one rule: small, uppercase, `letter-spacing: var(--tracking)`. To make *all* text move with the mouse, add `.seg` to `<body>` in `base.njk`.
- **Image outlines**: `strokeWidth` pt × 1.333 = CSS px (1pt = 1.333px), colour `--stroke-color`.
- **Font**: `src/fonts/Segmentor.woff2` is what the site loads (converted from `Segmentor-03.ttf`, which is kept as the source and not deployed). Segmentor has 9 axes (`AAAA`–`IIII`, 0–1000); the site uses the first four. To update the font, convert the new TTF with fontTools: `f = TTFont(path); f.flavor = "woff2"; f.save("src/fonts/Segmentor.woff2")`. It has no `Ţ/ţ` (cedilla) and no arrows (← → ↗); use `Ț/ț` (comma below) and « ». Check other special characters before using them (e.g. render a test), since missing glyphs silently fall back to another font.

## Dashboard (/admin)

Decap CMS 3 (`src/admin/index.html` loads it from unpkg, pinned version; `src/admin/config.yml` defines every editable field). Sections: **Projects** (folder collection over `src/content/projects/`), **Site** (Info page & site texts, CV, Words → links), **Appearance** (Theme, with a live preview template registered in `index.html`).

- **Live site**: backend `github`, repo `malinneamtzu/malinneamtzu.github.io`, `branch: portfolio` (switch to `main` after the merge). Sign-in goes through Netlify's built-in GitHub OAuth provider (`https://api.netlify.com/auth`), so only GitHub accounts with write access to the repo can log in and save. One-time setup: a GitHub OAuth App (callback `https://api.netlify.com/auth/done`) whose client ID/secret are added in Netlify → Site configuration → Access & security → OAuth → GitHub. Each Publish is a commit; Netlify rebuilds.
- **Locally**: `npm start` + `npm run cms` (decap-server on :8081, `local_backend: true`), open `/admin/`, click Login (no password locally). Edits write straight to the files.
- In `config.yml`, quote any label containing a comma (`label: "a, b"`); inside `{ … }` an unquoted comma breaks the YAML and the fields silently show up empty.
- A font uploaded in Theme only shows in the dashboard preview after Publish (the preview loads it from the site).
- When adding a field to the JSON, add it to `config.yml` too, or the dashboard will not show it.

## Adding or editing a project

Preferably through the dashboard. By hand: create `src/content/projects/<id>.json` (copy an existing one), put images in `src/assets/<id>/` (keep them under ~2500px wide), list them in `cover` and `gallery`, then `npm start` and check the grid, the project page and the timeline.

## Content sources

- **Portfolio PDF**: `~/Desktop/work/2026/Portfolio-CV-2026/Portfolio/PDF/MalinNeamtzu-Portofolio-2026-25mb.pdf` (102 slides, 1920×1080). Current images were exported from it: covers are the original embedded images, galleries are full slides rendered at 2400px. Which slides belong to which project is listed in `scripts/export_from_pdf.py`; re-run it to re-export.
- **Instagram** `@malin.neamtzu`: needs a logged-in browser (the public API refuses without login and rate-limits quickly). What worked: Claude in Chrome on Mălin's logged-in profile, scroll the grid and read each tile's link + `alt` text (the alt is the caption); the post date can be decoded from the shortcode (`id >> 23` + 1314220021721 ms). Full-size images: open each post, click through the carousel and collect the `<img>` sources. Instagram's CSP blocks sending data to localhost via fetch/iframe/popup, but navigating the tab to `http://127.0.0.1:<port>/#<data>` works. Mark entries `"source": "instagram"` and keep the post link in `links`. Many posts in the grid are collaborations owned by other accounts (Type and Media, Page Not Found, Zefir7…); those fed the CV, not projects.

## Gotchas

- Image paths are case-sensitive on Netlify (Linux) even though macOS is not.
- `intro` paragraphs and CV `what` are rendered as HTML (`| safe`); escape a literal `<` as `&lt;`.
- In Nunjucks, filters bind tighter than `+`: write `(a + 1) | filter`.
- The name in the header uses `overflow: hidden`; the extra bottom padding keeps the comma of `ț` visible. Check it after changing `line-height`.
