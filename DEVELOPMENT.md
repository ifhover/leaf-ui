# Leaf UI 项目架构与开发

本文说明项目结构与构建链路，不重复维护组件、颜色和发布细则。开始工作前按 [AGENTS.md](AGENTS.md) 选择必读规范；分支、版本、发布与预览清理以 [开发流程](DEVELOPMENT-WORKFLOW.md) 为准。

## 工作区

项目通过 pnpm workspace 管理两个包：

| 路径 | 包名 | 职责 |
| --- | --- | --- |
| `packages/react` | `@ifhover/leaf-ui` | 组件、类型、样式、测试和发布产物 |
| `apps/docs` | `@leaf-ui/docs` | Rspress 文档、首页和交互示例 |

共享 TypeScript 严格模式与 Biome 规范放在仓库根目录。SCSS 由 Prettier 格式化，纳入 pnpm lint / pnpm format。

## 组件目录

表单采用真实的 `form` 与字段上下文，控件独立管理值并保留 FormData / reset。水平标签使用确定的列宽，由 Form 统一配置，FormField 可单独覆盖，不依赖客户端测量。配置上下文只管理语言和区域主题，不建立字段值仓库。

浮层共用 FloatingPanel、presence 和区域 CSS 变量传递。关闭时保留节点至动画结束，并立即设为 inert。Modal 用 OverlayOwner 关联内部控件的 portal，保证焦点管理与嵌套浮层的 Escape 行为。

日期、区间和时间面板在 shared 与 timepicker 中复用；日期值使用本地时间，周使用 ISO 周编号。反馈图标继续来自 Lucide。

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

`pnpm dev` 启动 Rspress。文档构建器与 TypeScript 将 `@ifhover/leaf-ui` 映射到组件源码，所以 JSX、类型与 SCSS 的修改都能直接反馈到示例中。

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

React 是 peer dependency；Lucide 与其他运行依赖由包管理器安装，构建保留按需导入。`package.json` 中定义了根入口、组件子路径、ESM / CommonJS 声明与按组件样式入口，并将 CSS 标记为 side effect，避免样式被 tree shaking 移除。独立样式位于 `dist/esm/styles` 和 `dist/cjs/styles`，由构建脚本按视觉依赖生成。

## 添加新组件

完整步骤由 [组件编写与开发规则](packages/react/DEVELOPMENT.md#添加组件) 维护，覆盖实现、公开导出、独立样式、测试和双语示例。涉及颜色时先执行 [颜色接入流程](COLOR-SYSTEM.md#新增组件的用色流程)，不要从某个存量组件复制一套默认配色。示例与导航遵循 [文档站协作约定](apps/docs/AGENTS.md)，验证按 [当前验收规则](packages/react/QUALITY.md#当前验收规则) 选择。

## 打包本地安装包

```bash
pnpm build:lib
pnpm --dir packages/react pack
```

打包范围包含 `dist`、包 README 与第三方许可证说明。源码测试和文档不会进入 npm 包。

## 文档内容边界

在线文档只包含组件使用说明。文档站运行与维护说明见 [apps/docs/AGENTS.md](apps/docs/AGENTS.md)，组件开发流程见 [packages/react/DEVELOPMENT.md](packages/react/DEVELOPMENT.md)。

每次 npm 升版发布都需维护中英文更新记录，并同步部署版本快照。具体步骤见 [发布文档](packages/react/RELEASING.md)；`pnpm check:release` 会校验组件包当前版本的记录。`pnpm build:versions` 使用 npm gitHead 独立构建每个已发布版本，导航和 AI 查询均以快照版本为准。版本构建与 AI 文档契约见 [文档站维护说明](apps/docs/MAINTENANCE.md)，Skill 发行见 [skills/README.md](skills/README.md)。

## 样式与图标

组件库与文档站主题使用 SCSS，通过 @rsbuild/plugin-sass 构建；文档示例优先使用 Flex、Space、Grid、FormField 和 Text，不依赖 Tailwind CSS；示例规则见 [文档站协作约定](apps/docs/AGENTS.md)。站点界面现有的 Tailwind CSS 入口由 PostCSS 编译。公共尺寸和样式 mixin 在 packages/react/src/styles；34px 是默认表单对齐基准。图标使用 lucide-react 的具名导入，具体约定见组件库开发文档。

## 质量验收

PR 与 main 推送均运行组件检查、React 18 / 19 兼容矩阵和 Chromium / Firefox / WebKit 浏览器矩阵。交互、a11y、主题布局、大数据及生产体积的范围和证据说明见 [packages/react/QUALITY.md](packages/react/QUALITY.md)。
