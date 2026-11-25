# Leaf UI 设计风格

本文定义 Leaf UI 默认外观的整体风格取向，是新增组件、调整外观和处理规范未覆盖情况时的判断依据。具体组件的状态和几何契约见 [样式与交互标准](DESIGN-STANDARDS.md)，颜色角色见 [颜色系统规范](COLOR-SYSTEM.md)；三者冲突时以当前源码为准，并向用户报告差异，不自行按本文方向改动实现。面向使用者的页面组合与公开基础标尺统一维护在[界面设计与组合指南](apps/docs/docs/guide/design-standards.mdx)，不将本文件整份复制到 Skill。

## 定位

Leaf UI 是面向桌面工具、管理后台和数据密集界面的组件库。默认外观就是产品本身：安静、精确、一致，让内容和数据成为主角，组件本身不抢注意力。

主题配置用于接入品牌色、明暗外观和密度，不是卖点。对外描述（README、文档首页、介绍页、npm 描述）强调一致、克制、可读和工程质量，不宣传“随心定制”“自由多变”“展现个性”之类的能力；也不为展示可塑性而新增风格预设或装饰性主题。

## 五条原则

1. **中性优先，克制留白。** 结构由干净的纯白内容面（`--leaf-color-surface` `#ffffff`，深色模式 `#0d0d0d`）与 crisp 中性色阶边界构成，不在默认界面中大面积堆叠沉闷的灰色底板或泛滥主题色。主题色默认 `#007aff`（支持 `'neutral'` 自适应黑白灰单色主色），收敛于按钮交互强调（`solid` 实底与 `outline` 悬停/按下边框与文字）、勾选/开关/滑块控件、`Select` / `Cascader` / `TreeSelect` / `TimePicker` 浅主色选中、`Calendar` 日期选中、`Pagination` 当前页、默认线形 `Tabs` 选中/交互态、输入/选择字段悬停边框与聚焦外环、`Table` 激活排序/拖拽指示等必要状态提示；卡片/分段标签页、菜单与普通列表保持极简黑白灰层级。
2. **层次来自精准边界与克制阴影，不来自模糊或装饰。** 默认不开启背景毛玻璃（`backdrop-filter`），而是用清脆的实体中性外框（`--leaf-color-border`，浅色 `#e5e5e5`、深色 `#262626`）、更轻的内部分割线（`--leaf-color-divider`，浅色 `#eaeaea`、深色 `#212121`）、朝下的轻投影（`--leaf-shadow-control` / `shadow-xs` / `shadow-sm`）、同心圆角与字重层级区分结构；仅分段控件轨道、显式分层卡片（`Card variant="layered"`）与显式 card 型日期浮层（`DatePicker panelVariant="card"`）使用 `surface-muted` 画布。
3. **反馈轻盈、克制而有触感。** 悬停与聚焦主要改变颜色和边框，不做悬停上浮、悬停放大或阴影跃升；已选中项的样式不受悬停或高亮覆盖。`Button`、其余可点击控件、标签、穿梭框选项、日历格与浮动菜单项按下均只通过色阶、透明度或轻阴影收敛提供触感，不做按压位移或缩放回缩，保持外层容器几何与周围布局静止；Checkbox / Tree 等对号勾选使用 SVG 描边绘制动画，Radio 圆点使用中心裁剪展开过渡。所有微动效均遵守 `prefers-reduced-motion` 与 `theme.motion={false}`。
4. **动效只为说明变化。** 浮层、弹窗、下拉与控件反馈使用克制的标准缓动（`--leaf-motion-easing`）；只有分段或卡片选中滑块、分页选中指示块（`Tabs`、`Pagination`）保留轻微弹性曲线（`--leaf-motion-spring`）实现流畅滑移，不做突兀弹出、阴影跃升或无意义的默认循环动画。
5. **一套规则，共享实现。** 同类控件复用同一套绘制和反馈（字段外框、选项行、浅底选中、文字操作、分段表面、操作过渡），不为单个组件保留私有的“个性”色板或重复变量。

## 视觉语言

**颜色**

- 默认主题基色为 `#007aff`；文字、边框、表面全部来自中性色阶角色，不硬编码近似灰。
- 普通候选选项、文字按钮与绝大多数界面导航的悬停/选中均使用中性反馈：`Tabs`（`card`、`segmented`）、`Menu`（默认 `neutral`）、选中 `Transfer` 条目与 `Steps` 默认采用黑白灰阶层，需要主色强调时通过显式变体（如 `variant="primary"`）或局部主题按需启用；`Select`、`Cascader`、`TreeSelect` 与 `TimePicker` 的已选项使用浅主题色底（`--leaf-color-primary-soft`）且不显示右侧对号、未选项悬停保持中性浅灰与黑色文字、悬停不覆盖已选样式；`Table` 主体、浅灰表头以及悬浮/选中行均保持中性层级（普通行悬停与选中统一使用 2% 浅灰底且选中后悬停不变色），仅激活排序与拖拽指示使用主色反馈；默认线形 `Tabs`（`type="line"`）、输入与选择字段悬停/聚焦及 `Pagination` 当前页使用主题色，配方只维护在[颜色系统规范](COLOR-SYSTEM.md#视觉家族契约)。
- 语义色（成功、警告、危险、信息）只表达状态，危险只改变配色，不改变动效、装饰或几何。
- 实底控件的前景规则见 [颜色系统：角色映射与选阶](COLOR-SYSTEM.md#角色映射与选阶)。

**表面与阴影**

- 默认内容面使用 `--leaf-color-surface`（浅色模式纯白 `#ffffff`，深色模式 `#0d0d0d`）：`Transfer` 面板、`Drawer` 分区页脚、`Upload` 头像与图标底座、`Table` 表体、`Modal` 与默认 `DatePicker` 均直接使用干净表面；`Table` 表头使用混合 `surface-muted` 的浅灰底，`Card variant="layered"`、`Segmented Tabs` 外轨与显式 `panelVariant="card"` 的日期浮层保留 `surface-muted` 底板配内层 `surface` 内容面。
- 外框使用与纯白背景对比清晰而不生硬的 `--leaf-color-border`（浅色 `#e5e5e5`，悬停 `#cecece`；深色 `#262626`，悬停 `#404040`），内部划分使用更轻的 `--leaf-color-divider`（浅色 `#eaeaea`，深色 `#212121`），确保白色卡片在纯白画布上轮廓分明。
- 阴影克制且朝下：`Button`（`outline` 与 `solid`）采用极轻的 `--leaf-shadow-control`（`0 2px 0 rgb(0 0 0 / 0.02)`）；选择类控件（Checkbox / Radio / Switch）、`Card`、`Transfer` 面板、`Collapse` 边框与 `Upload` 徽标使用 `shadow-xs`；`Segmented Tabs` 选中滑块使用 `shadow-sm`；浮层与对话框用 `shadow-md`。悬停不提升阴影等级；`Pagination` 当前页使用无阴影实底按钮。

**几何**

- 默认基础圆角 `--leaf-radius` 为 `10px`，由外向内并按 `sm / md / lg` 尺寸构成阶梯：浮层（`16px`）> 内容面（`12 / 14 / 16px`）> 控件（`8 / 10 / 12px`）> 小标签（`4 / 5 / 6px`）；内层圆角按同心关系从外层派生，不靠裁剪掩盖不匹配。
- `Transfer` 等独立列表项与选项圆角之间保留明确间距与 `var(--leaf-radius)` 圆角，防止相邻选中项视觉粘连。
- 默认尺寸落在整像素网格上；紧凑控件放在宽松的容器留白里。

**文字**

- 正文使用 400，控件、普通标签、`Card`（`sm / md`）、`Modal`、`Drawer` 使用 500，`Table` 表头使用 600，强标题（含 `Card` `lg` 标题）使用 700。
- 层级主要靠字号和颜色（正文、次要文字、大号文字），分组标题使用统一的小号弱化标签。

**交互**

- 描边按钮是默认操作：内容表面、正文色配 `--leaf-color-border` 边框与极轻底阴影 `--leaf-shadow-control`，悬停时边框与文字转为主色悬停态（`--leaf-color-primary-hover`），按下后边框与文字进一步变深（`--leaf-color-primary-link-active`）且保持位置静止，具体颜色跟随区域主题。
- 清除、关闭、步进、展开等小图标操作统一复用文字按钮反馈，保证至少 24px 点击区域。
- 键盘焦点沿用家族反馈：按钮与主要控件使用清晰的中性焦点轮廓，输入和选择类字段悬停边框切至 `--leaf-color-primary-hover`、聚焦或展开时默认使用清晰的 `--leaf-color-primary` 边框并叠加克制的 2px（10%）半透明主题色外环（校验状态同步对应语义边框与外环，显式中性字段保留 `--leaf-color-border-hover` 悬停与 `--leaf-color-text-muted` 聚焦；聚焦容器如 `Transfer` 面板外框不随内部输入框聚焦而变深）；鼠标点击按钮等普通控件时不额外添加焦点光环；尊重减少动态效果和强制颜色模式。

## 避免

- 悬停抬起（`translateY` 负值）、悬停放大或用阴影等级跃升表达悬停。
- 默认使用毛玻璃（`backdrop-filter`）或在干净白面中嵌套多余的 `surface-muted` 灰色托盘。
- 仅靠模糊浅灰导致白色卡片在白色背景上边界消失，或反过来使用生硬重黑边框。
- 在页面层另造主题色悬停或移动高亮，覆盖组件已有的家族反馈。
- 为单个组件新增近似的颜色、阴影或圆角变量。

## 待收敛清单

截至本轮收敛，2026-10-25 登记的偏离项（`Slider`、`Rate`、`AvatarGroup`、`InputOTP`、`LoadingBar`、`Progress`、`FloatButton`、`BackTop`、`Mentions`、`CheckableTag` / `Tag`、以及非滑块组件的 `--leaf-motion-spring`）均已按上述原则与 [样式与交互标准](DESIGN-STANDARDS.md) 完成收口；当前无未决遗留项。后续新增或发现新的偏离项时再行登记，并在改动前与用户确认。
