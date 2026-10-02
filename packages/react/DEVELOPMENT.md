# 组件库开发

此文件面向源码贡献者，组件使用说明见 [README.md](README.md)。

## 本地开发

在仓库根目录运行：

```bash
pnpm install
pnpm dev
```

文档站直接引用组件源码，修改组件和 CSS 后会热更新。

## 添加组件

1. 在 `src/<component>/` 中添加实现、类型、样式和必要的行为测试。
2. 使用 `leaf-` 类名前缀和 `--leaf-*` CSS 变量，保留原生属性与合理的键盘行为。
3. 更新组件目录和 `src/index.ts` 的导出，在 `src/styles/index.css` 中引入组件样式。
4. 在 `apps/docs/src/components` 中添加交互示例，并使用 `ComponentExample` 在 MDX 中将预览和代码展示在一起。
5. 更新组件总览和组件侧边栏。

不要将开发说明放进在线组件使用文档中。

## 检查与打包

在仓库根目录运行：

```bash
pnpm check
pnpm build:lib
pnpm --dir packages/react pack
```

构建输出 ESM、CommonJS、独立 CSS 和类型声明。`check:package` 自动确认两种模块都可导出并渲染 Button、声明入口存在、样式包含主题与组件、React 未被打进包内。

本地安装包输出为 `packages/react/leaf-ui-react-0.1.0.tgz`，只包含 `dist`、`package.json` 和包 README。当前未发布到 npm。

整体架构见 [DEVELOPMENT.md](../../DEVELOPMENT.md)。
