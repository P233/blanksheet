import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { chromium, firefox, webkit } from "playwright";

const fixture = await readFile(new URL("fixture.html", import.meta.url), "utf8");
const stylesheets = await Promise.all(
  ["blanksheet.css", "blanksheet.min.css"].map(async (name) => [
    name,
    await readFile(new URL(`../${name}`, import.meta.url), "utf8")
  ])
);
const properties = [
  "display",
  "fontSize",
  "fontWeight",
  "fontStyle",
  "fontFamily",
  "lineHeight",
  "color",
  "backgroundColor",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderTopColor",
  "borderTopStyle",
  "borderRadius",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "appearance",
  "opacity",
  "listStyleType",
  "boxSizing",
  "verticalAlign",
  "textAlign",
  "letterSpacing",
  "wordSpacing",
  "textTransform",
  "textDecorationLine",
  "borderCollapse",
  "borderSpacing",
  "textIndent",
  "minInlineSize",
  "maxInlineSize",
  "maxBlockSize",
  "position",
  "top",
  "bottom",
  "overflowX",
  "overflowY"
];
const nativeColorIds = [
  "date",
  "time",
  "datetime-local",
  "month",
  "week",
  "color",
  "range",
  "disabled-date"
];
const survivorIds = ["checkbox", "radio", "file", "image", ...nativeColorIds];
const nativeChrome = [
  "appearance",
  "borderTopWidth",
  "borderTopStyle",
  "backgroundColor",
  "borderRadius"
];
// Survivor defaults compared against the engine's own value; keywords like -webkit-center vary.
const keptDefaults = {
  link: ["color", "textDecorationLine"],
  th: ["fontWeight", "textAlign"],
  caption: ["textAlign"],
  sub: ["fontSize"],
  sup: ["fontSize"],
  svg: ["overflowX", "overflowY"],
  listbox: ["verticalAlign"]
};
const nativeProperties = {
  ...Object.fromEntries(survivorIds.map((id) => [id, [...nativeChrome, "color", "opacity"]])),
  ...keptDefaults
};
const controlIds = ["button", "input", "textarea", "select", "search"];
const noMargin = { marginTop: "0px", marginRight: "0px", marginBottom: "0px", marginLeft: "0px" };
const noPadding = {
  paddingTop: "0px",
  paddingRight: "0px",
  paddingBottom: "0px",
  paddingLeft: "0px"
};

for (const [engine, browserType] of Object.entries({ chromium, firefox, webkit })) {
  // macOS WebKit uses Option-Tab to include buttons in native keyboard navigation.
  const nextControlKey = engine === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab";
  test(engine, async (t) => {
    const browser = await browserType.launch();
    t.after(() => browser.close());
    t.diagnostic(`${engine} ${browser.version()}`);

    for (const mode of ["light", "dark", "forced-colors"]) {
      await t.test(mode, async (t) => {
        const context = await browser.newContext({
          viewport: { width: 900, height: 700 },
          colorScheme: mode === "dark" ? "dark" : "light",
          forcedColors: mode === "forced-colors" ? "active" : "none"
        });
        t.after(() => context.close());
        let sourceStyles;

        for (const [filename, css] of stylesheets) {
          await t.test(filename, async (t) => {
            const page = await context.newPage();
            t.after(() => page.close());
            await page.setContent(fixture);
            const native = await page.evaluate(
              (nativeProperties) => ({
                ...Object.fromEntries(
                  Object.entries(nativeProperties).map(([id, properties]) => {
                    const computed = getComputedStyle(document.getElementById(id));
                    return [
                      id,
                      Object.fromEntries(
                        properties.map((property) => [property, computed[property]])
                      )
                    ];
                  })
                ),
                "file::file-selector-button": {
                  color: getComputedStyle(document.getElementById("file"), "::file-selector-button")
                    .color
                }
              }),
              nativeProperties
            );
            await page.addStyleTag({ content: css });

            const { styles, isForcedColors } = await page.evaluate((properties) => {
              const styles = {};
              for (const element of document.querySelectorAll("[id]")) {
                const computed = getComputedStyle(element);
                styles[element.id] = Object.fromEntries(
                  properties.map((property) => [property, computed[property]])
                );
              }
              for (const id of ["input", "textarea"]) {
                const computed = getComputedStyle(document.getElementById(id), "::placeholder");
                styles[`${id}::placeholder`] = { color: computed.color, opacity: computed.opacity };
              }
              for (const pseudo of ["::before", "::after"]) {
                styles[`paragraph${pseudo}`] = {
                  boxSizing: getComputedStyle(document.getElementById("paragraph"), pseudo)
                    .boxSizing
                };
              }
              const fileButton = getComputedStyle(
                document.getElementById("file"),
                "::file-selector-button"
              );
              styles["file::file-selector-button"] = {
                color: fileButton.color,
                fontFamily: fileButton.fontFamily,
                fontSize: fileButton.fontSize
              };
              return { styles, isForcedColors: matchMedia("(forced-colors: active)").matches };
            }, properties);

            if (sourceStyles)
              assert.deepEqual(styles, sourceStyles, "source/minified computed styles");
            else sourceStyles = styles;

            const expectStyle = (id, expected) => {
              for (const [property, value] of Object.entries(expected)) {
                assert.equal(styles[id][property], value, `${id}.${property}`);
              }
            };

            for (const id of ["paragraph", "paragraph::before", "paragraph::after"])
              expectStyle(id, { boxSizing: "border-box" });
            for (const id of [
              "body",
              "paragraph",
              "blockquote",
              "figure",
              "pre",
              "hr",
              "dl",
              "dd",
              "list",
              "ordered",
              "menu",
              "fieldset"
            ])
              expectStyle(id, noMargin);
            expectStyle("heading", {
              fontSize: styles.body.fontSize,
              fontWeight: "700",
              marginTop: "0px"
            });
            for (const id of ["code", "pre", "kbd", "samp"])
              expectStyle(id, { fontSize: styles.body.fontSize });
            expectStyle("strong", { fontWeight: "700" });
            expectStyle("light-strong", { fontWeight: "400" });
            expectStyle("em", { fontStyle: "italic" });
            for (const id of ["sub", "sup"])
              expectStyle(id, {
                position: "relative",
                lineHeight: "0px",
                verticalAlign: "baseline"
              });
            for (const [id, side, offset] of [
              ["sub", "bottom", -0.25],
              ["sup", "top", -0.5]
            ]) {
              const ratio = parseFloat(styles[id][side]) / parseFloat(styles[id].fontSize);
              assert.ok(Math.abs(ratio - offset) < 0.01, `${id}.${side}: ${styles[id][side]}`);
            }
            for (const id of ["th", "td", "legend", "fieldset"]) expectStyle(id, noPadding);
            for (const id of controlIds) {
              expectStyle(id, {
                ...noMargin,
                ...noPadding,
                fontFamily: styles.body.fontFamily,
                fontSize: styles.body.fontSize,
                wordSpacing: styles.body.wordSpacing,
                letterSpacing: styles.body.letterSpacing
              });
              if (!isForcedColors) expectStyle(id, { color: styles.body.color });
            }
            for (const id of survivorIds) expectStyle(id, { ...noMargin, ...noPadding });
            // The paragraph has no background; forced colors rewrite only the RGB of a transparent one.
            for (const id of ["input", "textarea", "button", "submit", "select", "search"]) {
              expectStyle(id, {
                backgroundColor: styles.paragraph.backgroundColor,
                borderTopWidth: "1px",
                borderTopStyle: "solid",
                borderTopColor: styles[id].color
              });
            }
            // WebKit keeps the drop-down select's rounded shape until appearance: none (override-select).
            for (const id of ["input", "textarea", "button", "submit", "listbox", "search"])
              expectStyle(id, { borderRadius: "0px" });
            expectStyle("search", { appearance: "textfield" });
            for (const id of [
              "upper-button",
              "upper-select",
              "upper-input-button",
              "upper-submit",
              "upper-reset"
            ])
              expectStyle(id, { textTransform: "uppercase" });
            expectStyle("upper-text", { textTransform: "none" });
            for (const id of ["input", "textarea"]) {
              expectStyle(`${id}::placeholder`, { opacity: "1" });
              if (!isForcedColors) expectStyle(`${id}::placeholder`, { color: styles[id].color });
            }
            expectStyle("textarea", { verticalAlign: "bottom" });
            for (const id of [
              "disabled-input",
              "disabled-button",
              "disabled-select",
              "disabled-textarea"
            ]) {
              expectStyle(id, { color: styles["system-disabled"].color, opacity: "1" });
            }
            for (const id of ["hidden", "hidden-img"]) expectStyle(id, { display: "none" });
            for (const id of ["list", "ordered", "menu"])
              expectStyle(id, { listStyleType: '""', paddingLeft: "0px" });
            expectStyle("hr", {
              color: styles.body.color,
              borderTopWidth: "1px",
              borderTopColor: styles.hr.color
            });
            expectStyle("vertical-hr", { borderTopWidth: "0px", borderRightWidth: "1px" });
            expectStyle("table", {
              borderCollapse: "collapse",
              borderSpacing: "0px",
              textIndent: "0px",
              borderTopColor: styles.table.color
            });
            expectStyle("fieldset", { minInlineSize: "0px" });
            expectStyle("override", { marginTop: "12px", fontSize: "30px" });
            expectStyle("layered", { marginTop: "9px", fontSize: "27px" });
            for (const id of ["override-select", "layered-select"]) {
              expectStyle(id, {
                appearance: "none",
                paddingTop: "6px",
                paddingRight: "14px",
                paddingBottom: "6px",
                paddingLeft: "14px",
                borderRadius: "0px"
              });
            }
            expectStyle("nonmodal", { maxInlineSize: "none", maxBlockSize: "none" });
            for (const id of [
              "img",
              "video",
              "audio",
              "canvas",
              "svg",
              "iframe",
              "embed",
              "object"
            ])
              expectStyle(id, { verticalAlign: "bottom" });
            expectStyle("iframe", { borderTopWidth: "0px" });
            for (const id of survivorIds) {
              const { color, opacity, ...chrome } = native[id];
              expectStyle(id, nativeColorIds.includes(id) ? { ...chrome, color, opacity } : chrome);
            }
            for (const id of Object.keys(keptDefaults)) expectStyle(id, native[id]);
            for (const id of ["file", "image"]) expectStyle(id, { color: styles.recolored.color });
            expectStyle("file::file-selector-button", {
              color: native["file::file-selector-button"].color,
              fontFamily: styles.body.fontFamily,
              fontSize: styles.body.fontSize
            });
            assert.equal(isForcedColors, mode === "forced-colors");
            expectStyle("fieldset", { borderTopWidth: "0px" });
            for (const id of ["dialog", "nonmodal"]) expectStyle(id, { borderTopStyle: "solid" });
            expectStyle("select", { appearance: "auto" });
            assert.notEqual(styles.summary.listStyleType, "none", "summary keeps its marker");

            await page.locator("#focus-start").focus();
            await page.keyboard.press(nextControlKey);
            const focus = await page.locator("#button").evaluate((element) => ({
              isActive: document.activeElement === element,
              isFocusVisible: element.matches(":focus-visible"),
              outline: getComputedStyle(element).outlineStyle,
              width: getComputedStyle(element).outlineWidth
            }));
            assert.ok(
              focus.isActive &&
                focus.isFocusVisible &&
                focus.outline !== "none" &&
                focus.width !== "0px",
              "keyboard focus indicator survives"
            );

            await page.locator("#summary").focus();
            await page.keyboard.press("Enter");
            assert.ok(
              await page.locator("#details").evaluate((element) => element.open),
              "Enter opens details"
            );

            await page.locator("#dialog").evaluate((element) => element.showModal());
            const modal = await page.locator("#dialog").evaluate((element) => {
              const bounds = element.getBoundingClientRect();
              return {
                isInsideViewport:
                  bounds.top >= -1 &&
                  bounds.left >= -1 &&
                  bounds.bottom <= innerHeight + 1 &&
                  bounds.right <= innerWidth + 1,
                isScrollable:
                  element.scrollHeight > element.clientHeight &&
                  getComputedStyle(element).overflowY === "auto",
                hasFocusInside: element.contains(document.activeElement),
                maxBlockSize: getComputedStyle(element).maxBlockSize
              };
            });
            assert.deepEqual(modal, {
              isInsideViewport: true,
              isScrollable: true,
              hasFocusInside: true,
              maxBlockSize: "100%"
            });
            await page.keyboard.press(nextControlKey);
            assert.ok(
              await page.locator("#dialog-end").evaluate((element) => {
                const bounds = element.getBoundingClientRect();
                return (
                  document.activeElement === element &&
                  bounds.top >= 0 &&
                  bounds.bottom <= innerHeight
                );
              }),
              "keyboard reaches the end of oversized modal content"
            );
            await page.keyboard.press("Escape");
            assert.equal(
              await page.locator("#dialog").evaluate((element) => element.open),
              false,
              "Escape closes modal"
            );
          });
        }
      });
    }
  });
}
