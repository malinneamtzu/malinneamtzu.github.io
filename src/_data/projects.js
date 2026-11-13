// ---------------------------------------------------------------------------
// projects.js: loads every project from src/content/projects/<id>.json.
//
// Those JSON files are what the dashboard (/admin) edits; you can also edit
// them by hand. The file name is the project id and its URL: /work/<id>/.
//
// Fields in each file
//   title    shown on cards and as the big project title
//   typeface true = a typeface: left out of the Projects list (it is shown
//            on the Type page); its page still exists at /work/<id>/
//   date     "YYYY" or "YYYY-MM": ONLY used for sorting (newest first).
//            A bare year counts as December, i.e. ongoing work.
//            Leave empty and the project goes to the end ("Undated").
//   year     what visitors see: "2023", "2021–2025", "2020–present"
//   tags     short labels under the card
//   client, role   optional
//   intro    the text. Blank line = new paragraph; links as [words](https://…)
//   links    list of { label, url }
//   cover    the card image
//   gallery  list of { image, caption, row, section } shown on the project page,
//            in order. Consecutive images with the same `row` (any word or
//            number) sit side by side at equal height, filling the width.
//            Without `row` an image gets a row of its own. `section` puts a
//            small label above the row that image is in (e.g. "Posters 2021").
//   source, notes  private: where it came from / things to check
// ---------------------------------------------------------------------------

import fs from "node:fs";
import path from "node:path";
import Image from "@11ty/eleventy-img";
import sizeOf from "image-size";

const DIR = "src/content/projects";

export default async function () {
  const projects = [];
  for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith(".json"))) {
    const p = JSON.parse(fs.readFileSync(path.join(DIR, file), "utf8"));
    p.id = file.replace(/\.json$/, "");
    p.tags ||= [];
    // Older files kept the text as a list of paragraphs.
    if (Array.isArray(p.intro)) p.intro = p.intro.join("\n\n");
    p.intro ||= "";
    // First paragraph as plain text, for search engines and link previews.
    p.summary = p.intro.split(/\n\s*\n/)[0].replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[*_]/g, "").trim();
    p.links ||= [];
    p.gallery = (p.gallery || []).filter((g) => g && g.image);

    // Gallery rows: width/height of each image (videos count as 9:16 unless
    // they say otherwise), grouped by their `row` value. In a row, each
    // image's share of the width is its ratio, so all end up the same height.
    for (const g of p.gallery) {
      g.ratio = 1;
      const file = path.join("src", g.image);
      if (/\.mp4$/i.test(g.image)) g.ratio = g.videoRatio || 9 / 16;
      else if (fs.existsSync(file)) {
        try { const d = sizeOf(file); g.ratio = d.width / d.height; } catch { /* keep 1 */ }
      }
    }
    p.rows = [];
    for (const g of p.gallery) {
      const last = p.rows.at(-1);
      const key = g.row ? String(g.row) : null;
      if (last && key && last.key === key) { last.items.push(g); last.section ||= g.section || ""; }
      else p.rows.push({ key, section: g.section || "", items: [g] });
    }

    // Height/width ratio of the cover, so the masonry grid can be laid out
    // before images load. Image paths start with /assets/… inside src/.
    p.ratio = 1;
    if (p.cover && fs.existsSync(path.join("src", p.cover))) {
      const meta = await Image(path.join("src", p.cover), { widths: ["auto"], formats: ["jpeg"], dryRun: true });
      p.ratio = meta.jpeg[0].height / meta.jpeg[0].width;
    }

    // Every year the project covers, for the timeline.
    const nums = (p.year || "").match(/\d{4}/g)?.map(Number) || [];
    if (/present/i.test(p.year || "")) nums.push(new Date().getFullYear());
    p.years = [];
    if (nums.length) for (let y = Math.max(...nums); y >= Math.min(...nums); y--) p.years.push(y);

    projects.push(p);
  }

  // Newest first; projects without a date last, alphabetically.
  const key = (d) => (d ? (String(d).length === 4 ? `${d}-12` : String(d)) : "");
  return projects.sort((a, b) => key(b.date).localeCompare(key(a.date)) || a.title.localeCompare(b.title));
}
