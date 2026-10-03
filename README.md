# Leaf UI

轻盈、自然、可定制的 React UI 组件库。默认绿色主题，通过 ConfigProvider 调整颜色、圆角、字体和控件高度。支持 React 18 / 19，提供 TypeScript 类型、ESM 和 CommonJS 入口。

[在线文档](https://ifhover.github.io/leaf-ui/) · [npm](https://www.npmjs.com/package/@sudden3/leaf-ui)

## 安装与使用

在你的 React 应用中安装组件包：

```bash
pnpm add @sudden3/leaf-ui
```

也可以使用 `npm install @sudden3/leaf-ui` 或 `yarn add @sudden3/leaf-ui`。样式只需在应用入口引入一次，使用组件无需安装 Sass。

```tsx
import { Button, DatePicker, Input, Select } from '@sudden3/leaf-ui';
import '@sudden3/leaf-ui/styles.css';

export function App() {
  return (
    <form onSubmit={(event) => {
      event.preventDefault();
      console.log(Object.fromEntries(new FormData(event.currentTarget)));
    }}>
      <Input name="title" aria-label="项目名称" placeholder="项目名称" required />
      <Select name="team" aria-label="团队" required options={[
        { value: 'design', label: '设计团队' },
        { value: 'engineering', label: '工程团队' },
      ]} />
      <DatePicker name="deadline" aria-label="截止日期" />
      <Button type="submit">创建项目</Button>
    </form>
  );
}
```

单行控件默认高度统一为 **34px**，小 / 大尺寸为 **28 / 40px**。选择类组件使用统一的浮层，支持键盘操作、点击外部收起和局部主题。

## 组件

| 导入名称 | 用途 |
| --- | --- |
| `Button` | 按钮、图标、加载与红色危险状态 |
| `Input` / `Textarea` | 单行 / 多行文本输入 |
| `Checkbox` | 多项选择与半选 |
| `Radio` / `RadioGroup` | 单选与选项分组 |
| `Switch` | 开关与加载状态 |
| `Select` | 单选、多选和搜索，支持禁用选项与清除 |
| `DatePicker` | 日期选择，支持最早 / 最晚日期 |
| `TimePicker` | 24 / 12 小时制与秒选择 |
| `AutoComplete` | 自由文本输入与动态建议 |
| `Cascader` | 按层级选择完整路径 |
| `Form` / `FormField` | 表单布局、自动标签宽度与校验反馈 |
| `ConfigProvider` | 区域主题、自动派生尺寸、外观和中英文 |
| `DateTimePicker` / `DateRangePicker` | 日期时间与多粒度起止区间 |
| `Dropdown` | 操作菜单与键盘导航 |
| `Modal` / `Confirm` | 弹窗与异步确认 |
| `Alert` / `Message` / `useMessage` | 页内提示与短暂消息 |

`Select` 的 onChange 返回字符串值与选项，多选时返回数组；`DatePicker` 返回 Date 或 null 及本地 `YYYY-MM-DD` 字符串；`TimePicker` 返回 `HH:mm` 或 null；`AutoComplete` 返回输入文本；`Cascader` 返回路径数组与选项数组。

设置 name 后，可通过 FormData 读取值。日期为 `YYYY-MM-DD`，时间为 `HH:mm`，级联路径为 JSON 数组字符串。非受控组件支持表单 reset；受控组件需同时重置应用状态。为表单控件提供 label 或 aria-label。

## 区域主题与语言

```tsx
import { ConfigProvider, DateTimePicker, Form, FormField } from '@sudden3/leaf-ui';

<ConfigProvider locale="en-US" theme={{ primaryColor: '#7654c6', borderRadius: 6 }}>
  <Form labelWidth="auto">
    <FormField label="Deadline" required>
      <DateTimePicker name="deadline" />
    </FormField>
  </Form>
</ConfigProvider>
```

嵌套配置继承未设置的选项；浮层与放在区域内的 message / confirm contextHolder 沿用主题和语言。详细用法见[在线文档](https://ifhover.github.io/leaf-ui/)。

## 主题定制

使用 ConfigProvider 调整主题。只需给出基础圆角、高度和字号，其他尺寸自动生成；特殊需求通过可选的 tokens 覆盖。

```tsx
<ConfigProvider theme={{
  primaryColor: '#7654c6',
  borderRadius: 8,
  controlHeight: 34,
  appearance: 'light',
}}>
  <Button>品牌按钮</Button>
</ConfigProvider>
```

CSS 变量供业务组件读取：自己的按钮也可以使用 `var(--leaf-color-primary)`、`var(--leaf-radius)` 与 `var(--leaf-control-height)`，跟随所在区域的配置。

服务端渲染使用同一份静态 CSS 和初始主题，动态切换无需重新生成样式。Next.js App Router、Pages Router 和其他框架的例子见 [SSR 使用](https://ifhover.github.io/leaf-ui/guide/ssr.html)。

图标采用 [Lucide](https://lucide.dev/)。应用中需要使用图标时安装 `lucide-react`，然后通过具名导入将图标节点传给 Button 的 startIcon / endIcon 或 Input 的 prefix / suffix。

## Git 与反馈

公开仓库：[ifhover/leaf-ui](https://github.com/ifhover/leaf-ui)。问题与建议请提交至 [GitHub Issues](https://github.com/ifhover/leaf-ui/issues)。

```bash
git clone https://github.com/ifhover/leaf-ui.git
```

源码维护、构建与文档站说明见 [开发文档](DEVELOPMENT.md)。
