# 颜色系统与组件用色规范

本文是颜色定义、组件开发和 AI 协作的强制约定。发布仍遵守 [开发流程](DEVELOPMENT-WORKFLOW.md)，整体方向见 [设计风格](DESIGN-STYLE.md)，现有视觉行为以 [设计标准](DESIGN-STANDARDS.md) 为准。新增组件前先确定用途角色，并复用现有视觉家族实现；不从色板中凭感觉挑选近似色或色阶。

## 目标与边界

- 同一种角色使用同一份默认配方；不因新增组件而新增一组全局颜色。
- 不按 HEX 相同或接近判断合并。品牌与成功、边框与分隔线等不同语义保留独立入口，默认值允许共享。
- 调色入口是 ConfigProvider 的 `theme`、`theme.tokens` 和 `theme.components`；业务 CSS 读取结果，不能承诺直接改基础 CSS 变量会重新运行派生算法。
- 本规范不授权改变既定交互：输入和选择类字段（含 Textarea、Mentions、InputNumber）聚焦或展开统一使用主题色边框。普通选项使用中性反馈，Button 实底与链接仅按下变色，描边悬停加深边框、按下仅将背景轻微变灰。

## 三层颜色架构

| 层级     | 内容                                                                                       | 职责                                                             |
| -------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| 基色输入 | `primary`、`success`、`danger`、`warning`、`info` 与 `neutral` 中性基色                           | 表达业务和默认语义；用户显式基色保持原值，不能被改写或强制成某一档 |
| 按需派生 | 五个语义 family 各有七个 `light-N` / `dark-N`；neutral 独立保留 `100`–`900` | 语义色从原色按固定比例混白 / 黑；中性色用于稳定的明暗层级 |
| 用途映射 | 文字、表面、边框、选项反馈、`soft`、`border`、`ink`、`on-*`、指示和动作等稳定角色           | 由 `resolveColorRoles` 统一选档；组件只消费结果                  |

五种语义基色在浅深模式保持相同原值，独立于彼此。仅生成 `light-3`、`light-7`、`light-9`、`dark-1`、`dark-3`、`dark-7`、`dark-9` 七档，数字表示白色或黑色的占比（单位 10%），使用 sRGB 混色。例如 `primary-light-3` 是 70% primary + 30% 白，`primary-dark-1` 是 90% primary + 10% 黑，不是透明度。不会把原色替换成某一档，也不保留 `primary-100` 至 `-900` 等旧语义数字档。按需派生不意味着铺满亮暗 1–9 的全部矩阵。

中性色带继续由固定 OKLCH 明度序列生成 `100`–`900`，默认基色为略偏蓝的灰色 `#6c737e`，可通过 `neutralColor` 修改。派生色保留基色的色相，在接近白色和黑色时减弱色度，不将中性色强制转为纯灰。五种语义色共 35 个派生色，加中性九档共 44 档。原色与派生色跨模式共享，只有用途映射随实际表面变化。

`resolveColorRoles(appearance, overrides)` 返回 `{ values, sources }`，统一生成共享用途并记录覆盖来源。颜色派生只随 ConfigProvider 的 JS 配置更新；不通过 DOM 属性、computed color、canvas 探针或媒体查询推断输入，也不在 hydration 后重写色板。应用可以用 `useSystemAppearance()` 获取系统偏好，再把结果传给 ConfigProvider；这是 JS 输入，不是颜色引擎监听 DOM。Portal 复制区域 CSS 变量以传递主题，不重新解析或派生颜色。CSS 颜色表达式保持表达式形式，需要确定数值的计算应由应用传入具体颜色。`deriveColors` 仅额外输出具有真实消费者的有限光学配方，不再生成无消费的旧百分比矩阵。

### 当前可复用角色

以下是当前已实现的角色，不是要求生成更多 token 的模板。调整全局角色集合必须更新本表并通过新增准入；不能在组件中创造同义的全局变量。

| 用途               | 现有入口                                                                                                                                |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| 基色输入           | `--leaf-color-primary`、`--leaf-color-success`、`--leaf-color-danger`、`--leaf-color-warning`、`--leaf-color-info`、`--leaf-color-neutral` |
| 共享派生           | 五种语义色使用 `--leaf-color-<family>-light-N` / `-dark-N`；仅 neutral 使用 `--leaf-color-neutral-100` 至 `-900` |
| 文字层级           | `--leaf-color-text`、`--leaf-color-text-muted`、`--leaf-color-text-subtle`                                                              |
| 内容表面           | `--leaf-color-surface`、`--leaf-color-surface-muted`、`--leaf-color-surface-raised`                                                     |
| 结构边界           | `--leaf-color-border`、`--leaf-color-border-hover`、`--leaf-color-divider`                                                              |
| 语义用途映射       | `--leaf-color-<family>-soft`、`-soft-hover`、`-soft-active`、`-border`、`-ink`                                                          |
| 主色可读前景与指示 | `--leaf-color-primary-indicator`、`--leaf-color-primary-focus`、`--leaf-color-primary-fill-border`                                      |
| 实色前景           | `--leaf-color-on-primary`、`--leaf-color-on-success`、`--leaf-color-on-danger`、`--leaf-color-on-warning`、`--leaf-color-on-info`        |
| 动作交互           | `--leaf-color-primary-active`、`--leaf-color-danger-active`，以及当前保留的 hover / ink-hover / ink-active 角色；是否使用由动作配方决定 |
| 普通选项反馈       | `--leaf-color-option-hover`；不为每个列表再建 selected / hover 近似色                                                                   |
| 字段边框与背景     | `field` 配方内部的 `--leaf-field-rest-border`、`--leaf-field-color`、`--leaf-field-background`；不是新的全局配置 API                    |

`--leaf-color-primary-soft` 及同类 `*-soft` 角色始终由用途映射生成；`primarySoftColor` 等只是显式覆盖入口，不是唯一来源。`--leaf-color-focus` 是显式覆盖入口，不代表所有组件必须采用同一种焦点外观。

### 角色映射与选阶

- 中性文字、表面、边框和选项反馈共用中性色阶；显式不透明 surface 按实际亮暗选择配套文字与边界，未指定 surface 时按 appearance 选择。显式文字和其他角色覆盖仍优先。
- `soft` 默认浅底取 `light-9`、暗底取 `dark-9`；`soft-hover` / `soft-active` 与 `border` 默认取 `light-7` / `dark-7`。显式自定义表面按实际亮暗选择，不能只按 `appearance` 猜测。
- `ink` 先尝试原色，相对实际 surface、surface-muted 与 soft 背景都达到 4.5:1 就直接保留；不足时在已生成派生色中优先按表面方向从小到大调整，必要时回退纯黑或纯白。表达式与半透明输入无法可靠比较时保留原色，不猜测或监听 DOM，应用自行验收。
- `on-*`（实底上的文字 / 图标）始终默认纯白，不按对比度选择黑白；五种 `on*Color` token 可由应用显式设为纯黑或其他颜色。它不与浅底文字 `ink` 合并。组件消费共享 `on-*`，不硬编码白色或自动黑白判断。固定白色可能使部分基色组合低于 4.5:1：这是已确认的产品契约，验收时如实报告失败组合与 `on*Color` 定制方式，不自动改黑、不调暗基色，也不关闭 axe 对比度检查；库不保证固定白字或显式覆盖满足文字对比度。本条是实底前景规则的唯一出处，其他文档只链接这里。
- `primary-indicator` 独立选择：原 primary 对当前表面达到 3:1 时可继续使用，否则从明暗派生色选择满足 3:1 的指示色。`primary-focus` 与选中控件的必要边界复用该结果，不用于给实底 Button 自动补边框。
- Checkbox、Radio 和 Switch 的选中实底使用原 primary，内容使用 `on-primary`；`primary-indicator` 可用于边界或独立指示，不得把它用作实底却沿用原 primary 对应的内容色。
- 组件不得自行挑选语义明暗派生档或中性 `100`–`900`。常规状态使用映射后的 `*-soft`、`*-border`、`*-ink`、中性角色或显式组件覆盖；确需新增选阶逻辑时，先进入共享映射并补齐测试。

## 视觉家族契约

### 字段外壳

Input、Select、AutoComplete、Textarea、InputNumber、TreeSelect、Cascader、ColorPicker 与日期 / 时间等字段使用 `styles/_mixins.scss` 的 `field` / `field-states`；不得在组件中复制一套默认边框色或自行混合近似灰色。

| 状态        | 默认契约                                                                                                             |
| ----------- | -------------------------------------------------------------------------------------------------------------------- |
| 普通        | 共用正文、内容表面、边框；组件未显式覆盖时，Input 与 Select 最终边框一致                                             |
| 悬停 / 按下 | 保持静止外观；显式状态覆盖除外                                                                                       |
| 聚焦 / 展开 | 所有输入和选择类字段使用共享的主题色默认配方、无外圈；Mentions 通过内部 Textarea 继承 |
| 校验        | error 使用 danger，warning 使用 warning；校验语义不被普通聚焦覆盖                                                    |
| 禁用        | 共用禁用背景、静止边框和不可交互规则；保留既有透明度行为                                                             |

字段的主题色聚焦由共享 field 配方默认提供，各字段只传入组件名称，不再逐个声明 primary 变体，也不能各自重写颜色公式。Mentions、InputSearch、InputMask 与日期 / 时间组合字段通过内部 Textarea、Input 或 DateInput 继承。日期 / 时间分段的原生选区复用 info 蓝色与 on-info 前景，不新增全局变量。其他家族差异也必须先进入公共配方，再由组件选择。

字段文件里的内层原生控件 `border: 0`、分栏线、步进按钮分隔线、色板对比边框和浮层移动层透明边框，不等于字段外壳重复配色。审计按实际绘制职责登记；不能为了降低债务数字删除必要的内部边界或把它们都改成外框色。

新增组件的实现说明必须列出：所属家族、复用的 mixin / 共享实现、明确例外及理由、默认 / 状态 / 禁用的对应角色和相关状态 / 覆盖测试。没有现成家族时先审查配方，不先写一套颜色再补说明；实际效果与按需排障遵循 [质量规则](packages/react/QUALITY.md#当前验收规则)。

### 选项行

普通选项的候选、悬停和按下使用 `--leaf-color-option-hover`。使用独立候选背景的其他列表共用这一角色；有移动背景时只能由移动层绘制一次。下列 Select 风格选项使用共享的浅色逐行配方。危险操作、日历、分页等明确设计例外不能被机械替换成普通选项。

Select、AutoComplete、Mentions、Tree、TreeSelect、Cascader、Dropdown 和时间列的选项行共用 `choice-option` 配方：从 `neutral-option-background()` 取一半强度的中性反馈，未选中、选中、悬停与键盘候选均使用完整继承文字色，不因未选中而淡化。每行只对自身背景颜色作过渡，不使用移动背景或几何出入动画；已保存值以勾选标记表达，不永久绘制选中底色。AutoComplete / Mentions 的 ARIA 选中表示当前候选，因此保留候选背景。Menu 的 `neutral` 外观独立使用明确的局部中性背景与 80% 继承色，具体填充见[Menu 状态契约](DESIGN-STANDARDS.md#menu)；三种皮肤不受 choice-option 配方改动影响。危险操作、禁用文字、搜索命中、日历 / 范围选中态保留各自语义，不扩大字段聚焦变体。

### 内容表面与动作

内容表面区分 surface、surface-muted、surface-raised；边框与 divider 不强行合并。内容容器的柔化边框与普通 Modal 的分区线复用 `softened-frame-color`，随实际局部表面减淡；Confirm 不继承 Modal 的分区线调整。静止阴影复用共享阴影 token 并保留显式覆盖优先。Button 复用动作状态，不把 hover 色直接用于普通选项或字段外框。

Table / DataTable 的表面、表头文字、条纹、悬停、选中和加载遮罩集中在 `table-family` 配方。条纹、悬停和遮罩基于当前表格的表面与文字计算，不能替换成仅对默认白底近似的全局色。选中行始终使用映射后的 `--leaf-color-primary-soft`，内部展开操作复用文字按钮的中性反馈；显式 `primarySoftColor` 等覆盖继续优先，不为补默认值生成新全局 token。

### 共享底板与内容表面

分段 Tabs 的外轨、ColorPicker 格式切换轨道、分层 Card 与 Transfer 的外层底板、显式 card 型日期 / 时间面板的画布直接共用 `--leaf-color-surface-muted`，不得再混入边框色或内容表面制造近似色。通过 ConfigProvider `theme.tokens.mutedSurfaceColor` 可统一设为 `rgb(244, 243, 239)` 等精确颜色；不是修改 `neutralColor` 后期待派生结果恰好等于它。

Tabs 选中滑块与 Card / Transfer / 面板内层内容继续使用 `--leaf-color-surface`，保持层次。DataTable 整体直接使用该内容表面，不再保留外层底板。显式组件背景 / 状态覆盖优先；不得为统一外层底板覆盖内部内容、嵌套主题或 Portal。

### 跨组件的有限配方

| 配方 | 责任与实际消费者 |
| --- | --- |
| `accent-soft-feedback-family` | 品牌浅底与柔边，供分页、导航、上传和拖拽提示复用；不替代普通选项的中性反馈，也不把拖拽称作持久选中。分页当前页属于待收敛项（见 [设计风格](DESIGN-STYLE.md#待收敛清单)），修改前与用户确认 |
| `danger-soft-feedback-family` | 危险浅底反馈，供 Dropdown / Menu 危险操作、Form / Confirm 错误摘要、FileList 动作复用 |
| `status-ink-family` / `status-label-family` | 五种语义的可读文字、浅底标签和实底前景；Typography / FileList / Tag 不再自行选择 `text-80` |
| `panel-canvas-family` | 显式 card 型日期面板的柔和画布；Modal 与 Drawer 直接使用 surface |
| `segmented-surface-family` | Tabs 与 ColorPicker 格式切换共用轨道、选中底和弱文字 |
| `overlay-family(dialog / spotlight)` | Modal / Drawer 默认共用无模糊灰色遮罩，可显式开启模糊；Tour 保留更强的无模糊聚光遮罩 |
| `calendar-selection-family` | Calendar 与日期选择共用基于 `primary-soft` 的 opaque 范围底、整格选中底和 soft-hover 反馈；不等于普通选项反馈 |
| `accent-halo-family` | InputOTP、Slider、Upload 的强调光晕；不得据此给 Input / Select 恢复外圈。整体属于待收敛项（见 [设计风格](DESIGN-STYLE.md#待收敛清单)），修改前与用户确认，确认前按现行契约维护 |

文字按钮及紧凑的清除、关闭、显隐动作共用 `text-action-family` / `text-action`：默认普通文字、透明底，悬停使用 `option-hover` 的 50% 透明混合浅灰底，按下使用完整 `option-hover` 灰底，不改变几何。链接按钮使用可读的 `primary-ink` / `danger-ink`（按下使用 `primary-ink-active`），不使用主题基色；危险语义和显式覆盖保留。

配方只增加内部共享变量，不扩展 `LeafThemeTokens` 配置矩阵。Button 实底默认透明边框，不因基色与背景接近而自动增加对比边框；显式全局、组件和状态边框配置仍优先，系统 forced-colors 的可辨识边界保留。实底按下由基色混黑 10% 生成，不为满足前景对比而反向变亮；描边悬停复用 border-hover（危险操作使用 danger-ink），按下背景通过共享 subtle-action-background 将实际背景与 surface-muted 等比混合，保持文字、边框与阴影不变，不偏主题色。

Switch 关闭态使用中性灰轨道与亮色滑块：浅色区域分别消费 `text-muted` / `surface`，深色区域分别消费 `option-hover` / `text`，通过区域的 CSS `light-dark()` 选择，不新增颜色角色或运行时推断。默认边框与轨道同色，显式全局 / 组件边框仍优先；关闭态 loading 图标使用对比清晰的中性色，不混入主题色。开启态继续使用 primary 轨道、`on-primary` 滑块与 primary loading 图标；显式 `onPrimaryColor` 只影响开启态，不改写关闭态滑块。

### 可读颜色与兼容性

五个语义 family 都具有基色、共享色阶和用途角色。普通表面及浅底上的语义文字 `ink` 以 4.5:1 为目标；实底前景见 [角色映射与选阶](#角色映射与选阶)。显式字色及组件覆盖优先。

浅色 / 深色表示运行模式，不是要求每个角色必须有两个不同色值。基色、语义明暗派生和中性色带跨模式共享，只有用途映射随实际表面切换。`*-ink` 是普通表面上的彩色文字，`on-*` 是实色背景上的文字 / 图标，二者不可合并。

CSS 表达式在服务端与客户端保持相同表达，不读取 DOM、canvas 或 color-scheme 推断颜色和模式。不透明具体颜色支持色阶和 ink 对比计算；表达式、半透明颜色和冲突表面需应用自行验收。无消费者的旧比例变量在 0.9.0 退役，迁移使用全局用途角色；保留的光学配方只服务现有光晕、遮罩和插画，不作为新增用途 token 的模板。

Menu 的三种完整外观、Rate 的评分色、媒体对比、加载光泽和局部遮片有独立绘制责任，保留精确的局部例外。不能把相似颜色都抽成全局 token。实色标签前景消费共享 `on-*` 或相应自定义色前景配置；普通控件的重复混色不能当作局部例外。逐组件责任见 [迁移清单](packages/react/COLOR-MIGRATION.md)，实际静态结果见 [审计报告](packages/react/COLOR-AUDIT.md)。

## 新增组件的用色流程

1. **先确定绘制职责。** 阅读设计标准，列出外壳、内容、分隔线、选项、指示、遮罩等实际绘制区域；分别选择字段、选项、状态标签、内容表面、动作等已有家族。复合组件中的内部按钮和字段复用原组件，不单独调色。
2. **再列状态与角色。** 在实现说明或测试中说明普通、悬停、按下、聚焦、选中、校验、禁用和 loading 哪些适用、哪些保持不变，并标明消费的角色或配方。不是每个状态都需要不同颜色，更不需要对应一个新全局变量。不要把普通候选、持久选中和危险动作混成一种反馈。
3. **接入共享实现。** 优先复用 `_mixins.scss` 的现有家族；直接绘制文字或表面时消费用途角色。组件不复制色阶选择、基色混色或对比算法。没有合适家族时，先说明差异是否属于真正的新绘制责任，再决定扩展共享配方或保留局部实现。
4. **接入覆盖与继承。** 普通组件颜色使用 `theme.components` 已支持的 paint 入口，实例显式参数仍按组件公共契约生效；状态覆盖逐字段覆盖默认配方，未设置字段继续继承。不得为了默认值强写行内颜色，破坏区域主题、嵌套配置、Portal 或显式覆盖。新增公共配置必须有实际消费、类型和 API 说明，不能只生成变量。
5. **验证并同步。** 按下方同步表维护测试和产物，检查浅深模式、自定义基色 / 中性色 / 表面、嵌套主题、Portal（如适用）、SSR、显式颜色与状态覆盖。新增组件不扩充存量债务基线；局部例外要有具体职责和测试。

以下仅示意已有配方的消费方式，不代表新增公共组件或配置槽：

```scss
@use '../styles/mixins' as mixins;

.leaf-example-field {
  @include mixins.field(example-field);
}

.leaf-example-status {
  @include mixins.status-label-family(success);
  color: var(--leaf-status-ink);
  background: var(--leaf-status-label-background);

  &[data-solid] {
    color: var(--leaf-status-label-foreground);
    background: var(--leaf-status-label-base);
  }
}
```

字段示例默认采用共享主题色聚焦行为；中性聚焦仅作为显式、经审查的例外，不作为新字段的默认值。真实组件还需实现相应语义、尺寸、状态与覆盖，不能只复制这段颜色代码。

## 修改已有组件的用色流程

1. **先追溯，不先替换色值。** 从具体绘制节点的 SCSS / 行内样式向上追查：组件覆盖 → 家族配方 → 用途角色 → 基色或色阶；结合 `COLOR-MIGRATION.md` 与 `COLOR-AUDIT.md` 区分默认值、必要局部例外和待清理用法。不要因为两个 HEX 接近就合并语义。
2. **在正确层修复。** 同一家族不一致时优先修共享配方；用途选档或来源错误修 `colors.ts`；中性色阶错误修 `color-scale.ts`，语义比例与混色错误修 `color-shades.ts` / `colors.ts`；仅一个区域的独立绘制问题留在组件。共享层修改前搜索全部消费者，不能用单组件补丁掩盖公共缺陷，也不能为修单点而改变无关消费者。
3. **保留既有契约。** 覆盖默认、显式 token、组件 / 状态覆盖、禁用 / loading 不响应、嵌套区域和 Portal。颜色调整不附带几何、语义或焦点行为变化；确需改变公共行为时同步设计标准、双语说明和版本迁移。
4. **先迁移消费，再删除变量。** 搜索 `src`、文档示例、Tailwind 映射、测试、设计导出与生成脚本，确认直接及间接消费。无仓库消费者不代表无外部用户；公开变量的移除必须记录版本边界和替代方向，不能伪装成像素等价别名。最后重新生成并检查产物。
5. **验证实际影响面。** 单组件修改跑对应行为、编译样式和颜色测试；共享家族按消费者类别补基础测试；全局映射或默认值变更同步相关组件及设计导出。实际效果与按需排障遵循质量规则，不默认增加浏览器矩阵。不得只更新快照或登记次数来让失败消失。

## 变量的归属与管理

### 应该在哪一层处理

| 需求 | 首选实现 | 不应该做 |
| --- | --- | --- |
| 普通文字、内容底、边界、语义浅底或实底前景 | 已有 `--leaf-color-*` 用途角色 | 在组件挑 `light-7` / `dark-3` / 中性数字档或写近似固定色 |
| 多个组件的相同绘制职责 | 共享 mixin / 家族局部别名 | 为每个组件复制公式或增加同义全局 token |
| 单个组件的独立遮片、评分或媒体绘制 | 组件局部变量，必要时登记精确例外 | 把一次性光学细节提升为全局状态矩阵 |
| 业务主题或局部颜色定制 | ConfigProvider `theme` / `tokens` / `components` 的已有入口 | 监听 DOM 回算色板，或把基础 CSS 变量写入当作派生 API |
| 按下等状态变化 | 现有共享动作 / 家族配方；必要时在配方内直接处理基色 | 默认新增一个公共 `pressedColor` 或一套百分比变量 |
| 确实需要独立配置的新共享角色 | 通过下节准入后新增类型、生成与消费 | 先生成所有状态，等待未来组件使用 |

`--leaf-color-*` 表示全局基色、色阶或用途角色；`--leaf-component-<name>-*` 是主题系统已有的组件覆盖命名，不可在 SCSS 中随意创造一个便声称支持公共配置。`--leaf-field-*`、`--leaf-status-*` 等家族变量与组件局部变量仅在所属根节点定义并作用于内部结构，不写入 `:root`、全局 token 表或 Tailwind 导出。局部变量也要避免覆盖嵌套组件的同名家族变量。

### 定义源与生成物

| 文件 / 区域 | 维护责任 |
| --- | --- |
| `packages/react/src/colors.ts` | 默认基色、共享用途映射、显式覆盖及 `sources` 来源；同一角色只在这里定义默认值 |
| `packages/react/src/color-scale.ts` | 仅中性色的固定明度九档算法；不用于五种语义基色 |
| `packages/react/src/color-shades.ts`、`colors.ts` 的 `generateColorShades` | 语义派生档清单和固定 sRGB 混白 / 黑；不改变原色，不另造 500 档 |
| `packages/react/src/color-recipes.ts` | 仍有真实消费者的有限光学配方；不是新建比例矩阵的入口 |
| `packages/react/src/theme.ts` | 公共主题类型、配置到变量的映射与纯合并；不复制颜色算法 |
| `packages/react/src/styles/_mixins.scss`、组件 SCSS | 共享家族、绘制及覆盖消费；局部配方不自动成为公共 API |
| `packages/react/src/styles/_palette.scss` | 由 `generate:palette` 生成，禁止手改；`tokens.scss` 负责主题基础样式等非 palette 定义 |
| `packages/react/src/tailwind-tokens.ts`、设计导出脚本 | 按实际公开范围映射同一生成源，不维护第二份默认色板 |
| `packages/react/scripts/color-contract-baseline.json` | 精确的债务 / 已审查例外登记；不是自由新增颜色的白名单 |
| `packages/react/COLOR-AUDIT.md` | 审计脚本生成结果；修改源与登记后重新生成，不手写“通过” |

公开配置只通过 JS 主题对象新增。CSS 变量是消费结果；同值但职责不同的角色可以保留，不能因当前默认值一样就删除独立语义。反之，内部别名或可直接推导的状态不因“可能有人想改”而默认公开。

## 新增变量准入

新增全局颜色必须在审查中同时回答：

1. 现有角色与家族配方为什么不能表达？
2. 实际消费者有哪些？只有一个消费者时，为什么不使用组件局部变量？
3. 是否需要独立定制，修改后哪些组件应一起变化？
4. 浅色、深色、自定义颜色和嵌套主题如何生成？前景 / 背景对比如何验证？
5. 类型、运行时、静态产物、设计资源、中英文说明与测试是否同步？

不为未来假设生成完整状态矩阵。允许特殊组件只使用一次的局部颜色，但必须有真实视觉职责。已有独立语义即使默认值一样也不删除；兼容别名有迁移方向，不允许循环引用或无限 fallback。

## 自动约束与验收

涉及颜色时执行 `pnpm check:colors` 与 `pnpm test:colors`；它们分别接入 `pnpm check` 与 `pnpm test`，已有对应聚合结果时不重复运行。浏览器排障与人工确认的边界统一见 [质量规则](packages/react/QUALITY.md#当前验收规则)，不另设颜色浏览器门禁。

- 用色检查必须覆盖全局派生定义和组件消费；新文件也必须扫描，不能只核对已有文件数量。
- 组件不得绕过配方新增默认 HEX / RGB / HSL、颜色混合公式或百分比 token 消费。业务传入色、ColorPicker 色板、QR 前景背景、媒体和强制颜色模式属于可说明的例外，不能全仓库一刀切。
- 未审查的存量用法登记为迁移债务，不代表符合目标规范；有独立视觉责任的局部例外需要逐项给出理由。两者都精确到文件、表达式和次数，不通过自动重建基线悄悄放行。
- 公共 `_mixins.scss` 不是免检区：其中的混色、固定色和比例变量消费使用独立的已审查配方登记，新增表达式或复制消费也要复核。配方登记不算组件债务，也不能证明状态优先级的实际绘制正确。
- `styles/tokens.scss` 的固定色阴影也按精确例外预算检查，不能通过把表达式搬到全局文件规避检查。修改公式、文件或次数时重新说明职责，不直接重建基线放行。
- 静态检查不等于视觉验收。需要定向排障时，按具体问题选择 Input / Select 等受影响组件的状态、外观、嵌套主题或显式覆盖，检查最终绘制与覆盖是否泄漏；不机械展开全部组合，也不要求 AI 日常逐项截图。
- 颜色生成器验证 CSS 表达式、SSR、对比度与兼容变量；修改默认生成结果时同步静态 palette 和设计 / Figma 导出。
- `guide/colors` 颜色页只展示六组全局色带、具体基色值与变量名，以及用 ConfigProvider 修改六组基色和实底前景（`on*Color`）的可运行示例，不添加用途映射、场景矩阵或高级参考。页面组合需要的颜色角色用法统一放在[界面设计指南](apps/docs/docs/guide/design-standards.mdx)，以公开变量和组件参数表达，不复制固定色板或派生算法；公共参数详情留在独立 API 参考，内部算法与迁移债务留在维护文档。

### 按改动范围同步

以下命令均从仓库根目录执行；完整行为、兼容、视觉和发布检查以 [质量验收](packages/react/QUALITY.md#当前验收规则) 为准，表中列出颜色专项的增量要求。

| 改动 | 必须同步与检查 |
| --- | --- |
| 仅组件消费或局部例外 | 组件状态 / 覆盖测试、必要的例外登记；`pnpm check:colors`、`pnpm test:colors` 及相关编译样式检查 |
| 共享家族配方 | 搜索全部消费者，按类别更新家族颜色与编译样式测试；不因内部复用默认新增公共 token |
| 基色、色阶、用途映射或生成默认值 | 来源、色阶与主题单元测试；`pnpm --filter @ifhover/leaf-ui generate:palette`、`pnpm design:export`；设计资源静态检查 |
| 新增 / 修改公共配置 | `theme.ts` 类型与映射、继承 / SSR / 显式覆盖测试、中英文 API 和示例；运行 `node apps/docs/scripts/sync-component-api.mjs`，核对说明与默认值 |
| 删除 / 重命名公开变量 | 全部直接 / 间接消费者、Tailwind 和设计导出、双语迁移说明；按版本流程说明替代方式，不留下悬空引用或无限 fallback |

设计资源检查使用 `pnpm --filter @ifhover/leaf-ui exec node scripts/verify-design-resources.mjs` 与 `node --check design/figma/code.js`。`pnpm check:colors` 只检查，不写报告或自动接受登记。需要更新报告时，从 `packages/react/scripts/color-contract.mjs` 调用 `scanColorContract`、`evaluateColorContract` 和 `renderAuditReport`，使用已审查的登记并确认检查通过后写入 `COLOR-AUDIT.md`。不能把自动接受基线作为修复。

静态扫描与算法测试不代表真实绘制已确认；实际效果与按需排障按质量规则处理，不默认增加浏览器检查。实底前景的对比度报告要求见 [角色映射与选阶](#角色映射与选阶)。

## 迁移方式

先收紧规范与检查，再按家族迁移。保持每批修改可验收，不根据色差阈值全仓库替换。移除过时消费后才清理生成配方；公开入口如需移除，按版本流程记录兼容性变化。未迁移项必须如实报告，不能把建立检查基线称为全库完成迁移。
