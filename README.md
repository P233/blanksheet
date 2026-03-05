# Blanksheet

[![npm](https://img.shields.io/npm/v/blanksheet)](https://www.npmjs.com/package/blanksheet)
[![License: MIT](https://img.shields.io/npm/l/blanksheet)](LICENSE)

A principled CSS reset for custom design systems — eliminates hidden defaults, preserves text semantics, skips what you'll override anyway. < 1kB minified.

## Principles

1. **Eliminate hidden layout** — zero margin, padding, baseline gaps. Nothing running in background.
2. **Preserve text semantics** — keep any UA style that carries meaning (`<strong>` bold, `<em>` italic, `<a>` blue, `<del>` strikethrough, heading size/weight, `<code>` monospace).
3. **Skip what users always override** — heading `font-size`, form `border`/`background`, dialog visuals, `::backdrop`. Elements that design systems replace entirely (`meter`, `progress`, native date/time pickers) are also skipped.
4. **Apply real-world universal defaults** — `body { margin: 0 }`, `list-style: none`, `border-collapse`, form `font: inherit`, `box-sizing: border-box`, number spinner removal.
5. **Normalize cross-browser inconsistencies** — `sub`/`sup` line-height, WebKit search appearance, Firefox `::-moz-focus-inner`, mobile `text-size-adjust`, `::placeholder` opacity, Firefox `:-moz-ui-invalid`.

No opinions (`cursor: pointer`, `font-smoothing`). No `!important`. No structural elements (`div`, `span`, `section`).

## How It Works

All rules live inside `@layer reset` — the lowest cascade priority. Any unlayered style wins automatically, regardless of specificity or source order.

```css
@layer reset {
  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    /* font-size and font-weight: kept (text semantics) */
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
