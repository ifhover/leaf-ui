# Leaf UI

轻盈、自然、可定制的 React UI 组件库。默认绿色主题，通过 CSS 变量控制颜色、圆角、字体和动效；文档站使用 Rspress。

在线文档面向组件使用者，分为独立的指南和组件页面；仓库架构、组件开发与文档站维护说明保存在源码 Markdown 中。

- [项目架构与开发](DEVELOPMENT.md)
- [组件开发](packages/react/DEVELOPMENT.md)
- [文档站运行与维护](apps/docs/README.md)

## 本地开发

需要 Node.js 22.22.2 / 24.15.0 及以上受支持的 LTS 版本，或 Node.js 26，以及 pnpm 11。工作区锁定 pnpm 11.10.0。

```bash
pnpm install
pnpm dev
```

打开 `http://localhost:3000`。文档直接引用组件源码，修改组件或 CSS 后会热更新，无需先构建组件包。

## 项目结构

```text
leaf-ui/
├── packages/react/          # @leaf-ui/react 组件包
│   ├── src/button/          # Button 组件、样式和行为测试
│   ├── src/styles/          # 公共主题变量和样式入口
│   ├── src/theme.ts         # CSS 变量内联样式类型
│   └── rslib.config.ts      # ESM、CommonJS 和类型声明构建
├── apps/docs/               # Rspress 文档站
│   ├── docs/                # 指南和组件 MDX 文档
│   ├── src/components/      # 首页、主题编辑器和统一示例卡片
│   ├── src/examples/        # 预览与代码片段共同引用的示例源码
│   └── theme/               # Rspress 主题扩展与站点样式
├── DEVELOPMENT.md          # 源码开发与构建说明
├── biome.json               # 格式化与代码检查
├── tsconfig.base.json       # 共享 TypeScript 配置
└── pnpm-workspace.yaml
```

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `pnpm dev` | 启动文档与组件开发环境 |
| `pnpm build:lib` | 构建组件库 |
| `pnpm build:docs` | 构建文档站 |
| `pnpm build` | 构建组件库和文档站 |
| `pnpm preview` | 预览已构建的文档站 |
| `pnpm check` | 格式、Lint、类型和组件行为测试 |
| `pnpm test:watch` | 监听组件测试 |
| `pnpm format` | 格式化并应用安全的 Lint 修复 |

## 使用组件

组件包名为 `@leaf-ui/react`，当前尚未发布到 npm。可在工作区中引用，或构建后生成本地安装包：

```bash
pnpm build:lib
pnpm --dir packages/react pack
```

在另一个 React 项目中安装生成的 `packages/react/leaf-ui-react-0.1.0.tgz` 后使用：

```tsx
import { Button } from '@leaf-ui/react';
import '@leaf-ui/react/styles.css';

export function App() {
  return <Button onClick={() => console.log('clicked')}>让灵感生长</Button>;
}
```

支持 React 18 / 19。React 作为 peer dependency，不打进组件包；ESM 和 CommonJS 各自带有类型声明。样式需在应用入口显式引入一次。

## 主题定制

在 Leaf UI 样式之后引入自己的 CSS。状态色在组件中根据当前主题色计算，局部主题也能正确更新。

```css
:root {
  --leaf-color-primary: #20834a;
  --leaf-color-on-primary: #ffffff;
  --leaf-radius: 10px;
}

/* 局部主题，同一页面可以使用不同的配色 */
.campaign {
  --leaf-color-primary: #7654c6;
  --leaf-radius: 20px;
}
```

需要内联配置时，可以使用 `LeafThemeStyle` 类型：

```tsx
import { Button, type LeafThemeStyle } from '@leaf-ui/react';

const theme: LeafThemeStyle = {
  '--leaf-color-primary': '#3264d9',
  '--leaf-radius': '6px',
};

export function Example() {
  return <div style={theme}><Button>局部主题</Button></div>;
}
```

组件样式不包含应用全局 reset。浅色和深色中性变量可通过 `data-leaf-theme="light"` / `data-leaf-theme="dark"` 切换。使用深色背景时，建议同时为主题色和按钮前景色选择有足够对比度的值；文档主题编辑器提供了对应示例。

## 添加新组件

1. 在 `packages/react/src/<component>/` 中添加组件、类型和样式，使用 `leaf-` 前缀与公共 CSS 变量。
2. 从该目录的 `index.ts` 和组件库的 `src/index.ts` 导出。
3. 在 `src/styles/index.css` 中引入组件样式。
4. 在 `apps/docs/src/examples/` 中添加示例源码，使用 `ComponentExample` 在 MDX 中展示预览与同一份源码；更新组件总览和组件侧边栏。
5. 执行 `pnpm check` 和 `pnpm build`。
