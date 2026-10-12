import { readFile } from "node:fs/promises";
import { chromium, firefox, webkit } from "playwright";
import { asTailwindBuilds, fetchPackageFile } from "./packages.mjs";

const resets = [
  { name: "no reset", css: "" },
  { name: "blanksheet", local: "../blanksheet.css" },
  { name: "normalize.css 8.0.1", package: "normalize.css@8.0.1", file: "normalize.css" },
  {
    name: "modern-normalize 3.0.1",
    package: "modern-normalize@3.0.1",
    file: "modern-normalize.css"
  },
  { name: "sanitize.css 13.0.0", package: "sanitize.css@13.0.0", file: "sanitize.css" },
  {
    name: "Eric Meyer Reset Styles (2007-04-12)",
    local: "./vendor/meyer-2007-04-12/reset.css"
  },
  { name: "reset-css 5.0.2 (Meyer-derived)", package: "reset-css@5.0.2", file: "reset.css" },
  { name: "the-new-css-reset 1.11.3", package: "the-new-css-reset@1.11.3", file: "css/reset.css" },
  { name: "destyle.css 4.0.1", package: "destyle.css@4.0.1", file: "destyle.css" },
  {
    name: "Tailwind Preflight 4.3.3",
    package: "tailwindcss@4.3.3",
    file: "preflight.css",
    transform: asTailwindBuilds
  },
  { name: "modern-css-reset 1.4.0", package: "modern-css-reset@1.4.0", file: "dist/reset.css" }
];

async function loadCss(reset) {
  if (reset.css !== undefined) return reset.css;
  if (reset.local) return readFile(new URL(reset.local, import.meta.url), "utf8");
  const css = await fetchPackageFile(reset.package, reset.file);
  return reset.transform ? reset.transform(css) : css;
}

// What an agent's component CSS looks like: single-class selectors loaded after the reset.
const authorRule = `.override { padding: 7px; margin: 5px; border: 3px solid rgb(1, 2, 3); background-color: rgb(4, 5, 6); color: rgb(7, 8, 9); font-size: 21px; }`;
const authorVariants = {
  unlayered: authorRule,
  layered: `@layer reset, base, components; @layer components { ${authorRule} }`
};
const expectedOverride = {
  paddingTop: "7px",
  marginTop: "5px",
  borderTopWidth: "3px",
  borderTopColor: "rgb(1, 2, 3)",
  backgroundColor: "rgb(4, 5, 6)",
  color: "rgb(7, 8, 9)",
  fontSize: "21px"
};

const fixture = (resetCss, authorCss) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><style>${resetCss}</style><style>${authorCss}</style></head><body>
<p id="text">Body <a id="link" href="#x">link</a> <strong id="strong">strong</strong> <em id="em">em</em> <code id="code">code</code>.</p>
<h1 id="heading">Heading</h1>
<input id="field" type="text"> <textarea id="textarea"></textarea> <button id="button">Button</button>
<select id="select"><option>One</option></select> <input id="checkbox" type="checkbox">
<img id="hidden-img" hidden src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="">
<ul id="list"><li>Item</li></ul>
<dialog id="dialog"><p>Dialog</p></dialog>
<input class="override" type="search"> <input class="override" type="text"> <button class="override" type="button">B</button>
<select class="override"><option>s</option></select> <a class="override" href="#y">l</a> <textarea class="override"></textarea>
<ul class="override"><li>x</li></ul> <h2 class="override">h</h2> <p class="override">p</p>
</body></html>`;

const factProperties = [
  "color",
  "backgroundColor",
  "boxShadow",
  "textDecorationLine",
  "fontWeight",
  "fontStyle",
  "fontSize",
  "fontFamily",
  "lineHeight",
  "appearance",
  "display",
  "listStyleType",
  "borderTopStyle",
  "borderTopWidth",
  "borderTopColor",
  "borderRightStyle",
  "borderRightWidth",
  "borderRightColor",
  "borderBottomStyle",
  "borderBottomWidth",
  "borderBottomColor",
  "borderLeftStyle",
  "borderLeftWidth",
  "borderLeftColor"
];
const divergenceProperties = [
  "marginTop",
  "marginBottom",
  "paddingTop",
  "paddingLeft",
  "fontSize",
  "fontWeight",
  "fontStyle",
  "lineHeight",
  "borderTopWidth",
  "borderTopStyle",
  "listStyleType",
  "verticalAlign",
  "textDecorationLine",
  "boxSizing"
];

const alpha = (color) =>
  color === "transparent" ? 0 : color.startsWith("rgba") ? parseFloat(color.split(",")[3]) : 1;
const hasBoundary = (style, pageBackground) =>
  ["Top", "Right", "Bottom", "Left"].some(
    (side) =>
      style[`border${side}Style`] !== "none" &&
      parseFloat(style[`border${side}Width`]) > 0 &&
      alpha(style[`border${side}Color`]) > 0
  ) ||
  (alpha(style.backgroundColor) > 0 && style.backgroundColor !== pageBackground) ||
  style.boxShadow !== "none";

// Each check asks: if the agent forgets to style this, is the page still usable?
const checks = [
  [
    "link distinguishable from text",
    "WCAG 1.4.1",
    (f) => f.link.color !== f.text.color || f.link.textDecorationLine.includes("underline")
  ],
  [
    "strong heavier than text",
    "WCAG 1.3.1",
    (f) => parseInt(f.strong.fontWeight) > parseInt(f.text.fontWeight)
  ],
  ["em italic", "WCAG 1.3.1", (f) => f.em.fontStyle !== "normal"],
  [
    "heading distinct from text",
    "WCAG 1.3.1",
    (f) =>
      parseFloat(f.heading.fontSize) > parseFloat(f.text.fontSize) ||
      parseInt(f.heading.fontWeight) > parseInt(f.text.fontWeight)
  ],
  ["empty text field has a boundary", "WCAG 1.4.11", (f) => hasBoundary(f.field, f.pageBackground)],
  [
    "empty textarea has a boundary",
    "WCAG 1.4.11",
    (f) => hasBoundary(f.textarea, f.pageBackground)
  ],
  ["button has a boundary", "WCAG 1.4.11", (f) => hasBoundary(f.button, f.pageBackground)],
  [
    "select has a boundary or arrow",
    "WCAG 1.4.11",
    (f) => hasBoundary(f.select, f.pageBackground) || f.select.appearance !== "none"
  ],
  [
    "checkbox drawn",
    "WCAG 1.4.11",
    (f) => f.checkbox.appearance !== "none" || hasBoundary(f.checkbox, f.pageBackground)
  ],
  ["button focus visible", "WCAG 2.4.7", (f) => f.focus.button],
  ["link focus visible", "WCAG 2.4.7", (f) => f.focus.link],
  ["field focus visible", "WCAG 2.4.7", (f) => f.focus.field],
  ["[hidden] hides media", "HTML hidden", (f) => f["hidden-img"].display === "none"],
  ["list keeps Safari semantics", "WCAG 1.3.1", (f) => f.list.listStyleType !== "none"],
  [
    "modal separated from page",
    "WCAG 1.3.1",
    (f) => hasBoundary(f.dialog, f.pageBackground) || alpha(f.backdrop.backgroundColor) > 0
  ],
  ["code at text size", "predictability", (f) => f.code.fontSize === f.text.fontSize]
];

async function measure(page, resetCss) {
  await page.setContent(fixture(resetCss, authorVariants.unlayered));
  const focus = {};
  // A focus indicator must appear on focus; a shadow that is always there does not count.
  const paint = (element) => {
    const style = getComputedStyle(element);
    const hasOutline = style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0;
    return { outline: hasOutline ? style.outline : "none", boxShadow: style.boxShadow };
  };
  for (const id of ["button", "link", "field"]) {
    const target = page.locator(`#${id}`);
    await page.keyboard.press("Shift");
    await target.evaluate((element) => element.blur());
    const before = await target.evaluate(paint);
    await target.focus();
    const after = await target.evaluate(paint);
    const isFocusVisible = await target.evaluate((element) => element.matches(":focus-visible"));
    focus[id] =
      isFocusVisible &&
      ((after.outline !== "none" && after.outline !== before.outline) ||
        (after.boxShadow !== "none" && after.boxShadow !== before.boxShadow));
  }
  const facts = await page.evaluate(
    ({ factProperties, divergenceProperties }) => {
      const pick = (style, properties) =>
        Object.fromEntries(properties.map((property) => [property, style[property]]));
      const facts = { snapshot: {} };
      for (const element of document.querySelectorAll("[id]")) {
        const style = getComputedStyle(element);
        facts[element.id] = pick(style, factProperties);
        facts.snapshot[element.id] = pick(style, divergenceProperties);
      }
      const dialog = document.getElementById("dialog");
      dialog.showModal();
      facts.dialog = pick(getComputedStyle(dialog), factProperties);
      facts.backdrop = pick(getComputedStyle(dialog, "::backdrop"), factProperties);
      dialog.close();
      const backgrounds = [document.body, document.documentElement].map(
        (element) => getComputedStyle(element).backgroundColor
      );
      facts.pageBackground =
        backgrounds.find(
          (color) =>
            color !== "transparent" &&
            !(color.startsWith("rgba") && parseFloat(color.split(",")[3]) === 0)
        ) ?? "rgb(255, 255, 255)";
      return facts;
    },
    { factProperties, divergenceProperties }
  );
  const overrideLoss = {};
  for (const [variant, authorCss] of Object.entries(authorVariants)) {
    await page.setContent(fixture(resetCss, authorCss));
    overrideLoss[variant] = await page.evaluate((expected) => {
      const misses = [];
      for (const element of document.querySelectorAll(".override")) {
        const style = getComputedStyle(element);
        for (const [property, value] of Object.entries(expected)) {
          if (style[property] !== value) misses.push(`${element.localName}.${property}`);
        }
      }
      return misses;
    }, expectedOverride);
  }
  return { ...facts, focus, overrideLoss };
}

const engines = { chromium, firefox, webkit };
const results = Object.fromEntries(resets.map((reset) => [reset.name, {}]));
const sheets = await Promise.all(resets.map(loadCss));
const versions = [];
for (const [engine, browserType] of Object.entries(engines)) {
  const browser = await browserType.launch();
  versions.push(`${engine} ${browser.version()}`);
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  for (const [index, reset] of resets.entries()) {
    results[reset.name][engine] = await measure(page, sheets[index]);
  }
  await browser.close();
}

const engineNames = Object.keys(engines);
// Engines round lengths differently (Firefox to 1/64 px, WebKit to float noise); half a pixel separates
// rounding from a real divergence.
const sameValue = (a, b) => {
  if (a === b) return true;
  const numbers = (value) => String(value).match(/-?[\d.]+/g);
  const [x, y] = [numbers(a), numbers(b)];
  if (!x || !y || x.length !== y.length) return false;
  if (String(a).replace(/-?[\d.]+/g, "") !== String(b).replace(/-?[\d.]+/g, "")) return false;
  return x.every((value, i) => Math.abs(value - y[i]) <= 0.5);
};
const overrideTotal =
  engineNames.length *
  Object.keys(expectedOverride).length *
  (fixture("", "").match(/class="override"/g) ?? []).length;
const baseline = results["no reset"].chromium.text;
console.log(`Engines: ${versions.join(", ")}\n`);
console.log(
  "| Reset | Fail-safe checks | Cross-engine diffs | Unlayered author CSS lost | Layered author CSS lost | Imposed font/line-height |"
);
console.log("| --- | --- | --- | --- | --- | --- |");
const details = [];
for (const { name } of resets) {
  const byEngine = results[name];
  const failures = [];
  for (const [label, criterion, test] of checks) {
    const failing = engineNames.filter((engine) => !test(byEngine[engine]));
    if (failing.length)
      failures.push(
        `${label} (${criterion}; ${failing.length === 3 ? "all engines" : failing.join(", ")})`
      );
  }
  let diffs = 0;
  for (const id of Object.keys(byEngine.chromium.snapshot)) {
    for (const property of divergenceProperties) {
      const values = engineNames.map((engine) => byEngine[engine].snapshot[id][property]);
      if (values.some((value) => !sameValue(value, values[0]))) diffs++;
    }
  }
  const lost = (variant) =>
    engineNames.flatMap((engine) =>
      byEngine[engine].overrideLoss[variant].map((miss) => `${engine}: ${miss}`)
    );
  const imposed =
    byEngine.chromium.text.fontFamily !== baseline.fontFamily ||
    byEngine.chromium.text.lineHeight !== baseline.lineHeight;
  console.log(
    `| ${name} | ${checks.length - failures.length}/${checks.length} | ${diffs} | ${lost("unlayered").length}/${overrideTotal} | ${lost("layered").length}/${overrideTotal} | ${imposed ? "yes" : "no"} |`
  );
  if (failures.length || lost("unlayered").length)
    details.push(
      `- ${name}: ${[...failures, ...lost("unlayered").map((miss) => `unlayered override lost (${miss})`)].join("; ")}`
    );
}
console.log(`\nFailures:\n${details.join("\n")}`);
console.log(
  "\nScope: one fixture, default light mode, desktop engines from the pinned Playwright. It measures reset mechanisms, not agent outcomes."
);
