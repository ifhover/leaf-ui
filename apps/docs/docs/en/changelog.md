---
sidebar: placeholder
footer: false
---

# Changelog

Features, improvements and fixes included in each npm release.

## 0.7.0 - 2026-10-19

### Added

- Form accepts `layout="settings"`: labels and descriptions sit on the left, controls retain their natural width on the right, rows have separators, and narrow screens stack the content. FormField adds independent `description` and `layout` props; use `layout="vertical"` for full-width controls such as textareas. Descriptions and help / errors are associated with the control separately.
- `MenuGroup` / `MenuGroupProps` provides a titled, accessibly named group for menus or custom sidebar content, with scoped defaults, native attributes and a ref. Menu data groups support ReactNode titles and keyboard navigation across groups while skipping disabled items.
- Theme tokens add global `borderWidth`, `controlShadow` and `surfaceShadow`, plus component border widths and text, background, border and shadow overrides for `hover` / `active` / `focus` / `disabled` states. Nested state overrides merge by field and retain the focus outline.
- Tabs adds `block` for equally sized tabs across the available width. `TabItem.children` is optional, allowing a tab bar without panels. AutoComplete, Cascader and Mentions add `popupWidth` / `popupMaxWidth`, sharing trigger-width, content-width and explicit-width rules with Select and TreeSelect.

### Improved and fixed

- Reworked horizontal Menu and collapsed-sidebar navigation popups with consistent titles, groups, separators and selection feedback. Collapsed sidebars open to the side and fall back below when space is limited, with RTL support and highlighted current pages and parents. Fixed entering and leaving grouped submenus with arrow keys.
- Dark themes preserve an explicit primary color for solid fills and derive readable text, selection indicators, focus and necessary boundaries by purpose. Solid primary fills choose black or white text automatically. Fixed selected surfaces and tags turning black after CSS color expressions were resolved; nested themes and popups update together.
- Global borders and control / surface shadows apply consistently to supported components, with thicker borders included in control and popup geometry. Fixed reset themes in portals inheriting outer shadows again and hover states overriding pressed feedback.
- More internal scrolling regions use Scrollbar, including Tabs, Tree, VirtualList, Textarea, sidebars, drawers and command palettes, while retaining semantics, focus, and native textarea selection and resizing.
- Card Tabs use consistent 3px padding and gaps, a neutral background and a raised selection, without scaling when pressed. Soft buttons use a neutral tint, with pale red backgrounds and red text for danger states. Refined Steps connectors, single-ring Avatar edges, Table header separators and row-hover surfaces.
- Updated bilingual documentation navigation, search and narrow-screen drawers, with better page / anchor retention during language changes and improved source expansion and copying. The theming guide includes five copyable configurations: default, illustration, Windows XP, Material and neumorphic. Design tokens and Figma resources are synchronized.

### Migration

- This `0.x` minor release includes API and default appearance changes. Review the following before upgrading.
- Segmented, `SegmentedProps`, `SegmentedOption` and their component / stylesheet subpaths are removed. Use `Tabs type="card"`; replace `options` with `items`, option `value` with `key`, and `value` / `defaultValue` with `activeKey` / `defaultActiveKey`. `block` still fills the available width with equal items. Tabs does not submit a form field; manage a separate field in the application when native form submission is required.
- Button removes `variant="ghost"`; use `variant="soft"`. Scoped Button defaults and related variant types follow this change. Other components, such as Pagination, retain their own `ghost` appearance.
- Select and TreeSelect popups now match the control width by default, and `popupMaxWidth` no longer defaults to 420px. Set `popupWidth="auto"` for content sizing, which may be narrower than the control. Set `popupMaxWidth` explicitly when needed; all modes remain constrained by the viewport.

## 0.6.0 - 2026-10-16

### Added

- `ConfigProvider.components` supplies scoped defaults for public components, compound parts and the Confirm API. Instance props override inner and outer scopes; `undefined` inherits and a `null` component entry clears inherited defaults. Configuration updates preserve uncontrolled values, DOM identity, focus and form semantics.
- BCP 47 language tags, explicit fallback chains and custom `translations` JSON, with built-in Simplified Chinese, Traditional Chinese, English, Japanese and Korean. Variable sentences support ICU arguments and plurals. Translation types, JSON Schema, all five resource files and the `leaf-ui-check-translations` CLI are available.
- A public `Flex` layout component, the Tailwind CSS 3 preset `@ifhover/leaf-ui/tailwind` and the Tailwind CSS 4 theme entry `@ifhover/leaf-ui/tailwind.css`, sharing regional colors, sizing, spacing and motion variables.
- Card adds a large size and integrated `tabs`; FileList supports text, picture and picture-card layouts; Pagination adds `outline` / `ghost` appearances and a boolean `showTotal` for localized totals.

### Improved and fixed

- Default controls use a 36px height, with 30px / 42px small and large sizes and a 30px compact baseline. Forms, date and time panels, virtual-row estimates and card Tabs follow the same sizing rules.
- Browser entries automatically load shared foundation and used component styles, without a manual CSS import. CSS-free Node entries and the complete static stylesheet remain available, with expanded Next.js, TanStack Start and server-rendering guidance.
- Consistent neutral candidate feedback, wrapped and collapsed selection tags, Menu and Tabs corners, card surfaces, borderless tags and pagination feedback. Tab content switches immediately while selection indicators retain their movement.
- Fixed the first input being lost after FormField validation, selected Tab text ignoring the theme color, TreeSelect expansion and option activation, reopened selector carets and narrow multi-selection layouts.
- Fixed quick jumps overriding another pagination action and duplicate page / page-size callbacks. Internal controls no longer inherit unrelated public component defaults that accidentally change submission, read-only or disabled behavior.
- Reworked bilingual introductions, getting started, theming, internationalization, API references and focused examples. Component filtering, persisted theme and package-manager preferences, narrow and dark layouts, and source expansion improve documentation browsing.

### Migration

- This `0.x` minor release includes API and default appearance changes. Review the following before upgrading.
- `ConfigProvider.messages`, `textMessages` and `LeafMessages` are removed. Use language-indexed `translations` with `LeafTranslation` / `LeafTranslations`. List language fallbacks explicitly in the `locale` array; the final fallback is built-in English.
- `ImageCropper`, `SignaturePad`, their types and component / stylesheet subpaths are removed. Integrate a dedicated dependency in the application when cropping or signing is required.
- Card removes `hoverable`. Tag removes `variant="outline"`; use the default `soft` or `solid`. Pagination now uses outlined controls by default; set `variant="ghost"` to retain borderless controls.
- Set `theme={{ controlHeight: 40 }}` through `ConfigProvider` to retain the 0.5.0 control-height baseline. Continue using `@ifhover/leaf-ui/styles/all.css` when managing SSR styles explicitly.

## 0.5.0 - 2026-10-12

### Added

- The npm package moves to `@ifhover/leaf-ui`, matching the GitHub maintainer account. Previous package releases and documentation snapshots remain available. Version navigation and the AI Skill resolve documentation using the installed package name and version.
- Composable `Table` and an optional `DataTable` adapter, with sorting, filtering, selection, pagination, pinned columns, resizing, grouping, expansion, editing, virtual rows and row / column reordering. Import the adapter from `@ifhover/leaf-ui/table/tanstack` and install `@tanstack/react-table` separately.
- `Scrollbar` provides overlay tracks without consuming content width, with dragging and keyboard controls. Table, Modal, Cascader and ScrollArea share this implementation.
- Button supports `variant="link"`. Checkbox, Radio and their groups offer card and list appearances with descriptions, icons and supplementary content. Card, Modal and Drawer support descriptions and section styling.
- Progress supports an enabled-by-default `active` shimmer within the filled portion of incomplete linear progress. It can be disabled and respects reduced-motion preferences.

### Improved and fixed

- Default controls use a 40px height, with 34px / 46px small and large sizes. Button padding derives from height; popup options and form spacing follow the updated scale. Content cards use flat surfaces and the base radius, while dialogs retain a larger outer radius.
- Buttons use an outer wave for activation and smooth hover / press color changes. Text and link buttons omit the wave. Brighter warning colors, dialog sections, compact footers, Confirm body icons, and Alert / Result alignment are consistent.
- Named ESM imports from the root load component styles on demand in verified Vite and Rspack production builds. Root and subpath imports share component identity and context; default Node entries remain free of CSS for server rendering.
- Fixed popup selection / hover color changes, transient Cascader overflow, stretched or overly offset badges, and narrow-table scrolling with page scroll chaining. Headers are sticky by default; a height limit enables scrolling within the table body.
- Refined bilingual documentation, home, navigation and example layouts. Code examples include only the source needed for the current demo, omit documentation-only language props, and expand / collapse with a short transition and gradient mask. Getting started combines installation and basic usage.

### Migration

- Install `@ifhover/leaf-ui` and replace application imports from `@sudden3/leaf-ui`, including CSS paths. The new scope starts at 0.5.0; the legacy scope remains at 0.4.2.
- Import `@ifhover/leaf-ui/styles.css` once at the application entry for theme variables, shared popups and Confirm / Message / Notification / LoadingBar services. It no longer contains all component CSS. Use `@ifhover/leaf-ui/styles/all.css` for a complete static stylesheet. Component subpaths remain available for CommonJS or bundlers that cannot prune root-entry CSS.
- Button removes the `soft` variant; use `outline`. Set `theme.controlHeight` through ConfigProvider to retain a shorter control height.
- Confirm now uses only `useConfirm().confirm(options)`. The controlled `Confirm` component and `ConfirmProps` are removed, and confirmation options no longer inherit the full Modal API. Use Modal for complex content, custom footers or controlled visibility; use `type="danger"` for destructive confirmations.
- Standalone `Sortable`, `List` / `ListItem` and `OrgChart`, their types and subpaths are removed. Use native layout for lists. Reordering within Tabs, Tree and DataTable remains available.

## 0.4.2 - 2026-10-08

### Fixed

- Coordinated nested corner geometry for Select, AutoComplete, Mentions, Dropdown and other popup options. Inner radii derive from the surface radius, padding and border; default options change from 6px to 9px for consistent inner and outer curves.
- Kept Menu, card Tabs, Segmented, ColorPicker format buttons and moving highlights consistent. Cascader, TreeSelect and TimePicker include their additional insets; independent controls retain their semantic radii.
- Fixed Dropdown highlight edges after custom padding, including asymmetric padding, RTL, square themes, nested theme overrides and live theme updates while a popup is open.

### Theme configuration

- Set shared popup `borderRadius` and `padding` through `theme.components.Floating`; local `Dropdown` settings take precedence. Component padding accepts numbers, CSS lengths and 1–4 value shorthand. Existing component props remain compatible; no application migration is required.

## 0.4.1 - 2026-10-07

### Fixed

- Restored subtle centered press scaling for every `Button` variant, button groups and application-navigation buttons. Buttons return smoothly after release or pointer exit without an additional position shift.
- Disabled and loading buttons do not scale. Regional motion settings, nested overrides, portals and system reduced-motion preferences remain consistent.

## 0.4.0 - 2026-10-07

Consistent component visuals and interactions, global density settings, portable theme colors, and complete application examples, design resources and accessibility guidance.

### Added

- `ConfigProvider` accepts `density="comfortable" | "compact"`, with nested inheritance and overrides. Portals retain their region's density; explicit component and theme sizes take precedence.
- `ConfigProvider` accepts `maskBlur`, enabled by default. Use `maskBlur={false}` to disable background blur on dialog and drawer masks.
- Theme tokens for subtle text, raised surfaces, hover borders, smaller shadows and spring easing.
- Project-management and team-settings examples, an interactive accessibility workbench, and browser compatibility and design-standard guides.
- DTCG / Tokens Studio tokens, editable SVG resources, and a downloadable local Figma import plugin.

### Improved

- Consistent light and dark surfaces, borders, focus, state feedback and spacing; clearer Alert, Result, file-list and image-cropper presentation.
- JavaScript derives colors from the theme, with static default palettes. Component and documentation styles no longer require CSS `color-mix()`; nested themes and portals stay synchronized.
- Continuous selection indicators in Tabs and Segmented, smoother expansion and content-height changes, and motion that respects regional settings and system reduced-motion preferences.
- Modal uses 20px vertical padding and retains 24px horizontal padding, with aligned titles, forms and actions. Drawers no longer bounce after opening, and masks blur gradually.
- Refined layout, form, bottom-navigation and number-input examples, a wider documentation search entry, and refreshed home and example previews.

### Fixed

- Buttons no longer shift after pressing, releasing and leaving. Message icons and text no longer shake after appearing.
- Notification close buttons reserve space only in the title row, leaving body text and actions unaffected.
- Narrow-screen dialog and time-range overflow, disabled time-option handling, and stale asynchronous confirmation results affecting a reopened dialog.
- Improved nested-popup focus and keyboard behavior, and React 18 compatibility for inert attributes and refs.

### Usage notes

- Set colors through `ConfigProvider`'s `theme` / `tokens` to keep derived variables synchronized. Overriding only a base CSS color variable does not recompute all derived colors.
- Pass concrete colors for consistent SSR output. Colors using `var(...)` resolve and synchronize after browser mounting.
- The default density remains `comfortable`. Disable mask blur on performance-sensitive pages; `theme={{ motion: false }}` disables regional motion.
- `Slider` no longer shows standalone value text by default. Set `showValue` to retain that display; hover hints remain available through `tooltip`.
- Accessibility and compatibility guides distinguish automated checks from manual acceptance. Screen readers, physical devices and actual Figma imports still require manual verification.

## 0.3.0 - 2026-10-05

More layout, navigation, media and application components, refined uploads and image previews, and shared application-level feedback configuration.

### Added

- `Layout`, `Grid`, `Row`, `Col`, `Space`, `ScrollArea` and `Masonry` for page and content layouts.
- `Segmented`, `Menu` and `BackTop` for view switching, hierarchical navigation and returning to the top.
- `Descriptions`, `Image`, `ImagePreview`, `ImagePreviewGroup`, `QRCode`, `Timeline`, `VirtualList` and `OrgChart`.
- `Transfer`, `InputOTP`, `InputMask` and `TimeRangePicker`.
- `Notification`, `Popconfirm`, `ErrorBoundary`, `LoadingBar`, `InfiniteScroll` and `Sortable`.
- `Upload`, `FileList`, `ImageCropper` and `SignaturePad`. File lists show names, optional sizes, file-type icons, downloads, and image or video previews.
- Button groups and split buttons, input groups and search inputs, avatar groups, checkable tags and tag groups, checkbox groups, `FormGroup`, `FormList` and `FormErrorSummary`.

### Improved

- Menu submenus animate opening and closing, and sidebar widths transition when collapsed. Closed items are excluded from keyboard navigation, and transitions respect reduced-motion preferences.
- Image previews have refined toolbars, navigation and thumbnails. Crop regions support dragging and edge resizing in a square container by default.
- `ConfigProvider` hosts confirmations automatically. Components call `useConfirm()` directly; requests are queued and retain the calling region's theme and language.
- Select supports option groups and creating options. DatePicker supports year, quarter, month and week selection, plus custom disabled dates.
- Tree supports asynchronous loading and drag-and-drop moves. Tabs supports adding and closing tabs. Textarea supports automatic height and character counts.
- More documentation interactions use Leaf UI components. Installation is included in the quick-start guide, and overview thumbnails no longer open image previews.

### Fixed

- Image previews no longer jump when navigating between images.

### Migration notes

- `useConfirm()` and `useMessage()` no longer return or support `contextHolder`. Remove its destructuring and rendering, place one `ConfigProvider` at the application entry, and call `{ confirm }` or `{ message }` from child components.
- Without `ConfigProvider`, use `ConfirmProvider` or `MessageProvider` at the entry. Hooks report a clear error when their provider is missing.
- New components and their prop and data types are exported from `@sudden3/leaf-ui`. The stylesheet entry remains `@sudden3/leaf-ui/styles.css`.

## 0.2.0 - 2026-10-05

More everyday components, consistent theme configuration and simpler message usage.

### Added

- `ConfigProvider` for scoped themes, base sizes, appearance and Chinese / English configuration.
- `Form` and `FormField` with validation feedback, custom label widths and automatic alignment.
- Date-time and date-range pickers with multiple date granularities, manual input and time confirmation; 12-hour time selection.
- Steps, Breadcrumb, Pagination, Tabs, Tag, Badge, Avatar, Card, Collapse, Divider, InputNumber, Slider and Rate.
- Modal, Drawer, Confirm, Dropdown, Alert, Message, Result, Loading, Skeleton, Progress, Tooltip and Popover.
- Calendar, ColorPicker, Tree and TreeSelect.
- Bilingual documentation, theming and SSR guides, and a changelog.

### Improved

- `ConfigProvider` hosts messages automatically. `useMessage()` no longer requires rendering a `contextHolder`. Components share a queue while keeping their regional theme and language.
- `Select` supports multiple selection, search and custom popup widths. Its entire trigger area is clickable.
- Date ranges preview the hovered interval. Date panels support month and year navigation.
- `Input` supports password visibility controls, `Avatar` supports images and error fallbacks, and `Rate` supports colors based on the score.
- Fullscreen Calendar improves the presentation of dates, events and selection.
- Dialogs, popups and messages animate opening, closing and position changes. Panels have refined header, body and footer spacing.
- Component documentation includes linked type tables and clearer, grouped examples.

### Fixed

- Popup flickering after selection, overlapping option hover states, and poor text contrast on selected disabled calendar dates.

### Usage notes

- Use `ConfigProvider` to customize themes. CSS variables let application components reuse styles from their current region.
- Place a `ConfigProvider` or `MessageProvider` at the application entry, then call `useMessage()` in your components. Existing `contextHolder` usage remains compatible.
- `Result` supports empty, success, warning and other states. Existing `Empty` usage remains compatible.
- TimePicker accepts manual input. Selections in its popup are committed after confirmation; date-time and date-range pickers use the same interaction.

## 0.1.0 - 2026-10-03

Initial release.

- Button, Input, Textarea, Checkbox, Radio, RadioGroup and Switch.
- Select, DatePicker, TimePicker, AutoComplete and Cascader.
- Button icons, loading, disabled and danger states; controlled values, form submission and keyboard interaction for input and selection controls.
- A green default theme, consistent sizes, reusable style variables and scoped popup themes.
- React 18 / 19 support, TypeScript declarations, ESM, CommonJS and a standalone stylesheet.
