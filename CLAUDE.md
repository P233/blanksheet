# CLAUDE.md

## Project Overview

**Blanksheet** — A principled CSS reset for custom design systems — eliminates hidden defaults, preserves text semantics, outputs a blank canvas.

## Design Principles

### 1. Eliminate hidden layout

Zero all margin, padding, border, and positioning properties that affect spatial layout without the developer's knowledge.

Applies to: box-model properties on all elements with non-zero UA defaults, `vertical-align` on replaced/embedded elements (baseline gap), `border-spacing` on tables.

**Boundary:** Layout properties only. Visual properties (`background`, `color`, `font-size`) are out of scope — governed by principles 2 and 3.

### 2. Preserve text semantics

Never reset a property whose UA value carries semantic meaning: `font-weight: bold` on `<strong>`, `font-style: italic` on `<em>`, `text-decoration: underline` on `<a>`, `color` on `<a>`, `text-decoration: line-through` on `<del>`, `font-size` on headings / `<small>` / `<sub>` / `<sup>`, `text-align: center` on `<th>` / `<caption>`, `quotes` on `<q>`, `font-family: monospace` on `<pre>` / `<code>` / `<kbd>` / `<samp>`, `background-color` on `<mark>`.

**The test:** Does removing this declaration make the element visually indistinguishable from unstyled text? If yes — semantic → keep.

**Boundary:** Semantic status is element-scoped. `border` on `<hr>` is layout; `text-decoration` on `<a>` is semantic. Same property, different classification.

### 3. Skip what users always override

If a property is universally overridden in production, resetting it adds a wasted declaration. Skip it.

- Heading `font-size` — every project defines its own type scale.
- Form control `border`, `background` — every project restyles form visuals.
- Dialog `border`, `background`, `color` — always restyled as a complete visual component.
- `::backdrop` background — UA semi-transparent black is more useful than `transparent`.
- `meter`, `progress` — design systems replace these entirely with custom components.
- Date/time inputs (`date`, `time`, `datetime-local`, `month`, `week`), `color`, `range` — design systems replace the entire native control.

**Boundary:** "Always" means no realistic production scenario keeps the UA value. This applies at both the property level (skip a property on an element that is used) and the element level (skip an element that design systems replace entirely).

**Conflict with principle 1:** A property can be both hidden layout and universally overridden. Principle 3 wins — no point resetting what gets immediately overwritten. Form control `border` is the canonical example.

### 4. Apply real-world universal defaults

Defaults so broadly expected in production that omitting them forces every project to write the same boilerplate. Must be correct — not merely convenient — for the vast majority of real-world use cases.

- `body { margin: 0 }`
- `list-style: none` on `<ul>`, `<ol>`, `<menu>`
- `border-collapse: collapse` on `<table>`
- `font: inherit`, `color: inherit` on form controls — fixing the UA inheritance quirk.
- `box-sizing: border-box` on all elements.
- `input[type="number"]` spinners — virtually always custom-built → remove.

**Boundary:** Must be correct for the vast majority of real-world projects. If a default is merely convenient but could break legitimate use cases, it doesn't belong here.

### 5. Normalize cross-browser inconsistencies

Where browsers disagree on rendering, standardize.

- `sub` / `sup` — preserve positioning, prevent line-height disruption.
- `[type="search"]` — remove non-standard WebKit appearance.
- `button::-moz-focus-inner` — remove Firefox's extra inner padding/border.
- `-webkit-text-size-adjust: 100%` — prevent mobile text inflation (Safari requires `-webkit-` prefix).
- `::placeholder` — Firefox renders at reduced opacity, Chrome/Safari don't → normalize to `opacity: 1`.
- `:-moz-ui-invalid` — Firefox adds red `box-shadow` on invalid form elements, Chrome/Safari don't → remove.

**Boundary:** Addresses inter-browser divergence only. If all browsers agree, apply principles 1–4 instead.

**P4 vs P5 distinction:** P5 applies when browsers *disagree* on rendering the same element (one browser does X, another doesn't). P4 applies when all browsers *agree* on a default that is virtually always overridden (spinners exist in all browsers → P4). A single rule can serve different principles for different selectors (e.g. `[type="search"]` is P5, `[type="number"]` is P4, but they share the same declaration).

### What Blank never does

- **No opinions.** No `cursor: pointer`, `text-wrap: balance`, `font-smoothing`, `scroll-behavior: smooth`. A reset subtracts — never adds behavior.
- **No `!important`.** If a reset needs `!important`, the architecture is wrong.
- **No structural elements.** `div`, `span`, `section`, `nav`, `header`, `footer`, `main`, `form`, `label` — no meaningful UA defaults.

## Architecture

Single file: `blanksheet.css`. Everything inside one `@layer reset` block — lowest cascade priority.

```
@layer reset {
  selector { ... }
  selector { ... }
}
```

Modern browsers only: Chrome 99+, Firefox 97+, Safari 15.4+. No IE, no legacy fallbacks.

## Decision Examples

| Scenario | Decision | Principle |
|---|---|---|
| `h1 { margin: 0 }` | Reset | P1: hidden layout |
| `h1 { font-size: inherit }` | Skip | P3: always overridden |
| `h1 { font-weight: inherit }` | Keep | P2: text semantic |
| `strong { font-weight: inherit }` | Keep | P2: text semantic |
| `a { color: inherit }` | Keep | P2: text semantic |
| `del { text-decoration: none }` | Keep | P2: text semantic |
| `ul { list-style: none }` | Reset | P4: virtually always needed |
| `button { border: 0 }` | Skip | P3: always overridden |
| `button { background: none }` | Skip | P3: always overridden |
| `button { font: inherit }` | Reset | P4: fixing UA inheritance quirk |
| `fieldset { border: 0 }` | Reset | P1: hidden layout |
| `hr { border: 0 }` | Reset | P1: hidden layout |
| `iframe { border: 0 }` | Reset | P1: hidden layout |
| `dialog { border: 0 }` | Skip | P3: always overridden (complete visual component) |
| `:root { font-size: 16px }` | Skip | UA default already 16px; explicit px overrides user browser preferences |
| `:root { line-height: 1 }` | Skip | UA `normal` (~1.2) is readable; `1` makes unstyled text unreadable |
| `button { cursor: pointer }` | Never | Opinion, not a reset |
| `::backdrop { background: transparent }` | Skip | P3: UA default more useful |
| `::placeholder { opacity: 1 }` | Reset | P5: Firefox reduced opacity, others full → normalize |
| `:-moz-ui-invalid { box-shadow: none }` | Reset | P5: Firefox-only red box-shadow → remove |
| `[type="number"] { appearance: textfield }` | Reset | P4: spinners virtually always custom-built (all browsers agree) |
| `[type="search"] { appearance: textfield }` | Reset | P5: WebKit non-standard appearance (browsers disagree) |
| `meter`, `progress` | Skip | P3: design systems replace entirely with custom components |
| `[type="date"]`, `[type="time"]`, etc. | Skip | P3: design systems replace entire native control |
| `fieldset { min-inline-size: 0 }` | Skip | Overflow is a visible bug for devs to fix, not hidden layout |
| `[type="button"]::-moz-focus-inner` | Skip | `<input type="button/submit/reset">` not used in custom design systems |
| `input[type="image"]` | Skip | P3: rarely used in modern development; design systems use `<button>` + `<img>`/SVG instead |
| Form controls `appearance: none` | Skip | P3: modern browsers auto-disable native appearance when custom `background`/`border` is set; checkbox/radio are hidden+replaced in design systems, not restyled via `appearance: none`; native appearance serves as visible placeholder during development |

## Code Conventions

- **Comments**: Each section references which principles apply — `[Principle N]` annotations.
- **Selector grouping**: Group elements that share the same reset. Prefer fewer rules.
- **Property order**: Enforced by stylelint (recess-order). Auto-fixed on commit.

## Section Order

1. Box Model (`*, *::before, *::after`)
2. Root & Body
3. Sections (h1–h6)
4. Grouping Content (p, blockquote, pre, figure, hr, dl, dd)
5. Text-level Semantics (sub, sup)
6. Lists (ul, ol, menu)
7. Table (table, th, td)
8. Forms (button, input, select, textarea, fieldset, legend)
9. Embedded / Media (img, video, audio, canvas, svg, iframe, embed, object)
10. Interactive (dialog, summary)

## Toolchain

- **stylelint** (`stylelint-config-recess-order` + `stylelint-prettier`) — lints and formats `blanksheet.css` on pre-commit
- **lightningcss-cli** — builds `blanksheet.min.css` via `pnpm build`
- **husky + lint-staged** — runs stylelint on staged CSS files before every commit

## File Distribution

- `blanksheet.css` — Source with full comments (development)
- `blanksheet.min.css` — Minified (production, built by `pnpm build`)
- `test.html` — Visual reference page
- `README.md` — Documentation
