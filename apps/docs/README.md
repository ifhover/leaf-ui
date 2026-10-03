# Leaf UI 文档站

此目录使用 Rspress 编写 Leaf UI 的在线文档。在线内容只面向组件使用者；文档站运行、维护与仓库开发说明放在源码 Markdown 中。

## 运行环境

Node.js 22.22.2+ / 24.15.0+ 的受支持 LTS 版本，或 Node.js 26；pnpm 11，工作区固定使用 11.10.0。

在仓库根目录运行：

```bash
pnpm install
pnpm dev
```

打开 `http://127.0.0.1:3000`。文档直接引用 `packages/react/src`，组件和 SCSS 修改会热更新，不需要预先构建组件包。

## 构建与预览

```bash
pnpm build:docs
pnpm preview
```

静态产物位于 `apps/docs/doc_build`。`LEAF_DOCS_BASE` 控制部署路径，默认 `/`；GitHub Pages 使用 `/leaf-ui/`。自定义链接必须使用 withBase 并指向实际的 .html 文件，保证刷新和直接访问可用。

## GitHub Pages

在线站点：https://ifhover.github.io/leaf-ui/。仓库的 Pages 来源为 GitHub Actions，.github/workflows/pages.yml 在 main 推送或手动触发时检查源码、构建组件与文档，然后上传和部署静态产物。构建设置 `LEAF_DOCS_BASE=/leaf-ui/`，不需要提交 doc_build。

## 内容与导航

- `docs/guide/`：面向使用者的介绍、安装、快速开始、主题定制。
- `docs/components/`：组件总览与各组件的使用/API 文档。
- `src/components/`：首页、主题编辑器、交互示例与示例容器。
- `theme/`：Rspress 主题扩展和站点样式。

`rspress.config.ts` 按路径分别配置指南和组件侧边栏。添加组件时同时更新总览、组件侧边栏和对应 MDX 页面。

组件项的 text 使用实际导入名称，例如 DatePicker；tag 作为同一行的中文副标题，站点 SCSS 将其设置为更小、更浅的文字。不要在标题中拼接两种字号，或运行时修改 Rspress 的 DOM。

不要将文档站运行命令、发布构建流程或仓库开发指南放入 `docs` 目录；其中的 Markdown 会成为在线页面并进入搜索索引。

## 预览与代码模块

在 MDX 中使用 `ComponentExample`，将交互预览与源码包在同一个卡片内：

````mdx
import { ComponentExample } from '../../src/components/component-example';
import { MyExample } from '../../src/components/my-example';

<ComponentExample title="示例名称" preview={<MyExample />} fileName="example.tsx">

```tsx lineNumbers
import { Button } from '@sudden3/leaf-ui';

<Button>示例按钮</Button>
```

</ComponentExample>
````

预览节点单独放在 `preview` 属性中，子内容使用 MDX 代码围栏，可用 `file="../../src/examples/button/variants.tsx"` 直接引用实际预览源码，避免演示与代码脱节。语法高亮在构建时生成；示例容器负责折叠、复制完整源码和代码换行。

长代码默认折叠；短代码会完整展示。样式与行为定义在 `src/components/component-example.tsx` 和 `src/components/component-example.scss`。

仓库整体架构见 [DEVELOPMENT.md](../../DEVELOPMENT.md)，组件开发约定见 [packages/react/DEVELOPMENT.md](../../packages/react/DEVELOPMENT.md)。

## SCSS 与总览缩略图

站点样式和示例模块使用 .scss，Rspress 的 builderConfig 启用 pluginSass。源码样式入口别名指向组件库的 src/styles/index.scss，消费者的 CSS 入口保持不变。

总览位于 src/components/component-overview.tsx，采用静态 SVG 图片，资源保存在 docs/public/components。新增组件时更新卡片元数据和对应缩略图，无需在总览挂载交互组件。图标统一使用 lucide-react。

选择类组件缩略图由 scripts/generate-picker-thumbnails.mjs 生成，包含静态控件与浮层示意，并复用 Lucide 图标；在此目录运行 `node scripts/generate-picker-thumbnails.mjs` 可重建。
