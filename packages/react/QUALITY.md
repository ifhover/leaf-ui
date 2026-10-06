# 组件质量验收

面向源码维护者。新增能力必须验证用户行为、公开产物和相应文档，不能仅以组件数量或测试数量判断成熟度。审计对应清单见 [AUDIT-IMPLEMENTATION.md](AUDIT-IMPLEMENTATION.md)。

## 检查入口

在仓库根目录执行：

```bash
pnpm check
pnpm build
pnpm --filter @sudden3/leaf-ui measure:bundle
pnpm --filter @sudden3/leaf-ui exec playwright install
pnpm --filter @sudden3/leaf-ui test:browser
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

脚本检查 Button 不会拉入裁剪、签名、二维码或图片预览引擎，并设有体积回归上限：Button JS / CSS 为 5 / 4 KiB，表单为 64 / 10 KiB，整库为 250 / 37 KiB。整库 CSS 预算从 35 调整为 37 KiB，以容纳静态深浅派生色板、密度和兼容遮罩动效；独立组件会裁剪不用的派生颜色变量。需要调整预算时应附构建报告和原因。

报告在 `.quality/bundle-report.json`、`.quality/browser.json` 与 `playwright-report` 中，GitHub Actions 同时保存 artifacts；生成产物不提交 Git。

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
