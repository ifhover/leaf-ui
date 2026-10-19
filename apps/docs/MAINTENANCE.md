# 文档站维护说明

本文件由 [AGENTS.md](AGENTS.md) 引用。示例写法遵循 [EXAMPLE-WRITING.md](EXAMPLE-WRITING.md)，版本开发与发布遵循 [仓库流程](../../DEVELOPMENT-WORKFLOW.md)。

## 运行与构建

使用 Node.js 22.22.2+ / 24.15.0+ 的受支持 LTS，或 Node.js 26；pnpm 固定为 11.10.0。在仓库根目录运行：

```bash
pnpm install
pnpm dev
pnpm build:docs
pnpm preview
```

开发和预览地址为 `http://127.0.0.1:3000`。Rspress 和 TypeScript 直接引用 `packages/react/src`，组件与 SCSS 修改会热更新。当前源码构建产物位于 `apps/docs/doc_build`。

`LEAF_DOCS_BASE` 配置部署路径，默认 `/`。自定义站内链接用 `withBase` 并指向真实 `.html`，验证直接访问和刷新。

## 内容、导航与主题

`docs/guide`、`docs/components`、`docs/api` 面向使用者，英文镜像在 `docs/en`。首页、主题编辑器与预览容器在 `src/components`，示例在 `src/examples`，Rspress 主题在 `theme`。维护说明不得放到 `docs/`。

导航在 `rspress.config.ts`，中英文指南和组件侧边栏使用各自路径键。组件名称使用实际导入名称，中文副标题写在 `tag` 中。新增组件同步 `src/components/component-catalog.ts`、`scripts/component-metadata.mjs` 和 `docs/public/components` 静态 SVG；总览不挂载所有交互实例。图标使用 `lucide-react` 具名导入，避免手绘运行时图标集合。

顶部 API 导航使用独立 `/api/`、`/en/api/` 侧边栏。ConfigProvider 页面先介绍多语言、主题与外观、组件默认值，底部独立 API 章节集中放置 `ConfigProvider API`、`LeafTheme` 与类型参考；API 表格使用三级标题。完整 `LeafComponentDefaults`、`LeafThemeTokens` 分别放在 `api/component-defaults`、`api/theme-tokens`，通过链接查询。默认参数示例要直观展示占位文本等变化，并说明配置键的命名规则与实例覆盖。使用建议只保留简短、常见的注意事项。

所有文档页使用相同的正文宽度和水平留白，不根据是否包含演示切换布局；首页保留独立展示布局，普通内容的最大外宽为 1280px，宽屏左右各留 32px。平板和手机留白分别为 24px、18px。同步修改 API 表格时保留所在标题层级，避免自动生成额外的主章节。

阅读样式集中在 `theme/index.scss`：侧栏主文字 15px / 500、副标题 12px、行高 42px；代码 13px。侧栏分组标题吸顶，并保留 Rspress 展开/收起和路由。组件总览和详情页共用正文宽度与内边距。字体由 `@fontsource-variable/inter` 本地加载，中文用系统字体回退。

顶部导航在 `src/components/docs-nav.tsx` 与 `.scss`，通过主题的 `Nav` 出口替换默认导航；页面入口读取 Rspress 的中英文导航配置，站内链接继续使用其 `Link`。桌面导航左侧为品牌和版本，中间搜索框独立水平居中，右侧为页面入口和外观工具，GitHub 入口复用 Rspress 的 `IconGithub` 品牌图标。宽屏的左右边界分别跟随文档侧栏和目录的外边距与内部留白，不另设导航最大宽度；颜色选择器的外层与内部触发按钮共用 28px 方形区域，色块居中。顶栏默认高 64px，低于 960px 时为 56px；桌面菜单撑满顶栏内容高度，菜单项间隔 24px，页面入口不显示前置图标。低于 1440px 使用 Leaf UI Drawer 展示页面入口；低于 960px 将搜索收为图标，语言和主题色设置收进抽屉，外观切换在顶栏和抽屉内均可操作。主导航用 `aria-current` 标记当前分区，桌面仅保留主题色文字与底部细线，悬停仅改变文字颜色，不显示背景色，抽屉保留选中浅底。语言切换使用带当前语言名称的 Leaf UI Dropdown，保留当前页面、查询参数和锚点；页面导航、Escape、遮罩点击和切回桌面布局均关闭抽屉。导航高度通过 `--rp-nav-height` 同步侧栏与正文偏移。

组件总览顶部的输入框实时过滤组件目录，组件侧栏顶部的输入框独立过滤当前菜单；支持中英文名称和忽略大小写的匹配，清空后恢复全部内容。侧栏由 `docs-sidebar.tsx` 复用 Rspress `SidebarList`，搜索框位于独立滚动列表之外，分组标题仍在列表内吸顶。过滤时展开匹配分组，清空后保留原来的折叠状态；指南与 API 沿用原生侧栏。

顶部导航、侧栏和右侧目录的选中与 hover 文字使用 `--leaf-color-primary-ink`，正常主题保留主色，深色下仅在对比不足时提亮。侧栏分组标题的上边距与向上遮罩范围共用 `--rp-sidebar-padding`，避免遮住上一组最后一项的文字、选中背景和底部圆角。

组件总览通过 `component-thumbnails.ts` 将仓库静态 SVG 作为文本内联，主色、插画色阶和中性表面消费当前区域的主题变量，保留状态与多色示意的语义。新增缩略图沿用现有色板，使用新色值时同步映射；渐变和裁剪 ID 自动按组件名称隔离。不要改回隔离主题变量的 `<img>`，也不要挂载全部交互组件。

正文规则排除 `.rp-not-doc`。站点排版与组件 token 分开，不能覆盖预览或首页中组件的默认圆角、阴影、内边距与状态。搜索和主题按钮使用 Leaf UI Button；外观切换保留 Rspress ThemeContext、存储和键盘操作。

`DocsThemeProvider` 通过外层 ConfigProvider 同步站点和示例主题色。`ThemeColorSwitcher` 使用 ColorPicker，配色存储在 `leaf-ui-docs-primary-color`，支持刷新、语言切换与同源标签页同步；静态 HTML 和初次渲染使用默认值，挂载后恢复存储。存储不可用时仍可切换。Rspress 搜索 portal 只同步根元素的站点强调色，组件色板由 ConfigProvider 生成；局部主题保持独立。

首页、认识 Leaf UI 和快速开始共用 `PackageInstall`。包管理器偏好存储在 `leaf-ui-docs-package-manager`，支持刷新、页面与语言切换、同页实例和同源标签页同步；存储不可用时仍可切换。品牌图标使用 `data-no-zoom` 排除文档图片放大。指南的四种命令保留在 MDX 子内容中，Markdown 导出完整输出这些命令。

配色入口和主题编辑器共用 `src/components/theme-colors.ts`：绿色、黑色、橙色 `#ff6900`、蓝色 `#1d9bf0`、红色 `#cf0b2d`。颜色选择、存储与实心主色背景保留原色；深色下的主色文字、选中指示、焦点和必要边界由组件库分别派生。主题指南示例使用 `src/examples/theming/presets.tsx` 中的完整主题定义，包含默认、插画、Windows XP、Material（MUI 风格）与拟物，移除卡通入口。中英文示例包含全部生成逻辑，组件包不内置风格预设。首页不展示主题定制模块。默认风格没有额外主题 token，省略默认密度和动效。自定义风格只写差异；基础表面继续由库生成，染色背景和统一描边使用 color-mix，阴影复用全局描边色。自动派生的交互色和主色文字不写进示例，主色文字对比由库统一处理；Switch 滑块保持白色。Windows XP 的斜面与渐变、Material 的层次阴影、拟物的双向光照与按下内凹由普通主题 token 表达；组件级差异只涉及 Card 标题渐变、Button 阴影反馈。XP / Material 字体使用本地字体与系统回退，不额外加载第三方资源。主题编辑器将 HEX / RGB / HSL 归一为 HEX。

组件和站点主题使用 SCSS，由 `pluginSass` 编译。Tailwind 4 入口 `theme/tailwind.css` 只服务现有站点界面，不是组件示例的前置依赖；PostCSS 接入 `@tailwindcss/postcss`，扫描 `src`、`docs`、`theme`，不加载 Preflight，不使用全局 `!important`。组件行内布局通过公共参数调整。不要把 Tailwind 依赖加入组件包。

## 示例容器

ComponentExample 上方预览始终挂载，下方源码在构建时高亮；复制、换行、展开都读取同一份 MDX 源码。宽度配置和内容范围见 [示例规则](EXAMPLE-WRITING.md)。

长代码默认折叠，短代码完整显示。展开使用测量高度与约 160ms 过渡；减少动态效果时直接切换。收起有渐变遮罩，展开后的收起按钮在当前源码内吸附视口底部；中途收起滚动回本示例代码顶部。外框使用 `overflow: clip`，避免阻断吸附。实现位于 `src/components/component-example.tsx` 与 `.scss`。

## API 与 AI 文档

```bash
node apps/docs/scripts/sync-component-api.mjs
pnpm test:docs
pnpm test:skills
```

API 生成器从公共 TypeScript 导出更新中英文表格，保留人工说明与默认值；简单联合类型展开，公开数据类型链接到详情。可用 `--page=components/flex` 限定页面，用 `--from-ref=<git-ref>` 恢复历史说明。元数据与 AI 导出共用 `component-metadata.mjs`。

公开 `FooProps` 的内置默认值位于私有 `FooControlProps` 实现时，生成器按此命名约定回退读取；公共 API 的类型仍取自 `FooProps`，不得把内部控件的额外外观或状态加入公开表格。

两份全局配置参考也由 API 生成器同步，可分别使用 `--page=api/component-defaults`、`--page=api/theme-tokens`。没有独立默认值的参考表使用三列表头（属性、类型、说明），同步时保持三列。`documentationPage` 决定类型的唯一参考位置；AI 导出包含 `/api/` 页面及其版本标识，历史快照没有独立参考页时仍使用该快照原有的组件或指南页，不把新文档混入旧版本。

`LeafComponentTokens`、`LeafThemeStyle` 的完整参考放在 `api/theme-tokens`，共享浮层参数 `PopupOptions` 放在 `api/popup-options`。定制主题指南按基础配置、深色模式、局部主题、密度与进阶覆盖递进，只链接完整参数。组件侧栏先放组件总览与使用图标；ConfigProvider 放在通用分组首项，中文副标题保留“全局配置”，最右侧另放蓝色“配置”标签（英文为“Config”），沿用指南 SSR 标签的原生样式。中文 `tag` 使用 Rspress 支持的逗号分隔多标签，第一项显示为副标题，最后一项保留标签样式。使用图标文档位于 `components/icons`，与总览同组。

翻译资源参考位于 `api/translations`，ConfigProvider 页面保留简短说明与 JSON 示例。内置 JSON、Schema 和类型由组件包维护；`sync-locales.mjs` 在开发和构建前复制到忽略跟踪的 `docs/public/locales/`，AI 导出另从对应发布快照源码读取并复制到该版本根目录 `locales/`。旧快照缺少资源时不补入新版本词条。JSON 下载使用 `<a href={withBase('/locales/en-US.json')} download>`，避免 Markdown 链接被 Rspress 转换成不存在的 `.json.html` 页面。

API 类型单元格由 `scripts/api-type-display.mjs` 的 rehype 插件合并为一个行内代码容器，类型引用在容器内保持可点击并使用站点主题色；不能为标点和链接分别绘制代码底色。转换只作用于“类型 / Type”列，Markdown 源码、链接目标及 AI 导出保持原样。API 表格的说明列保留 240px 最小宽度，窄屏沿用表格内部横向滚动，避免说明被挤成过高的行。字段较多的高级 API 可使用 `leaf-api-details` 折叠表格，标题和类型锚点仍放在折叠容器外；不要隐藏主组件的常用参数表。

Rspress 的 `llms: true` 输出页面 Markdown，`export-ai-docs.mjs` 输出 `api/index.json` 并写入准确包版本、提交和浏览器地址。每版根目录有 `llm.txt` / `llms.txt`；右侧 Markdown 链接必须指向当前版本。独立 Skill 维护见 [skills/README.md](../../skills/README.md)。

## 正式站点与历史快照

正式地址为 `https://ifhover.github.io/leaf-ui/`。`.github/workflows/pages.yml` 通过 GitHub Actions 部署 `site_build`，使用 `LEAF_DOCS_BASE=/leaf-ui/`。不提交静态产物和缓存。

`pnpm build:versions` 从 npm 查询 `@ifhover/leaf-ui` 和历史包 `@sudden3/leaf-ui` 的已发布稳定版本、日期和 gitHead，经 `git archive` 还原发布提交，用对应源码、锁文件、示例与文档独立构建。需要完整 Git 历史。缺少提交、版本/包名不符、跨包重号、网络或权限错误、构建失败均中止部署。

默认入口对应 npm latest，不跳转到版本目录；同一提交额外构建 `/v/X.Y.Z/`。两份产物分别使用自己的 base，不能复制带版本路径的页面充当根站点。新作用域首次正式发布前，默认仍展示历史包稳定版；历史快照保持原来的包名和 API。版本菜单读取 `versions.json`，切换保留页面和锚点，不存在时回退指南或组件总览。

旧快照只补充版本导航和 AI 基础设施，组件实现、文档与示例保持发布提交。缓存 `.version-cache` 的键包含包名、提交、base 和基础设施摘要。修改 AI 导出的 import 后同步 `build-versioned-site.mjs` 的 `platformFiles` 及其直接依赖，并执行隔离快照测试。

组件版本来自 `packages/react/package.json`；更新记录同步中英文，标题由 `pnpm check:release` 校验。未发布记录放在在线 `docs` 之外。npm、Git 标签、默认文档、固定快照和 AI 文档全部一致后才报告发布完成。

## 开发预览

开发分支可使用独立 `/dev/<name>/` 地址，展示开发状态、分支/提交和目标版本，使用独立资源、搜索与 base。稳定版本列表只记录 npm 正式版本；开发包使用 SemVer 预发布号和 `dev` 标签。

当前 Pages 与 `build:versions` 没有自动开发预览部署/清理；配置 base 之外还需独立部署步骤。记录 URL、分支、提交、部署位置和清理方式。合并或放弃后删除预览、资源、入口与活动清单，保留清理证据；正式历史快照继续可访问。
