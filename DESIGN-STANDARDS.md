# Leaf UI visual and interaction standard

The default appearance is quiet and readable. Every component uses semantic theme tokens, supports a light/dark scope, and inherits comfortable/compact density. Local component overrides and explicit sizes take precedence.

| Foundation | Comfortable | Compact |
| --- | --- | --- |
| Base control height | 40 px | 34 px |
| Base body text | 14 px / 1.6 | 14 px / 1.6 |
| Secondary text | 13 px | 13 px |
| Spacing unit | 8 px | 6 px |
| Form row gap | 24 px | 16 px |
| List row vertical padding | 12 px | 8 px |
| Popup option minimum height | 36 px | 30 px |
| Dialog padding, block / inline | 20 / 24 px | 16 / 20 px |
| Radius, small / base / medium / large | 6 / 10 / 12 / 16 px | 6 / 10 / 12 / 16 px |

Component size is a local choice; density is a region-wide layout choice. Compact is intended for pointer/keyboard data-heavy interfaces. Use comfortable or larger explicit controls for touch interfaces; essential targets should be at least 24 px and preferably 44 px.

Hierarchy comes from radius, borders and type rather than decoration. Radii step down from the outside in: dialogs, drawers and popups use the large radius; content surfaces (Card, Alert, Collapse, Descriptions, Transfer, Upload, FileList, Result content, choice cards and lists) use the medium radius; buttons, fields and Table frames use the base radius; checkboxes and small chips use the small radius; status tags are pills. Content surfaces use hairline borders and muted fills without shadows; shadows are reserved for layers that float (popups use `shadow-md`, dialogs `shadow-lg`) and for raised handles such as slider thumbs and selected segments. Text hierarchy relies on size and color: 14 px body, 13 px secondary text, `fontWeight` (500) for component titles, labels, selected tabs and buttons, and `headingWeight` (600) only for Typography headings. Option group headings in Select, Dropdown, Menu, CommandPalette, List and rich choice groups use the shared section label: 12 px, weight 500, 0.04em tracking, uppercase for Latin text, muted color. Indicators that accompany text (Steps icons, Result and Upload symbols) are sized relative to the text, not to the control height.

Inset surfaces use concentric curves: `inner radius = max(0px, outer radius - padding - border width)`. A default popup has a 16 px outer radius, 6 px padding and a 1 px border, so its options use 9 px. Hover, selected and moving highlight layers share that curve. The shared geometry helper accounts for unequal padding with horizontal/vertical corner radii, including the extra insets in Cascader, TreeSelect and TimePicker. Theme and component padding changes update the curves automatically; small and square themes clamp to zero. Independent controls, calendar cells, tags and icons retain their semantic radii. Do not introduce clipping merely to hide a mismatch.

| State | Required behavior |
| --- | --- |
| Default | Legible text, consistent icon alignment, stable geometry |
| Hover | Color, border or shadow feedback; ordinary actions retain position and dimensions |
| Pressed | Immediate color/opacity feedback; solid/outlined Button activation emits a faint expanding outer contour while the button and label retain their geometry; ghost/menu/tab actions retain geometry without a wave |
| Focus-visible | Distinct outline; no layout shift; visible in forced colors |
| Selected | Semantic selected background/indicator plus ARIA state; never color alone |
| Disabled | Inoperable, correct native/ARIA state; distinguish from loading |
| Loading | Stable label/width when possible; expose busy state; prevent duplicate submission |
| Error / warning | Status text and icon; focusable summary where applicable; avoid reliance on color |
| Empty | Explain what is empty and offer a next action when useful |

Use the primary color for actionable emphasis. Use success/info/warning/danger for meaning. Muted text remains readable; custom palettes must meet WCAG contrast for their actual foreground/background combinations. Transparent derived colors use premultiplied sRGB alpha.

Warning glyphs, field accents and status fills use a clear amber (`#faad14` in light, `#ffc53d` in dark). Warning text derives a darker or lighter readable ink independently; solid warning tags choose a contrasting label. Do not darken every warning accent to achieve text contrast.

Dropdown pointer, keyboard and pressed states share one moving background; danger transitions interpolate its color. Select uses the same opaque primary tint for selected rows and the moving highlight, which stays visible when crossing a selection. Selected text and checkmarks convey the persistent value without changing the hover fill.

Ordinary action feedback uses 120–200 ms easing. Dialogs and drawers can use up to 320 ms; drawers slide without overshoot. Messages and notifications enter as one unit, without inner icon/text springs. Selection indicators may move to the newly selected item; their animation must not move the control itself. Card lift is opt-in through `hoverable`. Honor system reduced motion and `theme.motion={false}`; animation never gates functionality.

Solid and outlined Button activation uses a single translucent perimeter wave, following Ant Design's ease-out curve: a 400 ms expansion to 6 px outside the border and a 2 s opacity decay from 0.2. Ghost and link buttons omit the decoration, including danger and icon-only ghost buttons. Both timings follow the regional motion duration. One persistent decorative span and one browser animation handle both properties, without geometry/color measurement, per-click React roots, observers or per-frame JavaScript. It follows the actual corner radii and semantic action color and never clips or scales the label. Repeated activation replaces the current wave; disabling, loading, switching to ghost, unmounting or changing motion preferences cancels it. The decoration neither intercepts pointers nor changes scrollable layout, native submission, focus or accessible names. Forced colors omits the wave while retaining the focus outline.

Solid buttons brighten on hover and deepen on press; derived shades retain readable labels and explicit interaction tokens take precedence. Outlined buttons keep their surface while text and borders take the hover/active action color. Ordinary ghost buttons use neutral hover/active surfaces; danger ghost buttons also change their semantic text color. All variants retain their geometry.

Dialog headings, form edges and footer actions share the same inline padding. The body has sufficient separation from both heading and actions. A notification close action occupies only the heading row. Icons are decorative when the accompanying text already conveys the meaning. Every icon-only action needs an accessible name.

Modal and Drawer use a content surface, subtle section dividers and a muted footer by default. `divided={false}` groups content with spacing. Their heading icons share a neutral circular base. Confirm is an API-only decision prompt: a compact 420 px surface, spacing-based sections, a bare semantic glyph beside the explanation and no background base or section dividers. Its heading starts at the content edge, independently of the body icon. Popconfirm and Notification use a bare semantic glyph aligned with the title line. Headers without a supporting description use a 16 px vertical inset; Modal and Confirm footers use 12 px. Titles and supporting descriptions share an independent text column. The close action remains on the inline end. Body content scrolls without moving the heading or footer. Borders and surfaces derive from the current light/dark region, including custom palettes and density.

Card retains spacing-based sections by default; `divided` opts into borders and a muted footer for settings or action-focused content. Checkbox/Radio card choices have one full clickable label, a neutral icon base, a title/description column and a trailing native control. Groups may arrange these as a responsive grid or one list with shared borders and row separators. Selected borders use the primary color without gradients or lifting. Status tags are non-interactive, and supporting text is an accessible description rather than part of the choice name. Neutral Alert surfaces preserve semantic icon colors and announcement roles.

ConfigProvider remains the configuration entry. Base colors, radius and height derive related geometry; advanced `dividerColor`, component `borderColor`, `headerBackground` and `footerBackground` provide selective overrides. CSS variables are consumption points for application styling. Filled actions and checkmarks remain solid colors, and single-line controls keep the 40px base height.

Buttons expose solid, outline, ghost and link appearances. Link actions use theme-colored text with no border, padding or control-height minimum; hover and press change only their color, and activation has no wave. Outline uses a content surface, body text and a visible neutral border; danger uses its semantic text and border. Alerts use one neutral surface with semantic icon colors. Result icons sit on the same muted circular base for every status. Table frames use the same base radius as buttons, 13 px muted column headers and divider-colored row separators, and fill their container before horizontal overflow; a minimum width remains a lower bound. Scrollbar tracks overlay content and appear on hover, scroll or keyboard focus; dragging must neither steal input focus nor add a pointer focus outline.

Development migration: replace Button `variant="soft"` with `variant="outline"` and remove Alert `variant` props. Comfortable controls now derive 34 / 40 / 46 px sizes; compact controls use a 34 px base. Set `theme.controlHeight` explicitly when an application needs to retain its former sizing. Content surfaces move from the large to the new medium radius (`borderRadiusMd` / `--leaf-radius-md`) and drop their default shadow; small text becomes 13 px (`fontSize - 1px`); button inline padding derives from its actual height (0.42 times the height, 16.8 px at 40 px), with explicit component padding taking precedence for every size; component titles use `fontWeight` instead of `headingWeight`; small Steps retain body-size labels and at least 24 px indicators; rich choice legends use section labels; replace controlled `Confirm` / `ConfirmProps` with `useConfirm().confirm(options)` / `ConfirmOptions`, and move rich confirmation flows to Modal; Confirm retains a bare body icon; tags become pills; popups use `shadow-md`; Pagination items become borderless. Include these compatibility changes in the next release's migration notes.

Acceptance uses keyboard behavior, geometry assertions, axe, SSR, build/package checks and manual inspection in both themes and densities. Screenshot baseline comparisons are deliberately deferred. See `IMPLEMENTATION-BATCHES.md` and `packages/react/ACCESSIBILITY.md` for evidence and manual coverage limits.
