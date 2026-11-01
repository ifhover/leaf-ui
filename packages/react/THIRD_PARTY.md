# 第三方实现与许可证

Leaf UI 的样式、组件接口、主题和语言集成为项目源码。以下复杂交互使用已发布的开源依赖。依赖按模块导入，图片灯箱按需加载。

新增、替换或移除运行依赖时，同步本表或下方依赖说明，核对许可证与分发要求、公共入口的按需导入和可选引擎边界，并按 [质量规则](QUALITY.md#当前验收规则) 检查产物与体积。不得仅凭功能相近复制第三方源码；发生源码复用时另行保留其要求的版权与许可证声明。

| 能力 | 项目 | 许可证 |
| --- | --- | --- |
| 浮层定位 | [Floating UI](https://github.com/floating-ui/floating-ui) | MIT |
| 指针、触摸和键盘拖拽排序 | [dnd-kit](https://github.com/clauderic/dnd-kit) | MIT |
| 虚拟列表与动态行高 | [TanStack Virtual](https://github.com/TanStack/virtual) | MIT |
| 格式输入 | [IMask](https://github.com/uNmAnNeR/imaskjs) | MIT |
| 二维码 | [qrcode.react](https://github.com/zpao/qrcode.react) | ISC |
| ICU 翻译模板与复数 | [FormatJS intl-messageformat](https://github.com/formatjs/formatjs) | BSD-3-Clause |

各外部依赖的完整许可证随其 npm 包分发。

图片预览由 Leaf UI 自行实现，界面和交互参考 [Viewer.js](https://github.com/fengyuanchen/viewerjs)，但不引入其脚本、样式或图标，也不依赖其他图片预览引擎。预览操作图标使用已有的 Lucide 依赖。

其他运行依赖（Lucide、TinyColor、tabbable）的许可证随对应依赖包分发。

链接按钮和线形 Tabs 的动作色算法在 `src/action-colors.ts` 中适配自
[@ant-design/colors 7.2.1](https://github.com/ant-design/ant-design-colors/blob/v7.2.1/src/generate.ts)
的 HSV 色板算法，使用现有 TinyColor 计算，不增加运行依赖。
Ant Design 5.29.3 的链接按钮使用第 4 档悬停色（危险按钮使用第 5 档）、
Tabs 使用第 5 档悬停色，按下色均使用第 7 档。以下为该算法的完整许可证声明：

```text
MIT LICENSE

Copyright (c) 2018-present Ant UED, https://xtech.antfin.com/

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
