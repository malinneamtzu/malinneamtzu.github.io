import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import fs from "node:fs";

export default function (eleventyConfig) {
  // Files copied to the site as they are.
  eleventyConfig.addPassthroughCopy("src/style.css");
  eleventyConfig.addPassthroughCopy("src/script.js");
  eleventyConfig.addPassthroughCopy("src/fonts/*.woff2");
  eleventyConfig.addPassthroughCopy("src/fonts/uploads");   // fonts dropped in via /admin
  eleventyConfig.addPassthroughCopy("src/admin");           // the dashboard
  eleventyConfig.addWatchTarget("src/content/");
  eleventyConfig.addPassthroughCopy("src/media");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");
  // Original images are copied too, so the dashboard (/admin) can show
  // them. Pages themselves use the smaller versions made by the image
  // plugin below, so visitors never download these originals.
  eleventyConfig.addPassthroughCopy("src/assets");

  // Every <img> in the built HTML becomes a <picture> with resized WebP and
  // JPEG versions in _site/img/. Add `eleventy:ignore` to an <img> to skip it.
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    formats: ["webp", "jpeg"],
    widths: [600, 1200, 2000],
    urlPath: "/img/",
    outputDir: "_site/img/",
    svgShortCircuit: true,
    htmlOptions: {
      imgAttributes: { loading: "lazy", decoding: "async", sizes: "100vw" },
    },
  });

  eleventyConfig.addGlobalData("year", new Date().getFullYear());

  // Previous / next project, for the links at the bottom of a project page.
  eleventyConfig.addFilter("neighbour", (list, id, step) => {
    const i = list.findIndex((p) => p.id === id);
    return list[(i + step + list.length) % list.length];
  });

  // "2020–2025" → two buttons that open the timeline at that year.
  // Words like "present" stay plain text.
  eleventyConfig.addFilter("yearLinks", (text) =>
    String(text || "").replace(/\d{4}/g, (y) => `<a class="year-btn" href="/timeline/#y${y}">${y}</a>`)
  );

  // Turns every name listed in src/_data/links.js into a link. Text that is
  // already inside a link is left alone; longer names are matched first, so
  // "Royal Academy of Art (KABK)" wins over "Royal Academy of Art".
  // The list is read fresh on every build, so edits from /admin apply.
  eleventyConfig.addFilter("autolink", (html) => {
    const links = Object.fromEntries(
      JSON.parse(fs.readFileSync("src/_data/links.json", "utf8")).links
        .filter((l) => l && l.name && l.url)
        .map((l) => [l.name, l.url])
    );
    const names = Object.keys(links).sort((a, b) => b.length - a.length);
    const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Split into [text, <a…>…</a>, text, …] so existing links are skipped.
    const parts = String(html || "").split(/(<a\b[^>]*>.*?<\/a>)/s);
    for (const name of names) {
      const re = new RegExp(`(?<![\\p{L}\\p{N}@.])${escape(name)}(?![\\p{L}\\p{N}])`, "u");
      for (let i = 0; i < parts.length; i += 2) {
        if (re.test(parts[i])) {
          const [before, ...rest] = parts[i].split(re);
          const link = `<a href="${links[name]}" target="_blank" rel="noopener">${name}</a>`;
          parts.splice(i, 1, before, link, rest.join(name));
          break; // one link per name per text is enough
        }
      }
    }
    return parts.join("");
  });

  // Projects grouped by year for the timeline, newest year first. A project
  // spanning several years appears in each of them. Undated ones come last.
  eleventyConfig.addFilter("byYear", (projects) => {
    const map = new Map();
    for (const p of projects) {
      for (const y of p.years.length ? p.years : ["Undated"]) {
        if (!map.has(y)) map.set(y, []);
        map.get(y).push(p);
      }
    }
    return [...map.entries()]
      .sort(([a], [b]) => (a === "Undated") - (b === "Undated") || b - a)
      .map(([year, items]) => ({ year, items }));
  });

  return {
    dir: { input: "src", output: "_site" },
    templateFormats: ["njk"],
  };
}
