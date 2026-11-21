# 待发布迁移

本文集中记录开发分支上尚未写入正式更新记录的兼容性变化，面向准备发布的维护者，不进入在线文档。当前条目已整理进 `0.16.5` 中英文更新记录；后续新增破坏性或默认外观变化时在这里追加一条，不再分散写进各规范文件。

## 默认外观变化

- **内置组件主色展示层统一回退为主题原色 `--leaf-color-primary`**：组件与文档站不再在普通表面文字、链接常态、指示线（如 `Tabs`、`Progress`、`LoadingBar`、`Slider`、`Steps`）、焦点框、勾选/选中边界、`Calendar`/`DatePicker`/`Transfer`/`Upload`/`Pagination` 选中项及自定义颜色 `Tag` 前景上使用按对比度自动压暗/提亮的 `--leaf-color-primary-ink`、`--leaf-color-primary-indicator`、`--leaf-color-primary-focus`、`--leaf-color-primary-fill-border`，统一改为直接消费主题基色 `--leaf-color-primary`（`Typography` 链接悬停消费 `var(--leaf-color-primary-link-hover, var(--leaf-color-primary))`）。
  - **保留项**：按下交互态（`--leaf-color-primary-active`、`--leaf-color-primary-link-active`）、基础色阶与派生角色变量生成本身保持不变（继续导出供应用或 Tailwind 显式使用）；`success`、`warning`、`danger`、`info` 保持现有 `*-ink` 角色。
  - **迁移与验收提醒**：使用偏浅或高亮度自定义 `primaryColor` 时，需自行确认浅底/普通表面主色文字与指示的对比度，必要时在业务样式中显式消费 `--leaf-color-primary-ink`、`--leaf-color-primary-indicator` 或通过组件变量覆盖。
