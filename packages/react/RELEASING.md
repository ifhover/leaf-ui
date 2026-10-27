# npm 发布与更新记录

分支选择、版本同步、合并后发布义务和开发预览清理遵循 [开发、版本与文档同步流程](../../DEVELOPMENT-WORKFLOW.md)；本文只维护具体操作命令。

每次发布新的 npm 版本，都必须同步更新中英文更新记录。组件使用者的更新记录在：

- [中文](../../apps/docs/docs/changelog.md)
- [英文](../../apps/docs/docs/en/changelog.md)

发布步骤只保留在此文件，不写入在线更新记录。

## 版本与记录

组件版本的唯一来源是 `packages/react/package.json` 的 `version`。文档顶部版本号读取各发布快照中的该字段，无需手动修改导航；线上版本列表只来自 npm 实际发布的稳定版本。工作区根包和文档包均为私有包，它们的版本不代表组件版本。

在线更新记录只展示已发布的版本，不展示“未发布 / Unreleased”。平时的变更草稿保留在 Git 提交、PR 描述或 `docs` 目录之外的源码 Markdown 中。准备发布时：

1. 将组件包版本提升到尚未发布的新版本。
2. 将本次计划发布的新增、改进、修复与使用提醒整理为两份页面的正式版本记录，其他尚未发布的内容继续保留在页面之外。
3. 正式版本标题统一使用 `## X.Y.Z - YYYY-MM-DD`，日期为本次实际发布日期；中英文版本和日期保持一致。
4. 最新正式版本放在最前，旧版本记录保留。每条版本记录必须包含具体变更，不能只有空标题或 TODO。
5. 只描述使用者关心的变化；存在行为或 API 变化时说明迁移方式，不能把未发布功能归入已经发布的版本。
6. 迁移说明从 [待发布迁移](../../MIGRATION-PENDING.md) 整理：把本次发布包含的条目改写进中英文“迁移说明”，再从该文件删除这些条目。

例如：

```markdown
## 0.2.0 - 2026-10-04

### 改进

- ConfigProvider 自动托管消息，业务组件直接调用 useMessage。
```

## npm 作用域迁移

当前开发内容使用 `@ifhover/leaf-ui`，历史正式版本 `0.1.0` 至 `0.4.2` 使用 `@sudden3/leaf-ui`。npm 包名不能直接改名；新作用域需要首次发布一个独立的公开包。

首次发布新包时，选择高于旧包 `0.4.2` 的尚未使用版本（例如 `0.5.0`），整理本分支的正式更新记录，再执行下面的完整发布流程。不要以新包名重复发布旧版本号：文档仍使用 `/v/X.Y.Z/`，同号的两个包会造成历史 API 冲突，构建器会拒绝部署。

发布前执行 `npm login`，在浏览器中登录 `ifhover`，再通过 `npm whoami` 确认账号。组件包的 `publishConfig.access` 为 `public`。npm 账号、验证操作与发布权限都以 npm 实际状态为准；修改仓库包名不会自动创建新包。

保留旧包的已发布版本供既有项目下载。新包发布并完成文档部署后，可由拥有旧包权限的账号将旧包的废弃提示改为明确的迁移地址：

```bash
npm deprecate '@sudden3/leaf-ui@*' 'This package has moved to @ifhover/leaf-ui. See https://ifhover.github.io/leaf-ui/guide/getting-started.html'
```

文档构建同时读取新旧两包。新包尚未发布或只有开发预发布时，默认文档继续使用旧包的稳定版；新包有正式版本后使用新包的 `latest`，保留旧包各版快照。每个快照的包名与 `gitHead` 均来自实际发布记录，Skill 同时校验已安装的包名和精确版本。

## 检查与发布

检查范围与成功结果复用遵循 [质量验收](QUALITY.md#合并与发布检查)。需要首次完整基础验收、且没有实际发布提交的有效证据时，在仓库根目录运行：

```bash
pnpm check
pnpm build
```

`pnpm check:release` 会检查当前版本的中英文记录、日期与实际变更条目，并拒绝在线记录中的未发布区域。它已加入 `pnpm check` 和本地目录发布的 `prepublishOnly`；质量 CI 构建并验证 npm 包产物，发布任务复用该结果。

### 自动化分工与复用

完整基础验收只由质量 CI 执行，后续阶段验证身份和结果，不重新执行整套检查或构建。不能用全局 `--ignore-scripts` 或环境变量跳过发布防护。

| 环节 | 当前职责 |
| --- | --- |
| `Component quality` | 执行 `pnpm check`、`pnpm build`、体积预算及 React 18 兼容检查；锁定的 React 19 由常规检查覆盖。`main` 推送的检查任务将已验证产物打包为 `npm-release` artifact，保留 14 天 |
| `Publish npm package` | 只接受实际发布 SHA 对应的 `main` 推送质量工作流整体成功（包括兼容任务），等待尚未完成的运行；下载该运行的包，校验提交、版本、包元数据及 SHA-512，再通过 OIDC / provenance 发布 |
| npm 生命周期 | CI 上传已验证的 `.tgz`，npm 不执行目录发布的 `prepublishOnly`，无需额外跳过开关；本地直接从组件目录发布仍检查更新记录、构建并验证包 |
| `Deploy documentation` | 只在 npm 发布工作流成功后或手动维护时部署，不响应普通 `main` 推送；只执行已发布版本快照构建，不重跑组件检查、库构建或会被丢弃的工作区文档构建 |
| `pnpm verify:release` | HTTP 核对 npm、远端标签、提交、默认文档与固定快照的元数据、双语代表页面和代表资源，不启动浏览器、不遍历组件 / 主题 / 屏宽组合 |

`pnpm release:pack` 只封装现有的 `dist`，不构建、不执行基础验收；它要求源码已提交，在暂存副本中写入 `gitHead`，不改工作区包清单。单独打包或校验摘要不能代替质量 CI 成功。发布任务不接受 PR / 开发分支的运行，也不在找不到证据时自行降级发布。质量运行失败时修复后重新检查；artifact 过期或缺失时重新运行该提交原有的 `main` 推送质量运行，再重试发布。

文档历史快照继续复用现有缓存；根站点与 `/v/X.Y.Z/` 的 base 不同，所需的独立构建不能当作重复步骤删除。版本、提交或基础设施不匹配时不能复用旧产物。临时预览只清理本次实际创建的内容，不为没有创建预览的发布新增清理任务或证明材料。

### GitHub Actions 自动发布（推荐）

`.github/workflows/publish.yml` 使用 npm Trusted Publishing（OIDC）。npm 的 Trusted Publisher 必须配置为 GitHub 仓库 `ifhover/leaf-ui`、Workflow filename `publish.yml`、Environment name `npm`，并允许 `npm publish`。在 GitHub 仓库的 **Settings → Environments** 创建同名的 `npm` 环境；如设置了部署分支限制，应允许正式版本标签。无需配置 `NPM_TOKEN`，也不需要单独允许 `npm dist-tag`。

普通提交、推送开发分支或合并 `main` 都不会发布 npm。工作流只在推送 `vX.Y.Z` 标签时发布，或通过 **Actions → Publish npm package → Run workflow** 手动运行；手动运行时，在 **Use workflow from** 中选择已经推送的正式版本标签，也可以执行 `gh workflow run publish.yml --ref vX.Y.Z`。不能选择开发分支或 `main`，确保工作流提交、发布源码和 provenance 一致。

1. 更新 `packages/react/package.json` 中的版本与中英文更新记录，完成定向验证后合并到 `main`，由合并后的质量 CI 完成完整基础验收。
2. 拉取最新 `main`，确认工作区干净，在实际合并后的发布提交创建并推送标签。下面以尚未发布的 `0.5.1` 为例，执行前替换为本次实际版本：

   ```bash
   git switch main
   git pull --ff-only origin main
   git tag v0.5.1
   git push origin v0.5.1
   ```

3. 发布工作流确认标签与组件版本一致、提交已包含在 `main`，且新版本高于 npm `latest`；等待该 SHA 的质量 CI 整体成功，下载并校验其 artifact，再发布公开包与 provenance。不安装工作区依赖、不重新执行 `pnpm check` / `pnpm build`。
4. 工作流用 `verify:release` 的 npm-only 模式确认 npm `gitHead`、`latest` 和远端标签。成功后，`Deploy documentation` 自动从 `main` 运行，构建已发布文档与快照，并在部署后执行完整发布结果核验。

此工作流只处理正式版本，拒绝预发布标签。同一版本不能覆盖：如果 npm 已有该版本且提交不同，会要求升版；如果该版本已从同一提交发布并且仍是 `latest`，重跑会跳过上传，继续核对并触发文档部署。npm 已发布而文档失败时，优先重跑 `Deploy documentation`，无需重新发布 npm。

新增 Trusted Publisher 显示 `Pending validation` 时，需要在 npm 页面指定的截止时间前成功发布一次以完成验证；过期后需要在 npm 删除并重新创建该配置。

### 本地手动发布

将版本和更新记录提交并合并到 `main`，确认实际发布提交的质量工作流整体成功、工作区干净。优先下载同一 SHA 的 `npm-release` artifact；将 `<run-id>` 替换为该次成功的 `main` 推送运行，不能使用其他提交或只通过部分任务的结果。在仓库根目录执行：

```bash
gh run download <run-id> --name npm-release --dir packages/react/.quality/release
node packages/react/scripts/release-artifact.mjs verify
npm publish packages/react/.quality/release/leaf-ui.tgz --access public --tag latest
```

没有可复用产物时，在干净的实际发布提交按 [质量规则](QUALITY.md#合并与发布检查) 完成一次基础验收，再运行 `pnpm release:pack`，校验并上传同一路径的包。不要封装来源未知或可能过期的 `dist`。

本地直接在 `packages/react` 目录运行 `npm publish --access public` 仍由 `prepublishOnly` 检查更新记录、构建和验证产物，作为手动发布兜底。不要先执行会运行同一生命周期的 `npm publish --dry-run` 再正式发布而构建两遍；通常复用上面的已验证 tarball。

确认包名为 `@ifhover/leaf-ui`，账户具备该作用域的写入权限，并由维护者在已登录浏览器中完成 npm 双因素认证。令牌和验证码不得写入源码。

npm 的 `gitHead` 和 `vX.Y.Z` 标签必须指向同一个实际发布提交。使用 squash 或 rebase 合并时，以合并后的提交发布，保证 npm 源码记录可从 `main` 追溯。

开发文档预览无需发布 npm。确需发布开发包时，采用 `X.Y.Z-dev.N` 等完整预发布版本，并显式执行 `npm publish --access public --tag dev`；开发包也需满足当前发布检查。稳定版 `latest` 始终指向正式版本。

## 发布完成

1. 确认发布标签已推送，npm 和文档工作流成功。构建器从 npm `gitHead` 还原发布提交，该提交须已推送且包版本与 npm 一致。npm 已发布但文档失败时只重跑文档部署；维护部署使用手动入口。
2. 部署工作流已自动执行轻量核验，直接引用其成功证据，不再由 AI 逐项重复查询。手动发布或排障时，可在仓库根目录运行 `pnpm verify:release --version X.Y.Z`（省略版本则使用当前组件版本），用 `--commit <完整SHA>` 固定预期提交；`--npm-only` 只检查发布前半段，不能据此称文档已上线。默认只尝试一次，传播延迟时可用 `--attempts 12` 有界重试。
3. 完整核验包含 npm 版本 / `latest` / `gitHead`、远端 Git 标签、`versions.json`、默认与固定快照的 `api/index.json`、`ai/v1/index.json`、`llm.txt` / `llms.txt`、中英文 Button 页面 / Markdown / 更新记录以及各一项 JS / CSS 资源。它是固定数量的 HTTP 检查，不证明全站交互、搜索、视觉或无障碍已验收；实际效果由用户查看，不扩展为 AI 全站巡检。
4. 仅在本次确实创建过临时开发文档时清理其资源与入口，确认不再提供开发内容。正式历史快照保留。发布结果、实际效果确认状态和相关未完成项分别报告；任一步失败仍按未完成的发布处理。

若发布后文档工作流未自动运行，或需要重试文档部署，手动触发 `Deploy documentation` workflow。不要重新将 main 上的组件源码构建到旧版本路径；各版示例与 API 必须始终使用对应的发布提交。文档基础设施更新可以通过构建器的公共 overlay 应用到旧快照，不能混入未发布组件 API。

AI Skill 与组件包独立发行，维护方式见 [skills/README.md](../../skills/README.md)。新增导出时确保有对应组件或指南页面，让该版 API 索引可按组件和类型查找；无需复制一份完整手册到 Skill。

组件开发约定见 [DEVELOPMENT.md](DEVELOPMENT.md)，文档站维护说明见 [apps/docs/AGENTS.md](../../apps/docs/AGENTS.md)。
