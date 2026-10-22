# Leaf UI color migration

Source-level review for the `0.9.0` development branch on `2026-10-23`.

- Scope: 81 public component exports and their concrete source directories. `./table` and `./table/tanstack` both resolve to `src/tabletanstack` and count as one public component.
- Every public export has an assigned color responsibility. The four source outcomes are shared family, inherited responsibility, no color responsibility, and explicit local exception.
- "Reviewed" means the source ownership and token path were inspected. It does not mean that all 81 components received a separate browser visual check.

## Shared family contract

- `field` / `field-states` / `field-status`: shared field shell, focus and validation precedence for `autocomplete`, `cascader`, `colorpicker`, `datepicker`, `input`, `inputnumber`, `select`, `textarea`, and `treeselect`.
- `choice` / `choice-states` / `choice-surfaces`: shared choice geometry and state order for `checkbox`, `radio`, and `switch`.
- `floating-paint` and shared floating/backdrop helpers: popup surfaces and portal paint for fields, menus, popovers, tooltips, pickers, and overlays.
- `accent-soft-feedback-family`: `--leaf-accent-soft-background` maps to `primary-surface-8`; `--leaf-accent-soft-border` maps to `primary-border-24`. This is the broad soft-brand-feedback role for persistent selections, selected navigation, dragover feedback, and draggable-handle emphasis. Ordinary neutral option feedback uses `option-hover`, not this family.
- `danger-soft-feedback-family`: `--leaf-danger-soft-background` maps to `danger-surface-6`; `--leaf-danger-soft-active-background` maps to `danger-surface-8`. This is soft danger feedback, not a synonym for danger ink or danger indicators.
- `accent-halo-family`: shared translucent halo for `inputotp`, `slider`, and `upload`. It does not replace a solid keyboard focus ring.
- `segmented-surface-family`: shared segmented surface, border, selected surface, and muted label roles for `tabs` and `colorpicker`.
- `calendar-selection-family`: shared calendar range and selected-day paint for `calendar` and the shared date-picker calendar.
- `overlay-family`: dialog and spotlight overlay roles for `modal`, `drawer`, and `tour`.
- `panel-canvas-family`: muted panel canvas for `modal` and inset calendar-picker panels.
- `status-ink-family` / `status-label-family`: contrast-aware readable status ink and soft status-label foreground/background roles.
- `table-family`, `softened-frame-color`, and `resting-surface-shadow`: table and raised-surface ownership shared by Table and Card.

Single-consumer paint stays on direct semantic tokens or remains a documented local exception. A family is not introduced for a single consumer.

## Component inventory

| # | Export | Source | Assigned responsibility | Source result |
| ---: | --- | --- | --- | --- |
| 1 | `alert` | `alert` | Status icons on a neutral surface; `option-hover` for close feedback | Reviewed |
| 2 | `anchor` | `anchor` | `accent-soft-feedback-family` for selected navigation | Reviewed |
| 3 | `app-bar` | `appbar` | `accent-soft-feedback-family` for selected navigation; direct surface/text roles | Reviewed |
| 4 | `auto-complete` | `autocomplete` | `field`; `floating-paint`; `option-hover` for ordinary options | Inherited |
| 5 | `avatar` | `avatar` | Direct surface, text, and border roles | Reviewed |
| 6 | `back-top` | `backtop` | Inherits shared Button action paint | Inherited |
| 7 | `badge` | `badge` | Status base and on-status foreground roles | Reviewed |
| 8 | `breadcrumb` | `breadcrumb` | Direct text, muted, and primary-ink roles | Reviewed |
| 9 | `button` | `button` | Local action stack; `danger-soft-feedback-family` for ghost danger; local on-color split divider | Reviewed + exception |
| 10 | `calendar` | `calendar` | `calendar-selection-family`; shared calendar paint | Reviewed |
| 11 | `card` | `card` | `softened-frame-color`; `resting-surface-shadow`; direct surface roles | Reviewed |
| 12 | `carousel` | `carousel` | Local media-navigation controls over changing imagery | Exception |
| 13 | `cascader` | `cascader` | `field`; `floating-paint`; controlled structural borders | Inherited |
| 14 | `checkbox` | `checkbox` | `choice`; `choice-states`; `choice-surfaces` | Reviewed |
| 15 | `collapse` | `collapse` | `control-size`; direct surface, divider, and text roles | Reviewed |
| 16 | `color-picker` | `colorpicker` | `field` with local `shadow-xs`; `segmented-surface-family`; intrinsic hue/alpha/checker/preset paint | Reviewed + exception |
| 17 | `command-palette` | `commandpalette` | Modal/floating surfaces; `section-label`; shared option roles | Inherited |
| 18 | `config-provider` | `config-provider` | Contrast-calculation canvas only; no component paint | Exception |
| 19 | `confirm` | `confirm` | Inherits dialog/modal and button actions; danger-soft error detail | Inherited |
| 20 | `date-picker` | `datepicker` | `field`; `floating-paint`; shared calendar | Inherited |
| 21 | `date-range-picker` | `daterangepicker` | Shared date/calendar implementation and range roles | Inherited |
| 22 | `date-time-picker` | `datetimepicker` | Shared date/time picker paths and popup paint | Inherited |
| 23 | `descriptions` | `descriptions` | Direct surface, divider, label, and muted roles | Reviewed |
| 24 | `divider` | `divider` | Dedicated divider role | Reviewed |
| 25 | `drawer` | `drawer` | `overlay-family`; shared dialog sections; direct panel surface | Reviewed |
| 26 | `dropdown` | `dropdown` | `floating-paint`; `danger-soft-feedback-family`; shared option-hover feedback | Reviewed |
| 27 | `empty` | `empty` | Direct muted text, surface, and border roles | Reviewed |
| 28 | `error-boundary` | `errorboundary` | Direct danger, surface, and text roles | Reviewed |
| 29 | `file-list` | `filelist` | `accent-soft-feedback-family`; `danger-soft-feedback-family`; `status-ink-family`; local video letterbox | Reviewed + exception |
| 30 | `flex` | `flex` | No color responsibility | No color |
| 31 | `float-button` | `floatbutton` | Inherits shared Button action paint | Inherited |
| 32 | `form` | `form` | `danger-soft-feedback-family` for validation feedback | Reviewed |
| 33 | `grid` | `grid` | No color responsibility | No color |
| 34 | `image` | `image` | Fixed media-viewer overlays and exposed viewer variables | Exception |
| 35 | `infinite-scroll` | `infinitescroll` | Direct muted, text, and surface roles | Reviewed |
| 36 | `input` | `input` | `field('input', 'primary')`; controlled native reset | Inherited |
| 37 | `input-mask` | `inputmask` | Inherits the input field shell and native reset | Inherited |
| 38 | `input-number` | `inputnumber` | `field`; `option-hover` for stepper backgrounds | Reviewed |
| 39 | `input-otp` | `inputotp` | `accent-halo-family`; field/base roles | Reviewed |
| 40 | `layout` | `layout` | Direct surface, muted, and divider roles | Reviewed |
| 41 | `loading` | `loading` | Local translucent surface scrim | Exception |
| 42 | `loading-bar` | `loadingbar` | Local primary glow effect | Exception |
| 43 | `masonry` | `masonry` | No color responsibility | No color |
| 44 | `mentions` | `mentions` | `floating-paint`; field/base roles | Inherited |
| 45 | `menu` | `menu` | `danger-soft-feedback-family`; explicit local appearance palette | Reviewed + exception |
| 46 | `message` | `message` | Status roles; direct surface and elevation roles | Reviewed |
| 47 | `modal` | `modal` | `overlay-family`; `panel-canvas-family`; shared dialog sections | Reviewed |
| 48 | `notification` | `notification` | Status roles; direct surface and elevation roles | Reviewed |
| 49 | `pagination` | `pagination` | `accent-soft-feedback-family` tint; `primary-indicator` strengthens the outline indicator border | Reviewed |
| 50 | `popconfirm` | `popconfirm` | Inherits popover/modal and button action roles | Inherited |
| 51 | `popover` | `popover` | `floating-paint` with divider border | Inherited |
| 52 | `progress` | `progress` | Primary track/fill plus local shimmer effect | Exception |
| 53 | `qr-code` | `qrcode` | Exposed foreground/background roles and local canvas scrim | Exception |
| 54 | `radio` | `radio` | `choice`; `choice-states`; `choice-surfaces` | Reviewed |
| 55 | `rate` | `rate` | Independent rating red/orange/gold scale | Exception |
| 56 | `result` | `result` | Status, surface, and text roles | Reviewed |
| 57 | `scroll-area` | `scrollarea` | Inherits scrollbar paint | Inherited |
| 58 | `scrollbar` | `scrollbar` | `focus-ring`; direct muted/text/surface roles | Reviewed |
| 59 | `select` | `select` | `field('select', 'primary')`; `floating-paint`; `section-label` | Inherited |
| 60 | `skeleton` | `skeleton` | Local text-subtle shimmer | Exception |
| 61 | `slider` | `slider` | `accent-halo-family`; direct rail/fill/thumb roles | Reviewed |
| 62 | `space` | `space` | No color responsibility | No color |
| 63 | `splitter` | `splitter` | `accent-soft-feedback-family`; hover uses `accent-soft-border`; `focus-ring` | Reviewed |
| 64 | `statistic` | `statistic` | Direct text, muted, and status roles | Reviewed |
| 65 | `steps` | `steps` | `control-size`; `focus-ring`; direct primary/muted/divider roles | Reviewed |
| 66 | `switch` | `switch` | `choice`; `option-hover` track; `text-muted` and `on-primary` thumb roles | Reviewed |
| 67 | `table` / `table/tanstack` | `tabletanstack` | `table-family`; `softened-frame-color`; `resting-surface-shadow`; scrollbar | Inherited |
| 68 | `tabs` | `tabs` | `segmented-surface-family`; `control-size`; shared state paint | Reviewed |
| 69 | `tag` | `tag` | `status-label-family` for all status colors | Reviewed |
| 70 | `textarea` | `textarea` | `field`; native resize remains component-owned | Inherited |
| 71 | `timeline` | `timeline` | Direct divider, primary, and status roles | Reviewed |
| 72 | `time-picker` | `timepicker` | `accent-soft-feedback-family`; `floating-paint` | Reviewed |
| 73 | `time-range-picker` | `timerangepicker` | Inherits time-picker and shared popup paths | Inherited |
| 74 | `tooltip` | `tooltip` | Local inverse-content contrast | Exception |
| 75 | `tour` | `tour` | `overlay-family(spotlight)`; local target isolation | Reviewed |
| 76 | `transfer` | `transfer` | `accent-soft-feedback-family` for selected rows | Reviewed |
| 77 | `tree` | `tree` | `accent-soft-feedback-family` for drop-inside; `option-hover` moving highlight; divider border; `shadow-md` drag preview | Reviewed |
| 78 | `tree-select` | `treeselect` | `field`; `floating-paint`; tree selection semantics | Inherited |
| 79 | `typography` | `typography` | `accent-soft-feedback-family` for action hover; `status-ink-family`; local warning mark highlight | Reviewed + exception |
| 80 | `upload` | `upload` | `accent-soft-feedback-family` for dragover; `accent-halo-family` with 4px halo; `focus-ring` | Reviewed |
| 81 | `virtual-list` | `virtuallist` | `focus-ring`; direct surface/text roles | Reviewed |

## Explicit local exceptions

These roles stay with their component because the visual responsibility is not a general semantic color family:

- Menu keeps its established local appearance: neutral hover/selected at `rgb(0 0 0 / 8%)`, raised/primary active at `rgb(0 0 0 / 4%)`, unselected color at `80% currentColor`, primary selected at `primary-alpha-10`, and primary active at `primary-alpha-4`. Only its danger feedback uses `danger-soft-feedback-family`.
- ColorPicker keeps hue, alpha, checkerboard, preset, and contrast-outline paint. The inline field keeps `shadow-xs` through the field override path.
- Rate keeps its independent rating scale; it is not the warning status family.
- Image, Carousel controls, and the FileList video letterbox keep media-owned overlays and contrast handling.
- Loading keeps its surface scrim, LoadingBar its glow, Progress and Skeleton their local shimmer, and QRCode its exposed canvas foreground/background roles.
- Tooltip keeps inverse-content contrast and Tour keeps spotlight contrast.
- ConfigProvider's white canvas is used for contrast calculation, not component paint.
- Button's solid split divider remains a local on-color separator role.

## Verification boundary and commands

Source coverage of 81 exports is not a claim that 81 components received browser visual acceptance. The browser suite is contract-targeted and must report the fixtures and viewports it actually exercised.

Run the static and package checks from the repository root:

```powershell
pnpm check:colors
pnpm test:colors
pnpm --filter @ifhover/leaf-ui typecheck
pnpm --filter @ifhover/leaf-ui test
pnpm --filter @ifhover/leaf-ui build
```

For the targeted browser contract, run only when browser acceptance is in scope:

```powershell
pnpm --filter @ifhover/leaf-ui exec playwright test tests/browser/family-color-contract.spec.ts
```

Record the revision, command, environment, and actual result with the change set. This document describes source responsibility and does not carry a fabricated pass result for those commands.
