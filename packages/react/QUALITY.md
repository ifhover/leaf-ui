# 组件质量验收

## 当前验收规则

本节规定本次工作应做什么检查。日期记录已移到 [质量验收历史](../../history/QUALITY-HISTORY.md)，仅证明当时的环境与执行结果；旧尺寸、API、颜色算法、数量和预算不覆盖现行规范。组件规则见 [DEVELOPMENT.md](DEVELOPMENT.md)，视觉见 [设计标准](../../DESIGN-STANDARDS.md)，颜色专项见 [颜色系统规范](../../COLOR-SYSTEM.md#自动约束与验收)。

### 按影响选择检查

| 改动范围 | 验收要求 |
| --- | --- |
| 仅仓库维护 Markdown | 检查引用路径、标题锚点、命令与当前源码的一致性，执行 `git diff --check`；不因修改维护说明而宣称运行了组件或浏览器验收 |
| 组件行为、API、类型、导出或依赖 | 执行相关单元 / 类型 / 产物检查；发布前完整 `pnpm check`、`pnpm build`，按影响补兼容矩阵与体积检查 |
| 组件颜色、主题或共享配方 | 按颜色规范同步源、测试与生成物；运行颜色专项及相关真实浏览器契约，共享修改覆盖各类消费者 |
| 使用文档的纯文案、链接或说明 | 检查相关链接、结构与源码一致性；影响 API / AI 导出时运行相关文档测试，不运行无关组件浏览器或库构建 |
| 文档 TSX 示例、站点主题或布局 | 相关格式、文档类型与结构测试；最终态文档构建一次，视觉变化验证受影响的真实页面，不用组件 fixture 代替文档容器验收 |
| 设计资源 / Figma 导出 | 导出后做资源结构和脚本语法检查；未实际运行 Figma 时明确保留人工验收项 |

报告列出命令、实际通过 / 失败数量、未执行范围和已知问题。不得把历史通过记录当作本次证据，也不得修改期望、关闭检查或扩充基线来掩盖缺陷。实底前景对比度失败的报告方式见 [颜色系统：角色映射与选阶](../../COLOR-SYSTEM.md#角色映射与选阶)。

### 测试边界与日常执行

- 单元测试保护公开行为、原生语义、状态和算法；颜色扫描器集中负责固定色、配方、数字档和例外预算。不要另建重复的局部扫描器、例外清单，或断言局部变量名、注释、声明顺序及 SCSS 循环写法。静态样式契约优先检查 Sass 编译后的声明，最终级联、交互与几何由浏览器验证。
- 回归必须覆盖缺陷发生的层：组件使用组件 fixture，文档容器与示例组合使用真实文档页。将需要长期保护的临时页面检查整理成小型持久测试，不为每次任务新建运行框架。
- 小任务运行相关文件和检查；共享样式按消费者类别扩展覆盖，合并 / 发布保留完整检查。主题、尺寸、RTL、窄屏、减少动画按影响选择，不为无关改动机械展开全部维度的笛卡尔积。
- 同一最终态不重复运行已包含在聚合命令中的检查。后续只改文档时，重跑文档相关检查，不重跑未受影响的组件单测或库构建；构建后再改源码时，相关生产页面证据必须重新构建后取得。失败重跑仅作诊断，保留首次结果，不以多次分散通过拼成一次全绿。
- 行为与整页 axe 审计使用独立测试；独立审计标记 `@a11y`，默认命令及 CI 仍执行。定向行为诊断可用 `--grep-invert @a11y`，但必须报告排除了审计；完整无障碍验收不能使用该过滤。既有对比度失败独立跟踪，不关闭规则、不自动转为跳过。
- 非动效测试等待实际状态、定位或有限动画完成，不固定 sleep。逐帧回归可保留有说明的采样时间窗；不要用关闭 trace 或放宽断言替代排障。
- 日常任务结果保留在任务回复、PR 和运行报告中，不要求每个微调追加历史条目。仅在需要长期保存的阶段性验收或发布时，向 [质量验收历史](../../history/QUALITY-HISTORY.md) 补充有明确源码版本的记录。

### 浏览器运行与报告隔离

组件浏览器使用 `packages/react/playwright.config.ts`；每次调用自动创建独立的 `.quality/browser/<run>/`，构建、结果、HTML、JSON 和截图均隔离。可以用 `LEAF_TEST_RUN` 指定唯一运行名；并行调用还必须分别设置 `LEAF_TEST_PORT`，默认组件端口为 4178、文档端口为 4190。服务器不复用，端口占用时明确失败，不连接未知页面或停止其他任务的服务。

PowerShell 定向示例（运行名不要与其他活动调用重复）：

```powershell
$env:LEAF_TEST_PORT = '4193'
$env:LEAF_TEST_RUN = 'button-review'
pnpm --filter @ifhover/leaf-ui test:browser button.spec.ts --project=chromium
Remove-Item Env:LEAF_TEST_PORT, Env:LEAF_TEST_RUN
```

真实文档回归先对最终源码执行一次 `pnpm build:docs`，再运行 `pnpm test:docs:browser`；后者只启动生产预览，不隐式再次构建，也不能用旧产物冒充当前源码。测试位于 `tests/docs/`，包含 Badge 基础 / 红点的双语、浅深、宽窄屏容器几何，以及源码展开、收起和复制；CI 复用同一任务中 `pnpm build` 的文档产物。

### 检查入口

在仓库根目录执行：

```bash
pnpm check
pnpm build
pnpm --filter @ifhover/leaf-ui measure:bundle
pnpm --filter @ifhover/leaf-ui exec playwright install
pnpm --filter @ifhover/leaf-ui test:browser
```

本地运行环境（Windows / PowerShell）：

- Bash / WSL 不可用（缺少 `/bin/bash`），命令使用 PowerShell 语法；不要使用花括号展开，`@a11y` 等以 `@` 开头的参数加单引号（`'@a11y'`）。
- 本机 Firefox 启动失败（`spawn UNKNOWN`），不能记为通过；Firefox 覆盖以 CI 结果为准，报告中注明。
- 定向运行单个文件：`pnpm --filter @ifhover/leaf-ui exec vitest run <file>` 或 `pnpm --filter @ifhover/leaf-ui exec playwright test <spec> --project=chromium`，并按上一节设置 `LEAF_TEST_PORT` / `LEAF_TEST_RUN` 隔离端口与报告。

`pnpm check` 包含发布记录规则、颜色契约、Biome / SCSS 格式、组件与文档类型、单元行为、版本文档、Skill 查询和测试工具自身的测试。`pnpm build` 验证模块、类型、独立样式、服务端渲染与双语文档构建。文档 API 生成与语言资源维护见 [DEVELOPMENT.md](DEVELOPMENT.md)。

GitHub 的 Component quality 工作流在 PR、main 推送及手动触发时运行：普通检查和生产构建，复用构建产物执行真实文档回归；锁定工作区的 React 19 类型与单元测试由普通检查覆盖，额外任务验证 React 18；Chromium / Firefox / WebKit 保留完整组件浏览器测试。浏览器任务使用独立的 Vite 生产构建与 preview，防止 HMR 在运行中改变测试页面。

### 行为与兼容范围

- 复合字段的整体 required、唯一 id、标签关联、FormData / reset；表单禁用与业务只读的全部提交路径。
- 远程选中标签保留，懒加载缓存版本切换与过期请求取消；异步校验、Schema 接管和服务端错误聚焦。
- 日期显示 / 解析与标准表单值分离；非法日期、业务禁用时间的输入 / 点击 / 键盘一致性；精确十进制字符串运算。
- 嵌套弹层的 Escape、Tab、初始 / 返回焦点、ShadowRoot 的事件路径、方向与区域主题。
- Drawer / Splitter 的指针和键盘调整；轮播滑动、inactive slide 的 inert；模拟 PointerEvent 触控和 composition 输入序列。
- 倒计时、异步命令、上传及取消请求的卸载清理；SSR 确定初值和公开 ESM / CommonJS 入口。

真实浏览器中的 axe 检查启用颜色对比度；jsdom 中不检查无法可靠计算的颜色。自动化没有替代实际 NVDA / VoiceOver 验收，也不能等同于真实设备的输入法和手势测试。重要发布仍需人工验证阅读顺序、提示播报、焦点可见性和触屏体验。

### 主题与视觉

浏览器固定页面检查 light / dark、三种尺寸、禁用 / 错误、375px 窄屏、RTL、减少动画与组件 token。断言覆盖控件高度、方向、布局溢出、色块尺寸与过渡时长，并在报告中附完整截图。

这些是视觉契约断言与截图审查，尚未建立逐像素黄金截图比对。视觉改动需要检查生成截图，不能把截图生成成功视为设计验收。

动效验收使用 `tests/browser/motion.spec.ts`：实测选中指示条、快速二次重排、加载按钮宽度与名称、关闭/嵌套恢复/系统减少动画、浮层主题以及弹窗内容高度与输入状态。使用当前 `tests/browser` fixture 和对应文档示例复现。

### 万级数据与体积

10,000 项 Select / Tree 检查搜索、末节点键盘定位与选中回显，打开时 DOM 项目少于 60；VirtualList 检查可变高度的测量、数据排序后焦点与滚动位置保留。耗时附在 `large-data-timings` 中，供同类设备对比，不作为所有应用的性能保证。

生产体积使用 esbuild、tree shaking 与 gzip level 9；包含组件和运行依赖，React / ReactDOM 外置。当前预算以 `scripts/measure-bundle.mjs` 的可执行断言为准，不从下方历史测量抄录。Button 独立入口不得带入无关引擎，根入口和普通表单不得带入可选 TanStack Table 引擎。调整预算必须附构建报告和原因。

体积报告位于 `.quality/bundle-report.json`；浏览器报告位于 `.quality/browser/<run>/report.json`、`html/` 与 `results/`，CI 同时保存 artifacts。截图通过 Playwright 的每用例输出路径保存，避免并行或重试覆盖；生成产物不提交 Git。
