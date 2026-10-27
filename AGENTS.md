# Leaf UI 仓库协作约定

本文件适用于整个仓库，是开发规范的入口，主要供 AI agent 阅读。开始工作前，阅读下表中与任务相关的文件；进入子目录时同时遵守该目录的 `AGENTS.md`。不要只读本索引而跳过对应规范。

## 规范优先级

外观相关规则按以下顺序理解：[设计风格](DESIGN-STYLE.md) 给出方向，[样式与交互标准](DESIGN-STANDARDS.md) 给出具体契约，[颜色系统规范](COLOR-SYSTEM.md) 给出颜色角色与配方。三者与当前源码冲突时，以源码为准，并在回复中向用户报告差异；不要自行按方向改实现，也不要沿用 `history/` 中的旧规则。

## 必读规范

| 任务                         | 必须阅读                                                                                                                                                                | 规则归属                                                                        |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 所有开发、文档维护与发布     | [开发、版本与文档同步流程](DEVELOPMENT-WORKFLOW.md)                                                                                                                     | 分支、版本、发布边界、开发预览与清理                                            |
| 首次参与或调整项目结构、构建 | [项目架构与本地开发](DEVELOPMENT.md)                                                                                                                                    | 工作区、源码与产物链路                                                          |
| 新增、修改、重构组件         | [组件编写与开发规则](packages/react/DEVELOPMENT.md)、[设计风格](DESIGN-STYLE.md)、[样式与交互标准](DESIGN-STANDARDS.md)                                                 | 公共 API、原生语义、区域配置、内部控件；风格方向；具体视觉与交互契约            |
| 新增、修改组件颜色或主题变量 | [颜色系统规范](COLOR-SYSTEM.md)                                                                                                                                         | 新组件接入、存量修改、角色选择、变量准入与退役、同步清单                        |
| 编写测试或验收改动           | [质量验收：当前规则](packages/react/QUALITY.md#当前验收规则)                                                                                                            | 基础检查、按需排障、人工确认边界、失败与未验收项的报告                          |
| 修改文档、示例或文档站       | [文档站协作约定](apps/docs/AGENTS.md)、[使用文档编写规范](apps/docs/DOCUMENT-WRITING.md#组件页固定结构)、[示例编写规则](apps/docs/EXAMPLE-WRITING.md)、[文档站维护说明](apps/docs/MAINTENANCE.md)、[设计风格：定位](DESIGN-STYLE.md#定位) | 内容取舍与结构、示例布局、双语 API / AI 导出、站点维护；对外描述口径 |
| 新增或调整第三方依赖         | [第三方实现与许可证](packages/react/THIRD_PARTY.md)                                                                                                                     | 实现来源、许可证说明；同时检查按需导入、可选依赖和体积                          |
| 修改设计资源或 Figma 导出    | [设计资源说明](design/figma/README.md)、[颜色系统规范](COLOR-SYSTEM.md)                                                                                                 | 统一生成源、导出与静态 / 人工验收边界                                           |
| 修改或分发 Agent Skill       | [Skill 维护与发布](skills/README.md)                                                                                                                                    | 独立版本、精确版本查询与测试                                                    |
| 引入破坏性或默认外观变化     | [待发布迁移](MIGRATION-PENDING.md)                                                                                                                                      | 未发布兼容性变化的唯一记录处                                                    |
| 准备合并、发布或修复发布失败 | [发布操作](packages/react/RELEASING.md)、[开发流程](DEVELOPMENT-WORKFLOW.md)、[待发布迁移](MIGRATION-PENDING.md)                                                        | npm、Git 标签、正式文档和预览清理的一致性；发版时把迁移条目整理进更新记录后删除 |

## 任务速查

| 改动类型                | 先读                                                           | 至少执行                                                                                                     |
| ----------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 只改组件 SCSS 视觉      | 设计风格、样式与交互标准中对应组件小节、颜色系统的视觉家族契约 | `pnpm check:colors`、`pnpm test:colors`、相关编译样式检查；实际效果与排障按[质量规则](packages/react/QUALITY.md#当前验收规则) |
| 改组件行为 / API / 类型 | 组件编写与开发规则、质量验收                                   | 相关 vitest 文件、类型检查；改公共 API 时运行 `node apps/docs/scripts/sync-component-api.mjs` 并同步双语文档 |
| 改颜色默认值或角色映射  | 颜色系统规范全文                                               | `generate:palette`、`pnpm design:export`、颜色专项；实际效果与排障按[质量规则](packages/react/QUALITY.md#当前验收规则) |
| 只改文档文案 / 示例     | 文档站协作约定、使用文档编写规范、示例编写规则、设计风格：定位 | 文档类型检查、`node --test apps/docs/scripts/docs-structure.test.mjs`；TSX 变化时最终态构建一次文档          |
| 只改维护 Markdown       | 本文件、被修改文件的引用方                                     | 相对链接与锚点检查、`git diff --check`；不宣称运行了组件验收                                                 |

## 执行原则

- 分支规则见 [开发流程：分支开发](DEVELOPMENT-WORKFLOW.md#分支开发)。只在用户明确要求时提交。
- 默认外观遵循 [设计风格](DESIGN-STYLE.md)：中性优先、表面分层、只渐变颜色的克制反馈，不做抬起、缩放、弹性回弹或主题色光晕。对外描述强调一致、克制与可读，不宣传自由定制、灵活多变或展现个性。设计风格的待收敛清单只在任务涉及对应组件时处理，修改前与用户确认。
- 组件用色先选共享视觉家族和用途角色，不自行拼近似默认色，不为每个组件或按下状态新增全局变量。只有 JS `ConfigProvider` 配置驱动颜色派生；不增加 DOM 颜色监听。
- 规则只在对应归属文件维护；其他入口使用链接，不复制算法、尺寸表或发布步骤。规则变更时同步检查引用方。
- 按影响完成检查并如实报告失败、未执行项及人工验收边界；构建通过不等于视觉通过，代码完成不等于发布完成。

## 并行任务与已有改动

工作区常有用户或其他 agent 的并行改动。

- 保留所有不是自己做的未提交改动：不回退、不覆盖、不格式化、不混进自己的提交。发现意外改动先向用户报告，再决定如何继续。
- 编辑别人可能同时在改的文件前重新读取当前内容，只做自己需要的局部修改。
- 不停止、不复用别人启动的服务，不占用别人的端口；按需浏览器排障遵循 [运行与报告隔离](packages/react/QUALITY.md#浏览器运行与报告隔离)。
- `.git/index.lock` 存在时说明可能有其他 git 进程，不要删除它；需要移动文件时可先用普通文件操作，并在报告中说明。

## 生成文件

以下文件只能通过脚本更新，不要手改：

| 生成文件                                                                           | 生成方式                                                                                                                |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `packages/react/src/styles/_palette.scss`                                          | `pnpm --filter @ifhover/leaf-ui generate:palette`                                                                       |
| `packages/react/COLOR-AUDIT.md`                                                    | `packages/react/scripts/color-contract.mjs` 的报告渲染（见 [颜色系统：按改动范围同步](COLOR-SYSTEM.md#按改动范围同步)） |
| 文档中的组件 API 表格、`api/component-defaults`、`api/theme-tokens`                | `node apps/docs/scripts/sync-component-api.mjs`                                                                         |
| `apps/docs/docs/public/design/*`、`design/figma/code.js`、`design/figma/tokens.js` | `pnpm design:export`（插件源码是 `design/figma/source.js`）                                                             |
| `packages/react/src/locales/zh-TW.json` 与翻译 JSON Schema                         | `pnpm --filter @ifhover/leaf-ui generate:locale`                                                                        |
| `apps/docs/docs/public/locales/`                                                   | `apps/docs/scripts/sync-locales.mjs`（文档 dev / build 前自动执行）                                                     |

## 实现参考与历史记录

以下内容按需查阅，不是新增组件的规范模板，也不能覆盖上面的现行规则：

- [Table 实现说明](packages/react/src/table/README.md)：修改表格时的内部结构、可选引擎与迁移参考。
- [颜色迁移清单](packages/react/COLOR-MIGRATION.md)：版本迁移和逐组件绘制责任（测试会读取，不要移动）；[颜色审计报告](packages/react/COLOR-AUDIT.md) 是生成结果。
- `history/`：设计调整、分批实施、组件审计、FileList 迁移、无障碍验收与 [质量验收历史](history/QUALITY-HISTORY.md)。只证明对应日期、提交与环境的覆盖范围，默认不读；只有追溯某项决定的来历时才查阅。
