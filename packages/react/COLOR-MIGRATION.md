# Leaf UI color migration

## 0.18.0 configuration and variable migration

- Configure all six bases through ConfigProvider: `primaryColor` (including `'neutral'` for adaptive light `#0d0d0d` / dark `#f5f5f5` primary & inverted `on-primary`), `tokens.successColor`, `tokens.dangerColor`, `tokens.warningColor`, `tokens.infoColor`, and `tokens.neutralColor`. Update JS theme configuration to regenerate colors. DOM style/class changes no longer trigger JS derivation; CSS expressions remain CSS expressions and are not reinterpreted during hydration.
- All solid `on-*` foregrounds default to white (except `'neutral'` primary in dark mode, where `primary` becomes `#f5f5f5` and `on-primary` inverts to `#0d0d0d`), including bright custom fills. Set `onPrimaryColor`, `onSuccessColor`, `onDangerColor`, `onWarningColor`, or `onInfoColor` to `#000000` when dark ink on a custom fill is needed. Soft ink remains separate.
- Zero-consumer CSS variables are pruned from global stylesheet / `deriveColors()` / Tailwind outputs (neutral `100..900`, semantic `light-N`/`dark-N` shades, `primary-indicator`, `primary-focus`, `primary-fill-border`, `primary-ink`/`-ink-hover`/`-ink-active`, `danger-hover`, `danger-link-hover`/`danger-link-active`, `*-soft-active`, `success-border`, `info-border`, and 4 unused `primary-alpha-*` recipes), leaving 50 active global tokens + 6 retained optical recipes in `src/color-recipes.ts`. `generateColorScale`, `neutralColorScale`, and `generateColorShades` remain exported JS utilities for runtime/docs calculations.
- Solid buttons use `--leaf-shadow-control`, shift to `primary-hover` on hover, and darken directly from the original base on press; outline buttons pair `--leaf-shadow-control` with `primary-hover` border/text on hover and `primary-link-active` border/text on press. Explicit component/state overrides remain authoritative.
- Semantic ink preserves the original base when readable on all applicable surfaces; otherwise `generateColorShades` selects readable adjustments. Built-in `primary` text/badges consume `primary` directly.
- Card `variant="layered"` canvases, Tabs segmented tracks (`surface-muted`), and inset picker canvases share `surface-muted`. Set `tokens.mutedSurfaceColor` to an exact color such as `rgb(244, 243, 239)`. Selected Tabs sliders (`surface` + `shadow-sm`), default Card surfaces, Card/Drawer footers, and default pickers retain `surface` or `transparent`; explicit component backgrounds remain authoritative.

Source-level review updated for the `0.18.0` monochrome redesign.

- Scope: 78 public component exports and their concrete source directories. `./table` and `./table/tanstack` both resolve to `src/tabletanstack` and count as one public component.
- Every public export has an assigned color responsibility. The four source outcomes are shared family, inherited responsibility, no color responsibility, and explicit local exception.
- "Reviewed" means the source ownership and token path were inspected. It does not mean that all exports received a separate browser visual check.

## Shared family contract

- `field` / `field-states` / `field-status` / `field-ring-variables`: shared field shell, primary hover (`primary-hover` by default; `border-hover` for `$focus: neutral`), primary focus by default (`$focus: primary` using `primary` + 2px 10% ring; explicit `$focus: neutral` supported), and validation precedence (border + 2px 10% ring) for `autocomplete`, `cascader`, `colorpicker`, `datepicker`, `input`, `inputnumber`, `select`, `textarea`, and `treeselect`.
- `choice` / `choice-states` / `choice-surfaces`: shared choice geometry and state order for `checkbox`, `radio`, and `switch` (`border-hover` resting border, `text-muted` unchecked hover, `primary`/`on-primary` checked).
- `floating-paint` and shared floating/backdrop helpers: popup surfaces and portal paint for fields, menus, popovers, tooltips, pickers, and overlays.
- `danger-soft-feedback-family`: `--leaf-danger-soft-background` maps to `danger-soft`; `--leaf-danger-soft-active-background` maps to `danger-soft-hover`. This is soft danger feedback, not a synonym for danger ink or danger indicators.
- `accent-halo-family`: shared `--leaf-color-primary-alpha-20` focus halo for `slider` thumb `:focus-visible`. It does not replace a solid keyboard focus ring.
- `segmented-surface-family`: shared `surface-muted` track, transparent border, `surface` selected pill, and `text-muted` label roles for `tabs` and `calendar` segmented view toggles.
- `calendar-selection-family`: shared calendar range and selected-day paint uses `primary-soft`, with `primary-soft-hover` for selection feedback.
- `overlay-family`: dialog (light `rgb(0 0 0 / 28%)`, dark `[data-leaf-theme='dark']` `rgb(0 0 0 / 55%)`) and spotlight (light `rgb(0 0 0 / 45%)`, dark `[data-leaf-theme='dark']` `rgb(0 0 0 / 68%)`) overlay roles for `modal`, `drawer`, and `tour`.
- `panel-canvas-family`: muted panel canvas for inset calendar-picker panels.
- `status-ink-family` / `status-label-family`: readable status ink and soft status-label foreground/background roles (`primary` uses base `primary` directly; other semantic families use contrast-aware `*-ink`).
- `table-family` + `softened-frame-color`: tinted `subtle-action-background` headers paired with full `--leaf-table-text` (preserving `--leaf-component-table-color` override), `surface-muted` hovered/sorted headers, softened `70% divider` frames/dividers/header splits, `4%` text row hover, `2%` text zebra stripes, `6% / 10% primary` selected/selected-hover fills, and `--leaf-color-primary` active sort/resize highlights, while the loading scrim retains the table's surface formula. Table is frameless by default (full cell grid with `bordered`) and has no pinned-column shadows.

Single-consumer paint stays on direct semantic tokens or remains a documented local exception. A family is not introduced for a single consumer.

## Component inventory

| # | Export | Source | Assigned responsibility | Source result |
| ---: | --- | --- | --- | --- |
| 1 | `alert` | `alert` | Status base/ink roles on a softened neutral surface via `subtle-action-background`; `option-hover` for close feedback | Reviewed |
| 2 | `anchor` | `anchor` | Direct text, muted, and border roles; `choice-option-background()` hover and neutral indicator bar | Reviewed |
| 4 | `auto-complete` | `autocomplete` | Primary `field` focus; `floating-paint`; shared `choice-option` feedback | Inherited |
| 5 | `avatar` | `avatar` | Direct surface, text, and border roles; grouped text fallbacks cycle through `primary-soft` / `primary`, `info` / `warning` / `danger` `*-soft` / `*-ink` pairs, and neutral muted roles for identity, not status; explicit Avatar paint overrides win | Reviewed |
| 6 | `back-top` | `backtop` | Inherits shared Button action paint | Inherited |
| 7 | `badge` | `badge` | Status base and on-status foreground roles; inside placement has an explicitly fixed white separator ring, independent of theme surface and foreground | Reviewed |
| 8 | `breadcrumb` | `breadcrumb` | Direct text and muted roles | Reviewed |
| 9 | `button` | `button` | Local action stack (`--leaf-shadow-control` on `outline`/`solid`; `outline` uses `primary-hover`/`primary-link-active` border & text; `solid` uses `primary-hover` hover; supports adaptive `primaryColor: 'neutral'`); `danger-soft-feedback-family` with `--leaf-color-danger` text and 50% hover / full active `danger-soft-hover` for `variant="danger"`; local on-color and `danger-border` split dividers | Reviewed + exception |
| 10 | `calendar` | `calendar` | `calendar-selection-family` and `segmented-surface-family`; `divider` hairline grid on `surface`; selected numeral uses `primary`, `on-primary`, and a `primary` boundary; today uses `primary` only; hover / press use the shared choice-option and `option-hover` backgrounds without overriding selected state | Reviewed |
| 11 | `card` | `card` | Direct border and surface roles with `softened-frame-color` tab divider; `resting-surface-shadow`; `variant="layered"` muted canvas and `selected` primary frame; transparent undivided footer | Reviewed |
| 12 | `carousel` | `carousel` | Local media-navigation controls over changing imagery | Exception |
| 13 | `cascader` | `cascader` | Primary `field` focus; `floating-paint`; `choice-option(false, true)` (`primary-soft` selection without trailing checks, immune to hover); controlled structural borders | Inherited |
| 14 | `checkbox` | `checkbox` | `choice` (`border-hover` resting border, `text-muted` unchecked hover); checked fill and border use `primary`, and content uses `on-primary` | Reviewed |
| 15 | `collapse` | `collapse` | `control-size`; direct surface, divider, and text roles | Reviewed |
| 16 | `color-picker` | `colorpicker` | Primary `field` focus; shared Input for color text and segmented Tabs for formats; intrinsic hue/alpha/checker/preset paint | Reviewed + exception |
| 18 | `config-provider` | `config-provider` | Contrast-calculation canvas only; no component paint | Exception |
| 19 | `confirm` | `confirm` | Inherits dialog/modal and button actions; danger-soft error detail | Inherited |
| 20 | `date-picker` | `datepicker`, private `timepicker` | Primary `field` focus; info/on-info native selection; `floating-paint`; shared calendar selection and `choice-option` time columns; persistent scrollbar | Reviewed |
| 21 | `date-range-picker` | `daterangepicker`, private `timerangepicker` | Shared DateInput field/selection, calendar range and TimePanel option paint; persistent scrollbar | Reviewed |
| 22 | `descriptions` | `descriptions` | Direct surface, divider, border, and muted roles | Reviewed |
| 23 | `divider` | `divider` | Dedicated divider role | Reviewed |
| 24 | `drawer` | `drawer` | `overlay-family`; shared dialog sections; direct panel surface and border | Reviewed |
| 25 | `dropdown` | `dropdown` | `floating-paint`; `choice-option`; `danger-soft-feedback-family` | Reviewed |
| 26 | `empty` | `empty` | Direct muted text, surface-muted icon tray, and border roles | Reviewed |
| 27 | `error-boundary` | `errorboundary` | Direct danger, surface, and text roles | Reviewed |
| 28 | `file-list` | `filelist` | Direct border and divider roles; `choice-option`; `status-label-family`; `status-ink-family`; `text-action`; local video letterbox | Reviewed + exception |
| 29 | `flex` | `flex` | No color responsibility | No color |
| 30 | `float-button` | `floatbutton` | Inherits shared Button action paint | Inherited |
| 31 | `form` | `form` | `danger-soft-feedback-family` for validation feedback | Reviewed |
| 32 | `grid` | `grid` | No color responsibility | No color |
| 33 | `image` | `image` | Fixed media-viewer overlays and exposed viewer variables | Exception |
| 34 | `infinite-scroll` | `infinitescroll` | Direct muted, text, and surface roles | Reviewed |
| 35 | `input` | `input` | `field('input')` (shared primary focus default); controlled native reset | Inherited |
| 36 | `input-mask` | `inputmask` | Inherits the input field shell and native reset | Inherited |
| 37 | `input-number` | `inputnumber` | Primary `field` focus; `option-hover` for stepper backgrounds | Reviewed |
| 38 | `input-otp` | `inputotp` | Unified hover (`primary-hover`, excluding selected slots), `primary-soft` selected slots, active slot `primary` / validation borders, and shared 2px 10% `field-ring-variables` halo; field/base roles | Reviewed |
| 39 | `layout` | `layout` | Direct surface, muted, and divider roles | Reviewed |
| 40 | `loading` | `loading` | Primary/border roles for all 12 animation variants and local translucent surface scrim | Exception |
| 41 | `loading-bar` | `loadingbar` | Direct primary role | Reviewed |
| 42 | `masonry` | `masonry` | No color responsibility | No color |
| 43 | `mentions` | `mentions` | `floating-paint`; `choice-option`; Textarea field/base roles | Inherited |
| 44 | `menu` | `menu` | Default `neutral` (`choice-option-background()` hover, `surface-muted` selection/press), `raised` (`shadow-xs`), and optional `primary` (`primary-alpha-4` / 5% `primary`); `danger-soft-feedback-family` | Reviewed + exception |
| 45 | `message` | `message` | Status roles; direct surface and elevation roles | Reviewed |
| 46 | `modal` | `modal` | `overlay-family`; shared dialog sections; direct panel surface, `border`, and header (non-mini) / footer `divider` | Reviewed |
| 47 | `notification` | `notification` | Status roles; direct surface and elevation roles | Reviewed |
| 48 | `pagination` | `pagination` | Active page uses Button `solid` (`primary` / `on-primary`) with static `default` hover cursor and disabled click; inactive controls inherit `text` / `outline` neutral roles | Reviewed |
| 49 | `popconfirm` | `popconfirm` | Inherits popover/modal and button action roles | Inherited |
| 50 | `popover` | `popover` | `floating-paint` with divider border | Inherited |
| 51 | `progress` | `progress` | Primary track/fill plus local shimmer effect | Exception |
| 52 | `qr-code` | `qrcode` | Exposed foreground/background roles and local canvas scrim | Exception |
| 53 | `radio` | `radio` | `choice` (`border-hover` resting border, `text-muted` unchecked hover); checked fill and border use `primary`, and content uses `on-primary` | Reviewed |
| 54 | `rate` | `rate` | Independent rating red/orange/gold scale | Exception |
| 55 | `result` | `result` | Status, surface, and text roles | Reviewed |
| 56 | `scroll-area` | `scrollarea` | Inherits scrollbar paint | Inherited |
| 57 | `scrollbar` | `scrollbar` | `focus-ring`; direct muted/text/surface roles | Reviewed |
| 58 | `select` | `select` | `field('select')` (shared primary focus default); `floating-paint`; `choice-option(false, true)` (`primary-soft` selection without trailing checks, immune to hover); `section-label` | Inherited |
| 59 | `skeleton` | `skeleton` | Local text-subtle shimmer | Exception |
| 60 | `slider` | `slider` | `accent-halo-family`; fill and thumb use `primary` | Reviewed |
| 61 | `space` | `space` | No color responsibility | No color |
| 62 | `splitter` | `splitter` | `surface-muted` handle with `border-hover` active state; `focus-ring` | Reviewed |
| 63 | `statistic` | `statistic` | Direct text, muted, and status roles | Reviewed |
| 64 | `steps` | `steps` | `control-size`; `focus-ring`; active and finished icons/connectors use neutral `surface` / `text` roles | Reviewed |
| 65 | `switch` | `switch` | `choice`; unchecked `option-hover` track; checked `primary` track and `primary` border; `on-primary` thumb with `primary` spinner | Reviewed |
| 66 | `table` / `table/tanstack` | `tabletanstack` | `softened-frame-color` & `table-family`: `subtle-action-background` headers (`--leaf-table-text`), softened `70% divider` frames & rules, `4%`/`2%` hover & stripes, `6%`/`10% primary` selection, `primary` active sort/resize indicators; scrollbar | Inherited |
| 67 | `tabs` | `tabs` | `segmented-surface-family` (`surface-muted` track, `surface` active slider with `shadow-sm`); `control-size`; `line` tabs (`text` rest, `primary-hover` / `primary-link-active` / `primary` interactive & selected + `primary` indicator, `divider` bottom hairline) and monochrome `card` / `segmented` states | Reviewed |
| 68 | `tag` | `tag` | `status-label-family`; soft backgrounds and foregrounds come from matching semantic roles (`primary` uses base `primary` directly); close feedback keeps `currentColor` translucency | Reviewed + exception |
| 69 | `textarea` | `textarea` | `field`; native resize remains component-owned | Inherited |
| 70 | `timeline` | `timeline` | Direct divider, primary, and status roles | Reviewed |
| 71 | `tooltip` | `tooltip` | Local inverse-content contrast | Exception |
| 72 | `tour` | `tour` | `overlay-family(spotlight)`; local target isolation | Reviewed |
| 73 | `transfer` | `transfer` | Direct `surface` and `border` panels (`--leaf-shadow-xs`); `surface-muted` selected rows with `text` label | Reviewed |
| 74 | `tree` | `tree` | `choice-option` row feedback; `surface-muted` drop-inside and `text` insertion bar; `shadow-md` drag preview | Reviewed |
| 75 | `tree-select` | `treeselect` | Primary `field` focus; `floating-paint`; `choice-option(false, true)` (`primary-soft` selection without trailing checks, immune to hover; checkboxes retained for `treeCheckable`) | Inherited |
| 76 | `typography` | `typography` | `surface-muted` action hover; `status-ink-family`; `primary` link roles; inline warning mark keeps its translucent content-highlight role | Reviewed + exception |
| 77 | `upload` | `upload` | Neutral `border-hover` / `surface-muted` hover and dragover feedback; `focus-ring` | Reviewed |
| 78 | `virtual-list` | `virtuallist` | `focus-ring`; direct surface/text roles | Reviewed |

## Numeric scale and role boundary

`color-scale.ts` provides the shared neutral nine-step OKLCH generator and `color-shades.ts` provides the seven light/dark semantic shade names as JS foundation utilities. Global stylesheet output emits only purpose roles that have active built-in consumers:

- Semantic soft surfaces map from the JS shade layer to `*-soft`, hover states use `*-soft-hover`, applicable borders use `*-border` (`primary`, `danger`, `warning`), readable text uses `*-ink` (for `success` / `warning` / `danger` / `info`, while built-in `primary` display layers consume `primary` directly), and solid fills use `on-*`.
- `primary-hover`, `primary-active`, `primary-link-hover`, `primary-link-active`, `danger-active`, `danger-link-hover`, and `danger-link-active` are the active interactive roles; zero-consumer CSS outputs (`neutral-100..900`, `*-light-N`/`-dark-N`, `*-soft-active`, `success/info-border`, `danger-hover`, `primary-indicator`, `primary-focus`, `primary-fill-border`, `primary-ink*`, and unused `primary-alpha-*` recipes) are pruned.
- Neutral `text`, `text-muted`, `text-subtle`, `surface`, `surface-muted`, `surface-raised`, `border`, `border-hover`, `divider`, and `option-hover` are emitted from the neutral OKLCH scale.
- Checkbox and Radio checked fills, borders, and marks use the active `primary` and `on-primary` (both inverting automatically when `primaryColor: 'neutral'` is active in dark mode). Switch follows the same `primary` track/border and `on-primary` thumb split and keeps its spinner on `primary`.
- Calendar selected numerals and DatePicker selected days pair `primary` paint and borders with `on-primary` content without changing geometry. Steps active/finished steps use monochrome `surface` and `text` tokens.
- Tag's custom-color TS path also resolves shared roles (consuming the base seed color for custom-color foreground `--leaf-tag-ink`). Historical local hook names such as `--leaf-tag-color-surface-8` remain compatibility plumbing, but their values map to the modern soft role rather than creating another percentage recipe.

Only six consumed optical percentage recipes remain generated in `src/color-recipes.ts` (`primary-alpha-20`, `primary-alpha-4`, `surface-alpha-55`, `surface-alpha-90`, `text-subtle-alpha-9`, `warning-alpha-16`). Unused historical percentage outputs and zero-consumer halo aliases are removed; new component or shared-family consumption is rejected. The static checker records exact current usage in `styles/_mixins.scss` and component exceptions; `styles/_palette.scss` and `color-scale.ts` are definition sources and are not counted as component debt. Fixed shadow paint in `styles/tokens.scss` has an exact reviewed optical exception budget.

The remaining numeric-token usages are deliberately transparent or appearance-specific:

- `Slider` keyboard focus halo keeps `primary-alpha-20`.
- `Menu`'s optional `primary` variant keeps `primary-alpha-4` for active feedback.
- `Overlay` dialog scrim uses `rgb(0 0 0 / 28%)` in light mode and `rgb(0 0 0 / 55%)` under `[data-leaf-theme='dark']` (without depending on `light-dark()`), `spotlight` keeps `rgb(0 0 0 / 45%)`, while Table's loading overlay retains optional `surface-alpha-80` compatibility with a local formula.
- Typography's inline warning mark retains `warning-alpha-16` because it highlights document content; it is not a status-label surface.
- Loading, QRCode, and Skeleton retain their own translucent scrim and shimmer formulas.

Table stripes (`2% --leaf-table-text`), hover tint (`4% --leaf-table-text`), selected rows (`6% / 10% primary`), softened `70% divider` borders, and loading scrim follow the table's own `surface` and theme tokens so component overrides remain isolated.

## Explicit local exceptions

These roles stay with their component because the visual responsibility is not a general semantic color family:

- Menu keeps its three selectable appearances: default `neutral` uses `surface-muted` with 80% inherited ink, while `raised` and optional `primary` retain their separate palettes. Select, Cascader, TreeSelect and TimePicker use `choice-option(false, true)` with `primary-soft` selected rows (no trailing checkmarks, immune to hover/highlight) and neutral hover with inherited ink on unselected rows. AutoComplete, Mentions, standalone Tree and Dropdown reuse the neutral `choice-option` recipe (standalone Tree retains its checkmark; candidate-only ARIA selections remain neutral). Calendar/range/time selection semantics and explicit primary field focus variants remain available where configured.
- ColorPicker keeps hue, alpha, checkerboard, preset, and contrast-outline paint. Its value field delegates geometry, validation and focus paint to the shared Input control.
- Rate keeps its independent rating scale; it is not the warning status family.
- Image preview, Carousel controls, and the FileList video letterbox keep media-owned overlays and contrast handling.
- Typography's inline warning mark keeps its translucent content-highlight layer rather than adopting an opaque status surface.
- Loading keeps its surface scrim, Progress and Skeleton their local shimmer/effect paint, and QRCode its exposed canvas foreground/background roles.
- Tooltip keeps inverse-content contrast and Tour keeps spotlight contrast.
- Button's solid split divider remains a local on-color separator role.
- Tag's close feedback stays `color-mix(currentColor 10%, transparent)` so it follows the actual solid/soft label foreground and does not reduce contrast over a pale hover fill.

## Verification boundary and commands

Source coverage of 81 exports is not a claim that 81 components received visual acceptance. The current workflow uses static / unit checks and user inspection, without a permanent browser suite; see [quality rules](QUALITY.md#当前验收规则).

Run the static and package checks from the repository root:

```powershell
pnpm check:colors
pnpm test:colors
pnpm --filter @ifhover/leaf-ui typecheck
pnpm --filter @ifhover/leaf-ui test
pnpm --filter @ifhover/leaf-ui build
```

Use a real browser only to diagnose a specific reported rendering issue or when explicitly requested. Do not restore the removed browser suite or infer visual acceptance from static checks.

Record the revision, command, environment, and actual result with the change set. This document describes source responsibility and does not carry a fabricated pass result for those commands.
