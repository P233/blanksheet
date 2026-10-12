# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-10-12

Blanksheet now gives **humans and agents a blank sheet to start a project on**. The 1.x principles are rebuilt around three terminal states (Blank / Normalize / documented Survivor), which README presents as five principles. Normalization means a shared CSS policy, with documented native rendering and user-preference exceptions; it does not promise identical pixels. See the source comments for rule decisions and README for the consumer contract.

> **Breaking:** pages using affected elements may change appearance, including form controls, headings, hr, sub/sup, code blocks, fieldsets, iframes, dialogs and summary. Review these elements and restore component styling and visual cues when upgrading from 1.x. These changes ship together as version 2.0.0.

### Added

- **Repeatable release checks** — an offline Playwright fixture exercises Chromium, Firefox and WebKit, comparing source/minified rendering and checking cascade behavior, control frames, retained native chrome on survivor controls, typography, keyboard focus, details activation and modal reachability in light, dark and emulated forced-colors modes. A clean-directory packaging regression checks the production entry, distributed documentation and the gzip size claim. A contract test keeps every rule in a single `@layer reset`, and stylelint rejects `!important`, named behavioral additions and hex colors.
- **Explicit validation limits** — automated WebKit is not shipping Safari/VoiceOver, and forced-colors emulation is not Windows High Contrast. Mobile native controls and the minimum browser versions also remain manual validation gates.
- **Form text inheritance completed** — `letter-spacing: inherit` and `word-spacing: inherit` join the existing `font`/`color` inheritance fix on `button`/`input`/`select`/`textarea`; `text-align` stays the UA's, so button labels stay centered. `text-transform: inherit` applies to label controls only (button, select, button-type inputs): on a text field it would display a value that differs from the submitted one. `::file-selector-button { font: inherit }` covers the file input's inner button, whose own UA font declarations would otherwise win; its color stays native to match its native surface.
- **Comparative bench** — `pnpm bench` audits Blanksheet against pinned versions of other resets in Chromium, Firefox and WebKit; development only, not shipped.
- **Spec pointer in the minified entry** — a `/*! Blanksheet v2.0.0 | MIT | spec: blanksheet.css */` banner survives minification, so whoever reads the entry file (human or agent) finds the commented specification next to it.
- **Fieldset shrinking fix** — `fieldset { min-inline-size: 0 }`. The UA `min-content` default silently blocks shrinking in flex/grid layouts.
- **Textarea alignment normalized** — `textarea { vertical-align: bottom }`. Firefox aligns textareas at `text-bottom`, Chromium and WebKit at `baseline`, so the gap beneath an inline textarea differed per engine; `baseline` alone does not unify it, `bottom` closes it everywhere (the same call as media).
- **Modal dialog size clamp normalized** — `dialog:modal { max-inline-size: 100%; max-block-size: 100% }`. The modal-only UA `calc((100% - 6px) - 2em)` clamp silently caps author `width`/`height` (destyle.css#24). `100%` removes the magic formula while keeping the max + `overflow: auto` pair that keeps overlong modal content reachable (`none` would make it unreachable — WCAG 2.1.1/2.4.7). Scoped to `:modal`: non-modal dialogs have no UA max, and `100%` would clip them to a positioned ancestor's height. Engines without `:modal` (below Chrome 105 / Firefox 103 / Safari 15.6) drop only this rule and keep the UA clamp.
- **Monospace size quirk normalized** — `pre/code/kbd/samp { font-family: monospace, "monospace" }`. Engines render the bare generic `monospace` family at 13px; a two-item list disables the quirk, so the font size inherits normally. The quotes on the second item are load-bearing: lightningcss dedupes the bare `monospace, monospace` pair (lightningcss#1221).
- **Table determinism** — `border-spacing: 0` (lurks under `collapse`, surfaces if an author switches to `separate`), `text-indent: 0` and `border-color: currentColor` (Safari 15.4 leaks ancestor text-indent; Chrome 99 and Safari 15.4 paint gray borders; `currentColor` rather than `inherit`, which would import an ancestor's border color).
- **Disabled-state normalization** — `button/input/select/textarea:disabled { color: GrayText; opacity: 1 }`. The UA disabled grays are plain UA-origin declarations, so the form inheritance reset was already deleting them (author origin beats UA origin; `@layer` only orders the author origin) while divergent opacity dims survived (Chrome `select` 0.7, iOS WebKit 0.4). `GrayText` supplies a shared system-color policy, with platform/browser-dependent resolved colors. Scoped to the four controls — bare `:disabled` would gray a `fieldset:disabled` subtree wholesale — and not applied to the native-surface inputs below.
- **`b`/`strong` weight normalized** — `font-weight: bolder`. Gecko has always used `bolder`, Blink/WebKit shipped `bold` through much of the support matrix before converging on the spec's `bolder`; the divergence is visible in light-weight contexts (`bolder` over 300 computes 400, `bold` is 700).

### Changed

- **List semantics for VoiceOver** — `list-style-type: ""` replaces `list-style: none` on `ul`/`ol`/`menu`. Safari intentionally strips list semantics from the accessibility tree when `list-style` is `none`; the empty-string marker hides bullets while preserving semantics. String markers are supported by the whole support matrix (Safari 14.1+ / Chrome 79+ / Firefox 39+); engines older than the matrix now show bullets.
- **Form controls framed instead of native chrome** — `button`, `select`, `textarea` and text-type inputs get `background: none; border: 1px solid; border-radius: 0` (a `:not()` blacklist excludes the survivor input types, so unknown/future types land on the framed side). Devolution is spec-interoperable (CSS-UI-4), and the 1px currentColor frame keeps every control recognizable under the same policy in every engine: an empty field has no content to stay visible by, and a borderless button or select reads as plain text. Disabled controls follow `GrayText` through currentColor. Selects keep the engine's drop-down arrow, except in iOS Safari before 26, which hides it once the background is reset. `border: 0` on `fieldset` and `iframe`.
- **Heading `font-size: inherit`** — the heading level lives in the tag; the UA type scale is styling nobody wrote, and it diverges by engine version since the 2025 spec removal of section-nesting sizes. `font-weight: bold` is deliberately kept (owner ruling) so unstyled headings stay distinguishable — a documented divergence from destyle/Preflight.
- **`hr` normalized instead of kept** — `color: inherit; border: 0; border-block-start: 1px solid`. Engines paint and color the UA inset border differently; blanking would make a semantic element invisible (and unrecoverable in forced-colors mode). One deterministic 1px `currentColor` line, logical property so it follows writing mode.
- **`::placeholder` color normalized** — `color: inherit` joins the existing `opacity: 1`. The three UA renderings diverge structurally (Firefox tracks the input color at 54%; Chrome `#757575`; Safari `darkGray`), and `opacity` alone unified none of them. Normalized to "same as the input text" with zero constants; dimming the hint is the author's design decision.
- **Selectors anchored to their element** — `html` replaces `:root` (identical matching in HTML documents), and the `[type="search"]` rule plus its WebKit pseudo-element are scoped to `input`, so each rule's reach is explicit in the selector. Rendering is unchanged; the specificity changes (`html` is lower than `:root`, `input[type=…]` is higher than `[type=…]`) only matter inside the `reset` layer. Genuinely multi-element selectors (`::placeholder`, `::file-selector-button`) stay element-less.
- **Native-surface inputs keep native text color** — `date`, `time`, `datetime-local`, `month`, `week`, `color` and `range` inputs revert `color` and disabled `opacity` to the browser's own values. 1.x inherited the page text color onto native field backgrounds, which turned unreadable on pages that recolor text without `color-scheme`; the disabled normalization also no longer removes native dimming (iOS dims disabled range and color inputs via opacity).
- **Survivors ledger clarified** — documents native listbox option padding/indentation/typography and listbox alignment separately from dropdown internals, ruby annotation layout, option colors in native dropdown popups, macOS Safari ignoring padding on a native select, plus system-color resolution, forced-colors placeholder overrides, scrollbars and spellcheck indicators. Scope and validation limits replace blanket promises of pixel identity or exhaustive browser coverage. README now pins the CDN URL to the major version (`blanksheet@2`); 1.x documented the unpinned URL.
- README size badge reports gzip size (minified output is approximately 1.7 KB raw, 0.8 KB gzip).

### Fixed

- **Clean package generation** — `prepack` rebuilds `blanksheet.min.css` for both `npm pack` and publication. Previously, `prepublishOnly` left clean tarballs without their declared CSS entry or reused a stale local file. The package now also includes this changelog.
- **pnpm 11 native build setup** — pin the package manager and replace the obsolete `pnpm.onlyBuiltDependencies` field with an explicit `allowBuilds` entry in `pnpm-workspace.yaml`, so Lightning CSS's native executable is installed.

### Removed

- The P1–P5 principle framework in docs and source comments, including "skip what developers always override". Source comments now carry `[B]`/`[N]`/`[S:class]` annotations, and survivors are documented in the source comments for consumers and in AGENTS.md for maintainers.
- **`button::-moz-focus-inner { padding: 0; border: 0 }`** — Firefox's own UA notes that this inner padding never affected button size. The rule's only effect was hiding the dotted inner ring Firefox 97–139 draws on keyboard focus, part of the native focus indicator this reset retains (the `outline-style: auto` ring remains on de-chromed buttons). Firefox 140 removed these UA styles.
- **`sub`/`sup` `font-size: 75%`** — every engine's UA already sets `font-size: smaller`, so the 75% was an aesthetic constant inherited from Normalize.css, not a normalization. Sub- and superscripts render at the UA size again (about 83%); the line-height fix is unchanged.
- **Unprefixed `text-size-adjust`** — Safari reads only `-webkit-text-size-adjust`, and Chromium treats that name as an alias of the standard property, so the unprefixed declaration was redundant.
- **`dialog { padding: 0 }`** — the dialog keeps the browser's panel (padding, border, Canvas background) and the modal keeps its backdrop, so an unstyled dialog stays readable; components restyle both.
- **`summary { list-style: none }` and the Safari < 18.4 `summary::-webkit-details-marker` workaround** — the disclosure triangle is the engine-drawn expandable cue and now survives; components with their own icon remove it themselves.
- **Number spinner reset** — `[type="number"] { appearance: textfield }` and the `::-webkit-inner-spin-button`/`::-webkit-outer-spin-button` rules. Spinners are an engine-drawn stepping affordance; like the textarea resize handle they now survive, and components that draw their own controls remove them.
- **`:-moz-ui-invalid { box-shadow: none }`** — dead code in the entire support matrix: Firefox removed the red glow itself in Firefox 88 (bug 1693969) and the matrix floor is FF 97.

## [1.0.2] - 2026-03-10

### Fixed

- Safari < 18.4 workaround for `summary` marker removal (`summary::-webkit-details-marker`).

## [1.0.1] and earlier

See git history.
