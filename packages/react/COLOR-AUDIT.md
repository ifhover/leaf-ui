# Leaf UI color contract audit

> This file records existing migration debt, reviewed exceptions, and structural contracts. It is not a compliance claim and does not mean the existing component colors have been migrated.

Snapshot: 0.9.0 dirty worktree, generated from a static source scan. The checker compares normalized expressions and occurrence counts, not line numbers.

## Scope

- Scanned: `packages/react/src/**/*.scss|ts|tsx`.
- Excluded from consumption/debt: generated `styles/_palette.scss`, `*.test.*`, `*.spec.*`, fixtures, and declaration files.
- Not counted as reuse: `colors.ts`, `color-recipes.ts`, `tailwind-tokens.ts`, `styles/tokens.scss`, and `styles/_palette.scss`.
- Shared `styles/_mixins.scss` formulas, fixed colors and numeric-token usages have a separate reviewed registry, not component debt. New expressions and increased counts require review; state behavior still requires browser acceptance.
- Static limits: this is a declaration/expression scanner, not a CSS cascade engine. Dynamic SCSS interpolation, portal overrides, inline styles supplied by applications, and computed values are outside its proof.

## Current totals

| Metric | Expressions | Occurrences |
| --- | ---: | ---: |
| Hardcoded color debt | 26 | 30 |
| Component color-mix debt | 8 | 9 |
| Numeric derived-token debt | 108 | 142 |
| Field-family border debt | 3 | 3 |
| Legal hardcoded-color exceptions | 41 | 61 |
| Legal color-mix exceptions | 0 | 0 |

Registered undefined-token risk occurrences: 0.

Global color tokens: 150. Color recipes: 118. Field-family consumers: 9.

Definition source counts (a token may have multiple sources): override 24, palette 144, recipe 118, alias 4, derived 10.

## Global token review

The baseline includes the union of palette output, recipe keys, literal derived outputs from `colors.ts`, token aliases, theme override mappings, and any other global definitions. New or removed global `--leaf-color-*` tokens fail until an explicit review entry is added. `_palette.scss` is an output inventory only and is never counted as a consumer.

Optional override tokens and unknown fallback names remain visible in the audit. They are not treated as normal component reuse.

## Field-family contract

- `autocomplete/autocomplete.scss`: 2 controlled border expressions
- `cascader/cascader.scss`: 2 controlled border expressions
- `colorpicker/colorpicker.scss`: 7 controlled border expressions
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
| `--leaf-color-border` | 34 | 5 | 66 |
| `--leaf-color-border-alpha-55` | 1 | 1 | 2 |
| `--leaf-color-border-alpha-60` | 1 | 0 | 1 |
| `--leaf-color-border-alpha-65` | 1 | 0 | 1 |
| `--leaf-color-border-alpha-85` | 1 | 0 | 2 |
| `--leaf-color-border-hover` | 4 | 2 | 6 |
| `--leaf-color-border-surface-35` | 2 | 0 | 3 |
| `--leaf-color-border-surface-65` | 0 | 0 | 0 |
| `--leaf-color-border-surface-70` | 1 | 0 | 1 |
| `--leaf-color-border-text-muted-65` | 0 | 0 | 0 |
| `--leaf-color-danger` | 17 | 1 | 29 |
| `--leaf-color-danger-active` | 3 | 0 | 3 |
| `--leaf-color-danger-alpha-10` | 2 | 0 | 3 |
| `--leaf-color-danger-alpha-11` | 0 | 0 | 0 |
| `--leaf-color-danger-alpha-12` | 0 | 1 | 1 |
| `--leaf-color-danger-alpha-15` | 1 | 0 | 2 |
| `--leaf-color-danger-alpha-18` | 1 | 0 | 1 |
| `--leaf-color-danger-alpha-22` | 0 | 0 | 0 |
| `--leaf-color-danger-alpha-25` | 1 | 0 | 1 |
| `--leaf-color-danger-alpha-42` | 1 | 0 | 1 |
| `--leaf-color-danger-alpha-7` | 1 | 0 | 1 |
| `--leaf-color-danger-alpha-8` | 2 | 0 | 4 |
| `--leaf-color-danger-alpha-9` | 0 | 0 | 0 |
| `--leaf-color-danger-border-12` | 1 | 0 | 2 |
| `--leaf-color-danger-border-30` | 0 | 1 | 1 |
| `--leaf-color-danger-hover` | 0 | 0 | 0 |
| `--leaf-color-danger-surface-4` | 1 | 0 | 1 |
| `--leaf-color-danger-surface-5` | 1 | 0 | 2 |
| `--leaf-color-danger-surface-6` | 3 | 0 | 3 |
| `--leaf-color-danger-surface-8` | 3 | 0 | 4 |
| `--leaf-color-danger-surface-9` | 1 | 0 | 1 |
| `--leaf-color-danger-text-80` | 2 | 0 | 3 |
| `--leaf-color-danger-white-97-5` | 0 | 0 | 0 |
| `--leaf-color-divider` | 14 | 4 | 25 |
| `--leaf-color-info` | 6 | 0 | 7 |
| `--leaf-color-info-alpha-10` | 2 | 0 | 3 |
| `--leaf-color-info-alpha-15` | 1 | 0 | 2 |
| `--leaf-color-info-alpha-22` | 0 | 0 | 0 |
| `--leaf-color-info-alpha-8` | 2 | 0 | 3 |
| `--leaf-color-info-alpha-9` | 0 | 0 | 0 |
| `--leaf-color-info-border-12` | 1 | 0 | 2 |
| `--leaf-color-info-surface-5` | 2 | 0 | 3 |
| `--leaf-color-info-surface-8` | 1 | 0 | 1 |
| `--leaf-color-info-surface-9` | 0 | 0 | 0 |
| `--leaf-color-info-text-80` | 0 | 0 | 0 |
| `--leaf-color-on-danger` | 1 | 0 | 1 |
| `--leaf-color-on-primary` | 6 | 0 | 7 |
| `--leaf-color-on-warning` | 1 | 0 | 1 |
| `--leaf-color-option-hover` | 5 | 2 | 13 |
| `--leaf-color-primary` | 35 | 5 | 102 |
| `--leaf-color-primary-active` | 3 | 0 | 3 |
| `--leaf-color-primary-alpha-10` | 3 | 1 | 5 |
| `--leaf-color-primary-alpha-11` | 0 | 0 | 0 |
| `--leaf-color-primary-alpha-12` | 4 | 2 | 7 |
| `--leaf-color-primary-alpha-15` | 1 | 0 | 1 |
| `--leaf-color-primary-alpha-16` | 1 | 0 | 2 |
| `--leaf-color-primary-alpha-18` | 1 | 0 | 1 |
| `--leaf-color-primary-alpha-20` | 1 | 0 | 2 |
| `--leaf-color-primary-alpha-22` | 0 | 0 | 0 |
| `--leaf-color-primary-alpha-25` | 1 | 0 | 1 |
| `--leaf-color-primary-alpha-35` | 0 | 0 | 0 |
| `--leaf-color-primary-alpha-4` | 2 | 0 | 2 |
| `--leaf-color-primary-alpha-42` | 1 | 0 | 1 |
| `--leaf-color-primary-alpha-45` | 1 | 0 | 1 |
| `--leaf-color-primary-alpha-55` | 1 | 0 | 1 |
| `--leaf-color-primary-alpha-8` | 2 | 0 | 2 |
| `--leaf-color-primary-alpha-9` | 0 | 0 | 0 |
| `--leaf-color-primary-border-12` | 0 | 0 | 0 |
| `--leaf-color-primary-border-24` | 1 | 0 | 1 |
| `--leaf-color-primary-border-30` | 0 | 0 | 0 |
| `--leaf-color-primary-border-35` | 0 | 0 | 0 |
| `--leaf-color-primary-fill-border` | 1 | 0 | 1 |
| `--leaf-color-primary-focus` | 0 | 0 | 0 |
| `--leaf-color-primary-hover` | 1 | 0 | 2 |
| `--leaf-color-primary-indicator` | 32 | 4 | 65 |
| `--leaf-color-primary-ink` | 19 | 2 | 31 |
| `--leaf-color-primary-ink-active` | 3 | 0 | 3 |
| `--leaf-color-primary-ink-hover` | 1 | 0 | 2 |
| `--leaf-color-primary-surface-10` | 1 | 0 | 1 |
| `--leaf-color-primary-surface-14` | 1 | 0 | 1 |
| `--leaf-color-primary-surface-28` | 1 | 0 | 1 |
| `--leaf-color-primary-surface-3` | 0 | 0 | 0 |
| `--leaf-color-primary-surface-5` | 2 | 0 | 3 |
| `--leaf-color-primary-surface-6` | 0 | 0 | 0 |
| `--leaf-color-primary-surface-7` | 1 | 0 | 1 |
| `--leaf-color-primary-surface-8` | 5 | 1 | 8 |
| `--leaf-color-primary-surface-9` | 2 | 0 | 2 |
| `--leaf-color-primary-text-55` | 0 | 0 | 0 |
| `--leaf-color-primary-text-80` | 0 | 0 | 0 |
| `--leaf-color-primary-text-85` | 1 | 0 | 1 |
| `--leaf-color-primary-white-97-5` | 0 | 0 | 0 |
| `--leaf-color-success` | 6 | 0 | 9 |
| `--leaf-color-success-alpha-10` | 2 | 0 | 3 |
| `--leaf-color-success-alpha-15` | 1 | 0 | 2 |
| `--leaf-color-success-alpha-22` | 0 | 0 | 0 |
| `--leaf-color-success-alpha-8` | 2 | 0 | 3 |
| `--leaf-color-success-alpha-9` | 0 | 0 | 0 |
| `--leaf-color-success-border-12` | 1 | 0 | 2 |
| `--leaf-color-success-surface-5` | 1 | 0 | 2 |
| `--leaf-color-success-surface-8` | 1 | 0 | 1 |
| `--leaf-color-success-surface-9` | 0 | 0 | 0 |
| `--leaf-color-success-text-80` | 1 | 0 | 1 |
| `--leaf-color-surface` | 35 | 5 | 64 |
| `--leaf-color-surface-alpha-55` | 1 | 0 | 1 |
| `--leaf-color-surface-alpha-90` | 1 | 0 | 1 |
| `--leaf-color-surface-muted` | 33 | 6 | 63 |
| `--leaf-color-surface-muted-alpha-45` | 1 | 1 | 3 |
| `--leaf-color-surface-muted-alpha-50` | 0 | 0 | 0 |
| `--leaf-color-surface-muted-border-65` | 1 | 0 | 1 |
| `--leaf-color-surface-muted-border-75` | 0 | 0 | 0 |
| `--leaf-color-surface-raised` | 13 | 2 | 16 |
| `--leaf-color-surface-text-98` | 0 | 0 | 0 |
| `--leaf-color-text` | 51 | 5 | 113 |
| `--leaf-color-text-alpha-10` | 1 | 0 | 1 |
| `--leaf-color-text-alpha-15` | 1 | 0 | 1 |
| `--leaf-color-text-alpha-16` | 0 | 0 | 0 |
| `--leaf-color-text-alpha-18` | 0 | 0 | 0 |
| `--leaf-color-text-alpha-8` | 1 | 0 | 1 |
| `--leaf-color-text-alpha-9` | 0 | 0 | 0 |
| `--leaf-color-text-border-12` | 1 | 0 | 1 |
| `--leaf-color-text-muted` | 49 | 7 | 118 |
| `--leaf-color-text-muted-alpha-10` | 0 | 0 | 0 |
| `--leaf-color-text-muted-alpha-22` | 0 | 0 | 0 |
| `--leaf-color-text-muted-surface-8` | 1 | 0 | 1 |
| `--leaf-color-text-muted-surface-9` | 1 | 0 | 2 |
| `--leaf-color-text-muted-surface-92` | 0 | 0 | 0 |
| `--leaf-color-text-subtle` | 12 | 1 | 17 |
| `--leaf-color-text-subtle-alpha-9` | 1 | 0 | 1 |
| `--leaf-color-text-subtle-surface-muted-38` | 0 | 0 | 0 |
| `--leaf-color-text-surface-5` | 1 | 0 | 1 |
| `--leaf-color-warning` | 5 | 1 | 7 |
| `--leaf-color-warning-alpha-10` | 2 | 0 | 3 |
| `--leaf-color-warning-alpha-12` | 0 | 1 | 1 |
| `--leaf-color-warning-alpha-15` | 1 | 0 | 2 |
| `--leaf-color-warning-alpha-16` | 1 | 0 | 1 |
| `--leaf-color-warning-alpha-22` | 0 | 0 | 0 |
| `--leaf-color-warning-alpha-8` | 2 | 0 | 3 |
| `--leaf-color-warning-alpha-9` | 0 | 0 | 0 |
| `--leaf-color-warning-border-12` | 1 | 0 | 2 |
| `--leaf-color-warning-border-30` | 0 | 1 | 1 |
| `--leaf-color-warning-surface-11` | 0 | 0 | 0 |
| `--leaf-color-warning-surface-5` | 2 | 0 | 3 |
| `--leaf-color-warning-surface-8` | 1 | 0 | 1 |
| `--leaf-color-warning-surface-9` | 0 | 0 | 0 |
| `--leaf-color-warning-text-80` | 2 | 0 | 2 |

### Tokens with zero direct component consumers

- `--leaf-color-border-surface-65`
- `--leaf-color-border-text-muted-65`
- `--leaf-color-danger-alpha-11`
- `--leaf-color-danger-alpha-12`
- `--leaf-color-danger-alpha-22`
- `--leaf-color-danger-alpha-9`
- `--leaf-color-danger-border-30`
- `--leaf-color-danger-hover`
- `--leaf-color-danger-white-97-5`
- `--leaf-color-info-alpha-22`
- `--leaf-color-info-alpha-9`
- `--leaf-color-info-surface-9`
- `--leaf-color-info-text-80`
- `--leaf-color-primary-alpha-11`
- `--leaf-color-primary-alpha-22`
- `--leaf-color-primary-alpha-35`
- `--leaf-color-primary-alpha-9`
- `--leaf-color-primary-border-12`
- `--leaf-color-primary-border-30`
- `--leaf-color-primary-border-35`
- `--leaf-color-primary-focus`
- `--leaf-color-primary-surface-3`
- `--leaf-color-primary-surface-6`
- `--leaf-color-primary-text-55`
- `--leaf-color-primary-text-80`
- `--leaf-color-primary-white-97-5`
- `--leaf-color-success-alpha-22`
- `--leaf-color-success-alpha-9`
- `--leaf-color-success-surface-9`
- `--leaf-color-surface-muted-alpha-50`
- `--leaf-color-surface-muted-border-75`
- `--leaf-color-surface-text-98`
- `--leaf-color-text-alpha-16`
- `--leaf-color-text-alpha-18`
- `--leaf-color-text-alpha-9`
- `--leaf-color-text-muted-alpha-10`
- `--leaf-color-text-muted-alpha-22`
- `--leaf-color-text-muted-surface-92`
- `--leaf-color-text-subtle-surface-muted-38`
- `--leaf-color-warning-alpha-12`
- `--leaf-color-warning-alpha-22`
- `--leaf-color-warning-alpha-9`
- `--leaf-color-warning-border-30`
- `--leaf-color-warning-surface-11`
- `--leaf-color-warning-surface-9`

## Existing debt detail

### `alert/alert.scss`
- derivedTokenUsages:
  - `var(--leaf-color-border-surface-35)` x1
  - `var(--leaf-color-danger-alpha-10)` x2
  - `var(--leaf-color-danger-alpha-15)` x2
  - `var(--leaf-color-danger-alpha-7)` x1
  - `var(--leaf-color-danger-alpha-8)` x2
  - `var(--leaf-color-danger-border-12)` x2
  - `var(--leaf-color-danger-surface-5)` x2
  - `var(--leaf-color-info-alpha-10)` x2
  - `var(--leaf-color-info-alpha-15)` x2
  - `var(--leaf-color-info-alpha-8)` x2
  - `var(--leaf-color-info-border-12)` x2
  - `var(--leaf-color-info-surface-5)` x2
  - `var(--leaf-color-success-alpha-10)` x2
  - `var(--leaf-color-success-alpha-15)` x2
  - `var(--leaf-color-success-alpha-8)` x2
  - `var(--leaf-color-success-border-12)` x2
  - `var(--leaf-color-success-surface-5)` x2
  - `var(--leaf-color-text-alpha-10)` x1
  - `var(--leaf-color-text-alpha-15)` x1
  - `var(--leaf-color-text-alpha-8)` x1
  - `var(--leaf-color-text-border-12)` x1
  - `var(--leaf-color-text-surface-5)` x1
  - `var(--leaf-color-warning-alpha-10)` x2
  - `var(--leaf-color-warning-alpha-15)` x2
  - `var(--leaf-color-warning-alpha-8)` x2
  - `var(--leaf-color-warning-border-12)` x2
  - `var(--leaf-color-warning-surface-5)` x2

### `anchor/anchor.scss`
- derivedTokenUsages:
  - `var(--leaf-color-primary-alpha-4)` x1

### `appbar/appbar.scss`
- derivedTokenUsages:
  - `var(--leaf-color-primary-alpha-8)` x1

### `avatar/avatar.scss`
- hardcodedColors:
  - `#fff` x1

### `badge/badge.scss`
- hardcodedColors:
  - `#fff` x1
  - `rgb(255 255 255/16%)` x1

### `breadcrumb/breadcrumb.scss`
- derivedTokenUsages:
  - `var(--leaf-color-primary-alpha-45)` x1

### `button/button.scss`
- hardcodedColors:
  - `rgb(0 0 0/0.06)` x1
- mixFormulas:
  - `color-mix(in srgb,var(--leaf-button-on-color)32%,transparent)` x1
- derivedTokenUsages:
  - `var(--leaf-color-danger-alpha-18)` x1
  - `var(--leaf-color-danger-alpha-25)` x1
  - `var(--leaf-color-danger-alpha-42)` x1
  - `var(--leaf-color-danger-text-80)` x1
  - `var(--leaf-color-primary-alpha-18)` x1
  - `var(--leaf-color-primary-alpha-25)` x1
  - `var(--leaf-color-primary-alpha-42)` x1

### `calendar/calendar.scss`
- derivedTokenUsages:
  - `var(--leaf-color-border-surface-70)` x1
  - `var(--leaf-color-primary-surface-5)` x2
  - `var(--leaf-color-primary-surface-8)` x2
  - `var(--leaf-color-surface-muted-alpha-45)` x2
  - `var(--leaf-color-text-muted-surface-8)` x1
  - `var(--leaf-color-text-muted-surface-9)` x2

### `colorpicker/colorpicker.scss`
- derivedTokenUsages:
  - `var(--leaf-color-primary-alpha-12)` x1
- fieldFamilyBorders:
  - `border-color:var(--leaf-color-danger)` x1
  - `border-color:var(--leaf-color-primary-indicator,var(--leaf-color-primary))` x1
  - `border:1px solid var(--leaf-color-border)` x1

### `commandpalette/commandpalette.scss`
- derivedTokenUsages:
  - `var(--leaf-color-border-alpha-60)` x1

### `drawer/drawer.scss`
- hardcodedColors:
  - `rgb(0 0 0/0.38)` x1

### `dropdown/dropdown.scss`
- derivedTokenUsages:
  - `var(--leaf-color-danger-surface-6)` x1
  - `var(--leaf-color-danger-surface-8)` x2

### `filelist/filelist.scss`
- hardcodedColors:
  - `#111` x1
- derivedTokenUsages:
  - `var(--leaf-color-danger-surface-4)` x1
  - `var(--leaf-color-danger-surface-9)` x1
  - `var(--leaf-color-danger-text-80)` x2
  - `var(--leaf-color-info-surface-5)` x1
  - `var(--leaf-color-primary-surface-14)` x1
  - `var(--leaf-color-primary-surface-5)` x1
  - `var(--leaf-color-primary-surface-9)` x1
  - `var(--leaf-color-success-text-80)` x1
  - `var(--leaf-color-warning-surface-5)` x1
  - `var(--leaf-color-warning-text-80)` x1

### `form/form.scss`
- derivedTokenUsages:
  - `var(--leaf-color-danger-surface-6)` x1

### `inputnumber/inputnumber.scss`
- derivedTokenUsages:
  - `var(--leaf-color-primary-surface-10)` x1

### `inputotp/inputotp.scss`
- derivedTokenUsages:
  - `var(--leaf-color-primary-alpha-12)` x1

### `loading/loading.scss`
- derivedTokenUsages:
  - `var(--leaf-color-surface-alpha-55)` x1

### `loadingbar/loadingbar.scss`
- derivedTokenUsages:
  - `var(--leaf-color-primary-alpha-55)` x1

### `menu/menu.scss`
- hardcodedColors:
  - `rgb(0 0 0/0.08)` x1
  - `rgba(0,0,0,0.04)` x1
  - `rgba(0,0,0,0.08)` x3
- mixFormulas:
  - `color-mix(in srgb,currentColor 80%,var(--leaf-color-surface))` x1
- derivedTokenUsages:
  - `var(--leaf-color-danger-surface-6)` x1
  - `var(--leaf-color-danger-surface-8)` x1
  - `var(--leaf-color-primary-alpha-10)` x1
  - `var(--leaf-color-primary-alpha-4)` x1

### `modal/modal.scss`
- hardcodedColors:
  - `rgb(0 0 0/10%)` x1
  - `rgb(0 0 0/24%)` x1
- mixFormulas:
  - `color-mix(in srgb,var(--leaf-color-surface-muted)60%,var(--leaf-color-surface))` x1
- derivedTokenUsages:
  - `var(--leaf-color-border-surface-35)` x2

### `pagination/pagination.scss`
- derivedTokenUsages:
  - `var(--leaf-color-primary-border-24)` x1
  - `var(--leaf-color-primary-surface-8)` x1

### `popconfirm/popconfirm.scss`
- derivedTokenUsages:
  - `var(--leaf-color-danger-alpha-8)` x2
  - `var(--leaf-color-info-alpha-8)` x1
  - `var(--leaf-color-success-alpha-8)` x1
  - `var(--leaf-color-warning-alpha-8)` x1

### `popover/popover.scss`
- derivedTokenUsages:
  - `var(--leaf-color-border-alpha-85)` x2

### `progress/progress.scss`
- hardcodedColors:
  - `rgb(255 255 255/0.35)` x1

### `qrcode/qrcode.scss`
- derivedTokenUsages:
  - `var(--leaf-color-surface-alpha-90)` x1

### `rate/rate.scss`
- hardcodedColors:
  - `#ffc53d` x1

### `rate/rate.tsx`
- hardcodedColors:
  - `#ef5350` x1
  - `#f49b23` x1
  - `#ffc53d` x1

### `shared/_floating.scss`
- derivedTokenUsages:
  - `var(--leaf-color-border-alpha-55)` x1

### `shared/calendar.scss`
- mixFormulas:
  - `color-mix(in srgb,var(--leaf-color-surface-muted)60%,var(--leaf-color-surface))` x1
- derivedTokenUsages:
  - `var(--leaf-color-primary-alpha-10)` x1
  - `var(--leaf-color-primary-alpha-12)` x1
  - `var(--leaf-color-surface-muted-alpha-45)` x1

### `skeleton/skeleton.scss`
- derivedTokenUsages:
  - `var(--leaf-color-text-subtle-alpha-9)` x1

### `slider/slider.scss`
- hardcodedColors:
  - `rgb(0 0 0/7%)` x1
- derivedTokenUsages:
  - `var(--leaf-color-primary-alpha-12)` x2
  - `var(--leaf-color-primary-alpha-16)` x2
  - `var(--leaf-color-primary-alpha-20)` x2

### `splitter/splitter.scss`
- derivedTokenUsages:
  - `var(--leaf-color-primary-surface-28)` x1

### `switch/switch.scss`
- hardcodedColors:
  - `#fff` x1
  - `rgb(0 0 0/14%)` x1
  - `rgb(0 0 0/15%)` x1
- mixFormulas:
  - `color-mix(in srgb,var(--leaf-color-text)4%,var(--leaf-switch-track-background))` x1
  - `color-mix(in srgb,var(--leaf-color-text)8%,var(--leaf-switch-track-background))` x1
- derivedTokenUsages:
  - `var(--leaf-color-surface-muted-border-65)` x1

### `tabs/tabs.scss`
- hardcodedColors:
  - `#fff` x1
- mixFormulas:
  - `color-mix(in srgb,var(--leaf-color-surface-muted)75%,var(--leaf-color-border))` x1
  - `color-mix(in srgb,var(--leaf-color-text-muted)72%,var(--leaf-color-surface))` x2
- derivedTokenUsages:
  - `var(--leaf-color-border-alpha-65)` x1

### `tag/tag.scss`
- hardcodedColors:
  - `#fff` x2
  - `rgba(255,255,255,0.1)` x1
- derivedTokenUsages:
  - `var(--leaf-color-danger-alpha-10)` x1
  - `var(--leaf-color-danger-surface-8)` x1
  - `var(--leaf-color-info-alpha-10)` x1
  - `var(--leaf-color-info-surface-8)` x1
  - `var(--leaf-color-primary-alpha-10)` x2
  - `var(--leaf-color-primary-surface-8)` x2
  - `var(--leaf-color-success-alpha-10)` x1
  - `var(--leaf-color-success-surface-8)` x1
  - `var(--leaf-color-warning-alpha-10)` x1
  - `var(--leaf-color-warning-surface-8)` x1
  - `var(--leaf-color-warning-text-80)` x1

### `theme.ts`
- hardcodedColors:
  - `rgb(0 0 0/${theme.elevation === 'soft' ? '.08':'.16'})` x1

### `timepicker/timepicker.scss`
- derivedTokenUsages:
  - `var(--leaf-color-primary-alpha-15)` x1
  - `var(--leaf-color-primary-surface-9)` x1

### `tour/tour.scss`
- hardcodedColors:
  - `rgb(0 0 0/0.45)` x2

### `transfer/transfer.scss`
- derivedTokenUsages:
  - `var(--leaf-color-primary-surface-8)` x1

### `tree/tree.scss`
- hardcodedColors:
  - `#0002` x1
- derivedTokenUsages:
  - `var(--leaf-color-border-alpha-55)` x1
  - `var(--leaf-color-primary-alpha-12)` x1

### `typography/typography.scss`
- derivedTokenUsages:
  - `var(--leaf-color-primary-alpha-8)` x1
  - `var(--leaf-color-primary-text-85)` x1
  - `var(--leaf-color-warning-alpha-16)` x1

### `upload/upload.scss`
- derivedTokenUsages:
  - `var(--leaf-color-primary-alpha-10)` x1
  - `var(--leaf-color-primary-surface-7)` x1
  - `var(--leaf-color-primary-surface-8)` x1

## Reviewed exceptions

These entries are controlled exceptions, not compliance claims. Their exact expression and count are part of the baseline.

### `autocomplete/autocomplete.scss`
- fieldFamilyBorders: `border-color:transparent` x1 - Native inner control/action border reset or moving-highlight transparency; the outer field is painted by the shared field recipe.
- fieldFamilyBorders: `border:0` x1 - Native inner control/action border reset or moving-highlight transparency; the outer field is painted by the shared field recipe.

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
- fieldFamilyBorders: `border:1px solid var(--leaf-color-border)` x1 - ColorPicker format-switch frame, spectrum thumb or swatch contrast border, not the outer field shell.
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

### `select/select.scss`
- fieldFamilyBorders: `border-color:transparent` x1 - Native inner control/action border reset or moving-highlight transparency; the outer field is painted by the shared field recipe.
- fieldFamilyBorders: `border:0` x2 - Native inner control/action border reset or moving-highlight transparency; the outer field is painted by the shared field recipe.

### `shared/_backdrop.scss`
- hardcodedColors: `rgba(8,12,18,0.44)` x1 - Shared backdrop recipe keeps a fixed scrim fallback for environments without a theme color.

### `treeselect/treeselect.scss`
- fieldFamilyBorders: `border:0` x2 - Native inner control/action border reset or moving-highlight transparency; the outer field is painted by the shared field recipe.

## Priority migration

1. Field shell: outer field shells already share the field recipe; continue reviewing the ColorPicker private value input without confusing native border resets, internal dividers or swatch outlines with duplicated shell paint. Retain neutral focus variants; only Input/Select opt into primary focus.
2. Option and surface families: migrate remaining numeric derived-token consumers in Menu, Calendar, Dropdown, and related popup surfaces to shared family recipes. Table/DataTable now consume the shared table-family recipe, including defined selected/action fallbacks.
3. Neutral shadows and overlays: consolidate remaining hardcoded black/white alpha paint in theme and component SCSS without changing resting geometry.
4. Optional/compatibility inputs: keep `primarySoftColor` as an optional override with family-local fallbacks, not a default-generated global token. The historical `surface-alpha-80` CSS override remains supported with a table-surface fallback; its unknown-name warning is intentional until compatibility cleanup is separately reviewed.
5. Generated token cleanup: review zero-consumer tokens only after removing all consumers; removal is a separate reviewed recipe/palette change.

## Not completed

- No visual or browser acceptance was performed by this checker.
- No attempt was made to prove full CSS cascade, Shadow DOM, portal, inline-style, or dynamic interpolation behavior.
- Existing debt is not migrated by this audit. Exceptions are allowed cases, not compliant replacements for new component defaults.
- `_mixins.scss` state behavior and computed field focus, validation, disabled, and custom-theme paint remain browser-test responsibilities.
