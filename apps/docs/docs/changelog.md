---
sidebar: placeholder
footer: false
---

# 更新记录

记录每个 npm 版本的新增功能、体验改进与问题修复。

## 0.13.0 - 2026-11-01

### 新增与改进

- DataTable 新增 `bleed`，直接放入 Card 正文或内嵌标签页时，表格左右贴边，工具栏和分页补回相同的横向内边距，上下留白保留。卡片内表格示例移至 Table 文档，基础用法补充分页。
- DataTable 统一使用简洁外观，增加表头高度，减淡表头文字和下方横线；默认斑马纹、固定表头、固定列和行交互继续可用。
- Tag 提供 `soft` 浅色背景与颜色文字、`solid` 颜色背景与白色文字两种外观，统一选中前后的圆角，缩小关闭图标的悬停背景。中英文颜色、外观和图标示例展示全部内置颜色及自定义颜色。
- 默认中性色改为偏蓝灰；成功、警告和危险基色调整为 Ant Design 对应色值，info 继续使用 `#1677ff`。同步主题示例、设计资源和 Figma 导出。
- Menu 菜单项统一字重，调整一级文字、子菜单缩进和颜色；代码展开与点击展开使用相同过渡，修复首次及懒加载展开、嵌套子菜单动画和主题色按下反馈。

### 迁移说明

- 本次 `0.x` 次版本包含 API 移除和默认外观变化。DataTable 移除 `variant`、`columnDividers` 和 layered 分层外观，原 simple 外观成为唯一默认样式；删除实例及 `ConfigProvider.components.DataTable` 中的旧属性。旧 JavaScript 参数会被忽略。需要行间细线时设置 `striped={false}`。
- Badge 的 `children` 改为必填，不再渲染独立角标；将计数或圆点角标附着到实际内容，独立状态文字可使用 Tag。
- Tag 移除 `dot` 和 `variant="outline"`；删除 `dot`，将描边外观改为 `soft` 或 `solid`。默认颜色由主题色改为中性灰底黑字，预设颜色为 `success` / `info` / `warning` / `danger`，也支持自定义颜色。旧 `color="primary"` 按默认灰色处理，`error` 兼容映射到 `danger`。soft 预设文字使用语义基色，solid 默认使用白字；CheckableTag 与 TagGroup 未选中时使用中性 soft，选中时使用主题色 solid。
- 默认中性基色从 `#707070` 改为 `#6c737e`，共享文字、表面、边框与中性反馈随色阶调整；成功、危险、警告基色分别改为 `#52c41a`、`#ff4d4f`、`#faad14`。显式主题覆盖继续优先；需要旧配色时通过 `theme.tokens` 设置 `neutralColor: '#707070'`、`successColor: '#1e964f'`、`dangerColor: '#dd3f2e'`、`warningColor: '#d38b11'`。
- Menu 三种外观的菜单项默认字重统一为 500。默认 primary 外观的普通未选中一级文字使用正文色，子菜单普通未选中文字使用次要文字色；显式组件颜色覆盖继续优先。内联子菜单铺满可用宽度并移除层级竖线，二级内容起点与有图标的一级项文字对齐，更深层级继续缩进。

## 0.12.0 - 2026-10-31

### 新增与改进

- DataTable 普通表格未指定列宽时按内容布局；显式尺寸、固定列、拖拽调宽和虚拟滚动使用确定的列宽布局。新增 `meta.flex`，按权重分配剩余空间并遵守 `minSize` / `maxSize`；手动调宽后保留实际宽度，重置后恢复弹性分配。
- Menu 默认使用主题色外观，选中与悬停文字直接使用主题基色，选中背景减淡为 8% 主题色。
- ColorPicker 色值输入复用组件库内部 Input，统一圆角、尺寸、焦点和校验反馈；修复文档站右上角主题颜色选择器的色块居中与触发器对齐。
- 同步中英文列宽示例、组件文档、API 和行为测试。

### 迁移说明

- DataTable 不再默认给每列分配 150px，也不再让最后一个未固定列吸收全部空余。显式 `size`、宽度边界、列宽状态、固定列、拖拽调宽与虚拟滚动会启用确定的尺寸布局；固定或已指定宽度的列保留尺寸，其余列共享剩余空间。需要旧版基础列宽时配置 `options.defaultColumn.size: 150`，并给需要填充空间的列设置 `meta.flex`。弹性列忽略 `size`，但仍遵守 `minSize` / `maxSize`；固定列与手动调宽的列忽略弹性权重。全部列固定或达到最大宽度时允许右侧留白。
- Menu 默认 `variant` 从 `raised` 改为 `primary`；需要原有外观时显式设置 `variant="raised"` 或 `ConfigProvider.components.Menu.variant`。主题色外观的文字不再使用调整深浅后的 `primary-ink`，选中背景由 10% 减淡为 8%。
- ColorPicker 色值输入的尺寸和圆角跟随 Input；ColorPicker 独立样式入口同时包含 Input 样式。

## 0.11.0 - 2026-10-31

### 新增与改进

- Form 与 FormField 新增 `controlAlign` 和 `settingsControlWidth`，支持统一配置或逐字段覆盖 settings 布局的控件对齐方式与列宽。
- 更新中英文 Form 设置布局示例与 API 说明，精简 DataTable 使用文档。

### 迁移说明

- `Form layout="settings"` 默认在 `clamp(200px, 40%, 280px)` 的右侧控件列中左对齐控件。需要原有右对齐效果时设置 `controlAlign="right"`，通过 `settingsControlWidth` 调整列宽；两项均支持 FormField 单独覆盖。标签与说明改为和控件顶部对齐，只有标签配单行控件时仍保持视觉垂直居中。

## 0.10.1 - 2026-10-31

### 新增与改进

- 图片能力收敛为 `useImagePreview().preview(images, options)` 与 `ImagePreviewProvider` 命令式服务，并改为不依赖第三方引擎的预览实现。新增首尾循环、键盘缩放与切换、1:1、旋转、双向翻转、触摸手势、窗口化缩略图和可选下载，同时保留区域配置、焦点返回与 FileList 内部预览。
- 重新整理 Modal、Drawer 与 Confirm 的内容面、标题、图标、留白、分隔线和关闭按钮；Modal 使用更紧凑的 medium 圆角与默认分隔线，Drawer 不再嵌套卡片内容面，Confirm 默认展示信息图标。
- DataTable 简洁模式使用直角内容面表头、14px 区域基础字号与默认斑马纹；精简内置布局、工具栏、搜索、列显隐和拖动 API，应用继续通过 TanStack 状态组合这些业务控件。
- DatePicker 与 DateRangePicker 的浮层恢复普通内容面，只有日期时间区间展示符合 Tabs 语义的端点切换；其他日期粒度和纯时间区间不再显示无用切换。
- 调整 Card 边框、标题颜色和纯封面布局，降低 Alert 中性底色强度，并让 Progress 分段共享整条轨道的外侧圆角。同步双语文档、示例、区域默认参数、类型测试和结构化 API / AI 导出。

### 迁移说明

- `Menu variant="default"` 重命名为 `variant="neutral"`，包括 `ConfigProvider.components.Menu.variant`；不保留旧名称，默认外观仍为 `raised`。
- `Modal` 与 `Drawer` 移除 `variant` 及卡片外观，删除实例和区域配置中的 `plain` / `card`。Modal 的 `divided` 默认改为 `true`，footer 不再自动为直接子元素添加间距；自定义按钮组请用 `Space` 等布局组件。Modal 默认圆角、标题、图标和留白也有调整，显式参数仍优先。
- `Confirm.type` 默认由 `default` 改为 `info`；需要无图标外观时设置 `type="default"` 或 `icon={null}`。
- DatePicker 与 DateRangePicker（包括时间和日期时间模式）的 `panelVariant` 默认由 `card` 改为 `plain`；需要原分层外观时显式设置 `panelVariant="card"`。日期时间区间端点切换由 `aria-pressed` 按钮改为 `tab` / `aria-selected`。
- `DataTable variant="simple"` 默认展示斑马纹并遵守 `striped`；设置 `striped={false}` 恢复细行分隔线。简洁模式继续忽略 `columnDividers`。
- DataTable 移除 `DataTable.Search`、`ColumnVisibility`、行列拖动、`Toolbar` / `Content` / `Footer` / `Pagination` 复合部件及对应类型、导出和区域配置；移除 `layout` / `children`、`bordered`、`selectAllMode`、`columnReordering`、`onRowReorder` 与 hook 的 `pagination` 别名。使用根 `toolbar` / `pagination`、`columnDividers`、`localPagination` 和应用自己的 TanStack 状态替代。
- DataTable 统一导出 `DataTableProps<T>`，移除 `DataTableInstanceProps<T>` 与 `DataTableDataProps<T>`。实例接入的窄类型可用 `Extract<DataTableProps<T>, { table: TanStackTable<T> }>`；`localPagination` 不能与已创建的 `table` 一起传入。
- 移除 `Image`、`ImagePreview`、`ImagePreviewGroup` 及其 Props 和 `ConfigProvider.components.Image` / `ImagePreviewGroup`。页面图片改用原生 `img`，预览使用 `useImagePreview().preview()`；`components.ImagePreview` 继续配置命令式服务。
- 默认 Card 外框变浅，纯 `cover` 不再产生空 body；默认 Card / CardTitle 浅色标题改为纯黑色，分层 Card 和显式颜色覆盖不变。Progress 的 `segments` 改为内部直角连接，`steps` 不变。

## 0.10.0 - 2026-10-27

### 改进与修复

- Form 水平布局默认使用 112px 标签宽度，首屏无需等待标签测量；可通过 `Form.labelWidth` 统一调整，或通过 `FormField.labelWidth` 单独覆盖。

### 迁移说明

- `Form.labelWidth` 不再支持 `'auto'` 或按最长标签自动调整。删除原来的 `labelWidth="auto"` 以使用默认宽度，或改为数字指定像素宽度；`ConfigProvider.components.Form.labelWidth` 同样只接受数字。
- 默认水平表单的标签列宽和控件起始位置会变化，较长的标签会在指定宽度内换行。纵向、设置布局及窄屏堆叠规则不变。

## 0.9.0 - 2026-10-27

### 新增

- DatePicker 与 DateRangePicker 统一提供日期、日期时间和纯时间模式，支持分段输入、键盘步进、时间上下界、开放区间与确认草稿；原有日期模式继续可用。
- Image 新增 `useImagePreview().preview(images, options)` 与独立的 ImagePreviewProvider，ConfigProvider 自动提供预览服务，图片实现与样式按需加载。关闭函数幂等，调用组件卸载时关闭所属预览；同一 Provider 同时展示一组图片。
- Card 新增 `variant="layered"` 与 `selected`，Menu 提供 `default` / `raised` / `primary` 外观，Dropdown 新增 `size="sm | md | lg"`，Scrollbar 新增 `size` 与 `persistent`。
- 中英文组件文档统一为简介、完整基础用法、独立示例和主组件优先的 API。新增“界面设计与组合”指南，集中说明页面组合、字号字重、间距、密度、尺寸与主题颜色角色，不要求复制固定色板。
- Leaf UI Skill 1.1.1 提供精确版本的结构化组件查询：默认返回完整基础用法、API 和示例索引，重复 `--examples` 可一次查询多个完整示例；`--guide design-standards` 返回同版指南原文。查询仅依赖 Node.js，不预下载所有版本，也不回退到 latest。

### 改进与修复

- 统一按钮、字段、选项与内容表面的共享视觉配方，保持中性反馈和稳定的交互几何。AutoComplete、Cascader、TreeSelect、ColorPicker、Textarea、Mentions、InputNumber 聚焦或展开时采用与 Select 一致的主题色边框，无额外外圈；错误、警告、禁用和显式覆盖仍优先。
- 重写 Calendar 的完整月历、年视图和紧凑布局；日期时间弹层采用单日历配时间列，纯日历区间保留双日历。时间行采用中性悬停与勾选、小号常驻滚动条；“今天”“当前时间”和清空端点使用小号描边按钮，“确定”保留实底。
- 重整 FileList 的紧凑清单、文件类型回退、图片卡片和状态底栏，保留安全媒体 / 文档 URL 检查；Transfer 改为中性底板和内缩内容面。修复 card Drawer 横向越界、图库导航到边界后失焦导致 Escape 无效、表格列宽拖动柄无法命中，以及窄屏远程错误反馈被裁切。
- DataTable 两侧固定列总宽度超过滚动视口时，临时跟随横向滚动以保持列与拖柄可达；空间恢复后自动固定，不改变应用的 `columnPinning` 状态。
- Image 的空图和失败占位按空间显示图标 / 提示；加载中、失败和无图片时不触发预览。预览增加双向旋转、原始像素 1:1、最高 20 倍原始尺寸缩放、百分比恢复适应窗口和可操作的缩略图滚动，顶部只显示图片计数。
- ColorPicker 使用分段 Tabs 切换格式，修复色标焦点裁切和角度字段溢出；文字 / 色块按起始侧对齐，文字格式具有稳定默认宽度。Pagination 内部操作复用按钮控件；Carousel 箭头取消缩放、描边和阴影，并相对内容视口居中。
- AvatarGroup 的文字头像按顺序循环使用五组浅底 / 可读文字角色，独立 Avatar、图片、默认图标和 +N 保持原配色。同步双语示例、AI 文档导出、设计 token、SVG 与 Figma 插件资源。

### 迁移说明

- 本次 `0.x` 次版本包含公共 API、默认行为和外观变化，请按实际使用范围迁移。
- 移除 AppBar、Toolbar、BottomNavigation、CommandPalette 及其类型、ConfigProvider 默认参数、组件和样式子路径。页面结构使用 Layout / Flex / Menu / Button 等组合；命令面板在应用层实现或接入专用方案。
- Button 外观为 `solid` / `outline` / `text` / `link`，默认从 `solid` 改为 `outline`，移除 `soft`；次要操作可省略 variant，原无边框操作改用 `text`。SplitButton、FloatButton 和按钮属性插槽沿用此公共类型。
- Tag 移除 `solid`，保留 `soft` / `outline`，默认使用主题色，显式 `color="default"` 也映射到主题色。新增默认开启的 6px 圆点，纯文字设置 `dot={false}`；CheckableTag / TagGroup 未选中为 outline、选中为 soft。三者移除 `bold`，字重使用区域 fontWeight（默认 500），圆角使用 small；需要其他字重时显式设置样式。
- Badge 移除 `status` / `text`。状态文案改用 Tag，角标使用 `count` 或 `dot` 配合 `color`。CheckboxGroup 移除 `minCount` / `maxCount`，数量限制由受控 `value/onChange` 和业务表单校验负责。
- `FeedbackType` 使用 `danger` 替代 `error`；兼容旧输入时使用 `FeedbackTypeInput`。反馈组件仍接受旧 `error` 输入，但归一为 danger 并输出对应 DOM 类名；依赖 `--error` 类的样式 / 测试需迁移。Form 校验、Progress 和 Steps 的错误状态名仍为 `error`。
- Card 移除 `divided`，用间距组织各区；默认仍为 default，分层需显式设置 `variant="layered"`，该模式不展示 description。Menu 只保留纵向布局，移除横向 / inline 用法，默认外观从 default 改为 raised；需要平面外观显式设置 `variant="default"`，折叠子菜单同步使用浮起外观。
- Tabs 只保留顶部 / 底部布局，移除左右纵向标签；溢出使用两侧描边箭头。`type="card"` 改为无外轨的浅灰选中面；需要灰色轨道和内容面滑块时使用 `type="segmented"`。
- Modal 与 Drawer 的 `divided` 默认从 true 改为 false，Drawer 默认 `variant="card"`；需要分割线时显式传 divided。Modal、Drawer 与 Confirm 默认不再模糊遮罩，使用 `<ConfigProvider maskBlur>` 恢复。
- DataTable 移除 `stickyHeader`（表头始终固定）与 `caption`，旧 JS 传值被忽略；`bordered` 为弃用别名，改用 `columnDividers`。默认分层、斑马纹、无列分割线；`striped={false}` 显示行分割线。快捷数据模式和 useDataTable 默认关闭排序，需要显式 `options.enableSorting: true`；列级可关闭，manualSorting 不隐式开启排序，受控排序仍需 state.sorting / onSortingChange。直接传入的 TanStack 实例保持自身配置。
- 移除 TimePicker、DateTimePicker、TimeRangePicker 及其类型、区域默认参数、独立组件和样式入口，分别改用 `<DatePicker picker="time" />`、`<DatePicker picker="datetime" />`、`<DateRangePicker picker="time" />`。纯时间值仍为字符串，日期 / 日期时间仍为 Date；移除 multiple、maxCount 和 MultipleDatePickerProps，不再接受多日期数组，区间使用 DateRangePicker。
- 日期 / 时间输入改为分段：数字输满自动换段，Tab / 空格下一段、Shift + Tab 上一段，左右切段、上下步进，末段 Tab / 首段 Shift + Tab 离开字段；Alt + 下键进入面板。Backspace / Delete 清空当前段，全选删除直接清空已提交值。原生输入和输入法按段分配数字并保留选区；函数型或无 token 的 format 保留文本输入。
- 有效输入实时同步浮层而不提前提交其它草稿；无效、未完成、越界或业务禁用草稿离开整个选择器时取消并恢复已提交值，不触发 onChange，Enter 失败仍可继续修正。纯时间默认在外部点击 / Tab 离开时提交有效草稿，needConfirm 时仅确定 / Enter 提交；日期时间默认 needConfirm=true，外部关闭放弃草稿。Escape 始终放弃（全选删除除外），日历区间默认选完终点提交；inputReadOnly 只禁止字段输入，不禁止面板编辑。
- 纯时间新增含边界的 minTime / maxTime（HH:mm[:ss]），minuteStep 默认 5 改为 1；日期时间区间新增 defaultTime，默认 `['00:00:00', '23:59:59']`。日期时间 showSeconds 默认 true 改为 false，关闭时 Date 秒为 0，显示 / FormData 不含秒。datetime 区间先选开始端再选结束端；所有模式 panelVariant 默认 plain 改为 card，需要普通面板显式设置 plain。
- 日期解析新增 `/`、`.`、YYYYMMDD、年月日、季度、周和全角字符等输入，时间接受 `9:30`、`930`、`14时5分`；不存在的日期仍拒绝。weekStartsOn 现在也决定周值起始日，周编号仍按 ISO；设为 0 时周值是周日。区间悬停类名改为 `leaf-date-picker__day--preview`，不再添加 selected 类。
- 独立字段默认宽度从 100% 改为 240px（Input、InputNumber、InputSearch、Select、AutoComplete、Cascader、TreeSelect、单值日期 / 时间）；日期区间 300px、日期时间区间 380px，显示秒 / 时段为 440px；长格式单值日期时间 280px，长格式时间区间 300px。最大宽度始终受容器约束，FormField 内仍铺满，Textarea 仍为 100%；需要独立铺满时设置 `style.width='100%'`。ColorPicker 文字格式默认 HEX 144px、RGB 272px、HSL 296px、渐变 160px，实例 width 优先。
- 默认宽松控件高度 30 / 36 / 42px 改为 28 / 34 / 40px，紧凑为 24 / 30 / 36px；需要原尺寸可设置 theme.controlHeight。默认正文行高由 1.6 倍改为 20px，小 / 大号为 13px/18px 与 16px/22px；lineHeight 数字在 (0,4] 仍表示倍数，其余按像素，字符串按 CSS 长度。
- fontWeight 与 headingWeight 只接受 400 / 500 / 700，将 600 改为普通标签 500 或强标题 700。普通组件标题使用 fontWeight；Card / CardTitle 标题为 14/20、16/22、18/24px，small / default 使用 500，大号使用 headingWeight。标签最小 12px、步骤指示至少 24px（大号 28px）。基础圆角 10px 改为 8px，small / medium / large 为基础的 0.5 / 1.5 / 2 倍。
- 默认 Card 新增 shadow-xs，分层 Card / DataTable 只在内层用 shadow-sm，浮层用 shadow-md；Button 水平内边距按实际高度 ×0.42 派生，显式组件内边距优先。Form 默认间距 comfortable 24→16px、compact 16→12px，自动标签宽度上限为 40%；需要原布局时显式设置 gap / labelWidth。
- 颜色改用浅深外观共享的基色及用途角色。实底 on-* 前景统一默认白色，不再自动选黑白；很浅的自定义底色应显式配置 `tokens.onPrimaryColor` / onSuccessColor / onDangerColor / onWarningColor / onInfoColor。需要派生颜色时更新 ConfigProvider 的 JS 配置，DOM style / class 改变不再触发 JS 重算；CSS 表达式继续按 CSS 使用。
- 移除未消费的百分比颜色变量，按用途将旧 `*-surface-*` / `*-text-*` / `*-border-*` 替换为 `*-soft` / `*-ink` / `*-border`；中性结构使用 text-subtle、surface-raised、border-hover、divider 等对应角色。这些不是像素等价别名。中性色保留 100..900，显式语义色带使用 light-3/7/9 与 dark-1/3/7/9；同步迁移自定义 CSS、Tailwind 和设计资源，不在页面复制默认色值。
- 依赖内部 DOM 的样式需检查：Calendar 改为 `leaf-calendar-view__*`，选中状态为 gridcell 的 aria-selected，不再输出旧日期单元格类 / aria-pressed；FileList 状态移入 meta 并增加 main / footer / empty-icon；Transfer 增加 body；Pagination 按钮增加内部内容包装；Carousel 箭头移入 viewport。ColorPicker 格式按钮变为 role=tab / aria-selected，旧 aria-pressed 选择器需迁移。公开属性不受这些 DOM 变更影响。
- Scrollbar 的 persistent 默认 false，开启后轨道常驻并独占空间；scrollbar="always" 仍为覆盖式，hidden 不留空间。时间列使用 sm / persistent。Confirm 语义图标不再有背景底座，放在粗体标题旁，无标题时放在正文旁。

## 0.8.1 - 2026-10-20

### 改进

- 表格表头文字加粗并略微减淡，带边框表格的表头改用白色表面（深色主题跟随深色表面），底部分割线统一为 1px。
- 斑马纹从第一行开始，排序图标紧跟表头文字。

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
