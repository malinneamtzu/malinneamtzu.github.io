# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

## Working with Mălin

Mălin (repo owner, type and graphic designer, Type and Media graduate) is a relative beginner at web development. In every session:

- **Explain as you go.** Before or after each change, say in plain language what changed, why, and which web concept it involves (e.g. "this is a CSS media query: it applies styles only above a screen width"). Define jargon the first time it appears.
- **Teach, don't just fix.** When a bug comes up, explain the cause and how to spot it next time (e.g. which DevTools panel shows it).
- **Keep changes small** so they can be followed in `git diff`, and **show the result**: run the site locally and check it (desktop and a ~390px phone width) before calling something done.
- **Never invent content.** Project texts, dates and clients come from Mălin, the portfolio PDF or Mălin's Instagram. When unsure, write it in the project's `notes` field (see below) and ask.
- **Mălin edits content through the dashboard (`/admin`)**, which runs only locally and writes the JSON files directly. Always `git pull` and check `git status` before starting work, and keep content in the JSON files the dashboard edits (never move it back into code), so both ways keep working.
- **Ask before anything goes live** (pushing to `main`, changing GitHub Pages or domain settings).
- Mălin's pronouns are not recorded here; write about Mălin in the first person on the site, and use "they" or the name elsewhere unless told otherwise.

## Overview

Portfolio website of Mălin Neamțu, live at https://malinneamtzu.com/wwwork/. Built with **Eleventy 3** (Nunjucks templates) into plain static HTML, deployed on **GitHub Pages** by a GitHub Actions workflow. No tests or linter.

Design (since 2026-11-12, "minimalist, sleek"): two colours only, black background and #fafafa (rgb 250,250,250) for text, lines and everything else (theme.json; no magenta, no image outlines). All text is Segmentor-03 at its default shape; **only the big name on the splash is variable** (`.seg`, follows mouse/tilt). Nav everywhere: Projects · Type · Contact. Earlier versions (masonry grid, 3D cover sphere, timeline page, Info video, magenta links) were removed in that redesign; see git history if something needs to come back.

## Commands

```sh
npm install      # once, after cloning
npm start        # dev server with live reload at http://localhost:8080
npm run build    # outputs the finished site to _site/ (gitignored)
npm run cms      # local dashboard backend; with npm start running, open http://localhost:8080/admin/
```

## Deploying (GitHub Pages under malinneamtzu.com/wwwork/)

- Repo: `malinneamtzu/wwwork` (private; branch `main`). Moved off Netlify on 2026-11-12 to stop using Netlify credits. The old repo `malinneamtzu.github.io` (local remote `github-io`, local branch `old-site-main`) still serves the root malinneamtzu.com with the January 2026 splash page and owns the custom domain; every other Pages repo of the account appears at `malinneamtzu.com/<repo>/`, which is why this one is at `/wwwork/` (same as `ioana-georgescu-website`).
- `.github/workflows/deploy.yml` runs `npm ci && npm run build` on every push to `main` and publishes `_site/` (Pages source = "GitHub Actions"). Progress and errors: the repo's Actions tab. Resized images are cached between runs.
- **Path prefix**: `npm run build` uses `pathPrefix: "/wwwork/"`; `npm start` (`ELEVENTY_RUN_MODE=serve`) uses `/`, so local dev and the dashboard stay at the root of localhost:8080. Templates keep writing root links (`/work/`); `HtmlBasePlugin` adds the prefix to href/src/srcset/poster in the built HTML. It does **not** touch `data-*` attributes, inline `<style>` or JS strings: use the `| url` filter there (see `info.njk` video, theme font in `base.njk`). `style.css` uses relative `url("fonts/…")`. `site.json` `url` includes `/wwwork` (used for og:url/og:image/canonical).
- The live build leaves out `src/admin` and `src/assets` (originals); they are copied only in serve mode.
- To test a production build locally: `npm run build`, then serve a folder containing a `wwwork` symlink to `_site` (e.g. `python3 -m http.server`) and open `/wwwork/`. Stop `npm start` first: both write `_site/`.
- No redirects or custom headers (GitHub Pages has none); the old `netlify.toml` was removed. The Netlify site, if still connected to the old repo, no longer receives pushes; deleting it is Mălin's call.

## Architecture

- **Content lives in JSON files** (edited by the dashboard or by hand):
  - **`src/content/projects/<id>.json`**: one file per project; the file name is the id and URL (`/work/<id>/`). Fields are documented at the top of `src/_data/projects.js`, which loads them, reads each cover's ratio, works out the `years` a project spans and sorts newest first by `date` ("YYYY" or "YYYY-MM"; a bare year counts as December, i.e. ongoing work; undated last). `cover` and each `gallery[].image` are paths like `/assets/<id>/x.jpg` (files in `src/assets/`); dashboard uploads go to `src/assets/uploads/`. `notes` is a private to-do note (never rendered); search for `"notes": "` with text to see what still needs Mălin's confirmation. `source` records where content came from.
  - **`src/_data/site.json`**: name, tagline, location, email, description, bio (Info page, Markdown string), external links and social links.
  - **`src/_data/cv.json`**: `sections[]` of `{ title, items[]: { when, what } }`: the CV on the Info page, first copied from `~/Desktop/work/Malin/CV-Portofolio/2026/CV/PDF/CV-MalinNeamtu-2026.pdf`. The phone number is deliberately left off the website.
  - **`src/_data/theme.json`**: colours (`background`, `text`, `muted`, `lines`, `stroke`, `highlight`), `strokeWidth` in pt, optional `textFont` (path to an uploaded font in `src/fonts/uploads/`). `base.njk` writes these into an inline `<style>` that overrides the defaults in `style.css`.
- **`src/_includes/base.njk`**: the one layout: header (name + bar + nav), `<main>`, footer, meta tags for link previews (Open Graph image is `src/media/og-image.jpg`).
- **Pages and navigation** (nav: Projects · Type · Contact, defined once in `base.njk`):
  - **`src/index.njk`** (`/`): splash, only the big variable name (`.splash-name.seg`, sized to the width by `fitName()`) and the nav top right. No footer, no scrolling.
  - **`src/work.njk`** (`/work/`): the project index, one row per project: title, client (link syntax stripped with `plain`), year; newest first. On devices with a mouse the row's cover (`.index-thumb`, a real `<img>` so the image plugin resizes it) follows the pointer via `--mx/--my`. Phones: client on a second line.
  - **`src/project.njk`**: paginates over `projects` to make `/work/<id>/`. Gallery items ending in `.mp4` render as silent looping `<video>`.
  - **`src/type.njk`** (`/type/`): type testers, data in **`src/_data/fonts.json`** (`fonts[]`: `name`, `project` id for the link, `sample`, `styles[]` of `{ name, file, axes? }`). Font files are WOFF2 in `src/fonts/type/` (converted with fontTools from `_projects-resources/_fonts/`; Segmentor reuses `/fonts/Segmentor.woff2`, Hecvba comes from `src/fonts/uploads/`). Each font gets `@font-face` families `T<font>-<style>` in an inline `<style>` (uses `| url` because the base plugin does not touch CSS). Sample is contenteditable; size slider; style buttons; one slider per axis for variable fonts. Sample texts only use characters the font has (Cocoscript/Noodle are caps-only; SHENTZU and Stickman have partial alphabets). Editable in the dashboard → Type.
  - **`src/contact.njk`** (`/contact/`, was Info): email, social links, bio, links, CV. **`src/404.njk`**.
- Years are plain text (the timeline and its year buttons are gone).
- **Links inside text**: written inline as Markdown, `[words](https://…)`, in any text field (project `intro`, `client`, `role`, gallery captions, CV `what`, `bio`). The dashboard's rich-text fields have a link button that writes this. Rendered by the `md` (paragraphs) and `mdInline` (one line) filters; external links get `target=_blank`. `plain` strips link syntax (for alt text). The old `links.json` / `autolink` system was removed (Nov 2026) and its links were written into the texts. Only add URLs that were checked to open the right page. Known unlinked so far (no confirmed page): NewOneAwards, Local Design Awards, Most Beautiful Books in Romania, HBO Max/Netflix titles, The Come N Go.
- **`eleventy.config.js`**: filters `md`, `mdInline`, `plain`, `neighbour` (prev/next). The image plugin turns every `<img>` into a `<picture>` with 600/1200/2000px WebP + JPEG in `_site/img/`, which is what pages use. `src/assets/` is copied as-is only by `npm start` (for the dashboard); the live build copies just `.mp4` files from it. Add `eleventy:ignore` to an `<img>` to skip the plugin. Also the `year` global.
- **`src/script.js`**: 1. Segmentor axes from mouse/tilt (only when a `.seg` exists, i.e. the splash; iOS "Tilt to play" button). 2. `fitName()` for the splash name. 3. `--mx/--my` for the project-index cover. 4. Type tester (size, styles, axes). 5. One-per-visit intro sweep of the name (`sessionStorage.introDone`).
- **Motion**: only a soft cross-fade between pages (View Transitions, end of `style.css`); off under `prefers-reduced-motion`.
- **`src/style.css`**: single stylesheet, tokens in `:root` (`--bg`, `--fg`, `--muted`, `--line`, `--stroke`, `--stroke-color`, `--accent`, `--font` (titles, always Segmentor), `--font-text` (everything else), `--pad`, `--gap`, text sizes). Colour/stroke/text-font tokens are overridden from `theme.json`. Links share the text colour and get a 1px underline on hover; links inside running text are always underlined. Range sliders are restyled to the two colours.
- **Image outlines**: `strokeWidth` pt × 1.333 = CSS px (1pt = 1.333px), colour `--stroke-color`.
- **Font**: `src/fonts/Segmentor.woff2` is what the site loads (converted from `Segmentor-03.ttf`, which is kept as the source and not deployed). Segmentor has 9 axes (`AAAA`–`IIII`, 0–1000); the site uses the first four. To update the font, convert the new TTF with fontTools: `f = TTFont(path); f.flavor = "woff2"; f.save("src/fonts/Segmentor.woff2")`. It has no `Ţ/ţ` (cedilla) and no arrows (← → ↗); use `Ț/ț` (comma below) and « ». Check other special characters before using them (e.g. render a test), since missing glyphs silently fall back to another font.

## Dashboard (/admin)

Decap CMS 3 (`src/admin/index.html` loads it from unpkg, pinned version; `src/admin/config.yml` defines every editable field). Sections: **Projects** (folder collection over `src/content/projects/`), **Site** (Info page & site texts, CV), **Appearance** (Theme, with a live preview template registered in `index.html`).

- **Local only** (since the move to GitHub Pages there is no online login): `npm start` + `npm run cms`, open http://localhost:8080/admin/, click Login. "Save to website" writes the files; then commit and push to `main` to publish. The `github` backend in `config.yml` (repo `malinneamtzu/wwwork`) is only a fallback the local dashboard ignores. An online dashboard would need an OAuth provider (e.g. a Netlify site kept only for its GitHub login, or a small OAuth proxy).
- `npm run cms` is decap-server on :8081 (`local_backend: true`); no password locally.
- In `config.yml`, quote any label containing a comma (`label: "a, b"`); inside `{ … }` an unquoted comma breaks the YAML and the fields silently show up empty.
- **Text font field** is a custom widget `fontdrop` (registered in `src/admin/index.html`): real drag-and-drop or click, checks the file is a readable font (FontFace API), renames it to lowercase-dashes, hands it to Decap's `onPersistMedia` (committed together with the entry on save) and stores `/fonts/uploads/<name>`. New fonts preview at once via blob URLs kept in `window.fontPreviews`. Decap's stock file widget had no drag-and-drop and could not preview unpublished fonts.
- **Button wording**: a custom locale `site` (`locale: site` in config.yml, `CMS.registerLocale` in index.html) renames Publish → "Save to website", Published → "Saved ✓", Unsaved changes → "Not saved yet". It merges over Decap's English, so only the changed strings are listed.
- When adding a field to the JSON, add it to `config.yml` too, or the dashboard will not show it.

## Adding or editing a project

Preferably through the dashboard. By hand: create `src/content/projects/<id>.json` (copy an existing one), put images in `src/assets/<id>/` (keep them under ~2500px wide), list them in `cover` and `gallery`, then `npm start` and check the project list and the project page.

## Content sources

- **Portfolio PDF**: `~/Desktop/work/2026/Portfolio-CV-2026/Portfolio/PDF/MalinNeamtzu-Portofolio-2026-25mb.pdf` (102 slides, 1920×1080). Current images were exported from it: covers are the original embedded images, galleries are full slides rendered at 2400px. Which slides belong to which project is listed in `scripts/export_from_pdf.py`; re-run it to re-export.
- **Instagram** `@malin.neamtzu`: needs a logged-in browser (the public API refuses without login and rate-limits quickly). What worked: Claude in Chrome on Mălin's logged-in profile, scroll the grid and read each tile's link + `alt` text (the alt is the caption); the post date can be decoded from the shortcode (`id >> 23` + 1314220021721 ms). Full-size images: open each post, click through the carousel and collect the `<img>` sources. Instagram's CSP blocks sending data to localhost via fetch/iframe/popup, but navigating the tab to `http://127.0.0.1:<port>/#<data>` works. Mark entries `"source": "instagram"` and keep the post link in `links`. Many posts in the grid are collaborations owned by other accounts (Type and Media, Page Not Found, Zefir7…); those fed the CV, not projects.

## Gotchas

- Image paths are case-sensitive on GitHub Pages/Actions (Linux) even though macOS is not.
- Text fields are Markdown (HTML allowed): `intro` is one string, blank line = new paragraph (old array form is still accepted by the loader). A literal `*`, `_` or `[` may need a backslash.
- The dashboard link button asks for the URL in a small browser prompt box.
- In Nunjucks, filters bind tighter than `+`: write `(a + 1) | filter`.
- The name in the header uses `overflow: hidden`; the extra bottom padding keeps the comma of `ț` visible. Check it after changing `line-height`.
