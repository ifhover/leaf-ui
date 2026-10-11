# 组件质量验收

面向源码维护者。新增能力必须验证用户行为、公开产物和相应文档，不能仅以组件数量或测试数量判断成熟度。审计对应清单见 [AUDIT-IMPLEMENTATION.md](AUDIT-IMPLEMENTATION.md)。

## 0.5.0 发布准备（2026-10-11）

汇总开发分支的 Table / DataTable、Scrollbar、组件外观与动效、按需 CSS、双语示例及 npm 作用域迁移，组件版本提升至 `@ifhover/leaf-ui@0.5.0`。中英文正式更新记录包含旧包迁移、40px 默认高度、Confirm API 收敛、soft 外观与三个独立组件的移除，以及基础 / 完整 CSS 入口的区别；历史版本内容继续保留。

开发分支完整 `pnpm check` 与 `pnpm build` 通过：56 个组件测试文件 / 316 项测试、13 项发布规则、17 项文档与 9 项 Skill 测试，84 个公共 JS 子路径、ESM / CommonJS SSR 和 Vite / Rspack 共 20 个按需 CSS 生产构建场景。DTCG / SVG / Figma 设计资源及体积预算通过，整库 JS / CSS gzip 为 207.02 / 40.48 KiB。打包演练确认新作用域、0.5.0 版本及公共产物。

浏览器回归和 GitHub 审查继续执行；合并后需在实际发布提交重新检查与构建，再完成 npm、Git 标签、Pages 和旧包迁移提示。此处仅记录发布准备，不代表已发布。过程日志与本地验收证据位于仓库根目录 `.quality/release-0.5.0/`，真实 npm / Pages 状态以最终验收为准。

## npm 作用域迁移（2026-10-11）

当前包名、工作区依赖、构建与 CI 命令、README、双语使用文档和可运行示例统一为 `@ifhover/leaf-ui`。历史更新记录保留实际发布的旧包名。文档发布器同时发现新旧作用域，逐版校验包名、版本和 npm `gitHead`；新包尚未公开或只有开发预发布时，默认文档保持旧稳定版。同号冲突与新包低于旧包的正式版本会中止部署。AI 索引和导入路径读取快照 manifest，基础设施 overlay 使用该快照的包名。

Leaf UI Skill 更新为独立版本 `1.0.1`，支持新旧包的实际模块解析，同时安装两包时通过 `--package` 指定；索引和 Markdown 必须匹配精确的包名与版本，禁止跨作用域、跨版本或 latest 回退。Skill frontmatter 验证通过。

完整 `pnpm check`、`pnpm build`、锁文件安装及最终格式检查通过：56 个组件测试文件 / 316 项测试、13 项发布规则、17 项文档回归及 9 项 Skill 测试；84 个公共 JS 子路径、ESM / CommonJS SSR、独立样式和 Vite / Rspack 共 20 个按需 CSS 场景通过。只读 `npm pack --dry-run --ignore-scripts` 确认新包名和公开产物，不代表已执行 npm 发布。

新包名的 Vite 生产应用在 Chromium、WebKit、Firefox 验证根入口与子路径身份、主题、42px 高度、表单禁用上下文、跨入口 Message、Select 与日期浮层，无运行错误。Message 验收使用 `duration: 0` 避免自动关闭干扰；文档页面显式指定语言，双语安装路径及可交互示例通过，已查看截图。

`pnpm build:versions` 实际构建旧包 `0.1.0` 至 `0.4.2` 六个快照及默认入口；逐版 Markdown、API、源码提交和 Skill 查询通过，Chromium 验证六项版本菜单及从 `0.1.0` 返回默认 `0.4.2` 地址。系统临时目录的前两次构建未完成，出现文件占用与缺失路径；清理加入有限重试并保留原始构建错误，最终使用工作区 `.quality/versioned-staging` 作为该次进程的 TEMP / TMP 完成构建。原失败临时目录后续检查已不存在。报告、脚本与截图位于根目录 `.quality/npm-scope-migration/`。

npm 只读检查显示旧包已废弃且 latest 为 `0.4.2`，新包返回 404，CLI 登录返回 401。改动保留在 `codex/usage-style-cleanup`，组件版本未提升，未提交、合并、npm 发布或部署 Pages；正式发布前须以 `ifhover` 登录，选择高于旧包的版本并更新双语记录。操作见 [作用域迁移](RELEASING.md#npm-作用域迁移)。

## 根入口具名导入按需样式（2026-10-11）

浏览器根入口不再直接导入整库 CSS。构建将静态样式关联到组件的 TSX 实现模块，根入口与组件子路径共用同一份浏览器模块图；Node 默认模块图保留无 CSS 的 SSR 导出，客户端指令与源码映射同步保留。没有新增运行时样式引擎或组件包装层。根入口 CSS 按需裁剪已在 Vite 8 / Rspack 2 的生产构建验证；esbuild 保留遍历到的 CSS、CommonJS 根导入不能保证裁剪，这些环境仍可使用子路径。中英文快速开始、SSR 指南与 README / 开发说明同步。

完整 `pnpm check` 通过，包括 56 个组件测试文件 / 316 项测试、13 项发布规则、13 项文档及 7 项 Skill 检查。整库和双语文档构建、84 个公共子路径、ESM / CommonJS SSR 和自动 CSS 验证通过。新增生产构建回归纳入 `check:package`，Vite / Rspack 共 20 个场景验证单组件、组合字段、Table、DatePicker、ConfigProvider、纯辅助函数、未使用导入、懒加载、子路径与基础样式；根入口 Button 的 CSS 与子路径完全一致，不包含 Dropdown、Input、Modal 或 Table 的组件规则。

实际 Vite 生产页面在 Chromium、WebKit、Firefox 验证根入口与子路径组件身份一致、42px 局部高度、定制颜色与圆角、表单禁用上下文、跨入口 Message 调用、Select 和日期浮层；无运行错误，已查看截图。定向脚本调整了 Message API 返回值及原生输入、日历语义的断言后通过。构建报告保存在组件目录 `.quality/style-entries/report.json`，运行脚本、截图与报告位于根目录 `.quality/root-style-probe/`。体积预算通过，整库 JS / CSS gzip 为 207.02 / 40.48 KiB，基础 CSS 为 9.11 KiB；没有放宽预算。本轮未验证独立 Webpack、实际 Next.js 应用、真机或读屏，改动仍在 `codex/usage-style-cleanup`，未提交或发布。

## 角标定位与快速开始精简（2026-10-11）

修正标签示例布局将 Badge 拉伸到标签宽度的问题：角标容器保持内容宽度，附着位置以按钮为基准。计数与红点统一向内部偏移 4px，使用逻辑方向定位；带标签示例增加 4px 留白，避免长计数紧贴标签。中英文快速开始保留安装、样式、使用组件和后续链接，移除表单、主题、图标等重复章节，默认展示根入口导入；子路径仅作为缩小样式体积的可选方式。

SCSS 格式、组件 / 测试 / 文档类型检查、13 项文档回归、完整组件与双语文档构建通过，84 个公共 JS 子路径、自动样式和 ESM / CommonJS SSR 包验证通过。Chromium、WebKit、Firefox 共 24 个定向检查通过：双语文档的 1536px / 375px 布局、计数和红点的 4px 内收、标签留白、无横向溢出、精简后的章节与按钮交互，以及实际根入口打包样式的 LTR / RTL 定位。已查看桌面中文与窄屏英文角标截图；脚本、截图和报告在根目录 `.quality/badge-inset/`。本轮未重跑全库行为单测、真机或读屏验收；改动留在 `codex/usage-style-cleanup`，未提交、发布或部署。

## 样式自动加载与使用文档整理（2026-10-11）

在 `codex/usage-style-cleanup` 开发分支完成：浏览器 ESM / CommonJS 的组件子路径自动加载组件与内部视觉依赖，根入口自动加载整库样式；Node 默认导出保持无 CSS 的直接 SSR。`styles.css` 改为主题、公共浮层和 API 服务的基础入口，`styles/all.css` 提供完整静态样式，旧组件 CSS 子路径继续可用。根入口具名导入不承诺 CSS 按需裁剪；自动样式按需使用组件子路径。构建根据编译依赖图覆盖 DatePicker 的共享日历样式，根入口与基础样式去重。

示例高亮、复制和 AI Markdown 在构建时去掉文档专用 `english` 参数、条件分支和翻译函数，保留 ConfigProvider 演示中的真实语言状态。代码展开 / 收起默认 160ms，底部渐变遮罩同步淡入淡出，支持源码宽度变化与系统减少动画。Button 增加 `link`，无背景、边框、内边距或控件高度下限，保留键盘、图标、禁用和加载状态，不显示波纹。移除 List / ListItem 与 OrgChart 的源码、导出、样式、导航、双语文档及示例；首页和工作台用原生布局保持操作，通用列表动效测试迁移到原生列表。Badge 拆分基础计数、数值规则、红点与状态。Table 的窄容器横向滚动使用 Scrollbar，组件样式明确隐藏原生滚动条。

完整 `pnpm check` 通过：56 个组件测试文件 / 316 项测试、13 项发布规则、13 项版本文档与 7 项 Skill 查询检查，以及组件、测试和文档类型与格式检查。最终 `pnpm build` 与包 / ESM / CommonJS SSR 验证通过，84 个公共 JS 子路径及全部 CSS 导出有效，双语 AI Markdown 共 196 页；自动样式检查覆盖 Button、Table、DataTable、DatePicker、ConfigProvider 和浏览器 CommonJS。实际打包后的根入口与组件子路径 CSS 均经浏览器测量，控件为 40px，链接按钮为 21px，窄表格有内部溢出且原生滚动条隐藏。

新增链接按钮、容器驱动的横向滚动和既有表头 / 滚动链用例在 Chromium、WebKit、Firefox 各 3 项通过；原生列表连续重排在 Chromium / WebKit 各 1 项通过。Firefox 原有程序启动失败后使用独立下载环境恢复；初跑还修正了链接按钮在 flex 行中被拉高，以及测试对 Scrollbar 控件元素的错误假设。中英文 Badge、英文 Select 代码、展开中间帧、渐变遮罩、窄屏与减少动画经过实际文档检查，并查看截图。证据在根目录 `.quality/usage-style-cleanup/`，保留初跑与最终日志、JSON 和截图。

体积预算通过：整库 JS / CSS gzip 为 206.98 / 40.63 KiB，共享基础及 API 服务 CSS 为 9.10 KiB；单组件额外 CSS 分别为 Button 2.18、Table 3.53 KiB。表单测量现在包含基础和完整 API 服务 CSS，为 13.51 KiB；旧 10 KiB 预算来自未包含服务样式的测量，更新为 14 KiB，整库上限保持 41 KiB。本轮未执行真机、读屏软件、实际 Next.js 应用或像素基线测试；未提交、发布 npm、合并稳定分支或部署。移除组件和基础 CSS 入口变化应纳入下一次正式版本迁移说明。

## 下拉选项高亮颜色连续性（2026-10-11）

Dropdown 的移动高亮负责悬停、键盘定位和按下的背景，移除危险项自己的背景并提高覆盖共用 option 规则的优先级，避免两层颜色交替遮挡；危险项的背景与边框颜色加入过渡。Select 的选中项和移动高亮使用同一不透明主题浅底，经过选中项时不再隐藏高亮，避免绿色选中背景与灰色悬停背景切换或重复透明叠色。选中项的文字和勾选标记保持，移动动画和减少动效设置继续有效。中英文设计标准同步。

15 项 Dropdown / Select 单测通过；新增的深浅色回归在 Chromium / WebKit / Firefox 各 4 项通过，共 12 项，另有 Chromium / WebKit 的 8 项相关移动、禁用和减少动效回归通过。修改文件格式、组件与测试类型检查、完整组件及双语文档构建和包 / SSR 校验通过。测试基准使用实际主题目标色，避免将浮层入场时的过渡色保存为固定预期；危险色回到中性色的最终状态采用动画结束采样。初跑失败和最终通过报告分别保存在根目录 `.quality/dropdown*-highlight-*.json` 与对应日志。实际文档截图为 `.quality/dropdown-highlight.png` 和 `.quality/select-highlight.png`。本轮未重跑全库单测，未发布或部署。

## 表单字段间距（2026-10-11）

默认字段间距从 18px 调整为 24px，紧凑模式从 12px 调整为 16px；FormGroup 和 FormList 共用表单的间距配置，保留 `theme.components.form.gap` 覆盖。标签与输入框、说明文字的内部间距保持原值。文档通用布局样式不再把 Form 的间距覆盖成 12px，双语动态字段示例直接由 FormList 排列字段；设计标准和生成的密度资源同步。

13 项 Form / ConfigProvider 单测、修改文件格式检查、设计资源校验和组件及双语文档构建通过，包校验覆盖 86 个公共 JS 子路径和 CSS / SSR。实际文档测量普通表单和新增动态字段的间距为 24px，配置示例的舒适 / 紧凑间距分别为 24 / 16px，并查看截图。证据为根目录 `.quality/form-spacing.png`、`form-spacing-build.log` 和 `form-spacing-docs.log`。本轮未重跑全库单测，未发布或部署。

## 明亮警告色统一（2026-10-11）

共享 warning 色调整为浅色模式 `#faad14`、深色模式 `#ffc53d`，统一 Alert、Confirm、Message、Notification、Popconfirm、Result、Tag、Badge 状态点及输入控件的警告图标、边框与填充。警告文字独立派生可读颜色，实心 Tag 自动选用对比色；保留 ConfigProvider 的 `theme.tokens.warningColor` 定制及浮层的动态继承。静态色板、DTCG / Figma 资源、相关缩略图和中英文设计说明同步。

本轮 5 个文件 / 39 项相关单测通过；Chromium、WebKit、Firefox 各 4 项定向浏览器检查通过，共 12 项，覆盖深浅色、标签文字对比度、警告状态、API 浮层及自定义颜色更新。修改文件的格式、组件与测试类型检查、设计资源校验、diff 检查及 `pnpm build` 通过；构建验证独立样式、包导出与 ESM / CommonJS SSR，双语文档导出 200 个 AI Markdown 页面。实际查看中文 Alert 页面截图，证据在根目录 `.quality/warning-colors/`；初跑选择器错误报告与最终通过报告分别保留。

本轮未重跑全库单测，未执行真机或读屏软件验收。改动留在 `codex/table` 开发分支，未提交、发布或部署。

## 确认框、下拉面板与进度反馈分批调整（2026-10-11）

第一批将 Confirm 收敛为 `useConfirm().confirm(options)` 的 API 调用，移除受控组件及 `ConfirmProps` 导出、复杂权限操作示例和继承自 Modal 的宽泛配置。裸状态图标位于简短正文旁，标题独立对齐，默认宽度 420px，默认不显示关闭按钮，页脚使用留白；Modal / Confirm 页脚纵向内边距缩小为舒适模式 12px、紧凑模式 9px。异步确认、失败重试、重复操作保护、队列和卸载取消保持有效。Result 的双语默认示例展示描边与主要按钮，Alert 无描述时图标和标题垂直居中。

第二批把下拉选项默认高度调整为 36px，紧凑模式 30px，并随区域基础高度派生。Dropdown 的悬停背景加深，Select / AutoComplete 使用共用的移动高亮层，由 CSS 插值；只在选项、布局或滚动变化时测量，没有逐帧 JavaScript。级联列原先的 8px 横移超出 6px 面板内边距，短暂造成 2px 横向溢出；现在展开只改变透明度，列内使用 Scrollbar，左右留白一致，长列独立滚动。

第三批移除独立 Sortable 的实现、导出、样式、导航、双语示例与静态图，保留 Tabs / Tree / DataTable 自身的排序能力。Progress 新增默认开启的 `active` 流光，只在未完成的线形进度填充区域内由左向右运动；完成、错误、不确定进度、分步和圆形进度不展示该流光，支持显式关闭和系统 / 区域减少动效。公开 API、中英文说明、AI 索引及设计资源同步；Confirm 缩略图源码与最终文档产物的 SHA256 一致。

静态检查、组件与测试及文档类型检查通过；57 个组件测试文件 / 317 项行为测试、13 项发布规则、12 项文档及 7 项 Skill 测试通过。整库构建验证了 86 个公共 JS 子路径及 CSS、ESM / CommonJS SSR 和包导出；最终双语文档构建导出 200 个 AI Markdown 页面。体积预算通过，gzip JS / CSS 分别为 Button 4.21 / 4.22 KiB、Table 10.67 / 5.63 KiB、可选适配器 77.99 / 10.36 KiB、表单 62.58 / 8.74 KiB、整库 208.22 / 40.71 KiB。

浏览器最终分批结果为 Chromium 51 项通过、WebKit 51 项通过、Firefox 50 项通过 / 1 项触摸模拟跳过，共 153 个实例。初跑 Chromium / WebKit 102 项中 96 项通过；修正伪元素动画应从动画子树采样、多属性零时长序列的断言以及 RTL 参数后，8 项定向复测通过。两个 WebKit 动画结束时机检查也在隔离复测中通过，没有修改对应组件的运行机制。覆盖级联展开逐帧溢出采样、对称内边距、三种选项高度、快速悬停与禁用行、RTL 长列键盘选择、进度条运动方向及裁切范围、减少动效、确认框队列、弹窗滚动、深浅色、窄屏和 axe。

本地中文文档的 Confirm、Result、Cascader 和 Progress 已实际操作并查看截图。证据位于根目录 `.quality/refinement-batches/`，`browser-final-results.json` 按引擎、文件与完整标题汇总最新结果；`browser-initial.json`、`browser-recheck.json`、`browser-firefox.json` 保留原始报告，截图为 `confirm.png`、`result.png`、`cascader.png`、`progress.png`。本轮未执行真机、读屏软件或逐像素截图比较。改动仍在 `codex/table` 开发分支，未提交、发布或部署；受控 Confirm 和独立 Sortable 的移除需要纳入下一版本的迁移说明，历史发布文档保持原状。

## 组件与文档视觉统一收尾（2026-10-11）

接续 `codex/table` 上的外观调整，统一外层弹窗、内层内容与控件的圆角层级。Card、Alert、选项卡片及列表等内容表面保持平整；日历、裁剪、签名和组织图也去掉多余的容器阴影。Table 外框恢复与按钮相同的基础圆角。按钮内边距按实际高度的 0.42 倍生成，显式组件 `padding` 在各尺寸保持优先；小 Steps 保留正文字号和至少 24px 指示器，分区标题使用统一的灰色小标题。Confirm 图标位于头部，正文从内容边缘开始，Modal 内部使用 Scrollbar，标题和页脚留白与操作对齐。

文档本地加载 Inter Variable，恢复侧栏 15px / 500 / 42px 菜单行、顶部导航 16px，调整正文、API 表格和一体化代码示例的层级。首页继承组件默认高度和圆角，移除 Card 的额外阴影、圆角与内边距覆盖；总览卡片悬停保持原位，图片继续禁用放大。搜索入口加宽并保持快捷键完整，主题入口使用 Leaf UI Button，支持中英文名称与原生键盘操作。中英主题、设计指南、维护说明及生成的设计资源同步。

最终 Biome / SCSS 格式与组件、测试、文档类型检查通过。完整 Vitest 使用两个 worker，57 个测试文件、317 项测试通过；发布规则 13 项、版本文档 12 项、Skill 查询 7 项通过。组件与文档构建通过，验证 87 个公共 JS 子路径及对应 CSS、类型、ESM / CommonJS SSR；双语 AI 文档导出 202 页。DTCG / Tokens Studio、可编辑 SVG 与 Figma 插件校验通过。最终 gzip JS / CSS：Button 4.21 / 4.03 KiB、Table 10.67 / 5.45 KiB、整库 208.18 / 40.42 KiB，保持现有预算；组件运行时未新增依赖。

浏览器分批执行并以每个用例的最后结果合并：Chromium 60 项、Firefox 60 项、WebKit 59 项通过，共 179 项；WebKit 无法模拟 forced-colors，跳过 1 项，另两种引擎的强制颜色检查通过。覆盖按钮的真实激活与取消、弹窗与抽屉、原生选择和表单 reset、Portal 主题、深浅色 / 紧凑 / RTL / 减少动画、axe、浮层圆角、滚动链、表格固定表头与列、虚拟行、焦点与编辑状态。初跑修复了 Table 圆角遗漏；Firefox 旧测试程序启动失败，通过任务独立安装目录恢复。波纹几何仍取自实际运行，插值改为固定时间点检查，避免无头 WebKit 遗漏短暂帧；虚拟行等待测量并原子读取布局，滚轮场景分别执行，避免跨手势事务和异步取消造成误判。这些测试调整没有改变按钮波纹的运行机制。

实际文档检查覆盖 375px、1024px、1536px，验证中英文路由、语言图标、搜索入口、深浅色主题和键盘切换、完整弹窗及确认框。截图和日志位于根目录 `.quality/style-finish/`；`browser-final-results.json` 汇总最终结果，分批 JSON 保留初跑与复测证据，`preview-modal-wide.png` / `preview-confirm.png` 为文档实景。本轮未执行真机、读屏软件或截图基线比较；改动仍在开发分支，未提交、发布 npm 或部署稳定文档。

## 文字按钮与弹窗示例调整（2026-10-10）

文字按钮（包括危险及纯图标的 ghost 样式）不再挂载或触发波纹；运行中的按钮切换到 ghost 时取消旧动画，保留鼠标与键盘点击及原生行为。中英按钮说明和设计标准同步。Modal 权限设置示例移除 invoice-reader 卡片及仅供该卡片使用的导入，中英文共用的预览和代码片段同时更新。

本轮类型检查、13 项按钮单测、双语文档与 AI 文档构建、修改文件的 Biome 和 diff 检查通过。Chromium / WebKit 的 8 项定向检查全部通过，覆盖保留波纹的按钮、普通 / 危险文字按钮的鼠标与键盘操作，以及删减后的 Modal 布局、选择和保存流程；已检查 Modal 截图。报告见根目录 `.quality/button-ghost-*.log`，浏览器 JSON 备份为组件目录 `.quality/button-ghost-modal-browser.json`。本轮未重新执行整库单测、组件包构建或 Firefox / 真机 / 读屏验收。

## 按钮外缘波纹（2026-10-09）

Button 点击反馈参考 Ant Design：半透明波纹沿外轮廓快速扩散后缓慢淡出，按钮和文字保持原位。默认阴影在 400ms 内扩散到外侧 6px，透明度从 0.2 在 2s 内衰减，使用 ease-out 曲线；区域动效时长同步缩放两段时间。不使用细线描边或模糊光晕。每个按钮复用一个装饰 span 和一个浏览器动画，点击只读取一次区域动效时长，不测量颜色 / 尺寸、不创建 React root 或观察器，没有逐帧 JavaScript。阴影属于绘制溢出，不扩大滚动区域；整行按钮不会临时产生滚动条。连点替换旧动画，禁用、加载、关闭动效和卸载时清理；保留原生点击、键盘、焦点、名称、preventDefault 和表单提交。减少动态效果、强制颜色或动画能力缺失时省略装饰。FloatButton / BackTop 共用波纹且不缩放或悬停位移。

主按钮悬停提亮、按下加深；描边按钮保持底色，文字和边框变为对应的交互色，连接按钮的交互边框保持可见。默认交互色在主题生成时计算，保证深浅色的实心按钮文字达到 4.5:1；自定义主色采用实际文字色派生，显式 hover / active token（包含 CSS 变量解析后的颜色）优先于自动结果。两种主题、危险样式、自定义颜色和状态覆盖均验证。最终 `pnpm check` 通过 317 项组件单元测试，以及 13 项发布规则、12 项文档和 7 项 Skill 测试；`pnpm build`、87 个公共 JS 子路径 / CSS / ESM 与 CommonJS SSR、双语文档及 AI 文档构建通过。静态调色板与设计资源同步并验证。gzip JS / CSS 为 Button 4.19 / 3.95 KiB、表单 62.17 / 8.47 KiB、整库 208.21 / 40.16 KiB，全部保持现有预算，未增加依赖。本轮没有对 Ant Design 做同环境耗时基准。

Chromium / WebKit 的按钮专项共 22 个实例，21 个经定向复测通过；WebKit 不支持模拟 forced-colors，跳过 1 个实例，Chromium 强制颜色检查通过。覆盖深浅色、三种样式、危险色、定制颜色 / 圆角、连接按钮、纯图标、快速连点、键盘 / 模拟触摸、禁用 / 加载、嵌套动效恢复、Portal、动态减少动画与滚动容器。真实运行帧验证外扩至 6px 后继续淡出、无模糊及稳定几何；派生按钮检查原生触发、圆角继承和结束清理。完整执行先通过 17 个实例；修复自定义深色主题的文字色派生，以及 WebKit 自动化的采样窗口 / 旧动画完成标记后，相关颜色、连点和滚动容器检查通过复测，最终 CSS 变量状态覆盖也通过两种引擎。报告位于根目录 `.quality/button-antd-browser.log`、`button-antd-recheck-browser.log`、`button-antd-rapid-final-browser.log`、`button-antd-theme-final-browser.log`；对应 JSON 备份在组件目录 `.quality/button-antd-*-browser.json`。

本地按钮文档实际点击体验完成，确认白底描边按钮变色、外缘波纹和 40px 稳定高度；截图在根目录 `.quality/button-antd-preview.png`。中英按钮说明、设计指南与仓库设计标准同步。Firefox、本轮真机触控和读屏未复测。改动留在 codex/table 开发分支，未提交、发布 npm 或部署稳定站点。

## 检查入口

在仓库根目录执行：

```bash
pnpm check
pnpm build
pnpm --filter @ifhover/leaf-ui measure:bundle
pnpm --filter @ifhover/leaf-ui exec playwright install
pnpm --filter @ifhover/leaf-ui test:browser
```

`pnpm check` 包含发布记录规则、Biome / SCSS 格式、组件与文档类型、单元行为、版本文档和 Skill 查询测试。`pnpm build` 验证模块、类型、独立样式、服务端渲染与双语文档构建。文档 API 生成与语言资源维护见 [DEVELOPMENT.md](DEVELOPMENT.md)。

GitHub 的 Component quality 工作流在 PR、main 推送及手动触发时运行：普通检查和生产构建；React 18 / 19 的类型与单元测试；Chromium / Firefox / WebKit 的浏览器测试。浏览器任务使用独立的 Vite 生产构建与 preview，防止 HMR 在运行中改变测试页面。

## 行为与兼容范围

- 复合字段的整体 required、唯一 id、标签关联、FormData / reset；表单禁用与业务只读的全部提交路径。
- 远程选中标签保留，懒加载缓存版本切换与过期请求取消；异步校验、Schema 接管和服务端错误聚焦。
- 日期显示 / 解析与标准表单值分离；非法日期、业务禁用时间的输入 / 点击 / 键盘一致性；精确十进制字符串运算。
- 嵌套弹层的 Escape、Tab、初始 / 返回焦点、ShadowRoot 的事件路径、方向与区域主题。
- Drawer / Splitter 的指针和键盘调整；轮播滑动、inactive slide 的 inert；模拟 PointerEvent 触控和 composition 输入序列。
- 倒计时、异步命令、上传及取消请求的卸载清理；SSR 确定初值和公开 ESM / CommonJS 入口。

真实浏览器中的 axe 检查启用颜色对比度；jsdom 中不检查无法可靠计算的颜色。自动化没有替代实际 NVDA / VoiceOver 验收，也不能等同于真实设备的输入法和手势测试。重要发布仍需人工验证阅读顺序、提示播报、焦点可见性和触屏体验。

## 主题与视觉

浏览器固定页面检查 light / dark、三种尺寸、禁用 / 错误、375px 窄屏、RTL、减少动画与组件 token。断言覆盖控件高度、方向、布局溢出、色块尺寸与过渡时长，并在报告中附完整截图。

这些是视觉契约断言与截图审查，尚未建立逐像素黄金截图比对。视觉改动需要检查生成截图，不能把截图生成成功视为设计验收。

动效验收使用 `tests/browser/motion.spec.ts`：实测选中指示条、快速二次重排、加载按钮宽度与名称、关闭/嵌套恢复/系统减少动画、浮层主题以及弹窗内容高度与输入状态。可操作产品示例位于文档首页；视觉与覆盖清单见 [DESIGN-REFRESH.md](../../DESIGN-REFRESH.md)。

## 万级数据与体积

10,000 项 Select / Tree 检查搜索、末节点键盘定位与选中回显，打开时 DOM 项目少于 60；VirtualList 检查可变高度的测量、数据排序后焦点与滚动位置保留。耗时附在 `large-data-timings` 中，供同类设备对比，不作为所有应用的性能保证。

生产体积使用 esbuild、压缩、tree shaking 与 gzip level 9。包含组件库和运行依赖；React / ReactDOM 外置。2026-10-06 设计与动效调整前的本机基线约为：

| 引入场景 | JavaScript gzip | CSS gzip |
| --- | --- | --- |
| Button 子路径与样式 | 2.17 KiB | 2.58 KiB |
| 常见表单及 ConfigProvider | 49.18 KiB | 5.22 KiB |
| 整库 | 192.59 KiB | 25.07 KiB |

脚本检查 Button 不会拉入裁剪、签名、二维码或图片预览引擎，并设有体积回归上限：Button JS / CSS 为 5 / 4.25 KiB，表单为 64 / 10 KiB，整库为 250 / 41 KiB。Table 原生层与可选适配器的 JavaScript 预算为 14 / 80 KiB；根入口和普通表单禁止拉入可选 TanStack Table 引擎。Table 新增约 1.2 KiB 的整库 CSS，预算从 37 调整为 39 KiB；独立组件会裁剪不用的派生颜色变量，原生表格不包含适配器专用样式。弹窗分区、卡片/列表选项及可读的语义文字新增约 1.8 KiB gzip 全库 CSS，实测 40.24 KiB；全库 JavaScript 实测 207.62 KiB，未增加运行时引擎。Button 独立 CSS 的文字对比度修正新增约 0.05 KiB，实测 4.04 KiB，预算调整为 4.25 KiB。对应报告保存在 `.quality/surface-bundle-final.log` 与 `.quality/bundle-report.json`。需要调整预算时应附构建报告和原因。

报告在 `.quality/bundle-report.json`、`.quality/browser.json` 与 `playwright-report` 中，GitHub Actions 同时保存 artifacts；生成产物不提交 Git。

## 基础高度与示例布局跟进（2026-10-09）

舒适模式的统一控件基准改为 40px，小 / 大尺寸从基础值派生为 34 / 46px；紧凑模式基准改为 34px。Button 移除 soft，outline 改为正文色、内容底色与细边框；Alert 仅保留中性表面。Modal 正文使用 Scrollbar，无副标题时头部和底部缩小纵向留白；Confirm 的裸图标移到正文，危险状态为红色感叹号，正文使用 16px 与正文色。Result 图标底座统一为灰色圆形。Table 的最小宽度移动到滚动内容层，原生表格保持至少填满视口，并使用基础圆角。鼠标拖动滚动条不主动抢走焦点，键盘焦点仍可见。

预览全宽内容容器改为可居中的 flex 布局；原有 row / stack 与并排控件示例使用 Space，带标签的独立控件居中。实际扫描全部 85 个组件页面 / 234 个交互预览，未发现根级窄内容偏左或越界；Select 的 180px 示例与说明居中。该扫描检查几何与间距，并非逐像素截图比较。中英文按钮、Modal、Alert、Table 页面和中文 Confirm、Result 另行实际查看；设计尺寸、SVG 缩略图、DTCG tokens 与 Figma 资源同步更新。

`pnpm check` 通过 312 项组件测试、13 项发布、12 项文档与 7 项 Skill 测试；最终类型检查及 Button / Modal 定向 25 项复测通过。`pnpm build`、87 个 JS 与全部 CSS 入口 / SSR 检查、设计资源验证和体积预算通过；gzip JS / CSS 为 Button 2.19 / 3.98 KiB、Table 10.21 / 5.41 KiB、可选适配器 77.26 / 10.18 KiB、表单 61.57 / 8.52 KiB、整库 207.66 / 40.17 KiB。

Chromium / WebKit 的 108 个原有相关用例经分次修正和复测全部通过；追加的两引擎长正文 Modal 滚动用例也通过。四个重点套件最后一轮 54 个实例先通过 53 项，WebKit 的关闭焦点断言改为键盘打开后，两引擎定向复测 2 项通过。Windows WebKit 主题变量读取单次约 4 秒，按实际执行延迟将异步主题断言上限设为 20 秒；保留检查真实派生色的要求。报告在根目录 `.quality/refinement-final-browser.log`、`.quality/refinement-modal-browser.log`，完整 JSON 和前两轮报告在组件目录 `.quality/refinement-*-browser.json`。动态正文高度、局部主题、深浅色、RTL、窄屏、减少动画、拖动 / 键盘滚动、表格宽窄布局与 axe 均有覆盖。

Firefox 本轮未复测；真实读屏、真机触控仍需人工验收。改动留在 codex/table 开发分支，未提交、发布 npm 或部署稳定站点。Button soft 与 Alert variant 的移除属于兼容性变化，下一次发布须列入迁移说明；现阶段维护说明见 DESIGN-STANDARDS.md。

## 分区表面与丰富选项验证（2026-10-09）

Modal / Confirm / Drawer 默认使用浅分隔线和中性底部，Card 保留留白默认并可选分区；Checkbox / Radio 增加描述、装饰图标、状态内容与卡片 / 列表排列；Alert 增加中性表面。标题、说明和装饰图标的语义独立，原生勾选、键盘、FormData 与 reset 行为保持有效。ConfigProvider 的分隔线与组件背景覆盖同步到 Portal。双语文档、静态预览和设计资源已更新。

`pnpm check` 通过 57 个组件测试文件 / 312 项行为测试，另有 13 项发布规则、12 项文档和 7 项 Skill 查询测试；`pnpm build` 通过 87 个公共 JS 子路径及每个 CSS 入口、ESM / CommonJS SSR 与双语文档构建。最终体积通过现有预算，记录见上方。后续文档内联代码与示例调整另行执行 `pnpm build:docs`。

Chromium / WebKit 的反馈与动效定向 26 项通过。新表面套件最终覆盖两引擎的 12 个实例：整套复测先通过 11 项；WebKit 的焦点恢复用例改为使用键盘打开（鼠标点击按钮不保证成为活动焦点）后，两引擎定向 2 项通过。真实动画仍保留，Windows WebKit 的过渡完成断言沿用 20 秒等待上限。窄屏增加取消 / 确认同一行及状态文字独立换行断言，并覆盖深浅主题、RTL、减少动画和包含颜色对比度的 axe 检查。报告为 `.quality/surface-browser-complete.log`、`.quality/surface-browser-verified.log` 与 `.quality/surface-browser-focus.log`，它们是分次定向结果，不是一份完整矩阵报告。

桌面 Modal / Confirm / Drawer 和 375px 深浅主题截图已查看，中文文档中的权限设置保存与重要操作确认示例已实际操作。Firefox 未在本轮本机复测；已有 Windows 启动限制仍需 Linux CI 验证。未执行真实读屏软件、真机触控或 Figma 导入验收。本次改动保留在开发分支，未发布 npm 或部署正式文档。

## 首页与基础控件跟进验证（2026-10-07）

首页展览区去掉整块灰底与外框，按偏好表单、协作动态和空间创建重排，使用 34px 基准控件，减少重复操作与独立小卡。动态卡片补充统计和活动行，头像文字样式不再覆盖品牌图标颜色；图标在浅色和深色背景上均保持清晰。平板与手机按两列、一列阅读。

Segmented 的内圆角由外圆角、padding 和边框推导；Slider 默认隐藏右上数值，刻度层位于滑块下方，刻度文字移出原生输入的命中区域，修正端点和 RTL 对齐；Button 的 outline 兼容入口改为无描边浅灰底，连接按钮也使用缩放按压。中英文使用说明、主题预览和目录缩略图同步更新。

本轮 `pnpm check` 通过 50 个测试文件 / 254 项行为用例，发布记录、文档、Skill 检查也通过；`pnpm build` 通过模块、类型、独立样式、ESM / CommonJS SSR、公开子路径和双语文档验证。Chromium / WebKit 的定向 20 项全部通过，包含新加的横向 / 纵向 / 区间刻度点击与实际拖动、RTL、六种视觉模式、加载按钮稳定性和真实浏览器 a11y。React 18 库类型检查及 3 文件 / 22 项 Button、Slider、导航定向行为通过，本轮没有重跑完整 React 18 或完整浏览器矩阵。Firefox 本机限制与上一轮相同。

当前 gzip JS / CSS：Button 2.19 / 3.49 KiB，表单 51.56 / 6.49 KiB，整库 200.67 / 33.22 KiB，均在预算内。实际文档预览检查中文 / 英文、深浅主题、375px 手机与 768px 平板布局无横向溢出，周期 / 通知渠道 / 刻度、保存、空间创建与场景保留均可操作；Slider 中刻度与滑块重合、Button 灰底外观也已查看。证据在 `.quality/design-balance`，其中 `browser.json` 是本轮定向报告；旧完整报告继续保留在 `.quality/design-followup`。`git diff --check` 通过。

## 上一轮设计与动效调整验证（2026-10-06）

六批调整覆盖全部 83 个目录组件族，其中 76 个组件族有实现变更，7 个静态或直接操作组件沿用更新后的基础样式。完整覆盖清单和验证记录见 [DESIGN-REFRESH.md](../../DESIGN-REFRESH.md)。

2026-10-07 跟进修正后的 `pnpm check` 与 `pnpm build` 全部通过：React 19 下 50 个组件测试文件、253 项行为测试，13 项发布规则、7 项文档、7 项 Skill 测试；84 个公开 JavaScript 子路径及各 CSS 入口、ESM / CommonJS 服务端渲染、类型与双语文档通过检查。隔离的 React 18.3.1 环境下，库和测试类型检查、同样 253 项行为测试及 114 项源码 SSR 用例通过，未改动清单、锁文件和依赖链接。

Chromium / WebKit 完整运行 50/50 通过，每个引擎 25 项。新增回归验证关联 label 连续点击、快速重开后的浮层定位，以及向上弹出时的局部动画原点。随后修正窄屏时间列滚动：新增回归两引擎 2/2 通过，已有禁用时间 / 键盘 / 非法输入用例也在两引擎重跑 2/2 通过，合计 52 个不同的浏览器用例获得通过结果；不能把最新定向报告当作完整 52 项报告。之前跟进运行的 49/50、13/14 失败报告单独保留：测试改为在真实动画创建或 CSS 过渡事件时取样，并在同一次求值中测量相关几何位置，避免 Windows WebKit 延迟帧和分次读取的采样误差；动效断言仍启用真实动画。完整报告在 `.quality/design-followup/browser-final.json`，后续时间列报告为同目录的 `browser-time-scroll.json` 与 `browser-time-keyboard.json`。Firefox 在本机 Windows 启动受 `spawn UNKNOWN` 限制，本轮仍需 Linux CI 验证。

最终构建的体积测量通过所有预算：Button JS / CSS 为 2.19 / 3.51 KiB，常见表单为 51.56 / 6.50 KiB，整库为 200.67 / 33.11 KiB。首页组件画布的桌面浅色 / 深色、375px 窄屏，Badge / Avatar 间距、错误边界宽度和 FileList / Upload 图片卡片已检查；空间创建、保存、通知 / 周期 / 配色切换、源码复制 / 换行 / 展开、文件预览 / 移除与上传取消已实际操作验证。文档布局扫描覆盖 83 个目录页、211 个预览区域，检查共用 stack 的间距 / 宽度、主要内容块的异常收缩与预览溢出；记录保存在 `.quality/design-followup/docs-layout-audit.json`，不等同于逐像素视觉验收。

本次排查的共用根因：文档主题改写时遗漏 `.leaf-demo-*` 布局样式，导致多处间距和宽度失效；Floating UI 的视口 translate 与 CSS scale 组合让弹层向页面原点漂移。修复共用层后，继续校验表单标签与保留浮层的重开定位、Tree 选中背景、实心按钮反馈以及无需端点 tabs 的日期 / 时间区间交互。TimeRangePicker 新增两项行为回归，覆盖同时编辑两端、禁用时间 / 范围顺序与原生 FormData / reset。TimePanel 的自动定位限制在时间列内部，避免同时展示两端时把外层弹窗滚离端点标签；键盘焦点使用 preventScroll，并在列尺寸变化时重新保持选中项可见。

## 上一轮功能审计（设计调整前）

本机完整检查通过：45 个组件测试文件、234 项行为测试，另有 13 项发布规则、7 项文档、7 项 Skill 测试；84 个公开 JavaScript 子路径及各 CSS 入口通过产物检查。Chromium / WebKit 完整 36 项浏览器测试通过；针对截图发现的颜色控件收缩问题补充视觉回归后，视觉与大数据子集 16 项也全部通过。

本机 Windows 的 Playwright Firefox 启动返回 `spawn UNKNOWN`，由 Linux CI 完成 Firefox 验证。该轮跨平台结果以当时的 Component quality 工作流为准。

补充验证：React 18.3.1 与对应类型声明的本地类型检查及全部 234 项组件测试通过。兼容层用属性 spread 处理 inert，集中赋值 ref，不全局扩展 React 的 HTMLAttributes。测试页的类型路径直接映射源码，干净检出无需先构建 dist。Linux CI 已确认 Firefox 与 Chromium 的 18 项浏览器测试分别通过。

日期维持本地 Date 模型，业务时区在数据边界转换；表单使用原生 FormData 和外部 Schema / RHF 适配；分片续传放在 Upload 的 transport 适配中。Table / DataGrid 及表格业务场景按当轮要求排除。
# 2026-10-07 分批改进验收

本轮新增颜色派生、全局密度、完整工作空间、设计文件与可访问性工作台。259 项单元测试通过；颜色与配置变更后定向复核 10 项通过。Chromium 153.0.8010.12 全量 47 项通过，WebKit 26.6 定向 13 项经套件与挂载等待修复后的复测通过。axe 覆盖工作台深浅色与打开弹窗，无违规；真实文档的新建、编辑、同名错误重试、归档、恢复、筛选与保存设置，以及 375px 重排与下载已操作验证。

Biome / SCSS 格式、组件与文档类型、发布记录规则、文档/Skills 查询测试、库与双语文档构建、84 个公开 JS/CSS 子路径验证均通过。gzip JS / CSS 为 Button 2.19 / 3.94 KiB、常用表单 58.86 / 7.57 KiB、整库 203.42 / 35.89 KiB。静态深浅派生色板、密度和兼容遮罩动画使整库 CSS 增加约 2.6 KiB；整库 CSS 预算设为 37 KiB，Button 与表单的预算保持原值，单组件样式裁剪不用的派生变量。

本机再次尝试 Firefox 启动，仍为 `spawn UNKNOWN`，不能记录为通过。DTCG / legacy tokens、四份 SVG XML、ZIP 与 Figma 插件语法已检查；Figma 实际导入、NVDA / VoiceOver、真机触控与原生浏览器缩放待人工验收。完整边界与执行方式见 [ACCESSIBILITY.md](ACCESSIBILITY.md)，交付清单见仓库 `IMPLEMENTATION-BATCHES.md`。本轮没有新增截图基线对比设施、Table 或框架集成模板。
