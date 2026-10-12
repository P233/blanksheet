# Blanksheet

[![npm](https://img.shields.io/npm/v/blanksheet)](https://www.npmjs.com/package/blanksheet)
![size](https://img.shields.io/badge/size-%3C1KB_gzip-blue)
[![License: MIT](https://img.shields.io/npm/l/blanksheet)](LICENSE)

A CSS reset that gives humans and agents a blank sheet to start a project on. Each browser default in scope is **blanked**, **normalized** or kept as a documented **survivor** (B/N/S), so you know which styles are yours and which the browser still supplies.

## Usage

**CDN** — pin the major version; the unversioned URL tracks `latest`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/blanksheet@2" />
```

**npm**

```sh
npm install blanksheet
```

```css
@import "blanksheet";
```

## The Idea

A new project should start from a blank sheet: no spacing or chrome you did not write, the same rules in every browser, and nothing missing that a page needs to stay readable and usable. Blank does not mean broken: links still read as links and focus stays visible before any CSS is written. Blanksheet prepares that sheet, for a person or an agent, by five principles:

1. **Start blank** ([B]) — margins, paddings, list markers, heading sizes and the native chrome of text fields, buttons and selects are cleared, and form controls inherit the page's font and color, except native widgets such as date and range inputs. Layout and look are yours to write.
2. **Start the same everywhere** ([N]) — where a blank is unsafe or engines disagree, one shared policy: `border-box`, a 1px frame in the text color on de-chromed controls, `hr` as a 1px line, collapsed tables, code at the text size, `sub`/`sup` that keep the line height, disabled controls in `GrayText`.
3. **Keep the meaning** ([S]) — link color and underline, `strong`, `em`, `del`, `code`, `mark` and bold headings.
4. **Keep it usable** ([S]) — focus indicators, checkbox and radio, and native widgets such as the select arrow, date and range inputs, the `summary` triangle and the dialog panel.
5. **Respect the reader** ([S]) — the `html` font family and size and the system colors stay with the browser and the user.

No opinions: values follow the text (`inherit`, `currentColor`, `em`) or the system (`GrayText`), with no brand colors, font stacks, radii, `!important` or behavior the browser never had.

Scope: the browser defaults for flow content and form controls in the HTML standard's Rendering section. Interaction chrome, such as selection, scrollbars, spellcheck marks and engine-drawn control parts, stays native as documented survivors. Obsolete markup is out of scope: presentational attributes and elements like `tt` or `xmp` get no special handling. Within this scope, an undocumented difference between engines is a bug.

`blanksheet.css` is the full specification: every rule carries its B/N/S label and reason. It ships next to the minified entry.

## An Unstyled Page

- Text fields, buttons and selects are transparent, framed in the text color, with no padding. Selects keep their arrow (except in iOS Safari before 26); set `appearance: none` for a custom arrow, square corners or padding (Safari ignores padding on a native select).
- Placeholders take the input's text color; dim them to tell a hint from a value.
- Headings are body-size and bold. Lists lose their markers but keep their semantics.
- Date fields and the file button keep their native colors, which follow `color-scheme`. The select dropdown's popup does too, but its options inherit the select's text color. On a dark theme, set `color-scheme: dark`; if the page recolors text without a matching `color-scheme`, style `option` as well.
- The `summary` triangle, the dialog panel and the modal backdrop stay until your components replace them.

## Why It Suits Agents

An agent writes CSS for a page it cannot fully see, on top of defaults it has to guess. A blank sheet removes most of that guesswork:

- **A known starting point.** An agent has to infer which browser defaults a reset leaves in place. Blanksheet states its starting point in one readable file, with the reason for every rule and every survivor, so the agent reads the contract instead of guessing.
- **Fewer engine surprises.** In-scope differences are evened out or documented, so CSS checked in one browser carries fewer engine-specific defaults into the others. The documented exceptions, such as select padding in Safari and `color-scheme` on native widgets, are the ones to handle explicitly.
- **A safe failure mode.** Agents skip elements, and content arrives after the CSS is written. Whatever stays unstyled remains readable and operable: links look like links, focus stays visible and controls keep a frame. A missed element looks plain, not broken.
- **CSS that wins without a fight.** Everything sits in `@layer reset` without `!important`, so the agent's rules apply without specificity tricks, and there are no font stacks, colors or radii to discover and undo.
- **Less to write and review.** Implicit margins and chrome are already gone and nothing aesthetic is imposed, so the agent's stylesheet holds the design, not cleanup, and a human reviewer reads it against the same contract.

It is a starting point, not an accessibility guarantee: restyled components still need checking in a browser.

Point the agent at the contract in the project's agent instructions:

```md
CSS starts from Blanksheet: read node_modules/blanksheet/blanksheet.css before writing styles, keep component CSS unlayered or in a layer after `reset`, keep keyboard focus visible and check the result in a browser.
```

## Cascade Layers

All rules live in `@layer reset`, so unlayered styles win regardless of specificity or order. If you layer your own CSS, declare `reset` first so your layers rank above it:

```css
@layer reset, base, components;
```

## Browser Support

Chrome 99+, Firefox 97+ and Safari 15.4+ (`<dialog>` needs Firefox 98). Automated tests run in current Chromium, Firefox and WebKit; Safari with VoiceOver, Windows High Contrast, mobile native controls and the minimum versions remain manual checks.

## Upgrading from 1.x

2.0 rebuilds the 1.x principles around B/N/S, and several elements change appearance: form controls get a 1px frame instead of native chrome, headings take the body size, fieldsets and iframes lose their borders, and number spinners, the `summary` triangle and the dialog padding return. Review forms, headings, `hr`, `sub`/`sup`, code, dialogs and `summary` before upgrading; the [changelog](CHANGELOG.md) lists every change.

## Development

Use the pnpm version pinned in `package.json` (Corepack or a matching install):

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium firefox webkit
pnpm lint:check
pnpm format:check
pnpm test
npm pack
```

`pnpm test` builds the CSS, runs the browser regressions and checks the package; `prepack` rebuilds the minified file on every pack and publish. `kitchen-sink.html` shows every element for manual checks.

## License

MIT
