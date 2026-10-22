# 组件编写与开发规则

此文件是新增、修改和重构组件时必须遵守的编写规则，面向源码贡献者。开发与发布同时遵守 [仓库流程](../../DEVELOPMENT-WORKFLOW.md)：用户未指定具体分支时，集中使用并复用以目标版本号命名的开发分支，不为每个需求新建分支。视觉和交互遵守 [设计标准](../../DESIGN-STANDARDS.md)；组件使用说明见 [README.md](README.md)。

## 本地开发

在仓库根目录运行：

```bash
pnpm install
pnpm dev
```

文档站直接引用组件源码，修改组件和 SCSS 后会热更新。

## 添加组件

1. 在 `src/<component>/` 中添加实现、类型、`.scss` 样式和必要的行为测试。优先复用现有共享能力，避免为单个组件另建主题、浮层或字段状态体系。
2. 保留适用的原生属性、DOM ref、合理的键盘操作和表单提交行为。文本与勾选控件使用原生语义；下拉、日期、时间等浮层使用共享 FloatingPanel，不使用原生 select / date / time / datalist 面板。
3. 显式维护组件目录和 `src/index.ts` 的公开导出，包含调用方需要组装数据的选项、值和事件类型；内部控件不属于公开 API。在 `src/styles/index.scss` 中用 `@use` 引入样式，并维护独立样式的依赖。
4. 在 `apps/docs/src/examples/<component>/` 添加示例，MDX 的 ComponentExample 与 file 围栏共同引用该源码；遵守 [文档站协作约定](../../apps/docs/AGENTS.md)。
5. 更新组件侧边栏和总览卡片，提供静态 SVG 缩略图，避免总览挂载全部组件实例。
6. 按影响完成类型、行为、样式产物及必要的浏览器验证，范围见 [QUALITY.md](QUALITY.md)。涉及公共 API 时同步中英文文档、API 表格及 AI 文档生成所需的元数据。

在线文档只面向使用者，开发和构建说明保留在源码 Markdown 中。

## 尺寸与样式约定

**默认单行控件高度是 34px**。Button、Input、Select 及后续表单组件必须共用 --leaf-control-height；小、大尺寸共用 --leaf-control-height-sm / --leaf-control-height-lg（默认 28 / 40px）。不要在每个组件中重复建立不同的尺寸基准。

公共 SCSS mixin 位于 src/styles/_mixins.scss，提供 control-size、field、choice 和 focus-ring。主题色、危险色、圆角、尺寸及动效使用 --leaf-* CSS 变量，SCSS 负责样式复用与组织。颜色遵守 [颜色系统规范](../../COLOR-SYSTEM.md)：组件优先使用共享语义角色与家族配方，派生公式集中维护并保证局部主题继承，不为组件自行增加近似比例色。

对外主题配置统一经过 ConfigProvider 的 theme：常用配置只有 primaryColor、borderRadius、controlHeight、fontSize、fontFamily、appearance 和 motion；高级覆盖放在 LeafThemeTokens。src/theme.ts 使用纯函数合并配置并生成内联变量，服务端与客户端输出一致。新增 token 需维护映射、类型和中英 API；保持派生尺寸只需设置基础值，业务 CSS 只消费变量。

主题风格的完整定义放在文档示例源码中，使用者复制普通 `LeafTheme` 数据或生成函数到项目中定制；组件包只提供公共主题能力。辅助表面、描边和阴影配色从当前主色派生，不依赖额外皮肤 CSS。默认风格不写覆盖，默认密度不显式设置；库自动派生的色阶不在示例中重复配置。显式 `tokens.borderColor` 同时提供统一外框色，组件级覆盖优先；无边框元素和语义状态保留原有行为。CSS color-mix / light-dark 配色在 SSR 中保留表达式，浏览器中解析后参与对比度和交互色计算。全局外框与阴影使用 `borderWidth`、`controlShadow`、`surfaceShadow`；组件状态只允许 `color`、`background`、`borderColor`、`shadow`，不改变交互几何。嵌套状态逐字段纯合并并忽略 undefined。新增状态消费者时同步主题变量参考中的支持范围，保证类名归一化与组件名一致；不能仅生成未消费的变量。较粗描边必须计入字段内部高度、选择标签、连接边及浮层内圆角计算。

Input 与 Select 聚焦或展开时共用主题色边框变体，无外圈；其他字段使用共享中性聚焦配方。普通状态的字段边框相同，校验状态保留语义色，显式组件状态覆盖优先。共享浮层的持久选中项默认使用灰底、正文色与勾选标记；导航和动作组件的语义覆盖按各自规则保留。Button 不添加点击波纹，默认使用描边外观；描边按钮带有一层轻微静止阴影，悬停时外观不变，按下时仅将边框加深为区域主题的 active 色，文字、背景和阴影保持不变；危险外观使用可读的危险文字色，静止边框使用危险基色，按下时边框加深为危险 active 色。显式组件状态覆盖优先；其他按钮外观悬停保持原样，按下时变色；危险链接按下保留可读文字色并显示下划线；键盘焦点使用中性轮廓，强制颜色模式保留可见焦点。

使用 leaf- 类名前缀。提供减少动态效果和强制颜色模式下的必要样式。组件样式不重置应用的全局元素。

## 交互动效

视觉与动效调整的覆盖记录见 [DESIGN-REFRESH.md](../../DESIGN-REFRESH.md)。基础时间为 200ms，快速与布局过渡从当前区域的 `--leaf-motion-duration` 派生。悬停、选中、展开和状态变化使用不同的反馈；拖动、输入与虚拟窗口位置保持即时响应。

CSS keyframe 使用 `animation: var(--leaf-motion-animation, leaf-name …)`；`motion: false` 将它设为 none，内层 `motion: true` 用 initial 恢复 fallback。不要用父区域的后代选择器强行关闭嵌套区域。系统减少动态效果始终优先，浮层同步全部 `--leaf-*` 变量。

测量动画复用 shared/motion.ts：普通有 key 的列表使用 useListMotion，虚拟列表关闭它。最多测量 200 项；缩放、响应式重排单独刷新布局基线。动画更新时先读当前位置、再取消旧动画、最后测量自然布局与写入新动画；卸载和偏好变化要取消动画。内容展开需要保留焦点与原生输入实例；结束后由自然布局接管，不保留 forwards keyframe。

## 图标与功能参考

图标采用 lucide-react，使用具名导入；禁止增加手绘图标路径集或运行时动态加载整套图标。装饰性图标对辅助技术隐藏，无文字的控件需要可访问名称。

基础功能参考 Ant Design 的 Input、Checkbox、Radio、Switch、Select 官方 API（github.com/ant-design/ant-design 的 components/<name>/index.en-US.md）。采用通用行为与成熟 API 思路，例如前后缀、校验状态、半选、受控值和组内互斥；实现保留 Leaf UI 的视觉、原生 HTML 语义与 SCSS 变量体系。本项目不包含 Ant Design 源码或运行依赖。

## 检查与打包

```bash
pnpm check
pnpm build:lib
pnpm --dir packages/react pack
```

Rslib 与 Rspress 均通过 @rsbuild/plugin-sass 编译 SCSS。构建输出 ESM、CommonJS、独立 CSS 和类型声明。浏览器组件入口自动加载样式，显式 CSS 入口继续保留。

check:package 确认每个组件的两种模块导出和服务端渲染、声明入口、34px 公共 token、编译后的样式及 React / Lucide 外部依赖。

## 自定义浮层与表单

src/shared/floating.tsx 基于 @floating-ui/react-dom 定位，按需 Portal 到 body，统一处理 offset、flip、shift、size、滚动和尺寸变化。仅打开时订阅定位与事件；复制触发节点的 --leaf-* 计算变量，并监听祖先主题属性，保证局部主题在 Portal 中一致。浮层层级由 --leaf-z-index-popup 控制。

usePopupState 处理禁用时收起和去重后的 onOpenChange。useFloatingDismiss 处理外部点击、焦点离开和 Escape；通过 tabbable 保持浮层前后与原表单一致的 Tab 顺序。列表组件保留输入 / 触发器焦点并使用 aria-activedescendant；日历和多列面板使用实际焦点与 roving tabIndex。

src/shared/field.tsx 统一受控 / 非受控值、ref 和原生 form reset。FormValue 使用不可交互的文本输入参与 FormData 与 required 校验，拦截原生校验提示并聚焦触发器。自定义选择组件 onChange 返回业务值，事件属性仍透传到触发按钮；清除值分别为 Select 空字符串、日期 / 时间 null、级联空数组。

DatePicker 使用本地年月日而非 UTC 序列化；显示与 onChange 的格式可以定制，FormData 始终使用标准格式。周起点由 ConfigProvider 控制，ISO 周编号保持独立。TimePicker 支持分钟或秒精度，使用草稿并确认提交；禁用时间同时应用于输入、选择和键盘导航。Cascader 默认选择末级，changeOnSelect 可选择中间层，并支持搜索、多选和懒加载。SSR 不访问 document 或挂载浮层。新增浮层组件需覆盖键盘、焦点、禁用、表单 reset 和局部主题。

公开 Calendar 的完整布局通过 `fullLayout` 与浮层面板区分。完整日期、月份和年份视图使用无边框网格，桌面分别为 7 / 4 / 3 列；选中态使用整格淡主题色背景和实心圆形日期标签，今天以主题色数字与圆点表达，不依赖描边。`cellRender` 位于日期下方并单行省略。紧凑日历保留 32px 无边框日期格，DatePicker、DateTimePicker 和 DateRangePicker 等浮层继续复用原紧凑 CalendarPanel，不套用完整布局标题。

包产物包含 dist、package.json、使用说明及第三方许可证。整体架构见 [DEVELOPMENT.md](../../DEVELOPMENT.md)。

### 自动样式入口

`build-browser-entries.mjs` 生成独立的浏览器 ESM / CommonJS 模块图，把共享基础 CSS 和组件 CSS 导入放在对应的 TSX 实现模块内；纯导出入口不导入整库 CSS。根入口与组件子路径共用这份模块图，保证组件身份和 React 上下文一致。Node 模块图保持无 CSS，源码映射同步调整路径与全部插入行。

根入口 ESM 具名导入的样式裁剪已在 Vite、Rspack 生产构建验证；不要把 CSS 放在纯 re-export 包装模块内，它们可能被优化绕过并丢失样式。`sideEffects` 只保留 CSS，未使用的组件实现和对应样式可一起裁剪。esbuild 会保留遍历到的 CSS，即使 JS 已裁剪；直接 esbuild 打包或 CommonJS 根入口仍推荐组件子路径，不能承诺所有构建器都支持根入口样式裁剪。`verify-browser-styles.mjs` 比较实际产物中的根入口、子路径、未使用导入、组合组件和服务样式，并纳入 `check:package`。

`styles/foundation.css` 在产物内部提供主题变量和公共浮层样式，由使用到的组件实现自动引入，同一个模块在构建时去重。服务组件的样式随各自实现加载，普通组件不会因此引入全部服务。应用无需手动导入 CSS；`styles.css` 保留为包含基础与 API 服务样式的兼容入口。`styles/all.css` 是完整静态入口；旧的 `<component>/style.css` 保留供显式管理 CSS 的构建使用。`browser` 导出条件选择带样式入口，Node 默认入口不导入 CSS，保持直接 SSR 可用。声明统一指向原组件，浏览器与 Node API 一致。

开发分支移除普通 List / ListItem 和 OrgChart，业务列表使用原生 HTML、Space 或 Grid 组合；VirtualList、FileList 和 FormList 保留。`styles.css` 从整库改为基础样式，自行管理 SSR CSS 的应用迁移到 `styles/all.css`。这些兼容性变化应纳入下一次正式发布的迁移说明。

## 发布 npm

每次升版发布必须同步更新中英文更新记录。检查、发布和文档部署步骤见 [RELEASING.md](RELEASING.md)；`prepublishOnly` 会检查当前版本记录后再构建并验证包产物。

开发分支将 Button 的公开 `ghost` 与 `soft` 外观移除，只保留 `solid`、`outline` 和 `link`，并以 `outline` 作为默认外观；次要操作直接使用默认描边按钮。SplitButton、FloatButton 与按钮属性插槽使用相同公共类型。复合组件内部的无边框功能控件仍由私有 ButtonControl 渲染，不开放到 Button 的公共 API。这项兼容性变化需纳入下次正式发布的迁移说明。

## 扩展组件的实现

布局与栅格使用 CSS。Masonry 使用多列布局，内容按列阅读；要求按行阅读或固定焦点顺序时使用 Grid。图片预览等复杂交互的依赖见 [THIRD_PARTY.md](THIRD_PARTY.md)。只在需要时加载浏览器引擎，SSR 首屏输出稳定的占位内容。

Rslib 保留 ESM / CommonJS 模块结构，使组件可以摇树优化，懒加载模块不在服务端执行。源码入口及各输出文件保留 Next.js 客户端边界。

异步加载组件必须支持 AbortSignal 与卸载清理；InfiniteScroll 同一 dataLength 不会重复请求，失败时可重试，缺少 IntersectionObserver 时提供手动加载。Tree、TreeSelect 和 Cascader 的 key 必须稳定，异步子树在实例内缓存。更换 data / options、loadData 或 cacheKey 时清除缓存，取消旧请求并隔离返回结果；调用方应稳定数据与加载函数的引用。Select 只缓存已选项的回显标签，不保留所有历史搜索结果。虚拟列表通过 TanStack 测量实际行高，移动焦点时先滚动再聚焦。

Tabs、Tree 与 DataTable 的排序能力通过 dnd-kit 提供键盘与触摸交互。拖动结果由调用方更新数组或树数据。Upload 提供校验与可取消请求，FileList 展示文件信息，只预览图片与音视频。

ConfigProvider 自动提供 Confirm、Message、Notification 与 LoadingBar 的作用域。useConfirm / useMessage 不返回 holder，独立使用需在入口放置相应 Provider。确认请求依次展示，调用区域卸载时取消待处理请求；任务加载条通过各任务的完成函数管理并发，避免先结束的请求提前关闭加载条。不要在模块全局创建跨 SSR 请求共享的状态。

Confirm 只公开 `useConfirm().confirm(options)`，不再导出受控 `Confirm` 与 `ConfirmProps`。配置使用 `ConfirmOptions`，正文只展示简短的操作说明；包含表单或多步骤的流程迁移到 Modal。移除独立 Sortable 组件及其样式子路径，Tabs / Tree / DataTable 自身的排序能力保持可用。这些是开发分支上的 API 迁移，正式发布时需要纳入迁移说明。

## 区域组件默认参数

开发分支移除 `LeafMessages` 类型与 ConfigProvider 的 `messages`、`textMessages` 参数。`locale` 接受 BCP 47 字符串或只读数组，第一项是当前语言，后续项按词条回退，最后使用内置英文。`translations` 接受按语言代码索引的纯 JSON，公共类型是 `LeafTranslation` / `LeafTranslations`；资源按语言和词条继承，显式语言链整体替换。业务文案由应用翻译；实例与 `components` 提供的文字仍优先。此兼容性变化需纳入下次正式发布的迁移说明。

### 翻译资源

英文、简体中文、日文和韩文的完整资源在 `src/locales/en-US.json`、`zh-CN.json`、`ja-JP.json`、`ko-KR.json`，繁体中文与 JSON Schema 由 `pnpm --filter @ifhover/leaf-ui generate:locale` 生成；构建检查资源是否同步。分组使用组件名的小驼峰形式，共享操作放在 `common`。新增内置可见文案、无障碍名称或读屏播报时必须同步全部内置语言资源，不再使用 `t('中文', 'English')` 或按语言代码判断文本。

静态词条使用 `useText()` 或区域 `messages`；有变量的完整句子使用 `useFormattedText()` 和 ICU 占位符，不拼接翻译片段。格式化器按组件作用域缓存，普通静态标签不引入 ICU；回退句子的复数规则使用来源语言，日期与数字控件仍使用链第一项。JSON 是文本，不执行函数或 HTML。时间选择器的自定义 AM / PM 标签也必须能被输入解析。

内部 `config-context.ts` 只定义 Context，不引用语言资源；只读取动效偏好的控件从这里消费配置，避免普通 Button 间接打包整份翻译。完整语言默认值仍由 `useLeafConfig()` 提供，不增加第二套全局状态或额外 Provider。

数组词条整体替换；只有缺失和 `undefined` 回退，空字符串保留。Provider 纯函数合并且不修改传入对象，不使用跨请求的可变注册表；主题变化不重新解析未变的资源。FloatingPanel 与 ScopedPortal 同步当前 `lang`。测试需覆盖部分翻译、内置覆盖、嵌套链替换、运行时切换、实例优先、Portal、服务组件与 SSR / hydration。包导出五种内置 JSON、Schema 和 `leaf-ui-check-translations` 检查命令；文档构建将同版本资源复制到版本根目录的 `locales/`。

ConfigProvider 的 `components` 支持全部公开 UI 组件、复合组件的公开部件和 Confirm API，公共类型为 `LeafComponentDefaults`。配置键与公开名称一致：DataTable.Root 使用 DataTable，其他命名空间部件使用 LayoutHeader、DataTableSearch 等名称；FAB / ResizablePanels 分别沿用 FloatButton / Splitter。表格只公开 DataTable，内部原生 TableControl 不接受公开默认配置；`theme.components.Table` 仍是表格的视觉令牌配置。ConfigProvider 及 Confirm / Message / Notification / LoadingBar 的 Provider 属于基础设施，不接受递归默认配置。以下规则适用于新增组件及已有实现的修改。

### 公开入口与合并语义

- 在公开组件入口调用 `useComponentProps`，先解析区域默认参数，再初始化受控 / 非受控状态、选择 Portal 容器以及建立 reset、事件和副作用逻辑。不能等到渲染内部控件时才补齐，否则组件状态与最终展示会不一致。
- 对同一组件配置项，优先级为实例参数、内层 Provider、外层 Provider、组件内置默认值。内置默认值仍由组件实现提供，不复制到 Provider。
- 只有 `undefined` 表示未提供；`false`、`0`、空字符串和类型允许的 `null` 都是有效实例值。禁止用 `||` 代替此合并语义。
- 按组件、按属性浅合并。对象、数组、`style`、`className` 和回调整体替换，不做深合并、类名拼接或事件串联。
- 合并是纯操作，不修改调用方的 props 或配置。没有有效覆盖时复用父配置及未变条目；实例无需补齐时复用原 props。

### 嵌套区域的清除

- `components={{ Input: null }}` 清除继承的 Input 默认参数；空对象与 `undefined` 继续继承。组件配置项的 `null` 表示清除，属性值中的 `null` 仍遵循该属性的类型和含义。
- 清除只影响指定的配置项，其他组件配置、主题、语言和密度保持不变；更内层 Provider 可以重新配置该项。
- InputSearch 同时使用自身与共享 Input 配置。需要完全恢复这两个来源时，使用 `components={{ Input: null, InputSearch: null }}`。
- 配置变化不能通过更换 key 或重挂载来生效，也不主动清空非受控值、丢失焦点或重置表单。更改 `defaultValue` 不应重新初始化已挂载的非受控控件；受控值变化正常同步，受控 / 非受控模式的切换由应用管理。

### 类型与公共 API

- 内部 `ComponentPropsMap` 将组件名与完整的公共 Props 绑定，`useComponentProps` 从名称推导参数和返回类型，保留 Select 等组件的判别联合。禁止改为可由调用方任意推断 Props 的泛型，或用宽泛字典、`any`、类型断言绕过名称与类型的对应关系。
- `LeafComponentDefaults` 从各组件公共 Props 派生，仅使用 `import type` 引用组件类型；运行时不能因配置类型引入整库组件。排除 `key`、`ref`、命令式引用类参数（如 Table 的 `scrollRef`、DataTable 的 `tableRef`）、JSX 必填项和会破坏模式与值关联的属性，不用 Provider 放宽 JSX 的必填契约。引用在实例上设置，避免多个组件争用同一个引用。
- 当前 Select 的 `options`、`multiple`、`value`、`defaultValue`、`onChange` 保留在实例；Modal 的 `open` 保留在实例。新增支持时逐项确认边界，不能只用 `Partial<Props>` 无差别开放所有字段。
- 同样检查其他判别联合：DatePicker 的单 / 多选、Slider 的单值 / 范围、Cascader / TreeSelect 的选择模式、InputNumber 的数字 / 十进制字符串模式均由实例决定，相关值、回调与边界参数不能从区域配置改变其类型。浮层必填的触发节点、数据、内容和可见状态继续由实例提供。
- 不把所有值与回调一律禁用。普通 Input 的 `value`、`defaultValue` 和 `onChange` 可以配置，但必须遵守正常的受控、非受控、事件及表单 reset 语义，并在使用文档说明。
- 泛型组件只开放与数据类型无关的参数：FormList 的行值 / 键 / 渲染、VirtualList 的项目 / 渲染 / 按项目测量函数、DataTable 的表实例 / 列 / 行回调留在实例。通过 `useGenericComponentDefaults` 获取明确的安全投影，再用组件自身完整的 `Props<T>` 合并，不能将业务类型强转为 `unknown` 或 `any` 来接入。VirtualList 的区域 `estimateSize` 只支持数字，实例仍可使用按项目计算的函数。
- 全局配置类型不能让可选适配器变成必装依赖。DataTable 的通用参数集中在不导入 TanStack 的 `tabletanstack/defaults.ts`，由实现和配置共同使用；新增可选适配器同样需要拆出与引擎无关的参数类型，并验证未安装可选依赖时的根入口类型检查。
- 类组件沿用原来的实例与 ref，使用 `contextType` 和纯合并函数解析默认参数；不要为了调用 Hook 包装或替换 ErrorBoundary 的公开类实例。需要比较配置变化时比较上次生效值，不能用当前配置重新解释旧 props。

### 内部控件与复合组件

- 没有内部复用需求的组件直接在函数入口解析默认参数，不为接入统一增加一层包装。确有组件内部复用时，再拆出不读取公开默认参数的内部控件；拆分时保留原来的 ref、组件身份与 API 默认值标注。
- 公开组件解析对应默认参数；组件内部的实现控件不自动读取其他公开组件的默认参数。内部实现使用 `ButtonControl`、`InputControl`、`TabsControl`、`TableControl`、`ModalBase` 等名称，从具体实现文件导入。禁止在根入口、组件子路径或通过 `export *` 意外公开这些内部实现。
- 内部控件的值、事件和操作约束由所属组件管理。隔离的只是公开组件默认参数，不能因此绕过既有主题、语言、密度、表单约束和无障碍行为。用户通过内容插槽传入的公开组件仍正常读取区域配置。
- 子路径入口优先使用显式导出；拆出内部控件时检查原有 `export *`，不能只检查根入口。Card 内嵌 Tabs、选项组内的勾选控件等都由所属组件显式传递参数，不自动继承独立 Tabs、Checkbox 或 Radio 的默认参数。
- 泛型内部组件同样需要隔离，例如 Transfer 内部的 VirtualList 不读取公开列表的方向、样式和估算配置。为此拆分内部控件时，公开和内部入口都保留泛型推断及 ref 契约，不能退化为宽泛的公共类型。
- InputSearch 的优先级为实例、自身 InputSearch 配置、共享 Input 配置、内置值。在外层完成这两类配置解析，统一拥有输入值、reset、搜索回调、按钮尺寸、禁用和 loading 约束；不能在内部 Input 再独立解析配置。
- SplitButton 在外层依次解析共享 Button、自身 SplitButton 与实例参数，两侧共享尺寸、variant、danger 与交互锁定状态。菜单按钮固定 `type="button"`，不复制主按钮的 `id`、`name`、`value`、提交属性和主操作回调；实例显式覆盖 loading 或 disabled 后，两侧必须保持一致。
- 上传操作、清除、搜索、翻页及弹窗操作等内部功能按钮默认使用 `type="button"`，不能被区域 `Button.type="submit"` 意外改为提交。定制内部操作通过所属组件公开参数完成，例如 Modal 的 `confirmButtonProps`；明确支持的 action props 仍可显式指定 submit。
- 解析默认参数后仍执行组件约束：Form 强制禁用不能被 `disabled={false}` 解除，loading 阻止重复操作，readOnly 锁定业务值。复合字段按需用 `FieldScope` 隔离内部搜索和操作控件，避免误用父字段的 id、required 或 FormData 名称。

公开入口与内部控件的分层可参考 [Button](src/button/button.tsx)，共享默认参数和状态归属可参考 [InputSearch](src/input/group.tsx) 与 [SplitButton](src/button/group.tsx)。不要让内部实现重新调用公开入口而隐式接入配置，也不要为了这项能力给全库增加 HOC、深合并或另一套状态管理。

### Context 与生命周期

默认参数使用独立的 `ComponentDefaultsContext`，不加入主题和语言的 ConfigContext；Provider 按输入引用缓存合并结果。配置适合低频区域约定，不提供按组件订阅，更新 Button 默认值仍可能使其他默认参数消费者重新渲染。没有实际测量证据时，不为此增加订阅存储。

配置对象按不可变数据处理：外部静态配置可以复用，动态配置更新时创建新对象，并按需使用 useMemo 稳定引用；不支持对原对象的深层原地修改进行监听。

Confirm、Message 和 Notification 在请求创建时读取调用区域的默认参数，保存本次合并选项；配置更新不能改变已有请求的操作选项、重启计时器或重复创建任务。服务正文中的公开组件继续继承调用区域当前的默认配置、主题和语言。LoadingBar 的 active / progress 由任务拥有，同一批并发任务使用首个任务的展示配置和主题，全部结束后下一批读取最新配置；独立 LoadingBarProvider 的显式参数优先于区域默认值。所有状态都必须隔离到 Provider / 请求，禁止在模块全局保存跨 SSR 请求共享的可变状态。

服务的主题传递容器不能占据普通文档流。即使尚未展示服务，也要验证 Provider 放进 Grid / Flex 不会插入空白格或间距；需要 DOM 祖先传递变量时使用不产生布局盒的容器。

### 新增或修改支持时的检查

1. 同步 `ComponentPropsMap`、`LeafComponentDefaults`、公开入口解析及公共类型导出，保持名称与 Props 对应；确认根入口、子路径和内部实现的导出边界。
2. 检查所属复合组件与所有内部使用方，明确哪些继承、哪些隔离、状态由谁持有。特别检查区域 Input 的只读 / 密码类型 / id、Button 的 submit / loading / disabled 是否误伤内部操作。
3. 按改动范围覆盖嵌套与实例优先级、有效空值、对象替换、`null` 清除、配置更新时的 DOM 身份 / ref / 焦点与非受控值，以及表单提交 / reset / FormData。保留缺少必填项、错误组件属性及判别联合的编译期反例，不为每个普通属性重复编写同构测试。
4. 涉及浮层、状态或模块依赖时，补充 SSR / hydration、局部主题与 Portal、内部操作和样式按需加载验证。具体运行范围见 [QUALITY.md](QUALITY.md)。
5. 同步中英文说明、可运行示例及 API / AI 文档。移动实现到内部控件后，保留清晰的 Props 类型标注，并检查 API 生成器仍能读取原有内置默认值，不能把区域覆盖写成内置默认值。

## 公共契约与生成资源

Form 的 disabled 是独立的上下文，内部控件不能用 disabled=false 覆盖它。FormField 的 required、id、labelId 与 error 只关联字段本身；CheckboxGroup、Transfer、Upload 等复合字段使用 FieldScope 隔离内部按钮、搜索框与选项，用整体值参与原生校验。readOnly 锁定业务值，inputReadOnly 只禁止键入。业务错误的代理字段聚焦需要转交给可见控件。

useFormValidation 不维护另一套字段数据仓库；接收原生 FormData、AbortSignal 与字段错误。应用自行对接 Schema、异步校验及服务端错误。noValidate 允许 Schema 接管原生校验；默认保留 reportValidity。高精度输入用 InputNumber stringMode，步长和边界也使用十进制字符串，不转换为 number。

浮层支持 popupPlacement / popupClassName / popupStyle / popupRender / getPopupContainer，自定义容器可为 ShadowRoot。嵌套浮层按层级处理 Escape，关闭动画内保持内容与位置稳定。焦点和外部点击判断使用 composed path 与深层 activeElement，避免 Shadow DOM 的事件重定向误判。

主题的 spacing、lineHeight、headingWeight、elevation、breakpoints 与 components 在 src/theme.ts 合并并产生内联变量。断点辅助函数 useBreakpoint 消费 breakpoints；Grid 的静态响应式 SCSS 使用固定阈值。新增组件级样式需消费对应 token，不能只生成未使用的变量。

中文、英文与繁体中文资源和生成流程位于 config-provider；新增文本时运行：

```bash
node packages/react/scripts/generate-locale.mjs
node apps/docs/scripts/sync-component-api.mjs
```

API 生成器读取 TypeScript 声明，保留文档中的说明和默认值，解析并链接公开的数据类型。`--from-ref=<git-ref>` 可从指定提交恢复人工说明。更新组件目录需要同步 component-metadata.mjs、component-catalog.ts、侧边栏和 SVG 预览；开发说明仍只放在源码 Markdown 中。

## 自动化质量检查

颜色角色、共享配方和新增变量准入以 [颜色系统规范](../../COLOR-SYSTEM.md) 为准。`pnpm check:colors` 阻止未经登记的颜色增长，`pnpm test:colors` 验证检查器；浏览器 `field-color-contract.spec.ts` 比较 Input / Select 最终用色。存量债务在 `COLOR-AUDIT.md`，不得通过扩充基线绕过审查。

验证范围、命令、兼容矩阵与体积基线见 [QUALITY.md](QUALITY.md)。新增子路径时维护 package.json、样式依赖图与 verify-package.mjs。独立样式入口 `<component>/style.css` 包含公共 tokens 和视觉依赖，禁止无关组件整库混入。build-component-styles.mjs 同时输出 ESM / CommonJS 样式。

## 设计资源与验收支持

`pnpm design:export` regenerates the documentation's DTCG/legacy tokens, editable SVG sheets and local Figma plugin from `colors.ts`, `color-recipes.ts` and `density.ts`. Validate with `pnpm --filter @ifhover/leaf-ui exec node scripts/verify-design-resources.mjs` and `node --check design/figma/code.js`. Static runtime palettes regenerate with `pnpm --filter @ifhover/leaf-ui generate:palette`; the library build rejects stale palettes.

`DESIGN-STANDARDS.md` defines state and geometry rules. `ACCESSIBILITY.md` records executed browser coverage and pending device/screen-reader acceptance. The public documentation includes a bilingual visual and interaction guide; detailed acceptance evidence stays in the repository. Automatic screenshot baseline comparison remains deferred.

开发分支移除独立 Segmented 及其类型、子路径和样式入口；统一使用 Tabs。迁移时将 `options` 改为 `items`、选项 `value` 改为 `key`、`value` / `defaultValue` 改为 `activeKey` / `defaultActiveKey`；`block` 保持等宽铺满。只切换视图时可省略 `TabItem.children`，不会产生空面板或内容留白。卡片标签使用无外层容器的浅灰圆角选中底，间距为 4px，未选中文字使用更淡的中性色；需要灰色外轨和白色移动滑块时使用 `type="segmented"`，其圆角由外轨圆角减去实际内边距与边框派生，滑块使用不回弹的标准缓动直接移动。线形标签仅在选中项下方显示居中的短圆角指示条。Tabs 只保留顶部与底部布局，不再支持左右纵向标签；溢出时以悬停或键盘聚焦后显示的两侧描边箭头代替更多菜单。Tabs 不作为表单字段提交；需要原生提交时由表单单独持有字段。这项兼容性变化需纳入下一次正式发布的迁移说明。
