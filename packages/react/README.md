# Leaf UI

A quiet, consistent React component library for tools and data-heavy interfaces, with ConfigProvider theming and reusable CSS variables. Supports React 18 and 19.

## Usage

```bash
npm install @ifhover/leaf-ui
```

[Documentation](https://ifhover.github.io/leaf-ui/) · [Changelog](https://ifhover.github.io/leaf-ui/en/changelog.html) · [Source](https://github.com/ifhover/leaf-ui) · [Issues](https://github.com/ifhover/leaf-ui/issues)

```tsx
import { Button, Input, Select } from '@ifhover/leaf-ui';
import { Plus } from 'lucide-react';

export function App() {
  return (
    <form>
      <Input name="title" aria-label="Project name" placeholder="Project name" />
      <Select name="team" aria-label="Team" options={[{ label: 'Design', value: 'design' }]} />
      <Button type="submit" startIcon={<Plus />}>Create project</Button>
    </form>
  );
}
```

Styles load automatically with components; consumers do not need manual CSS imports or Sass. JavaScript is available as ESM and CommonJS, with TypeScript declarations.

Browser component entries automatically load theme variables, shared popup styles and the required component and service styles. The optional `styles.css` entry remains available for existing integrations. Vite and Rsbuild / Rspack production builds retain styles for root ESM named imports and their internal dependencies on demand; component subpaths are optional. Direct esbuild bundles and CommonJS root imports do not guarantee CSS pruning; use subpaths such as `@ifhover/leaf-ui/button` in those cases. A full static stylesheet remains available at `@ifhover/leaf-ui/styles/all.css` for custom SSR pipelines.

## Components

- Button: solid, outlined and link appearances, plus icons, loading, disabled, full width and semantic red danger states. Defaults to the outlined appearance and type="button"; icon-only controls require an accessible label.
- Input: native input properties and ref, prefix/suffix, error/warning and composition-aware onPressEnter.
- Textarea: native multiline input, rows, maxLength, resize and validation states.
- Checkbox: native checked/defaultChecked, disabled, mixed state and form submission.
- Radio / RadioGroup: mutually exclusive native options, generated group names, keyboard navigation and controlled/default values.
- Switch: native checkbox with switch semantics, loading and keyboard/form support.
- Select: themed floating listbox, keyboard selection, clearable values, disabled options and form validation. onChange receives a string value and optional option.
- DatePicker: dates, times and date-times through picker; segmented input, shared time columns and clearing.
- AutoComplete: free text input, filtered or dynamic suggestions, composition-aware keyboard selection.
- Cascader: hierarchical options, full leaf paths, disabled branches and keyboard navigation.
- Form / FormField: native submission, labels, help, validation and shared automatic or fixed label widths.
- ConfigProvider: scoped themes, derived sizes, appearance, typography, motion and Chinese/English UI with nested inheritance.
- DateRangePicker: calendar, time and sequential date-time ranges through picker, with shared fields and panels.
- Dropdown: action menus with keyboard navigation, dividers and disabled or dangerous items.
- Modal / Confirm: dialogs, focus management, async confirmation and useConfirm.
- Alert: inline success, info, warning and danger feedback.
- Message / useMessage: transient feedback, loading and keyed updates.
- Layout / Grid / Row / Col / Space / ScrollArea / Masonry: page structure, responsive columns, spacing and scrolling.
- Tabs / Menu / BackTop: content and view switching, nested navigation and scroll-to-top.
- Descriptions / Timeline / QRCode: details, event histories, QR codes.
- Image / ImagePreview / ImagePreviewGroup: loading and error states, zoom, galleries, thumbnails and fullscreen.
- VirtualList / InfiniteScroll: measured virtual rows and abortable loading.
- DataTable: sorting, filtering, selection, grouping, pagination and virtualization through a TanStack Table instance. Import it from `@ifhover/leaf-ui/table`.
- Transfer / InputOTP / InputMask: transfers, code autofill/paste, formatted values and time ranges.
- Notification / useNotification / Popconfirm / ErrorBoundary / LoadingBar / useLoadingBar: scoped notifications, async confirmations, recovery and concurrent task progress.
- Upload / FileList: upload progress and cancellation, file metadata, downloads and browser media previews.

Existing families also include ButtonGroup, SplitButton, CheckboxGroup, AvatarGroup, CheckableTag, TagGroup, InputSearch, InputGroup, Textarea auto-sizing, FormList and FormErrorSummary. Select supports groups, creation and virtualization; DatePicker supports year/quarter/month/week; Tree and TreeSelect support async children and virtualization, and Tree and Tabs support reordering.

Single-line controls share sm / md / lg sizes of **28 / 34 / 40px**. The default **34px** is the form alignment baseline. Checkbox, Radio and Switch use these values for the label container's minimum height.

## Data tables

Use `DataTable` for tables. Install its optional peer with `npm install @tanstack/react-table`, create a table instance and pass it to the component:

```tsx
import { DataTable } from '@ifhover/leaf-ui/table';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';

const data = [{ id: 'leaf', name: 'Leaf UI' }];
const columns = [{ accessorKey: 'name', header: 'Name' }];

export function ProjectTable() {
  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
  });
  return <DataTable table={table} aria-label="Projects" pagination={false} />;
}
```

Tables use the same softened frame and downward resting shadow as Card by default. Set `bordered` for column dividers, or `striped={false}` for row dividers. `DataTable` and its helper components use the dedicated table entry; ordinary components do not require the optional table peer.

Migration: replace native `Table`, `Table.Header`, `Table.Body`, `Table.Row`, `Table.Cell` and related named exports with a `DataTable` instance and column definitions. Native Table regional defaults are removed; use `components.DataTable` for presentation defaults. The `theme.components.Table` visual tokens remain available. The former `@ifhover/leaf-ui/table/tanstack` path remains a compatibility alias for `DataTable`.

## Theming

Use ConfigProvider to customize a region. Start with primaryColor, borderRadius and controlHeight; smaller and larger sizes are generated automatically. Advanced overrides live in theme.tokens.

```tsx
import { ConfigProvider, Button } from '@ifhover/leaf-ui';

<ConfigProvider locale="en-US" theme={{ primaryColor: '#087f8c', borderRadius: 8, controlHeight: 36, appearance: 'light' }}>
  <Button>Save</Button>
</ConfigProvider>
```

Floating panels inherit the trigger's scoped theme, mount on opening and stay mounted through the closing animation. They follow scroll/resize while avoiding viewport edges. Click outside, move focus away or press Escape to dismiss. Portaled dialogs preserve the form's Tab order. Messages and confirmations follow the calling ConfigProvider region.

## Confirmations and messages

ConfigProvider manages messages and confirmations once at the application entry. Descendants call useMessage or useConfirm directly:

```tsx
import { Button, useMessage } from '@ifhover/leaf-ui';

export function SaveButton() {
  const { message } = useMessage();
  return <Button onClick={() => message.success('Saved')}>Save</Button>;
}
```

If you do not use ConfigProvider, wrap your application in MessageProvider instead. Components share one queue and can update a message using the same key. Use ConfirmProvider for a standalone confirmation scope.

```tsx
import { Button, useConfirm } from '@ifhover/leaf-ui';

export function DeleteButton({ onDelete }: { onDelete: () => void | Promise<void> }) {
  const { confirm } = useConfirm();
  return <Button danger onClick={async () => {
    if (await confirm({ title: 'Delete project', children: 'Continue?', type: 'danger' })) {
      await onDelete();
    }
  }}>Delete</Button>;
}
```

Custom components can read var(--leaf-color-primary), var(--leaf-radius), var(--leaf-control-height) and other shared variables inside the region. Use ConfigProvider to change library styles, and CSS variables to reuse the resulting values. See [theming](https://ifhover.github.io/leaf-ui/guide/theming.html).

## Tailwind CSS

For Tailwind CSS 4, add `@import "@ifhover/leaf-ui/tailwind.css";` after your Tailwind CSS import. For Tailwind CSS 3, add `require('@ifhover/leaf-ui/tailwind').default` to your configuration's `presets` array. Both provide `leaf-` utilities for colors, spacing, typography, radii, shadows and motion that follow the surrounding ConfigProvider. See the [Tailwind CSS guide](https://ifhover.github.io/leaf-ui/en/guide/tailwindcss.html).

## Server rendering

Framework builds load styles automatically. Use the same initial theme during server rendering and client hydration. See [Server-side rendering](https://ifhover.github.io/leaf-ui/en/guide/ssr.html) for Next.js App Router, Pages Router and TanStack Start.

## Forms

All fields support name, form and required. DatePicker submits a local YYYY-MM-DD string, DatePicker with picker="time" submits HH:mm (or HH:mm:ss when enabled), and Cascader submits a JSON array string. Uncontrolled fields restore defaultValue on form reset; controlled fields require resetting application state. Select, DatePicker, DateRangePicker and AutoComplete forward their input; Cascader forwards its trigger button. Multi-select values use repeated name entries in FormData. Provide a label or aria-label for every control.

Form keeps native onSubmit, onReset and FormData behavior. Wrap each control in FormField for labels and validation feedback. Horizontal labels default to 112px; set a numeric labelWidth on Form or FormField to adjust the width. DatePicker with picker="datetime" submits YYYY-MM-DD HH:mm (or HH:mm:ss with showSeconds); DateRangePicker submits a start/end string in the selected granularity.

## More components

Use Steps, Breadcrumb, Pagination and Tabs for navigation; Tag and Badge for classifications and notifications; Drawer, Loading, Progress and Tooltip for contextual feedback. Calendar supports compact and full layouts with custom schedule content. InputNumber handles numeric ranges, precision and stepping; Input with type="password" supports controlled visibility and custom toggle icons. See the [component overview](https://ifhover.github.io/leaf-ui/en/components/index.html) for examples and API details.

Avatar, Card, Collapse and Tree organize content; Divider separates it. Result presents success, warning, danger, information and empty states. The legacy Empty export remains compatible. TreeSelect chooses hierarchical values, and ColorPicker supports color formats, opacity and presets. Skeleton supplies loading placeholders, Popover offers nearby details or actions, and Slider and Rate collect numeric values and ratings. Select popups fit their content by default; popupWidth and popupMaxWidth customize the width. Input supports clear actions and character counts, Tabs supports closable items, and Progress can show indeterminate loading.

## Icons

When importing icons in your app, add lucide-react as an app dependency (for example, pnpm add lucide-react). Leaf UI uses named imports from lucide-react for its internal icons. Import icons directly from lucide-react for button and input decoration; no private icon paths or runtime full-library icon loader is needed.
