# Leaf UI 仓库协作约定

本文件适用于整个仓库，是开发规范的入口。开始工作前，阅读下表中与任务相关的文件；进入子目录时同时遵守该目录的 `AGENTS.md`。不要只读本索引而跳过对应规范。

## 必读规范

| 任务 | 必须阅读 | 规则归属 |
| --- | --- | --- |
| 所有开发、文档维护与发布 | [开发、版本与文档同步流程](DEVELOPMENT-WORKFLOW.md) | 分支、版本、发布边界、开发预览与清理 |
| 首次参与或调整项目结构、构建 | [项目架构与本地开发](DEVELOPMENT.md) | 工作区、源码与产物链路 |
| 新增、修改、重构组件 | [组件编写与开发规则](packages/react/DEVELOPMENT.md)、[样式与交互标准](DESIGN-STANDARDS.md) | 公共 API、原生语义、区域配置、内部控件、视觉与交互 |
| 新增、修改组件颜色或主题变量 | [颜色系统规范](COLOR-SYSTEM.md) | 新组件接入、存量修改、角色选择、变量准入与退役、同步清单 |
| 编写测试或验收改动 | [质量验收：当前规则](packages/react/QUALITY.md#当前验收规则) | 按影响选检查、浏览器覆盖、失败与未验收项的报告 |
| 修改文档、示例或文档站 | [文档站协作约定](apps/docs/AGENTS.md)、[示例编写规则](apps/docs/EXAMPLE-WRITING.md)、[文档站维护说明](apps/docs/MAINTENANCE.md) | 双语示例、API / AI 导出、导航、构建与版本快照 |
| 新增或调整第三方依赖 | [第三方实现与许可证](packages/react/THIRD_PARTY.md) | 实现来源、许可证说明；同时检查按需导入、可选依赖和体积 |
| 修改设计资源或 Figma 导出 | [设计资源说明](design/figma/README.md)、[颜色系统规范](COLOR-SYSTEM.md) | 统一生成源、导出与静态 / 人工验收边界 |
| 修改或分发 Agent Skill | [Skill 维护与发布](skills/README.md) | 独立版本、精确版本查询与测试 |
| 准备合并、发布或修复发布失败 | [发布操作](packages/react/RELEASING.md)、[开发流程](DEVELOPMENT-WORKFLOW.md) | npm、Git 标签、正式文档和预览清理的一致性 |

## 执行原则

- 保留已有未提交改动。默认复用目标版本开发分支，不按每个需求新建分支；`main` 只承载稳定发布内容，维护文档和独立 Skill 的例外以开发流程为准。
- 组件用色先选共享视觉家族和用途角色，不自行拼近似默认色，不为每个组件或按下状态新增全局变量。只有 JS `ConfigProvider` 配置驱动颜色派生；不增加 DOM 颜色监听。
- 规则只在对应归属文件维护；其他入口使用链接，不复制算法、尺寸表或发布步骤。规则变更时同步检查引用方，发现冲突先核对当前源码与现行规范，不沿用历史记录中的旧规则。
- 按影响完成检查并如实报告失败、未执行项及人工验收边界；构建通过不等于视觉通过，代码完成不等于发布完成。

## 实现参考与历史证据

以下内容按需查阅，不是新增组件的规范模板，也不能覆盖上面的现行规则：

- [Table 实现说明](packages/react/src/table/README.md)：修改表格时的内部结构、可选引擎与迁移参考。
- [颜色迁移清单](packages/react/COLOR-MIGRATION.md)：版本迁移和逐组件绘制责任；[颜色审计报告](packages/react/COLOR-AUDIT.md) 是脚本生成结果，不手工维护。
- [设计与动效调整记录](DESIGN-REFRESH.md)、[分批实施记录](IMPLEMENTATION-BATCHES.md)、[组件审计实施记录](packages/react/AUDIT-IMPLEMENTATION.md)、[FileList 迁移记录](packages/react/FILELIST-REFRESH.md)：保留当时方案、执行与兼容性背景。
- [无障碍验收记录](packages/react/ACCESSIBILITY.md) 和 [质量验收历史](packages/react/QUALITY.md#历史验收记录)：仅证明对应日期、提交与环境的已执行覆盖，不代表当前全库通过。
