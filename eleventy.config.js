import { HtmlBasePlugin } from "@11ty/eleventy";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import markdownIt from "markdown-it";

// The live site is at the root of malinneamtzu.com (GitHub Pages, repo
// "malinneamtzu.github.io"), so links need no prefix. PATH_PREFIX and the
// "HTML base" plugin below are kept so a sub-folder address (e.g. a test
// copy at malinneamtzu.com/<repo>/) only needs this one line changed:
// templates write root links ("/work/") and the plugin adds the prefix.
export const PATH_PREFIX = "/";
// npm start ("serve" mode) also copies the dashboard and original images.
const isServe = process.env.ELEVENTY_RUN_MODE === "serve";

export default function (eleventyConfig) {
  // Files copied to the site as they are.
  eleventyConfig.addPassthroughCopy("src/style.css");
  eleventyConfig.addPassthroughCopy("src/script.js");
  eleventyConfig.addPassthroughCopy("src/fonts/*.woff2");
  eleventyConfig.addPassthroughCopy("src/fonts/uploads");   // fonts dropped in via /admin
  eleventyConfig.addPassthroughCopy("src/fonts/type");      // fonts on the Type page
  eleventyConfig.addWatchTarget("src/content/");
  eleventyConfig.addPassthroughCopy("src/media");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");
  // Videos in project galleries (.mp4) are used as they are.
  eleventyConfig.addPassthroughCopy("src/assets/**/*.mp4");
  if (isServe) {
    // The dashboard only runs on your own computer (npm start + npm run cms),
    // so it and the original images it shows are left out of the live site.
    // Pages use the smaller versions made by the image plugin below.
    eleventyConfig.addPassthroughCopy("src/admin");
    eleventyConfig.addPassthroughCopy("src/assets");
  }

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

  // Puts PATH_PREFIX in front of every root link in the built HTML (see top).
  eleventyConfig.addPlugin(HtmlBasePlugin);

  eleventyConfig.addGlobalData("year", new Date().getFullYear());
  // A number that changes with every build, added to the style.css and
  // script.js links (?v=…) so browsers fetch the new files instead of
  // reusing an old copy they saved ("cache busting").
  eleventyConfig.addGlobalData("buildTime", Date.now());

  // Previous / next project, for the links at the bottom of a project page.
  eleventyConfig.addFilter("neighbour", (list, id, step) => {
    const i = list.findIndex((p) => p.id === id);
    return list[(i + step + list.length) % list.length];
  });

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

  return {
    pathPrefix: PATH_PREFIX,
    dir: { input: "src", output: "_site" },
    templateFormats: ["njk"],
  };
}
