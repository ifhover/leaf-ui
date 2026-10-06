# Accessibility and compatibility acceptance — 2026-10-07

This records executed coverage, not a certification of every component or every browser version. The interactive documentation sample is `apps/docs/src/examples/scenarios/accessibility.tsx`; browser acceptance imports that same sample. `tests/browser/quality.spec.ts` exercises it without screenshot baseline comparisons.

| Executed check | Result / boundary |
| --- | --- |
| Unit behavior / SSR / nested configuration | 259 tests passed in 51 files; includes density inheritance, palette recipes, premultiplied alpha, theme overrides and hydration |
| Chromium 153.0.8010.12 | Full browser suite: 47 passed |
| WebKit 26.6 | Feedback + quality suites: 13 passed across the suite and targeted rerun. The rerun fixed a test reading before React mounted; it now waits for the workbench |
| Axe | Workbench light, dark and open dialog: zero violations; existing full fixture has no serious/critical violations |
| Keyboard | Initial focus, nested Select dismissal, Tab containment, Escape and opener focus restoration passed |
| Density / theme / portals | Compact 28px fields/options, inherited dark colors, maskBlur off and live CSS-variable/custom Tag updates passed |
| Reflow | 320 CSS px workbench and overlays remain reachable; 375px business-page flow has no page-level horizontal overflow |
| Magnification / touch | CSS zoom 200% with touch emulation passed; this is not native browser zoom or physical touch-device coverage |
| Forced colors / reduced motion | Visible keyboard focus and functional overlay flows passed in browser emulation |
| Complete business sample | English docs create/edit/duplicate-error retry/archive/restore/filter/settings save and resource downloads passed; Chinese page and desktop/mobile/light/dark layouts inspected |
| Design files | DTCG and legacy JSON values, four SVG XML structures, plugin ZIP structure and generated JavaScript syntax passed |

Evidence is in the ignored `packages/react/.quality` and Playwright report directories. `browser.json` contains the most recent full Chromium run, not a merged multi-engine history. Desktop/mobile business screenshots are `workspace-desktop.png`, `workspace-settings-dark.png` and `workspace-mobile.png`. No golden screenshot comparison infrastructure was added.

Firefox was attempted again on this Windows host and failed before opening a browser with `browserType.launch: spawn UNKNOWN`. Firefox CI remains configured, but a configured CI job is not evidence of a local pass. Declared minimum browser targets in the compatibility guide have not all been individually executed. WebKit testing does not replace physical Safari/iOS testing.

| Manual acceptance | Status | Record when executed |
| --- | --- | --- |
| Windows + NVDA | Pending | Windows/browser/NVDA versions; names, roles, values, errors, live regions and focus restoration |
| macOS + VoiceOver | Pending | macOS/Safari/VoiceOver versions; rotor, form fields, dialog stack and announcements |
| iOS Safari / Android browser | Pending | Device/OS/browser, virtual keyboard, touch targets, scroll lock and orientation |
| Native browser zoom 200% / 400% | Pending | Browser/version, desktop viewport, reflow, clipped content, overlay and focus visibility |
| Figma desktop plugin import | Pending | Figma version, variable modes, component variants, fonts, binding behavior and visuals |

For manual checks, record the action, expected response, observed response and evidence. A pass in axe or a simulated input sequence cannot mark these rows passed. Applications must still supply meaningful labels, status descriptions and adequate contrast for custom palettes. Use comfortable density or larger controls on touch; essential targets should be at least 24px and preferably 44px.

Reproduce automated checks from the package directory:

```sh
pnpm exec vitest run
pnpm exec playwright test --project=chromium --workers=1
pnpm exec playwright test quality.spec.ts feedback.spec.ts --project=webkit --workers=1
node scripts/verify-design-resources.mjs
```
