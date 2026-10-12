# AGENTS.md

## Project Overview

**Blanksheet** — a CSS reset that gives humans and agents a blank sheet to start a project on: UA defaults in scope are blanked, normalized to a shared CSS policy, or documented as survivors.

## Mission

The goal is a blank sheet for starting a project, for agents and humans alike; agent-assisted CSS authoring is the primary use case. B/N/S makes the starting state explicit so an author can reason about what to style and what remains native. It supports iterative implementation and browser inspection. It does not assume one-pass generation is sufficient, and it does not guarantee pixel-identical rendering across engines, platforms, fonts or user preferences.

**Acceptance criterion:** an undocumented cross-engine difference within the stated scope is a bug to classify and either normalize or document as an intentional survivor. This is a maintenance rule, not proof that every browser default has been exhaustively tested.

**Scope:** the ledger covers the HTML Rendering section's UA defaults for flow content and form controls, audited against that spec chapter as the baseline checklist. Interaction-layer chrome (selection highlight, tap feedback, engine-drawn affordances like the search ✕, the select arrow, number spinners or the `input[list]` indicator, scrollbars, spellcheck squiggles) is never blanked wholesale — it is in scope only as survivors-ledger entries. Obsolete markup is out of scope: presentational attributes (`hr` `color`/`size`, `table` `bordercolor`/`cellspacing`, `iframe` `frameborder`, `body` `marginwidth`…) lose their hints to the reset's author-layer rules, as with any reset, and obsolete elements (`tt`, `listing`, `xmp`, `plaintext`…) keep their UA rendering, including the 13px monospace quirk.

## The model: one goal, three terminal states

Every UA default lands in exactly one terminal state:

1. **[B] Blank** — zeroed or inherited (margins, paddings, chrome, heading font-size, list markers). The default state whenever a blank value is reachable and safe.
2. **[N] Normalize** — blank is unreachable, unsafe, or replaced by a shared convention (`box-sizing: border-box`) → use one CSS policy (`border-collapse: collapse`, sub/sup offsets, the 1px currentColor border of `hr` and every de-chromed form control, placeholder text inheritance, monospace family list). **Value discipline:** relative values (`inherit`, `currentColor`, `em` offsets, `100%`), structural minimums (`1px`), and system channels (`GrayText`); no aesthetic constants (brand colors, custom font stacks, radii). A shared policy does not imply equal resolved colors, font metrics or pixels. Forced-colors overrides remain active.
3. **[S] Survivor** — a documented exemption, four classes:
   - **[S:internals]** — native rendering or functional mechanics deliberately retained (specialized inputs, meter/progress, select arrow and picker/listbox rendering, number spinners, file input, resize controls, the summary triangle, the dialog panel/backdrop and positioning). Some are author-stylable; this classification records a preservation decision, not universal technical inaccessibility.
   - **[S:semantic]** — visual meaning the author wrote into the HTML (strong/em/a/code…); blanking would lose information silently, and inline semantics are easy for agents and humans to forget to restyle.
   - **[S:a11y]** — focus indicators, checkbox/radio appearance, tap feedback and forced-colors control boundaries. Removing them would impose accessibility repair on every consumer. Disabled styling is [N], not a survivor.
   - **[S:preference]** — browser/OS/user channels (`html` font-family / font-size / line-height, selection, system colors and forced-colors overrides); fixed values would override user settings.

The old P1–P5 principle system (see git history) collapsed into this model: P1/P4 are sub-cases of [B], P5 grew into [N] and the acceptance criterion, P2 became [S:semantic], and P3 ("skip what developers always override" / "development placeholder") dissolved — its only surviving descendant is [S:internals]. README restates the model as five principles; keep them in step: Start blank ([B]), Start the same everywhere ([N]), Keep the meaning ([S:semantic]), Keep it usable ([S:a11y] and [S:internals]), Respect the reader ([S:preference]).

## Doctrine

- **Explicit baseline.** Every in-scope difference discovered during review needs a B/N/S decision. Prefer a shared CSS policy while preserving documented native and preference channels.
- **No behavioral additions.** No `cursor: pointer`, `text-wrap: balance`, `font-smoothing`, `scroll-behavior`. Normalizing a divergent UA value is in scope; adding behavior the UA never had is not.
- **No `!important`.** If a reset needs `!important`, the architecture is wrong.
- **No structural elements.** `div`, `span`, `section`, `nav`, `header`, `footer`, `main`, `form`, `label` — no meaningful UA defaults.
- **`@layer reset`** — lowest cascade priority. Any unlayered author CSS wins regardless of specificity or order. Consumers who layer their own CSS must declare `reset` first (`@layer reset, base, …`).

## Survivors ledger

Maintainers' source of truth for the retained defaults and native channels within the stated scope. It is not shipped: consumers get the contract from README and the source comments, so keep all three in agreement when behavior changes:

<!-- prettier-ignore -->
| Surviving rendering | Class | Why |
| --- | --- | --- |
| Native focus indicator | a11y | removal without a visible replacement can fail WCAG 2.4.7 (W3C F78); this reset never removes it globally |
| Checkbox / radio native appearance | a11y | forced-colors mode restores colors, never `appearance`; blanking breaks Windows High Contrast with no subtractive remedy |
| Tap-highlight flash (`-webkit-tap-highlight-color`, mobile WebKit/Blink) | a11y | touch feedback signal; owner ruling: untouched for now |
| `date` / `time` / `datetime-local` / `month` / `week` / `color` / `range` inputs (chrome, internals, text color and disabled dimming; margin, padding and the other text inheritance still reset; WebKit computes an author `display: block` on a date input as `flex`) | internals | `appearance: none` cannot blank engine-drawn internals; pseudo-elements are not equivalent across engines. `color`/`opacity: revert` keeps the native foreground paired with the native surface: inherited text on a native field turns unreadable on pages that recolor text without `color-scheme`, and iOS dims disabled range/color via opacity |
| `meter`, `progress` (whole element) | internals | same; replaced entirely in practice |
| Inline `svg` `overflow: hidden` | internals | the UA clips inline SVG to its viewport; set `overflow: visible` per graphic when drawing past the `viewBox` |
| `input[type="file"]` (chrome and internals; margin, padding and text inheritance still reset, plus button font; the button keeps its native color pair and text-transform, since its label is engine-generated) | internals | button box metrics differ per engine, Safari hardcodes the button–filename gap in C++, label text is engine/locale-generated |
| `input[type="image"]` | internals | replaced by `<button>` + `<img>` in practice. Its alt text has no native surface, so it inherits the page color; accepted cost: iOS no longer dims a disabled image input |
| Select picker internals (`option`, `optgroup`) — dropdown mode | internals | native picker rendering is platform-dependent, with limited and nonuniform author styling. Options inherit the select's text color while the popup keeps its native surface: pages that recolor text without `color-scheme` must style options |
| Listbox-mode `option` / `optgroup` padding, indentation and typography, plus the listbox's own `vertical-align` (`multiple` / `size > 1`) | internals | author-stylable but intentionally retained as native listbox rendering (alignment: Blink/Gecko `text-bottom`, WebKit `baseline`); do not claim the options are normalized by the outer select reset |
| Ruby annotation layout (`rt` size, `rt`/`rp` wrapping, `rt` line-height) | internals | engines implement ruby layout differently (WebKit sizes `rt` with its own `-webkit-ruby-text` keyword); restyle `rt` when annotation metrics matter |
| Search cancel ✕ (WebKit/Blink draw it, Gecko doesn't) | internals | owner ruling: untouched for now |
| Select drop-down arrow (Blink/Gecko chevron, WebKit double chevron) and macOS Safari's rounded drop-down shape | internals | picker affordance; survives border/background devolution, except in iOS Safari before 26, which paints the arrow as part of the background and drops it once one is set (verified on iOS 18.3; the frame keeps the select findable). macOS Safari keeps drawing its rounded control shape (it ignores `border-radius: 0`) and computes author padding as 0 until `appearance: none` (verified in Playwright WebKit; Chromium and Firefox apply it). Components that need square corners, padding or their own arrow set `appearance: none` |
| Number input spinners (Blink on hover, Gecko/WebKit always) | internals | stepping affordance kept like the textarea resize handle; components remove it themselves |
| `input[list]` indicator arrow (Blink `::-webkit-calendar-picker-indicator`, WebKit `::-webkit-list-button`, Gecko none) | internals | engine-drawn, non-standard pseudos; hide per-engine if unwanted |
| Autofill highlight (`:autofill`) | internals | engine-enforced; author CSS cannot fully override |
| Textarea resize handle | internals | removing it subtracts function, not chrome (owner: deferred) |
| Dialog panel (padding, border, Canvas background, CanvasText color) and modal `::backdrop` | internals | separates dialog content from the page and marks the modal state; an unstyled modal stays readable; components restyle both |
| `summary` disclosure triangle | internals | engine-drawn expandable cue, kept like the select arrow; components with their own icon remove it |
| Dialog position machinery (`position`, `inset`, `margin: auto`, `overflow`) | internals | blanking breaks the element (the `all: unset` lesson, the-new-css-reset#76) |
| Scrollbars and spellcheck indicators | internals | native interaction UI, not blanked; platform and user settings may change rendering |
| Inline text semantics: `strong`/`b` weight (value normalized to the spec's `bolder`), `em` italic, `a` color + underline, `del` strike, `small` size, `mark` highlight (UA pins both yellow background and black text — mind dark themes), `abbr` underline, `q` quotes, `pre`/`code`/`kbd`/`samp` monospace family, plus `i`/`u`/`s`/`ins`/`cite`/`dfn`/`var` | semantic | author-written meaning; erased links are unrecoverable from content alone (W3C F73) |
| `address` italic | semantic | owner ruling: untouched for now |
| Heading `font-weight: bold` | semantic | owner ruling: unstyled headings stay distinguishable from body text; deliberate divergence from destyle/Preflight |
| `th` bold, `th`/`caption` `text-align: center` | semantic | owner ruling: header/caption emphasis carried by the tag |
| `html` font-family / font-size / line-height | preference | keep the browser and user's typography preferences; no fixed size or metrics promised |
| Selection highlight (`::selection`) | preference | engine/OS channel; normalizing would require aesthetic constants; author-stylable |
| System-color resolution and forced-colors overrides | preference | `GrayText` varies by browser, OS and scheme; forced colors may recolor placeholders independently of input text. Do not disable the user's palette to obtain identical RGB values |

## Decision examples

<!-- prettier-ignore -->
| Scenario | State | Rationale |
| --- | --- | --- |
| `h1 { margin: 0; font-size: inherit }` | [B] | heading level lives in the tag; the UA scale also diverges by engine version since the 2025 spec removal of section-nesting sizes |
| `h1 { font-weight: inherit }` | Never — [S:semantic] | owner ruling: agents and humans may forget to restore heading/body distinction |
| `strong`, `em`, `a`, `del`, `mark`, `code`… | [S:semantic] | author-written meaning; an easily forgotten restyle category |
| `ul { list-style-type: "" }` | [B] + [N] | markers blanked; the empty string, not `none`, keeps Safari a11y list semantics (string markers Safari 14.1+ — the whole matrix; older engines show bullets) |
| `button` / `textarea` / `select` / text-type `input` native chrome (`border`, `background`, `border-radius`) | [B] | devolution is spec-interoperable (CSS-UI-4); the `:not()` blacklist routes unknown/future input types to the framed side by default |
| `textarea { vertical-align: bottom }` | [N] | Gecko `text-bottom` vs Blink/WebKit `baseline` opens a different gap beneath an inline textarea; `baseline` alone does not unify it (engines place the textarea baseline differently), `bottom` closes it everywhere — same call as media |
| every de-chromed control `border: 1px solid` | [N] | an empty field has no content to stay visible by, and a borderless button or select reads as plain text; one 1px currentColor frame keeps all controls recognizable under the same policy in every engine (same call as `hr`). 1px currentColor is a structural minimum; disabled controls follow GrayText through currentColor |
| `select { appearance: none }` | Never — [S:internals] | the engine arrow is the picker affordance and survives border/background devolution in every engine but iOS Safari before 26 (glyphs differ); components that draw their own arrow set `appearance: none` |
| checkbox / radio `appearance` | [S:a11y] | technically blankable, but forced-colors cannot restore it |
| `input` form-text inheritance (`font`, `color`, `letter-spacing`, `word-spacing`, `text-transform`: inherit; incl. `::file-selector-button` font) | [B] | controls don't inherit text styling — a UA quirk; restores normal inheritance. `text-indent` stays 0: inherited, it would indent control labels. `text-align` stays the UA's (centered button labels): no engine diverges on it, and inheriting it only decentered button labels. `text-transform` inherits on label controls only (button, select, button-type inputs): on a text field it would display a value that differs from the submitted one. Color inherits only where text sits on a blanked or transparent surface: date/time, color and range inputs revert `color`, and the file button keeps its native color pair. Checkbox/radio need no revert (their drawing ignores `color`), and image inputs have no native surface |
| `::placeholder { color: inherit; opacity: 1 }` | [N] | shared input-text color policy outside forced-colors overrides; dimming the hint is the author's design decision (owner ruling: Option 1), and user palette overrides remain [S:preference] |
| `hr { color: inherit; border: 0; border-block-start: 1px solid }` | [N] | engines paint/color the inset border differently; blank would hide a semantic element (unrecoverable in forced-colors); `border-block-start` follows writing mode |
| `pre/code/kbd/samp { font-family: monospace, "monospace" }` | [N] | engines render bare generic monospace at 13px; the two-item list disables that, so font-size inherits normally (no UA sheet sets font-size on these elements, so `font-size: 1em` would be dead code). The quoted second item is load-bearing — lightningcss dedupes the bare pair (lightningcss#1221) |
| `table { border-spacing: 0; text-indent: 0; border-color: currentColor }` | [B] / [N] | 2px spacing lurks under `collapse` and surfaces if an author switches to `separate`; Safari 15.4 leaks ancestor text-indent; Chrome 99, Safari 15.4 and iOS 18 paint gray borders (verified; current engines already match). `currentColor`, not `inherit`: `inherit` imports an ancestor's border-color |
| `dialog:modal { max-inline-size/max-block-size: 100% }` | [N] | the modal-only UA `calc((100% - 6px) - 2em)` silently caps author sizes (destyle#24); `100%` keeps the max + `overflow: auto` reachability pair — `none` would make overlong modal content unreachable (WCAG 2.1.1/2.4.7). Scoped to `:modal`: non-modal dialogs have no UA max, and `100%` would clip them to a positioned ancestor's height. Keep it a standalone rule: engines without `:modal` (below Chrome 105 / FF 103 / Safari 15.6) drop only it and keep the UA clamp |
| `dialog` panel / `dialog::backdrop` blanking | Never — [S:internals] | the panel separates dialog content from the page and the backdrop marks the modal state; an unstyled modal must stay readable, and components restyle both anyway |
| Bare `::backdrop` reset | Never | would blank the fullscreen backdrop (functional) |
| Global focus-outline removal in the reset | Never | preserve native indicators; downstream replacements must retain visible keyboard focus (W3C F78) |
| `img { display: block }` | Never | author origin would silently defeat `[hidden]` (Tailwind#9165); `vertical-align: bottom` closes the baseline gap safely |
| `html { font-size: 16px }` | Never — [S:preference] | overrides user browser preferences |
| `button { cursor: pointer }` | Never | behavioral addition |
| `input[type="number"] { appearance: textfield }` + spinner pseudos | Never — [S:internals] | spinners are an engine-drawn stepping affordance (Blink on hover, Gecko/WebKit always); kept like the textarea resize handle, components remove them themselves |
| `input[type="search"] { appearance: textfield }` | [N] | WebKit non-standard appearance: Safari 15.4 keeps the native search field under the frame (WebKit's `isControlStyled` skips search fields) |
| `:-moz-ui-invalid { box-shadow: none }` | Dead code — removed | the red glow itself was removed in Firefox 88 (bug 1693969); matrix floor is FF 97 |
| `b, strong { font-weight: bolder }` | [N] | Gecko `bolder` vs older Blink/WebKit `bold` within the matrix (visible at light weights: `bolder` over 300 → 400, `bold` → 700); the spec value, which current Blink/WebKit releases now ship |
| `button/input/select/textarea:disabled { color: GrayText; opacity: 1 }` | [N] | the UA disabled colors are plain UA-origin declarations, so the inheritance reset overrides them (`@layer` only orders the author origin); what survives diverges (Chrome `select` opacity 0.7, iOS 0.4) — GrayText is the system channel, not an aesthetic constant; scoped to controls because bare `:disabled` would gray a `fieldset:disabled` subtree wholesale; specialized inputs revert to their native disabled signal (iOS dims range and color via opacity) |
| `@media (forced-colors: active)` frames | Not needed — [S:a11y] covered | forced colors only recolors existing borders: form controls carry their [N] frame, dialogs their UA border, and survivor inputs their native chrome. The blanked fieldset groove is a container border that normal mode lacks too; the legend carries the grouping. Emulation does not replace Windows High Contrast validation |
| `fieldset { border: 0; min-inline-size: 0 }` | [B] | the 2px groove is chrome nobody wrote (the legend carries the grouping); UA `min-content` silently blocks flex/grid shrinking |
| `*, *::before, *::after { box-sizing: border-box }` | [N] | content-box is deterministic but conventionally replaced; one shared box model |
| `html { -webkit-text-size-adjust: 100% }` | [N] | prevents mobile text inflation. Safari reads only the prefixed name, Chromium aliases it (verified in Chrome 99's property table) and Firefox for Android reads it since 49, so the unprefixed declaration is redundant |
| `iframe { border: 0 }` | [B] | 2px inset is legacy chrome; the embedded document keeps the element visible |
| `summary { list-style: none }` | Never — [S:internals] | the disclosure triangle is the engine-drawn expandable cue, kept like the select arrow; components with their own icon remove it (plus `::-webkit-details-marker` for Safari < 18.4) |
| `::-moz-focus-inner { padding: 0; border: 0 }` | Removed — [S:a11y] | Firefox's UA notes the inner padding never affected button size; the rule only hid the dotted inner ring Firefox 97–139 draws on keyboard focus, part of the native focus indicator. Firefox 140 dropped these UA styles |

## Owner rulings

- (2026-10) Every de-chromed form control (text fields, buttons, select) keeps a 1px solid currentColor frame ([N]): an empty field must stay findable and a borderless button or select reads as plain text.
- (2026-10) Modal dialog max sizes scoped to `dialog:modal` (older engines keep the UA clamp); non-modal dialogs keep their uncapped UA sizing.
- (2026-10) Table `border-color: currentColor` replaces `inherit`, which imported an ancestor's border-color.
- (2026-10) `textarea { vertical-align: bottom }` ([N]); ruby annotation layout is an [S:internals] survivor.
- (2026-10) `::-moz-focus-inner` reset removed: it never normalized layout and only hid part of Firefox 97–139's native focus indicator.
- (2026-10) Native surfaces keep native text color: specialized inputs revert `color` and disabled `opacity`, and the file selector button keeps its color pair. Only controls whose surface is blanked or transparent inherit text color.
- (2026-10) No forced-colors block: form controls carry their frame, dialogs their UA border, and a fieldset is a container whose blanked groove normal mode lacks as well.
- (2026-10) Subtraction pass: `sub`/`sup` keep the UA `font-size: smaller` (identical in every engine, so `75%` was an aesthetic constant), the unprefixed `text-size-adjust` and monospace `font-size: 1em` are gone as redundant, and lists use a single `list-style-type: ""`.
- `::placeholder` → Option 1 (`color: inherit; opacity: 1`): zero constants, override-transparent; the unstyled hint/value ambiguity is accepted — dimming is the author's design decision.
- Heading `font-weight: bold` kept ([S:semantic]); only `font-size` is blanked.
- Link `color` + `text-decoration` kept ([S:semantic]).
- `th` `font-weight: bold` and `th`/`caption` `text-align: center` kept ([S:semantic]): header/caption emphasis carried by the tag.
- Disabled dimming normalized ([N] GrayText + `opacity: 1`), replacing the old [S:a11y] survivor row — that row documented a survivor the reset itself was deleting: author-origin declarations beat UA-origin ones regardless of layers, so `color: inherit` wiped the UA grays while divergent opacity dims survived.
- `b`/`strong` normalized to the spec's `bolder` ([N]); the [S:semantic] boldness ruling itself is unchanged.
- Deferred, UA defaults untouched for now: `address` italic, textarea `resize`, universal `min-width: 0`, `-webkit-tap-highlight-color`, `input[type="search"]` cancel button.
- (2026-10) Engine-drawn affordances survive like `strong` weight ([S:internals]): the select arrow, number spinners, the summary disclosure triangle, and the dialog panel and modal backdrop. Components opt out themselves (`appearance: none`, `list-style: none`, their own panel styles). Controls no longer inherit `text-align`, so button labels stay centered.

## Architecture

Single file: `blanksheet.css`. Everything inside one `@layer reset` block — lowest cascade priority. The commented source is the spec, shipped next to the minified entry (whose `/*! */` banner points to it); an agent can read the whole contract in one pass.

Downstream note: the Rebar editor maintains a per-element manifest of this stylesheet in its own repo, pinned to its vendored copy by a sync test — rule changes here surface there at re-vendor time. The peiwen.lu blog hosts a preview at `/project/blanksheet/`, derived from `kitchen-sink.html` with a copy of the released CSS; refresh it after each release.

```
@layer reset {
  selector { ... }
}
```

Syntax targets: Chrome 99+, Firefox 97+, Safari 15.4+ (`<dialog>` itself needs Firefox 98). These are intended floors, not versions exercised by the automated suite. No IE support.

## Code Conventions

- **Comments**: one entry per decision — `[B]` / `[N]` / `[S:class]` subject — reason — in a line or two, naming the UA default only when it is the reason. Keep load-bearing notes (minifier quirks, rule-order or list-sync constraints, floor-version evidence); detailed rationale belongs in the tables here.
- **Selector grouping**: group elements that share the same reset. Prefer fewer rules.
- **Element-anchored selectors**: a rule that only ever matches one element names it explicitly (`input[type="search"]`, `html` instead of `:root`); only genuinely multi-element selectors stay element-less (`::placeholder`, `::file-selector-button`).
- **Property order**: enforced by stylelint (recess-order), auto-fixed on commit. Exception that must survive reordering: `hr` relies on `border: 0` preceding `border-block-start` (currently recess-order preserves this; verify after stylelint config bumps).

## Section Order

1. Box Model (`*, *::before, *::after`)
2. Root & Body
3. Sections (h1–h6)
4. Grouping Content (p, blockquote, pre, figure, hr, dl, dd)
5. Text-level Semantics (b/strong weight, mono sizing, sub, sup)
6. Lists (ul, ol, menu)
7. Table (table, th, td)
8. Forms (button, input, select, textarea, fieldset, legend, ::file-selector-button, ::placeholder)
9. Embedded / Media (img, video, audio, canvas, svg, iframe, embed, object)
10. Interactive (dialog:modal max sizes; dialog panel, backdrop and summary triangle kept)

## Toolchain

- **stylelint** (`stylelint-config-recess-order` + `stylelint-prettier`) — lints and formats `blanksheet.css` on pre-commit; also rejects `!important`, named behavioral additions and hex colors. Other aesthetic constants still need review.
- **lightningcss-cli** — builds `blanksheet.min.css` via `pnpm build`. Only the `/*! … */` banner survives minification; it carries the version and points readers of the minified entry to the spec, so bump it with `package.json` (the packaging test checks they agree). Two minifier-sensitive spots are load-bearing: the quotes in `font-family: monospace, "monospace"` (prevents dedup, lightningcss#1221) and `dialog:modal` staying a standalone rule (merged into a selector list, engines without `:modal` would drop the whole list). Verify both survive in the minified output after any lightningcss upgrade.
- **husky + lint-staged** — before every commit, runs `stylelint --fix` on staged CSS and `prettier --write` on staged html/md/json/yaml/mjs; `.prettierignore` keeps `pnpm-lock.yaml` out, and both it and `.stylelintignore` keep the pinned Meyer snapshot under `bench/vendor/` byte-for-byte
- **pnpm 11** — pinned in `package.json`; `pnpm-workspace.yaml` explicitly permits the `lightningcss-cli` native install script via `allowBuilds`.
- **Node test runner + Playwright** — `pnpm test` builds fresh CSS, checks single-layer structure and clean npm packaging (including the gzip claim), and runs the same contract assertions in Chromium, Firefox and WebKit. Browser checks include source/minified parity, documented select overrides and keyboard behavior; shared policy does not require equal RGB values or pixels. The five routine review questions live in `tests/README.md`.
- **Comparative bench** — `pnpm bench` audits pinned resets in three engines: fallback mechanisms, computed-style divergence and author overrides. It measures mechanisms, not agent outcomes. Keep results and limits in `bench/README.md`; rerun and update that report when rules or pinned versions change.
- **Release checks** — follow README: frozen install, browser install, CSS lint, formatting, tests, then `npm pack`. `prepack` owns production builds for both packing and publishing; no stale minified file may determine package contents.
- **Manual evidence** — shipping Safari with VoiceOver, Windows High Contrast, mobile native controls and minimum browser versions remain manual checks. Automated WebKit and forced-colors emulation do not close those gates. Preserve that distinction in release claims. Floor engines: old Playwright releases bundle them (1.18.1 → Chromium 99, 1.20.2 → Firefox 97); install them in a throwaway directory, not as project dependencies. Their WebKit 15.4 build crashes on current macOS, so Safari 15.4 needs a real-browser service; the iOS 18 simulator shows some pre-26 WebKit behavior (gray table borders, `bold` strong) but does not replace it.

## File Distribution

- `blanksheet.css` — source with full comments (the spec; development)
- `blanksheet.min.css` — minified (production, built by `pnpm build`, gitignored, rebuilt by `prepack`)
- `kitchen-sink.html` — every element on one page for manual visual checks (development only)
- `tests/` — offline browser fixture and browser/packaging regressions; development only
- `bench/` — comparative reset audit (`pnpm bench`); development only, needs network on first run
- `README.md`, `CHANGELOG.md`, `LICENSE` — distributed documentation
- `AGENTS.md` — agent instructions shared by Codex and Claude Code (`CLAUDE.md` only imports it). Keep it under 32 KiB: Codex silently truncates past its default `project_doc_max_bytes`. Wide tables carry `<!-- prettier-ignore -->` so alignment padding does not return
