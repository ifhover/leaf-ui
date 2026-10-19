# npm 发布与更新记录

分支开发、版本同步和开发预览清理遵循 [开发、版本与文档同步流程](../../DEVELOPMENT-WORKFLOW.md)。用户未指定具体分支时，在以目标版本号命名的开发分支集中准备发布，已有对应分支直接复用，不为每个需求另建分支。`main` 是稳定发布分支；组件及使用文档的变更合并后，必须完成 npm 正式发布与文档部署，保持同一版本及发布提交。

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

在仓库根目录运行：

```bash
pnpm check
pnpm build
```

`pnpm check:release` 会检查当前版本的中英文记录、日期与实际变更条目，并拒绝在线记录中的未发布区域。它已加入 `pnpm check`、GitHub Pages 检查以及 npm 的 `prepublishOnly`，升版但未更新记录时会阻止正常发布。发布前的检查还会构建并验证 npm 包产物。

### GitHub Actions 自动发布（推荐）

`.github/workflows/publish.yml` 使用 npm Trusted Publishing（OIDC）。npm 的 Trusted Publisher 必须配置为 GitHub 仓库 `ifhover/leaf-ui`、Workflow filename `publish.yml`、Environment name `npm`，并允许 `npm publish`。在 GitHub 仓库的 **Settings → Environments** 创建同名的 `npm` 环境；如设置了部署分支限制，应允许正式版本标签。无需配置 `NPM_TOKEN`，也不需要单独允许 `npm dist-tag`。

普通提交、推送开发分支或合并 `main` 都不会发布 npm。工作流只在推送 `vX.Y.Z` 标签时发布，或通过 **Actions → Publish npm package → Run workflow** 手动运行；手动运行时，在 **Use workflow from** 中选择已经推送的正式版本标签，也可以执行 `gh workflow run publish.yml --ref vX.Y.Z`。不能选择开发分支或 `main`，确保工作流提交、发布源码和 provenance 一致。

1. 更新 `packages/react/package.json` 中的版本与中英文更新记录，检查通过后合并到 `main`。
2. 拉取最新 `main`，确认工作区干净，在实际合并后的发布提交创建并推送标签。下面以尚未发布的 `0.5.1` 为例，执行前替换为本次实际版本：

   ```bash
   git switch main
   git pull --ff-only origin main
   git tag v0.5.1
   git push origin v0.5.1
   ```

3. 工作流确认标签与组件版本一致、提交已包含在 `main`，且新版本高于 npm `latest`；随后安装依赖，执行 `pnpm check`、`pnpm build`，确认构建没有改动源码，再发布公开包与 provenance。
4. 发布后核对 npm `gitHead`、`latest` 和发布标签。工作流成功后，`Deploy documentation` 自动从 `main` 运行，构建 npm 已发布版本的文档与快照。

此工作流只处理正式版本，拒绝预发布标签。同一版本不能覆盖：如果 npm 已有该版本且提交不同，会要求升版；如果该版本已从同一提交发布并且仍是 `latest`，重跑会跳过上传，继续核对并触发文档部署。npm 已发布而文档失败时，优先重跑 `Deploy documentation`，无需重新发布 npm。

新增 Trusted Publisher 显示 `Pending validation` 时，需要在 npm 页面指定的截止时间前成功发布一次以完成验证；过期后需要在 npm 删除并重新创建该配置。

### 本地手动发布

检查通过后，将版本和更新记录提交到开发分支，通过审查后合并到 `main`。在实际合并后的发布提交重新执行检查与构建，并确认工作区干净，再在 `packages/react` 目录运行：

```bash
npm publish --dry-run --access public
npm publish --access public
```

确认包名为 `@ifhover/leaf-ui`，账户具备该作用域的写入权限，并由维护者在已登录浏览器中完成 npm 双因素认证。令牌和验证码不得写入源码。

npm 的 `gitHead` 和 `vX.Y.Z` 标签必须指向同一个实际发布提交。使用 squash 或 rebase 合并时，以合并后的提交发布，保证 npm 源码记录可从 `main` 追溯。

开发文档预览无需发布 npm。确需发布开发包时，采用 `X.Y.Z-dev.N` 等完整预发布版本，并显式执行 `npm publish --access public --tag dev`；开发包也需满足当前发布检查。稳定版 `latest` 始终指向正式版本。

## 发布完成

1. 通过 `npm view @ifhover/leaf-ui@X.Y.Z version gitHead` 和 `npm view @ifhover/leaf-ui dist-tags --json` 确认新版本已存在、`latest` 指向它、`gitHead` 与发布提交一致。
2. 确认 `vX.Y.Z` Git 标签已推送到 GitHub，且与 npm 指向同一发布提交。通过 Actions 发布时，推送标签就是发布入口；本地手动发布时，推送标签触发的工作流会核对已有版本并跳过重复上传。
3. `main` 推送以及 `Publish npm package` 成功都会自动构建并部署 GitHub Pages。构建器从 npm 的 `gitHead` 还原发布提交，因此该提交必须已推送到仓库，且 package.json 中版本必须与 npm 一致。若未通过发布工作流触发部署，发布后手动触发 `Deploy documentation` workflow。
4. 确认 `/v/X.Y.Z/`、其 `llm.txt`、`llms.txt`、`api/index.json` 和组件 Markdown 均能访问。顶部版本菜单应包含新版本，中英文更新记录应一致；默认根地址直接展示 npm latest 的已发布文档，不跳转到版本路径。
5. 分支合并后删除对应临时开发文档及其预览入口，确认该 URL 已不再提供开发内容。默认文档、新版本快照、npm 信息与预览清理全部验收后，才算发布完成。
6. 若 npm 发布或文档部署失败，按未完成的发布继续处理。版本化部署只展示 npm 中实际发布的版本，开发内容可本地或在独立临时地址预览。

若发布后文档工作流未自动运行，或需要重试文档部署，手动触发 `Deploy documentation` workflow。不要重新将 main 上的组件源码构建到旧版本路径；各版示例与 API 必须始终使用对应的发布提交。文档基础设施更新可以通过构建器的公共 overlay 应用到旧快照，不能混入未发布组件 API。

AI Skill 与组件包独立发行，维护方式见 [skills/README.md](../../skills/README.md)。新增导出时确保有对应组件或指南页面，让该版 API 索引可按组件和类型查找；无需复制一份完整手册到 Skill。

组件开发约定见 [DEVELOPMENT.md](DEVELOPMENT.md)，文档站维护说明见 [apps/docs/AGENTS.md](../../apps/docs/AGENTS.md)。
