# FileList 重写与组件移除

开发分支：`codex/file-list-refresh`。本说明供源码维护者准备下一次发布使用，不属于在线更新记录；当前改动尚未发布。

## 兼容性与迁移

- 移除 `ImageCropper` 以及 `CropArea`、`ImageCropperHandle`、`ImageCropperProps`、`ImageCropResult` 类型。
- 移除 `SignaturePad` 以及 `SignaturePadHandle`、`SignaturePadProps`、`SignaturePoint`、`SignatureStroke` 类型。
- 移除 `@ifhover/leaf-ui/image-cropper`、`@ifhover/leaf-ui/signature-pad` 及各自的 `/style.css` 子路径，中英文文档、示例、菜单、组件总览和 AI 导出入口同步移除。
- 不再依赖 `react-image-crop` 和 `signature_pad`。原有正式更新记录和稳定版快照保留发布时的内容。
- `FileList`、`FileItem`、`FileListProps` 和现有公开参数保持不变；默认仍为 `text`，继续支持 `picture`、`picture-card` 及 Upload 的取消、重试操作。
- FileList 内部布局和样式已重写。业务若依赖内部 class 或 DOM 结构覆盖样式，需要重新检查；建议通过公开参数和 `renderActions` 定制。
- 移除操作由 `onRemove` 的调用方更新 `items`。异步请求期间禁止重复提交，拒绝信息只出现在对应文件行；失败后可重试。

包含组件删除，下一次正式发布必须说明兼容性变化并按 [发布流程](../../DEVELOPMENT-WORKFLOW.md) 选择版本、同步中英文更新记录。本轮不提升组件版本，不合并到 `main`，不发布 npm 或部署正式文档。

## 视觉与交互

普通列表采用共享外框和行分隔线。图标、文件信息与操作区分列对齐；类型与可选大小显示在名称下方，长名称省略并保留完整 `title`。操作按钮和下载链接使用相同尺寸，窄屏时操作区可换行。图片卡片使用固定比例的预览和底部操作区，缩略图失败回退为类型图标。

状态文字、进度和错误位于文件信息列，不影响其他文件的对齐。样式继承主题、圆角和区域密度，适配暗色、RTL、系统减少动态效果与强制颜色模式。图片组预览与音视频预览保留。

验收结果见 [QUALITY.md](QUALITY.md) 中的本轮记录；详细日志与截图放在被 Git 忽略的 `.quality/` 中。
