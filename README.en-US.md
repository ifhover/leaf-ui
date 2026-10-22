<div align="center">
  <a href="https://ifhover.github.io/leaf-ui/en/">
    <img src="./apps/docs/docs/public/leaf.svg" alt="Leaf UI" width="112" height="112" />
  </a>

  <h1>Leaf UI</h1>

  <p><strong>Lightweight · Natural · Customizable</strong></p>
  <p>A React UI library with a green starting point and room for your own identity.</p>

  <p>
    <a href="https://www.npmjs.com/package/@ifhover/leaf-ui"><img src="https://img.shields.io/npm/v/@ifhover/leaf-ui?style=flat-square&amp;logo=npm&amp;logoColor=white&amp;color=1e964f" alt="npm version" /></a>
    <a href="https://www.npmjs.com/package/@ifhover/leaf-ui"><img src="https://img.shields.io/npm/dm/@ifhover/leaf-ui?style=flat-square&amp;logo=npm&amp;logoColor=white&amp;color=1e964f" alt="npm monthly downloads" /></a>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-18%20%7C%2019-149eca?style=flat-square&amp;logo=react&amp;logoColor=white" alt="React 18 and 19" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-Ready-3178c6?style=flat-square&amp;logo=typescript&amp;logoColor=white" alt="TypeScript support" /></a>
    <a href="https://github.com/ifhover/leaf-ui/actions/workflows/quality.yml"><img src="https://img.shields.io/github/actions/workflow/status/ifhover/leaf-ui/quality.yml?branch=main&amp;style=flat-square&amp;logo=githubactions&amp;logoColor=white&amp;label=CI" alt="Component quality check status" /></a>
  </p>

  <p>
    <a href="https://ifhover.github.io/leaf-ui/en/">Documentation</a> ·
    <a href="https://ifhover.github.io/leaf-ui/en/components/">Components</a> ·
    <a href="https://ifhover.github.io/leaf-ui/en/changelog.html">Changelog</a> ·
    <a href="https://github.com/ifhover/leaf-ui/issues">Report an issue</a>
  </p>

  <p><a href="./README.md">简体中文</a> · <strong>English</strong></p>
</div>

## ✨ Features

- 🍃 **A natural starting point** — A green default theme and clear interaction states, with components for inputs, forms, layout, navigation, and feedback.
- 🎨 **Make it yours** — Customize colors, radii, typography, control heights, and light or dark appearance through ConfigProvider, scoped themes, and CSS variables.
- 🛡️ **Built with TypeScript** — Includes type declarations and preserves native HTML attributes, DOM refs, and form semantics.
- 🌍 **Multiple languages** — Chinese and English documentation, built-in locales, custom translations, nested locale settings, and RTL direction.
- ⌨️ **Thoughtful interactions** — Keyboard navigation, focus management, and support for reduced motion preferences.
- 📦 **Fits your stack** — React 18 / 19, ESM, CommonJS, and SSR, with component styles retained on demand in supported production builds.

## 🖥️ Compatibility

Supports React **18 / 19**, modern browsers, and server-side rendering. We recommend the current or previous stable browser release.

| <img src="./apps/docs/docs/public/browsers/chrome.svg" alt="" width="28" height="28" /><br />Chrome | <img src="./apps/docs/docs/public/browsers/edge.svg" alt="" width="28" height="28" /><br />Edge | <img src="./apps/docs/docs/public/browsers/firefox.svg" alt="" width="28" height="28" /><br />Firefox | <img src="./apps/docs/docs/public/browsers/safari.svg" alt="" width="28" height="28" /><br />Safari |
| :-------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------: |
|                                                ≥ 109                                                |                                              ≥ 109                                              |                                                 ≥ 121                                                 |                                               ≥ 16.4                                                |

These are minimum support targets. See [browser compatibility](https://ifhover.github.io/leaf-ui/en/guide/compatibility.html) for test coverage and fallbacks, and the [SSR guide](https://ifhover.github.io/leaf-ui/en/guide/ssr.html) for Next.js and other frameworks.

## 📦 Installation

```bash
pnpm add @ifhover/leaf-ui
```

<details>
<summary>Using npm / Yarn / Bun</summary>

```bash
npm install @ifhover/leaf-ui
yarn add @ifhover/leaf-ui
bun add @ifhover/leaf-ui
```

</details>

Your application must provide `react` and `react-dom`. Compiled CSS is included; you do not need Sass.

## 🔨 Quick start

```tsx
import { Button, DatePicker } from '@ifhover/leaf-ui';

export default function App() {
  return (
    <>
      <DatePicker aria-label="Choose a date" />
      <Button>Get started</Button>
    </>
  );
}
```

Base styles and the required component and service styles load automatically, without manual CSS imports. Vite and Rsbuild / Rspack production builds retain styles on demand for named ESM imports from the root entry. For direct esbuild or CommonJS use, component subpaths such as `@ifhover/leaf-ui/button` are available. Custom SSR pipelines can use the full static stylesheet at `@ifhover/leaf-ui/styles/all.css`.

Single-line controls default to **36px**, with **30 / 42px** small and large sizes. Find more examples in [getting started](https://ifhover.github.io/leaf-ui/en/guide/getting-started.html).

## 🎨 Themes and locales

Use ConfigProvider to configure a theme and locale for your application or a specific region:

```tsx
import { ConfigProvider } from '@ifhover/leaf-ui';
import App from './App';

export default function Root() {
  return (
    <ConfigProvider locale="en-US" theme={{ primaryColor: '#1e964f', borderRadius: 8 }}>
      <App />
    </ConfigProvider>
  );
}
```

Set `locale` to `zh-CN` for Simplified Chinese, or set `theme.appearance` to `dark` for dark mode. Nested providers inherit unspecified options, and popups and messages follow the theme and locale of their region.

Explore [theming](https://ifhover.github.io/leaf-ui/en/guide/theming.html) · [ConfigProvider themes and locales](https://ifhover.github.io/leaf-ui/en/components/config-provider.html).

## 🤖 AI-assisted development

Install the Leaf UI Skill in your application directory so your AI assistant can look up component APIs for the version your project uses:

```bash
npx skills add ifhover/leaf-ui --skill leaf-ui
```

See [AI and Skills](https://ifhover.github.io/leaf-ui/en/guide/ai.html) for setup and usage. You can also switch between published versions at the top of the documentation site.

## 🤝 Contributing

Share bugs and ideas through [Issues](https://github.com/ifhover/leaf-ui/issues), or open a [Pull Request](https://github.com/ifhover/leaf-ui/pulls).

See the [development guide](./DEVELOPMENT.md) for local setup, project structure, and builds. Before changing components or user documentation, read the [development, versioning, and documentation workflow](./DEVELOPMENT-WORKFLOW.md).
