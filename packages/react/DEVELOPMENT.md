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
2. 保留适用的原生属性、DOM ref、合理的键盘操作和表单提交行为。文本与勾选控件使用原生语义；下拉、日期、时间等浮层使用共享 FloatingPanel，不使用原生 select / date / time / datalist 面板。
3. 更新目录和 src/index.ts 的导出，在 src/styles/index.scss 中用 @use 引入样式。
4. 在 apps/docs/src/examples/<component>/ 添加示例，MDX 的 ComponentExample 与 file 围栏共同引用该源码。
5. 更新组件侧边栏和总览卡片，提供静态 SVG 缩略图，避免总览挂载全部组件实例。

在线文档只面向使用者，开发和构建说明保留在源码 Markdown 中。

## 尺寸与样式约定

**默认单行控件高度是 34px**。Button、Input、Select 及后续表单组件必须共用 --leaf-control-height；小、大尺寸共用 --leaf-control-height-sm / --leaf-control-height-lg（默认 28 / 40px）。不要在每个组件中重复建立不同的尺寸基准。

公共 SCSS mixin 位于 src/styles/_mixins.scss，提供 control-size、field、choice 和 focus-ring。主题色、危险色、圆角、尺寸及动效使用 --leaf-* CSS 变量，SCSS 负责样式复用与组织。组件状态的派生色在组件自身计算，确保局部主题继承正确。

对外主题配置统一经过 ConfigProvider 的 theme：常用配置只有 primaryColor、borderRadius、controlHeight、fontSize、fontFamily、appearance 和 motion；高级覆盖放在 LeafThemeTokens。src/theme.ts 使用纯函数合并配置并生成内联变量，服务端与客户端输出一致。新增 token 需维护映射、类型和中英 API；保持派生尺寸只需设置基础值，业务 CSS 只消费变量。

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

Rslib 与 Rspress 均通过 @rsbuild/plugin-sass 编译 SCSS。构建输出 ESM、CommonJS、独立 CSS 和类型声明，外部入口仍为 @sudden3/leaf-ui/styles.css。

check:package 确认每个组件的两种模块导出和服务端渲染、声明入口、34px 公共 token、编译后的样式及 React / Lucide 外部依赖。

## 自定义浮层与表单

src/shared/floating.tsx 基于 @floating-ui/react-dom 定位，按需 Portal 到 body，统一处理 offset、flip、shift、size、滚动和尺寸变化。仅打开时订阅定位与事件；复制触发节点的 --leaf-* 计算变量，并监听祖先主题属性，保证局部主题在 Portal 中一致。浮层层级由 --leaf-z-index-popup 控制。

usePopupState 处理禁用时收起和去重后的 onOpenChange。useFloatingDismiss 处理外部点击、焦点离开和 Escape；通过 tabbable 保持浮层前后与原表单一致的 Tab 顺序。列表组件保留输入 / 触发器焦点并使用 aria-activedescendant；日历和多列面板使用实际焦点与 roving tabIndex。

src/shared/field.tsx 统一受控 / 非受控值、ref 和原生 form reset。FormValue 使用不可交互的文本输入参与 FormData 与 required 校验，拦截原生校验提示并聚焦触发器。自定义选择组件 onChange 返回业务值，事件属性仍透传到触发按钮；清除值分别为 Select 空字符串、日期 / 时间 null、级联空数组。

DatePicker 使用本地年月日而非 UTC 序列化；TimePicker 支持分钟或秒精度，使用草稿并确认提交；Cascader 只在末级提交。SSR 不访问 document 或挂载浮层。新增浮层组件需覆盖键盘、焦点、禁用、表单 reset 和局部主题。

包产物包含 dist、package.json、使用说明及第三方许可证。整体架构见 [DEVELOPMENT.md](../../DEVELOPMENT.md)。

## 发布 npm

每次升版发布必须同步更新中英文更新记录。检查、发布和文档部署步骤见 [RELEASING.md](RELEASING.md)；`prepublishOnly` 会检查当前版本记录后再构建并验证包产物。

## 扩展组件的实现

布局与栅格使用 CSS。Masonry 使用多列布局，内容按列阅读；要求按行阅读或固定焦点顺序时使用 Grid。图片、裁剪与签名依赖见 [THIRD_PARTY.md](THIRD_PARTY.md)。只在需要时加载浏览器引擎，SSR 首屏输出稳定的占位内容。

Rslib 保留 ESM / CommonJS 模块结构，使组件可以摇树优化，懒加载模块不在服务端执行。源码入口及各输出文件保留 Next.js 客户端边界。

异步加载组件必须支持 AbortSignal 与卸载清理；InfiniteScroll 同一 dataLength 不会重复请求，失败时可重试，缺少 IntersectionObserver 时提供手动加载。Tree 的 key 必须稳定，异步子树在实例内缓存。更换整个数据源时可更换 Tree 的 React key 以重置缓存。虚拟列表通过 TanStack 测量实际行高，移动焦点时先滚动再聚焦。

Sortable / Tabs / Tree 通过 dnd-kit 提供键盘与触摸交互。拖动结果由调用方更新数组或树数据。签名是一种 Canvas 输入，应用应提供键盘可用的替代签署方法。Upload 提供校验与可取消请求，FileList 展示文件信息，只预览图片与音视频。

ConfigProvider 自动提供 Notification 与 LoadingBar 的作用域。操作通知无需 contextHolder，任务加载条通过各任务的完成函数管理并发，避免先结束的请求提前关闭加载条。不要在模块全局创建跨 SSR 请求共享的状态。
