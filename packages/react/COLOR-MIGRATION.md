# Leaf UI color migration

## 0.9.0 configuration and variable migration

- Configure all six bases through ConfigProvider: `primaryColor`, `tokens.successColor`, `tokens.dangerColor`, `tokens.warningColor`, `tokens.infoColor`, and `tokens.neutralColor`. Update JS theme configuration to regenerate colors. DOM style/class changes no longer trigger JS derivation; CSS expressions remain CSS expressions and are not reinterpreted during hydration.
- All solid `on-*` foregrounds default to white, including bright custom fills. Set the corresponding `onPrimaryColor`, `onSuccessColor`, `onDangerColor`, `onWarningColor`, or `onInfoColor` to `#000000` when black text is needed. Soft ink remains separate.
- Unused percentage variables are removed rather than permanently generated as compatibility aliases. Replace historical `*-surface-*` with `*-soft`, `*-border-*` with `*-border`, and `*-text-*` with `*-ink` according to purpose; these are semantic replacements, not pixel-identical aliases. The ten retained optical recipes are listed in `src/color-recipes.ts`. Public bases and purpose variables remain; semantic numeric scales are replaced as described below.
- Solid press paint derives directly from the original base; outline press keeps text and border stable and adds a subtle neutral background. Explicit component/state overrides remain authoritative.

- Semantic `primary/success/danger/warning/info-100..900` variables from earlier 0.9.0 development drafts are not retained; these were not public variables in stable 0.8.1. Use original family bases for fills, purpose roles for component paint, and named `light-3/light-7/light-9/dark-1/dark-3/dark-7/dark-9` shades for explicit palette consumption. Each number is the percentage of white/black in tens, using sRGB; these are not pixel-identical aliases of development-only fixed-lightness steps. Neutral `100..900` is unchanged. Tailwind names follow the new shade names.
- Semantic ink preserves the original base when readable on all applicable surfaces; otherwise named shades provide readable adjustments. Solid `on-*` still defaults to white.
- Tabs segmented rails, ColorPicker format rails, inset Card outer canvases, Modal and inset picker canvases directly share `surface-muted`. Set `tokens.mutedSurfaceColor` to an exact color such as `rgb(244, 243, 239)`. Inner panels and selected sliders retain `surface`; explicit component backgrounds remain authoritative.

Source-level review for the `0.9.0` development branch on `2026-10-23`.

- Scope: 78 public component exports and their concrete source directories. `./table` and `./table/tanstack` both resolve to `src/tabletanstack` and count as one public component.
- Every public export has an assigned color responsibility. The four source outcomes are shared family, inherited responsibility, no color responsibility, and explicit local exception.
- "Reviewed" means the source ownership and token path were inspected. It does not mean that all 81 components received a separate browser visual check.

## Shared family contract

- `field` / `field-states` / `field-status`: shared field shell, primary focus by default and validation precedence for `autocomplete`, `cascader`, `colorpicker`, `datepicker`, `input`, `inputnumber`, `select`, `textarea`, and `treeselect`.
- `choice` / `choice-states` / `choice-surfaces`: shared choice geometry and state order for `checkbox`, `radio`, and `switch`.
- `floating-paint` and shared floating/backdrop helpers: popup surfaces and portal paint for fields, menus, popovers, tooltips, pickers, and overlays.
- `accent-soft-feedback-family`: `--leaf-accent-soft-background` maps to `primary-soft`; `--leaf-accent-soft-border` maps to `primary-border`. This is the broad soft-brand-feedback role for persistent selections, selected navigation, dragover feedback, and draggable-handle emphasis. Ordinary neutral option feedback uses `option-hover`, not this family.
- `danger-soft-feedback-family`: `--leaf-danger-soft-background` maps to `danger-soft`; `--leaf-danger-soft-active-background` maps to `danger-soft-active`. This is soft danger feedback, not a synonym for danger ink or danger indicators.
- `accent-halo-family`: shared translucent halo for `inputotp`, `slider`, and `upload`. It does not replace a solid keyboard focus ring.
- `segmented-surface-family`: shared segmented surface, border, selected surface, and muted label roles for `tabs` and `colorpicker`.
- `calendar-selection-family`: shared calendar range and selected-day paint uses `primary-soft`, with `primary-soft-hover` for selection feedback.
- `overlay-family`: dialog and spotlight overlay roles for `modal`, `drawer`, and `tour`.
- `panel-canvas-family`: muted panel canvas for `modal` and inset calendar-picker panels.
- `status-ink-family` / `status-label-family`: contrast-aware readable status ink and soft status-label foreground/background roles.
- `table-family`, `softened-frame-color`, and `resting-surface-shadow`: table and raised-surface ownership shared by Table and Card. Selected rows use `primary-soft`; stripes, hover, pinned shadows, and loading scrims retain formulas based on the table's own surface and text.

Single-consumer paint stays on direct semantic tokens or remains a documented local exception. A family is not introduced for a single consumer.

## Component inventory

| # | Export | Source | Assigned responsibility | Source result |
| ---: | --- | --- | --- | --- |
| 1 | `alert` | `alert` | Status base/ink roles on a neutral surface; `option-hover` for close feedback | Reviewed |
| 2 | `anchor` | `anchor` | `accent-soft-feedback-family` for selected navigation, resolved through `primary-soft` and `primary-border` | Reviewed |
| 4 | `auto-complete` | `autocomplete` | Primary `field` focus; `floating-paint`; shared `choice-option` feedback | Inherited |
| 5 | `avatar` | `avatar` | Direct surface, text, and border roles; grouped text fallbacks cycle through primary / info / warning / danger soft / ink pairs and neutral muted roles for identity, not status; explicit Avatar paint overrides win | Reviewed |
| 6 | `back-top` | `backtop` | Inherits shared Button action paint | Inherited |
| 7 | `badge` | `badge` | Status base and on-status foreground roles; inside placement has an explicitly fixed white separator ring, independent of theme surface and foreground | Reviewed |
| 8 | `breadcrumb` | `breadcrumb` | Direct text, muted, and primary-ink roles | Reviewed |
| 9 | `button` | `button` | Local action stack; `danger-soft-feedback-family` for ghost danger; local on-color split divider | Reviewed + exception |
| 10 | `calendar` | `calendar` | `calendar-selection-family` and `segmented-surface-family`; `divider` hairline grid on `surface`; selected numeral uses `primary`, `on-primary`, and an indicator boundary; today uses primary ink only; hover / press use the shared choice-option and `option-hover` backgrounds | Reviewed |
| 11 | `card` | `card` | `softened-frame-color`; `resting-surface-shadow`; direct surface roles | Reviewed |
| 12 | `carousel` | `carousel` | Local media-navigation controls over changing imagery | Exception |
| 13 | `cascader` | `cascader` | Primary `field` focus; `floating-paint`; `choice-option`; controlled structural borders | Inherited |
| 14 | `checkbox` | `checkbox` | `choice`; checked fill uses `primary`, checked border uses `primary-indicator`, and content uses `on-primary` | Reviewed |
| 15 | `collapse` | `collapse` | `control-size`; direct surface, divider, and text roles | Reviewed |
| 16 | `color-picker` | `colorpicker` | Primary `field` focus with local `shadow-xs`; internal segmented Tabs; intrinsic hue/alpha/checker/preset paint | Reviewed + exception |
| 18 | `config-provider` | `config-provider` | Contrast-calculation canvas only; no component paint | Exception |
| 19 | `confirm` | `confirm` | Inherits dialog/modal and button actions; danger-soft error detail | Inherited |
| 20 | `date-picker` | `datepicker`, private `timepicker` | Primary `field` focus; info/on-info native selection; `floating-paint`; shared calendar selection and `choice-option` time columns; persistent scrollbar | Reviewed |
| 21 | `date-range-picker` | `daterangepicker`, private `timerangepicker` | Shared DateInput field/selection, calendar range and TimePanel option paint; persistent scrollbar | Reviewed |
| 22 | `descriptions` | `descriptions` | Direct surface, divider, label, and muted roles | Reviewed |
| 23 | `divider` | `divider` | Dedicated divider role | Reviewed |
| 24 | `drawer` | `drawer` | `overlay-family`; shared dialog sections; direct panel surface | Reviewed |
| 25 | `dropdown` | `dropdown` | `floating-paint`; `choice-option`; `danger-soft-feedback-family` | Reviewed |
| 26 | `empty` | `empty` | Direct muted text, surface, and border roles | Reviewed |
| 27 | `error-boundary` | `errorboundary` | Direct danger, surface, and text roles | Reviewed |
| 28 | `file-list` | `filelist` | `softened-frame-color`; `choice-option`; `status-label-family`; `status-ink-family`; `text-action`; local video letterbox | Reviewed + exception |
| 29 | `flex` | `flex` | No color responsibility | No color |
| 30 | `float-button` | `floatbutton` | Inherits shared Button action paint | Inherited |
| 31 | `form` | `form` | `danger-soft-feedback-family` for validation feedback | Reviewed |
| 32 | `grid` | `grid` | No color responsibility | No color |
| 33 | `image` | `image` | Fixed media-viewer overlays and exposed viewer variables | Exception |
| 34 | `infinite-scroll` | `infinitescroll` | Direct muted, text, and surface roles | Reviewed |
| 35 | `input` | `input` | `field('input')` (shared primary-focus default); controlled native reset | Inherited |
| 36 | `input-mask` | `inputmask` | Inherits the input field shell and native reset | Inherited |
| 37 | `input-number` | `inputnumber` | `field`; `option-hover` for stepper backgrounds | Reviewed |
| 38 | `input-otp` | `inputotp` | `accent-halo-family`; field/base roles | Reviewed |
| 39 | `layout` | `layout` | Direct surface, muted, and divider roles | Reviewed |
| 40 | `loading` | `loading` | Local translucent surface scrim | Exception |
| 41 | `loading-bar` | `loadingbar` | Local primary glow effect | Exception |
| 42 | `masonry` | `masonry` | No color responsibility | No color |
| 43 | `mentions` | `mentions` | `floating-paint`; `choice-option`; Textarea field/base roles | Inherited |
| 44 | `menu` | `menu` | `danger-soft-feedback-family`; explicit local appearance palette | Reviewed + exception |
| 45 | `message` | `message` | Status roles; direct surface and elevation roles | Reviewed |
| 46 | `modal` | `modal` | `overlay-family`; `panel-canvas-family`; shared dialog sections | Reviewed |
| 47 | `notification` | `notification` | Status roles; direct surface and elevation roles | Reviewed |
| 48 | `pagination` | `pagination` | `accent-soft-feedback-family` resolves to `primary-soft` / `primary-border`; `primary-indicator` remains the selection indicator | Reviewed |
| 49 | `popconfirm` | `popconfirm` | Inherits popover/modal and button action roles | Inherited |
| 50 | `popover` | `popover` | `floating-paint` with divider border | Inherited |
| 51 | `progress` | `progress` | Primary track/fill plus local shimmer effect | Exception |
| 52 | `qr-code` | `qrcode` | Exposed foreground/background roles and local canvas scrim | Exception |
| 53 | `radio` | `radio` | `choice`; checked fill uses `primary`, checked border uses `primary-indicator`, and content uses `on-primary` | Reviewed |
| 54 | `rate` | `rate` | Independent rating red/orange/gold scale | Exception |
| 55 | `result` | `result` | Status, surface, and text roles | Reviewed |
| 56 | `scroll-area` | `scrollarea` | Inherits scrollbar paint | Inherited |
| 57 | `scrollbar` | `scrollbar` | `focus-ring`; direct muted/text/surface roles | Reviewed |
| 58 | `select` | `select` | `field('select')` (shared primary-focus default); `floating-paint`; `choice-option`; `section-label` | Inherited |
| 59 | `skeleton` | `skeleton` | Local text-subtle shimmer | Exception |
| 60 | `slider` | `slider` | `accent-halo-family`; fill and thumb keep `primary-indicator` as independent indicators | Reviewed |
| 61 | `space` | `space` | No color responsibility | No color |
| 62 | `splitter` | `splitter` | `accent-soft-feedback-family`; hover uses `accent-soft-border`; `focus-ring` | Reviewed |
| 63 | `statistic` | `statistic` | Direct text, muted, and status roles | Reviewed |
| 64 | `steps` | `steps` | `control-size`; `focus-ring`; finished icons use `primary` / `on-primary` with an indicator border | Reviewed |
| 65 | `switch` | `switch` | `choice`; unchecked `option-hover` track; checked `primary` track and `primary-indicator` border; `on-primary` thumb with `primary` spinner | Reviewed |
| 66 | `table` / `table/tanstack` | `tabletanstack` | `table-family` selected rows use `primary-soft`; table-local stripe/hover/scrim formulas retained; scrollbar | Inherited |
| 67 | `tabs` | `tabs` | `segmented-surface-family`; `control-size`; shared state paint | Reviewed |
| 68 | `tag` | `tag` | `status-label-family`; soft backgrounds and readable inks come from matching semantic roles; close feedback keeps `currentColor` translucency | Reviewed + exception |
| 69 | `textarea` | `textarea` | `field`; native resize remains component-owned | Inherited |
| 70 | `timeline` | `timeline` | Direct divider, primary, and status roles | Reviewed |
| 71 | `tooltip` | `tooltip` | Local inverse-content contrast | Exception |
| 72 | `tour` | `tour` | `overlay-family(spotlight)`; local target isolation | Reviewed |
| 73 | `transfer` | `transfer` | Muted canvas, inset content surface, shared softened frame and inner shadow; `accent-soft-feedback-family` for selected rows | Reviewed |
| 74 | `tree` | `tree` | `choice-option` row feedback; `accent-soft-feedback-family` for drop-inside; `shadow-md` drag preview | Reviewed |
| 75 | `tree-select` | `treeselect` | Primary `field` focus; `floating-paint`; tree selection semantics | Inherited |
| 76 | `typography` | `typography` | `accent-soft-feedback-family` for action hover; `status-ink-family`; inline warning mark keeps its translucent content-highlight role | Reviewed + exception |
| 77 | `upload` | `upload` | `accent-soft-feedback-family` for dragover; `accent-halo-family` with 4px halo; `focus-ring` | Reviewed |
| 78 | `virtual-list` | `virtuallist` | `focus-ring`; direct surface/text roles | Reviewed |

## Numeric scale and role boundary

`color-scale.ts` generates the shared neutral nine-step scale. Semantic families use the named light / dark shades from `color-shades.ts`; only neutral exposes 100-900 steps. These shades are foundation data, not a component color-picker API. Components and shared families consume purpose roles instead:

- Semantic soft surfaces map from the shared scale to `*-soft`, feedback states use `*-soft-hover` / `*-soft-active`, borders use `*-border`, readable text uses `*-ink`, and solid fills use the matching `on-*` foreground.
- `primary-indicator`, `primary-focus`, `primary-fill-border`, `primary-hover`, `primary-active`, `primary-ink-hover`, and `primary-ink-active` remain independent primary roles. Slider and Pagination continue to use `primary-indicator` where an indicator is the intended visual.
- Neutral `text`, `text-muted`, `text-subtle`, `surface`, `surface-muted`, `surface-raised`, `border`, `border-hover`, `divider`, and `option-hover` are generated roles. `styles/tokens.scss` no longer replaces the last four with historical percentage aliases.
- Checkbox and Radio checked fills use the cross-mode `primary` base, bordered by `primary-indicator` when dark-mode visibility requires it, with `on-primary` marks. Switch follows the same fill/border/content split and keeps its spinner on `primary`.
- Calendar selected numerals, DatePicker selected days, and Steps finished icons pair `primary` paint with `on-primary` content. Their indicator/fill-border boundary provides dark-surface separation without changing geometry.
- Tag's custom-color TS path also resolves shared roles. Historical local hook names such as `--leaf-tag-color-surface-8` remain compatibility plumbing, but their values map to the modern soft role rather than creating another percentage recipe.

Only ten consumed optical percentage recipes remain generated. Unused historical percentage outputs are removed in 0.9.0; new component or shared-family consumption is rejected. The static checker records exact current usage in `styles/_mixins.scss` and component exceptions; `styles/_palette.scss` and `color-scale.ts` are definition sources and are not counted as component debt. Fixed shadow paint in `styles/tokens.scss` has an exact reviewed optical exception budget.

The remaining numeric-token usages are deliberately transparent or appearance-specific:

- The shared accent halo keeps `primary-alpha-12`, `primary-alpha-16`, and `primary-alpha-20` because these are optical rings rather than soft selection fills.
- The shared table overlay retains the optional historical `surface-alpha-80` compatibility input with a local surface formula.
- Typography's inline warning mark retains `warning-alpha-16` because it highlights document content; it is not a status-label surface.
- Loading, LoadingBar, QRCode, and Skeleton retain their own translucent scrim, glow, and shimmer formulas.
- Menu retains its complete local appearance, including `primary-alpha-10` / `primary-alpha-4` and neutral black overlays.

Table stripes, hover tint, pinned-column shadows, and the loading scrim still follow the actual table surface and text because the component supports a local custom surface. Only its selected-row fill is normalized to `primary-soft`.

## Explicit local exceptions

These roles stay with their component because the visual responsibility is not a general semantic color family:

- Menu keeps its complete appearance: default uses full neutral feedback and 80% inherited ink, while raised/primary and danger states retain their separate palettes. Select, AutoComplete, Mentions, Tree, TreeSelect, Cascader and Dropdown reuse the shared choice-row recipe with half-strength neutral feedback, 70% resting ink and row-local background-color transitions. Persistent values keep their checks without a saved background; candidate-only ARIA selections retain active feedback. Calendar/range/time selection semantics and field focus variants do not change.
- ColorPicker keeps hue, alpha, checkerboard, preset, and contrast-outline paint. The inline field keeps `shadow-xs` through the field override path.
- Rate keeps its independent rating scale; it is not the warning status family.
- Image, Carousel controls, and the FileList video letterbox keep media-owned overlays and contrast handling.
- Typography's inline warning mark keeps its translucent content-highlight layer rather than adopting an opaque status surface.
- Loading keeps its surface scrim, LoadingBar its glow, Progress and Skeleton their local shimmer/effect paint, and QRCode its exposed canvas foreground/background roles.
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
