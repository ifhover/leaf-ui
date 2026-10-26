# Leaf UI color contract audit

> This file records migration debt, reviewed component-specific recipes, and structural contracts. Zero debt is not a claim that all colors were merged or every possible custom theme meets accessibility requirements. See COLOR-MIGRATION.md for component coverage and QUALITY.md for browser evidence.

Snapshot: 0.9.0 development sources, generated from a static source scan. The checker compares normalized expressions and occurrence counts, not line numbers.

## Scope

- Scanned: `packages/react/src/**/*.scss|ts|tsx`.
- Excluded from consumption/debt: generated `styles/_palette.scss`, `*.test.*`, `*.spec.*`, fixtures, and declaration files.
- Not counted as reuse: `color-shades.ts`, `color-scale.ts`, `colors.ts`, `color-recipes.ts`, `tailwind-tokens.ts`, `styles/tokens.scss`, and `styles/_palette.scss`.
- Shared `styles/_mixins.scss` formulas, fixed colors, legacy numeric-token usages and color-scale step selections have a separate reviewed registry, not component debt. Semantic shade usage is only allowed in shared generation sources; neutral `100`-`900` usage remains reviewed through the baseline.
- `styles/tokens.scss` does not count as reuse, but its fixed optical colors and formulas require exact reviewed exception budgets.
- Static limits: this is a declaration/expression scanner, not a CSS cascade engine. Dynamic SCSS interpolation, portal overrides, inline styles supplied by applications, and computed values are outside its proof.

## Current totals

| Metric | Expressions | Occurrences |
| --- | ---: | ---: |
| Hardcoded color debt | 0 | 0 |
| Component color-mix debt | 0 | 0 |
| Numeric derived-token debt | 0 | 0 |
| Color-scale step debt | 0 | 0 |
| Field-family border debt | 0 | 0 |
| Legal hardcoded-color exceptions | 54 | 75 |
| Legal color-mix exceptions | 1 | 1 |
| Reviewed derived-token exceptions | 7 | 7 |
| Reviewed color-scale step exceptions | 0 | 0 |
| Reviewed field-structure exceptions | 17 | 27 |

Registered undefined-token risk occurrences: 0.

Global color tokens: 110. Color recipes: 10. Field-family consumers: 9.

Definition source counts (a token may have multiple sources): override 28, palette 109, recipe 10.

## Migration accounting

The starting register contained 184 debt occurrences. 108 existing occurrences were retained after responsibility-specific review and moved to exact local exception budgets. Other retired component allowances were removed or replaced by shared recipes. These are occurrence classifications, not a claim that this many global colors were deleted. Semantic families expose seven named sRGB shades, neutral retains its 100-900 lightness scale, and unused historical percentage outputs are retired in 0.9.0 as recorded in COLOR-MIGRATION.md.

## Global token review

The baseline includes the union of palette output, recipe keys, literal derived outputs from `colors.ts`, token aliases, theme override mappings, and any other global definitions. New or removed global `--leaf-color-*` tokens fail until an explicit review entry is added. `_palette.scss` is an output inventory only and is never counted as a consumer.

Optional override tokens and unknown fallback names remain visible in the audit. They are not treated as normal component reuse.

## Field-family contract

- `autocomplete/autocomplete.scss`: 1 controlled border expression
- `cascader/cascader.scss`: 2 controlled border expressions
- `colorpicker/colorpicker.scss`: 4 controlled border expressions
- `datepicker/datepicker.scss`: 3 controlled border expressions
- `input/input.scss`: 1 controlled border expression
- `inputnumber/inputnumber.scss`: 4 controlled border expressions
- `select/select.scss`: 1 controlled border expression
- `textarea/textarea.scss`: 0 controlled border expressions
- `treeselect/treeselect.scss`: 1 controlled border expression

All field shells must use the shared primary-focus default via `mixins.field(component)` and must not redefine `--leaf-field-color` or `--leaf-field-rest-border`. The shared expression registry prevents unreviewed formula growth but does not prove internal state precedence; changes there require the documented browser comparison. Inner native-control resets, structural dividers and popup-only paint are separately reviewed exceptions, not duplicated field-shell recipes.

## Undefined or optional tokens

### Override-only global tokens

- `--leaf-color-focus`: 2 component files, 1 shared/infrastructure files, 3 occurrences.

### Registered undefined risks

- None.

### Optional-only consumers with fallback

- `calendar/calendar.scss`: `var(--leaf-color-focus, ...)`
- `inputotp/inputotp.scss`: `var(--leaf-color-focus, ...)`
- `styles/_mixins.scss`: `var(--leaf-color-focus, ...)`

### Unknown consumers with fallback

- `styles/_mixins.scss`: `var(--leaf-color-surface-alpha-80, ...)` (fallback present; no registered definition).

## Generated token consumption

Counts are direct static `var(--leaf-color-*)` consumers. Generated definitions, token aliases, tests, fixtures, and documentation do not count as reuse. A shared recipe counts as one shared file, not as proof that every component using that recipe paints the token.

| Token | Component files | Shared/infrastructure files | Occurrences |
| --- | ---: | ---: | ---: |
| `--leaf-color-border` | 24 | 5 | 42 |
| `--leaf-color-border-hover` | 5 | 1 | 6 |
| `--leaf-color-danger` | 9 | 1 | 12 |
| `--leaf-color-danger-active` | 1 | 0 | 1 |
| `--leaf-color-danger-border` | 1 | 1 | 4 |
| `--leaf-color-danger-dark-1` | 0 | 0 | 0 |
| `--leaf-color-danger-dark-3` | 0 | 0 | 0 |
| `--leaf-color-danger-dark-7` | 0 | 0 | 0 |
| `--leaf-color-danger-dark-9` | 0 | 0 | 0 |
| `--leaf-color-danger-hover` | 0 | 0 | 0 |
| `--leaf-color-danger-ink` | 9 | 1 | 17 |
| `--leaf-color-danger-light-3` | 0 | 0 | 0 |
| `--leaf-color-danger-light-7` | 0 | 0 | 0 |
| `--leaf-color-danger-light-9` | 0 | 0 | 0 |
| `--leaf-color-danger-soft` | 0 | 1 | 2 |
| `--leaf-color-danger-soft-active` | 0 | 1 | 1 |
| `--leaf-color-danger-soft-hover` | 0 | 0 | 0 |
| `--leaf-color-divider` | 15 | 6 | 37 |
| `--leaf-color-info` | 4 | 0 | 5 |
| `--leaf-color-info-border` | 0 | 0 | 0 |
| `--leaf-color-info-dark-1` | 0 | 0 | 0 |
| `--leaf-color-info-dark-3` | 0 | 0 | 0 |
| `--leaf-color-info-dark-7` | 0 | 0 | 0 |
| `--leaf-color-info-dark-9` | 0 | 0 | 0 |
| `--leaf-color-info-ink` | 0 | 1 | 1 |
| `--leaf-color-info-light-3` | 0 | 0 | 0 |
| `--leaf-color-info-light-7` | 0 | 0 | 0 |
| `--leaf-color-info-light-9` | 0 | 0 | 0 |
| `--leaf-color-info-soft` | 0 | 1 | 1 |
| `--leaf-color-info-soft-active` | 0 | 0 | 0 |
| `--leaf-color-info-soft-hover` | 0 | 0 | 0 |
| `--leaf-color-neutral` | 0 | 0 | 0 |
| `--leaf-color-neutral-100` | 0 | 0 | 0 |
| `--leaf-color-neutral-200` | 0 | 0 | 0 |
| `--leaf-color-neutral-300` | 0 | 0 | 0 |
| `--leaf-color-neutral-400` | 0 | 0 | 0 |
| `--leaf-color-neutral-500` | 0 | 0 | 0 |
| `--leaf-color-neutral-600` | 0 | 0 | 0 |
| `--leaf-color-neutral-700` | 0 | 0 | 0 |
| `--leaf-color-neutral-800` | 0 | 0 | 0 |
| `--leaf-color-neutral-900` | 0 | 0 | 0 |
| `--leaf-color-on-danger` | 3 | 1 | 4 |
| `--leaf-color-on-info` | 2 | 1 | 3 |
| `--leaf-color-on-primary` | 8 | 1 | 12 |
| `--leaf-color-on-success` | 1 | 1 | 2 |
| `--leaf-color-on-warning` | 1 | 1 | 2 |
| `--leaf-color-option-hover` | 5 | 2 | 13 |
| `--leaf-color-primary` | 32 | 3 | 82 |
| `--leaf-color-primary-active` | 1 | 0 | 1 |
| `--leaf-color-primary-alpha-10` | 1 | 0 | 1 |
| `--leaf-color-primary-alpha-12` | 0 | 1 | 1 |
| `--leaf-color-primary-alpha-16` | 0 | 1 | 1 |
| `--leaf-color-primary-alpha-20` | 0 | 1 | 1 |
| `--leaf-color-primary-alpha-4` | 1 | 0 | 1 |
| `--leaf-color-primary-alpha-55` | 1 | 0 | 1 |
| `--leaf-color-primary-border` | 1 | 1 | 2 |
| `--leaf-color-primary-dark-1` | 0 | 0 | 0 |
| `--leaf-color-primary-dark-3` | 0 | 0 | 0 |
| `--leaf-color-primary-dark-7` | 0 | 0 | 0 |
| `--leaf-color-primary-dark-9` | 0 | 0 | 0 |
| `--leaf-color-primary-fill-border` | 1 | 0 | 1 |
| `--leaf-color-primary-focus` | 0 | 0 | 0 |
| `--leaf-color-primary-hover` | 0 | 0 | 0 |
| `--leaf-color-primary-indicator` | 26 | 2 | 49 |
| `--leaf-color-primary-ink` | 16 | 3 | 31 |
| `--leaf-color-primary-ink-active` | 1 | 0 | 1 |
| `--leaf-color-primary-ink-hover` | 1 | 0 | 1 |
| `--leaf-color-primary-light-3` | 0 | 0 | 0 |
| `--leaf-color-primary-light-7` | 0 | 0 | 0 |
| `--leaf-color-primary-light-9` | 0 | 0 | 0 |
| `--leaf-color-primary-soft` | 0 | 1 | 5 |
| `--leaf-color-primary-soft-active` | 0 | 0 | 0 |
| `--leaf-color-primary-soft-hover` | 0 | 1 | 1 |
| `--leaf-color-success` | 4 | 0 | 6 |
| `--leaf-color-success-border` | 0 | 0 | 0 |
| `--leaf-color-success-dark-1` | 0 | 0 | 0 |
| `--leaf-color-success-dark-3` | 0 | 0 | 0 |
| `--leaf-color-success-dark-7` | 0 | 0 | 0 |
| `--leaf-color-success-dark-9` | 0 | 0 | 0 |
| `--leaf-color-success-ink` | 0 | 1 | 1 |
| `--leaf-color-success-light-3` | 0 | 0 | 0 |
| `--leaf-color-success-light-7` | 0 | 0 | 0 |
| `--leaf-color-success-light-9` | 0 | 0 | 0 |
| `--leaf-color-success-soft` | 0 | 1 | 1 |
| `--leaf-color-success-soft-active` | 0 | 0 | 0 |
| `--leaf-color-success-soft-hover` | 0 | 0 | 0 |
| `--leaf-color-surface` | 34 | 4 | 60 |
| `--leaf-color-surface-alpha-55` | 1 | 0 | 1 |
| `--leaf-color-surface-alpha-90` | 1 | 0 | 1 |
| `--leaf-color-surface-muted` | 26 | 4 | 46 |
| `--leaf-color-surface-raised` | 8 | 2 | 10 |
| `--leaf-color-text` | 47 | 5 | 98 |
| `--leaf-color-text-muted` | 43 | 6 | 106 |
| `--leaf-color-text-subtle` | 10 | 1 | 15 |
| `--leaf-color-text-subtle-alpha-9` | 1 | 0 | 1 |
| `--leaf-color-warning` | 3 | 1 | 5 |
| `--leaf-color-warning-alpha-16` | 1 | 0 | 1 |
| `--leaf-color-warning-border` | 0 | 1 | 1 |
| `--leaf-color-warning-dark-1` | 0 | 0 | 0 |
| `--leaf-color-warning-dark-3` | 0 | 0 | 0 |
| `--leaf-color-warning-dark-7` | 0 | 0 | 0 |
| `--leaf-color-warning-dark-9` | 0 | 0 | 0 |
| `--leaf-color-warning-ink` | 0 | 1 | 1 |
| `--leaf-color-warning-light-3` | 0 | 0 | 0 |
| `--leaf-color-warning-light-7` | 0 | 0 | 0 |
| `--leaf-color-warning-light-9` | 0 | 0 | 0 |
| `--leaf-color-warning-soft` | 0 | 1 | 1 |
| `--leaf-color-warning-soft-active` | 0 | 0 | 0 |
| `--leaf-color-warning-soft-hover` | 0 | 0 | 0 |

### Tokens with zero direct component consumers

- `--leaf-color-danger-dark-1`
- `--leaf-color-danger-dark-3`
- `--leaf-color-danger-dark-7`
- `--leaf-color-danger-dark-9`
- `--leaf-color-danger-hover`
- `--leaf-color-danger-light-3`
- `--leaf-color-danger-light-7`
- `--leaf-color-danger-light-9`
- `--leaf-color-danger-soft`
- `--leaf-color-danger-soft-active`
- `--leaf-color-danger-soft-hover`
- `--leaf-color-info-border`
- `--leaf-color-info-dark-1`
- `--leaf-color-info-dark-3`
- `--leaf-color-info-dark-7`
- `--leaf-color-info-dark-9`
- `--leaf-color-info-ink`
- `--leaf-color-info-light-3`
- `--leaf-color-info-light-7`
- `--leaf-color-info-light-9`
- `--leaf-color-info-soft`
- `--leaf-color-info-soft-active`
- `--leaf-color-info-soft-hover`
- `--leaf-color-neutral`
- `--leaf-color-neutral-100`
- `--leaf-color-neutral-200`
- `--leaf-color-neutral-300`
- `--leaf-color-neutral-400`
- `--leaf-color-neutral-500`
- `--leaf-color-neutral-600`
- `--leaf-color-neutral-700`
- `--leaf-color-neutral-800`
- `--leaf-color-neutral-900`
- `--leaf-color-primary-alpha-12`
- `--leaf-color-primary-alpha-16`
- `--leaf-color-primary-alpha-20`
- `--leaf-color-primary-dark-1`
- `--leaf-color-primary-dark-3`
- `--leaf-color-primary-dark-7`
- `--leaf-color-primary-dark-9`
- `--leaf-color-primary-focus`
- `--leaf-color-primary-hover`
- `--leaf-color-primary-light-3`
- `--leaf-color-primary-light-7`
- `--leaf-color-primary-light-9`
- `--leaf-color-primary-soft`
- `--leaf-color-primary-soft-active`
- `--leaf-color-primary-soft-hover`
- `--leaf-color-success-border`
- `--leaf-color-success-dark-1`
- `--leaf-color-success-dark-3`
- `--leaf-color-success-dark-7`
- `--leaf-color-success-dark-9`
- `--leaf-color-success-ink`
- `--leaf-color-success-light-3`
- `--leaf-color-success-light-7`
- `--leaf-color-success-light-9`
- `--leaf-color-success-soft`
- `--leaf-color-success-soft-active`
- `--leaf-color-success-soft-hover`
- `--leaf-color-warning-border`
- `--leaf-color-warning-dark-1`
- `--leaf-color-warning-dark-3`
- `--leaf-color-warning-dark-7`
- `--leaf-color-warning-dark-9`
- `--leaf-color-warning-ink`
- `--leaf-color-warning-light-3`
- `--leaf-color-warning-light-7`
- `--leaf-color-warning-light-9`
- `--leaf-color-warning-soft`
- `--leaf-color-warning-soft-active`
- `--leaf-color-warning-soft-hover`

## Existing debt detail

- None.

## Reviewed exceptions

These entries are controlled exceptions, not compliance claims. Their exact expression and count are part of the baseline.

### `autocomplete/autocomplete.scss`
- fieldFamilyBorders: `border:0` x1 - Native inner control/action border reset or moving-highlight transparency; the outer field is painted by the shared field recipe.

### `badge/badge.scss`
- hardcodedColors: `#fff` x1 - Explicit inside Badge design contract: a fixed white separator ring on light and dark targets, independent of surface and foreground overrides. Covered by badge browser geometry and paint tests.

### `button/button.scss`
- mixFormulas: `color-mix(in srgb,var(--leaf-button-on-color)32%,transparent)` x1 - Solid split-action separator follows its own on-fill foreground; not an ordinary border or standalone action color.

### `cascader/cascader.scss`
- fieldFamilyBorders: `border-inline-start:1px solid var(--leaf-color-border)` x1 - Internal column/control separator using the existing border or shared field state role; not an independently chosen outer field border.
- fieldFamilyBorders: `border:0` x1 - Native inner control/action border reset or moving-highlight transparency; the outer field is painted by the shared field recipe.

### `colorpicker/colorpicker.scss`
- hardcodedColors: `#000` x1 - ColorPicker spectrum, alpha checkerboard, hue ramp, and swatch contrast require fixed visual colors.
- hardcodedColors: `#00f` x1 - ColorPicker spectrum, alpha checkerboard, hue ramp, and swatch contrast require fixed visual colors.
- hardcodedColors: `#0f0` x1 - ColorPicker spectrum, alpha checkerboard, hue ramp, and swatch contrast require fixed visual colors.
- hardcodedColors: `#0ff` x1 - ColorPicker spectrum, alpha checkerboard, hue ramp, and swatch contrast require fixed visual colors.
- hardcodedColors: `#ddd` x2 - ColorPicker spectrum, alpha checkerboard, hue ramp, and swatch contrast require fixed visual colors.
- hardcodedColors: `#f00` x2 - ColorPicker spectrum, alpha checkerboard, hue ramp, and swatch contrast require fixed visual colors.
- hardcodedColors: `#f0f` x1 - ColorPicker spectrum, alpha checkerboard, hue ramp, and swatch contrast require fixed visual colors.
- hardcodedColors: `#ff0` x1 - ColorPicker spectrum, alpha checkerboard, hue ramp, and swatch contrast require fixed visual colors.
- hardcodedColors: `#fff` x6 - ColorPicker spectrum, alpha checkerboard, hue ramp, and swatch contrast require fixed visual colors.
- hardcodedColors: `rgb(0 0 0/25%)` x4 - ColorPicker spectrum, alpha checkerboard, hue ramp, and swatch contrast require fixed visual colors.
- hardcodedColors: `rgb(0 0 0/8%)` x2 - ColorPicker spectrum, alpha checkerboard, hue ramp, and swatch contrast require fixed visual colors.
- hardcodedColors: `rgb(255 255 255/18%)` x1 - ColorPicker spectrum, alpha checkerboard, hue ramp, and swatch contrast require fixed visual colors.
- fieldFamilyBorders: `border:0` x2 - Native inner control/action border reset or moving-highlight transparency; the outer field is painted by the shared field recipe.
- fieldFamilyBorders: `border:1px solid rgb(0 0 0/8%)` x1 - ColorPicker format-switch frame, spectrum thumb or swatch contrast border, not the outer field shell.
- fieldFamilyBorders: `border:2px solid #fff` x3 - ColorPicker format-switch frame, spectrum thumb or swatch contrast border, not the outer field shell.
- fieldFamilyBorders: `border:2px solid var(--leaf-color-surface)` x1 - ColorPicker format-switch frame, spectrum thumb or swatch contrast border, not the outer field shell.

### `colorpicker/colorpicker.tsx`
- hardcodedColors: `#000` x1 - ColorPicker preset palette and contrast-safe swatch labels are component content, not semantic theme defaults.
- hardcodedColors: `#13a8a8` x1 - ColorPicker preset palette and contrast-safe swatch labels are component content, not semantic theme defaults.
- hardcodedColors: `#1677ff` x1 - ColorPicker preset palette and contrast-safe swatch labels are component content, not semantic theme defaults.
- hardcodedColors: `#203329` x2 - ColorPicker preset palette and contrast-safe swatch labels are component content, not semantic theme defaults.
- hardcodedColors: `#7654c6` x1 - ColorPicker preset palette and contrast-safe swatch labels are component content, not semantic theme defaults.
- hardcodedColors: `#ef5350` x1 - ColorPicker preset palette and contrast-safe swatch labels are component content, not semantic theme defaults.
- hardcodedColors: `#f49b23` x1 - ColorPicker preset palette and contrast-safe swatch labels are component content, not semantic theme defaults.
- hardcodedColors: `#ffc53d` x1 - ColorPicker preset palette and contrast-safe swatch labels are component content, not semantic theme defaults.
- hardcodedColors: `#fff` x2 - ColorPicker preset palette and contrast-safe swatch labels are component content, not semantic theme defaults.

### `config-provider/helpers.ts`
- hardcodedColors: `#ffffff` x1 - Contrast helper uses white as a calculation canvas, not component paint.

### `datepicker/datepicker.scss`
- fieldFamilyBorders: `border-color:var(--leaf-color-border)` x1 - Calendar day geometry/disabled day boundary or inner action reset; not the outer date field.
- fieldFamilyBorders: `border:0` x3 - Native inner control/action border reset or moving-highlight transparency; the outer field is painted by the shared field recipe.
- fieldFamilyBorders: `border:1px solid transparent` x1 - Calendar day geometry/disabled day boundary or inner action reset; not the outer date field.

### `filelist/filelist.scss`
- hardcodedColors: `#111` x1 - Fixed letterboxing belongs to the video content, not the regional theme surface.

### `image/image.scss`
- hardcodedColors: `#0003` x1 - Media viewer chrome uses fixed lightbox colors for photographic overlays and third-party viewer variables.
- hardcodedColors: `#0006` x1 - Media viewer chrome uses fixed lightbox colors for photographic overlays and third-party viewer variables.
- hardcodedColors: `#0009` x1 - Media viewer chrome uses fixed lightbox colors for photographic overlays and third-party viewer variables.
- hardcodedColors: `#26292f` x1 - Media viewer chrome uses fixed lightbox colors for photographic overlays and third-party viewer variables.
- hardcodedColors: `#b7bfc9` x1 - Media viewer chrome uses fixed lightbox colors for photographic overlays and third-party viewer variables.
- hardcodedColors: `#e8edf3` x1 - Media viewer chrome uses fixed lightbox colors for photographic overlays and third-party viewer variables.
- hardcodedColors: `#f4f5f7` x2 - Media viewer chrome uses fixed lightbox colors for photographic overlays and third-party viewer variables.
- hardcodedColors: `#f5b4b4` x1 - Media viewer chrome uses fixed lightbox colors for photographic overlays and third-party viewer variables.
- hardcodedColors: `#fff` x6 - Media viewer chrome uses fixed lightbox colors for photographic overlays and third-party viewer variables.
- hardcodedColors: `#ffffff0b` x1 - Media viewer chrome uses fixed lightbox colors for photographic overlays and third-party viewer variables.
- hardcodedColors: `#ffffff0e` x1 - Media viewer chrome uses fixed lightbox colors for photographic overlays and third-party viewer variables.
- hardcodedColors: `#ffffff12` x1 - Media viewer chrome uses fixed lightbox colors for photographic overlays and third-party viewer variables.
- hardcodedColors: `#ffffff1c` x1 - Media viewer chrome uses fixed lightbox colors for photographic overlays and third-party viewer variables.
- hardcodedColors: `#ffffff24` x1 - Media viewer chrome uses fixed lightbox colors for photographic overlays and third-party viewer variables.
- hardcodedColors: `rgba(0,0,0,0.22)` x1 - Media viewer chrome uses fixed lightbox colors for photographic overlays and third-party viewer variables.
- hardcodedColors: `white` x1 - Media viewer chrome uses fixed lightbox colors for photographic overlays and third-party viewer variables.

### `image/viewer.tsx`
- hardcodedColors: `rgba(0,0,0,.92)` x1 - Media viewer backdrop is a fixed photographic overlay color.

### `input/input.scss`
- fieldFamilyBorders: `border:0` x3 - Native inner control/action border reset or moving-highlight transparency; the outer field is painted by the shared field recipe.

### `inputnumber/inputnumber.scss`
- fieldFamilyBorders: `border-inline-start-color:var(--leaf-field-color-border-30)` x1 - Internal column/control separator using the existing border or shared field state role; not an independently chosen outer field border.
- fieldFamilyBorders: `border-inline-start:1px solid var(--leaf-color-border)` x1 - Internal column/control separator using the existing border or shared field state role; not an independently chosen outer field border.
- fieldFamilyBorders: `border-top:1px solid var(--leaf-color-border)` x1 - Internal column/control separator using the existing border or shared field state role; not an independently chosen outer field border.
- fieldFamilyBorders: `border:0` x2 - Native inner control/action border reset or moving-highlight transparency; the outer field is painted by the shared field recipe.

### `loading/loading.scss`
- derivedTokenUsages: `var(--leaf-color-surface-alpha-55)` x1 - A busy overlay allows the obscured content to remain visible; not an opaque surface or interactive option.

### `loadingbar/loadingbar.scss`
- derivedTokenUsages: `var(--leaf-color-primary-alpha-55)` x1 - Glow around the progress indicator is an optical effect; it does not define label or selection paint.

### `menu/menu.scss`
- hardcodedColors: `rgb(0 0 0/0.08)` x1 - Bottom-only raised-selection shadow is part of the established Menu appearance and clipping contract.
- hardcodedColors: `rgba(0,0,0,0.04)` x1 - Raised Menu press uses a lighter transient layer than default feedback, preserving its established motion/paint contract.
- derivedTokenUsages: `var(--leaf-color-primary-alpha-10)` x1 - Primary Menu appearance retains its established translucent persistent-selection layer.
- derivedTokenUsages: `var(--leaf-color-primary-alpha-4)` x1 - Primary Menu press clears its persistent layer and uses a lighter transient feedback layer.

### `progress/progress.scss`
- hardcodedColors: `rgb(255 255 255/0.35)` x1 - The moving light band is a shine effect over the progress fill, not a foreground/background role.

### `qrcode/qrcode.scss`
- derivedTokenUsages: `var(--leaf-color-surface-alpha-90)` x1 - Invalid/loading QR scrim deliberately obscures machine-readable content more strongly than a generic busy overlay.

### `rate/rate.scss`
- hardcodedColors: `#ffc53d` x1 - Rating gold is an independent rating semantic, not warning feedback.

### `rate/rate.tsx`
- hardcodedColors: `#ef5350` x1 - Public colorByValue default belongs to the rating scale, not danger status feedback.
- hardcodedColors: `#f49b23` x1 - Public colorByValue default belongs to the rating scale, not warning status feedback.
- hardcodedColors: `#ffc53d` x1 - Public colorByValue gold is the same documented rating default, not a theme status alias.

### `select/select.scss`
- fieldFamilyBorders: `border:0` x2 - Native inner control/action border reset or moving-highlight transparency; the outer field is painted by the shared field recipe.

### `skeleton/skeleton.scss`
- derivedTokenUsages: `var(--leaf-color-text-subtle-alpha-9)` x1 - A moving skeleton highlight is an optical loading effect, not a readable text tier.

### `styles/tokens.scss`
- hardcodedColors: `rgb(0 0 0/0.04)` x2 - Shared optical shadow opacity; not a semantic fill or text color. Exact expressions and counts remain guarded.
- hardcodedColors: `rgb(0 0 0/0.05)` x1 - Shared optical shadow opacity; not a semantic fill or text color. Exact expressions and counts remain guarded.
- hardcodedColors: `rgb(0 0 0/0.06)` x2 - Shared optical shadow opacity; not a semantic fill or text color. Exact expressions and counts remain guarded.
- hardcodedColors: `rgb(0 0 0/0.07)` x1 - Shared optical shadow opacity; not a semantic fill or text color. Exact expressions and counts remain guarded.
- hardcodedColors: `rgb(0 0 0/0.1)` x1 - Shared optical shadow opacity; not a semantic fill or text color. Exact expressions and counts remain guarded.

### `theme.ts`
- hardcodedColors: `rgb(0 0 0/${theme.elevation === 'soft' ? '.08':'.16'})` x1 - Infrastructure generates the existing soft/strong elevation shadow inputs; this is not per-component paint.

### `treeselect/treeselect.scss`
- fieldFamilyBorders: `border:0` x2 - Native inner control/action border reset or moving-highlight transparency; the outer field is painted by the shared field recipe.

### `typography/typography.scss`
- derivedTokenUsages: `var(--leaf-color-warning-alpha-16)` x1 - Inline mark highlighting annotates document content; it is distinct from warning feedback and status-label surfaces.

## Ongoing controls

1. Fields: outer shells and the ColorPicker private value input select shared field/validation recipes. Native border resets, internal dividers and swatch outlines have separate drawing responsibilities. All field shells and the private native color input inherit primary focus from the shared field default; Mentions reuses Textarea. Explicit neutral focus is reserved for reviewed exceptions.
2. Options and surfaces: ordinary feedback uses semantic roles; branded selection, danger feedback, inset canvases, segmented surfaces, calendar selection and halos select reviewed families. A new component may not copy an existing component-specific exception.
3. Reviewed local recipes: rating colors, media canvases, control mechanics, masking strengths and optical effects retain distinct responsibilities. Their expressions/counts are frozen with reasons below rather than counted as completed migrations or freely reusable defaults.
4. Solid fills: checked controls, selected calendar days and finished Steps pair base-tone fills with matching `on-*` content. Where a dark custom base needs edge separation, `primary-indicator` provides the boundary rather than replacing the fill.
5. Optional/compatibility inputs: `primarySoftColor` overrides the always-present generated `primary-soft` role. The historical `surface-alpha-80` CSS override remains supported with a table-surface fallback; its unknown-name warning is intentional until compatibility cleanup is separately reviewed.
6. Color-scale boundaries: `color-shades.ts`, `color-scale.ts` and generated `_palette.scss` define reusable shades for the five semantic families plus neutral 100-900 steps. Component and shared-family source may not choose those shades directly; it must consume purpose roles. Legacy transparency effects stay in the exact reviewed exception budgets.
7. Generated token cleanup: review zero-consumer tokens only after removing all consumers; removal is a separate reviewed recipe/palette change.

## Not completed

- No visual or browser acceptance was performed by this checker.
- No attempt was made to prove full CSS cascade, Shadow DOM, portal, inline-style, or dynamic interpolation behavior.
- Existing debt is not migrated by this audit. Exceptions are allowed cases, not compliant replacements for new component defaults.
- `_mixins.scss` state behavior and computed field focus, validation, disabled, and custom-theme paint remain browser-test responsibilities.
