# Leaf UI

A lightweight React component library with a green default theme and CSS variable customization. Supports React 18 and 19.

## Usage

```tsx
import { Button } from '@leaf-ui/react';
import '@leaf-ui/react/styles.css';

export function App() {
  return <Button variant="solid" size="md">Get started</Button>;
}
```

Import the stylesheet once in your application entry. JavaScript is available as ESM and CommonJS, with TypeScript declarations.

## Button

- Variants: `solid` (default), `soft`, `outline`, `ghost`.
- Sizes: `sm`, `md` (default), `lg`.
- Supports `loading`, `disabled`, `fullWidth`, `startIcon` and `endIcon`.
- Passes through native button attributes and forwards the DOM ref.
- Defaults to `type="button"` to avoid unintended form submissions.
- Loading disables interaction and sets `aria-busy`; icon-only buttons need an `aria-label`.

## Theming

```css
:root {
  --leaf-color-primary: #20834a;
  --leaf-color-on-primary: #ffffff;
  --leaf-radius: 10px;
}
```

Variables can also be overridden on any parent element for a local theme. Derived hover and soft colors use the current primary color in that scope.

Use the exported `LeafThemeStyle` type to add `--leaf-*` custom properties to React inline styles.
