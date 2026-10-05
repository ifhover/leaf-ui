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

## 万级数据与体积

10,000 项 Select / Tree 检查搜索、末节点键盘定位与选中回显，打开时 DOM 项目少于 60；VirtualList 检查可变高度的测量、数据排序后焦点与滚动位置保留。耗时附在 `large-data-timings` 中，供同类设备对比，不作为所有应用的性能保证。

生产体积使用 esbuild、压缩、tree shaking 与 gzip level 9。包含组件库和运行依赖；React / ReactDOM 外置。2026-10-06 本机基线约为：

| 引入场景 | JavaScript gzip | CSS gzip |
| --- | --- | --- |
| Button 子路径与样式 | 2.17 KiB | 2.58 KiB |
| 常见表单及 ConfigProvider | 49.18 KiB | 5.22 KiB |
| 整库 | 192.59 KiB | 25.07 KiB |

脚本检查 Button 不会拉入裁剪、签名、二维码或图片预览引擎，并设有体积回归上限：Button JS / CSS 为 5 / 4 KiB，表单为 64 / 10 KiB，整库为 250 / 35 KiB。需要调整预算时应附构建报告和原因。

报告在 `.quality/bundle-report.json`、`.quality/browser.json` 与 `playwright-report` 中，GitHub Actions 同时保存 artifacts；生成产物不提交 Git。

## 本次审计验证

本机完整检查通过：45 个组件测试文件、234 项行为测试，另有 13 项发布规则、7 项文档、7 项 Skill 测试；84 个公开 JavaScript 子路径及各 CSS 入口通过产物检查。Chromium / WebKit 完整 36 项浏览器测试通过；针对截图发现的颜色控件收缩问题补充视觉回归后，视觉与大数据子集 16 项也全部通过。

本机 Windows 的 Playwright Firefox 启动返回 `spawn UNKNOWN`，由 Linux CI 完成 Firefox 验证。最终跨平台结果以此次提交的 Component quality 工作流为准。

补充验证：React 18.3.1 与对应类型声明的本地类型检查及全部 234 项组件测试通过。兼容层用属性 spread 处理 inert，集中赋值 ref，不全局扩展 React 的 HTMLAttributes。测试页的类型路径直接映射源码，干净检出无需先构建 dist。Linux CI 已确认 Firefox 与 Chromium 的 18 项浏览器测试分别通过。

日期维持本地 Date 模型，业务时区在数据边界转换；表单使用原生 FormData 和外部 Schema / RHF 适配；分片续传放在 Upload 的 transport 适配中。Table / DataGrid 及表格业务场景按本次要求排除。
