# npm 发布与更新记录

分支开发、版本同步和开发预览清理遵循 [开发、版本与文档同步流程](../../DEVELOPMENT-WORKFLOW.md)。`main` 是稳定发布分支；组件及使用文档的变更合并后，必须完成 npm 正式发布与文档部署，保持同一版本及发布提交。

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

## 检查与发布

在仓库根目录运行：

```bash
pnpm check
pnpm build
```

`pnpm check:release` 会检查当前版本的中英文记录、日期与实际变更条目，并拒绝在线记录中的未发布区域。它已加入 `pnpm check`、GitHub Pages 检查以及 npm 的 `prepublishOnly`，升版但未更新记录时会阻止正常发布。发布前的检查还会构建并验证 npm 包产物。

检查通过后，将版本和更新记录提交到开发分支，通过审查后合并到 `main`。在实际合并后的发布提交重新执行检查与构建，并确认工作区干净，再在 `packages/react` 目录运行：

```bash
npm publish --dry-run --access public
npm publish --access public
```

确认包名为 `@sudden3/leaf-ui`，账户具备该作用域的写入权限，并由维护者在已登录浏览器中完成 npm 双因素认证。令牌和验证码不得写入源码。

npm 的 `gitHead` 和 `vX.Y.Z` 标签必须指向同一个实际发布提交。使用 squash 或 rebase 合并时，以合并后的提交发布，保证 npm 源码记录可从 `main` 追溯。

开发文档预览无需发布 npm。确需发布开发包时，采用 `X.Y.Z-dev.N` 等完整预发布版本，并显式执行 `npm publish --access public --tag dev`；开发包也需满足当前发布检查。稳定版 `latest` 始终指向正式版本。

## 发布完成

1. 通过 `npm view @sudden3/leaf-ui@X.Y.Z version gitHead` 和 `npm view @sudden3/leaf-ui dist-tags --json` 确认新版本已存在、`latest` 指向它、`gitHead` 与发布提交一致。
2. 为该发布提交创建 `vX.Y.Z` Git 标签并推送到 GitHub。源码、标签和 npm 必须对应同一提交。
3. `main` 推送会自动构建并部署 GitHub Pages。构建器从 npm 的 `gitHead` 还原发布提交，因此该提交必须已推送到仓库，且 package.json 中版本必须与 npm 一致。若合并触发的构建早于 npm 发布，发布后手动触发 `Deploy documentation` workflow。
4. 确认 `/v/X.Y.Z/`、其 `llm.txt`、`llms.txt`、`api/index.json` 和组件 Markdown 均能访问。顶部版本菜单应包含新版本，中英文更新记录应一致；默认根地址直接展示 npm latest 的已发布文档，不跳转到版本路径。
5. 分支合并后删除对应临时开发文档及其预览入口，确认该 URL 已不再提供开发内容。默认文档、新版本快照、npm 信息与预览清理全部验收后，才算发布完成。
6. 若 npm 发布或文档部署失败，按未完成的发布继续处理。版本化部署只展示 npm 中实际发布的版本，开发内容可本地或在独立临时地址预览。

若发布后没有新的 main 推送，手动触发 `Deploy documentation` workflow。不要重新将 main 上的组件源码构建到旧版本路径；各版示例与 API 必须始终使用对应的发布提交。文档基础设施更新可以通过构建器的公共 overlay 应用到旧快照，不能混入未发布组件 API。

AI Skill 与组件包独立发行，维护方式见 [skills/README.md](../../skills/README.md)。新增导出时确保有对应组件或指南页面，让该版 API 索引可按组件和类型查找；无需复制一份完整手册到 Skill。

组件开发约定见 [DEVELOPMENT.md](DEVELOPMENT.md)，文档站维护说明见 [apps/docs/README.md](../../apps/docs/README.md)。
