---
pageType: doc-wide
sidebar: false
footer: false
---

# Changelog

Features, improvements and fixes included in each npm release.

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
