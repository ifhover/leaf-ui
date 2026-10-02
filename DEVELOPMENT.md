# Leaf UI 项目架构与开发

## 工作区

项目通过 pnpm workspace 管理两个包：

| 路径 | 包名 | 职责 |
| --- | --- | --- |
| `packages/react` | `@leaf-ui/react` | 组件、类型、样式、测试和发布产物 |
| `apps/docs` | `@leaf-ui/docs` | Rspress 文档、首页和交互示例 |

共享 TypeScript 严格模式与 Biome 规范放在仓库根目录。SCSS 由 Prettier 格式化，纳入 pnpm lint / pnpm format。

## 组件目录

```text
packages/react/src/
├── button/
│   ├── button.tsx
│   ├── button.scss
│   ├── button.test.tsx
│   └── index.ts
├── styles/
│   ├── tokens.scss
│   ├── _mixins.scss
│   └── index.scss
├── theme.ts
└── index.ts
```

每个组件独立存放实现、样式与测试。通过公共入口导出组件和类型，通过公共样式入口收集主题与组件样式。

## 本地开发链路

`pnpm dev` 启动 Rspress。文档构建器与 TypeScript 将 `@leaf-ui/react` 映射到组件源码，所以 JSX、类型与 SCSS 的修改都能直接反馈到示例中。

文档生产构建也读取同一份源码；单独的 `pnpm build:lib` 负责验证组件包的 ESM、CommonJS、CSS 和声明产物。

## 构建产物

```text
packages/react/dist/
├── esm/
│   ├── index.js
│   ├── index.css
│   └── index.d.ts
└── cjs/
    ├── index.cjs
    ├── index.css
    └── index.d.cts
```

React 与 Lucide 被 externalize，交给使用者的应用提供。`package.json` 中定义了模块、声明和样式的公开入口，并将 CSS 标记为 side effect，避免样式被 tree shaking 移除。

## 添加新组件

1. 建立 `src/<component>` 目录，定义原生属性与组件扩展属性。
2. 编写组件 SCSS，统一使用 `leaf-` 类名前缀和 `--leaf-*` 变量。
3. 更新组件目录与库入口的导出，并引入样式。
4. 添加必要的用户行为测试，覆盖键盘、禁用或表单等实际交互。
5. 在 `apps/docs/docs/components` 中添加 MDX 页面，在 `apps/docs/src/examples` 中添加预览源码。通过代码围栏的 `file` 属性复用同一份源码。
6. 更新 `apps/docs/rspress.config.ts` 中的组件侧边栏与组件总览，再执行 `pnpm check` 与 `pnpm build`。

## 打包本地安装包

```bash
pnpm build:lib
pnpm --dir packages/react pack
```

打包范围只包含 `dist` 与包 README。源码测试和文档不会进入 npm 包。当前版本尚未发布到 npm。

## 文档内容边界

在线文档只包含组件使用说明。文档站运行与维护说明见 [apps/docs/README.md](apps/docs/README.md)，组件开发流程见 [packages/react/DEVELOPMENT.md](packages/react/DEVELOPMENT.md)。

## 样式与图标

源码统一使用 SCSS，通过 @rsbuild/plugin-sass 构建。公共尺寸和样式 mixin 在 packages/react/src/styles；34px 是默认表单对齐基准。图标使用 lucide-react 的具名导入，具体约定见组件库开发文档。
