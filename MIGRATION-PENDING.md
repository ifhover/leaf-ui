# 待发布迁移

本文集中记录开发分支上尚未写入正式更新记录的兼容性变化，面向准备发布的维护者，不进入在线文档。发版时按 [发布操作](packages/react/RELEASING.md#版本与记录) 把对应条目整理进中英文更新记录的“迁移说明”，然后从本文删除这些条目。新增破坏性或默认外观变化时在这里追加一条，不再分散写进各规范文件。

- Modal 与共用布局的 Confirm 保留普通高度时居中偏上的位置；长内容优先压缩额外底部留白，默认最大高度改为 `100dvh - 48px`，达到上限时上下各留 24 px，再滚动正文。显式 `style.maxHeight` 覆盖继续优先。
- Checkbox 与 Radio 的禁用指示器默认背景改为中性色：未选中使用 `surface-muted`，已选中或半选使用 `border`，组件级 disabled 背景和边框覆盖继续优先。

- 默认成功基色由 `#52c41a` 小幅调深为 `#4bb418`，警告基色由 `#faad14` 小幅调深为 `#e69f12`；浅深模式、派生色板与共享语义角色同步更新，显式 `successColor` / `warningColor` 覆盖继续优先。
- Select 多选模式的默认行内起点内边距改为与单选一致，跟随字段密度间距；显式组件内边距覆盖继续优先。
- Select、AutoComplete、Cascader、TreeSelect、Mentions 及日期 / 时间浮层的基础文字字号跟随当前控件尺寸，`sm` 使用小字号；日历日期格和内部独立控件保留自身字号规则，显式组件字号和 `popupStyle` 覆盖继续优先。
- Button 的危险描边、文字和链接外观默认文字由 `danger-ink` 改为 `danger` 基色；危险描边的文字和边框在悬停时变浅、按下时变深，与危险链接共用状态颜色。实底前景、链接悬停 / 按下颜色和显式组件 / 状态覆盖保持原有规则。
- Alert 默认外观改为无边框的语义浅色背景，标题使用 500 字重和对应状态基色；仅有标题时使用 8px 12px 内边距和与输入框相同的基础圆角，同时带描述时使用 16px 内边距并放大标题字号，标题与描述间距为 8px。图标与内容间距缩小，显式组件颜色、背景、边框、圆角和内边距覆盖继续优先。
- 小尺寸分段 Tabs 的默认上下内边距由 3 px 改为 2 px，ColorPicker 的格式切换同步生效；左右内边距仍为 3 px，显式组件内边距覆盖继续优先。
- 线形 Tabs 的尺寸和选中反馈改为参考 Ant Design：默认小 / 中 / 大高度为 38 / 46 / 56 px，小尺寸字号与默认尺寸一致，标签左右内边距为 0，默认项间距为 32 px；新增全宽分割线，选中线改为统一 2 px 厚并铺满标签宽度，使用无过冲缓动，选中文字增加轻微同色阴影。Card 内嵌 Tabs 与独立同尺寸 Tabs 共用高度和间距，移除有标题时的高度偏移与无标题时的标题行最小高度。
- 默认主题基色由 `#1e964f` 切换为 `#007aff`，浅深色派生色带、`--leaf-color-primary-*` 用途角色及 `ColorPicker` / `ConfigProvider` 默认值同步更新，显式 `primaryColor` 覆盖继续优先。
- 浅色中性边界层级重校：`border` 调整为 `neutral-200` 与纯白 `82%` 混合（`#e9e9e9`）、`border-hover` 调整为 `82%` 混合（`#d4d4d4`）、`divider` 调整为 `68%` 混合（`#ededed`），卡片与复合容器外框统一使用 `--leaf-color-border`、内部分隔保留较轻的 `--leaf-color-divider` 或柔化混合线，避免纯白表面在白色画布上轮廓过淡；阴影层级（`--leaf-shadow-xs`..`lg`）同步收轻。
- 统一去重灰底并收口净白表面体系：分段 `Tabs` 轨道与滑块、日历视图分段切换、默认日期选择器预设、`Drawer divided` 页脚及 `Upload` 图标与头像容器移除多余的 `surface-muted` 灰底并统一为净白 `--leaf-color-surface`（或 `transparent`）与精细描边；`Collapse` 边框型增加外框轻阴影并统一悬停中性反馈；`FileList` 与 `Descriptions` 外框使用 `--leaf-color-border`。
- `Tabs` 新增 `tone?: 'soft' | 'solid'`（默认 `'soft'`）与 `shape?: 'default' | 'pill'`（默认 `'default'`），`card` 与 `segmented` 形态默认采用 `primary-soft` 浅底高亮与 `--leaf-motion-spring` 指示滑移（去除硬阴影块）。
- `Transfer` 重写为双栏单层净白面板（整体默认宽 `464px`）：移除外层灰色托盘、面板 `:focus-within` 边框变深和列表项粘连外观，表头改用 `--leaf-color-divider` 底线并原生支持选项 `description`，列表项使用 `var(--leaf-radius)` 独立圆角与 `4px` 间距、主题浅底选中态；显式组件背景 / 边框覆盖继续优先。
- 交互触感增强：`Button`、`Tabs` 标签、`Calendar` 视图分段与日期格、`Transfer` 条目、`Upload` 头像与浮动 `Menu` 选项增加克制的按压微缩反馈（`scale` `0.95`–`0.985`），均随系统减少动态效果与 `theme.motion={false}` 自动禁用。
- 默认圆角升级与按尺寸比例缩放：基础圆角 `--leaf-radius` 由 `8px` 调整为 `10px`，并按 `0.5 / 0.8 / 1 / 1.2 / 1.4 / 1.6` 派生小标签（`5px`）、小/中/大控件（`8 / 10 / 12px`，`--leaf-control-radius-sm` / `--leaf-radius` / `--leaf-control-radius-lg`）、内容面（`14px`，Card 与带边框 Descriptions 随 `sm / md / lg` 使用 `12 / 14 / 16px`）与浮层/抽屉（`16px`）；`InputOTP`、`Tag`、`Square Avatar`、`Tabs`（非 pill）与 `Pagination` 指示器亦随各自 `size` 自动缩放圆角，且 `borderRadius: 0` 下保持全部归零。
- 剩余组件视觉与动效收口：`Slider` 移除手柄悬停放大与 5px/7px 拖拽光晕、仅保留 `:focus-visible` 键盘聚焦环与轻微按压；`Rate` 与 `AvatarGroup` 移除悬停上浮；`FloatButton` 与 `BackTop` 移除悬停 `shadow-lg` 阴影跳阶并加入轻量按压；`InputOTP` 收敛当前激活格轮廓并改为 2px 焦点框；`LoadingBar` 移除默认主题色发光；`Progress` 默认 `active` 改为 `false`（关闭默认循环流光，需时显式传 `active`）；`Checkbox`、`Mentions`、`Tag`、`CheckableTag`、`Modal`、`Tour`、`Notification`、`Alert`、`Result`、`Collapse`、`Cascader`、`Tree`、`TreeSelect`、`Select`、`Dropdown`、`Menu`、`TimePicker`、`Carousel` 及浮层高亮条统一改为无过冲标准缓动 `--leaf-motion-easing`，将 `--leaf-motion-spring` 严格留给 `Tabs` 与 `Pagination` 滑动指示器。
