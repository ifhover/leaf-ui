# Leaf UI 样式与交互标准

本文是组件默认外观与交互的具体契约（尺寸、状态、几何）。整体方向见 [设计风格](DESIGN-STYLE.md)，颜色角色、配方与验收见 [颜色系统规范](COLOR-SYSTEM.md)；本文未覆盖的情况按设计风格判断。文档与源码不一致时以当前源码为准，并向用户报告差异。

标注“待收敛”的条目是与设计风格冲突的现行实现：修改前先与用户确认；确认前按本文现行契约维护，不顺带改动。

颜色修改遵守颜色系统规范：使用基色输入、语义明暗派生、独立中性色阶和用途角色；家族配方只是实现复用，不是另一层颜色。不引入近似的组件默认色，在各主题下验证最终绘制结果；数值相同不代表语义相同。

## 基础

### 视觉方向

- 默认外观安静、可读。所有组件使用语义主题 token，支持浅色 / 深色区域，并继承宽松 / 紧凑密度；组件局部覆盖与显式尺寸优先。
- 桌面工具视觉：纯白（深色模式 `#0d0d0d`）净面与克制的黑白灰阶边界、柔和圆角，紧凑控件放在宽松的容器留白中，避免过度堆叠灰色底板。品牌色可配置（默认 `#007aff`，支持 `'neutral'` 自适应黑白灰单色主色），收敛至主要操作 `Button`、勾选/开关/滑块/进度、日历选中日期、分页当前页、默认线形标签页、表单字段聚焦、表格激活排序/拖拽指示与状态标识；卡片/分段标签页与菜单保持黑白灰中性外观；更换品牌色时视觉结构保持一致。
- 中性角色来自一套由 `neutralColor` 种子（默认纯灰 `#707070`）生成的共享色阶：默认灰阶不偏蓝，显式带色相的中性基色仍保留其色相。浅色模式把文字、边框、表面映射到适合浅底的档位，深色模式把同一色阶映射到深色表面。组件消费这些角色，不硬编码中性值。语义状态色和可读的焦点反馈与中性表面区分开。
- 可选主题预设可以使用更粗的外边框和偏移阴影；token 缺省时默认外观不变。全局 `borderWidth`、`controlShadow`、`surfaceShadow` 与显式组件状态绘制必须经由 ConfigProvider 生效，包括 Portal 和 API 反馈服务。结构分割线保留自身细线。
- 更粗的边框从内部控件几何和嵌套圆角中扣除，不增加控件高度。自定义阴影必须保留清晰的焦点轮廓、禁用语义、减少动态效果与强制颜色模式。预设只包含可移植的主题数据；文档装饰不得提供私有组件皮肤规则。

### 尺寸与密度

公开基础标尺统一见[界面指南：字号与字重](apps/docs/docs/guide/design-standards.mdx#字号与字重)、[间距与密度](apps/docs/docs/guide/design-standards.mdx#间距与密度)和[尺寸、圆角与阴影](apps/docs/docs/guide/design-standards.mdx#尺寸圆角与阴影)。默认值核对 `src/styles/tokens.scss`、`src/density.ts` 与 `src/theme.ts`（相对 `packages/react/`），不在此维护第二份基础数值表；各组件的特殊几何仍由下文约束。

- 组件尺寸是局部选择，密度是区域布局选择。紧凑密度面向指针 / 键盘的数据密集界面；触屏界面使用宽松密度或更大的显式控件，关键目标至少 24 px，建议 44 px。

### 圆角与嵌套

- 层级来自圆角、边框和字体，不来自装饰。默认圆角：小标签 5px（`--leaf-radius-sm`）、控件 10px（`--leaf-radius`，并按 `sm / md / lg` 尺寸提供 `8 / 10 / 12px` 阶梯：`--leaf-control-radius-sm` / `--leaf-radius` / `--leaf-control-radius-lg`）、内容面 14px（`--leaf-radius-md`，`sm / lg` 卡片与带边框 `Descriptions` 为 `12 / 16px`）、浮层与抽屉 16px（`--leaf-radius-lg`），均由基础圆角按整数偏移步进（`-5 / -2 / 0 / +2 / +4 / +6 px` 并下限归零）派生（`borderRadius: 0` 时全数归零）。Square `Avatar`（sm / md / lg）使用 `8 / 12 / 16px`，`Tag`（sm / md / lg）使用 `4 / 5 / 6px`，`InputOTP`（sm / md / lg）使用 `8 / 10 / 12px`。
- 圆角由外向内递减：Modal 与 Confirm 用 medium，抽屉和通用浮层用 large；表单浮层跟随字段实际圆角，Dropdown 使用组件圆角或基础圆角；内容面（Card、Collapse、Descriptions、Transfer、Upload、FileList、Result 内容、选择卡片与列表）用 medium；按钮、字段与 Alert 用 base；复选框与小标签用 small；Table 仅顶部使用 base 圆角，Tag 见下文。
- 嵌套表面使用同心曲线：`内圆角 = max(0px, 外圆角 - 内边距 - 边框宽度)`。例：外圆角 16px、内边距 6px、边框 1px 的通用浮层，内圆角为 9px。
- 选择类浮层与 Dropdown 的选项圆角固定为字段 / 基础圆角减 2px（最小为 0），与 Select 一致，不随面板内边距变化；行内反馈层继承该选项圆角。日期 / 时间面板内的时间行、日期格与日历标题同样使用该选项圆角；周选择只在行首尾保留外侧圆角。其他嵌套表面使用共享几何辅助函数处理不等的横纵内缩。主题和组件内边距变化自动更新曲线；小圆角与直角主题收敛到 0。
- 独立控件、日历格、标签和图标保留各自的语义圆角。不要用裁剪掩盖圆角不匹配。

### 文字

- 只使用 400 / 500 / 700 三种字重：正文 400，控件和普通分区标签 500，强调文字和醒目标题 700。
- 正文使用 400，Modal、Confirm、Drawer 与 Card（`sm / md`）标题使用 `fontWeight`（默认 500），`Table` 表头使用 600；`Typography` 与 `Card` `lg` 强标题使用 `headingWeight`（默认 700）；普通标签和按钮使用 `fontWeight`（500）。
- 伴随文字的指示物（Steps 图标、Result 与 Upload 符号）按文字尺寸确定大小，不按控件高度。

### 阴影与边框

- 纯白内容面在白色背景上通过清晰而不过重的中性外框区分边界：`Card`、`Collapse`（bordered）、`Descriptions`（bordered）、`Transfer`、`Modal`、`Drawer` 与 `FileList` 外框统一使用 `--leaf-color-border`（浅色 `#e5e5e5`，深色 `#262626`）；`Card` 默认加最轻的朝下静止阴影（`shadow-xs`），内嵌标签栏分割线复用基于 `--leaf-color-divider` 柔化 70% 的 `softened-frame-color`；`Table` 保持平面、默认无外框，网格与分隔线同样使用 70% `softened-frame-color`。
- `Button`（`outline` 与 `solid`）使用极轻的 `--leaf-shadow-control`（`0 2px 0 rgb(0 0 0 / 0.02)`）；`Collapse`（bordered）、`Transfer` 面板与 `Upload` 符号徽标共用朝下的 `shadow-xs` 静止阴影，悬停不抬起；`Pagination` 当前页使用无阴影 `solid` 按钮。
- 普通内部分割线、`Modal`（`size="mini"` 除外）/ `Drawer` 标题底线与页脚顶线（`divided`）、`Transfer` 表头底线使用更轻的 `--leaf-color-divider`（浅色 `#eaeaea`，深色 `#212121`），形成“外框清、内线轻”的层级。
- 更强的阴影只用于浮起的层和手柄：分段 `Tabs` 轨道保持扁平无阴影、选中滑块使用 `shadow-sm`；浮层、`Modal` 与 `Confirm` 使用 `shadow-md`；`Drawer` `shadow-lg`；滑块手柄使用各自抬起阴影。

### 像素网格

- 默认几何落在整像素：正文 / 次要 / 大号行盒为 20 / 18 / 22 px；26 / 32 / 38 px 控件、默认 Card 标题行盒（20 / 22 / 24 px）、浮层行与步骤指示器均为整像素。Steps 指示器至少 24 px，大号 28 px。
- 显式小数 token、自定义字号、相对宽度和 SVG 内部坐标仍可能产生小数几何；不要为掩盖应用自身布局而对任意内容取整。

## 状态

### 状态契约

| 状态        | 要求                                                                                                                                                                                                                                                                    |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 默认        | 文字清晰、图标对齐一致、几何稳定                                                                                                                                                                                                                                        |
| 悬停        | 颜色或边框反馈；普通操作与悬浮按钮保持位置、尺寸与阴影层级不变                                                                                                                                                                                                          |
| 按下        | 立即的颜色反馈；`Button` 与其余控件、条目按下均使用克制的变色、透明度或阴影收敛（零按压位移、零按压缩放、零外缘波纹、不改变外围几何）                                                                                                                               |
| 键盘焦点    | 可见且不引起布局位移：输入和选择类字段（含 Textarea、Mentions、InputNumber）与 InputOTP 激活格聚焦或展开时统一使用清晰边框（默认 `--leaf-color-primary`，校验态或显式中性变体随其变化）并叠加克制的 2px 10% 半透明外环；按钮使用中性键盘轮廓；强制颜色模式保留可辨识轮廓 |
| 选中        | 语义化的选中背景 / 指示加 ARIA 状态；不能只靠颜色，且已选状态的样式不受悬停或高亮覆盖                                                                                                                                                                                    |
| 禁用        | 不可操作，原生 / ARIA 状态正确；与 loading 区分                                                                                                                                                                                                                         |
| 加载        | 尽量保持标签与宽度；暴露 busy 状态；防止重复提交                                                                                                                                                                                                                        |
| 错误 / 警告 | 状态文字和图标；适用时提供可聚焦摘要；不只依赖颜色                                                                                                                                                                                                                      |
| 空          | 说明什么为空，必要时提供下一步操作                                                                                                                                                                                                                                      |

### 颜色

- 主题色用于可操作的强调；success / info / warning / danger 表达含义。弱化文字保持可读；自定义色板须对实际前景 / 背景组合满足 WCAG 对比度。透明派生色使用预乘 sRGB alpha。
- 默认语义基色在 `colors.ts` 声明一次，浅深外观共享，经由 JS `generateColorShades` 与 `resolveColorRoles` 映射为 `--leaf-color-*` 用途角色输出；组件不得重新声明。基色：primary `#007aff`（支持 `'neutral'` 自适应黑白灰单色主色）、success `#4bb418`、danger `#ff4d4f`、warning `#e69f12`、info `#1677ff`。用户提供的具体 primary 保持原值，不改写、不强制为 500 档。
- 浅深模式都保留显式主色实底；外观切换只换用途映射与 `'neutral'` 单色主色（浅 `#0d0d0d` / 深 `#f5f5f5`，对应 `on-primary` `#ffffff` / `#0d0d0d`），不重新着色具体基色。非主色语义 `ink` 与实底前景（`on-*`）的默认值见 [颜色系统：角色映射与选阶](COLOR-SYSTEM.md#角色映射与选阶)；内置主色控件与指示统一直接使用 `--leaf-color-primary`。不要为了让主色文字可读而提亮所有主色实底；显式组件 / 状态、前景和焦点覆盖优先。
- 键盘焦点反馈以清晰中性轮廓与主题色字段边框为主：按钮与常见控件复用 `--leaf-color-text-muted` 轮廓（可通过 `--leaf-color-focus` 显式覆盖），输入与选择字段悬停切换边框至 `--leaf-color-primary-hover`、聚焦或展开时默认采用 `--leaf-color-primary` 边框配 2px（10%）半透明主题色外环（校验态与显式中性字段分别跟随语义色或 `--leaf-color-border-hover` / `--leaf-color-text-muted`），`Slider` 滑块在 `:focus-visible` 时叠加 `accent-halo-focus-color`。
- 实底 Button 默认透明边框，即使基色与周围表面相同也不自动补对比边框（常规 `tokens.borderColor` 不改变其透明边框；显式 `tokens.frameBorderColor`、组件和状态边框覆盖及系统强制颜色模式仍有效）。保留独立的 on-primary / on-success / on-danger / on-warning / on-info 角色，即使取值相同。浅深模式可以共享取值；只有确有视觉或对比需要时才区分，不复制完整矩阵。
- Checkbox、Radio、Switch 的选中实底与边界统一使用原 primary 与 on-primary 内容（未选中控件常态边框使用 `border-hover`、悬停加深为 `text-muted`）；不得把派生色阶用作实底却沿用另一颜色的前景。显式组件绘制覆盖优先。
- Checkbox 与 Radio 按下不缩放控件；选中边框与填充使用主题基色，显式组件边框与状态覆盖优先。Checkbox 对号与半选横线使用 SVG `stroke-dashoffset` 绘制过渡；Radio 选中圆点按 Ant Design 5 使用 300ms 的 `cubic-bezier(0.78, 0.14, 0.15, 0.86)` `clip-path` 中心展开与透明度过渡，圆框颜色使用 200ms ease；时长随区域 motionDuration 缩放，遵守减少动态效果设置。
- Switch 关闭态在两种外观下都是中性灰轨道配亮色滑块，不用浅色轨道配深色滑块。轨道默认边框与填充同色；显式 `frameBorderColor`、组件、状态绘制覆盖优先。关闭态 loading 图标保持中性；开启态轨道与 loading 图标使用 primary，滑块使用 on-primary。修改 on-primary 不得改变关闭态滑块。
- Warning 图标、字段强调与状态填充使用共享琥珀基色（`#e69f12`）；警告文字独立派生可读 ink。Tag 的 soft 标签文字跟随对应语义基色，solid 标签文字使用白色；不要为文字对比度把所有警告强调色调暗。

### 动效

- 普通操作反馈使用 120–200 ms 缓动。链接文字颜色按 Ant Design 使用 200 ms ease-in-out，均随区域 motionDuration 缩放。对话框与抽屉最长 320 ms；抽屉滑入无过冲。Message 与 Notification 整体入场，内部图标 / 文字无弹性。
- 选中指示在同组切换时可移动到新选中项（`Tabs` 的 `card` / `segmented` 滑块保留 `--leaf-motion-spring`，`line` 指示线使用 `calc(var(--leaf-motion-color) * 1.5) ease` 平移），其余组件、浮层与弹窗均采用无过冲 `--leaf-motion-easing`；悬停时 Card、按钮与悬浮按钮保持位置与表面阴影；`Button`、`FloatButton` / `BackTop`、选项行、日历格与各类交互控件按下均只改变颜色、透明度或阴影收敛而不做按压缩放与位移，不移动周围排版。
- 遵守系统减少动态效果和 `theme.motion={false}`；动画永不阻塞功能，所有动效在减少动态效果下均关闭。
- 颜色过渡共用 `--leaf-motion-color`（当前等于标准动效时长），覆盖字段、按钮、菜单表面与浮层选项行。

## 操作

### Button

- 外观：`solid`、`outline`、`text`、`link`、`danger`，默认 `outline`。所有外观按下均只呈现颜色或边框反馈，保持布局占位与位置静止，不做按压位移或缩放。
- 按钮与紧凑操作在悬停、按下和恢复时共用同一绘制过渡时长与缓动。loading 内容使用同一缓动，无弹性。无外缘波纹；指针激活不显示焦点光环；键盘焦点使用中性轮廓，强制颜色模式下仍可见。
- `solid`：默认透明边框配极轻底阴影 `--leaf-shadow-control`，悬停切至 `--leaf-color-primary-hover`，按下加深为基色混入 10% 黑色（`--leaf-button-active`），不量化。前景色见 [颜色系统：角色映射与选阶](COLOR-SYSTEM.md#角色映射与选阶)。
- `outline`：内容表面、正文色配 `--leaf-color-border` 边框与极轻底阴影 `--leaf-shadow-control`（参考 Ant Design 默认按钮）；悬停时边框与文字切至 `--leaf-color-primary-hover`（背景保持内容表面），按下时边框与文字进一步加深至 `--leaf-color-primary-link-active`，松开恢复。相邻拼接按钮组在悬停与按下时保留完整四边主色边框。文字、边框与背景使用共享颜色过渡，显式组件和状态覆盖优先。
- `text`：常规按钮高度和行内内边距，正文色、透明静止背景。悬停使用 50% 不透明度的中性选项悬停底，按下使用完整强度，不改变几何。
- `link`：使用主题基色 `primary`，无边框、内边距和控件最小高度。悬停文字使用 `primary-link-hover` 亮色，按下使用 `primary-link-active` 深色。显式组件文字和状态覆盖优先；无波纹。
- `danger`：单一危险按钮外观（参考 Ant Design filled danger：浅红底 + 危险文字），静止态直接使用 `--leaf-color-danger` 前景、`--leaf-color-danger-soft` 背景、透明边框与无静止阴影；悬停向 `--leaf-color-danger-soft-hover` 混合 50%，按下切至完整的 `--leaf-color-danger-soft-hover`。兼容属性 `danger` 标记为 `@deprecated`，传入时统一回退为 `variant="danger"`。
- 水平内边距参考 Ant Design 并对齐整像素网格：`sm` / `md` / `lg` 常规水平内边距分别为 `11px` / `15px` / `19px`（含 1px 边框视觉边距 12 / 16 / 20px），存在图标或加载指示器时仅图标所在一侧收窄为 `7px` / `11px` / `15px`（支持自动识别首尾直接子级 `svg` 图标与显式 `data-icon="inline-start"` / `"inline-end"` 标记）；`sm` / `md` / `lg` 图标尺寸对应 `14px` / `16px` / `18px`、图文间距为 `6px` / `8px` / `8px`，纯图标按钮使用 `size="icon" | "icon-sm" | "icon-lg"` 正方形零内边距。显式交互 token 与组件状态覆盖优先。

### 紧凑操作

- 清除、显隐、关闭等紧凑操作复用文字按钮的 text-action 配方，保留所属组件的点击区域尺寸，最小 24px。
- 每个纯图标操作都需要可访问名称；当相邻文字已表达含义时，图标为装饰性。

### Pagination

- 默认使用描边样式 `variant="outline"`；`variant="ghost"` 为常规分页与翻页按钮提供透明无边框样式。两者共用控件高度 token、稳定的按下几何与默认 `--leaf-color-text` 正文色（含总数、省略号与条数标签）。
- 上一页、下一页按钮采用正方形纯图标按钮，仅展示左右箭头图标并通过 `aria-label` 保留“上一页 / 下一页”（英文 “Previous / Next”）无障碍名称，不展示文字标签。
- `outline` 与 `ghost` 模式下，非当前页与翻页按钮分别保持表面填充描边（`outline`）或透明无边框（`text`）；当前选中页统一使用按钮的 `solid` 样式（`--leaf-color-primary` 背景配 `--leaf-color-on-primary` 前景，无阴影），并保持不可点击、悬停时鼠标指针保持 `default` 且无视觉变化，不使用滑动指示器过渡动画（整组分页 `disabled` 时同步应用禁用透明度与 `not-allowed` 指针）。
- `showSizeChanger` 在禁止输入搜索的紧凑下拉框内部展示 `{count} 条/页`（英文 `{count} / page`）；`showQuickJumper` 展示“跳至 [输入框] 页”（英文 “Go to [input] page”），在 Enter 或离开分页区域时提交，不覆盖已点击的分页操作。`showTotal` 接受布尔值或渲染函数，页码和每页条数变化使用同一回调。

## 选择与导航

### 选项行

- Select、Cascader、TreeSelect 与时间列消费带选中强调的 `choice-option(false, true)` 配方：未选中项悬停和键盘高亮使用半强度中性反馈（32% `option-hover`）与完整继承正文文字色；已选中项使用 `--leaf-color-primary-soft` 浅主题色底与 `--leaf-font-weight` 字重、不再在右侧显示对号图标，且悬停/聚焦/按下/高亮不覆盖已选中样式（`TreeSelect` 在 `treeCheckable` 模式下仍使用复选框）。AutoComplete、Mentions、独立 Tree 与 Dropdown 继续使用中性 `choice-option` 配方（独立 Tree 保留选中对号；AutoComplete 与 Mentions 的 ARIA 候选态保持中性）。
- Checkbox 与 Radio 禁用时，未选中的指示器使用 `surface-muted` 背景和 `border` 边框，已选中或半选的指示器使用 `border` 背景，保留组件级 disabled 颜色覆盖；文字和整体不可交互状态沿用共享禁用规则。
- 每行只渐变自身背景色（默认 200ms），不使用移动高亮、透明度或内缩动画。
- 这些行跟随当前控件高度（宽松 / 紧凑 32 / 28 px，遵循显式组件 token），行间无额外间隙；长标签换行并增高行。Select 与 AutoComplete 的显式 `optionHeight` 优先，Select 浮层外框内边距默认为 `4px`、分组标题上下内边距收敛为 `6px / 2px`。其他浮动列表（Menu 子菜单、时间列）使用通用浮层选项最小高度。Tree 的层级缩进属于行布局。
- Dropdown 浮层外框默认内边距为 `4px`，未指定宽度时从 160px 最小宽度按完整内容增宽，达到最大宽度或视口边界后才换行；右侧 extra 按自身内容占位，不固定占据一半菜单。`size` 的 sm / md / lg 同时控制字号、行高、图标（`12 / 13 / 15px`）、选项最小高度（默认 `26 / 30 / 34px`）与行内间距（`6 / 8 / 10px`，默认 md 图文间距仍为 12px），子菜单继承尺寸。含子菜单的父菜单项收窄右侧内边距且悬停/展开时箭头保持静止；分组标题上下间距收敛为 `4px / 2px`；子菜单紧贴父触发项边缘并与当前触发项顶边平齐，向父菜单方向内收消除外侧空隙。
- 浮层外框匹配字段圆角（包括组件覆盖），选项为该圆角减 2px（最小 0）。Mentions 跟随其 Textarea 字段，所有基于 DateInput 的日期 / 时间浮层跟随 DatePicker 字段槽。Portal 几何不得继承外层 Card 或 Menu 的表面圆角。
- 选中值变化时立即更新触发器标签，不重放内部文字动画。Cascader 父级变化时立即替换更深列，不用会被看成闪烁的淡入。

### 多选标签

- Select、TreeSelect、Cascader 共用多选标签：高度为当前控件高度减 8 px，行内间距 6 px。字段内边距默认上下各 3 px；Select 的行内起点与单选共用字段间距，TreeSelect、Cascader 的行内起点为 3 px。行内终点预留清除与箭头的实际空间；显式组件内边距优先。
- 默认换行；`tagWrap={false}` 或 `maxTagCount="responsive"` 保持单行、截断长标签并把多余值折叠为 `+N`。放不下标签时只显示计数。
- 折叠只影响展示，不改变选择或 FormData；按宽度折叠不重放选择入场动画。
- TreeSelect 在浮层卸载后保留展开分支；搜索展开是临时的，方向键只展开；checkbox 行的标签与空白区域都可激活。

### 浮层滚动

- Select、AutoComplete、TreeSelect、Mentions、Cascader 的浮层溢出使用共享 Scrollbar，包括 Cascader 列的横向溢出。每个滚动区域只保留一个滚动视口，使虚拟列表测量、滚动回调和键盘导航使用同一元素。滚动条交互保留触发器的输入焦点。

### Menu

- 只支持纵向，布局与键盘语义独立于外观。`variant` 可选 `neutral`、`raised`、`primary`，默认使用 `neutral`；每种外观提供完整的状态配色、边框、阴影与进出时长；内联和浮动导航共用同一状态绘制器，不事后覆盖默认选中规则。
- `neutral`：悬停使用轻盈的 `choice-option-background()`（32% `option-hover`），按下与选中保持 `--leaf-color-surface-muted`（不再让悬停与选中同底混淆）；未选中行文字为 80% 继承色混合区域表面，选中行为完整文字色。
- `raised`：灰色画布、主题表面选中块、1px 中性边框和共享 `--leaf-shadow-xs` 轻阴影；悬停只加深文字，按下使用 `choice-option-background()`。
- `primary`：普通未选中一级项的文字使用完整正文色（组件文字覆盖优先），图标与箭头保留原有弱化色；选中使用主题基色 `primary` 与 5% primary 填充，不使用会调整深浅的 primary ink；悬停同色文字无背景；按下使用 `--leaf-color-primary-alpha-4`，松开时淡出到透明，不经过灰色背景；选中无边框或阴影。
- `raised` 与 `primary` 入场时长为标准时长的 1.2 倍（默认 240ms），立即清除旧选中，无灰色退出。
- 所有外观的菜单项统一使用控件字重（默认 500），内联、浮动、选中与未选中项一致；行背景覆盖层保持 `inset: 0`（不做矩形内缩扩张），保留危险语义、禁用行为、键盘轮廓、减少 / 关闭动效与系统强制颜色。只高亮当前页，不高亮其祖先。
- 子菜单由点击、键盘或代码更新展开状态时共用相同过渡；首次挂载为展开状态也有进入动画，首次懒加载先建立收起布局，关闭时保留内容并立即禁用交互。快速反向切换从当前进度继续；嵌套子菜单只响应自身展开状态，折叠态浮动弹层独立管理开启状态且透传自定义渲染、链接包装与类名，折叠叶子项通过 `Tooltip` 展示名称。内联子菜单中按下 `Escape` 只收起当前焦点所在最近一层父级并将焦点移回父项，减少或关闭动效时直接呈现目标状态。
- 行圆角为基础圆角减 2px（默认 6px），浮层外框用基础圆角。顶层行高为控件高度加 2px（34 / 30px），二级及更深子菜单与折叠浮动子菜单行统一采用与 `Dropdown` 对齐的 `max(24px, calc(var(--leaf-control-height) - 2px))`（30 / 26px 最小高度，允许内容撑高不写死像素高度）；16px 图标占 20px 槽，图标与文字间距 12px。内联子项占满菜单可用宽度，不显示层级竖线；二级项的内容起点与有图标的一级项文字起点对齐，更深层级每级缩进 32px（由 `--leaf-menu-depth` 计算）。内联和浮动子菜单的普通未选中文字使用次要文字色，组件文字覆盖优先；选中、危险和禁用语义保持原样。反馈不改变排版占位；子菜单与浮层保留共享的展开动效，内联与浮动菜单选项按下只应用颜色反馈而不做按压缩放。

### Tabs

- 只支持横向，提供 `type?: 'line' | 'card' | 'segmented'`（默认 `'line'`）；标签按下只更新颜色反馈，不做按压缩放。
- line：沿用简洁开放式线形规范。项间距 `32 px`、`padding-inline: 0`、直角，行高 `--leaf-tabs-line-height` 为字号加 `8 px`（`sm` 保持基础字号 `--leaf-font-size`），上下内边距小/默认/大分别为 `8 / 12 / 16 px`（与行高相加导出默认最小高度，显式组件高度、字号和 gap 覆盖优先）。未选中标签使用 `--leaf-color-text`，悬停使用 `--leaf-color-primary-hover`，按下使用 `--leaf-color-primary-link-active`，选中使用 `--leaf-color-primary` 配轻描边 `text-shadow: 0 0 0.25px currentColor`（颜色过渡 `calc(var(--leaf-motion-color) * 1.5) ease`；显式组件文字覆盖优先）。头部底部绘制 `1 px` 全宽 `--leaf-color-divider` 分割线（`placement="bottom"` 时放在栏顶），共享滑移指示条默认使用 `--leaf-color-primary`（2 px 厚，与标签文字等宽；可通过组件 indicatorColor 覆盖），切换选中项时通过 `transform` / `width` / `height` 平滑滑移（`calc(var(--leaf-motion-color) * 1.5) ease`）。
- card：去掉外围栏，项间距 4 px，未选中标签使用弱文字色（`--leaf-color-text-muted`），选中滑块使用 `--leaf-color-surface-muted` 配 `--leaf-color-text` 文字。滑块使用 `--leaf-motion-spring` 移动到选中项，保持 26 / 32 / 38 px 控件尺寸与 12 px 行内内边距。
- segmented：浅灰外轨（`--leaf-segmented-background`，即 `--leaf-color-surface-muted`）配 `1px solid transparent`（`--leaf-segmented-border`）且无外轨阴影，默认内边距 3 px，小尺寸上下内边距为 2 px、左右仍为 3 px；项间距 3 px；轨道高 26 / 32 / 38 px，标签行内内边距 14 px。使用 `--leaf-color-surface` 纯白滑块配 `--leaf-shadow-sm` 阴影与 `--leaf-color-text` 文字（悬停 / 按下高亮为 `--leaf-color-text`，未选中为 `--leaf-color-text-muted`）。滑块使用 `--leaf-motion-spring` 移动到选中项。
- 大尺寸 card 与 segmented 外观的标签行内内边距为 18 px，项间距为 8 px，分段轨道内边距为 4 px；显式组件 gap 和 padding 继续优先。
- `block` 等宽铺满；省略项内容可作为只有标签栏的视图切换器。标签溢出时在两侧显示描边纯图标滚动按钮，仅在标签栏悬停或获得键盘焦点时出现。
- 内容与面板高度立即更新，无入场、淡入、滑动或高度动画；三种外观的选中指示条 / 滑块均保留移动动画（`card` / `segmented` 使用 `--leaf-motion-spring`，`line` 使用 `calc(var(--leaf-motion-color) * 1.5) ease`）。
- Tabs 不作为表单字段提交；需要原生提交时由表单单独持有字段。

### Tag

- 外观 `soft` 与 `solid`，字重 500，标签最小 12px，统一使用组件小圆角。soft 使用浅色背景与颜色文字，solid 使用语义颜色背景与白色文字；默认标签为灰色背景和黑色文字。标签不提供内置圆点，只有显式 `icon` 才增加前置内容；显式组件圆角 / 绘制覆盖优先。
- CheckableTag 与 TagGroup 未选中使用中性 soft，选中使用 primary solid，两个状态保持相同圆角。关闭按钮的视觉背景收敛到图标尺寸，保留键盘焦点轮廓。

### Badge

- 附着 Badge 默认 `placement="outside"`：计数的行内起点固定在目标行内终点边界内 14 px，红点使用 8 px 锚点。两者最小尺寸时位置不变，只向行内终点方向外扩；更宽的值不围绕目标边界重新居中。
- `placement="inside"`：指示器距顶部和行内终点 6 px，向内扩展，两种外观都加 2 px 表面色分隔环（环外缘距目标 4 px）。
- 位置不改变目标几何或交互；确保目标有空间容纳指示器而不遮挡内容。两种位置都在 RTL 中镜像，只影响附着指示器。

### Steps 与 Avatar

- Steps 标签背景透明；横向连接线在标签之后占据自身空间，不从标签下方穿过。
- Avatar 使用单道 2px 表面色边框（包括重叠的头像组），不再加额外轮廓阴影。
- AvatarGroup 的纯文字头像按组内顺序循环使用 primary / info / warning / danger 的 soft 与 ink 配对及中性 surface-muted / text-muted；仅用于区分成员，不表达状态。图片、默认图标、独立 Avatar 与人数计数保留中性回退，显式 Avatar 绘制覆盖优先。

### 日期与时间输入

- 单行字段共用稳定的 240px 默认宽度（Input、InputNumber、InputSearch、Select、AutoComplete、Cascader、TreeSelect 与单值日期 / 时间），最大宽度不超过容器；选值 / 清空不改变宽度。日期区间 300px，日期时间区间 380px，日期时间显示秒或时段时单值 280px / 区间 440px，纯时间区间长格式 300px。显式 style.width 优先；FormField 内默认铺满，Textarea 保持 100%。`InputNumber variant="split"` 仍以整组共用同一 `240px` 默认宽与外置 8px 间距，在输入框左右两侧独立放置正方形纯边框减 / 加按钮并将输入数值居中展示。

- 日期、时间和范围字段共享原生 input 的分段选择：数字输满或无法接下一位时自动换段；Tab / 空格切到下一段（包括空段），Shift + Tab 返回上一段，左右键换段，上下键步进，Home / End 到首尾。首段 Shift + Tab、末段 Tab 按正常顺序离开字段，不循环；清除可用全选后 Delete；点击字段或图标展开面板，Alt + 下键移入面板。
- token 型日期 format 决定段顺序与字面量；函数型或无 token 的格式保留文本输入；DatePicker 仅支持单值，不支持多日期数组。粘贴整值沿用既有解析器。输入中保留不完整草稿，非法日期或越界时间不提交；Escape 还原，表单值始终是已提交的标准格式。
- 只保留 DatePicker 与 DateRangePicker，通过 picker 切换日期、时间、日期时间或日历粒度。分段选中文字使用 info 蓝色与 on-info 前景；字段聚焦 / 展开沿用共享中性 `field` 配方。有效输入实时更新日历与时间列，不提前提交表单值。
- 时间浮层复用独立时、分列，开启秒后增加秒列；12 小时制另有时段列，上午 / 下午与列标题保持单行；列数增加时浮层随之加宽。分钟 / 秒步长默认 1，保留已有非步长值。时间行文字居中，复用 `choice-option(false, true)` 的中性悬停与 `--leaf-color-primary-soft` 选中浅底（不显示右侧对号、悬停不覆盖选中态），Scrollbar 使用 sm 与 persistent；打开时当前项居中，键盘跳过禁用项。
- 时间列点击只调整草稿，不自动关闭；确定或 Enter 提交。纯时间模式默认在外部点击 / Tab 离开时提交有效调整，needConfirm 时放弃。时间区间分为开始 / 结束两组并以细线分隔，不显示时长；未允许跨夜时禁用早于开始的结束时间。

## 表面与复合组件

### 对话框通用

- 默认表面中，对话框标题、表单边缘与页脚操作共用同一行内内边距；正文与标题、操作之间有足够间隔。标题与辅助描述共用独立的文字列；关闭操作在行内终点；正文滚动时标题与页脚不动。
- Modal、Drawer 及基于 Modal 的浮层默认使用半透明灰色遮罩、无背景模糊；ConfigProvider `maskBlur` 显式开启模糊。Tour 保留现有无模糊聚光遮罩。
- Modal 与 Drawer 的标题图标共用中性表面，与右侧标题文字保持 `--leaf-dialog-gap` 水平间距（宽松 16 px / 紧凑 12 px，窄屏 12 px），具体几何遵循各自组件约定。边框与表面来自当前浅 / 深区域，包括自定义色板与密度。

### Modal 与 Confirm

- 水平居中，普通高度时通过额外的底部弹性留白维持视觉偏上，位置与底部视口内缩 16dvh（限制在 24–160 px）时一致；内容增高时优先压缩额外留白，达到高度上限时上下各留 24 px，最大高度为 `100dvh - 48px`，继续增高则滚动正文。
- 默认阴影为共享 `shadow-md`；显式组件与表面阴影优先。
- Modal 与 Confirm 统一使用 medium 圆角（默认 14 px），外框使用实体 `--leaf-color-border`；开启 `divided`（Modal 默认 `true`，可设为 `false` 关闭）时，在非 `size="mini"` 弹窗的标题栏下方与页脚操作栏上方同时绘制 1 px `--leaf-color-divider` 全宽分隔线（`size="mini"` 与 Confirm 仍保留仅页脚顶部分隔线的紧凑确认布局）；显式组件圆角和边框颜色优先。
- Modal 默认使用内容表面（默认浅色 `#ffffff` / 深色 `#0d0d0d`）。标题使用大号文字（默认 16 px）与常规控件字重（`fontWeight`，默认 500），说明与上方标题间隔 `--leaf-spacing-sm`（8 px，紧凑 6 px，与容器区块 `gap` 16 px / 12 px 构成 1:2 比例）；对话框浮层本身承担统一的四周内边距（宽松 20 px / 紧凑 16 px）与区块间隔 `gap`（宽松 16 px / 紧凑 12 px），标题栏本身不再叠加内边距（`padding: 0`，仅在显式分区覆盖或自定义页眉背景时抵消外边距贴边生效）；标题与描述直接位于浮层内部（无标题时不渲染空标题栏）；正文滚动画布保持 `width: auto` 与横向全宽以抵消 `.leaf-scrollbar` 的 `100%` 宽度约束并使滚动条贴边，内容容器补齐行内边距并归零首尾子元素外垂直边距；Modal（含 Confirm）页脚采用由表面色与 `surface-muted` 等比混色的克制浅底（`subtle-action-background`，可通过 `footerBackground` 覆盖；Drawer 保持 `transparent`），无论是否启用 `divided` 均贴合左右与底部同心内圆角并默认保留 `--leaf-spacing-md`（16 px，紧凑 12 px，可随整弹窗 `padding` 与页脚分区同步缩放）上下留白，取消操作默认使用描边按钮。关闭按钮为 32 px、内边距 8 px、内部图标 16 px，固定绝对定位于浮层右上角：纵向按首行标题行高垂直居中（`inset-block-start` 从顶部外边距出发并叠加 `(line-height-lg - 32px) / 2`，默认 15 px），横向从外边距减去按钮自身 8 px 内边距（`inset-inline-end` 默认 12 px、紧凑 8 px，低边距场景下限保护 4 px），使 16 px 关闭图标精准对齐首行标题中心与内容行内终点边界；启用浮层关闭按钮时自动为头部文字行内终点预留避让距离，避免长标题或描述与按钮重叠。支持通过 `padding?: ContainerPadding`（`number | string | 'none' | { header?, body?, footer? }`）按整体或分区独立覆盖内边距；显式组件内边距与分区背景优先（Confirm 不继承公开 `padding`）。
- Modal 的标题图标底座在默认 `size="md"` 下使用大号控件尺寸（默认 38 px），图形为 20 px，无边框，圆角使用基础圆角 `--leaf-radius`（默认 10 px），顶部与标题行对齐（`align-self: flex-start`，不做垂直居中）；默认采用 `--leaf-color-surface-muted` 灰色背景配 `--leaf-color-text` 黑色/正文色图标。`size="md"` 说明使用区域小号文字（默认 13 px / 行高 18 px）。启用 `danger` 时主确认按钮切为 `variant="danger"`，标题图标底座消费 `status-label-family(danger)` 的减淡红色背景（`--leaf-color-danger-soft`）与直接危险色前景（`--leaf-status-label-base`，即 `--leaf-color-danger`，不加深）。
- Modal 新增 `size="mini"` 紧凑确认布局：未手动设置 `width` 时默认收窄至 `340 px`；头部改为居中纵向排布（图标底座扩展为 `controlHeightLg + 2px`，默认 40 px、圆角 `--leaf-radius` 10 px、`align-self: center`），说明与无 description 时的简短正文在标题下方 `--leaf-spacing-sm`（8 px）处居中显示并使用基础字号；有居中图标时标题位于关闭按钮下方不额外偏置，无图标时左右对称预留关闭按钮避让；页脚按钮采用等分网格布局（双按钮平分区域，单按钮铺满全宽，极窄屏自动换行堆叠）。
- Modal、Confirm 与 Drawer 的页脚容器均自带 `8 px` 按钮间距（`gap: 8px`），内置取消/确认按钮直接放在页脚容器内，自定义页脚无需额外包裹 `Space`。
- Confirm 复用 `Modal` 的 `size="mini"` 紧凑确认架构（默认宽 `340 px`、居中图标与标题、`divided` 浅底等分按钮页脚、字重 500），并移除 `info` 类型与内联错误条：默认 `type="default"` 采用 `--leaf-color-surface-muted` 灰色底座配 `--leaf-color-text` 黑色 `Info` 图标，其余 `success`（无圆圈 `Check`）、`warning`（`TriangleAlert`）与 `danger`（`CircleAlert`，失败弹窗用 `CircleX`）分别消费 `status-label-family` 的减淡语义底色与未加深的基色图标（`--leaf-status-label-background` / `--leaf-status-label-base`），`type="danger"` 同步启用 `danger` 按钮样式；`onConfirm` 失败时不再留在原框内展示红色错误条，而是关闭当前框（返回 `false`）并顺位弹出单按钮 `danger` 失败提示框（仍支持 `icon={null}` 隐藏图标）；`closable` 与 `maskClosable` 默认关闭。

### Drawer

- 抽屉外层遮罩四边保留轻量留白（`--leaf-drawer-offset`，默认跟随 `--leaf-spacing-sm`，即宽松 8 px / 紧凑 6 px），四个方向（`left`、`right`、`top`、`bottom`）均以悬浮面板展示并使用四角统一 `large` 圆角（`--leaf-radius-lg`，默认 16 px）。使用普通内容表面与实体 `--leaf-color-border` 外框，不嵌套卡片；标题、内容和页脚沿用与 Modal 统一的对话框浮层内边距（宽松 20 px / 紧凑 16 px，区块间隔 16 / 12 px；支持 `padding?: ContainerPadding` 按整体或分区覆盖），正文独立滚动，标题图标保留带边框的中性圆形底座。标题与描述样式对齐 Modal（标题 16 px / 常规控件字重 `fontWeight` 默认 500 / 行高 22 px，描述 13 px / 行高 18 px / 上间距 8 px），无标题且无 `extra` 时不渲染空标题栏；关闭按钮对齐 Modal（32 px、8 px 内边距、16 px 图标，绝对定位于浮层右上角并与首行标题及内容边界对齐，存在 `extra` 时在其首行与关闭按钮并行对齐并预留避让间距）。
- 支持 `showSwipeHandle?: boolean` 在靠近展开边缘的一侧居中显示 `48 × 4 px` 胶囊拖拽指示条并支持指针拖拽滑动关闭（`bottom` 方向默认开启，其余方向默认关闭并可显式覆写）；显示手柄时对应边缘至少保留 `24 px` 安全内边距以避免遮挡头部或内容。
- 分区分隔线默认关闭（`divided={false}`）；开启 `divided` 时在标题栏下方与页脚顶部同时绘制 `--leaf-color-divider` 全宽分割线，页脚保持 `transparent`（延续内容表面），显式 `footerBackground` 覆盖优先。
- 阴影 `shadow-lg`；实心面板保持 `opacity: 1` 纯位移滑入与退出，使用平滑长减速曲线 `cubic-bezier(0.32, 0.72, 0, 1)`（打开 `2.5 × --leaf-motion-duration`，关闭 `1.5 × --leaf-motion-duration` 并同步遮罩退场时长），滑入无过冲。

### Popconfirm 与 Notification

- Popconfirm 与 Notification 的语义图标裸放并与标题行对齐。Notification 的关闭操作只占标题行。

### 日期与时间面板

- 日期、时间与范围选择面板默认 `panelVariant="plain"`，使用普通内容面浮层（浅色外观下为白色），不额外嵌套卡片。显式 `panelVariant="card"` 时浮层是灰色画布，日历、时间列、成对面板和预设区使用 medium 圆角的内嵌内容面，页脚直接放在画布上并与内容面对齐。浅色、深色、RTL 和窄屏保持相同外观契约。
- 提交：默认点击外部或 Tab 离开时提交在面板中调整过的有效草稿，只打开再关闭不改变值；Escape 始终放弃。`needConfirm` 改为只由确定按钮（及输入框 Enter）提交。年、季度、月、周与日期区间选好终点即提交并收起。
- DatePicker 的 datetime 浮层为一个日历与共享时间列，日历内容网格与 292px 普通日期面板等宽，按外框、画布内缩及内容面边框扣除实际占位；浮层按内容自然宽度排列，时间列宽 84px、时段列宽 96px，最大宽度为 `100vw - 24px`。窄于 620px 时日历与时间上下排列；四列时间按视口适度扩宽，日历仍保持普通面板的内容尺寸。选日保留时间，默认 needConfirm 为 true；移除当前时间与完整草稿预览，页脚保留今天、自定义内容和确定。
- DateRangePicker 的 datetime 模式同样只放一个日历与共享时间列，开始端点击“下一步”，结束端点击“确定”提交整个区间。只有该模式在面板顶部显示开始 / 结束标签，复用内部 TabsControl 默认的 line 样式与标签页语义，不重复完整值；其他日期粒度与纯时间区间不显示端点 Tabs。仅日历区间模式显示两个日历；只有开始值时打开即编辑结束。默认 needConfirm 为 true，Escape / 点击外部放弃。
- 区间悬停预览使用浅色区间底、主题色描边和主题文字色的 `--preview` 单元格，不再借用实心选中样式；编辑结束端时无论是否已有结束值，范围底与预览端点都跟随悬停，离开日历后恢复草稿，不提前提交。强制颜色模式下以系统高亮描边区分。预设位于日历左侧竖排（窄于 620 px 时移到上方横排），悬停或聚焦预览，匹配当前草稿时 `aria-pressed` 并锁定区间底色与主色文字（悬停或按下时不改写已选样式与位置）。`allowEmpty` 的清空端点操作位于页脚。
- 日期、月、季、年选项的网格和单元格内缩均为 0，不留行列间距；悬停为与 Select 行相同的 4% 中性底，范围预览无内层描边，保留键盘焦点轮廓。周模式按 weekStartsOn 悬停整周连续高亮。选中日期保留实心主题色（日历语义例外）。
- 页脚可换行。触屏目标尺寸沿用区域密度规则，不按指针类型自动放大。周起点来自 ConfigProvider `weekStartsOn`，周编号仍按 ISO（取所在周内的星期四）。
- 页脚内置的“今天”“当前时间”和清空端点等次要操作使用 small 描边按钮；“确定”保留 small 实底按钮。预设列表和使用者通过 `renderExtraFooter` 传入的内容不受此规则改写。

### Calendar

- 公开 Calendar 是独立实现，不复用浮层 CalendarPanel。完整布局参考 macOS 日历：粗体月份 + 常规字重年份作为标题，行尾为“月 / 年”分段控件与“‹ 今天 ›”按钮组。月视图使用 `divider` 细线网格，数字在格子顶部尾端，每月 1 日带月份缩写；年视图为 4 / 3 / 2 列迷你月历。
- 行尾“月 / 年”分段控件（`.leaf-calendar-view__segmented`）使用 `--leaf-segmented-background`（即 `--leaf-color-surface-muted`）与 `1px solid transparent`（`--leaf-segmented-border`）外框，选中段使用 `--leaf-segmented-selected-background`（`--leaf-color-surface`）、`--leaf-color-text` 文字与 `--leaf-shadow-xs` 轻阴影，未选中段按下时填充 `--leaf-color-option-hover`。
- 选中日期是实心 `primary` 胶囊配 `on-primary` 文字；今天只用主题色粗体数字，不加底色或描边；悬停使用中性浅底，日历格按下加深中性底色而不做缩放。`cellRender` 内容位于数字下方，单行省略。容器窄于 560px 时用单字母星期并居中数字。
- 紧凑日历宽 296px，日期为 30px 圆形目标，标题按钮展开月份选择。DatePicker 与 DateRangePicker 浮层继续复用紧凑 CalendarPanel，外观不受公开 Calendar 影响。

### Card

- 不提供 `hoverable`，不做悬停抬起；保留朝下的轻微静止阴影，`bordered={false}` 可移除边框，`shadow={false}` 可移除阴影。
- `size` 为 small / default / large：内边距默认 `16 / 20 / 24 px`（基于 `var(--leaf-spacing) * 2 / 2.5 / 3`），标题文字 `14 / 16 / 18 px`（行高 `20 / 22 / 24 px`），标题颜色使用 `--leaf-color-text`（浅色 `#0d0d0d`，深色 `#f5f5f5`）；`theme.components.Card.color` 可显式覆盖。`sm / md` 标题使用 `fontWeight`（默认 500），`lg` 标题使用 `headingWeight`（默认 700）；描述使用 `13 px` 次要文字并在标题下方间隔 `2 px`，头部操作垂直居中对齐；页脚默认透明无分割线、按留白自然衔接（正文下方 `0 var(--leaf-card-padding) var(--leaf-card-padding)`，仅封面或无正文标签栏后补足四周 `var(--leaf-card-padding)`）。支持 `variant?: 'default' | 'layered'`（分层外观将标题与页脚置于 `surface-muted` 外层画布、内层内容面使用 `surface` 与轻阴影，且不展示 `description`）和纯视觉的 `selected?: boolean`（主题色外框且移除阴影，不添加交互语义）。保留 `padding?: ContainerPadding`（`number | string | 'none' | { header?, body?, footer? }`）按整体或分区独立覆盖内边距；显式组件内边距与页脚背景覆盖优先。
- 标题与页脚约定：标题栏下方和页脚顶部均不默认绘制分隔线；内容分区通过留白或 `variant="layered"` 组织。
- 内嵌 Tabs 跟随 Card 尺寸，除非显式覆盖；子控件保持各自尺寸。

### Card 内嵌标签页

- 通过 `tabs` 配置集成顶部 line 标签。有标题时，导航位于标题和描述下方，中间无分割线；无标题时，导航替代标题区域，Card 操作移到行尾。
- 标签尺寸默认跟随 Card 尺寸，除非显式设置；高度、字号、内边距、项间距与独立的同尺寸 line Tabs 一致，Card 不再增减标签高度，也不根据标题行设置最小高度。
- 一条全宽分割线贯穿整个标签栏（包括操作区），沿用 Card 分区线颜色且在 `bordered={false}` 时同样保留；选中下划线覆盖在该分割线上，厚度与独立 line 标签一致。标签栏与面板对齐 Card 内容边；面板内缩与页眉表面继承 Card token。页脚保持间距式处理。
- 复用 Tabs 的导航、溢出、内容保留与动画，不另建标签状态；loading 只替换面板内容，导航保持挂载。

### CardTitle

- 在 Card 外复用 Card 标题排版，不加表面或内边距。small / default / large 与 Card 标题一致（默认基础字号下 14 / 16 / 18 px，`sm / md` 使用常规控件字重默认 500，`lg` 使用强标题字重默认 700，描述与操作对齐 Card 标题区）。
- Card 与 CardTitle 默认都是 h3，除非文档大纲需要，调用方不指定 level。`description` 位于标题下方，`extra` 位于行尾，与 Card 标题区一致。
- Card 自己决定内部标题尺寸，不消费独立 CardTitle 的默认参数；用户传入的 CardTitle 元素仍读取区域默认值。

### Table

- 仅保留单一简洁表格结构（由 `@ifhover/leaf-ui` 主入口直接导出，零 `@tanstack/react-table` 依赖）：默认内容表面仅顶部使用基础圆角（默认 10px），无内层框、阴影和固定列边缘阴影。表头采用基于当前表面混入 `surface-muted` 的浅灰底（`subtle-action-background`）、常规正文色 `--leaf-table-text`（保留 `--leaf-component-table-color` 组件覆盖）与 `600` 字重；非末列且非工具列的列头右侧显示 `1px × 1.6em` 居中短竖分隔线（`--leaf-table-header-split`），悬停或排序时隐藏短竖线且列头切换为 `--leaf-color-surface-muted`（排序表体列使用表头浅灰底）。框线与分隔线共用基于 `--leaf-color-divider` 柔化 70% 的 `--leaf-table-frame-color`（显式颜色和边框色覆盖优先）。`bordered` 开启上左外框与单元格右侧/底部网格线（保留末行底线），同时隐藏表头短竖分隔线。标题、标签栏与筛选工具栏由外部使用 `Card`、`CardTitle`、`Tabs` 等组件自由组合，不由表格组件重复承载。
- 尺寸仅保留 `sm | md`（默认 `size="md"`，运行时传入非 `sm` 值统一回退到 `md`），使用基础字号（默认 14px）、约 1.5714 倍行高（默认 22px）与等宽数字 `tabular-nums`，表头字重为 `600`；`sm / md` 的上下内边距为 `8 / 16px`，水平内边距为 `12 / 16px`，单行正文与表头高度为 `39 / 55px`。表头始终固定且不可关闭；高度受限的 flex 布局收缩表体视口。固定列、展开详情行、树形子行和虚拟行共用一个原生 table；列配置 `ellipsis` 时启用单行省略并在未固定列宽时自动切换固定布局以约束列宽。
- 排序表头右侧放置上下双三角排序图标（`.leaf-table__sort-icons`），激活排序三角高亮为 `--leaf-color-primary`；拖拽调整列宽线（`.leaf-table__resize`）悬停及激活同样高亮为 `--leaf-color-primary`。默认显示细行分割线，包括末行；设置 `striped` 后省略所有表体与表尾横向分割线，并从第二行数据开始展示基于 `2% --leaf-table-text` 的浅灰交替背景（`bordered` 下同样隐藏内部横向分割线）。详情行与虚拟占位行不影响条纹奇偶。选择列与独立展开列左对齐且右内边距归零（复用首业务列左内边距），存在起始固定列时随起始侧同步固定；纯树形数据在首业务列内联展开按钮并按层缩进（默认每层 `16px`），无子行节点自动占位对齐。
- 普通行悬停基于 `2% --leaf-table-text` 混合浅灰底；选中行复用相同的 `2%` 浅灰底，且已选中行悬停时保持颜色不变。展开操作复用小号纯图标文字按钮及其中性反馈；空数据与加载失败状态均复用 `Result` 组件渲染。显式组件状态覆盖优先。
- 默认内容布局填满容器；尺寸布局遵循固定列宽与弹性分配（`flex` + `minWidth` / `maxWidth`），全部固定或达到最大宽度时允许右侧留白。内容区域的最小宽度只是下限。
- 内部结构与实现见 [Table 实现说明](packages/react/src/table/README.md)。

### FileList

- 文本与缩略图列表外框使用 `--leaf-color-border`（与文件名起始对齐的内缩细线继续使用柔化分割线）；行悬停与聚焦使用半强度中性底并淡出相邻分割线。`text` 在宽容器（`> 480px`）中呈现单行清单（文件名居前，类型、可选大小与上传状态以圆点分隔对齐在操作前），窄容器自动折为双行；`picture` 保持双行缩略图附件布局。首行图标、文件信息与操作始终垂直居中，进度条与错误位于主行下方的信息列，不拉偏首行图标。
- 类型图块为带柔化细线边框的 `surface-muted` 方块，静止图标统一使用弱化文字色，不按文件格式分配彩色；仅上传中（主题基色 `--leaf-color-primary`）与错误态（危险浅底及语义文字色）着色。缩略图内侧保留 1px 柔化细线。
- 预览按钮、下载链接、移除和 Upload 操作使用方形几何，静止为弱化文字色，悬停 / 聚焦恢复正文色，移除在交互时显示危险文字色。图片卡片（`picture-card`）为带 `--leaf-color-border` 边框的白色卡片内缩 6px 的媒体区（同心圆角，宽容器 16:10、窄容器 16:9），悬停使用 `border-hover` 加深卡片边框而保持白底，无缩略图时展示带浅阴影的白色纸页标牌与大写扩展名；下方完整文件名独占一行，底栏对齐次要元信息与操作。空状态使用虚线框与中性回形针图块。缺少大小时不留空占位，缩略图失败时回退为类型图标，异步移除反馈留在对应文件上。无行阴影或悬停抬起。

### 图片预览

- 图片预览只提供命令式入口，页面内的图片展示由原生 `img` 负责。按产品要求自行实现 Viewer.js 风格的半透明背景、右上角关闭、底部圆形工具栏、标题和窄缩略图条，不引入 Viewer.js 或其他预览引擎；不提供浏览器全屏模式。
- 保留缩放、原始尺寸切换、完整重置、循环切图、旋转、翻转、拖动与触摸捏合 / 旋转 / 滑动，不提供幻灯片播放。图片组在画布左右两侧和底部工具栏均提供切图按钮，隐藏缩略图不移除导航；底部按钮加大留白，图标与文字尺寸保持不变。
- 圆形控件尺寸和图片几何过渡是通用控件几何 / 仅颜色反馈规则的特例。打开时背景、工具栏与当前图片并行呈现，不等待背景动画结束后才加载图片；图片移动、缩放和旋转使用合成变换，不逐帧修改宽高。区域关闭动效或系统减少动效设置仍然有效。
- 命令式生命周期、区域层级与语言、关闭后焦点返回和可选下载沿用 Leaf UI 契约。仅渲染当前大图和有限的邻近缩略图，当前图可用后才低优先级预载相邻原图；不新增全局媒体颜色角色。

### 其他复合表面

- Form 的 `settings` 布局左侧标签列使用 `labelWidth`，右侧控件列默认占用扣除列间距后的剩余宽度；可通过 `settingsControlWidth` 按表单或字段覆盖为固定宽度。控件默认左对齐，也可按表单或字段切换为右对齐。标签和说明与控件顶部对齐；只有标签且右侧是单行控件时，标签保留一个控件高度并在该高度内垂直居中；窄容器仍改为上下排列。
- Carousel 上一页 / 下一页使用浅中性底、无描边与阴影的圆形柔和按钮，复用文字动作的中性悬停 / 按下反馈，不缩放。按钮相对内容视口垂直居中，不包含底部指示点区域。
- Transfer 采用左右双栏单层净白面板（容器默认宽度 `464px`，面板间距 `12px`）：直接消费 `--leaf-color-surface` 与 `--leaf-color-border`（外框带 `--leaf-shadow-xs`，无内层嵌套灰色托盘，搜索框聚焦不加深面板外框）；标题区与计数保留在净白面板顶部，底部使用 `1px solid var(--leaf-color-divider)` 分割线；列表区保留 `gap: 4px`（虚拟列表项包装 `2px 8px` 内边距），每个条目使用 `var(--leaf-radius)`（默认 `10px`）独立圆角与原生 `Checkbox description` 支持，悬停用中性浅底、按下深化为 `--leaf-color-option-hover`（不做按压缩放）、选中用 `--leaf-color-surface-muted` 与 `--leaf-color-text`（绝不彼此粘连）。显式组件背景、标题背景、边框与阴影覆盖优先。
- 带边框的 Descriptions 与 Collapse 外框统一使用 `--leaf-color-border` 保持纯白边界清晰；Collapse（`--bordered`）附带 `--leaf-shadow-xs`，触发头悬停复用 `choice-option-background()` 中性浅底；内部分区维持更轻的分割线。组件圆角与内容绘制必须作用到可见表面。
- 窄屏下 Form 与 Transfer 按自身容器宽度响应。
- Checkbox / Radio 卡片选项：整张卡片是一个可点击 label，采用 `10px 12px` 内边距、单行基准高度下限及与输入框一致的基础圆角（卡片使用 `--leaf-current-radius` / `--leaf-radius`，成组列表外框使用 `--leaf-radius`），含中性图标底座、标题 / 描述列和行尾原生控件；卡片内部使用顶部对齐并固定将行尾选中控件与首行标题居中对齐。未选中态悬停切为 `border-hover` 与 `surface-muted`；选中后使用主题色边框与 `--leaf-color-primary-soft` 淡主色底面（图标底座切为 `--leaf-color-surface`），悬停已选中卡片时维持选中边框与底色不变。组内可排成响应式网格，或一个共享边框与行分隔的列表，无渐变或抬起。状态标签不可交互；辅助文字是可访问描述，不属于选项名称。
- Alert 仅保留 `default`、`success`、`warning` 与 `danger`（`error` 为兼容别名，移除 `info`）：默认 `default` 采用 shadcn 风格的白底（`--leaf-color-surface`）、`1px` `--leaf-color-border` 边框与 `--leaf-color-text` 黑字/图标；其余语义状态采用 `1px` 语义淡色边框（`25%` 反馈基色混入 `--leaf-color-border`）与减淡浅底（`50%` 对应状态 `*-soft` 混入当前表面），图标与 `14px`（`500` 字重）标题均消费对应状态深化文字色（`status-ink-family`，即 `*-ink`）；统一使用基础圆角（`--leaf-radius`，与输入框一致）与统一内边距（`10px 12px`，有无描述一致），带描述时收紧描述间距（`4px`），内置图标与关闭图标为 `16px / 14px`。显式组件颜色、背景、边框、圆角和内边距覆盖优先，保留播报 role。
- Result 沿用 shadcn Empty 式的紧凑居中排版（仅保留单一紧凑尺寸，不提供 `size` 参数与 `info` 状态）：所有状态的非图片图标均无边框，放入 `40 px` 圆角方框底座（使用基础圆角 `--leaf-radius` 默认 `10 px`、内部 `20 px` 图标），`empty` 使用 `--leaf-color-surface-muted` 浅灰底配 `--leaf-color-text` 黑色/正文色图标（Windows 强制颜色模式下补回 `CanvasText` 细框），`success` / `warning` / `danger`（`error` 为兼容别名）与 `Confirm` 一致消费 `status-label-family`（`*-soft` 减淡底与未加深基色 `--leaf-status-label-base` 图标）；自定义 `<img>` 图标不套底座。图标下方留白 `--leaf-spacing-md`（16 px），标题使用大号文字 `16 px`（`--leaf-font-size-lg` / `--leaf-line-height-lg`），紧随其后的描述使用小号文字 `13 px`（`--leaf-font-size-sm` / `--leaf-line-height-sm`），标题与描述间距 `--leaf-spacing-sm`（8 px），补充内容盒带 `1 px` `--leaf-color-border` 与 medium 圆角并与上方保持 `--leaf-spacing-lg`（24 px）上间距，操作区统一保持 `--leaf-spacing-md`（16 px）上间距。兼容组件 `Empty` 同步取消 `size` 属性并复用同一无边框中性底座，提示标题使用 `--leaf-color-text-muted`、基础字号与 400 字重。
- Scrollbar 轨道覆盖在内容上，在悬停、滚动或键盘聚焦时出现；拖动不抢输入焦点，也不显示指针焦点轮廓。`size="sm"` 用于密集列表：更窄的轨道（6 px、距边 2 px）和更淡的滑块。
- Scrollbar 的 persistent 使轨道常驻并按 orientation 为对应轴预留独立空间；scrollbar="always" 仍是常显覆盖式，hidden 优先隐藏并不预留。时间列统一使用 persistent，避免遮挡数值与勾选。

### 共享灰色底板

- 显式 card 型日期选择器画布与 `Segmented Tabs`、`Calendar` 视图分段轨道直接共用 `--leaf-color-surface-muted`。显式 `mutedSurfaceColor` 在这些画布上绘制完全相同的颜色，不再与边框或表面混合。
- Segmented Tabs 选中滑块、`Transfer` 面板、`Drawer` 分区页脚和内嵌内容面使用 `--leaf-color-surface`（或 `transparent`）净白表面；`Segmented Tabs` 与 `Calendar` 视图分段外轨使用 `--leaf-color-surface-muted` 浅灰底；显式组件覆盖与嵌套主题优先。

### Upload、ColorPicker、InputOTP 与 Slider

- ColorPicker 显示颜色文字时，HEX / RGB / HSL / 渐变模式默认宽度分别为 144 / 272 / 296 / 160px，透明度变化不改变宽度；显式 style.width 优先，最大宽度不超过容器。不显示文字时保持当前尺寸的方形色块控件，清除操作额外预留空间。格式切换复用内部 segmented Tabs。
- Upload 拖拽图标徽标（`.leaf-upload__symbol`）使用 `--leaf-color-surface` 白色圆形底座配细边框与 `--leaf-shadow-xs`（悬停 / 拖拽时切至 `--leaf-color-surface-muted` 与 `--leaf-color-text`，拖拽区外框切为 `--leaf-color-text-muted` 配 `--leaf-color-surface-muted` 浅灰底）；ColorPicker 色块 / 预设保持几何稳定。
- AvatarUpload 使用 128px 的虚线圆角方形上传入口：初始底色为 `--leaf-color-surface`、加号和上传文字，悬停切换 `--leaf-color-border-hover` 边框、按下切换为 `--leaf-color-text-muted` 边框与 `--leaf-color-surface-muted` 浅灰底（不做按压缩放），校验与请求期间以转圈图标替换加号，成功后图片铺满；悬停或键盘聚焦时显示深色媒体遮罩与白色“重新上传”文字。禁用时不可操作，失败后显示错误并允许重新选择。
- InputOTP 与 `field` 家族统一悬停和聚焦反馈：非禁用状态下悬停显示 `border-hover` 边框，激活格聚焦使用 `--leaf-color-primary`（error / warning 状态跟随 `danger` / `warning`）边框与共享 3px 12% 半透明外环，闲置格不再附加多余静止投影；Slider 滑块仅在 `:focus-visible` 键盘聚焦时显示 3px `accent-halo-focus-color` 聚焦环，悬停不放大、拖拽仅加深描边至 `--leaf-color-primary-active` 而不缩滑块也不扩张大光晕；Progress 默认 `active={false}`（需循环扫光时显式传入 `active`），LoadingBar 不再叠加外发光。

## 配置

- ConfigProvider 是唯一配置入口。基色、圆角和高度派生相关几何；高级 `dividerColor`、组件 `borderColor`、`headerBackground`、`footerBackground` 提供选择性覆盖。CSS 变量是应用样式的消费点。
- 实心操作与勾选标记保持纯色；单行控件保持 32px 基础高度。

## 验收

本文维护视觉与交互契约，不另设浏览器矩阵、逐页截图或全量人工检查要求；基础检查、实际效果确认与按需排障统一遵循 [质量验收：当前规则](packages/react/QUALITY.md#当前验收规则)。`history/` 下的记录只证明当时的覆盖范围，不是现行规则。待发布的兼容性变化记录在 [待发布迁移](MIGRATION-PENDING.md)。
