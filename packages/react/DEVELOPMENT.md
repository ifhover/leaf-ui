# 组件库开发

此文件面向源码贡献者，组件使用说明见 [README.md](README.md)。

## 本地开发

在仓库根目录运行：

```bash
pnpm install
pnpm dev
```

文档站直接引用组件源码，修改组件和 SCSS 后会热更新。

## 添加组件

1. 在 src/<component>/ 中添加实现、类型、.scss 样式和必要的行为测试。
2. 保留原生属性、DOM ref、合理的键盘操作和表单提交行为，优先使用原生控件。
3. 更新目录和 src/index.ts 的导出，在 src/styles/index.scss 中用 @use 引入样式。
4. 在 apps/docs/src/examples/<component>/ 添加示例，MDX 的 ComponentExample 与 file 围栏共同引用该源码。
5. 更新组件侧边栏和总览卡片，提供静态 SVG 缩略图，避免总览挂载全部组件实例。

在线文档只面向使用者，开发和构建说明保留在源码 Markdown 中。

## 尺寸与样式约定

**默认单行控件高度是 34px**。Button、Input、Select 及后续表单组件必须共用 --leaf-control-height；小、大尺寸共用 --leaf-control-height-sm / --leaf-control-height-lg（默认 28 / 40px）。不要在每个组件中重复建立不同的尺寸基准。

公共 SCSS mixin 位于 src/styles/_mixins.scss，提供 control-size、field、choice 和 focus-ring。主题色、危险色、圆角、尺寸及动效使用 --leaf-* CSS 变量，SCSS 负责样式复用与组织。组件状态的派生色在组件自身计算，确保局部主题继承正确。

使用 leaf- 类名前缀。提供减少动态效果和强制颜色模式下的必要样式。组件样式不重置应用的全局元素。

## 图标与功能参考

图标采用 lucide-react，使用具名导入；禁止增加手绘图标路径集或运行时动态加载整套图标。装饰性图标对辅助技术隐藏，无文字的控件需要可访问名称。

基础功能参考 Ant Design 的 Input、Checkbox、Radio、Switch、Select 官方 API（github.com/ant-design/ant-design 的 components/<name>/index.en-US.md）。采用通用行为与成熟 API 思路，例如前后缀、校验状态、半选、受控值和组内互斥；实现保留 Leaf UI 的视觉、原生 HTML 语义与 SCSS 变量体系。本项目不包含 Ant Design 源码或运行依赖。

## 检查与打包

```bash
pnpm check
pnpm build:lib
pnpm --dir packages/react pack
```

Rslib 与 Rspress 均通过 @rsbuild/plugin-sass 编译 SCSS。构建输出 ESM、CommonJS、独立 CSS 和类型声明，外部入口仍为 @leaf-ui/react/styles.css。

check:package 确认每个组件的两种模块导出和服务端渲染、声明入口、34px 公共 token、编译后的样式及 React / Lucide 外部依赖。

本地包只包含 dist、package.json 和包 README。当前未发布到 npm。整体架构见 [DEVELOPMENT.md](../../DEVELOPMENT.md)。
