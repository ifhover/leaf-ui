# 组件文档分批改造进度

本文件是未发布工作的内部进度记录，不进入站点、搜索或 AI 使用文档。目标是按 [使用文档编写规范](DOCUMENT-WRITING.md) 和 [示例编写规则](EXAMPLE-WRITING.md) 完成所有组件页的中英文内容与示例改造；不是只改文案或只通过构建。

当前 78 组双语页面的源码整理已全部完成，共 420 组双语预览、840 份当前引用的独立 TSX。75 组完成文档与 Chromium 验收；Drawer、FileList、Table 三组文档已完成，但保留组件缺陷红灯，不按全绿交付。最终报告和检查边界见文末。

## 范围与完成条件

- 以当前 `docs/components/` 为范围清单，共 78 组中英文页面，包含总览、图标入口与配置页；新增、删除或合并页面时同步更新清单。
- 每页检查内容取舍、基础/常用/进阶/API 层级、重要使用约束、API 和链接准确性，以及示例的单一目的、宽度、对齐、文字角色、窄屏与双语一致性。
- 生成表只通过生成器修改；不改变组件实现，不用站点 CSS 掩盖组件外观。保留全部既有并行改动。
- 每批完成定向格式、文档类型/结构检查和最终态生产构建；真实页面覆盖中英文、宽窄屏、浅深外观、相关交互、源码展开/复制及截图审阅。
- 页面整理完成但浏览器验收未完成时，状态只能是“待验收”；不得用扫描器、构建通过或抽查一页支持整批/全站完成。最终还需统一复验。

## 批次

| 批次 | 页面 | 当前情况 | 验收证据 |
| --- | --- | --- | --- |
| 样板 | menu | 样板已获用户认可；最终汇总复验通过 | 本轮 `menu.spec.ts` 8 项 Chromium 通过，包含在第 1 批主报告中 |
| 1 | button、badge、tag、input、textarea、input-number、alert、result、empty、color-picker | 已完成文档与 Chromium 验收 | 类型检查、32 项文档测试、生产构建、148 个独立 Chromium 用例最终通过；报告见本页批次验收记录 |
| 2 | checkbox、radio、switch、slider、rate、progress、loading、loading-bar、skeleton | 已完成文档与 Chromium 验收 | 类型检查、32 项文档测试、生产构建、108 个独立 Chromium 用例最终通过；报告见本页批次验收记录 |
| 3 | flex、space、grid、typography、avatar、statistic、card、descriptions、divider | 已完成文档与 Chromium 验收 | 72 项布局通过；48 项交互中 8 项定位修正后复跑通过，详见本页记录 |
| 4 | anchor、breadcrumb、pagination、steps、tabs、dropdown、tooltip、popover、popconfirm | 已完成文档与 Chromium 验收 | 127 个独立用例最终通过，截图发现的问题已修正、重建和复验 |
| 5 | select、mentions、tree-select、input-mask、input-otp、auto-complete、cascader、transfer、tree | 已完成文档与 Chromium 验收 | 120 个独立用例最终通过；TreeSelect 修正已重建、复验和实际审图 |
| 6 | calendar、date-picker、date-range-picker、form、upload、file-list、modal、drawer、confirm | 文档整理与审图完成；两页有组件缺陷红灯 | 148 个独立用例最终通过，8 项图库 / Drawer 严格失败保留；不是整批全绿 |
| 7 | image、qr-code、error-boundary、carousel、collapse、timeline、message、notification、tour | 已完成文档与 Chromium 验收 | 116 个独立用例最终通过，详见本页记录 |
| 8 | scroll-area、scrollbar、virtual-list、infinite-scroll、masonry、splitter、layout、back-top、float-button | 已完成文档与 Chromium 验收 | 最终全量布局 / 行为通过；BackTop 与 FloatButton 修正后重建、定向复验和实际审图通过 |
| 9 | config-provider、icons、index、table | 四页文档完成；Table 有组件缺陷红灯 | 总览 / 图标 / 配置验收通过；Table 指针手柄及英文窄屏错误反馈缺陷严格保留 |

## 页面清单

| 页面 | 批次 | 状态 |
| --- | --- | --- |
| alert | 1 | 已完成文档与 Chromium 验收 |
| anchor | 4 | 已完成文档与 Chromium 验收 |
| auto-complete | 5 | 已完成文档与 Chromium 验收 |
| avatar | 3 | 已完成文档与 Chromium 验收 |
| back-top | 8 | 已完成文档与 Chromium 验收 |
| badge | 1 | 已完成文档与 Chromium 验收 |
| breadcrumb | 4 | 已完成文档与 Chromium 验收 |
| button | 1 | 已完成文档与 Chromium 验收 |
| calendar | 6 | 已完成文档与 Chromium 验收 |
| card | 3 | 已完成文档与 Chromium 验收 |
| carousel | 7 | 已完成文档与 Chromium 验收 |
| cascader | 5 | 已完成文档与 Chromium 验收 |
| checkbox | 2 | 已完成文档与 Chromium 验收 |
| collapse | 7 | 已完成文档与 Chromium 验收 |
| color-picker | 1 | 已完成文档与 Chromium 验收 |
| config-provider | 9 | 已完成文档与 Chromium 验收 |
| confirm | 6 | 已完成文档与 Chromium 验收 |
| date-picker | 6 | 已完成文档与 Chromium 验收 |
| date-range-picker | 6 | 已完成文档与 Chromium 验收 |
| descriptions | 3 | 已完成文档与 Chromium 验收 |
| divider | 3 | 已完成文档与 Chromium 验收 |
| drawer | 6 | 文档完成；组件缺陷待处理 |
| dropdown | 4 | 已完成文档与 Chromium 验收 |
| empty | 1 | 已完成文档与 Chromium 验收 |
| error-boundary | 7 | 已完成文档与 Chromium 验收 |
| file-list | 6 | 文档完成；组件缺陷待处理 |
| flex | 3 | 已完成文档与 Chromium 验收 |
| float-button | 8 | 已完成文档与 Chromium 验收 |
| form | 6 | 已完成文档与 Chromium 验收 |
| grid | 3 | 已完成文档与 Chromium 验收 |
| icons | 9 | 已完成文档与 Chromium 验收 |
| image | 7 | 已完成文档与 Chromium 验收 |
| index | 9 | 已完成文档与 Chromium 验收 |
| infinite-scroll | 8 | 已完成文档与 Chromium 验收 |
| input | 1 | 已完成文档与 Chromium 验收 |
| input-mask | 5 | 已完成文档与 Chromium 验收 |
| input-number | 1 | 已完成文档与 Chromium 验收 |
| input-otp | 5 | 已完成文档与 Chromium 验收 |
| layout | 8 | 已完成文档与 Chromium 验收 |
| loading | 2 | 已完成文档与 Chromium 验收 |
| loading-bar | 2 | 已完成文档与 Chromium 验收 |
| masonry | 8 | 已完成文档与 Chromium 验收 |
| mentions | 5 | 已完成文档与 Chromium 验收 |
| menu | 样板 | 已完成文档与 Chromium 验收 |
| message | 7 | 已完成文档与 Chromium 验收 |
| modal | 6 | 已完成文档与 Chromium 验收 |
| notification | 7 | 已完成文档与 Chromium 验收 |
| pagination | 4 | 已完成文档与 Chromium 验收 |
| popconfirm | 4 | 已完成文档与 Chromium 验收 |
| popover | 4 | 已完成文档与 Chromium 验收 |
| progress | 2 | 已完成文档与 Chromium 验收 |
| qr-code | 7 | 已完成文档与 Chromium 验收 |
| radio | 2 | 已完成文档与 Chromium 验收 |
| rate | 2 | 已完成文档与 Chromium 验收 |
| result | 1 | 已完成文档与 Chromium 验收 |
| scroll-area | 8 | 已完成文档与 Chromium 验收 |
| scrollbar | 8 | 已完成文档与 Chromium 验收 |
| select | 5 | 已完成文档与 Chromium 验收 |
| skeleton | 2 | 已完成文档与 Chromium 验收 |
| slider | 2 | 已完成文档与 Chromium 验收 |
| space | 3 | 已完成文档与 Chromium 验收 |
| splitter | 8 | 已完成文档与 Chromium 验收 |
| statistic | 3 | 已完成文档与 Chromium 验收 |
| steps | 4 | 已完成文档与 Chromium 验收 |
| switch | 2 | 已完成文档与 Chromium 验收 |
| table | 9 | 文档完成；组件缺陷待处理 |
| tabs | 4 | 已完成文档与 Chromium 验收 |
| tag | 1 | 已完成文档与 Chromium 验收 |
| textarea | 1 | 已完成文档与 Chromium 验收 |
| timeline | 7 | 已完成文档与 Chromium 验收 |
| tooltip | 4 | 已完成文档与 Chromium 验收 |
| tour | 7 | 已完成文档与 Chromium 验收 |
| transfer | 5 | 已完成文档与 Chromium 验收 |
| tree | 5 | 已完成文档与 Chromium 验收 |
| tree-select | 5 | 已完成文档与 Chromium 验收 |
| typography | 3 | 已完成文档与 Chromium 验收 |
| upload | 6 | 已完成文档与 Chromium 验收 |
| virtual-list | 8 | 已完成文档与 Chromium 验收 |


## 批次验收记录

### 第 1 批（2026-10-26）

- 范围为 10 组双语页面，每种语言 59 个预览；Menu 同时复验。当前累计分批验收 11 / 78 组页面，剩余 67 组不能算作完成。
- `pnpm --filter @leaf-ui/docs typecheck`、127 个相关 TSX 的 Biome、6 个相关浏览器测试文件的 Biome、定向 `git diff --check` 通过。
- `node --test apps/docs/scripts/versioned-docs.test.mjs apps/docs/scripts/docs-structure.test.mjs`：32 / 32 通过。定向 API 生成后执行最终生产构建，通过；日志为 `packages/react/.quality/docs-rewrite-batch1-build-final.log`。
- 生产页主报告 `packages/react/.quality/browser/docs-rewrite-batch1-20261026-verified/`：140 通过、8 个 Tag 用例因 Text 内层节点定位错误失败；只修正定位，保留几何与交互断言，使用相同生产产物定向复跑 `packages/react/.quality/browser/docs-rewrite-batch1-20261026-tag-verified/`：8 / 8 通过。最终 148 个独立用例均已通过，不将其描述为单次运行 148 / 148。
- 浏览器覆盖中英、1280 / 375px、浅深外观；通用 80 项覆盖居中、边界、溢出、源码复制与展开、主题色切换和页面错误。专项包含按钮异步防重复、分裂菜单、标签选择和关闭、提示重显、结果反馈、原生字段关联、自动高度、高精度字符串及颜色 / 渐变操作。
- 三个分工分别实际审阅 Button / Badge / Tag、Input / Textarea / InputNumber、Alert / Result / Empty 每页 4 组截图；主代理审阅 ColorPicker 全 8 组，以及弹层与修正后的 Tag / Result 四组截图。Tag 的 3 组紧凑预览已从 480px 改为自然宽；长 Result 的截图仅在截图期间隐藏站点导航，避免粘性导航遮挡首项，不改变预览和实际交互。
- API 纠正通过生成器维护：ColorPicker 受控值无内置默认值；Alert 回调为点击关闭时触发，正文明确重挂载责任；Result 的 `error` 别名、标题 / 说明及补充内容语义准确分开。没有修改组件实现。
- 边界：未运行 Firefox / WebKit、全库单元测试或全量仓库检查；未提交、未发布。两个原有 CRLF 脚本的完整 Biome 格式检查仍报行尾差异，未为此整文件格式化他人已有改动；其语法和禁用 formatter 的 lint 检查通过。未宣称全站或全仓质量门禁通过。
- 第 2 批文档源码在此生产构建完成后开始整理，不在本批产物和验收结论范围内。

### 第 2 批（2026-10-26）

- 范围为 9 组双语页面，每种语言 45 个预览；当前累计分批验收 20 / 78 组页面，仍有 58 组未完成。
- 相关示例与 4 个浏览器测试文件的 Biome、文档类型检查、定向差异检查通过；32 项文档结构 / 版本与 API 测试通过。9 页双语 API 定向生成后再次生成结果不变；生成器语法与禁用 formatter 的 lint 检查通过，未整文件改写既有 CRLF 行尾。
- 初始生产构建通过；布局主报告 `packages/react/.quality/browser/docs-rewrite-batch2-20261026-verified/` 为 72 / 72 通过，覆盖 9 页中英、1280 / 375px、浅深外观、居中 / 边界 / 溢出、每个示例源码与复制一致、展开收起及主题色切换。
- 交互主报告 `packages/react/.quality/browser/docs-rewrite-batch2-20261026-interactions/` 为 32 通过、4 个 LoadingBar 用例失败：测试错误地要求加载结束的 Button 保留 `aria-busy="false"`，实际契约为移除属性。只修正该属性断言，保留任务完成、禁用恢复、独立受控条不清空服务任务等断言。
- 三个分工实际审阅各 3 页的 12 张截图。截图发现 Checkbox 英文窄屏状态截断、Radio 列表首项同时放图标与标签导致文字过窄；精简状态文案、去除列表中不一致的图标并缩短必要说明。新增窄屏标签文本 / 边界 / 溢出与 Radio 两行文字左对齐回归；没有改组件样式或用站点 CSS 修补。
- 修正后再次完成文档类型检查、32 项文档测试与最终生产构建，日志 `packages/react/.quality/docs-rewrite-batch2-build-final.log`。只复跑受影响的 Checkbox / Radio 布局、交互与 LoadingBar 4 项，报告 `packages/react/.quality/browser/docs-rewrite-batch2-20261026-final/`：28 / 28 通过。主代理另实际审阅修正后的两页中英宽窄截图。108 个独立用例最终均通过，不称为单次 108 / 108。
- 交互覆盖全选 / 半选、原生单选互斥与键盘、加载开关不可修改；Slider 离散刻度 / 区间不穿越 / 操作完成事件；Rate 清空 / 半星 / 只读与重置；Progress 边界、成功状态及分段读数；Loading 延迟取消与 inert、LoadingBar 任务作用域、Skeleton 子内容挂载与卸载。
- API 从生成维护源修正 Checkbox / Radio / Switch 的受控与初始值、Radio 原生 value 类型、Slider 分模式默认值与完成事件、Rate 默认值和表单字段说明、Skeleton 圆角与内容挂载语义、LoadingBar 单任务完成与全作用域 reset。未改组件实现。
- 边界：未运行 Firefox / WebKit、全库单元测试或全量仓库检查；未提交、未发布。Tooltip 截图未激活，不确定进度的单帧不代表动态连续性验收；其相关状态与交互由专项测试覆盖，不宣称完整动效或人工辅助技术验收。

### 第 3 批（2026-10-26）

- 范围为 9 组双语页面，每种语言 45 个预览。本批分批验收完成，当前累计 29 / 78 组页面，仍有 49 组未完成。
- 94 个相关示例 TSX 与 6 个浏览器测试文件的 Biome、文档类型检查、38 项文档结构 / 版本与 API 测试、定向差异检查通过；9 页双语 API 最终再次生成结果不变。最终生产构建日志为 `packages/react/.quality/docs-rewrite-batch3-build-final.log`。
- 布局主报告 `packages/react/.quality/browser/docs-rewrite-batch3-20261026-verified/` 为 72 / 72 通过，覆盖中英、1280 / 375px、浅深外观、居中 / 边界 / 溢出、各例源码复制与展开收起、主题切换。
- 交互报告 `packages/react/.quality/browser/docs-rewrite-batch3-20261026-interactions/` 为 40 通过、8 项 Flex / Space 因 Text 内层内容节点被误当成布局兄弟节点而失败；只修正定位到 Text 根节点，保留全部几何与行为断言。相同生产产物定向报告 `packages/react/.quality/browser/docs-rewrite-batch3-20261026-layout-final/` 为 8 / 8 通过。最终 120 个独立用例通过，不称为单次 120 / 120。
- 专项覆盖布局方向 / 对齐 / 间距及断点、原生描述列表 / 跨列和分割线语义、排版复制 / 编辑 / 省略、统计动画和两轮倒计时、头像折叠、Card 选择 / 保存重置 / 标签页状态保留 / 正文加载。
- 生成器修正 Space 数组间距、Descriptions 列数和 span、Statistic 展示值 / Countdown 事件、Card 加载责任及 Avatar 内容说明；Grid 主组件 API 优先。新增章节重排和嵌套 API 标题回归，保留 AvatarGroup 外层锚点，不再误删内表。停止自动追加孤立类型导入章节。
- 72 张预览联系表已生成；主代理实际审阅全部 9 页英文窄屏深色，三类分工分别实际审阅对应 3 页的 12 张中英宽窄深浅组合；主代理另审阅头像溢出弹层截图，未发现需修正的视觉问题。Statistic 部分截图为动画中间值，端点和重播行为由 clock 专项验证，不将单帧当成连续动效验收。
- 边界：未运行 Firefox / WebKit、全库单元测试或全量仓库检查，未提交、未发布；第 4 批源码在本批最终构建完成后才开始写入，不属于本批生产产物。

### 第 4 批（2026-10-26）

- 9 组双语页面，每种语言 44 个预览。相关示例 / 测试格式、文档类型检查、38 项文档结构 / 版本与 API 测试、定向 API 生成幂等及生产构建通过。首次生产构建日志 `packages/react/.quality/docs-rewrite-batch4-build-final.log`。
- 主报告 `packages/react/.quality/browser/docs-rewrite-batch4-20261026-verified/` 为 72 / 72 通过；新专项 `packages/react/.quality/browser/docs-rewrite-batch4-20261026-interactions/` 为 36 / 36 通过。专项包含 Anchor 滚动 / hash / 焦点和 Affix、Breadcrumb 键盘折叠菜单、Pagination 状态 / 范围、Steps 当前状态与进度、Tabs 状态保留 / 增删 / 键盘排序、菜单层级与选择、Tooltip 描述关联、Popover 表单写回和 Popconfirm 等待保护 / 失败重试。
- 既有专项报告 `packages/react/.quality/browser/docs-rewrite-batch4-20261026-existing/` 为 8 通过、8 个 Reader 用例失败：颜色指南测试仍寻找已移除的自动字色标签页。按当前源码的默认白字 / 手动黑字按钮修正测试；相同生产产物 `packages/react/.quality/browser/docs-rewrite-batch4-20261026-reader-final/` 为 8 / 8 通过。`packages/react/.quality/browser/docs-rewrite-batch4-20261026-source-final/` 为 3 / 3 通过，含 Tabs 源码展开 / 收起 / 复制和修正后的双语颜色指南检查。
- 已生成 72 张预览联系表。实际打开交互截图发现 Popover 编辑表单浮层内部水平裁切，页面级溢出断言未覆盖；Tooltip 禁用对比的按钮被 Grid 拉伸。正在用公开浮层宽度与布局组件修正文档示例并补内部边界断言，必须重新构建和复验后才能计为完成。
- 当前仍仅累计分批验收 29 / 78 组；没有因 127 个独立用例曾通过就将本批误记为已完成。第 5 批源码不属于首次生产产物。
- 后续修正：Popover 受控表单示例通过公开 `width={280}` 明确浮层宽度；Tooltip 禁用对比使用公开 Flex 避免按钮被 Grid 拉伸。双语均已修正，没有改组件样式。新回归检查浮层内部标题 / 标签 / 输入 / 操作的文字与边界，以及紧凑按钮与基础例宽度一致。
- 修正后通过类型、38 项文档测试与最终生产构建（`packages/react/.quality/docs-rewrite-batch5-build-final.log`）。受影响的 16 项布局复跑通过，位于 `docs-rewrite-batch5-20261026-verified/` 的 88 项中；8 项 Tooltip / Popover 交互复跑通过，位于 `docs-rewrite-batch5-20261026-interactions/` 中，该报告另有第 5 批失败，不能称整份全绿。
- 主代理实际审阅修正后 4 张中英宽窄 Popover 打开原图，以及 Tooltip 中宽浅 / 英窄深联系表；标题、字段和完整操作均可见。累计 127 个独立用例最终通过，本批计为分批验收完成；当前累计 38 / 78 组，未宣称全站完成。边界仍为 Chromium，未运行 Firefox / WebKit、全仓检查或人工辅助技术验收，未提交、未发布。

### 第 5 批（2026-10-26）

- 9 组双语页面，每种语言 67 个预览。相关 134 份示例和专项测试格式、文档类型、38 项结构 / 版本与 API 测试通过，9 页双语 API 内容与文件时间均幂等。首次最终构建日志 `packages/react/.quality/docs-rewrite-batch5-build-final.log`。
- `docs-rewrite-batch5-20261026-verified/`：88 / 88 通过，其中本批 72 项，另 16 项为第 4 批修正复验。覆盖双语、1280 / 375px、浅深外观、预览边界、源码复制 / 展开收起和主题切换。
- `docs-rewrite-batch5-20261026-interactions/`：22 通过 / 10 失败。其中 8 项为第 4 批复验通过，12 项文本输入专项和 2 项中文 TreeSelect 通过。Select 创建例错误套用另一例标签；Mentions 的 fill 没有真实键盘 keyup，首个 ArrowDown 被 React 选择事件重置；分别修正期望并改为真实逐键输入，未改组件或削弱断言。相同产物 `docs-rewrite-batch5-20261026-selection-input-final/`：8 / 8 通过。
- 另 2 项英文 TreeSelect 失败是真实的缩进选项文字裁切，已缩短该例双语样本标签，保留选项 key 与能力；需要新生产产物再验收，未因页面无溢出而忽略浮层内部裁切。
- `docs-rewrite-batch5-20261026-existing/`：12 / 12 通过，含既有 Reader 和 choice popup；`docs-rewrite-batch5-20261026-hierarchy/`：4 通过 / 8 失败，分别为 Cascader 未提交路径重开重置后需要重新展开，以及 Tree 的 DnD live region 与业务 status 同名。只修正操作路径和精确定位，保留真实缓存与拖拽写回断言；相同产物定向 `docs-rewrite-batch5-20261026-hierarchy-final/`：8 / 8 通过。
- 72 张联系表已生成。三个分工实际审阅各自 3 页每页 4 个中英宽窄浅深组合；主代理实际审阅全部 9 页英文窄深。文本输入分工另实看 8 张英文窄屏关键原图。打开后的 Select / TreeSelect / Cascader / Tree 原图及 TreeSelect 修正复验仍待补齐，当前累计分批验收仍为 38 / 78。

- 后续最终复验：TreeSelect 双语样本标签缩短后随第 6 批最终生产产物重新构建（`packages/react/.quality/docs-rewrite-batch6-build-final.log`）；`docs-rewrite-batch6-20261026-verified/` 的 80 / 80 中包含受影响的 TreeSelect 8 / 8，`docs-rewrite-batch6-20261026-interactions/` 为 TreeSelect 4 / 4。
- 主代理实际打开 Select 丰富选项 / 浮层操作、Cascader 路径和 Tree 懒加载失败的四组合联系表，以及修正后的 TreeSelect 四张原尺寸打开图；缩进选项完整可读，没有用页面无溢出代替内部裁切检查。120 个独立用例最终通过（72 布局 + 36 新专项 + 12 既有专项，分散报告，不是单次全绿）。本批计为分批验收完成，累计 47 / 78；最终全站汇总复验、Firefox / WebKit 与人工辅助技术验收仍未完成。

### 第 6 批验收中（2026-10-26）

- 9 组双语页面，每种语言 60 个预览。132 个相关 TSX / 测试的 Biome、文档类型检查、38 项结构 / 版本与 API 测试通过；18 页定向 API 再生成的内容与文件时间不变。生产构建日志 `packages/react/.quality/docs-rewrite-batch6-build-final.log`。
- `docs-rewrite-batch6-20261026-verified/` 为 80 / 80，其中本批 72 项、另 8 项为第 5 批 TreeSelect 最终复验。`docs-rewrite-batch6-20261026-existing/` 为 44 / 44，覆盖既有 Form / FileList / Modal / Confirm / 分模式日期 / Reader（含全组件窄屏扫描和上传进度取消）。
- 首次日期 / 文件专项 `docs-rewrite-batch6-20261026-form-date/` 为 12 通过 / 12 失败：日期 helper 错把定位属性放在内层 dialog 检查；修正关联外层定位后 `docs-rewrite-batch6-20261026-date-final/` 为 4 宽屏通过 / 4 窄屏失败。实际测量和截图证明窄屏面板为合法纵向滚动，内容横向没有溢出；改为检查真实滚动内容边界并逐项滚入检查完整可达性，而非要求两个月或全部时间列同时位于有限高度内。`docs-rewrite-batch6-date-scroll-reachability-20261026/` 的 4 窄屏通过，未放宽内部文字或横向边界。
- 文件图片预览的失败不是错误断言：卡片打开首图后点下一张到末张，Next 变 disabled，焦点落到 body，Escape 无法关闭。`form-file-examples.spec.ts` 保留 4 个严格红灯，独立拆出文件状态与移除，`docs-rewrite-batch6-20261026-file-removal/` 为 4 / 4。组件证据：`packages/react/src/image/viewer.tsx` 的自定义 Control 不包含 YARL 原生 NavigationButton 的禁用失焦恢复。
- 弹层专项 `docs-rewrite-batch6-20261026-dialog/` 为 8 通过 / 4 Drawer 失败：默认 card Drawer 的 Scrollbar body 使用 width:100% 再加两侧 margin，造成真实 6px 横向越界。保留严格 shell 溢出回归，使用软断言继续采集其它交互证据，不提高阈值或改默认示例来避开缺陷。没有修改组件实现。
- 三个分工分别实际 view_image 审阅对应 3 页的 12 张联系表（中英、宽窄、浅深），并审阅打开的弹层、图库和日期滚动到底的原图；主代理实际审阅全部 9 页英文窄深联系表，以及 Modal / Confirm 四组合打开联系表和窄屏错误重试原图。没有仅凭截图生成宣称视觉验收。
- Calendar 英文宽屏日程的长样本被组件单元格截断，已仅缩短为 Review / Sync，随下一批构建后重验；不改组件样式。FileList Escape 与 Drawer body 两项既有组件缺陷尚未解决，不能宣称本批全绿或全站完成。


### 第 6 批补充复验（2026-10-26）

- Calendar 日程缩短后随第 7 批重建，8 项布局与 4 项 Calendar 行为复验通过；主代理实际查看英文宽屏深色日程联系表，Review / Sync 与 Release 完整可读。
- Drawer 后续严格报告 `docs-rewrite-batch6-20261026-drawer-evidence/` 保留 4 项失败；40 条软错误均为同一实际 6px shell 越界，后续方向、原生提交、调整大小与嵌套操作均继续执行。没有把继续采集到的行为证据当作该用例通过。
- 本批 156 个独立用例中，148 项最终通过、8 项已知组件缺陷失败。其余七页完成分批验收；Drawer / FileList 文档已整理和审图，但对应组件缺陷没有修复。当前按页面计 63 / 78 分批验收通过，另两页保留红灯，13 页仍在收尾。

### 第 7 批（2026-10-26）

- 9 组双语页面，每种语言 39 个预览；78 份独立 TSX。文档类型、38 项结构 / 版本与 API 测试、18 页定向 API 内容与文件时间幂等通过。生产构建日志 `packages/react/.quality/docs-rewrite-batch7-build-final.log`。
- `docs-rewrite-batch7-20261026-verified/` 为 80 / 80，其中本批 72 项，另 8 项为 Calendar 修正复验。`docs-rewrite-batch7-20261026-interactions/` 为 23 通过 / 1 QRCode 失败；加载图标旋转造成 scrollWidth 瞬时大于布局宽度，实测所有旋转帧仍在二维码内。仅改为分别检查布局尺寸、变换后边界与真实裁切祖先，保留其它文字 / 控件边界检查；`docs-rewrite-batch7-spinner-fit-20261026/` QRCode 4 / 4。
- 既有 Image 测试首次因定位同时匹配原生 img 和同名 role=img 占位而失败，精确限定占位节点后 `docs-rewrite-batch7-20261026-image-final/` 8 / 8。旧报告中的 Calendar 4 项通过属于第 6 批，不重复计入本批独立数量。
- `docs-rewrite-batch7-20261026-transient/` 为 4 Tour 通过 / 8 Message 与 Notification 失败：多个同毫秒到期任务的嵌套 0ms timer 在 Playwright paused clock 下需要下一 tick。用四次相隔 100ms 的真实触发验证各自 2999/3000 或 4499/4500ms 边界和精确消失身份，不延长寿命、不改组件。相同产物 `docs-rewrite-batch7-20261026-transient-staggered/` 12 / 12。
- 116 个独立用例最终通过（72 布局、36 新专项、8 既有专项），是分散报告而非一次全绿。包含图片预览与独立关闭、QRCode 刷新 / 下载、ErrorBoundary 默认与自定义恢复、轮播自动与受控、Collapse 状态保留与销毁、Timeline、服务消息独立计时与替换 / 共享队列、通知四位置与自身 key 操作、Tour 目标 / 缺失策略 / 焦点和无遮罩编辑。
- 三类分工分别实际查看各 3 页 12 张联系表及打开的原图，主代理实际查看全部 9 页英文窄深和修正 Calendar 英文宽深；没有发现需修正的文档视觉问题。ImageViewer 末张焦点 / Escape 的独立红回归仍保留在第 6 批，不因 Image 示例的显式关闭通过而抹去。
- 边界：只完成 Chromium，未执行 Firefox / WebKit、全仓检查、真实扫码或人工读屏；Message 的定时例没有可聚焦内容，不能据此宣称消息焦点暂停已覆盖。未提交、未发布。

### 第 8 批分批验收与最终修正（2026-10-26）

- 九组双语页面已整理。API 补全 ScrollArea.persistent、InfiniteScroll 自动寻找滚动祖先 / 取消与错误责任、Splitter 比例 / 结束事件、Layout 断点和 BackTop 大于等于阈值等语义；生成表通过维护源更新。
- 先前生产产物中的 120 个独立 Chromium 用例分散通过：本批 72 项布局，以及 `docs-rewrite-batch8-20261026-scrolling/` 的 20 项、`docs-rewrite-batch8-20261026-streaming-verified/` 的 16 项、`docs-rewrite-batch8-20261026-utilities-final/` 的 12 项。它们不是同一次全绿运行，也不证明随后修改的 FloatButton 最终态。
- 三类分工实际查看各自负责页面的中英宽窄深浅联系表与关键原图，主代理实际查看九页及 ConfigProvider / Icons 的英文窄深联系表。审图发现 BackTop 两个按钮在窄屏靠得过近；仅将窗口返回顶部按钮通过公开位置参数改到左侧，回归要求两个可见按钮矩形不重叠。
- FloatButton 原外部 Switch 的直接点击探针四项失败：外部 pointerdown 先关闭浮层，随后 Switch 又切回展开。示例改为幂等的“展开 / 收起”公开 Button，不改组件事件、不阻断冒泡；回归保留连续展开 / 收起、触发器、菜单动作、外部点击与 Escape。失败探针 `docs-rewrite-batch8-20261026-float-switch-probe/` 保留，最终态进入全量汇总复验。
- Calendar 等已通过批次不再重复计数。三个分工没有启动重复的最终全站测试；BackTop / FloatButton 的最终交互和截图由同一全量报告继续补齐。

### 第 9 批与全量源码核查（2026-10-26）

- ConfigProvider 九个独立示例 / 语言：移除彩蛋、重复默认值展板和假保存，保留语言 / 法语部分资源回退、区域主题、密度、基础高度、共享 Input 默认值、Modal 关闭责任、继承覆盖与 null 清除。Grid 间距改用其公开数字参数，并检查真实计算间距。Icons 两例 / 语言仅保留按钮及有名称的字段。
- Table 完成 26 份独立 TSX、13 例 / 语言：基础、简化、排序、选择、工具栏与搜索、独立展开、状态、固定列 / 调整列宽、分组、编辑、排序拖动、虚拟滚动和远程控制。保留 TanStack 受控 updater、服务端排序分页和请求清理责任，使用公开子路径，不用私有 helper / CSS；全部 21 个既有 API 锚点保留，API 集中置后。
- 全量 78 组页面、420 组双语预览的数量、次序、导出、宽度、JSX 结构与布局参数一致；840 份当前引用源码抽取 / 解析 / 再抽取幂等且无缺失依赖。当前源码不再保留 `english` 语言分支；另 29 份未引用旧文件不为本次清理而删除。
- 840 份当前 TSX、45 份文档浏览器 spec 的 Biome 通过；996 份页面 / 当前示例无行尾空白，516 个内部 Markdown 链接 / 锚点有效。全量 API 生成成功后，166 份组件 / 参考文档的内容与 mtime 再次不变。Avatar 主 API 位于组 API 之前；所有有 API 的组件页统一外层章节并保留旧锚点，增加结构回归。
- 最终冻结前 `pnpm test:docs` 为 43 / 43，文档类型检查通过；生产构建 `packages/react/.quality/docs-rewrite-final-frozen-build.log` 通过，导出 Leaf UI 0.8.1 的 190 份 Markdown。全量 Chromium 汇总报告为 `docs-rewrite-final-20261026-frozen-aggregate/`，1059 通过 / 12 失败，详见最终汇总。
- 实际分段检查总览四张长图共 30 段，发现中文宽屏少量装饰箭头独占一行，以及深色 Tooltip 静态缩略图的白底白字。仅修正文档总览标题布局和该缩略图的既有颜色角色映射；离线转换确认其它 78 份 SVG 不变，新增实际文字 / 箭头几何与 SVG 文字背景对比度回归。已统一重建并定向复验，不将旧截图算作修正后的通过证据。

## 最终汇总（2026-10-26）

### 完成范围与修正

- 78 组双语页面、420 组双语预览已全部整理；75 组完成文档与 Chromium 验收，Drawer / FileList / Table 三组保留组件缺陷。没有因组件红灯而删除能力、改默认示例避开问题，或在文档站写组件修补 CSS。
- 内容按最小可运行、常用、进阶、API 组织；删除内部尺寸清单、修复动机、重复讲解和装饰性业务展板。预览外层居中、内层按用途对齐，紧凑对比名称宽屏在左 / 窄屏在上，宽字段名称在上，真实字段使用 FormField。
- 最新总览标题 / Tooltip 缩略图与 FloatButton 提示区域修正后，重新执行 `pnpm test:docs` 43 / 43 及 `pnpm build:docs`，日志 `packages/react/.quality/docs-rewrite-final-corrections-structure.log`、`packages/react/.quality/docs-rewrite-final-corrections-build.log`。总览中文短标签再以 inline-block 保持整体自然换行后，最终构建 `packages/react/.quality/docs-rewrite-final-overview-build.log` 再次通过，仅复验受影响总览四项；不为纯文档总览样式重跑无关组件。导出仍为 Leaf UI 0.8.1 的 190 份 Markdown，最后构建后没有改生产源码。
- 最终改动分别完成相关 Biome、SCSS 格式、文档类型与专项测试严格类型检查；全量文档 API 幂等、当前示例抽取和中英布局审计已通过。限定文档 / 示例 / 测试 / 规范路径的 `git diff --check` 通过，保留已有 CRLF 转 LF 的提示，不为此整文件格式化。

### 浏览器报告

以下报告均在 `packages/react/.quality/browser/`，保留原始失败，不拼接为一次全绿：

| 报告目录 | 结果 | 范围与结论 |
| --- | --- | --- |
| `docs-rewrite-final-20261026-frozen-aggregate/` | 1059 通过 / 12 失败；0 跳过、0 flaky | 全量 1071 项、中英宽窄深浅；失败为 Drawer 四项、FileList 四项、Table 指针调宽四项。全部通用页面布局、源码展开 / 收起 / 复制和主题切换通过；总览 / FloatButton 审图后仍有局部修正，以下报告覆盖其最终态。 |
| `docs-rewrite-final-20261026-corrections/` | 44 通过 / 4 失败；0 跳过、0 flaky | 最新构建的总览四项、Icons 四项、Table / FloatButton 布局各八项、FloatButton 行为四项、Table 新专项二十项。Table 指针调宽保留四项高度为零的严格失败；独立拆分的键盘 / 固定列 / 虚拟化不再被前置失败遮住。 |
| `docs-rewrite-final-20261026-table-feedback/` | 7 通过 / 1 失败；0 跳过、0 flaky | 修正重试完成时机后的四项真实重试通过；新增四项错误反馈内部边界检查，英文 375px 深色失败：标题右边界 351px，视口右边界 329px，真实裁切而非断言误差。 |
| `docs-rewrite-final-20261026-table-virtual/` | 4 / 4 通过 | 仅加强独立虚拟化末项验收：等动态测量后真实再次滚到底，检查第 10000 行完整位于实际视口 / sticky 表头之间，DOM 行数仍小于 60；不以仅 `toBeVisible()` 当作完整可达。 |
| `docs-rewrite-final-20261026-overview-labels/` | 4 / 4 通过 | 中文短标签保持整体换行后的最后生产产物；总览过滤 / 重置 / 导航、标题箭头真实几何与 Tooltip 缩略图文字背景对比均通过。 |

- 初始 `docs-rewrite-final-20261026-aggregate/` 曾在 26 项通过后主动中断以修正剩余语言分支和外部控制示例，不作为最终全量通过证据。
- 分批实际审阅各页联系表和关键打开状态原图。最终又审阅 Table 八组合 104 个预览、BackTop 八张已显现原图、FloatButton 八张修正后展开 / 静止收起原图，以及 ConfigProvider 的日文 / 法文空选项、Modal、基础高度与继承覆盖。总览修正后的四张长图完整查看 30 段，最后短标签换行改动另做定向审图。Table 最新四组重试完成原图没有加载遮罩，最新四组虚拟滚动末行完整可见。不是仅生成截图便宣称视觉通过。

### 保留的组件缺陷

| 页面 / 组件 | 实际问题 | 保留的严格证据 |
| --- | --- | --- |
| Drawer | 默认 card 的 Scrollbar body 使用 100% 宽度再加横向 margin，实际产生 6px shell 横向越界。 | `dialog-examples.spec.ts` 四个 profile；原有 1px 边界不变，软断言仅为继续采集其它交互，不转为通过。 |
| FileList / ImageViewer | 图库到末张后 Next disabled，焦点落到 body，Escape 无法关闭。 | `form-file-examples.spec.ts` 四项；不因显式关闭按钮可用或 Image 页独立通过而抹去。 |
| Table | 列宽拖动柄是原生 hr，被全局 reset 的 height:0 压成零高度；指针不能命中，实际拖动选中文字。 | `table-examples.spec.ts` 四项严格高度 / hit test / 指针调宽；没有改为仅键盘通过或使用 force。 |
| Table | 远程错误 Result 在宽 td 内居中，英文窄屏初始标题被可见 viewport 裁切；不能用数据列允许横滚代替状态可读性。 | 独立错误反馈检查真实 Range 文字、图标和 Retry 相对 viewport 的边界；英文 375px 深色保留失败与几何附件。 |

### 边界

- 本轮只改文档、示例、站点总览、API 生成维护源和相关测试 / 规范，不修组件库实现。组件缺陷是后续独立修复项，文档改造完成不等于组件全绿。
- 只执行 Chromium；未执行 Firefox / WebKit、全库单元测试、全仓 `pnpm check` / 库产物构建或人工 NVDA / VoiceOver、真实移动设备验收。浏览器断言与截图审阅不等同于连续动效或完整辅助技术验收。
- 未提交、未发布、未覆盖线上稳定版；保留全部既有并行改动。测试服务使用独立端口和报告，不复用或停止他人服务。

## 0.9.0 发布前复验（2026-10-27）

本节接续上述历史结果，不改写原始失败记录。验证对象是 `0.9.0` 开发工作区的发布候选（基于 `8c522ff`，包含尚未提交的修复），不是该基准提交本身或线上 0.8.1 的验收。

- 已修复上述四类组件问题：Drawer card body 越界；ImageViewer 边界导航禁用后失焦 / Escape 失效；Table 的 hr 拖柄零高度；Table 窄屏错误反馈裁切。真实文档复验另发现固定列合计 300px 超过 283px 视口时互相遮挡，现仅临时取消横向固定呈现，空间恢复自动固定，应用 pinning 状态不变。
- 最终生产构建后，`release-090-docs-final-candidate-20261027/` **212 / 212 通过**，0 失败、0 跳过、0 flaky：包含本次 Drawer / FileList / Table 严格回归、双语设计指南和 150 个双语结构化组件页。不是重新执行先前 1071 项全站汇总，不将二者拼成一次全绿。
- 完整 `pnpm check` 通过 **860 项**：组件 77 文件 / 692 项、发布 13、文档 72、Skill 32、颜色 47、工具 4；最终 `pnpm build` 通过，输出 190 份 Markdown、150 个结构化组件页和 686 个独立示例，身份仍明确为 `workspace`。
- 最终 Image Chromium / WebKit **20 / 20**，含独立 axe 审计；最终 Table 窄视口 WebKit **6 / 6**，覆盖 LTR / RTL、严格鼠标命中、列宽 / 隐藏列 / 容器变化与纵向固定表头。报告分别为 `release-090-image-lazy-final-20261027/`、`table-pinning-overflow-webkit-final-20261027/`。已查看最终 WebKit 命令式预览和 RTL 窄表截图，不把同框 fixture 当作整页视觉通过。
- React 18 在独立依赖快照中先完成 690 项全量单测；后续 Image / Table 修复同步后，完整类型检查和受影响 5 文件 / 76 项再次通过，源码与测试哈希无漂移。没有更改主工作区的 React 19 依赖，也不声称新最终态重新执行了 React 18 全量测试。
- 图片服务拆为轻 Scope 与按需 renderer。Vite / Rspack 的 32 个产物用例通过，确认 ConfigProvider 初始资源不带 Image / YARL 代码和样式；聚合体积仍计入全部延迟图。与 npm 0.8.1 的同口径实测对照及新增日期时间 / 分段输入、视觉结构成本保留在根 `.quality/release-0.9.0/`，对应三项预算按实际功能集同步，没有改测量口径或放开可选 Table 引擎边界。
- 保留 `release-090-surface-fixture-final-20261027/` 的 7 通过 / 2 个对比度失败；默认白字与主色 / 危险色的产品策略未擅自更改，未关闭 axe、放宽阈值或宣称完整无障碍通过。Firefox、人工读屏、真机触控与 Figma 导入仍未验收。
- 本节首次记录时仍未提交、推送、合并或发布；随后用户明确许可清理遗留 `.git/index.lock`，确认无 Git 进程且锁文件状态未变后已清理，继续分批提交与发布。本地验证不代表 npm 或正式文档已经更新。最终检查、构建、包内容、体积和各次原始失败日志保留在根 `.quality/release-0.9.0/`，浏览器报告保留在 `packages/react/.quality/browser/`；实际发布提交与后续验收另记在 `history/QUALITY-HISTORY.md`。
