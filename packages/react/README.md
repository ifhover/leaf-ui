# Leaf UI

A lightweight React component library with a green default theme, ConfigProvider theming and reusable CSS variables. Supports React 18 and 19.

## Usage

```bash
npm install @sudden3/leaf-ui
```

[Documentation](https://ifhover.github.io/leaf-ui/) · [Source](https://github.com/ifhover/leaf-ui) · [Issues](https://github.com/ifhover/leaf-ui/issues)

```tsx
import { Button, Input, Select } from '@sudden3/leaf-ui';
import { Plus } from 'lucide-react';
import '@sudden3/leaf-ui/styles.css';

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

Import the compiled stylesheet once in your application entry; consumers do not need Sass. JavaScript is available as ESM and CommonJS, with TypeScript declarations.

## Components

- Button: four variants, icons, loading, disabled, full width and semantic red danger states. Defaults to type="button"; icon-only controls require an accessible label.
- Input: native input properties and ref, prefix/suffix, error/warning and composition-aware onPressEnter.
- Textarea: native multiline input, rows, maxLength, resize and validation states.
- Checkbox: native checked/defaultChecked, disabled, mixed state and form submission.
- Radio / RadioGroup: mutually exclusive native options, generated group names, keyboard navigation and controlled/default values.
- Switch: native checkbox with switch semantics, loading and keyboard/form support.
- Select: themed floating listbox, keyboard selection, clearable values, disabled options and form validation. onChange receives a string value and optional option.
- DatePicker: calendar with local Date values, inclusive day bounds, keyboard navigation and clearing.
- TimePicker: 12/24-hour clocks, optional seconds, configurable steps and clearing.
- AutoComplete: free text input, filtered or dynamic suggestions, composition-aware keyboard selection.
- Cascader: hierarchical options, full leaf paths, disabled branches and keyboard navigation.
- Form / FormField: native submission, labels, help, validation and shared automatic or fixed label widths.
- ConfigProvider: scoped themes, derived sizes, appearance, typography, motion and Chinese/English UI with nested inheritance.
- DateTimePicker: calendar and time selection, optional seconds, draft confirmation and bounds.
- DateRangePicker: year, month, ISO week, date and date-time ranges with hover previews and text input.
- Dropdown: action menus with keyboard navigation, dividers and disabled or dangerous items.
- Modal / Confirm: dialogs, focus management, async confirmation and useConfirm.
- Alert: inline success, info, warning and error feedback.
- Message / useMessage: transient feedback, loading and keyed updates.

Single-line controls share sm / md / lg sizes of **28 / 34 / 40px**. The default **34px** is the form alignment baseline. Checkbox, Radio and Switch use these values for the label container's minimum height.

## Theming

Use ConfigProvider to customize a region. Start with primaryColor, borderRadius and controlHeight; smaller and larger sizes are generated automatically. Advanced overrides live in theme.tokens.

```tsx
import { ConfigProvider, Button } from '@sudden3/leaf-ui';

<ConfigProvider locale="en-US" theme={{ primaryColor: '#087f8c', borderRadius: 8, controlHeight: 34, appearance: 'light' }}>
  <Button>Save</Button>
</ConfigProvider>
```

Floating panels inherit the trigger's scoped theme, mount on opening and stay mounted through the closing animation. They follow scroll/resize while avoiding viewport edges. Click outside, move focus away or press Escape to dismiss. Portaled dialogs preserve the form's Tab order. Place message and confirm context holders within the desired ConfigProvider region.

Custom components can read var(--leaf-color-primary), var(--leaf-radius), var(--leaf-control-height) and other shared variables inside the region. Use ConfigProvider to change library styles, and CSS variables to reuse the resulting values. See [theming](https://ifhover.github.io/leaf-ui/guide/theming.html).

## Server rendering

Import the static stylesheet in the framework's root entry and provide the same initial theme to server rendering and client hydration. React state can switch themes afterward without generating CSS at runtime. See [SSR usage](https://ifhover.github.io/leaf-ui/en/guide/ssr.html) for Next.js App Router, Pages Router and other React SSR frameworks.

## Forms

All fields support name, form and required. DatePicker submits a local YYYY-MM-DD string, TimePicker submits HH:mm (or HH:mm:ss when enabled), and Cascader submits a JSON array string. Uncontrolled fields restore defaultValue on form reset; controlled fields require resetting application state. Select, DatePicker, DateTimePicker, DateRangePicker, TimePicker and AutoComplete forward their input; Cascader forwards its trigger button. Multi-select values use repeated name entries in FormData. Provide a label or aria-label for every control.

Form keeps native onSubmit, onReset and FormData behavior. Wrap each control in FormField for labels and validation feedback. Use labelWidth="auto" to align all labels to the widest one, or pass a number for a fixed pixel width. DateTimePicker submits YYYY-MM-DD HH:mm:ss; DateRangePicker submits a start/end string in the selected granularity.

## More components

Use Steps, Breadcrumb, Pagination and Tabs for navigation; Tag and Badge for classifications and notifications; Drawer, Loading, Progress and Tooltip for contextual feedback. Calendar supports compact and full layouts with custom schedule content. InputNumber handles numeric ranges, precision and stepping; Input with type="password" supports controlled visibility and custom toggle icons. See the [component overview](https://ifhover.github.io/leaf-ui/en/components/index.html) for examples and API details.

Avatar, Card, Collapse and Empty organize content; Divider separates it. Skeleton supplies loading placeholders, Popover offers nearby details or actions, and Slider and Rate collect numeric values and ratings. Select popups fit their content by default; popupWidth and popupMaxWidth customize the width. Input supports clear actions and character counts, Tabs supports closable items, and Progress can show indeterminate loading.

## Icons

When importing icons in your app, add lucide-react as an app dependency (for example, pnpm add lucide-react). Leaf UI uses named imports from lucide-react for its internal icons. Import icons directly from lucide-react for button and input decoration; no private icon paths or runtime full-library icon loader is needed.
