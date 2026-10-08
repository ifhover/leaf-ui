---
pageType: doc-wide
sidebar: false
footer: false
---

# Changelog

Features, improvements and fixes included in each npm release.

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
