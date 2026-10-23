# 第三方实现与许可证

Leaf UI 的样式、组件接口、主题和语言集成为项目源码。以下复杂交互使用已发布的开源依赖。依赖按模块导入，图片灯箱按需加载。

新增、替换或移除运行依赖时，同步本表或下方依赖说明，核对许可证与分发要求、公共入口的按需导入和可选引擎边界，并按 [质量规则](QUALITY.md#当前验收规则) 检查产物与体积。不得仅凭功能相近复制第三方源码；发生源码复用时另行保留其要求的版权与许可证声明。

| 能力 | 项目 | 许可证 |
| --- | --- | --- |
| 浮层定位 | [Floating UI](https://github.com/floating-ui/floating-ui) | MIT |
| 图片预览、触摸切换、缩放、全屏和缩略图 | [Yet Another React Lightbox](https://github.com/igordanchenko/yet-another-react-lightbox) | MIT |
| 指针、触摸和键盘拖拽排序 | [dnd-kit](https://github.com/clauderic/dnd-kit) | MIT |
| 虚拟列表与动态行高 | [TanStack Virtual](https://github.com/TanStack/virtual) | MIT |
| 格式输入 | [IMask](https://github.com/uNmAnNeR/imaskjs) | MIT |
| 二维码 | [qrcode.react](https://github.com/zpao/qrcode.react) | ISC |
| ICU 翻译模板与复数 | [FormatJS intl-messageformat](https://github.com/formatjs/formatjs) | BSD-3-Clause |

各外部依赖的完整许可证随其 npm 包分发。

其他运行依赖（Lucide、TinyColor、tabbable）的许可证随对应依赖包分发。
