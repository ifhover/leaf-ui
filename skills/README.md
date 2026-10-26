# Leaf UI Skill 的维护与发布

`leaf-ui/` 是可分发的 Agent Skill，包含简短使用指令、Codex 展示配置和无需第三方依赖的 Node.js 查询工具。完整组件手册保留在版本化站点中，不打包进 Skill。

用户安装：

```bash
npx skills add ifhover/leaf-ui --skill leaf-ui
```

## 发布

Skill 通过本公开 GitHub 仓库分发，独立于 npm 组件包版本。修改时更新 `leaf-ui/SKILL.md` 的 `metadata.version`，运行 `pnpm test:skills`、Skill frontmatter 校验与站点检查。推送 `main` 并确认对应版本文档部署完成后，验证仓库发现：

```bash
npx skills add ifhover/leaf-ui --list
```

可创建 `leaf-ui-skill-vX.Y.Z` 标签固定发行快照。不要因为 Skill 更新而给组件包升版，也不要将完整文档复制到此目录。安装 CLI 默认从 `main` 获取 Skill；已安装 Skill 可用 `npx skills update` 更新。

## 查询契约

`scripts/docs.mjs` 从目标应用目录通过 Node 模块解析取得实际安装包名和版本，支持 `@ifhover/leaf-ui` 与迁移前的 `@sudden3/leaf-ui`，以及 npm、pnpm、工作区和常规 Yarn node_modules。两个包同时可解析时，须通过 `--package` 选择与应用导入一致的包，不能默默切换作用域。Yarn PnP 使用 `yarn node <skill-directory>/scripts/docs.mjs ...`，让 Yarn 注入解析器。

新建页面或大幅调整布局时，Skill 指引先查询同版本 `--guide design-standards`，取得页面组合和公开标尺；局部 API / 行为修复不强制加载。指南原文归属文档站，不把字号、间距、颜色角色或示例复制进 Skill。旧版本没有该指南时明确说明，不切换到 latest。

读取 `/v/<exact-version>/api/index.json` 后验证包名、版本及结构，按真实导出名称找到所属页面；类型和子组件沿用其归属，不按名称猜文档路径。组件查询再读取同版本 `ai/v1/index.json` 和对应 `detail.json`，验证包名、版本、schema、发布提交与源页面。`workspace` 产物不能冒充发布快照。

默认返回原简介、完整基础用法、完整 API 和普通示例索引，不输出全部示例代码。`--examples` 可按从 1 开始的序号、稳定 ID 或完整标题选择；重复该参数实现一次查询多个示例，每个参数只传一个选择值，含逗号的标题不拆分。重复选择去重并保留请求顺序；未知或歧义选择报错，不抓取其他示例。基础用法不占普通示例序号。`--json` 输出单一 JSON 值，默认输出可读正文。

只有结构化索引明确返回 404 才走旧版整页组件查询，并在输出中标明整页模式；指南和非组件参考直接读取原 Markdown。整页必须带同版本标识，且不支持 `--examples`，不能用重新截取正文伪装结构化查询。已列出的详情或示例缺失、结构损坏、提交不一致、网络或服务异常均报错。语言回退只依据版本导出索引的页面可用性，不把请求失败当作回退条件。

禁止重定向、跨版本路径和 latest 回退。单次响应按 UTF-8 字节限制为 1 MiB，超过直接报错，不截断正文；也不预下载或预缓存所有版本。包未安装、API 未导出或请求失败时直接返回错误；本地声明路径仍可用于核对。查询工具仅使用 Node 内置模块，无需 Python、第三方运行依赖或文档编译环境。

测试覆盖实际模块解析、新旧作用域、两个包同时安装、不同应用安装不同版本、结构化详情与批量示例、真实导出/CLI 对接、旧版整页模式、语言回退、服务错误和跨版本请求。测试与 Skill 无关的维护文件放在 `skills/tests`，避免安装到用户工具中。
