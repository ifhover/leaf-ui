# Table 实现说明

`Table` 是唯一的公开表格组件，直接从主入口 `@ifhover/leaf-ui` 导出（同时提供标准的 `@ifhover/leaf-ui/table` 按需子路径，已彻底移除 `@tanstack/react-table` 依赖、`useDataTable`、`useDataTableSelection` 与 `@ifhover/leaf-ui/table/tanstack`）。`table-frame.tsx` 负责原生表格语义、滚动视口、吸顶表头、固定列溢出回退和空/加载/错误状态行；`table.tsx` 负责声明式列定义、排序、行选择、详情展开、树形子行、列宽拖拽、固定列、分页与虚拟滚动。

## 视觉与样式

默认样式沿用简洁中性表头（`subtle-action-background`、`600` 字重 `--leaf-table-text`、`1px × 1.6em` 表头短竖分隔线）、`70% divider` 柔化边框与分隔线、顶部基础圆角（默认 `10px`）、无外层画布与固定列阴影。普通行悬停与斑马条纹均使用 `2% --leaf-table-text`；选中行复用悬停同款浅灰底，且已选中行悬停不变色。排序/悬停表头切换至 `surface-muted`，排序表体列复用表头浅灰底，激活排序双三角与列宽拖拽线高亮为 `--leaf-color-primary`。

支持 `sm | md`（默认 `md`，运行时未知尺寸回退 `md`），全表使用基础字号、`22/14` 行高与 `tabular-nums`，`sm / md` 对应 `8×12px` / `16×16px` 内边距（单行高 `39 / 55px`）。设置 `bordered` 开启外框和全单元格网格线并隐藏表头短竖线；设置 `striped` 从第二行开启斑马条纹并隐藏行间横向分割线。`theme.components.Table` 控制视觉 token，`components.Table` 控制区域展示默认参数（类型为 `TablePresentationProps`）。

## 核心能力

- **列定义（`TableColumn<TData>`）**：支持 `key`、`dataIndex`（字段或嵌套路径数组）、`title`、`label`、`render`、`align`、`width`、`minWidth`、`maxWidth`、`flex`、`fixed`（`left | right | start | end`）、`ellipsis`、`sorter`、`sortDirections`、`resizable`、`className`、`headerClassName`、`onCell`、`onHeaderCell`。
- **排序**：支持内置比较器与自定义比较函数、单列与 `multiSort`（Shift 叠加）、受控 `sort` 与非受控 `defaultSort`、`manualSorting` 服务端模式。
- **行选择（`rowSelection`）**：支持 `checkbox`（含当前页全选/半选与跨页保留）与 `radio` 单选、`getCheckboxProps` 按行禁用，存在起始固定列时自动跟随固定。
- **展开行与树形数据（`expandable`）**：支持 `expandedRowRender` 独立展开列（首次展开保留 DOM 状态），也支持带 `children`（可自定义 `childrenColumnName`）的树形嵌套展开与缩进（默认每层 `16px`，非虚拟模式下不超过 200 行时由 `row-motion.ts` 提供平滑折叠过渡），支持同级递归排序与按顶层根行分页。
- **列宽布局与拖拽**：无显式宽度/边界/弹性/省略/固定/拖拽/虚拟配置时使用原生 `table-layout: auto`；否则由 `column-sizing.ts` 联合求解弹性权重与工具列宽度；拖拽支持鼠标、触摸、双击重置与键盘方向键/Shift/Home/End，遵循 RTL 方向。
- **虚拟滚动与分页**：`virtual` 复用仓库已有的 `@tanstack/react-virtual`，支持动态行高（含详情行）、表头 `scrollMargin` 与聚焦行保留；`pagination` 默认开启，本地自动切片，支持 `manualPagination`、大总数自动识别服务端分页以及 `total < 0` 未知总数纯图标翻页。

## 开发与验证

```sh
pnpm --filter @ifhover/leaf-ui exec vitest run src/table
```

完整质量验收与发布流程见 [QUALITY.md](../../QUALITY.md#当前验收规则)。
