# Benchmarks

A development-only audit of reset mechanisms. It does not ship in the npm package.

## Reset audit

`pnpm bench` loads Blanksheet and pinned versions of other resets into one fixture in Chromium, Firefox and WebKit, then asks what each reset leaves behind when nothing else styles an element.

Measured on 2026-10-12 with Chromium 153.0.8010.12, Firefox 155.0 and WebKit 26.6 from the pinned Playwright. Scope: one fixture in default light mode on desktop engines.

<!-- prettier-ignore -->
| Reset | Fail-safe checks | Cross-engine diffs | Layered author CSS lost | Sets font or line height |
| --- | --- | --- | --- | --- |
| **Blanksheet** | **16/16** | **0** | **1/189** | **no** |
| normalize.css 8.0.1 | 16/16 | 14 | 34/189 | yes |
| modern-normalize 3.0.1 | 16/16 | 14 | 31/189 | yes |
| sanitize.css 13.0.0 | 16/16 | 17 | 16/189 | yes |
| modern-css-reset 1.4.0 | 14/16 | 13 | 22/189 | yes |
| Eric Meyer Reset Styles (2007-04-12) | 12/16 | 17 | 61/189 | yes |
| reset-css 5.0.2 (Meyer-derived) | 12/16 | 17 | 61/189 | yes |
| Tailwind Preflight 4.3.3 | 10/16 | 2 | 1/189 | yes |
| destyle.css 4.0.1 | 8/16 | 1 | 123/189 | yes |
| the-new-css-reset 1.11.3 | 3/16 | 0 | 189/189 | no |
| No reset | 15/16 | 17 | 1/189 | no |

- **Fail-safe checks** — distinguishable links, emphasis and headings, boundaries on fields and buttons, visible keyboard focus (WCAG 1.4.1, 1.3.1, 1.4.11, 2.4.7), plus `hidden`, Safari list semantics, modal separation and code size.
- **Cross-engine diffs** — computed-style differences between the three engines on the same fixture, ignoring rounding within half a pixel.
- **Layered author CSS lost** — declarations from `@layer components` that the reset overrides. Every reset that keeps the native select loses one of them, because WebKit ignores padding on a native select.

The audit measures reset mechanisms, not pages an agent builds, and other resets serve other workflows: Preflight expects utility classes on every element. Pinned packages are fetched once into `bench/.cache/`.

Eric Meyer's [original Reset Styles post (2007-04-12)](https://meyerweb.com/eric/thoughts/2007/04/12/reset-styles/) is a historical comparison, loaded unchanged from a [local snapshot](vendor/meyer-2007-04-12/README.md) without a cascade layer or modern additions. It is distinct from the later `reset-css@5.0.2` package above; both were measured separately in this run and have the same aggregate scores on this fixture. The original fails the checks for strong emphasis, italic emphasis, heading distinction and Safari list-semantics preservation. Interpret differences against its historical scope, not as an overall quality ranking.

## Retired agent bench

An earlier bench had coding agents style pages on several resets. Once a page was styled, the resets differed mainly in content nobody had styled and in engine-specific defaults, which this audit and the browser tests in `tests/` measure directly without an agent in the loop. The harness was removed; reintroduce agent runs only for a question these direct checks cannot answer.
