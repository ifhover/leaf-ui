# npm 发布与更新记录

每次发布新的 npm 版本，都必须同步更新中英文更新记录。组件使用者的更新记录在：

- [中文](../../apps/docs/docs/changelog.md)
- [英文](../../apps/docs/docs/en/changelog.md)

发布步骤只保留在此文件，不写入在线更新记录。

## 版本与记录

组件版本的唯一来源是 `packages/react/package.json` 的 `version`。文档顶部版本号直接读取该字段，无需手动修改导航；工作区根包和文档包均为私有包，它们的版本不代表组件版本。

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

检查通过后，将版本和更新记录提交到本地 Git，再在 `packages/react` 目录运行：

```bash
npm publish --dry-run --access public
npm publish --access public
```

确认包名为 `@sudden3/leaf-ui`，账户具备该作用域的写入权限，并由维护者在已登录浏览器中完成 npm 双因素认证。令牌和验证码不得写入源码。

## 发布完成

1. 通过 `npm view @sudden3/leaf-ui@X.Y.Z version` 确认新版本已经存在。
2. 为本次发布提交创建 `vX.Y.Z` Git 标签，将提交和标签推送到 GitHub。
3. `main` 推送会自动构建并部署 GitHub Pages；确认顶部版本号与中英文更新记录均已更新。
4. 若 npm 发布失败，先处理失败原因，不将准备中的版本作为成功发布的更新记录部署。

组件开发约定见 [DEVELOPMENT.md](DEVELOPMENT.md)，文档站维护说明见 [apps/docs/README.md](../../apps/docs/README.md)。
