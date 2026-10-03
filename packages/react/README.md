# Leaf UI

A lightweight React component library with a green default theme, SCSS source styles and runtime CSS variable theming. Supports React 18 and 19.

## Usage

```tsx
import { Button, Input, Select } from '@leaf-ui/react';
import { Plus } from 'lucide-react';
import '@leaf-ui/react/styles.css';

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

Import the compiled stylesheet once in your application entry; consumers do not need Sass. JavaScript is available as ESM and CommonJS, with TypeScript declarations. The package is not yet published to npm.

## Components

- Button: four variants, icons, loading, disabled, full width and semantic red danger states. Defaults to type="button"; icon-only controls require an accessible label.
- Input: native input properties and ref, prefix/suffix, error/warning and composition-aware onPressEnter.
- Textarea: native multiline input, rows, maxLength, resize and validation states.
- Checkbox: native checked/defaultChecked, disabled, mixed state and form submission.
- Radio / RadioGroup: mutually exclusive native options, generated group names, keyboard navigation and controlled/default values.
- Switch: native checkbox with switch semantics, loading and keyboard/form support.
- Select: themed floating listbox, keyboard selection, clearable values, disabled options and form validation. onChange receives a string value and optional option.
- DatePicker: calendar with local Date values, inclusive day bounds, keyboard navigation and clearing.
- TimePicker: HH:mm values, hour/minute columns, configurable minute steps and clearing.
- AutoComplete: free text input, filtered or dynamic suggestions, composition-aware keyboard selection.
- Cascader: hierarchical options, full leaf paths, disabled branches and keyboard navigation.

Single-line controls share sm / md / lg sizes of **28 / 34 / 40px**. The default **34px** is the form alignment baseline. Checkbox, Radio and Switch use these values for the label container's minimum height.

## Theming

```css
:root {
  --leaf-color-primary: #20834a;
  --leaf-color-on-primary: #ffffff;
  --leaf-color-danger: #c83c3c;
  --leaf-control-height: 34px;
  --leaf-control-height-sm: 28px;
  --leaf-control-height-lg: 40px;
  --leaf-radius: 10px;
  --leaf-z-index-popup: 1000;
}
```

Override variables on any parent for a local theme. Hover, soft and focus colors use the current semantic color in that scope. The exported LeafThemeStyle type accepts inline --leaf-* variables. Use data-leaf-theme="dark" for dark neutral and semantic colors.

Floating panels inherit the trigger's scoped theme, render only while open, and follow scroll/resize while avoiding viewport edges. Click outside, move focus away or press Escape to dismiss. Portaled dialogs preserve the form's Tab order.

## Forms

All fields support name, form and required. DatePicker submits a local YYYY-MM-DD string, TimePicker submits HH:mm, and Cascader submits a JSON array string. Uncontrolled fields restore defaultValue on form reset; controlled fields require resetting application state. Select, DatePicker, TimePicker and Cascader forward a ref to their trigger button; AutoComplete forwards its native input. Provide a label or aria-label for every control.

## Icons

When importing icons in your app, add lucide-react as an app dependency (for example, pnpm add lucide-react). Leaf UI uses named imports from lucide-react for its internal icons. Import icons directly from lucide-react for button and input decoration; no private icon paths or runtime full-library icon loader is needed.
