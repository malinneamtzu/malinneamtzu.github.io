// ---------------------------------------------------------------------------
// projects.js: the single list of every project on the site.
//
// Each entry becomes: one card on the home grid + one page at /work/<id>/.
// The ORDER IS AUTOMATIC: newest first, sorted by `date` (see the bottom of
// this file). Entries without a date go last, in the order written here.
//
// Fields
//   id       folder name in src/assets/ and the page URL (lowercase, dashes)
//   title    shown on the card and as the big title of the project page
//   date     "YYYY" or "YYYY-MM": used ONLY for sorting. For ongoing work
//            use the most recent date, so it sits near the top.
//   year     what visitors see, e.g. "2023" or "2021–2025"
//   tags     short labels under the card ("Type design", "Poster", …)
//   client   optional; who it was for
//   role     optional; what you did
//   intro    one or more paragraphs (array of strings). HTML is allowed, so
//            write a literal < as &lt;
//   links    optional list of { label, url }; shown under the intro
//   source   where the content came from ("pdf" | "instagram"); for you only
//   check    optional note to yourself about something still to verify;
//            not shown on the site
//
// Images: put them in src/assets/<id>/. `cover.jpg` is the card image; every
// other image in that folder becomes the gallery on the project page, in
// filename order (so name them <id>-01.jpg, <id>-02.jpg, …).
// ---------------------------------------------------------------------------

import fs from "node:fs";
import path from "node:path";
import Image from "@11ty/eleventy-img";

const projects = [
  {
    id: "segmentor",
    title: "Segmentor",
    date: "2025-06",
    year: "2025",
    tags: ["Variable font", "Live visuals", "Type and Media"],
    role: "Type design, live visual tool, performance",
    intro: [
      "Segmentor is an exploration of what playing drums and designing typefaces have in common, and what links could be brought forward.",
      "During my year at Type and Media in The Hague I combined both practices into a live visual tool that renders experimental typographic animations for any show I play. The typeface you see moving at the top of this site is Segmentor.",
    ],
    links: [
      { label: "Watch the demo", url: "https://www.youtube.com/watch?v=4W-PnDmmwX8" },
      { label: "TDC Weekly Type", url: "https://tdc.org/weekly-type/segmentor/" },
    ],
    source: "pdf",
  },
  {
    id: "records",
    title: "Records",
    date: "2025",
    year: "2023–2025",
    tags: ["LP design", "Reissues", "Electrecord"],
    client: "Electrecord, Draganenii and others",
    intro: [
      "I work with many musicians and record labels. A selection of LPs from the past years, from iconic reissues to new releases: Draganenii “Elvis EP”, Trei Parale “România. 100 de minute.”, Romica Puceanu, Alexandru Andrieș, Grupul Stereo, Partizan, Aura Urziceanu, Ion Creangă and Lola Bobescu.",
    ],
    source: "pdf",
  },
  {
    id: "club-guesthouse",
    title: "Club Guesthouse",
    date: "2025",
    year: "2020–2025",
    tags: ["Visual identity", "Posters", "Merch"],
    client: "Club Guesthouse, Bucharest",
    intro: [
      "Since 2020 I have worked with the best-known electronic music venue in Romania. From the rebranding to every flyer, post and piece of merch, we evolved together to express the flavour of the events and build a strong visual identity for the venue, including the 15-year anniversary tour in 2025.",
    ],
    source: "pdf",
  },
  {
    id: "palms-cocos",
    title: "Palms Cocos",
    date: "2024",
    year: "2020–2024",
    tags: ["Illustration", "Streetwear", "Collaboration"],
    intro: [
      "Palms Cocos is an illustration duo that helps me keep the creative drive and flow I had as a kid. Over the past years we did capsule collections with streetwear brands: Sneaker Industry (2020) and RIP BANANAS (2024). All illustrations shown are my own.",
    ],
    links: [
      { label: "Sneaker Industry teaser", url: "https://www.youtube.com/watch?v=NBqZvpIFIQQ" },
      { label: "Sneaker Industry behind the scenes", url: "https://www.youtube.com/watch?v=uESt1CJSw6s" },
      { label: "RIP BANANAS behind the scenes", url: "https://www.instagram.com/p/C4QNXjfIG4a/" },
    ],
    source: "pdf",
  },
  {
    id: "oyo9",
    title: "OYO 9",
    date: "2023-10",
    year: "2023",
    tags: ["Exhibition", "Poster", "Booklet"],
    client: "Royal Academy of Art (KABK), The Hague",
    intro: [
      "“On Your Own 9” brought together nine alumni of the Royal Academy of Art in The Hague in a curated group exhibition. I designed the poster, the exhibition booklet with map, and the captions.",
    ],
    source: "pdf",
  },
  {
    id: "spy-master",
    title: "Spy/Master",
    date: "2023-09",
    year: "2023",
    tags: ["Title sequence", "Custom typeface", "HBO Max"],
    client: "HBO Max",
    role: "Title sequence and custom typeface",
    intro: [
      "Spy/Master, a Berlinale-nominated HBO Max series, follows a defection from the communist bloc. I made the title sequence and a custom typeface. The font stands for the Cold War conflict, with two stylistic sets, West and East, reflecting the era.",
    ],
    links: [{ label: "Watch the title sequence", url: "https://vimeo.com/840816231" }],
    source: "pdf",
    check: "Month (09) is the series release; confirm.",
  },
  {
    id: "henkan-grotesk",
    title: "Henkan Grotesk",
    date: "2023-04",
    year: "2023",
    tags: ["Variable font", "Experimental", "Specimen"],
    intro: [
      "Henkan Grotesk is an experimental variable font exploring the design space of letterforms through physical actions on paper letters: digital forging, laser-cut paper letters, physical intervention, scanning, digitising and finally interpolation.",
    ],
    links: [{ label: "Five-minute video about the project", url: "https://vimeo.com/816046205" }],
    source: "pdf",
    check: "Date guessed from the Vimeo upload (April 2023). Confirm.",
  },
  {
    id: "formatype",
    title: "Formatype Workshop",
    date: "2020-02",
    year: "2020",
    tags: ["Workshop", "Lettering", "Posters"],
    client: "Hot Lagoon, Bucharest",
    role: "Workshop lead, with Andrei Reg",
    intro: [
      "Formatype was a workshop exploring letter shapes with both rigid and elastic materials in a 5×5 cm space. I guided each participant to complete a set of 26 letters, which became individual specimen posters and one collective poster.",
    ],
    source: "pdf",
  },

  // --- Typefaces ------------------------------------------------------------
  // No dates yet, so these sit at the end. Add a `date` and `year` to each
  // and they will move into place automatically.
  {
    id: "clazic",
    title: "Clazic",
    tags: ["Typeface", "Specimen"],
    intro: ["Clazic, a typeface shown with its specimen poster."],
    source: "pdf",
    check: "Add date, year and a real description.",
  },
  {
    id: "skuba",
    title: "Skuba",
    tags: ["Typeface family", "Specimen"],
    intro: ["Skuba, a typeface family in Light, Regular and Bold."],
    source: "pdf",
    check: "Add date, year and a real description.",
  },
  {
    id: "rzr",
    title: "RZR",
    tags: ["Typeface", "Specimen"],
    intro: ["RZR, a typeface shown with its specimen poster."],
    source: "pdf",
    check: "Add date, year and a real description.",
  },
  {
    id: "cocoscript",
    title: "Cocoscript",
    tags: ["Script typeface", "Specimen"],
    intro: ["Cocoscript, an all-caps script typeface."],
    source: "pdf",
    check: "Add date, year and a real description.",
  },
  {
    id: "lubke",
    title: "Lubke",
    tags: ["Revival", "Text typeface"],
    intro: [
      "Lubke Regular is a faithful revival of a 19th-century typeface: a history-rich, workhorse text face with a glyph set of 356.",
    ],
    source: "pdf",
    check: "Add date and year.",
  },
  {
    id: "poschta",
    title: "Poschta",
    tags: ["Typeface family", "Specimen"],
    intro: ["Poschta, a typeface family in Light, Book and Bold."],
    source: "pdf",
    check: "Add date, year and a real description.",
  },
  {
    id: "noodle",
    title: "Noodle",
    tags: ["Display typeface", "Specimen"],
    intro: ["Noodle, a display typeface shown with its specimen poster."],
    source: "pdf",
    check: "Add date, year and a real description.",
  },
  {
    id: "hecvba",
    title: "Hecvba",
    tags: ["Typeface", "Specimen"],
    intro: ["Hecvba, a typeface shown with its specimen poster."],
    source: "pdf",
    check: "Add date, year and a real description.",
  },
  {
    id: "kenjo",
    title: "Kenjo",
    tags: ["Typeface family", "Specimen"],
    intro: ["Kenjo, a typeface family from Regular to High Contrast, with an outline style."],
    source: "pdf",
    check: "Add date, year and a real description.",
  },
];

// ---------------------------------------------------------------------------
// Below here: no need to edit. Adds images and sorts by date.
// ---------------------------------------------------------------------------

const ASSETS = "src/assets";
const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;

export default async function () {
  for (const p of projects) {
    const dir = path.join(ASSETS, p.id);
    const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => IMAGE_EXT.test(f)).sort() : [];
    const cover = files.find((f) => /^cover\./i.test(f));
    p.cover = cover ? `/assets/${p.id}/${cover}` : null;
    p.gallery = files.filter((f) => f !== cover).map((f) => `/assets/${p.id}/${f}`);

    // The width/height ratio of the cover lets script.js lay out the masonry
    // grid before images load (no jumping).
    if (cover) {
      const meta = await Image(path.join(dir, cover), { widths: ["auto"], formats: ["jpeg"], dryRun: true });
      p.ratio = meta.jpeg[0].height / meta.jpeg[0].width;
    }
  }

  // Newest first. "2025" sorts after "2025-06" here on purpose: a bare year
  // counts as the end of that year (ongoing work).
  const key = (d) => (d ? (d.length === 4 ? `${d}-12` : d) : "");
  return projects
    .map((p, i) => ({ ...p, _i: i }))
    .sort((a, b) => key(b.date).localeCompare(key(a.date)) || a._i - b._i);
}
