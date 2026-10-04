# 第三方实现与许可证

Leaf UI 的样式、组件接口、主题和语言集成为项目源码。以下复杂交互使用已发布的开源依赖，而不是复制它们的源码。依赖按模块导入，图片灯箱、图片裁剪、PDF、文本预览和签名引擎按需加载。

| 能力 | 项目 | 许可证 |
| --- | --- | --- |
| 浮层定位 | [Floating UI](https://github.com/floating-ui/floating-ui) | MIT |
| 图片预览、触摸切换、缩放、全屏和缩略图 | [Yet Another React Lightbox](https://github.com/igordanchenko/yet-another-react-lightbox) | MIT |
| 图片裁剪、触摸与键盘调整 | [react-easy-crop](https://github.com/ValentinH/react-easy-crop) | MIT |
| 指针、触摸和键盘拖拽排序 | [dnd-kit](https://github.com/clauderic/dnd-kit) | MIT |
| 虚拟列表与动态行高 | [TanStack Virtual](https://github.com/TanStack/virtual) | MIT |
| 格式输入 | [IMask](https://github.com/uNmAnNeR/imaskjs) | MIT |
| 签名笔迹 | [signature_pad](https://github.com/szimek/signature_pad) | MIT |
| 二维码 | [qrcode.react](https://github.com/zpao/qrcode.react) | ISC |
| PDF 阅读器 | [React-PDF](https://github.com/wojtekmaj/react-pdf) | MIT |
| PDF 解码与 worker | [PDF.js](https://github.com/mozilla/pdf.js) | Apache-2.0 |

各外部依赖的完整许可证随其 npm 包分发。Leaf UI 额外分发未修改的 PDF.js worker，版本固定为 5.4.296；其完整许可证见 [PDFJS-LICENSE](PDFJS-LICENSE)，worker 文件保留原版权说明。应用应使用包内匹配版本的 worker，自托管方式见 FilePreview 文档。

其他运行依赖（Lucide、TinyColor、tabbable）的许可证随对应依赖包分发。
