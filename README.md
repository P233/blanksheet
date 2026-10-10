# Blanksheet

[![npm](https://img.shields.io/npm/v/blanksheet)](https://www.npmjs.com/package/blanksheet)
![size](https://img.shields.io/badge/size-%3C1KB_gzip-blue)
[![License: MIT](https://img.shields.io/npm/l/blanksheet)](LICENSE)

A CSS reset with an explicit baseline for humans and agents. Every browser default in scope is **blanked**, **normalized** or kept as a documented **survivor** (B/N/S), so authors know which styles they own and which the browser still supplies.

It does not promise identical pixels across engines, fonts, native controls or user settings, and it does not replace browser and accessibility testing.

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

## What It Does

1. **Removed** — margins and paddings, list markers, heading font sizes, the native chrome of text fields, buttons and selects, and the borders of fieldsets and iframes. Form controls inherit the page's font, color and letter and word spacing.
2. **Normalized** — `box-sizing: border-box`; a 1px frame in the text color on text fields, buttons and selects; `hr` as a 1px line in the text color; collapsed table borders; code at the surrounding text size; `sub`/`sup` that don't stretch the line; textareas aligned to the line bottom; placeholders in the input's text color; disabled controls in the system `GrayText` color; modal dialogs allowed to fill the viewport.
3. **Kept** — meaning written in the HTML, native affordances and the reader's settings (below).

Values follow the text (`inherit`, `currentColor`, `em`), use system colors (`GrayText`) or structural minimums (`1px`): no brand color, font stack, line-height scale or radius. Blanksheet adds nothing the browser never had (`cursor: pointer`, font smoothing, `text-wrap`), uses no `!important` or `all: unset`, and leaves structural elements like `div` alone. Media keep their `display`, so `hidden` still works.

An undocumented cross-engine difference within this scope is a bug: it gets normalized or documented.

## What It Keeps

- **Meaning in the HTML** — `strong`/`b` weight (as `bolder`), italics (`em`, `i`, `cite`, `dfn`, `var`, `address`), `a` color and underline, `u`/`ins`/`abbr` underlines, `s`/`del` strikes, `small` size, `mark` highlight (fixed yellow and black — mind dark themes), `q` quotes, monospace code, bold centered `th`, centered `caption`, and bold headings.
- **Accessibility** — native focus indicators (removing one without a visible replacement can fail [WCAG 2.4.7](https://www.w3.org/WAI/WCAG22/Techniques/failures/F78)), checkbox and radio appearance (forced colors cannot restore it once removed), and the mobile tap highlight. Control frames and the dialog border give forced colors borders to recolor.
- **Native affordances and internals** — select arrows (iOS Safari before 26 hides them once the background is reset; macOS Safari keeps a rounded select shape), number spinners, the `summary` triangle, the dialog panel, modal backdrop and positioning, search clear buttons, `input[list]` arrows and the textarea resize handle; `date`, `time`, `datetime-local`, `month`, `week`, `color`, `range`, file and image inputs, `meter`, `progress`, option and listbox rendering, autofill highlights, ruby layout, inline SVG clipping, scrollbars and spellcheck marks. Date and time inputs, `color` and `range` keep their native text color and disabled style, as does the file button.
- **The reader's settings** — the `html` font family, size and line height, selection colors, and system-color resolution (`GrayText` is not a fixed gray; forced colors may recolor placeholders).

## What an Unstyled Page Looks Like

- Text fields, buttons and selects are transparent with a 1px frame in the text color and no padding. Button labels stay centered, selects keep their arrow (except in iOS Safari before 26) and number inputs their spinners; set `appearance: none` for a custom arrow or square corners.
- Placeholders match the input text; dim them yourself to tell a hint from a value.
- Disabled controls turn `GrayText`, text and frame alike; date and time inputs, `color`, `range` and the file button keep their native disabled style.
- Native surfaces (date fields, the file button, the select dropdown) follow `color-scheme`, not the text color: on a dark theme, set `color-scheme: dark` too.
- Headings are body-size and bold.
- `hr` is a 1px line on its block-start edge, so it follows the writing mode; in a flex row it has no width.
- `summary` keeps its triangle. To replace it, set `list-style: none`, plus `::-webkit-details-marker { display: none }` for Safari before 18.4.
- `dialog` keeps the browser panel and a modal keeps its backdrop; a modal may grow to the full viewport.

## How It Works

All rules live in `@layer reset`, so unlayered styles win regardless of specificity or order. If you layer your own CSS, declare the reset first; otherwise a layer declared before the import puts `reset` above yours:

```css
@layer reset, base, components;
```

The specification is `blanksheet.css`, shipped next to the minified entry (`node_modules/blanksheet/blanksheet.css`; the minified file's banner points to it). Every decision is labeled `[B]`, `[N]` or `[S:class]` with a short reason. Agents should read the specification and this page before generating component styles, declare the layer order, keep keyboard focus visible and inspect the rendered result. What an agent forgets to style stays usable: controls keep a frame, and links, emphasis, focus indicators and native pickers survive. B/N/S is a styling contract, not a component library or an accessibility guarantee.

## Browser Support

Targets Chrome 99+, Firefox 97+ and Safari 15.4+ (`<dialog>` needs Firefox 98). Lists use `list-style-type: ""` rather than `none` so Safari keeps their semantics; browsers without string markers (Chrome < 79, Firefox < 39, Safari < 14.1) show bullets instead.

`pnpm test` runs Chromium, Firefox and WebKit from the pinned Playwright in light, dark and emulated forced-colors modes. It checks source/minified parity, cascade order, control frames, survivor controls, inherited typography, disabled and placeholder colors, `hidden`, keyboard focus, `details` and modal dialogs. It does not cover shipping Safari with VoiceOver, Windows High Contrast, mobile native controls or the minimum versions; those remain manual checks.

## Upgrading from 1.x

2.0 replaces the five principles of 1.x with B/N/S. Visible changes: form controls get a 1px frame instead of native chrome; fieldsets and iframes lose their borders; headings take the body size; `sub`/`sup` use the browser size instead of 75%; number spinners and the `summary` triangle reappear; dialogs regain the browser padding; date and time inputs, `color` and `range` keep their native text color; `hr`, placeholders, code text and disabled controls follow the new policies; and in older Chrome and Safari, `strong`/`b` inside light text render lighter (`bolder`). Review these elements before upgrading; the [changelog](CHANGELOG.md) has the details.

## Development and Release Checks

Use the pnpm version pinned in `package.json` (Corepack or a matching install):

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium firefox webkit
pnpm lint:check
pnpm format:check
pnpm test
npm pack
```

`pnpm test` builds the CSS, runs the browser regressions and packs the package from a clean directory; `prepack` rebuilds the minified file for every pack and publish. The package ships the two CSS files, README, changelog, license and `package.json`. `kitchen-sink.html` shows every element for manual checks; `tests/fixture.html` is the automated fixture.

## License

MIT
