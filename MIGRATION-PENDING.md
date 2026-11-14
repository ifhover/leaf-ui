# 待发布迁移

本文集中记录开发分支上尚未写入正式更新记录的兼容性变化，面向准备发布的维护者，不进入在线文档。当前条目已整理进 `0.16.4` 中英文更新记录；后续新增破坏性或默认外观变化时在这里追加一条，不再分散写进各规范文件。

## 样式层（`@layer leaf-ui`）与表单默认宽度降权

- Leaf UI 所有组件样式、设计变量与动态效果已统一包裹在 CSS `@layer leaf-ui` 中，输入与日期/时间选择器默认宽度改由低权重 `:where(...)` 与局部变量 `--leaf-field-width` 提供，浮点弹窗类名选择器使用 `:where(.leaf-floating)` 降低权重。
- 使用 Tailwind CSS 4 时，请在入口 CSS 最前面声明 `@layer theme, base, leaf-ui, components, utilities;`，避免组件按需样式后加载时压过工具类；使用 Tailwind CSS 3 时可在 `@tailwind base;` 前声明 `@layer base, leaf-ui, components, utilities;`。
- 若宿主项目仍在使用未包裹在 `@layer` 中的全局重置 CSS（reset），按 CSS Cascade Layers 规则会优先于 `@layer leaf-ui` 生效，需迁移到 `@layer base`（或早于 `leaf-ui` 的层）中。
