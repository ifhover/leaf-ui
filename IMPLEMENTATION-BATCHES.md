# Leaf UI improvement batches

Requested scope (2026-10-07): complete the following batches sequentially. Preserve existing work and public APIs. Automatic screenshot comparison, Table/DataGrid, and real framework integration projects/templates are deferred.

| Batch | Deliverable | Status |
| --- | --- | --- |
| 1 | Shared visual/interaction rules, consistent action feedback, and component state acceptance | Complete |
| 2 | Deterministic JavaScript color derivation, static default palettes, browser feature fallbacks and support policy | Complete |
| 3 | Inherited global comfortable/compact density, component spacing and examples | Complete |
| 4 | Complete interactive project-management/settings examples in the documentation | Complete |
| 5 | Exportable design tokens, editable vector/component resources and Figma import support | Complete; Figma runtime import remains manual acceptance |
| 6 | Accessibility acceptance page/checklist, keyboard/zoom/touch checks and honest manual-test reporting | Complete; unperformed device/screen-reader checks documented |

Each batch must preserve nested scopes, portalled content, React 18/19, SSR and reduced-motion preferences. Validate changed behavior and actual layouts without adding golden screenshot comparison infrastructure. Browser documentation must distinguish the declared support policy from engines and versions actually tested. NVDA/VoiceOver and physical-device checks may only be recorded as passed when performed on those devices.

## Delivered artifacts

1. `DESIGN-STANDARDS.md` and bilingual design-standard guides. Buttons retain layout and center position while scaling subtly on press; menus/tabs retain geometry, and shared pressable actions use opacity feedback. Previously requested component/demo fixes remain in place.
2. `colors.ts`, `color-recipes.ts`, generated `_palette.scss` and compatibility guides. Library/docs styles no longer depend on native CSS color mixing. Concrete colors derive deterministically for SSR; CSS-variable colors resolve in the browser. Semantic statuses, custom Tag, nested themes and portals are covered. Optional layout observers are guarded. Blur uses keyframes, including a separate WebKit fallback that survives CSS minification.
3. `ConfigProvider density`, density tokens, form/menu/list/popup/dialog spacing, nested resets and theme-playground/examples. Explicit theme/component sizes retain precedence.
4. `/guide/workspace` in both languages: search, create, edit, duplicate-name retry, archive/restore, empty state, saving feedback and applied team preferences. Data is explicitly a local simulation. No Table or framework project/template was created.
5. `/guide/design-resources`, two token formats, four editable SVG sheets and `design/figma` local plugin. Plugin creates native color/density variables plus Button/Input variants. `pnpm design:export` regenerates resources from runtime sources; no published Figma library is claimed.
6. `/guide/accessibility`, a shared interactive workbench, behavior tests and `packages/react/ACCESSIBILITY.md` recording actual coverage and manual limits. A 320px modal overflow discovered by these checks was fixed.

## Verification

- 259 unit tests / 51 files passed; all 47 Chromium browser cases passed.
- 13 targeted WebKit cases passed across the suite and the mount-synchronization rerun. Firefox launch was attempted and remains unavailable locally (`spawn UNKNOWN`).
- Real docs business flows, desktop/dark/mobile layouts and downloads passed. JSON, SVG, generated plugin syntax and ZIP were checked.
- Library build, 84 public component subpaths/CSS exports, type checks and bilingual docs build passed. Final lint/build checks are recorded in `packages/react/QUALITY.md`.
- Final gzip JS/CSS: Button 2.19/3.94 KiB; common form 58.86/7.57 KiB; full library 203.42/35.89 KiB. Only the full CSS budget moved from 35 to 37 KiB to cover static derived palettes, density and portable mask animation; standalone palette variables are pruned.

Automatic visual baseline regression, Table/DataGrid and real framework integration projects/starter templates remain deferred. NVDA/VoiceOver, physical devices, native browser zoom and actual Figma import are listed as manual acceptance, not passed results.
