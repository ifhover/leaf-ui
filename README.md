<div align="center">
  <a href="https://ifhover.github.io/leaf-ui/">
    <img src="./apps/docs/docs/public/leaf.svg" alt="Leaf UI" width="112" height="112" />
  </a>

  <h1>Leaf UI</h1>

  <p><strong>轻盈 · 自然 · 可定制</strong></p>
  <p>一个以绿色为起点的 React UI 组件库，让界面保留你的个性。</p>

  <p>
    <a href="https://www.npmjs.com/package/@ifhover/leaf-ui"><img src="https://img.shields.io/npm/v/@ifhover/leaf-ui?style=flat-square&amp;logo=npm&amp;logoColor=white&amp;color=20834a" alt="npm 版本" /></a>
    <a href="https://www.npmjs.com/package/@ifhover/leaf-ui"><img src="https://img.shields.io/npm/dm/@ifhover/leaf-ui?style=flat-square&amp;logo=npm&amp;logoColor=white&amp;color=20834a" alt="npm 月下载量" /></a>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-18%20%7C%2019-149eca?style=flat-square&amp;logo=react&amp;logoColor=white" alt="React 18 和 19" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-Ready-3178c6?style=flat-square&amp;logo=typescript&amp;logoColor=white" alt="TypeScript 类型支持" /></a>
    <a href="https://github.com/ifhover/leaf-ui/actions/workflows/quality.yml"><img src="https://img.shields.io/github/actions/workflow/status/ifhover/leaf-ui/quality.yml?branch=main&amp;style=flat-square&amp;logo=githubactions&amp;logoColor=white&amp;label=CI" alt="组件质量检查状态" /></a>
  </p>

  <p>
    <a href="https://ifhover.github.io/leaf-ui/">在线文档</a> ·
    <a href="https://ifhover.github.io/leaf-ui/components/">组件总览</a> ·
    <a href="https://ifhover.github.io/leaf-ui/changelog.html">更新记录</a> ·
    <a href="https://github.com/ifhover/leaf-ui/issues">反馈问题</a>
  </p>

  <p><strong>简体中文</strong> · <a href="./README.en-US.md">English</a></p>
</div>

## ✨ 特性

- 🍃 **轻盈自然** — 绿色默认主题、清晰的交互状态，覆盖输入、表单、布局、导航与反馈。
- 🎨 **随心定制** — 通过 ConfigProvider 调整颜色、圆角、字体、控件高度和明暗外观，支持区域主题与 CSS 变量。
- 🛡️ **类型完备** — 使用 TypeScript 编写，提供类型声明，保留原生 HTML 属性、DOM ref 与表单语义。
- 🌍 **多语言** — 提供中英文文档，支持内置语言、自定义翻译、嵌套语言配置与 RTL 方向。
- ⌨️ **细致交互** — 支持键盘操作、焦点管理，以及系统的减少动态效果偏好。
- 📦 **融入工程** — 兼容 React 18 / 19，提供 ESM、CommonJS 和 SSR 用法，组件样式可随生产构建按需保留。

## 🖥️ 兼容性

支持 React **18 / 19**、现代浏览器与服务端渲染。推荐使用浏览器当前或上一代稳定版。

| <img src="./apps/docs/docs/public/browsers/chrome.svg" alt="" width="28" height="28" /><br />Chrome | <img src="./apps/docs/docs/public/browsers/edge.svg" alt="" width="28" height="28" /><br />Edge | <img src="./apps/docs/docs/public/browsers/firefox.svg" alt="" width="28" height="28" /><br />Firefox | <img src="./apps/docs/docs/public/browsers/safari.svg" alt="" width="28" height="28" /><br />Safari |
| :-------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------: |
|                                                ≥ 109                                                |                                              ≥ 109                                              |                                                 ≥ 121                                                 |                                               ≥ 16.4                                                |

以上为最低支持目标；各版本实测范围与功能降级见[浏览器兼容性](https://ifhover.github.io/leaf-ui/guide/compatibility.html)，Next.js 等框架的接入见 [服务端渲染](https://ifhover.github.io/leaf-ui/guide/ssr.html)。

## 📦 安装

```bash
pnpm add @ifhover/leaf-ui
```

<details>
<summary>使用 npm / Yarn / Bun</summary>

```bash
npm install @ifhover/leaf-ui
yarn add @ifhover/leaf-ui
bun add @ifhover/leaf-ui
```

</details>

需要在应用中安装 `react` 和 `react-dom`。组件提供编译后的 CSS，无需安装 Sass。

## 🔨 快速使用

```tsx
import { Button, DatePicker } from '@ifhover/leaf-ui';

export default function App() {
  return (
    <>
      <DatePicker aria-label="选择日期" />
      <Button>开始使用</Button>
    </>
  );
}
```

基础样式与所需的组件、服务样式会自动加载，无需手动导入 CSS。Vite、Rsbuild / Rspack 的生产构建支持根入口 ESM 具名导入的样式按需保留。直接使用 esbuild 或 CommonJS 时，可使用 `@ifhover/leaf-ui/button` 等子路径；自行管理 SSR 样式时可使用完整静态入口 `@ifhover/leaf-ui/styles/all.css`。

单行控件默认高度为 **36px**，小 / 大尺寸为 **30 / 42px**。更多示例见[安装与快速开始](https://ifhover.github.io/leaf-ui/guide/getting-started.html)。

## 🎨 主题与语言

使用 ConfigProvider 为应用或某个区域配置主题和语言：

```tsx
import { ConfigProvider } from '@ifhover/leaf-ui';
import App from './App';

export default function Root() {
  return (
    <ConfigProvider locale="zh-CN" theme={{ primaryColor: '#20834a', borderRadius: 8 }}>
      <App />
    </ConfigProvider>
  );
}
```

将 `locale` 改为 `en-US` 即可切换为英文；设置 `theme.appearance` 为 `dark` 可启用深色外观。嵌套配置继承未设置的选项，浮层和消息沿用所在区域的主题与语言。

了解[定制主题](https://ifhover.github.io/leaf-ui/guide/theming.html) · [ConfigProvider 主题与语言](https://ifhover.github.io/leaf-ui/components/config-provider.html)。

## 🤖 AI 辅助开发

在应用目录安装 Leaf UI Skill，让 AI 按项目实际使用的版本查询组件 API：

```bash
npx skills add ifhover/leaf-ui --skill leaf-ui
```

安装与使用见 [AI 与 Skills](https://ifhover.github.io/leaf-ui/guide/ai.html)。在线文档顶部也可切换已发布版本。

## 🤝 参与贡献

欢迎通过 [Issues](https://github.com/ifhover/leaf-ui/issues) 反馈问题与建议，或提交 [Pull Request](https://github.com/ifhover/leaf-ui/pulls)。

本地开发、项目结构与构建说明见 [开发文档](./DEVELOPMENT.md)；提交组件或使用文档改动前，请阅读 [开发、版本与文档同步流程](./DEVELOPMENT-WORKFLOW.md)。
