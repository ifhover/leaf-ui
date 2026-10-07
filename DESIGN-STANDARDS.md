# Leaf UI visual and interaction standard

The default appearance is quiet and readable. Every component uses semantic theme tokens, supports a light/dark scope, and inherits comfortable/compact density. Local component overrides and explicit sizes take precedence.

| Foundation | Comfortable | Compact |
| --- | --- | --- |
| Base control height | 34 px | 28 px |
| Base body text | 14 px / 1.6 | 14 px / 1.6 |
| Spacing unit | 8 px | 6 px |
| Form row gap | 18 px | 12 px |
| List row vertical padding | 12 px | 8 px |
| Popup option minimum height | 32 px | 28 px |
| Dialog padding, block / inline | 20 / 24 px | 16 / 20 px |
| Radius, small / base / large | 6 / 10 / 16 px | 6 / 10 / 16 px |

Component size is a local choice; density is a region-wide layout choice. Compact is intended for pointer/keyboard data-heavy interfaces. Use comfortable or larger explicit controls for touch interfaces; essential targets should be at least 24 px and preferably 44 px.

| State | Required behavior |
| --- | --- |
| Default | Legible text, consistent icon alignment, stable geometry |
| Hover | Color, border or shadow feedback; ordinary actions retain position and dimensions |
| Pressed | Immediate color/opacity feedback; Button may shrink subtly around its center without changing layout or translating; menu/tab actions retain geometry |
| Focus-visible | Distinct outline; no layout shift; visible in forced colors |
| Selected | Semantic selected background/indicator plus ARIA state; never color alone |
| Disabled | Inoperable, correct native/ARIA state; distinguish from loading |
| Loading | Stable label/width when possible; expose busy state; prevent duplicate submission |
| Error / warning | Status text and icon; focusable summary where applicable; avoid reliance on color |
| Empty | Explain what is empty and offer a next action when useful |

Use the primary color for actionable emphasis. Use success/info/warning/danger for meaning. Muted text remains readable; custom palettes must meet WCAG contrast for their actual foreground/background combinations. Transparent derived colors use premultiplied sRGB alpha.

Ordinary action feedback uses 120–200 ms easing. Dialogs and drawers can use up to 320 ms; drawers slide without overshoot. Messages and notifications enter as one unit, without inner icon/text springs. Selection indicators may move to the newly selected item; their animation must not move the control itself. Card lift is opt-in through `hoverable`. Honor system reduced motion and `theme.motion={false}`; animation never gates functionality.

Dialog headings, form edges and footer actions share the same inline padding. The body has sufficient separation from both heading and actions. A notification close action occupies only the heading row. Icons are decorative when the accompanying text already conveys the meaning. Every icon-only action needs an accessible name.

Acceptance uses keyboard behavior, geometry assertions, axe, SSR, build/package checks and manual inspection in both themes and densities. Screenshot baseline comparisons are deliberately deferred. See `IMPLEMENTATION-BATCHES.md` and `packages/react/ACCESSIBILITY.md` for evidence and manual coverage limits.
