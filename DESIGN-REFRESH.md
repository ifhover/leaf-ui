# Leaf UI design and motion refresh

Reference direction: Arc UI's neutral surfaces and precise proportions, beUI's continuous selection and shape transitions, and Beautiful UI's information hierarchy and sequenced content.

## Shared contracts

- Keep public APIs, React 18/19, server rendering, focus and native form behavior.
- Keep the 34 / 28 / 40px control sizes and customizable 10px base radius.
- Green communicates selected actions and brand emphasis; text, surfaces and borders use a neutral scale.
- Fast feedback, ordinary state transitions and larger layout transitions derive from the same per-region motion duration. Spatial transitions use a mild spring curve.
- `theme.motion: false` stops CSS and JavaScript motion. A nested `motion: true` region can resume it. System reduced motion always takes precedence.
- Motion must explain a user action or a state change. Static content, QR codes, ordinary layout primitives and virtual scrolling do not receive decorative entrance loops.
- Avoid a new animation runtime dependency. Use CSS for interaction feedback and interruption-safe Web Animations for changes that need measured geometry.

## Batches

1. Neutral palette, surface elevation, focus and shared motion/preference helpers.
2. Input/action controls, selections, file and upload feedback.
3. Overlays, dialogs, queues, calendar and time transitions.
4. Navigation, selection indicators, expandable structure, carousel, statistics and progress.
5. Content, lists, layout, images, placeholder-to-content transitions and supporting primitives.
6. Real product examples, refreshed documentation surfaces, complete integration verification.

## Component coverage

All 83 catalog entries were reviewed. The seven static or direct manipulation primitives listed last keep their natural layout and inherit the refreshed tokens; the other 76 families have component changes.

| Families | Completed work |
| --- | --- |
| ConfigProvider | Neutral light/dark scales, subtle text and raised surfaces, focus and elevation tokens, shared duration/easing/spring, nested motion settings and scoped portal inheritance. |
| Button, Input, InputNumber, Textarea, Checkbox, Radio, Switch, Slider, Rate, InputOTP, InputMask, SignaturePad, ImageCropper, ColorPicker | Neutral field hierarchy, focus/hover/press feedback, continuous check/thumb changes, measured textarea growth, stable loading button width/name, validation and tool feedback. Typing, drawing, cropping and pointer dragging remain immediate. |
| Select, AutoComplete, Mentions, Cascader, TreeSelect, Transfer | Refined trigger and option surfaces, opening origins, chevrons, selection feedback, column/list changes; virtual data windows do not animate as ordinary rows. |
| Calendar, DatePicker, DateTimePicker, DateRangePicker, TimePicker, TimeRangePicker | Directional view changes, shared calendar surfaces, direct date range selection, simultaneous time endpoints, continuous time selection and keyboard feedback. |
| Tabs, Segmented, Menu, Steps, Breadcrumb, Pagination, Anchor, BackTop, FloatButton, AppBar | Measured shared selection indicators, retained tab panels, directional content and height transitions, progress rings, navigation hover/press, staggered quick actions. Geometry handles scrolling, RTL, resized text and scaled ancestors. |
| Collapse, Tree, OrgChart, Carousel | Natural expansion/collapse with retained inert exit content, branch chevrons, interrupted list layout motion, zoom-aware geometry, directional overlapping carousel slides and natural host heights. Virtual Tree remains immediate. |
| Modal, Drawer, Confirm, Popover, Popconfirm, Tooltip, Dropdown, CommandPalette, Tour | Coordinated masks/surfaces, actual floating origins, moving highlights, natural content height changes, preserved inputs/focus, orderly exit presence, async generation isolation and correct Tour step references. |
| Alert, Message, Notification, Loading, LoadingBar, Progress, Result, ErrorBoundary, Skeleton, Statistic | State/icon feedback, continuous queue collapse, progress changes and completion, resolved skeleton content reveal without an extra wrapper, immediate numeric values with subtle update motion. Empty uses the Result family. |
| Card, Avatar, Badge, Tag, Timeline, List, Descriptions, Image, Typography | Neutral borders/surfaces, restrained elevation, consistent hierarchy, keyed list and tag movement, preserved disabled/cancelled opacity, image readiness and preference-aware preview, link/action focus. |
| Form, FileList, Upload, InfiniteScroll, Sortable | Validation/status reveal, keyed field/file reordering, upload/cancel feedback and stable names; sortable positioning follows the drag library and scoped motion preferences. |
| Layout, ScrollArea | Neutral content/sider surfaces, measured sider transitions, clearer scroll thumb and focus. |
| Divider, Grid, Space, Masonry, QRCode, VirtualList, Splitter | Reviewed for palette, density, overflow and interaction stability. Use shared styling and direct geometry without decorative entrance or reordering animations. QR codes retain static readable content. |

## Documentation and examples

- Home opens with an interactive three-column component canvas, with workspace and file scenes available alongside it. The canvas includes form controls, verification, actions, profile and creation cards; the workspace retains filters, completion, task actions and its two-step creation dialog. Dedicated selection, expansion and loading examples remain below.
- Component examples display the preview above the source simultaneously, retaining copy, wrapping and long-code expansion. Chinese sidebar subtitles appear as quiet inline text.
- Shared `.leaf-demo-*` layout rules are part of the documentation contract: keep their stack widths, wrapping rows, grid gaps and responsive surfaces when changing the homepage stylesheet.
- Theme playground exposes motion alongside color, radius and appearance. Both language guides and generated ConfigProvider API describe the new optional tokens and the 200ms default.
- Component thumbnails use the same neutral palette. These remain static so the component catalog stays inexpensive to browse.
- Development and quality guides document measured geometry, cancellation, preference priority and browser regression checks.

## Follow-up corrections (2026-10-07)

The ten reported issues were investigated together with the components sharing their implementation:

1. Restored the preview/source arrangement and inline Chinese sidebar subtitles.
2. Rebuilt the initial home scene around the supplied HeroUI reference, with independent card groups, wider controls, restrained surfaces, real local interactions and responsive columns. Scoped accent colors also adapt to dark mode.
3. Fixed a shared popup geometry error: Floating UI's viewport translation was being scaled by the separate CSS entrance `scale`. Positioning now uses `left`/`top`; vertical popups expand locally from their top or bottom edge according to the resolved placement. Select, menu, date/time and other shared floating consumers inherit the correction.
4. Restored the common demo stylesheet accidentally omitted in the earlier theme rewrite. This restores spacing, alignment and intended widths across Badge, Avatar, forms, feedback, cards and other examples rather than adding isolated component margins.
5. Removed Tree's selected-row inset border, keeping its selected background and focus treatment.
6. Rebuilt FileList's file hierarchy, type icons, separators, actions, upload states and image cards. The image-card list now uses a responsive grid instead of inheriting the text list's vertical flex layout; Upload uses the same corrected layout.
7. Solid buttons have no visible border or inset shadow, a lighter hover fill and a slower scale-only press. The default hover fill retains readable white-label contrast.
8. Restored demo field/stack/surface widths and explicitly made the ErrorBoundary fallback fill its available container.
9. Reproduced and fixed label-driven Select reopening. Associated labels count as part of the floating trigger's dismissal boundary, and retained panels explicitly refresh positioning on reopening. The regression covers repeated label clicks, immediate reopening and upward placement.
10. Removed DateRangePicker's endpoint tabs. TimeRangePicker shows both time endpoints together with static labels, retaining disabled-time validation, native values/reset and the active endpoint for its Now action. A related narrow-screen issue was also fixed: TimePanel scrolls only its own time column instead of every ancestor, keeping endpoint labels visible during initialization and keyboard changes.

## Home composition and control follow-up (2026-10-07)

- Removed the showroom's gray background and enclosing frame. Its transparent canvas now groups preferences, studio activity and workspace creation into three columns, then two and one at smaller widths. Controls use the library's 34px baseline. Duplicate button grids, quick-action cards and oversized community tiles were replaced with spaced action groups and compact community rows.
- Rebalanced the activity card with period selection, metrics and two activity rows. Avatar text styling is restricted to the identity text, so it no longer overrides the brand icon's foreground. Workspace and community icons use contrasting semantic colors on subtle surfaces; save feedback is a lightweight inline section.
- Segmented derives its inner radius from the outer radius, padding and border. Item height accounts for the configured padding too; home examples no longer override only the outside radius.
- Slider defaults `showValue` to false, while retaining the explicit opt-in and tooltip API. Native inputs render above ticks; labels sit below the input hit area and remain clickable. Thumb centers align with the rail and ticks at both endpoints, including vertical sliders; RTL labels center on their logical positions.
- The existing `outline` Button API now renders a borderless neutral gray surface, with matching light/dark and danger states. Chinese/English examples, API descriptions, the theme playground and catalog artwork are synchronized. Attached button groups inherit the same gentle scale press as standalone buttons.

Current verification: `pnpm check` passed all 50 files / 254 behavior cases, plus the release, docs and Skill checks. `pnpm build` passed module, declaration, standalone CSS, SSR, public subpath and bilingual documentation checks. Chromium / WebKit passed a targeted 20-case run: visual themes/direction/sizes/motion/tokens, real-browser accessibility, loading stability and four new marked-slider pointer regressions. React 18 library type checking and 22 targeted Button / Slider / navigation behavior cases passed; this follow-up does not claim a new complete React 18 or browser run. Firefox remains unverified on this Windows host as recorded below.

Final gzip KiB JS / CSS: Button 2.19 / 3.49, common forms 51.56 / 6.49, whole library 200.67 / 33.22; all budgets pass. Manual docs checks covered Chinese/English home layouts, light/dark, 375px and 768px without horizontal overflow, period/channel/mark selection, saves, workspace creation and retained scene state. The Button and Slider docs were checked in the live preview, including a thumb directly over the middle mark. Reports, compatibility logs and captures are retained in `.quality/design-balance`; `home-scene.png` is the final canvas capture. `git diff --check` passed.

## Accent palette follow-up (2026-10-07)

The preceding palette correction gave home scenes, the theme playground and its color popup six shared presets: the library's theme green `#20834a`, cyan `#007c99`, blue `#1265f5`, violet `#9b3df0`, orange `#cf4500` and black `#18181b`. These accents retained their original color in both appearances and used white foregrounds on filled surfaces. Switch thumbs remain white independently of the theme's foreground token, with forced-colors overrides preserved. Subtle buttons, accent text/icons and workspace menu/category text use a readable ink color within the docs preview scopes. The playground normalizes HEX / RGB / HSL input to HEX and exports the same primary color and explicit white foreground shown in its preview.

Hover no longer overrides selected color presets or gradient stops, focused/open field borders, selected floating options, current pagination and breadcrumb links, selected tags, bottom navigation or transfer rows. Shared field and popup rules carry these fixes through the related input, selection and date/time components. Existing selection rules for tabs, segmented controls, trees, menus and calendars were also reviewed.

Verification for the final palette and selection fixes: `pnpm check` passed 50 files / 254 behavior cases, repository lint/type checks and release/docs/Skill checks; `pnpm build` passed module, declarations, standalone CSS, SSR, public exports and bilingual documentation. Twelve targeted Chromium / WebKit regressions cover light/dark focus, color presets, selected popup/time options, navigation, tags, transfer rows and white Switch thumbs. Bundle budgets pass (gzip KiB JS / CSS: Button 2.19 / 3.50, common forms 51.56 / 6.53, whole library 200.67 / 33.32). Final logs and captures are retained in `packages/react/.quality/design-balance` with `selection-*` and `home-theme-white-*` names. Earlier `colors-*`, `home-bright-*`, `home-black-*` and `editor-black-*` artifacts record the previous palette. This targeted follow-up does not claim a new full browser-matrix or React 18 run.

## Preset order follow-up (2026-10-07)

The shared presets now follow the user's exact order and colors: theme green `#20834a`, black `#18181b`, orange `#ff6900`, blue `#1d9bf0`, red `#cf0b2d`. The default remains theme green. The showroom, theme playground and ColorPicker popup all consume this five-color list, retaining white filled-button labels and white Switch thumbs.

Biome and documentation type checking passed. Live preview checks confirmed the order in all three selectors and the exact primary color plus white foregrounds through all five presets. This palette-only follow-up preserves the preceding selection and hover fixes.

## OrgChart and numeric example follow-up (2026-10-07)

OrgChart keeps its existing animation. Its nested list now reserves bottom space inside the animated clipping region for collapsed child-node toggles, shadows and keyboard focus rings. InputNumber's basic and formatting examples share vertical Form / FormField layouts, consistent label typography and spacing, and native label-to-input associations in both languages.

The six existing OrgChart / InputNumber behavior cases, documentation type checking, targeted formatting checks and the full production build passed. Manual preview checks covered both collapsed child branches, keyboard focus and 120% chart zoom, all eight numeric example labels, label-driven focus and stepping, English labels and a 375px layout without overflow. Captures are retained in `packages/react/.quality/design-balance` with `orgchart-collapsed-*` and `inputnumber-labels*` names.

## Earlier integration verification

Final-source verification completed on 2026-10-07:

- `pnpm check` passed: 50 component test files / 253 behavior tests on React 19, library and documentation type checks, Biome and SCSS formatting, 13 release-rule tests, 7 documentation tests and 7 Skill tests.
- `pnpm build` passed: ESM / CommonJS rendering, declarations, compiled standalone styles, all 84 public JavaScript subpaths and every CSS export, bilingual documentation and 188 exported AI Markdown pages.
- Isolated React 18.3.1 / ReactDOM 18.3.1 verification passed with matching React 18 type declarations: library and test type checks, the same 50 files / 253 behavior tests, and 114 current-source SSR fixtures. No manifest, lockfile or dependency links were changed for this verification. Reproduction commands are in `.quality/react18`; current follow-up logs are in `.quality/design-followup`.
- The complete Chromium / WebKit run passed all 50 browser cases (25 per engine). After the narrow-screen time-column correction, its new regression passed in both engines (2/2), and the existing disabled-time/keyboard/invalid-input case also passed again in both engines (2/2). This gives 52 distinct passing browser cases across the recorded runs; the latest targeted report is not a full 52-case run. Earlier follow-up runs recorded 49/50 and 13/14: a short modal animation was missed by a late RAF probe, and two separate indicator/target geometry reads exceeded WebKit's settling timeout. The probes now capture native animation creation or transition events and read related geometry together. They keep actual motion enabled and still assert real duration, endpoints and settled layout. Historical reports are retained separately.
- Browser coverage includes forms and reset, focus and nested / ShadowRoot portals, IME, pointer and keyboard resizing, carousel state, axe serious / critical checks including contrast, 10,000-item data, light / dark / narrow visual contracts, continuous indicators, interrupted reordering and natural opacity, stable loading button width / name, scoped / OS motion preferences, and modal height / state / focus / viewport resizing / cancellation.
- Documentation UI checks cover the Chinese and English home canvas, light / dark appearance and 375px without horizontal overflow, workspace/state retention, local space creation, save/notification/period/accent changes, restored Badge/Avatar spacing, full-width error fallback, simultaneous preview/source with copying/wrapping/expansion, file preview/removal and Upload image cards in wide/narrow layouts. Form labels were repeatedly used to reopen Select; date and time ranges were selected and submitted without endpoint tabs, and Tree's selected row has no inset border. A DOM layout audit visited all 83 catalog pages and 211 preview regions, checking shared stack gaps/widths, obvious content-block shrinkage and preview overflow. These checks complement the manual visual review; they are not pixel comparisons. Library light / dark / narrow screenshots were also visually inspected.
- Local Windows Firefox previously fails to launch with `spawn UNKNOWN`; this refresh is not locally verified in Firefox. Linux CI remains the required Firefox and cross-platform check.
- `git diff --check` passed. Work remains local on `codex/design-motion-refresh`, without a version change or publication.

`pnpm --filter @sudden3/leaf-ui measure:bundle` passed against the final build. Values below are gzip KiB; React / ReactDOM are external and other runtime dependencies are included.

| Entry | Before JS / CSS | Refreshed JS / CSS | Budget JS / CSS |
| --- | --- | --- | --- |
| Button subpath and styles | 2.17 / 2.58 | 2.19 / 3.51 | 5 / 4 |
| Common forms and ConfigProvider | 49.18 / 5.22 | 51.56 / 6.50 | 64 / 10 |
| Whole library | 192.59 / 25.07 | 200.67 / 33.11 | 250 / 35 |

Generated screenshots and reports live in ignored `packages/react/.quality` and `playwright-report` directories. The follow-up's complete browser report is `.quality/design-followup/browser-final.json`; `browser-time-scroll.json` and `browser-time-keyboard.json` preserve the later targeted verification. Historical failed runs have separate reports and logs. Final documentation captures are in `.quality/design-followup`, including `home-scene.png`, `home-dark.jpg`, `home-narrow.jpg`, `badge.jpg`, `avatar.jpg`, `error-boundary.jpg`, `file-list.jpg` and wide/narrow Upload card captures. `docs-layout-audit.json` records the catalog scan. Check, build, bundle and React 18 verification logs are retained there too. Earlier batch evidence remains in `.quality/design-refresh`.
