# Leaf UI 设计资源

在仓库根目录运行 `pnpm design:export`，从运行时使用的同一份颜色、配方与密度源码（`colors.ts`、`color-scale.ts`、`color-recipes.ts`、`density.ts`）重新生成全部资源。不要手改生成结果。

## 生成物

- `apps/docs/docs/public/design/leaf.tokens.json`：DTCG 格式的颜色、尺寸、数值与时长 token。使用时选择一种外观和一组密度。
- `leaf.tokens-studio.json`：供 Tokens Studio 使用的旧版 `type` / `value` 结构。启用 Light 或 Dark 之一加 Comfortable 或 Compact 之一，不要同时启用两种外观。
- 四份 `leaf-*-foundations.svg` / `leaf-*-components.svg`：带命名分组、可编辑矢量路径和文字，可直接拖入 Figma；需要安装 Inter 或选择替代字体。
- 本目录的本地插件：`source.js` 是手写源码，`tokens.js` 与 `code.js` 由导出脚本生成。插件创建带 Light / Dark 模式的颜色变量、带 Comfortable / Compact 模式的尺寸变量，以及可编辑的 Button / Input 组件集；组件的填充色和高度绑定到变量。

## Button 变体

插件中的 Button 覆盖 solid / outline / text / link 与 default / hover / pressed / disabled，两种密度都包含。与运行时一致：

- outline 是默认外观，静止时带一道轻微朝下的阴影；悬停加深中性边框；按下只把背景变为浅中性灰，文字、边框和阴影不变。
- text 使用常规按钮间距和透明静止背景，悬停为浅灰底，按下为更深的灰底。
- link 使用可读的 `primary-ink`，不是主题基色。

## 导入 Figma

在 Figma 桌面端选择 **Plugins → Development → Import plugin from manifest**，选中 `manifest.json`，然后运行 **Leaf UI Resources**。可下载的 ZIP 包含 `manifest.json`、`code.js` 和本 README。每次运行都会新建页面和集合；不需要时使用 Figma 撤销。插件不请求网络访问。

## 验收边界

- 本地检查：`pnpm --filter @ifhover/leaf-ui exec node scripts/verify-design-resources.mjs` 与 `node --check design/figma/code.js`，覆盖 Node 语法、JSON 和 SVG 结构。
- SVG 不会自动变成 Figma 组件变体；插件只创建 Button / Input 原生变体，其他图板需要设计师自行转换。自动布局结构和变量绑定包含在插件源码中。这不是已发布的 Figma 库。
- Figma 中的实际运行与视觉核对必须人工完成；未实际导入时在报告中保留为未验收项。

## 调整

修改运行时主题默认值、配方或密度源码后重新导出。业务品牌色在应用的 `ConfigProvider` 中覆盖语义色，并同步到 Figma 变量；更换色板后检查前景 / 背景对比度。
