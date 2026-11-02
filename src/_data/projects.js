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
//   source   where the content came from ("pdf", "instagram", "cv"); for you only
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
  // --- From Instagram (@malin.neamtzu) ---------------------------------------
  {
    id: "come-n-go",
    title: "The Come N Go Mini-Tour",
    date: "2026-08",
    year: "2026",
    tags: ["Tour poster", "Illustration"],
    client: "The Come N Go",
    intro: [
      "Poster and visuals for The Come N Go’s 25-year anniversary mini-tour through Switzerland and Italy, August 2026: Krabowski in La Chaux-de-Fonds, Sedel in Lucerne, Facciamo la Corte in Muzzano and Cuneo.",
    ],
    links: [{ label: "Instagram post", url: "https://www.instagram.com/p/DcNv5YLiFJy/" }],
    source: "instagram",
  },
  {
    id: "segmentor",
    title: "Segmentor",
    date: "2025-06",
    year: "2025",
    tags: ["Variable font", "Live visuals", "Type and Media"],
    role: "Type design, live visual tool, performance",
    intro: [
      "Segmentor is an exploration of what playing drums and designing typefaces have in common, and what links could be brought forward.",
      "During my year at Type and Media in The Hague I combined both practices into a live visual tool that renders experimental typographic animations for any show I play. Every letter on this website is set in Segmentor.",
      "Since then I have played live demos, such as the launch of De Situatie #2 at PIP Den Haag (2025), and released a 100 x 70 cm six-colour silkscreen specimen poster (2026).",
      "Segmentor won a TDC72 Type High Gold Award (Type Design, Multiple Axis Type Family) and a Bronze at the European Design Awards, both in 2026.",
    ],
    links: [
      { label: "Watch the demo", url: "https://www.youtube.com/watch?v=4W-PnDmmwX8" },
      { label: "TDC Weekly Type", url: "https://tdc.org/weekly-type/segmentor/" },
    ],
    source: "pdf + instagram",
  },
  {
    id: "oyo9",
    title: "OYO 9",
    date: "2025-10",
    year: "2025",
    tags: ["Exhibition identity", "Poster", "Booklet"],
    client: "Royal Academy of Art (KABK), The Hague",
    intro: [
      "“On Your Own 9” brought together nine alumni of the Royal Academy of Art in The Hague in a multidisciplinary exhibition, 22–26 October 2025. I designed the identity, poster, booklet with map and captions, set in Kenjo Segment 150 and Kenjo Segment 50 Outline, and exhibited a Segmentor installation.",
    ],
    source: "pdf + instagram",
  },
  {
    id: "to-be-a-host",
    title: "To Be a Host",
    date: "2025-09",
    year: "2025",
    tags: ["Typeface in use", "Segmentor"],
    client: "Royal Academy of Art (KABK), The Hague",
    intro: [
      "Segmentor-03 in use for “To Be a Host”, the new reception of the Royal Academy of Art in The Hague. Interior architecture and concept by Ladida Design Architecture; visual communication and design by allsiz.es.",
    ],
    links: [{ label: "Instagram post", url: "https://www.instagram.com/p/DOynssFCLug/" }],
    source: "instagram",
  },
  {
    id: "records",
    title: "Records",
    date: "2025",
    year: "2023–2025",
    tags: ["LP design", "Reissues", "Electrecord"],
    client: "Electrecord, Draganenii and others",
    intro: [
      "I work with many musicians and record labels; at Electrecord I am the leading designer for reissues. A selection of LPs from the past years, from iconic reissues to new releases: Draganenii “Elvis EP”, Trei Parale “România. 100 de minute.”, Romica Puceanu, Alexandru Andrieș, Grupul Stereo, Partizan, Aura Urziceanu, Ion Creangă and Lola Bobescu.",
    ],
    source: "pdf",
  },
  {
    id: "club-guesthouse",
    title: "Club Guesthouse",
    date: "2025",
    year: "2020–present",
    tags: ["Visual identity", "Posters", "Merch"],
    client: "Club Guesthouse, Bucharest",
    role: "Creative director, graphic designer",
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
    id: "aku-mini-tour",
    title: "AKU Mini Tour",
    date: "2023-07",
    year: "2023",
    tags: ["Tour poster", "Illustration"],
    client: "Of Bits and Pieces Records",
    intro: [
      "Poster and mini illustration, made in house, for the AKU + Parking Lot + Snitsh Pitsh mini tour, July 2023: Leipzig, Zürich, Biel and Lormes.",
    ],
    links: [{ label: "Instagram post", url: "https://www.instagram.com/p/CvFk8dJo7gb/" }],
    source: "instagram",
  },
  {
    id: "baubau",
    title: "BAUBAU — Lurking / Forever",
    date: "2023-03",
    year: "2023",
    tags: ["Cover art", "Drawing", "Music"],
    intro: [
      "BAUBAU, together with Anton Hoyer in Leipzig, was first recorded in 2018 and again in 2022. In 2023 we finally released “LURKING” and “FOREVER”: the original drawings and the two covers.",
    ],
    links: [{ label: "Instagram post", url: "https://www.instagram.com/p/CpxpFqHIVtN/" }],
    source: "instagram",
  },
  {
    id: "connect-four-ghosts",
    title: "Connect Four Ghosts",
    date: "2022-02",
    year: "2022",
    tags: ["Exhibition poster", "Collaboration"],
    client: "HGB Leipzig",
    intro: [
      "Exhibition poster for “connect four ghosts”, made with Elia Preuss. The title typeface is by Elia Preuss; the secondary typeface is one we made in a team project for Adobe in 2018.",
    ],
    links: [{ label: "Instagram post", url: "https://www.instagram.com/p/CbS0u5fs03f/" }],
    source: "instagram",
    check: "Client guessed from the poster (HGB Leipzig). Confirm.",
  },
  {
    id: "lubke",
    title: "Lubke",
    date: "2021-01",
    year: "2021",
    tags: ["Revival", "Text typeface"],
    intro: [
      "Lubke Regular is a faithful revival of a 19th-century text typeface, from a book published in Stuttgart by Ebner & Seubert in 1882 and written by the art historian Wilhelm Lübke. A history-rich workhorse text face with a glyph set of 356.",
    ],
    source: "pdf + instagram",
  },
  {
    id: "rzr",
    title: "RZR",
    date: "2020-04",
    year: "2020",
    tags: ["Display typeface", "MTypes"],
    intro: ["RZR, a sharp display typeface, started in 2018 and released in 2020 on MTypes."],
    links: [{ label: "RZR on MTypes", url: "https://themtyp.es" }],
    source: "pdf + instagram",
  },
  {
    id: "formatype",
    title: "Formatype Workshop",
    date: "2020-02",
    year: "2020",
    tags: ["Workshop", "Lettering", "Posters"],
    client: "Hot Lagoon, Bucharest",
    role: "Workshop organiser and lead, with Andrei Reg",
    intro: [
      "Formatype was a workshop exploring letter shapes with both rigid and elastic materials in a 5×5 cm space. I guided each participant to complete a set of 26 letters, which became individual specimen posters and one collective poster.",
    ],
    source: "pdf",
  },
  {
    id: "henkan-grotesk",
    title: "Henkan Grotesk",
    date: "2019-11",
    year: "2019",
    tags: ["Variable font", "Experimental", "Specimen"],
    intro: [
      "Henkan Grotesk is an experimental variable font built on the relation between the digital and the physical world. Each letter was designed digitally, laser-cut from paper, physically altered, scanned and digitised again; the variable font interpolates between the before and the after.",
    ],
    links: [{ label: "Five-minute video about the project", url: "https://vimeo.com/816046205" }],
    source: "pdf + instagram",
  },
  {
    id: "noodle",
    title: "Noodle",
    date: "2019-06",
    year: "2019",
    tags: ["Display typeface", "Specimen poster"],
    intro: [
      "Noodle, a display typeface. The specimen poster was made for Leonhard Laupichler’s diploma project; its mirrored composition ended up resembling a dragon’s face.",
    ],
    source: "pdf + instagram",
  },
  {
    id: "skuba",
    title: "Skuba",
    date: "2019-03",
    year: "2018–2019",
    tags: ["Typeface family", "Specimen"],
    intro: ["Skuba, a typeface family in Light, Regular and Bold, with a series of specimen posters."],
    source: "pdf + instagram",
  },
  {
    id: "clazic",
    title: "Clazic",
    date: "2018-03",
    year: "2018",
    tags: ["Typeface", "Specimen"],
    intro: ["Clazic, a typeface released in 2018, shown with its specimen poster."],
    source: "pdf + instagram",
  },

  // --- No date yet: these sit at the end until a `date` is added -------------
  {
    id: "kenjo",
    title: "Kenjo",
    tags: ["Typeface family", "Specimen"],
    intro: ["Kenjo, a typeface family from Regular to High Contrast, with Segment and Outline styles."],
    source: "pdf",
    check: "Add date and year (used for OYO 9 in 2025, so probably 2024–25?).",
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
    id: "hecvba",
    title: "Hecvba",
    tags: ["Typeface", "Specimen"],
    intro: ["Hecvba, a typeface shown with its specimen poster."],
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

    // Every year the project covers, for the timeline: "2020–present" gives
    // 2020, 2021 … this year. A project with no `year` gets none.
    const nums = (p.year || "").match(/\d{4}/g)?.map(Number) || [];
    if (/present/i.test(p.year || "")) nums.push(new Date().getFullYear());
    p.years = [];
    if (nums.length) {
      for (let y = Math.max(...nums); y >= Math.min(...nums); y--) p.years.push(y);
    }
  }

  // Newest first. "2025" sorts after "2025-06" here on purpose: a bare year
  // counts as the end of that year (ongoing work).
  const key = (d) => (d ? (d.length === 4 ? `${d}-12` : d) : "");
  return projects
    .map((p, i) => ({ ...p, _i: i }))
    .sort((a, b) => key(b.date).localeCompare(key(a.date)) || a._i - b._i);
}
