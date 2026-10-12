# Routine review

Keep each change's review to these five questions. Report failures and evidence gaps, not a second narrative checklist.

<!-- prettier-ignore -->
| Question | Evidence |
| --- | --- |
| Do README, source comments and the survivors ledger describe the behavior? | Review the changed B/N/S decisions together. Add a browser assertion for any new documented override recipe. |
| Can authors override the reset? | Browser checks for unlayered and later-layered styles, including select padding after `appearance: none`. |
| Do native behavior and semantics survive? | Browser checks for controls, focus, `hidden`, `details` and dialogs; retain the manual checks below. |
| Are in-scope engine differences explained? | Run the same policy assertions in Chromium, Firefox and WebKit; classify newly observed differences in the ledger. Compare inherited/system values to local references, not fixed cross-engine RGB or pixels. |
| Are project principles intact? | Stylelint rejects `!important`, named behavioral additions and hex colors; the contract test requires a single `@layer reset`; the package test checks minified gzip size below 1,000 bytes. Review other aesthetic constants manually. |

The current fixture is sampled coverage, not an exhaustive comparison of every UA default. Add a focused regression when a new difference is found. Deleting a declaration without changing this fixture is not proof of dead code: other states or supported older engines may need it. `color-no-hex` also does not reject RGB functions or named colors.

Shipping Safari with VoiceOver, Windows High Contrast, mobile native controls and minimum browser versions remain manual checks. Record the environment and observed result when relevant; Playwright WebKit and forced-colors emulation do not replace them.

Use README's release commands.
