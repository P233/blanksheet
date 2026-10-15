# Routine review

Keep each change's review to these five questions. Report failures and evidence gaps, not a second narrative checklist.

<!-- prettier-ignore -->
| Question | Evidence |
| --- | --- |
| Do README, source comments and the survivors ledger describe the behavior? | Review the changed B/N/S decisions together. Add a browser assertion for any new documented override recipe. |
| Can authors override the reset? | Browser checks for unlayered and later-layered styles, including select padding after `appearance: none`. |
| Do native behavior and semantics survive? | Browser checks for controls, focus, `hidden`, `details` and dialogs; retain the manual checks below. |
| Are in-scope engine differences explained? | Run the same policy assertions in Chromium, Firefox and WebKit; classify newly observed differences in the ledger. Compare inherited/system values to local references, not fixed cross-engine RGB or pixels. |
| Are project principles intact? | Stylelint rejects `!important`, named behavioral additions and color literals (hex, named colors, color functions); the contract test requires a single `@layer reset`; the package test checks minified gzip size below 1,000 bytes. Review other aesthetic constants, such as lengths, radii and font stacks, manually. |

The current fixture is sampled coverage, not an exhaustive comparison of every UA default. Add a focused regression when a new difference is found. Every reset declaration has a policy assertion that fails when the declaration is removed, except where current desktop engines show no effect: `-webkit-text-size-adjust` (mobile), `b`/`strong` `bolder` and table `text-indent`/`border-color` (floor engines), and `::-webkit-search-decoration`, which `getComputedStyle` cannot read. Survivors in `keptDefaults` are compared with the engine's own value, since keywords such as `-webkit-center` differ. Deleting a declaration without changing this fixture is not proof of dead code: other states or supported older engines may need it.

Shipping Safari with VoiceOver, Windows High Contrast, mobile native controls and minimum browser versions remain manual checks. Record the environment and observed result when relevant; Playwright WebKit and forced-colors emulation do not replace them.

Use README's release commands.
