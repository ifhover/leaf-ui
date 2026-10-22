# Leaf UI color contract audit

> This file records migration debt, reviewed component-specific recipes, and structural contracts. Zero debt is not a claim that all colors were merged or every possible custom theme meets accessibility requirements. See COLOR-MIGRATION.md for component coverage and QUALITY.md for browser evidence.

Snapshot: 0.9.0 development sources, generated from a static source scan. The checker compares normalized expressions and occurrence counts, not line numbers.

## Scope

- Scanned: `packages/react/src/**/*.scss|ts|tsx`.
- Excluded from consumption/debt: generated `styles/_palette.scss`, `*.test.*`, `*.spec.*`, fixtures, and declaration files.
- Not counted as reuse: `colors.ts`, `color-recipes.ts`, `tailwind-tokens.ts`, `styles/tokens.scss`, and `styles/_palette.scss`.
- Shared `styles/_mixins.scss` formulas, fixed colors and numeric-token usages have a separate reviewed registry, not component debt. New expressions and increased counts require review; state behavior still requires browser acceptance.
- Static limits: this is a declaration/expression scanner, not a CSS cascade engine. Dynamic SCSS interpolation, portal overrides, inline styles supplied by applications, and computed values are outside its proof.

## Current totals

| Metric | Expressions | Occurrences |
| --- | ---: | ---: |
| Hardcoded color debt | 0 | 0 |
| Component color-mix debt | 0 | 0 |
| Numeric derived-token debt | 0 | 0 |
| Field-family border debt | 0 | 0 |
| Legal hardcoded-color exceptions | 50 | 70 |
| Legal color-mix exceptions | 2 | 2 |
| Reviewed derived-token exceptions | 7 | 7 |
| Reviewed field-structure exceptions | 20 | 31 |

Registered undefined-token risk occurrences: 0.

Global color tokens: 156. Color recipes: 118. Field-family consumers: 9.

Definition source counts (a token may have multiple sources): override 24, palette 150, recipe 118, alias 4, derived 8.

## Migration accounting

The starting register contained 184 debt occurrences. 20 existing occurrences were retained after responsibility-specific review and moved to exact local exception budgets. Other retired component allowances were removed or replaced by shared recipes. These are occurrence classifications, not a claim that this many global colors were deleted. Public numeric palette outputs remain compatible.

## Global token review

The baseline includes the union of palette output, recipe keys, literal derived outputs from `colors.ts`, token aliases, theme override mappings, and any other global definitions. New or removed global `--leaf-color-*` tokens fail until an explicit review entry is added. `_palette.scss` is an output inventory only and is never counted as a consumer.

Optional override tokens and unknown fallback names remain visible in the audit. They are not treated as normal component reuse.

## Field-family contract

- `autocomplete/autocomplete.scss`: 2 controlled border expressions
- `cascader/cascader.scss`: 2 controlled border expressions
- `colorpicker/colorpicker.scss`: 5 controlled border expressions
- `datepicker/datepicker.scss`: 3 controlled border expressions
- `input/input.scss`: 1 controlled border expression
- `inputnumber/inputnumber.scss`: 4 controlled border expressions
- `select/select.scss`: 2 controlled border expressions
- `textarea/textarea.scss`: 0 controlled border expressions
- `treeselect/treeselect.scss`: 1 controlled border expression

Input and Select must call `mixins.field(..., 'primary')` and must not redefine `--leaf-field-color` or `--leaf-field-rest-border`. The shared expression registry prevents unreviewed formula growth but does not prove internal state precedence; changes there require the documented browser comparison. Inner native-control resets, structural dividers and popup-only paint are separately reviewed exceptions, not duplicated field-shell recipes.

## Undefined or optional tokens

### Override-only global tokens

- `--leaf-color-focus`: 1 component files, 1 shared/infrastructure files, 2 occurrences.
- `--leaf-color-primary-border`: 1 component files, 0 shared/infrastructure files, 1 occurrences.
- `--leaf-color-primary-soft`: 0 component files, 1 shared/infrastructure files, 2 occurrences.
- `--leaf-color-primary-soft-active`: 0 component files, 0 shared/infrastructure files, 0 occurrences.
- `--leaf-color-primary-soft-hover`: 0 component files, 0 shared/infrastructure files, 0 occurrences.

### Registered undefined risks

- None.

### Optional-only consumers with fallback

- `button/button.scss`: `var(--leaf-color-primary-border, ...)`
- `inputotp/inputotp.scss`: `var(--leaf-color-focus, ...)`
- `styles/_mixins.scss`: `var(--leaf-color-focus, ...)`
- `styles/_mixins.scss`: `var(--leaf-color-primary-soft, ...)`

### Unknown consumers with fallback

- `styles/_mixins.scss`: `var(--leaf-color-surface-alpha-80, ...)` (fallback present; no registered definition).

## Generated token consumption

Counts are direct static `var(--leaf-color-*)` consumers. Generated definitions, token aliases, tests, fixtures, and documentation do not count as reuse. A shared recipe counts as one shared file, not as proof that every component using that recipe paints the token.

| Token | Component files | Shared/infrastructure files | Occurrences |
| --- | ---: | ---: | ---: |
| `--leaf-color-border` | 31 | 5 | 61 |
| `--leaf-color-border-alpha-55` | 0 | 0 | 0 |
| `--leaf-color-border-alpha-60` | 0 | 0 | 0 |
| `--leaf-color-border-alpha-65` | 0 | 0 | 0 |
| `--leaf-color-border-alpha-85` | 0 | 0 | 0 |
| `--leaf-color-border-hover` | 4 | 1 | 5 |
| `--leaf-color-border-surface-35` | 0 | 0 | 0 |
| `--leaf-color-border-surface-65` | 0 | 0 | 0 |
| `--leaf-color-border-surface-70` | 0 | 0 | 0 |
| `--leaf-color-border-text-muted-65` | 0 | 0 | 0 |
| `--leaf-color-danger` | 10 | 1 | 14 |
| `--leaf-color-danger-active` | 1 | 0 | 1 |
| `--leaf-color-danger-alpha-10` | 0 | 0 | 0 |
| `--leaf-color-danger-alpha-11` | 0 | 0 | 0 |
| `--leaf-color-danger-alpha-12` | 0 | 0 | 0 |
| `--leaf-color-danger-alpha-15` | 0 | 0 | 0 |
| `--leaf-color-danger-alpha-18` | 0 | 0 | 0 |
| `--leaf-color-danger-alpha-22` | 0 | 0 | 0 |
| `--leaf-color-danger-alpha-25` | 0 | 0 | 0 |
| `--leaf-color-danger-alpha-42` | 0 | 0 | 0 |
| `--leaf-color-danger-alpha-7` | 0 | 0 | 0 |
| `--leaf-color-danger-alpha-8` | 0 | 0 | 0 |
| `--leaf-color-danger-alpha-9` | 0 | 0 | 0 |
| `--leaf-color-danger-border-12` | 0 | 0 | 0 |
| `--leaf-color-danger-border-30` | 0 | 1 | 1 |
| `--leaf-color-danger-hover` | 0 | 0 | 0 |
| `--leaf-color-danger-ink` | 9 | 1 | 19 |
| `--leaf-color-danger-surface-4` | 0 | 0 | 0 |
| `--leaf-color-danger-surface-5` | 0 | 0 | 0 |
| `--leaf-color-danger-surface-6` | 0 | 1 | 1 |
| `--leaf-color-danger-surface-8` | 0 | 1 | 2 |
| `--leaf-color-danger-surface-9` | 0 | 0 | 0 |
| `--leaf-color-danger-text-80` | 0 | 0 | 0 |
| `--leaf-color-danger-white-97-5` | 0 | 0 | 0 |
| `--leaf-color-divider` | 19 | 5 | 35 |
| `--leaf-color-info` | 4 | 0 | 5 |
| `--leaf-color-info-alpha-10` | 0 | 0 | 0 |
| `--leaf-color-info-alpha-15` | 0 | 0 | 0 |
| `--leaf-color-info-alpha-22` | 0 | 0 | 0 |
| `--leaf-color-info-alpha-8` | 0 | 0 | 0 |
| `--leaf-color-info-alpha-9` | 0 | 0 | 0 |
| `--leaf-color-info-border-12` | 0 | 0 | 0 |
| `--leaf-color-info-ink` | 0 | 1 | 1 |
| `--leaf-color-info-surface-5` | 0 | 0 | 0 |
| `--leaf-color-info-surface-8` | 0 | 1 | 1 |
| `--leaf-color-info-surface-9` | 0 | 0 | 0 |
| `--leaf-color-info-text-80` | 0 | 0 | 0 |
| `--leaf-color-on-danger` | 2 | 1 | 4 |
| `--leaf-color-on-info` | 1 | 1 | 2 |
| `--leaf-color-on-primary` | 7 | 1 | 9 |
| `--leaf-color-on-success` | 1 | 1 | 2 |
| `--leaf-color-on-warning` | 1 | 1 | 2 |
| `--leaf-color-option-hover` | 13 | 3 | 28 |
| `--leaf-color-primary` | 35 | 5 | 89 |
| `--leaf-color-primary-active` | 3 | 0 | 3 |
| `--leaf-color-primary-alpha-10` | 1 | 0 | 1 |
| `--leaf-color-primary-alpha-11` | 0 | 0 | 0 |
| `--leaf-color-primary-alpha-12` | 0 | 1 | 2 |
| `--leaf-color-primary-alpha-15` | 0 | 0 | 0 |
| `--leaf-color-primary-alpha-16` | 0 | 1 | 1 |
| `--leaf-color-primary-alpha-18` | 0 | 0 | 0 |
| `--leaf-color-primary-alpha-20` | 0 | 1 | 1 |
| `--leaf-color-primary-alpha-22` | 0 | 0 | 0 |
| `--leaf-color-primary-alpha-25` | 0 | 0 | 0 |
| `--leaf-color-primary-alpha-35` | 0 | 0 | 0 |
| `--leaf-color-primary-alpha-4` | 1 | 0 | 1 |
| `--leaf-color-primary-alpha-42` | 0 | 0 | 0 |
| `--leaf-color-primary-alpha-45` | 0 | 0 | 0 |
| `--leaf-color-primary-alpha-55` | 1 | 0 | 1 |
| `--leaf-color-primary-alpha-8` | 0 | 0 | 0 |
| `--leaf-color-primary-alpha-9` | 0 | 0 | 0 |
| `--leaf-color-primary-border-12` | 0 | 0 | 0 |
| `--leaf-color-primary-border-24` | 0 | 1 | 1 |
| `--leaf-color-primary-border-30` | 0 | 0 | 0 |
| `--leaf-color-primary-border-35` | 0 | 0 | 0 |
| `--leaf-color-primary-fill-border` | 1 | 0 | 1 |
| `--leaf-color-primary-focus` | 0 | 0 | 0 |
| `--leaf-color-primary-hover` | 1 | 0 | 2 |
| `--leaf-color-primary-indicator` | 32 | 4 | 64 |
| `--leaf-color-primary-ink` | 19 | 3 | 32 |
| `--leaf-color-primary-ink-active` | 3 | 0 | 3 |
| `--leaf-color-primary-ink-hover` | 2 | 0 | 3 |
| `--leaf-color-primary-surface-10` | 0 | 0 | 0 |
| `--leaf-color-primary-surface-14` | 0 | 0 | 0 |
| `--leaf-color-primary-surface-28` | 0 | 0 | 0 |
| `--leaf-color-primary-surface-3` | 0 | 0 | 0 |
| `--leaf-color-primary-surface-5` | 0 | 1 | 1 |
| `--leaf-color-primary-surface-6` | 0 | 0 | 0 |
| `--leaf-color-primary-surface-7` | 0 | 0 | 0 |
| `--leaf-color-primary-surface-8` | 0 | 1 | 4 |
| `--leaf-color-primary-surface-9` | 0 | 0 | 0 |
| `--leaf-color-primary-text-55` | 0 | 0 | 0 |
| `--leaf-color-primary-text-80` | 0 | 0 | 0 |
| `--leaf-color-primary-text-85` | 0 | 0 | 0 |
| `--leaf-color-primary-white-97-5` | 0 | 0 | 0 |
| `--leaf-color-success` | 5 | 0 | 7 |
| `--leaf-color-success-alpha-10` | 0 | 0 | 0 |
| `--leaf-color-success-alpha-15` | 0 | 0 | 0 |
| `--leaf-color-success-alpha-22` | 0 | 0 | 0 |
| `--leaf-color-success-alpha-8` | 0 | 0 | 0 |
| `--leaf-color-success-alpha-9` | 0 | 0 | 0 |
| `--leaf-color-success-border-12` | 0 | 0 | 0 |
| `--leaf-color-success-ink` | 0 | 1 | 1 |
| `--leaf-color-success-surface-5` | 0 | 0 | 0 |
| `--leaf-color-success-surface-8` | 0 | 1 | 1 |
| `--leaf-color-success-surface-9` | 0 | 0 | 0 |
| `--leaf-color-success-text-80` | 0 | 0 | 0 |
| `--leaf-color-surface` | 36 | 5 | 64 |
| `--leaf-color-surface-alpha-55` | 1 | 0 | 1 |
| `--leaf-color-surface-alpha-90` | 1 | 0 | 1 |
| `--leaf-color-surface-muted` | 31 | 6 | 61 |
| `--leaf-color-surface-muted-alpha-45` | 0 | 0 | 0 |
| `--leaf-color-surface-muted-alpha-50` | 0 | 0 | 0 |
| `--leaf-color-surface-muted-border-65` | 0 | 0 | 0 |
| `--leaf-color-surface-muted-border-75` | 0 | 0 | 0 |
| `--leaf-color-surface-raised` | 12 | 2 | 14 |
| `--leaf-color-surface-text-98` | 0 | 0 | 0 |
| `--leaf-color-text` | 50 | 5 | 110 |
| `--leaf-color-text-alpha-10` | 0 | 0 | 0 |
| `--leaf-color-text-alpha-15` | 0 | 0 | 0 |
| `--leaf-color-text-alpha-16` | 0 | 0 | 0 |
| `--leaf-color-text-alpha-18` | 0 | 0 | 0 |
| `--leaf-color-text-alpha-8` | 0 | 0 | 0 |
| `--leaf-color-text-alpha-9` | 0 | 0 | 0 |
| `--leaf-color-text-border-12` | 0 | 0 | 0 |
| `--leaf-color-text-muted` | 50 | 7 | 118 |
| `--leaf-color-text-muted-alpha-10` | 0 | 0 | 0 |
| `--leaf-color-text-muted-alpha-22` | 0 | 0 | 0 |
| `--leaf-color-text-muted-surface-8` | 0 | 0 | 0 |
| `--leaf-color-text-muted-surface-9` | 0 | 0 | 0 |
| `--leaf-color-text-muted-surface-92` | 0 | 0 | 0 |
| `--leaf-color-text-subtle` | 12 | 1 | 17 |
| `--leaf-color-text-subtle-alpha-9` | 1 | 0 | 1 |
| `--leaf-color-text-subtle-surface-muted-38` | 0 | 0 | 0 |
| `--leaf-color-text-surface-5` | 0 | 0 | 0 |
| `--leaf-color-warning` | 4 | 1 | 6 |
| `--leaf-color-warning-alpha-10` | 0 | 0 | 0 |
| `--leaf-color-warning-alpha-12` | 0 | 0 | 0 |
| `--leaf-color-warning-alpha-15` | 0 | 0 | 0 |
| `--leaf-color-warning-alpha-16` | 1 | 0 | 1 |
| `--leaf-color-warning-alpha-22` | 0 | 0 | 0 |
| `--leaf-color-warning-alpha-8` | 0 | 0 | 0 |
| `--leaf-color-warning-alpha-9` | 0 | 0 | 0 |
| `--leaf-color-warning-border-12` | 0 | 0 | 0 |
| `--leaf-color-warning-border-30` | 0 | 1 | 1 |
| `--leaf-color-warning-ink` | 0 | 1 | 1 |
| `--leaf-color-warning-surface-11` | 0 | 0 | 0 |
| `--leaf-color-warning-surface-5` | 0 | 0 | 0 |
| `--leaf-color-warning-surface-8` | 0 | 1 | 1 |
| `--leaf-color-warning-surface-9` | 0 | 0 | 0 |
| `--leaf-color-warning-text-80` | 0 | 0 | 0 |

### Tokens with zero direct component consumers

- `--leaf-color-border-alpha-55`
- `--leaf-color-border-alpha-60`
- `--leaf-color-border-alpha-65`
- `--leaf-color-border-alpha-85`
- `--leaf-color-border-surface-35`
- `--leaf-color-border-surface-65`
- `--leaf-color-border-surface-70`
- `--leaf-color-border-text-muted-65`
- `--leaf-color-danger-alpha-10`
- `--leaf-color-danger-alpha-11`
- `--leaf-color-danger-alpha-12`
- `--leaf-color-danger-alpha-15`
- `--leaf-color-danger-alpha-18`
- `--leaf-color-danger-alpha-22`
- `--leaf-color-danger-alpha-25`
- `--leaf-color-danger-alpha-42`
- `--leaf-color-danger-alpha-7`
- `--leaf-color-danger-alpha-8`
- `--leaf-color-danger-alpha-9`
- `--leaf-color-danger-border-12`
- `--leaf-color-danger-border-30`
- `--leaf-color-danger-hover`
- `--leaf-color-danger-surface-4`
- `--leaf-color-danger-surface-5`
- `--leaf-color-danger-surface-6`
- `--leaf-color-danger-surface-8`
- `--leaf-color-danger-surface-9`
- `--leaf-color-danger-text-80`
- `--leaf-color-danger-white-97-5`
- `--leaf-color-info-alpha-10`
- `--leaf-color-info-alpha-15`
- `--leaf-color-info-alpha-22`
- `--leaf-color-info-alpha-8`
- `--leaf-color-info-alpha-9`
- `--leaf-color-info-border-12`
- `--leaf-color-info-ink`
- `--leaf-color-info-surface-5`
- `--leaf-color-info-surface-8`
- `--leaf-color-info-surface-9`
- `--leaf-color-info-text-80`
- `--leaf-color-primary-alpha-11`
- `--leaf-color-primary-alpha-12`
- `--leaf-color-primary-alpha-15`
- `--leaf-color-primary-alpha-16`
- `--leaf-color-primary-alpha-18`
- `--leaf-color-primary-alpha-20`
- `--leaf-color-primary-alpha-22`
- `--leaf-color-primary-alpha-25`
- `--leaf-color-primary-alpha-35`
- `--leaf-color-primary-alpha-42`
- `--leaf-color-primary-alpha-45`
- `--leaf-color-primary-alpha-8`
- `--leaf-color-primary-alpha-9`
- `--leaf-color-primary-border-12`
- `--leaf-color-primary-border-24`
- `--leaf-color-primary-border-30`
- `--leaf-color-primary-border-35`
- `--leaf-color-primary-focus`
- `--leaf-color-primary-surface-10`
- `--leaf-color-primary-surface-14`
- `--leaf-color-primary-surface-28`
- `--leaf-color-primary-surface-3`
- `--leaf-color-primary-surface-5`
- `--leaf-color-primary-surface-6`
- `--leaf-color-primary-surface-7`
- `--leaf-color-primary-surface-8`
- `--leaf-color-primary-surface-9`
- `--leaf-color-primary-text-55`
- `--leaf-color-primary-text-80`
- `--leaf-color-primary-text-85`
- `--leaf-color-primary-white-97-5`
- `--leaf-color-success-alpha-10`
- `--leaf-color-success-alpha-15`
- `--leaf-color-success-alpha-22`
- `--leaf-color-success-alpha-8`
- `--leaf-color-success-alpha-9`
- `--leaf-color-success-border-12`
- `--leaf-color-success-ink`
- `--leaf-color-success-surface-5`
- `--leaf-color-success-surface-8`
- `--leaf-color-success-surface-9`
- `--leaf-color-success-text-80`
- `--leaf-color-surface-muted-alpha-45`
- `--leaf-color-surface-muted-alpha-50`
- `--leaf-color-surface-muted-border-65`
- `--leaf-color-surface-muted-border-75`
- `--leaf-color-surface-text-98`
- `--leaf-color-text-alpha-10`
- `--leaf-color-text-alpha-15`
- `--leaf-color-text-alpha-16`
- `--leaf-color-text-alpha-18`
- `--leaf-color-text-alpha-8`
- `--leaf-color-text-alpha-9`
- `--leaf-color-text-border-12`
- `--leaf-color-text-muted-alpha-10`
- `--leaf-color-text-muted-alpha-22`
- `--leaf-color-text-muted-surface-8`
- `--leaf-color-text-muted-surface-9`
- `--leaf-color-text-muted-surface-92`
- `--leaf-color-text-subtle-surface-muted-38`
- `--leaf-color-text-surface-5`
- `--leaf-color-warning-alpha-10`
- `--leaf-color-warning-alpha-12`
- `--leaf-color-warning-alpha-15`
- `--leaf-color-warning-alpha-22`
- `--leaf-color-warning-alpha-8`
- `--leaf-color-warning-alpha-9`
- `--leaf-color-warning-border-12`
- `--leaf-color-warning-border-30`
- `--leaf-color-warning-ink`
- `--leaf-color-warning-surface-11`
- `--leaf-color-warning-surface-5`
- `--leaf-color-warning-surface-8`
- `--leaf-color-warning-surface-9`
- `--leaf-color-warning-text-80`

## Existing debt detail

- None.

## Reviewed exceptions

These entries are controlled exceptions, not compliance claims. Their exact expression and count are part of the baseline.

### `autocomplete/autocomplete.scss`
- fieldFamilyBorders: `border-color:transparent` x1 - Native inner control/action border reset or moving-highlight transparency; the outer field is painted by the shared field recipe.
- fieldFamilyBorders: `border:0` x1 - Native inner control/action border reset or moving-highlight transparency; the outer field is painted by the shared field recipe.

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
- fieldFamilyBorders: `border:0` x3 - Native inner control/action border reset or moving-highlight transparency; the outer field is painted by the shared field recipe.
- fieldFamilyBorders: `border:1px solid rgb(0 0 0/8%)` x1 - ColorPicker format-switch frame, spectrum thumb or swatch contrast border, not the outer field shell.
- fieldFamilyBorders: `border:2px solid #fff` x3 - ColorPicker format-switch frame, spectrum thumb or swatch contrast border, not the outer field shell.
- fieldFamilyBorders: `border:2px solid var(--leaf-color-surface)` x1 - ColorPicker format-switch frame, spectrum thumb or swatch contrast border, not the outer field shell.
- fieldFamilyBorders: `border:1px solid var(--leaf-segmented-border)` x1 - The internal format switch paints its segmented-family track, not the outer field shell.

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
- hardcodedColors: `#0003` x2 - Media viewer chrome uses fixed lightbox colors for photographic overlays and third-party viewer variables.
- hardcodedColors: `#0005` x1 - Media viewer chrome uses fixed lightbox colors for photographic overlays and third-party viewer variables.
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
- hardcodedColors: `rgb(0 0 0/8%)` x1 - One private translucent neutral feedback recipe shared by default Menu hover, press and selection; preserves exact white-canvas equivalence and is not an ordinary option-row default.
- hardcodedColors: `rgba(0,0,0,0.04)` x1 - Raised Menu press uses a lighter transient layer than default feedback, preserving its established motion/paint contract.
- mixFormulas: `color-mix(in srgb,currentColor 80%,var(--leaf-color-surface))` x1 - Menu unselected labels soften the current inherited navigation ink; a private appearance recipe, not a new global text tier.
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
- fieldFamilyBorders: `border-color:transparent` x1 - Native inner control/action border reset or moving-highlight transparency; the outer field is painted by the shared field recipe.
- fieldFamilyBorders: `border:0` x2 - Native inner control/action border reset or moving-highlight transparency; the outer field is painted by the shared field recipe.

### `skeleton/skeleton.scss`
- derivedTokenUsages: `var(--leaf-color-text-subtle-alpha-9)` x1 - A moving skeleton highlight is an optical loading effect, not a readable text tier.

### `theme.ts`
- hardcodedColors: `rgb(0 0 0/${theme.elevation === 'soft' ? '.08':'.16'})` x1 - Infrastructure generates the existing soft/strong elevation shadow inputs; this is not per-component paint.

### `treeselect/treeselect.scss`
- fieldFamilyBorders: `border:0` x2 - Native inner control/action border reset or moving-highlight transparency; the outer field is painted by the shared field recipe.

### `typography/typography.scss`
- derivedTokenUsages: `var(--leaf-color-warning-alpha-16)` x1 - Inline mark highlighting annotates document content; it is distinct from warning feedback and status-label surfaces.

## Ongoing controls

1. Fields: outer shells and the ColorPicker private value input select shared field/validation recipes. Native border resets, internal dividers and swatch outlines have separate drawing responsibilities. Outer neutral-focus fields retain their contract; Input/Select and the private native color input select primary focus.
2. Options and surfaces: ordinary feedback uses semantic roles; branded selection, danger feedback, inset canvases, segmented surfaces, calendar selection and halos select reviewed families. A new component may not copy an existing component-specific exception.
3. Reviewed local recipes: rating colors, media canvases, control mechanics, masking strengths and optical effects retain distinct responsibilities. Their expressions/counts are frozen with reasons below rather than counted as completed migrations or freely reusable defaults.
4. Optional/compatibility inputs: keep `primarySoftColor` as an optional override with family-local fallbacks, not a default-generated global token. The historical `surface-alpha-80` CSS override remains supported with a table-surface fallback; its unknown-name warning is intentional until compatibility cleanup is separately reviewed.
5. Generated token cleanup: review zero-consumer tokens only after removing all consumers; removal is a separate reviewed recipe/palette change.

## Not completed

- No visual or browser acceptance was performed by this checker.
- No attempt was made to prove full CSS cascade, Shadow DOM, portal, inline-style, or dynamic interpolation behavior.
- Existing debt is not migrated by this audit. Exceptions are allowed cases, not compliant replacements for new component defaults.
- `_mixins.scss` state behavior and computed field focus, validation, disabled, and custom-theme paint remain browser-test responsibilities.
