# Blanksheet

[![npm](https://img.shields.io/npm/v/blanksheet)](https://www.npmjs.com/package/blanksheet)
![size](https://img.shields.io/badge/size-<1KB-blue)
[![License: MIT](https://img.shields.io/npm/l/blanksheet)](LICENSE)

A principled CSS reset — eliminates implicit defaults, preserves text semantics, skips what you'll override anyway.

## Principles

1. **Eliminate implicit layout** — zero margin, padding, vertical-align. Purely spatial properties only.
2. **Preserve text semantics** — keep any UA style that visually conveys meaning (`<strong>` bold, `<em>` italic, `<a>` color/underline, `<del>` strikethrough, heading weight, `<code>` monospace).
3. **Skip what developers always override** — heading `font-size`, `border`, `background`, dialog visuals, `::backdrop`. Elements always replaced with custom components (`<meter>`, `<progress>`, specialized inputs) are also skipped.
4. **Apply real-world universal defaults** — `list-style: none`, `border-collapse`, form `font: inherit`, `box-sizing: border-box`, number spinner removal.
5. **Normalize cross-browser inconsistencies** — `sub`/`sup` line-height, WebKit search appearance, Firefox `::-moz-focus-inner`, mobile `text-size-adjust`, `::placeholder` opacity, Firefox `:-moz-ui-invalid`.

No opinions (`cursor: pointer`, `font-smoothing`). No `!important`. No structural elements (`div`, `span`, `section`).

## How It Works

All rules live inside `@layer reset` — the lowest cascade priority. Any unlayered style wins automatically, regardless of specificity or source order.

```css
@layer reset {
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 0;
    /* font-weight: kept (text semantics); font-size: skipped (always overridden) */
  }
}
```

Chrome 99+, Firefox 97+, Safari 15.4+.

## Usage

**CDN**

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/blanksheet" />
```

**npm**

```sh
npm install blanksheet
```

```css
@import "blanksheet";
```

## License

MIT
