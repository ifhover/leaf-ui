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

`scripts/docs.mjs` 从目标应用目录通过 Node 模块解析取得实际安装版本，支持 npm、pnpm、工作区和常规 Yarn node_modules。Yarn PnP 使用 `yarn node <skill-directory>/scripts/docs.mjs ...`，让 Yarn 注入解析器。

读取 `/v/<exact-version>/api/index.json` 后验证包名、版本及结构，按导出名称选择一份 Markdown。页面也必须带同版本标识。禁止重定向、跨版本路径和 latest 回退。包未安装、API 未导出或请求失败时直接返回错误；本地声明路径仍可用于核对。

测试覆盖实际模块解析、不同应用安装不同版本、旧版本缺少组件、语言回退、服务错误和跨版本请求。测试与 Skill 无关的维护文件放在 `skills/tests`，避免安装到用户工具中。
