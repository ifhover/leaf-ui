# Leaf UI 文档站

此目录使用 Rspress 编写 Leaf UI 的在线文档。在线内容只面向组件使用者；文档站运行、维护与仓库开发说明放在源码 Markdown 中。

## 运行环境

Node.js 22.22.2+ / 24.15.0+ 的受支持 LTS 版本，或 Node.js 26；pnpm 11，工作区固定使用 11.10.0。

在仓库根目录运行：

```bash
pnpm install
pnpm dev
```

打开 `http://127.0.0.1:3000`。文档直接引用 `packages/react/src`，组件和 SCSS 修改会热更新，不需要预先构建组件包。

## 构建与预览

```bash
pnpm build:docs
pnpm preview
```

当前源码的预览产物位于 `apps/docs/doc_build`。`LEAF_DOCS_BASE` 控制部署路径，默认 `/`。自定义链接必须使用 withBase 并指向实际的 .html 文件，保证刷新和直接访问可用。

## GitHub Pages

在线站点：https://ifhover.github.io/leaf-ui/。仓库的 Pages 来源为 GitHub Actions，.github/workflows/pages.yml 在 main 推送或手动触发时检查源码、构建组件与当前文档，再构建已发布的历史版本，上传 `apps/docs/site_build`。构建设置 `LEAF_DOCS_BASE=/leaf-ui/`，不提交静态产物或缓存。

## 版本快照与 AI 文档

```bash
pnpm build:versions
```

`scripts/build-versioned-site.mjs` 从 npm 注册表读取实际发布的稳定版本、发布日期和 `gitHead`。每个版本通过 `git archive` 在临时目录还原该发布提交，使用该提交的锁文件、组件源码、页面与示例独立构建。需要完整 Git 历史（CI 使用 `fetch-depth: 0`）；缺少提交、版本不匹配或构建失败会中止部署。

默认地址 `/leaf-ui/` 直接展示 npm latest 指向的最新已发布文档，页面、资源和搜索都使用根地址，不跳转到版本路径。同一发布提交额外构建固定的 `/leaf-ui/v/X.Y.Z/` 快照供历史版本与 Skill 查询；两份构建使用各自 base，不能直接复制带版本路径的页面充当根站点。未发布的 main 内容不会覆盖线上文档。顶部菜单从 `versions.json` 获取已发布列表，选择最新版返回根地址，旧版使用版本路径；切换时保留页面和锚点，目标没有该页面时回退对应指南或组件总览。

旧快照只补充文档基础设施：版本菜单、AI 安装指南、Rspress Markdown 输出及 API 索引。组件实现、例子与组件文档保持在发布提交。生成缓存位于 `.version-cache`，缓存键包含发布提交、基础路径和基础设施文件摘要；修改基础设施会自动使缓存失效。

Rspress `llms: true` 输出每页 Markdown，`scripts/export-ai-docs.mjs` 从各快照的公共导出建立 `api/index.json`，并为每页写入准确包版本、源码提交和浏览器地址。每版根目录提供 `llm.txt` 与标准 `llms.txt`，无需将完整手册放入 Skill。组件页面右侧的 Markdown 链接直接指向该版本的文本。

维护 Skill 见 [skills/README.md](../../skills/README.md)。相关测试由 `pnpm test:docs` 和 `pnpm test:skills` 执行，均纳入 `pnpm check`。

## 中英文文档

中文页面位于 docs/guide 与 docs/components，英文镜像位于 docs/en。英文示例位于 src/examples/en；代码围栏与预览引用同一份源码。theme/Layout 按 Rspress useLang 设置 ConfigProvider 语言。组件侧边栏键需分别使用 /components/ 与 /en/components/，指南同理。

组件总览数据在 src/components/component-catalog.ts；缩略图使用静态 SVG，新增资产可通过 scripts/generate-feedback-thumbnails.mjs 生成。

## 内容与导航

- `docs/guide/`：面向使用者的介绍、安装、快速开始、主题定制。
- `docs/components/`：组件总览与各组件的使用/API 文档。
- `docs/changelog.md` 与 `docs/en/changelog.md`：中英文版本更新记录。
- `src/components/`：首页、主题编辑器、交互示例与示例容器。
- `theme/`：Rspress 主题扩展和站点样式。

`rspress.config.ts` 按路径分别配置指南和组件侧边栏。添加组件时同时更新总览、组件侧边栏和对应 MDX 页面。

顶部版本号通过 Rspress 的 `afterNavTitle` 插槽展示，读取快照中的 `packages/react/package.json`，点击可切换已发布版本。每次 npm 发布都必须更新两份记录，具体步骤见 [发布文档](../../packages/react/RELEASING.md)。正式版本记录的标题格式由 `pnpm check:release` 校验，页面只记录已发布且面向使用者的变化，未发布草稿保留在 `docs` 目录之外。

组件项的 text 使用实际导入名称，例如 DatePicker；tag 作为同一行的中文副标题，站点 SCSS 将其设置为更小、更浅的文字。不要在标题中拼接两种字号，或运行时修改 Rspress 的 DOM。

不要将文档站运行命令、发布构建流程或仓库开发指南放入 `docs` 目录；其中的 Markdown 会成为在线页面并进入搜索索引。

## 预览与代码模块

首页的 HomeShowcase 提供组件、工作台和文件三种场景。组件场景在透明背景上以三列组织偏好表单、协作动态与空间创建，使用 34px 控件和按操作分组的按钮；窄屏按阅读顺序堆叠。工作台保留任务筛选、列表重排与两步弹窗。MotionGallery 展示选择、展开与保存反馈。示例中所有数据保存在本地 React 状态；保持中文/英文文案、窄屏和主题切换可用。ThemePlayground 同时展示表单控件和当前区域的动效开关。

首页场景、主题编辑器与其颜色弹窗共用 `src/components/theme-colors.ts` 中的五种预设，顺序为主题绿、黑色、活力橙 `#ff6900`、亮蓝 `#1d9bf0` 和红色 `#cf0b2d`，默认绿色与组件库浅色主题一致。预设在深浅外观下均保持原色，实色按钮统一使用白色文字，Switch 滑块保持白色；浅底按钮、工作台选中菜单与分类标签保留可读的深色文字。编辑器将 ColorPicker 的 HEX / RGB / HSL 输出归一成 HEX，主题代码包含 `onPrimaryColor: '#fff'`。颜色选中圈及组件的选中、焦点和展开状态优先于 hover 样式。

ComponentExample 在上方展示交互预览，下方同时展示源码，预览保持挂载。复制、换行和长代码展开行为读取同一份 MDX 高亮源码。通用示例布局（leaf-demo-*）和目录副标题样式位于 theme/index.scss，调整首页样式时必须保留这些共用规则。

在 MDX 中使用 `ComponentExample`，将交互预览与源码包在同一个卡片内：

````mdx
import { ComponentExample } from '../../src/components/component-example';
import { MyExample } from '../../src/components/my-example';

<ComponentExample title="示例名称" preview={<MyExample />} fileName="example.tsx">

```tsx lineNumbers
import { Button } from '@sudden3/leaf-ui';

<Button>示例按钮</Button>
```

</ComponentExample>
````

预览节点单独放在 `preview` 属性中，子内容使用 MDX 代码围栏，可用 `file="../../src/examples/button/variants.tsx"` 直接引用实际预览源码，避免演示与代码脱节。语法高亮在构建时生成；示例容器负责折叠、复制完整源码和代码换行。

长代码默认折叠；短代码会完整展示。样式与行为定义在 `src/components/component-example.tsx` 和 `src/components/component-example.scss`。

仓库整体架构见 [DEVELOPMENT.md](../../DEVELOPMENT.md)，组件开发约定见 [packages/react/DEVELOPMENT.md](../../packages/react/DEVELOPMENT.md)。

## SCSS 与总览缩略图

站点样式和示例模块使用 .scss，Rspress 的 builderConfig 启用 pluginSass。源码样式入口别名指向组件库的 src/styles/index.scss，消费者的 CSS 入口保持不变。

总览位于 src/components/component-overview.tsx，采用静态 SVG 图片，资源保存在 docs/public/components。新增组件时更新卡片元数据和对应缩略图，无需在总览挂载交互组件。图标统一使用 lucide-react。

选择类组件缩略图由 scripts/generate-picker-thumbnails.mjs 生成，包含静态控件与浮层示意，并复用 Lucide 图标；在此目录运行 `node scripts/generate-picker-thumbnails.mjs` 可重建。

## API 与审计场景维护

`node apps/docs/scripts/sync-component-api.mjs` 从公共 TypeScript 导出更新中英 API：简单联合类型直接展开，项目内对象类型链接到详细表格。生成器保留当前页面的人工说明与默认值，能够识别三列 / 四列表格与组合属性；`--from-ref=<git-ref>` 可恢复指定提交的说明。新增家族元数据在 scripts/component-metadata.mjs，AI 导出与 API 使用同一套页面映射。

文档中的 API 表格默认值只写实际默认值；节点结构和回调信息无需制造默认值。每种示例要给出目的明确的标题或说明，不把不同状态挤成没有标识的一行。完整业务示例位于 src/examples/scenarios，包括复合字段 / 动态表单、Zod 校验与服务端错误、远程选项竞态。

历史快照只复制版本导航和 AI 基础设施及其直接依赖。修改 export-ai-docs.mjs 的 import 后必须同步 build-versioned-site.mjs 的 platformFiles，并通过独立快照测试。未发布的新组件只进入工作区文档构建；线上与 `/v/` 仍按 npm gitHead 构建。
