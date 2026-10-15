# 文档示例编写规则

本文件是 [AGENTS.md](AGENTS.md) 引用的必读约定，适用于主站组件和指南示例。

## 内容范围

每个示例说明一个明确的能力。基础用法先展示组件默认外观，再用独立示例说明尺寸、状态、受控值或必要的交互。状态对比应有清楚的名称。

主站不编写完整的项目管理、权限工作台、十字段设置页或多步骤业务流程。复杂组合、装饰性封面和业务页面属于将来的独立 example 站点。展示 API 必需的本地状态、提交、重置和异步处理可以保留，但尽量使用最少的字段与数据。

## 布局与样式

- 示例容器 `ComponentExample` 默认在预览区水平、垂直居中，内容宽度为 **480px**；窄屏自动限制到可用宽度。用 `width={360}`、`width={600}` 或 `width="100%"` 调整单个示例。
- 展示用宽度、居中和外围留白只写在 MDX 的 `ComponentExample` 配置中，不重复写进可复制示例源码。容器只控制外部展示，不改写组件圆角、字号、内边距、颜色和状态。
- 只有一个触发按钮的浮层或服务示例使用 `width="fit-content"`，保持按钮自然宽度并居中；表单和对齐布局沿用默认宽度。
- 组件排列使用公开的 `Flex`、`Space` 和 `Grid`。主轴对齐和换行使用 Flex；等间距组合使用 Space；分栏使用 Grid。
- 表单标签、帮助信息和错误使用 `Form` / `FormField`，说明文字使用 `Text` / `Paragraph`，面板使用 `Card`。不手写相同的标签、面板或文字样式。
- 主站示例不依赖 Tailwind 工具类、文档专属类名或隐藏样式文件。复制示例后，只安装 Leaf UI 及源码明确导入的依赖即可使用组件。
- 只在表达当前能力必需时保留少量原生 `style`，例如滚动区域高度、浮层定位、动态颜色或实际演示的尺寸覆盖。不要用 CSS 装饰一个复杂场景来替代基础用法；需要大量 CSS 的内容移出主站。
- 不通过源码过滤器删除布局或样式来制造简洁代码。预览组件与展示、复制、AI 导出的代码必须对应同一实现。

## 源码与中英文

中文示例位于 `src/examples/<component>/`，英文镜像位于 `src/examples/en/<component>/`。MDX 预览导入该组件，代码围栏的 `file` 引用相同的源码：

````mdx
import { ComponentExample } from '../../src/components/component-example';
import { InputBasic } from '../../src/examples/input/basic';

<ComponentExample title="基础输入" preview={<InputBasic />} width={360} fileName="basic.tsx">

```tsx lineNumbers file="../../src/examples/input/basic.tsx"
```

</ComponentExample>
````

不要再维护一份独立手抄的展示代码。语言专用的 `english` 参数和翻译判断由 `scripts/example-source.mjs` 消除；真实的语言切换状态继续保留。显示、复制和 AI Markdown 导出使用同样的处理。

组件新增或 API 改变时，同步中英文页面、公共类型、侧边栏、总览元数据与 SVG 缩略图。API 默认值必须来自实际实现。

## 验收

按改动范围执行类型检查、文档测试、库和文档构建。新增公开组件还需检查根入口、子路径、声明、自动样式和 SSR。

布局调整必须在浏览器验证中文、英文、桌面与窄屏、深浅外观及主题切换。检查预览溢出、控件交互、源码展开/收起和复制的一致性；仅构建通过不能报告视觉验收完成。
