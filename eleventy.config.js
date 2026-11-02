import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import markdownIt from "markdown-it";

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

  // Links typed in any text: [words](https://…). The dashboard writes these
  // for you when you select words and press its link button. External links
  // open in a new tab. `md` = paragraphs, `mdInline` = one line (no <p>).
  const md = markdownIt({ html: true, breaks: true });
  const defaultLink = md.renderer.rules.link_open ||
    ((tokens, i, options, env, self) => self.renderToken(tokens, i, options));
  md.renderer.rules.link_open = (tokens, i, options, env, self) => {
    if (/^https?:\/\//.test(tokens[i].attrGet("href") || "")) {
      tokens[i].attrSet("target", "_blank");
      tokens[i].attrSet("rel", "noopener");
    }
    return defaultLink(tokens, i, options, env, self);
  };
  eleventyConfig.addFilter("md", (text) => md.render(String(text || "")));
  eleventyConfig.addFilter("mdInline", (text) => md.renderInline(String(text || "")));
  // The same text without link syntax, e.g. for image alt text.
  eleventyConfig.addFilter("plain", (text) => String(text || "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1"));

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
