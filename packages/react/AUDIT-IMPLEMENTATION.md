# 2026-10 component audit implementation

Scope: implement the 2026-10-05 audit, excluding Table / DataGrid and table scenarios. Keep native forms, static SCSS, the 34px control baseline and scoped ConfigProvider services.

## Work and acceptance

- [x] A01–A03: isolate compound field metadata, unique IDs, form-wide disabled, upload/reset integration.
- [x] A04: business readOnly locks every value mutation; inputReadOnly only locks typing.
- [x] A05–A06: selected-label cache, versioned lazy trees, abort stale requests.
- [x] Selection: Cascader search/multiple/lazy/intermediate/display/field mapping; AutoComplete states/groups/render/virtual/clear/open; Select slots/open/responsive tags; TreeSelect limits/expansion/filter/render/types.
- [x] Dates: format/parse/presets/open/panel/cellRender, multiple dates; ranges disabled/quarter/open ends/calendar callbacks; date-time disabled; time panels disabled choices. Local-Date and application timezone conversion are documented.
- [x] Forms/numbers/upload: native async adapter plus executable Zod/server-error and RHF examples, exact decimal stringMode, formatter/parser, manual upload/concurrency/directory/paste/picture cards and transport extension.
- [x] Overlays/navigation: lifecycle/focus/container, Drawer push/resize, Dropdown hover/context menu, Menu route/render, Tabs positions, Breadcrumb collapse/menu, Steps dot/progress.
- [x] Inputs/feedback: Slider tooltip/marks-only, ColorPicker gradient, Progress segments/colors/dashboard.
- [x] Foundation: extensible messages/zh-TW/week start/Intl, direction/RTL, theme scales/component tokens/slots/system appearance/contrast, popup slots/container/ShadowRoot.
- [x] New content: Typography/Text/Title/Paragraph/Link, List/ListItem, Statistic/Countdown.
- [x] New interaction: Anchor/Affix, Splitter/ResizablePanels, Tour, Carousel, FloatButton/FAB, Mentions, CommandPalette, AppBar/Toolbar/BottomNavigation.
- [x] Delivery: public exports/subpaths/component styles, bilingual examples/API/catalog/AI index, complex forms/remote-search scenarios.
- [x] Quality: business regression tests, PR CI/React 18+19/a11y/browser matrix/visual and large-data/bundle baselines. Verification evidence and limits are recorded in QUALITY.md.

Unreleased changes stay out of the published changelog. The root documentation continues to serve the latest npm release; version snapshots stay immutable.

## Acceptance evidence

Full local checks, library/package verification and bilingual docs build pass. The original audit failures are permanent regression tests. Chromium/WebKit passed all 36 browser cases; the final color-picker size correction also passed the 16-case visual/large-data subset. Published 0.1.0 / 0.2.0 / 0.3.0 and latest-root snapshots rebuild successfully from npm gitHead.

QUALITY.md records production bundle numbers, actual test scope, the local Firefox launch limitation and the remaining manual screen-reader/device verification. The GitHub quality matrix supplies Linux Firefox and React 18/19 evidence. This is an implementation checklist, not a declaration that every accessibility/device combination has been certified.

Table/DataGrid, table scenarios, charts, rich-text editors and business templates are excluded. Non-Gregorian dates stay an application adapter; uploads do not assume a storage protocol; Form remains native and does not introduce AntD's independent values/rules store.
