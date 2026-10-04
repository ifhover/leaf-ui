---
pageType: doc-wide
sidebar: false
footer: false
---

# Changelog

Features, improvements and fixes included in each npm release.

## Unreleased

These changes are not yet available on npm.

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
- `Result` supports empty, success, warning and other states. Existing `Empty` usage remains compatible.

## 0.1.0 - 2026-10-03

Initial release.

- Button, Input, Textarea, Checkbox, Radio, RadioGroup and Switch.
- Select, DatePicker, TimePicker, AutoComplete and Cascader.
- Button icons, loading, disabled and danger states; controlled values, form submission and keyboard interaction for input and selection controls.
- A green default theme, consistent sizes, reusable style variables and scoped popup themes.
- React 18 / 19 support, TypeScript declarations, ESM, CommonJS and a standalone stylesheet.
