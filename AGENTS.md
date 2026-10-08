# Leaf UI 仓库协作约定

本文件适用于整个仓库。

开始开发、修改使用文档或准备发布前，必须阅读并遵守 [开发、版本与文档同步流程](DEVELOPMENT-WORKFLOW.md)。该文档是分支开发、正式发布、开发文档预览与清理的统一约定。

## 核心规则

- `main` 是稳定发布分支。组件代码和使用文档的改动必须在新分支完成，合并到 `main` 意味着完成一次新版本发布。
- 发布完成时，`main` 的组件源码与使用文档、npm `latest`、默认在线文档必须对应同一正式版本和发布提交。
- 允许开发分支使用独立的临时在线预览，如 `5.0-dev`；合并到 `main` 或放弃开发后必须删除预览及其入口。
- 开发预览使用独立地址；开发版 npm 使用预发布版本和 `dev` 等标签。正式站点、npm `latest` 和历史稳定快照保持正式发布内容。
- 仅仓库维护说明或独立 Skill 的修改按流程文档中的边界处理；不能借此跳过组件或使用文档的发布。
- 按改动范围完成验证，报告实际结果。npm 发布、文档部署或预览清理有任何一步未完成，都不能报告发布已完成。

## 相关说明

- 项目结构与本地开发：[DEVELOPMENT.md](DEVELOPMENT.md)
- 组件实现约定：[packages/react/DEVELOPMENT.md](packages/react/DEVELOPMENT.md)
- 样式与交互标准：[DESIGN-STANDARDS.md](DESIGN-STANDARDS.md)
- 发布操作：[packages/react/RELEASING.md](packages/react/RELEASING.md)
- 文档构建与快照：[apps/docs/README.md](apps/docs/README.md)
- 质量验收：[packages/react/QUALITY.md](packages/react/QUALITY.md)
