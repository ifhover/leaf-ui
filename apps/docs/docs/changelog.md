---
sidebar: placeholder
footer: false
---

# 更新记录

记录每个 npm 版本的新增功能、体验改进与问题修复。

## 0.8.0 - 2026-10-20

### 新增

- 新增独立的 `CardTitle` / `CardTitleProps`，可在卡片外复用 Card 的标题样式。`size` 控制视觉尺寸，`level` 控制 h1–h6 语义层级；支持原生属性、ref 和 `ConfigProvider.components.CardTitle` 区域默认参数。Card 内部标题继续跟随卡片尺寸。
- Statistic 新增 `animation`、`initialValue` 和 `duration`，默认从 0 开始进行 1000ms 数值动画，后续变化从当前显示值继续。支持自定义格式、加载结束后启动、区域动效速度与减少动态效果偏好；服务端输出目标值，辅助技术在动画期间读取目标值。Countdown 保持即时更新。
- Tag、CheckableTag 和 TagGroup 新增 `bold`，支持实例配置与区域默认参数，默认使用主题 `headingWeight` 加粗，设置 `bold={false}` 使用常规字重。

### 改进与修复

- DataTable 普通分组行展开与收起使用高度过渡，保留子行控件及其状态，并维护可见行的斑马纹位置。虚拟表格、大型表格及关闭动效时直接切换。
- 调整 DataTable 外观：默认无边框并开启斑马纹；无边框模式去除外框圆角和表头灰底，保留 2px 表头分割线；有边框模式显示圆角外框和列分隔线。斑马纹模式隐藏行间细线，普通行与条纹行悬停时均使用轻微主色反馈。
- Menu 仅为可导航的叶子项显示选中状态和 `aria-current`；父级菜单保持独立的展开反馈。统一横向、侧栏与折叠菜单的悬停和按下反馈，调整子菜单缩进、文字层级与行高。
- Card 标题默认使用主题标题字重；Tag 圆角跟随区域基础圆角。卡片式 Tabs 的浅色选中面使用白色，深色继续使用抬升表面。
- 同步中英文组件说明、示例、区域默认参数参考、包入口和 AI API 导出，表格文档统一使用 DataTable。

### 迁移说明

- 本次 `0.x` 次版本包含公共 API 和默认外观变化，升级前请检查以下项目。
- 移除公开的组合式 `Table`、`TableBody`、`TableCaption`、`TableCell`、`TableColumnHeader`、`TableEmpty`、`TableError`、`TableFooter`、`TableHeader`、`TableLoading`、`TableRow` 及其类型。使用 DataTable 的 `data + columns + rowKey` 模式，或传入自己的 TanStack Table 实例；仅需静态表格时可使用原生表格元素。
- `@ifhover/leaf-ui/table` 现在导出 DataTable 及其组合部件和类型；使用前安装 `@tanstack/react-table@^8.21.3`。原有 `@ifhover/leaf-ui/table/tanstack` 入口继续可用。DataTable 不从根入口导出；`@ifhover/leaf-ui/table/style.css` 现在提供 DataTable 样式。
- 将 `TableRowProps` / `TableCellProps` 替换为从表格子路径导入的 `DataTableRowProps` / `DataTableCellProps`，分别用于 `getRowProps` / `getCellProps`。移除 `ConfigProvider.components` 中的全部 `Table*` 默认参数；表格展示参数改用 `components.DataTable`，行与单元格属性通过相应回调设置。
- DataTable 的 `striped` 默认值由 `false` 改为 `true`；设置 `striped={false}` 关闭斑马纹并显示行间细线。Statistic 默认执行数值动画，设置 `animation={false}` 或 `duration={0}` 立即展示目标值。Tag 默认加粗且采用基础圆角（默认 10px）；设置 `bold={false}` 使用常规字重，圆角可通过 `theme.components.Tag.borderRadius` 显式配置。

## 0.7.0 - 2026-10-19

### 新增

- Form 新增 `layout="settings"`：左侧显示标签与说明，右侧控件保持自然宽度，字段之间显示分隔线，窄屏自动上下排列。FormField 新增独立的 `description` 和 `layout`，可用 `layout="vertical"` 为文本域等宽控件保留整行空间；说明与帮助 / 错误分别关联到控件。
- 新增 `MenuGroup` / `MenuGroupProps`，可为菜单或自定义侧栏内容提供带可访问名称的标题分组，支持区域默认参数、原生属性与 ref。Menu 的数据分组支持 ReactNode 标题，方向键跨组导航并跳过禁用项。
- 主题新增全局 `borderWidth`、`controlShadow`、`surfaceShadow`，以及组件描边宽度和 `hover` / `active` / `focus` / `disabled` 状态的文字、背景、描边与阴影覆盖。嵌套状态按字段合并，焦点轮廓继续保留。
- Tabs 新增 `block`，支持标签等宽铺满；`TabItem.children` 变为可选，省略时只显示标签栏。AutoComplete、Cascader、Mentions 新增 `popupWidth` / `popupMaxWidth`，与 Select、TreeSelect 共用等宽、内容宽度及指定宽度规则。

### 改进与修复

- 重整横向 Menu 与折叠侧栏的导航浮层，统一标题、分组、分隔线和选中反馈。折叠侧栏向侧面展开，空间不足时回退到下方；支持 RTL，当前页面与父级保持高亮，修复分组内子菜单的方向键进入与返回。
- 深色主题保留显式主色的实心填充，按用途派生可读的文字、选中指示、焦点与必要边界；实心主色上的文字自动选择黑白色。修复 CSS 颜色表达式解析后选中表面和标签底色变黑的问题，嵌套主题与浮层同步更新。
- 全局描边、控件阴影及内容面阴影统一作用于相关组件，粗描边计入控件和浮层几何。修复 Portal 中默认主题重置后重新继承外层阴影，以及悬停状态遮盖按下反馈的问题。
- 将更多内部滚动区域接入 Scrollbar，包括 Tabs、Tree、VirtualList、Textarea、侧栏、抽屉和命令面板等；保留原有语义、焦点及原生文本域的选择与缩放行为。
- 卡片式 Tabs 使用统一的 3px 内边距和间距、灰底与浮起选中块，按下保持尺寸。柔和按钮使用中性浅底，危险状态使用淡红底和红色文字；改善 Steps 连线、Avatar 单圈边缘及 Table 表头分隔与行悬停层次。
- 更新双语文档导航、搜索和窄屏抽屉，改善语言切换后的页面与锚点保留、源码展开及复制体验。主题指南提供默认、插画、Windows XP、Material 和拟物五种可复制配置，设计 token 与 Figma 资源同步更新。

### 迁移说明

- 本次 `0.x` 次版本包含 API 与默认外观变化，升级前请检查以下项目。
- 移除 Segmented、`SegmentedProps`、`SegmentedOption` 及相关组件 / 样式子路径，改用 `Tabs type="card"`。将 `options` 改为 `items`、选项 `value` 改为 `key`、`value` / `defaultValue` 改为 `activeKey` / `defaultActiveKey`；`block` 继续用于等宽铺满。Tabs 不提交表单字段，需要原生表单提交时由应用单独维护对应字段。
- Button 移除 `variant="ghost"`，改用 `variant="soft"`；Button 的区域默认参数和相关外观类型同步调整。Pagination 等组件自己的 `ghost` 外观仍可使用。
- Select 与 TreeSelect 的浮层默认改为与控件等宽，`popupMaxWidth` 不再默认限制为 420px。需要按内容定宽时设置 `popupWidth="auto"`，此时浮层可以比控件窄；需要最大宽度时显式设置 `popupMaxWidth`，所有模式仍受视口限制。

## 0.6.0 - 2026-10-16

### 新增

- `ConfigProvider.components` 为公开组件、复合组件部件及 Confirm API 提供区域默认参数。实例优先于内层、外层配置；`undefined` 继承，组件配置项的 `null` 清除继承。配置更新保留非受控值、DOM、焦点与表单语义。
- 多语言配置支持 BCP 47 语言代码、显式回退链和自定义 `translations` JSON，内置简体中文、繁体中文、英文、日文与韩文。动态文案支持 ICU 变量与复数，提供翻译类型、JSON Schema、五种语言资源及 `leaf-ui-check-translations` 检查命令。
- 新增 `Flex` 布局组件，以及 Tailwind CSS 3 preset `@ifhover/leaf-ui/tailwind` 和 Tailwind CSS 4 主题入口 `@ifhover/leaf-ui/tailwind.css`，复用区域颜色、尺寸、间距与动效变量。
- Card 新增大尺寸和内嵌 `tabs`；FileList 提供文本、图片列表和图片卡片布局；Pagination 新增 `outline` / `ghost` 外观，`showTotal` 支持直接显示本地化总数。

### 改进与修复

- 默认控件高度统一为 36px，小、大尺寸为 30px / 42px，紧凑密度以 30px 为基准；表单、日期时间面板、虚拟列表估算和卡片式 Tabs 同步尺寸规则。
- 浏览器入口自动加载共享基础样式与使用到的组件样式，无需手动导入 CSS；保留不加载 CSS 的 Node 入口与完整静态样式入口，并完善 Next.js、TanStack Start 与服务端渲染说明。
- 统一选择器的中性候选背景、多选标签换行与折叠、菜单和 Tab 圆角、卡片层次、无边框标签及分页反馈。Tabs 内容立即切换，选中指示器保留移动动效。
- 修复 FormField 校验后首次输入丢失、Tabs 选中文字未跟随主题色、TreeSelect 展开状态与选项点击、选择器重开光标和窄屏多选布局等问题。
- 修复分页快速跳转与点击其他分页操作相互覆盖、页码和每页条数重复回调的问题；内部按钮与输入控件不再被其他公开组件的区域默认参数误改为提交、只读或禁用。
- 重整中英文介绍、快速开始、主题、多语言、API 参考与基础示例；新增组件筛选、主题配色和包管理器偏好记忆，改善桌面、窄屏、深色外观与源码展开体验。

### 迁移说明

- 本次 `0.x` 次版本包含 API 与默认外观变化，升级前请检查以下项目。
- 移除 `ConfigProvider.messages`、`textMessages` 和 `LeafMessages` 类型，改用按语言代码组织的 `translations` 及 `LeafTranslation` / `LeafTranslations`。语言回退需要在 `locale` 数组中显式列出，最终回退到内置英文。
- 移除 `ImageCropper`、`SignaturePad`、相关类型及组件与样式子路径。需要图片裁剪或签名时，在应用中接入相应专用依赖。
- Card 移除 `hoverable`；Tag 移除 `variant="outline"`，改用默认的 `soft` 或 `solid`。Pagination 默认使用带边框的按钮，原来的无边框外观可设置 `variant="ghost"`。
- 如需保留 0.5.0 的基础控件高度，在 `ConfigProvider` 中设置 `theme={{ controlHeight: 40 }}`；需要自行管理 SSR 样式时继续使用 `@ifhover/leaf-ui/styles/all.css`。

## 0.5.0 - 2026-10-12

### 新增

- npm 包迁移为 `@ifhover/leaf-ui`，与 GitHub 维护账号统一。旧包的历史版本与文档快照继续保留，版本菜单和 AI Skill 按实际安装的包名与版本查询文档。
- 新增 `Table` 组合式表格和可选的 `DataTable` 适配器，支持排序、筛选、选择、分页、固定列、列宽调整、分组、展开、编辑、虚拟行及行列排序。适配器从 `@ifhover/leaf-ui/table/tanstack` 导入，需要单独安装 `@tanstack/react-table`。
- 新增 `Scrollbar`，提供不占用内容宽度的悬浮滚动条、拖动与键盘控制；Table、Modal、Cascader 和 ScrollArea 共用该实现。
- Button 新增 `variant="link"`；Checkbox、Radio 及其分组新增卡片和列表外观，支持说明、图标与补充内容。Card、Modal 和 Drawer 新增副标题与分区配置。
- Progress 新增默认开启的 `active` 流光效果，仅在未完成的线形进度范围内播放，支持关闭和减少动态效果。

### 改进与修复

- 统一控件默认高度为 40px，小、大尺寸为 34px / 46px；按钮内边距随高度派生，下拉选项与表单间距同步调整。内容卡片采用平整表面和基础圆角，弹窗保留更大的外层圆角。
- 按钮点击改为外缘波纹，悬停与按下平滑变色；文字和链接按钮不显示波纹。统一明亮警告色、弹窗分区、紧凑页脚、Confirm 正文图标以及 Alert 与 Result 的对齐。
- 根入口 ESM 具名导入支持随组件加载所需样式，已验证 Vite 与 Rspack 生产构建；根入口和子路径共用组件及上下文，Node 默认入口保持无 CSS 的服务端渲染。
- 修复下拉选中与悬停背景切换、级联展开短暂溢出、角标错位和偏外、表格窄容器滚动与页面滚动衔接等问题；表格默认固定表头，限制高度时在表体内滚动。
- 重整双语文档、首页、侧栏和示例布局；代码示例只展示当前演示所需源码，移除文档专用语言参数，展开与收起增加短过渡和渐变遮罩。快速开始合并安装与基础用法。

### 升级说明

- 安装 `@ifhover/leaf-ui`，将应用中的 `@sudden3/leaf-ui` 导入改为新包名，包括 CSS 路径。首次新作用域版本为 0.5.0，旧作用域停留在 0.4.2。
- 在应用入口导入一次 `@ifhover/leaf-ui/styles.css`，提供主题、公共浮层和 Confirm / Message / Notification / LoadingBar 服务样式；此入口不再包含整库 CSS。需要完整静态样式时使用 `@ifhover/leaf-ui/styles/all.css`。CommonJS 或不能裁剪根入口 CSS 的构建器仍可使用组件子路径。
- Button 移除 `soft` 外观，改用 `outline`；需要保留较矮的控件可通过 `ConfigProvider` 设置 `theme.controlHeight`。
- Confirm 仅保留 `useConfirm().confirm(options)` 调用，移除受控 `Confirm` 组件与 `ConfirmProps`，不再继承 Modal 的完整配置。需要复杂正文、自定义页脚或受控显示时使用 Modal；危险确认通过 `type="danger"` 设置。
- 移除独立的 `Sortable`、`List` / `ListItem` 和 `OrgChart`，以及相关类型和子路径。列表展示使用原生布局；Tabs、Tree 和 DataTable 自身的排序能力保留。

## 0.4.2 - 2026-10-08

### 修复

- 统一紧贴容器的嵌套圆角：Select、AutoComplete、Mentions、Dropdown 等浮层选项根据外框圆角、内边距和边框自动计算内部圆角；默认选项从 6px 调整为 9px，使内外轮廓更协调。
- 同步菜单、卡片式 Tabs、Segmented、ColorPicker 格式切换及移动高亮背景的圆角；Cascader、TreeSelect 和 TimePicker 计入实际额外留白，独立控件保留各自的语义圆角。
- 修复 Dropdown 自定义内边距后高亮背景与选项边缘错位的问题，支持不等距内边距、RTL、直角主题、嵌套主题与浮层打开时的动态主题更新。

### 主题配置

- 可通过 `theme.components.Floating` 的 `borderRadius` 和 `padding` 统一调整浮层，`Dropdown` 的局部配置优先；组件内边距支持数字、CSS 长度和 1–4 值简写。已有组件属性保持兼容，无需修改业务调用。

## 0.4.1 - 2026-10-07

### 修复

- 恢复 `Button` 以中心为原点的轻微按压缩放，适用于各外观、按钮组和应用导航中的按钮；松开或移出后平滑恢复，不再产生额外位移。
- 禁用和加载状态不缩放；区域关闭动效、嵌套恢复动效、浮层与系统减少动态效果设置保持一致。

## 0.4.0 - 2026-10-07

统一组件视觉与交互，新增全局密度配置，改善主题色兼容性，并补充完整业务示例、设计资源与可访问性指南。

### 新增

- `ConfigProvider` 新增 `density="comfortable" | "compact"`，支持嵌套继承与覆盖，浮层沿用所在区域的密度；显式组件尺寸和主题尺寸优先。
- `ConfigProvider` 新增 `maskBlur`，默认开启，可通过 `maskBlur={false}` 关闭弹窗、抽屉等遮罩的背景模糊。
- 新增弱化文字、抬升表面、悬停边框、轻阴影和弹性曲线等主题 token。
- 文档新增项目管理与团队设置业务示例、可访问性交互工作台、浏览器兼容性和设计规范指南。
- 提供 DTCG / Tokens Studio 设计 token、可编辑 SVG 资源，以及本地 Figma 导入插件与下载包。

### 改进

- 统一浅色与深色表面、边框、焦点、状态反馈和间距；优化 Alert、Result、文件列表、图片裁剪等组件的视觉层次。
- 使用 JavaScript 根据主题色生成派生颜色，提供静态默认色板，组件和文档样式不再依赖 CSS `color-mix()`；嵌套主题和 portal 保持同步。
- 标签页与分段选择器的指示器连续移动，折叠结构与内容高度变化更平滑；动效支持区域配置和系统减少动态效果偏好。
- 弹窗默认上下内边距调整为 20px，左右保留 24px，优化标题、表单、内容与操作按钮的间距和对齐；抽屉打开后不再回弹，遮罩背景逐渐模糊。
- 更新布局、表单、底部导航和数字输入框示例，扩大文档搜索入口，重整首页与示例预览。

### 修复

- 修复按钮按下、松开并移出时位移，以及消息图标和文字弹出后抖动的问题。
- 通知关闭按钮只占用标题行，不再挤压正文和操作区。
- 修复窄屏弹窗与时间区间布局溢出、禁用时间选项处理，以及快速关闭重开弹窗时旧异步确认结果影响新状态的问题。
- 改善嵌套浮层的焦点和键盘操作，并修复 React 18 的 inert 属性与 ref 兼容性。

### 使用提醒

- 推荐通过 `ConfigProvider` 的 `theme` / `tokens` 修改颜色，以同步更新派生变量；仅覆盖基础 CSS 颜色变量不会自动重算所有派生色。
- 需要一致的 SSR 首屏时请传入具体颜色；`var(...)` 颜色在浏览器挂载后解析并同步。
- 默认密度仍为 `comfortable`。性能敏感页面可关闭遮罩模糊；`theme={{ motion: false }}` 可关闭区域动效。
- `Slider` 默认不再显示独立数值文本；需要保留原显示方式时设置 `showValue`，悬停提示仍可通过 `tooltip` 开启。
- 可访问性与兼容性文档区分自动检查和人工验收范围，屏幕阅读器、物理设备与 Figma 实际导入仍需人工验收。

## 0.3.0 - 2026-10-05

扩展布局、导航、媒体与业务组件，完善文件上传和图片预览，并统一反馈组件的入口配置。

### 新增

- 新增 `Layout`、`Grid`、`Row`、`Col`、`Space`、`ScrollArea` 和 `Masonry`，用于页面布局与内容排列。
- 新增 `Segmented`、`Menu` 和 `BackTop`，用于视图切换、层级导航与回到顶部。
- 新增 `Descriptions`、`Image`、`ImagePreview`、`ImagePreviewGroup`、`QRCode`、`Timeline`、`VirtualList` 和 `OrgChart`。
- 新增 `Transfer`、`InputOTP`、`InputMask` 和 `TimeRangePicker`。
- 新增 `Notification`、`Popconfirm`、`ErrorBoundary`、`LoadingBar`、`InfiniteScroll` 和 `Sortable`。
- 新增 `Upload`、`FileList`、`ImageCropper` 和 `SignaturePad`；文件列表支持名称、可选大小、类型图标、下载及图片和视频预览。
- 新增按钮组与分体按钮、输入框组与搜索框、头像组、可选标签与标签组、复选框组，以及 `FormGroup`、`FormList` 和 `FormErrorSummary`。

### 改进

- `Menu` 子菜单支持展开与收起过渡，侧栏宽度随折叠状态平滑变化；收起的子项退出键盘导航，并遵循系统减少动态效果的设置。
- 图片预览优化工具栏、切换操作和缩略图列表；裁剪框支持拖动与边缘缩放，默认使用正方形容器。
- `Confirm` 由 `ConfigProvider` 自动托管，业务组件直接调用 `useConfirm()`；多个确认请求依次展示，沿用调用区域的主题与语言。
- `Select` 支持分组与创建选项；`DatePicker` 支持年份、季度、月份和周选择，以及自定义禁用日期。
- `Tree` 支持异步加载与拖拽移动；`Tabs` 支持新增与关闭；`Textarea` 支持自动调整高度与字数统计。
- 文档站更多交互使用 Leaf UI 组件，安装内容合并到“安装&快速开始”，组件总览图片不再触发放大预览。

### 修复

- 修复图片预览切换时画面抖动的问题。

### 升级说明

- `useConfirm()` 和 `useMessage()` 已移除 `contextHolder` 返回值与旧写法支持。删除相关解构和渲染，在应用入口使用一次 `ConfigProvider`，子组件分别通过 `{ confirm }` 和 `{ message }` 调用。
- 未使用 `ConfigProvider` 时，可在入口配置 `ConfirmProvider` 或 `MessageProvider`；缺少对应入口配置时，hook 会提示明确错误。
- 新增组件及其属性、数据类型均可从 `@sudden3/leaf-ui` 导入；样式入口仍为 `@sudden3/leaf-ui/styles.css`。

## 0.2.0 - 2026-10-05

扩展常用组件，统一主题配置，并简化消息提示的使用。

### 新增

- 新增 `ConfigProvider`，支持区域主题、基础尺寸、外观与中英文配置。
- 新增 `Form` 和 `FormField`，支持校验反馈、自定义标签宽度与自动对齐。
- 新增日期时间和日期区间选择器，支持多种日期粒度、手动输入与时间确认；时间选择器支持 12 小时制。
- 新增步骤条、面包屑、分页、标签页、标签、角标、头像、卡片、折叠面板、分割线、数字输入框、滑动输入条和评分。
- 新增弹窗、抽屉、确认框、下拉菜单、警告提示、消息提示、结果、加载、骨架屏、进度条、文字提示和气泡卡片。
- 新增日历、颜色选择器、树和树选择器。
- 文档支持中英文切换，补充主题定制、SSR 使用和更新记录。

### 改进

- `ConfigProvider` 自动托管消息，调用 `useMessage()` 无需渲染 `contextHolder`；不同组件共享队列，并保留各自区域的主题与语言。
- `Select` 支持多选、搜索与自定义浮层宽度，点击控件边缘也可展开。
- 日期区间选择器支持悬停预览，日期面板支持切换月份和年份。
- `Input` 支持密码显示切换，`Avatar` 支持图片与加载失败回退，`Rate` 支持按分数改变颜色。
- 全屏日历优化日期、日程与选中状态的展示。
- 弹窗、浮层与消息增加出现、关闭和位置变化的过渡；卡片与抽屉等面板优化标题、内容和底部间距。
- 组件文档补充类型表格与跳转，演示增加说明和分组。

### 修复

- 修复选择后浮层闪动、选项悬停重叠，以及日历禁用选中项文字不清晰的问题。

### 使用提醒

- 推荐通过 `ConfigProvider` 调整主题；CSS 变量用于让业务组件复用所在区域的样式。
- 在应用入口使用一次 `ConfigProvider` 或 `MessageProvider`，业务组件只需调用 `useMessage()`；原有 `contextHolder` 写法继续兼容。
- `Result` 支持空数据、成功、警告等状态；原有 `Empty` 用法继续兼容。
- 时间选择器支持手动输入，浮层中的选择在点击确定后提交；日期时间和日期区间选择器沿用该交互。

## 0.1.0 - 2026-10-03

首次发布。

- 提供 `Button`、`Input`、`Textarea`、`Checkbox`、`Radio`、`RadioGroup` 和 `Switch`。
- 提供 `Select`、`DatePicker`、`TimePicker`、`AutoComplete` 和 `Cascader`。
- 按钮支持图标、加载、禁用和危险状态；输入与选择组件支持受控值、表单提交和键盘操作。
- 提供绿色默认主题、统一尺寸、可复用的样式变量和局部浮层主题。
- 支持 React 18 / 19，提供 TypeScript 类型、ESM、CommonJS 和独立样式入口。
