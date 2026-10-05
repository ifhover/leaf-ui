import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { properties, readApiRows, typeExpression } from './api-model.mjs';
import { additions, documentationPage, updatedPages } from './component-metadata.mjs';
import { publicExports } from './export-ai-docs.mjs';

const repository = path.resolve(import.meta.dirname, '../../..');
const baselineRef = process.argv
  .find((argument) => argument.startsWith('--from-ref='))
  ?.slice('--from-ref='.length);
const entry = path.join(repository, 'packages/react/src/index.ts');
const exported = publicExports(await readFile(entry, 'utf8'));
const types = exported.filter((item) => item.kind === 'type');
const byPage = new Map();
for (const item of types) {
  const page = documentationPage(item);
  const list = byPage.get(page) ?? [];
  list.push(item.name);
  byPage.set(page, list);
}
const schema = new Map();
for (const type of types) schema.set(type.name, await properties(entry, type.name));
const expressions = new Map();
for (const type of types)
  if (!schema.get(type.name)?.size)
    expressions.set(type.name, await typeExpression(entry, type.name));
const descriptions = {
  value: ['受控值。', 'Controlled value.'],
  defaultValue: [
    '初始值；非受控模式支持表单重置。',
    'Initial value; uncontrolled fields support native form reset.',
  ],
  onChange: ['值发生变化时调用。', 'Called when the value changes.'],
  items: ['展示的条目。', 'Items to display.'],
  options: ['可供选择的选项。', 'Available options.'],
  data: ['树形数据。', 'Hierarchical data.'],
  key: ['稳定且唯一的标识。', 'Stable, unique identifier.'],
  label: ['展示文字或内容。', 'Visible label or content.'],
  title: ['标题内容。', 'Title content.'],
  description: ['补充说明。', 'Additional description.'],
  children: [
    '子内容；嵌套数据类型表示子节点。',
    'Content, or child nodes for hierarchical records.',
  ],
  disabled: ['禁用交互。', 'Disable interaction.'],
  readOnly: [
    '锁定业务值，禁止输入、选择、清除和删除。',
    'Lock the value against typing, selection, clearing and removal.',
  ],
  inputReadOnly: [
    '只禁止手动输入，仍可在面板中选择。',
    'Disable typing while retaining panel selection.',
  ],
  open: ['控制面板是否展开。', 'Control whether the panel is open.'],
  defaultOpen: ['面板初始展开状态。', 'Initial open state.'],
  onOpenChange: ['面板展开或收起时调用。', 'Called when the panel opens or closes.'],
  popupPlacement: ['浮层相对触发控件的位置。', 'Placement relative to the trigger.'],
  popupClassName: ['浮层的自定义类名。', 'Custom class for the popup.'],
  popupStyle: ['浮层的自定义样式。', 'Custom popup styles.'],
  popupRender: [
    '包装或补充面板内容，保留传入的内容以维持交互。',
    'Wrap or extend popup content; retain the supplied content to preserve interaction.',
  ],
  getPopupContainer: [
    '返回浮层的挂载容器，也可返回 ShadowRoot。',
    'Return a popup container, including a ShadowRoot.',
  ],
  popupWidth: [
    '浮层宽度；auto 根据内容展开，trigger 跟随触发控件。',
    'Popup width; auto fits content and trigger matches the trigger.',
  ],
  popupMaxWidth: [
    '浮层最大宽度，仍会受可视区域限制。',
    'Maximum popup width, also bounded by the viewport.',
  ],
  onPopupScroll: [
    '浮层滚动事件，可用来加载下一页。',
    'Popup scroll event, useful for loading another page.',
  ],
  labelRender: ['自定义选中值的展示。', 'Customize the selected value.'],
  tagRender: [
    '自定义选中标签；通过 remove 请求移除。',
    'Customize selected tags; use remove to request removal.',
  ],
  optionRender: ['自定义选项内容。', 'Customize option content.'],
  filterOption: [
    '自定义过滤；远程搜索时设为 false。',
    'Customize filtering; use false for remote search.',
  ],
  filterTreeNode: ['自定义节点的搜索匹配。', 'Customize search matching for nodes.'],
  nodeRender: ['自定义节点展示内容。', 'Customize node content.'],
  searchLabel: ['搜索时使用的纯文本。', 'Plain text used for searching.'],
  showSearch: ['启用搜索输入。', 'Enable search input.'],
  onSearch: ['搜索文字改变时调用。', 'Called when the search text changes.'],
  allowClear: ['展示清除操作。', 'Show a clear action.'],
  maxCount: ['最多可选的数量。', 'Maximum selection count.'],
  maxTagCount: [
    '最多展示的标签数；responsive 根据可用宽度折叠。',
    'Maximum visible tags; responsive collapses tags to available width.',
  ],
  loadData: [
    '异步加载子节点；应响应 AbortSignal。',
    'Load child nodes asynchronously and respect AbortSignal.',
  ],
  onLoadError: [
    '加载失败时调用，可展示重试提示。',
    'Called on loading failure, for retry feedback.',
  ],
  cacheKey: [
    '数据版本改变时清空懒加载缓存，并取消旧请求。',
    'Changing the data version clears lazy caches and cancels stale requests.',
  ],
  isLeaf: [
    '明确指定是否为叶子节点，配合异步加载使用。',
    'Identify a leaf node, including in lazy data.',
  ],
  changeOnSelect: ['允许选择中间层级。', 'Allow selecting intermediate levels.'],
  displayRender: ['自定义路径的显示内容。', 'Customize displayed paths.'],
  treeExpandedKeys: ['受控的展开节点。', 'Controlled expanded nodes.'],
  onExpand: ['展开节点发生变化时调用。', 'Called when expanded nodes change.'],
  loading: ['展示加载状态。', 'Show a loading state.'],
  errorContent: ['展示加载错误和重试内容。', 'Content for loading errors and retry actions.'],
  notFoundContent: ['没有匹配选项时的内容。', 'Content when no options match.'],
  emptyContent: ['没有内容时的展示。', 'Content for an empty collection.'],
  virtual: [
    '启用虚拟滚动；大量选项默认启用。',
    'Enable virtual scrolling; enabled by default for large option sets.',
  ],
  listHeight: ['可视列表高度。', 'Height of the visible list.'],
  optionHeight: [
    '虚拟选项的估算高度；实际行会被测量。',
    'Estimated virtual option height; actual rows are measured.',
  ],
  itemHeight: ['虚拟行的估算高度。', 'Estimated virtual row height.'],
  format: [
    '显示格式；日期支持 YYYY、MM、DD、HH、mm、ss、Q。',
    'Display format; dates support YYYY, MM, DD, HH, mm, ss and Q.',
  ],
  parse: ['自定义文本解析，失败时返回 null。', 'Parse entered text; return null on failure.'],
  presets: ['快捷选项；value 可以动态计算。', 'Presets; value may be computed on demand.'],
  initialRemaining: [
    'SSR 首屏使用的剩余毫秒数，客户端挂载后按截止时间更新。',
    'Remaining milliseconds for SSR; updates from the deadline after mounting.',
  ],
  minDate: ['最早可选的日期（含边界）。', 'Earliest available date, inclusive.'],
  maxDate: ['最晚可选的日期（含边界）。', 'Latest available date, inclusive.'],
  minuteStep: ['分钟选项间隔；已有值仍会保留。', 'Minute option step; retains an existing value.'],
  secondStep: ['秒钟选项间隔；已有值仍会保留。', 'Second option step; retains an existing value.'],
  borderRadius: ['圆角；数字表示像素。', 'Border radius; numbers are pixels.'],
  controlHeight: ['基础控件高度；其他尺寸由此生成。', 'Base control height, deriving other sizes.'],
  fontSize: ['字号；数字表示像素。', 'Font size; numbers are pixels.'],
  gap: ['子项之间的间距；数字表示像素。', 'Gap between items; numbers are pixels.'],
  background: ['组件表面背景。', 'Component surface background.'],
  shadow: ['CSS box-shadow 的值。', 'CSS box-shadow value.'],
  panelValue: ['受控的日历显示日期。', 'Controlled date displayed by the calendar panel.'],
  onPanelChange: [
    '日历显示的周期改变时调用。',
    'Called when the displayed calendar period changes.',
  ],
  cellRender: ['自定义日历单元格内容。', 'Customize calendar cell content.'],
  disabledDate: ['按业务规则禁用日期。', 'Disable dates using business rules.'],
  disabledTime: [
    '按业务规则禁用时间，输入和面板选择使用同一规则。',
    'Disable times; typing and panel selection use the same rules.',
  ],
  allowEmpty: ['明确允许空的起止端点。', 'Explicitly allow open range endpoints.'],
  onCalendarChange: [
    '选择过程中的日期变化，包含当前起止位置。',
    'Changes during selection, including the current start/end position.',
  ],
  multiple: [
    '启用多选；value 和回调的类型随之变化。',
    'Enable multiple selection; value and callback types change accordingly.',
  ],
  formatter: [
    '格式化显示文字，不改变表单的原始值。',
    'Format displayed text without changing the canonical form value.',
  ],
  parser: ['把显示文字还原为数值。', 'Parse displayed text back into a value.'],
  stringMode: [
    '使用字符串处理高精度数值、步长和边界。',
    'Use strings for exact values, steps and bounds.',
  ],
  grouping: ['启用本地化数字分组。', 'Use localized digit grouping.'],
  locale: ['语言或数字格式的区域标识。', 'Locale for language or numeric formatting.'],
  precision: ['小数位数。', 'Decimal precision.'],
  prefix: ['前置内容。', 'Leading content.'],
  suffix: ['后置内容。', 'Trailing content.'],
  min: ['允许的最小值。', 'Minimum allowed value.'],
  max: ['允许的最大值。', 'Maximum allowed value.'],
  step: [
    '步长；Slider 设为 null 时仅选择刻度值。',
    'Step; Slider uses only marked values when null.',
  ],
  autoUpload: [
    '文件校验通过后自动开始；false 时用 ref.upload()。',
    'Start after validation; use ref.upload() when false.',
  ],
  concurrency: ['同时进行的上传请求数。', 'Maximum concurrent upload requests.'],
  directory: [
    '选择目录及其文件；依赖浏览器的目录选择能力。',
    'Choose a directory and its files, subject to browser support.',
  ],
  paste: ['接收剪贴板中的文件。', 'Accept files from the clipboard.'],
  listType: ['文件列表的展示形式。', 'File list presentation.'],
  required: [
    '要求整体值非空，复合控件只校验一次。',
    'Require a non-empty value; compound controls validate once.',
  ],
  name: ['原生 FormData 中的字段名。', 'Field name in native FormData.'],
  form: ['关联的原生表单 ID。', 'ID of the associated native form.'],
  destroyOnClose: [
    '关闭过渡完成后卸载内容；默认保留。',
    'Unmount content after the closing transition; preserved by default.',
  ],
  preserve: [
    '显式控制关闭后是否保留内容，优先于 destroyOnClose。',
    'Explicitly preserve closed content; overrides destroyOnClose.',
  ],
  forceRender: [
    '打开前也挂载内容，关闭时保持隐藏。',
    'Mount before opening and keep hidden while closed.',
  ],
  initialFocus: ['指定打开后的初始焦点。', 'Specify initial focus after opening.'],
  returnFocus: [
    '关闭后返回原焦点；也可指定目标或设为 false。',
    'Restore focus on close; specify a destination or use false.',
  ],
  container: ['自定义挂载或滚动容器。', 'Custom portal or scroll container.'],
  push: [
    '打开嵌套抽屉时推动父弹层，可指定距离。',
    'Push the parent overlay when a nested drawer opens; accepts a distance.',
  ],
  resizable: ['允许拖动和使用方向键调整大小。', 'Allow resizing by dragging or arrow keys.'],
  minSize: ['最小尺寸，单位为像素。', 'Minimum size in pixels.'],
  maxSize: ['最大尺寸，单位为像素。', 'Maximum size in pixels.'],
  onResize: ['大小改变时调用。', 'Called while resizing.'],
  onResizeEnd: ['调整结束时调用。', 'Called when resizing ends.'],
  trigger: [
    '触发方式；下拉菜单支持点击、悬停和右键。',
    'Trigger mode; Dropdown supports click, hover and context menu.',
  ],
  itemRender: ['自定义条目内容。', 'Customize item content.'],
  linkRender: [
    '接入路由链接时保留传入的可访问性和事件属性。',
    'Render a router link while retaining supplied accessibility and event props.',
  ],
  itemClassName: ['条目类名或按条目计算的类名。', 'Item class, or a class computed from an item.'],
  placement: ['布局或展示位置。', 'Layout or display placement.'],
  maxItems: ['路径折叠前最多展示的项数。', 'Maximum items before collapsing a path.'],
  itemsBeforeCollapse: ['折叠后保留的起始项数。', 'Leading items retained after collapse.'],
  itemsAfterCollapse: ['折叠后保留的末尾项数。', 'Trailing items retained after collapse.'],
  menu: ['该路径项的下拉菜单。', 'Dropdown items for a breadcrumb.'],
  progressDot: [
    '使用点状步骤，可自定义点的内容。',
    'Use progress dots, optionally with custom content.',
  ],
  percent: ['完成百分比。', 'Completion percentage.'],
  tooltip: [
    '显示滑块提示，可定制数值格式。',
    'Show a thumb tooltip, optionally with custom formatting.',
  ],
  segments: [
    '按比例和颜色显示多个分段。',
    'Display multiple sections with proportions and colors.',
  ],
  steps: ['离散的进度段数。', 'Number of discrete progress steps.'],
  dashboard: ['显示仪表盘式进度。', 'Display progress as a dashboard gauge.'],
  successPercent: ['已经成功完成的进度部分。', 'Part of the progress completed successfully.'],
  trailColor: ['未完成部分的颜色。', 'Color of the remaining track.'],
  gradient: ['启用渐变颜色选择。', 'Enable gradient color selection.'],
  mode: ['选择展示或编辑模式。', 'Presentation or editing mode.'],
  angle: ['渐变角度，单位为度。', 'Gradient angle in degrees.'],
  stops: ['渐变中的色标。', 'Color stops in the gradient.'],
  offset: [
    '偏移量；色标为 0–100 的百分比。',
    'Offset; color stops use a percentage from 0 to 100.',
  ],
  color: ['颜色或语义色。', 'Color or semantic tone.'],
  messages: ['覆盖内置组件的语言文本。', 'Override built-in component messages.'],
  textMessages: [
    '以英文原文为 key，覆盖扩展组件的文本。',
    'Override extended component labels using the English source text as the key.',
  ],
  direction: ['文字和交互方向。', 'Text and interaction direction.'],
  weekStartsOn: [
    '一周起始日，0 表示周日、1 表示周一。',
    'First day of the week; 0 is Sunday and 1 is Monday.',
  ],
  spacing: ['基础间距，其他间距按比例派生。', 'Base spacing; other spacing values are derived.'],
  lineHeight: ['正文行高。', 'Body line height.'],
  headingWeight: ['标题字重。', 'Heading weight.'],
  elevation: ['整体阴影强度。', 'Overall shadow strength.'],
  breakpoints: ['useBreakpoint 使用的响应式断点。', 'Responsive thresholds used by useBreakpoint.'],
  components: ['按组件名称覆盖局部样式。', 'Override local styles by component name.'],
  compact: ['减少正文段落间距。', 'Use tighter paragraph spacing.'],
  tone: ['文字的语义色。', 'Semantic text tone.'],
  strong: ['加粗文字。', 'Use bold text.'],
  italic: ['斜体文字。', 'Use italic text.'],
  underline: ['显示下划线。', 'Show an underline.'],
  code: ['以行内代码展示。', 'Display as inline code.'],
  mark: ['突出标记文字。', 'Highlight text.'],
  ellipsis: [
    '单行或多行省略，可提供展开操作。',
    'Truncate one or more lines, optionally with an expand action.',
  ],
  copyable: [
    '提供复制操作，可指定复制内容和回调。',
    'Provide a copy action with optional content and callbacks.',
  ],
  editable: [
    '提供编辑操作；onChange 后由调用者更新文字。',
    'Provide editing; update the text after onChange.',
  ],
  level: ['标题层级，输出对应的 h1–h6。', 'Heading level, rendering h1–h6.'],
  external: ['在新标签页打开并设置安全的 rel。', 'Open in a new tab with a safe rel attribute.'],
  icon: ['图标内容。', 'Icon content.'],
  renderItem: ['渲染每个条目。', 'Render each item.'],
  itemKey: ['为动态条目提供稳定的标识。', 'Provide stable keys for dynamic items.'],
  avatar: ['前置头像或图标。', 'Leading avatar or icon.'],
  extra: ['尾部的补充内容。', 'Trailing content.'],
  actions: ['条目操作区。', 'Actions for the item.'],
  divider: ['显示条目之间的分隔。', 'Show separators between items.'],
  header: ['顶部内容。', 'Header content.'],
  footer: ['底部内容。', 'Footer content.'],
  size: ['展示尺寸。', 'Presentation size.'],
  as: ['列表语义或独立块元素。', 'List-item semantics or a standalone block.'],
  onFinish: ['完成时调用一次。', 'Called once on completion.'],
  onActiveChange: ['当前章节变化时调用。', 'Called when the active section changes.'],
  activeKey: ['受控的当前章节。', 'Controlled active section.'],
  smooth: [
    '启用平滑滚动，减少动画设置下会自动关闭。',
    'Enable smooth scrolling, respecting reduced motion.',
  ],
  offsetTop: ['固定位置距离容器顶部的像素数。', 'Distance from the container top in pixels.'],
  offsetBottom: ['固定位置距离容器底部的像素数。', 'Distance from the container bottom in pixels.'],
  onAffixChange: ['固定状态变化时调用。', 'Called when the affixed state changes.'],
  panels: ['工作区面板。', 'Workspace panels.'],
  sizes: [
    '受控的面板比例，总和会归一化为 100。',
    'Controlled panel proportions, normalized to 100.',
  ],
  defaultSizes: ['初始的面板比例。', 'Initial panel proportions.'],
  collapsible: ['允许折叠和恢复面板。', 'Allow collapsing and restoring a panel.'],
  current: ['受控的当前步骤索引。', 'Controlled current step index.'],
  defaultCurrent: ['初始步骤索引。', 'Initial step index.'],
  target: [
    '目标的选择器或返回元素的函数；省略时居中。',
    'Target selector or element getter; omit to center the step.',
  ],
  missingTarget: [
    '目标缺失时居中、跳过或关闭。',
    'Center, skip or close when a target is missing.',
  ],
  mask: ['展示引导遮罩。', 'Show a tour mask.'],
  padding: ['内容或高亮目标的内边距。', 'Padding for content or a highlighted target.'],
  onClose: ['请求关闭时调用。', 'Called when closing is requested.'],
  activeIndex: ['受控的当前幻灯片索引。', 'Controlled slide index.'],
  defaultActiveIndex: ['初始幻灯片索引。', 'Initial slide index.'],
  autoplay: [
    '启用自动播放；数字表示间隔毫秒数。',
    'Enable autoplay; a number sets the interval in milliseconds.',
  ],
  arrows: ['显示前后切换按钮。', 'Show previous and next controls.'],
  dots: ['显示幻灯片指示器。', 'Show slide indicators.'],
  infinite: ['允许循环切换。', 'Allow cycling through slides.'],
  pauseOnHover: [
    '鼠标悬停时暂停播放；焦点进入也会暂停。',
    'Pause on hover; focus also pauses playback.',
  ],
  goTo: ['切换到指定的索引。', 'Go to a slide index.'],
  next: ['切换到下一项。', 'Go to the next item.'],
  previous: ['切换到上一项。', 'Go to the previous item.'],
  fixed: [
    '固定在视口角落；false 时参与页面布局。',
    'Fix to a viewport corner; false keeps it in layout.',
  ],
  expandable: ['提供展开操作组的按钮。', 'Provide a button to expand the action group.'],
  prefixes: ['可触发建议的文本前缀。', 'Text prefixes that trigger suggestions.'],
  split: ['插入引用后追加的分隔文字。', 'Separator appended after inserting a reference.'],
  onSelect: ['条目被选择时调用。', 'Called when an item is selected.'],
  keywords: ['搜索匹配的额外关键词。', 'Additional search keywords.'],
  shortcut: [
    '键盘提示；命令面板默认使用 Ctrl/Cmd + K。',
    'Shortcut label; the palette defaults to Ctrl/Cmd + K.',
  ],
  group: ['条目的分组标题。', 'Group heading.'],
  onError: [
    '操作失败时调用；命令面板会保留并展示错误。',
    'Called on failure; the palette remains open with error feedback.',
  ],
  position: ['导航栏定位方式。', 'Navigation bar positioning.'],
  dense: ['使用紧凑的工具栏。', 'Use a compact toolbar.'],
  showLabels: ['始终展示底部导航文字。', 'Always show bottom-navigation labels.'],
  href: ['链接目标。', 'Link destination.'],
  onClick: ['点击时调用。', 'Called on click.'],
  validate: [
    '接收 FormData 和取消信号，返回按字段名组织的错误。',
    'Validate FormData with a cancellation signal; return field-keyed errors.',
  ],
  onSubmit: [
    '校验通过后提交；应响应取消信号。',
    'Submit after validation, respecting cancellation.',
  ],
  focusError: ['出现错误时聚焦第一个字段。', 'Focus the first invalid field.'],
  errors: ['按字段名组织的错误，可传给 FormField。', 'Field-keyed errors for FormField.'],
  pending: ['校验或提交是否进行中。', 'Whether validation or submission is pending.'],
  setErrors: ['设置服务端或业务错误。', 'Set server or business errors.'],
  handleSubmit: ['绑定到 Form.onSubmit。', 'Bind to Form.onSubmit.'],
  handleReset: [
    '绑定到 Form.onReset，取消请求并清除错误。',
    'Bind to Form.onReset to cancel requests and clear errors.',
  ],
  clearErrors: [
    '清除一个或全部错误并取消旧请求。',
    'Clear one or all errors and cancel stale requests.',
  ],
  cancel: ['取消当前请求。', 'Cancel the current request.'],
  upload: [
    '开始指定文件或所有待处理文件的上传。',
    'Start a specified upload or all pending files.',
  ],
  abort: ['取消指定文件或所有上传。', 'Abort a specified upload or all uploads.'],
  focus: ['聚焦控件。', 'Focus the control.'],
};
const specific = {
  'TourProps.steps': ['引导的步骤列表。', 'Steps in the guided tour.'],
  'AppBarProps.elevation': ['展示导航栏阴影。', 'Show a shadow below the bar.'],
  'FloatButtonGroupProps.direction': [
    '快捷操作横向或纵向排列。',
    'Arrange quick actions horizontally or vertically.',
  ],
  'CommandItem.shortcut': [
    '展示在条目旁的快捷键提示。',
    'Shortcut hint displayed beside the item.',
  ],
  'CommandPaletteProps.shortcut': [
    '使用 Ctrl/Cmd 与该按键打开面板；false 禁用快捷键。',
    'Use Ctrl/Cmd with this key to open the palette; false disables it.',
  ],
  'TreeProps.virtual': [
    '仅渲染可视节点；大量节点时建议启用。',
    'Render visible nodes only; enable for large trees.',
  ],
  'TreeDropInfo.target': ['接收拖放的目标节点。', 'Target node receiving the drop.'],
  'TreeDropInfo.position': [
    '放在目标节点之前、内部或之后。',
    'Place before, inside or after the target node.',
  ],
  'ColorPickerProps.format': [
    '颜色文字格式；渐变模式应用于每个色标。',
    'Color text format, applied to each stop in gradient mode.',
  ],
  'ColorPickerProps.defaultFormat': ['初始颜色文字格式。', 'Initial color text format.'],
  'ColorPickerProps.onFormatChange': [
    '颜色文字格式变化时调用。',
    'Called when the color text format changes.',
  ],
  'ColorPickerProps.presets': ['预设的颜色分组。', 'Groups of preset colors.'],
  'StatisticProps.formatter': ['自定义指标数值的展示。', 'Customize the displayed metric value.'],
  'SplitterPanel.min': ['面板最小百分比。', 'Minimum panel percentage.'],
  'SplitterPanel.max': ['面板最大百分比。', 'Maximum panel percentage.'],
  'CountdownProps.value': [
    '截止时间的 Date 或毫秒时间戳。',
    'Deadline as a Date or a millisecond timestamp.',
  ],
  'CountdownProps.format': [
    'DD、HH、mm、ss、SSS 格式，其中 HH 可展示累计小时。',
    'Format using DD, HH, mm, ss, SSS; HH can show total hours.',
  ],
  'SplitterProps.direction': ['左右或上下排列面板。', 'Arrange panels horizontally or vertically.'],
  'AnchorProps.offset': [
    '滚动目标距离容器顶部的像素数。',
    'Scroll-target distance from the container top in pixels.',
  ],
};
const headings = new Map();
for (const english of [false, true]) {
  for (const [page, names] of byPage) {
    let document = '';
    try {
      document = await readFile(
        path.join(repository, `apps/docs/docs/${english ? 'en/' : ''}${page}.mdx`),
        'utf8',
      );
    } catch {}
    for (const name of names) {
      headings.set(
        `${english}/${name}`,
        sectionMatch(document, name)?.heading ??
          (name.endsWith('Props') ? `${name.replace(/Props$/u, '')} API` : name),
      );
    }
  }
}
function anchor(name, english) {
  return headings.get(`${english}/${name}`).toLowerCase().replaceAll(' ', '-');
}
function code(value) {
  const fence = value.includes('`') ? '``' : '`';
  return `${fence}${value.includes('`') ? ' ' : ''}${value.replaceAll('|', '\\|')}${value.includes('`') ? ' ' : ''}${fence}`;
}
function typeCell(value, page, english) {
  let text = value.replace(
    /\bPlacement\b/gu,
    "'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end'",
  );
  for (const [name, expression] of expressions)
    if (expression && expression.length < 230 && !expression.includes('{'))
      text = text.replace(new RegExp(`\\b${name}\\b`, 'gu'), expression);
  const pieces = [];
  let position = 0;
  for (const match of text.matchAll(/\b[A-Za-z_]\w*\b/gu)) {
    const type = types.find((item) => item.name === match[0]);
    if (!type || !schema.get(type.name)?.size) continue;
    const target = documentationPage(type);
    const url =
      target === page
        ? `#${anchor(type.name, english)}`
        : `${target.startsWith('guide/') ? '../guide/' : '../components/'}${target.split('/').at(-1)}#${anchor(type.name, english)}`;
    if (match.index > position) pieces.push(code(text.slice(position, match.index)));
    pieces.push(`[${code(match[0])}](${url})`);
    position = match.index + match[0].length;
  }
  if (position < text.length) pieces.push(code(text.slice(position)));
  return pieces.join('') || code(text);
}
function escapePattern(value) {
  return value.replaceAll(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}
function sectionMatch(document, name) {
  const headings = [`${name.replace(/Props$/u, '')} API`, `${name} API`, name];
  for (const heading of headings) {
    const expression = new RegExp(
      `(^## ${escapePattern(heading)}\\r?\\n)([\\s\\S]*?)(?=^## |$(?![\\s\\S]))`,
      'mu',
    );
    const match = document.match(expression);
    if (match) return { match, heading, expression };
  }
  return null;
}
const contractDescriptions = new Set([
  'disabled',
  'readOnly',
  'inputReadOnly',
  'required',
  'cacheKey',
]);
for (const [page, names] of byPage) {
  const slug = page.split('/').at(-1);
  const addition = additions.find((item) => item[2] === slug);
  if (!addition && !updatedPages.has(slug) && !updatedPages.has(page)) continue;
  for (const english of [false, true]) {
    const file = path.join(repository, `apps/docs/docs/${english ? 'en/' : ''}${page}.mdx`);
    let document;
    try {
      document = await readFile(file, 'utf8');
    } catch {
      if (!addition && page !== 'guide/control-contracts') continue;
      document = '';
    }
    if (addition && !document) {
      const [
        name,
        zh,
        ,
        ,
        ,
        description,
        enDescription,
        basic,
        advanced,
        advancedTitle,
        enAdvancedTitle,
      ] = addition;
      const prefix = english ? '../../../src' : '../../src';
      document = `import { ComponentExample } from '${prefix}/components/component-example';\nimport { ${basic}, ${advanced} } from '${prefix}/examples/${slug}/basic';\n\n# ${name}${english ? '' : ` ${zh}`}\n\n${english ? enDescription : description}\n\n## ${english ? 'Basic usage' : '基础用法'}\n\n<ComponentExample title="${english ? 'Basic usage' : '基础用法'}" preview={<${basic}${english ? ' english' : ''} />} fileName="basic.tsx">\n\n\`\`\`tsx lineNumbers file="${prefix}/examples/${slug}/basic.tsx"\n\`\`\`\n\n</ComponentExample>\n\n## ${english ? enAdvancedTitle : advancedTitle}\n\n<ComponentExample title="${english ? enAdvancedTitle : advancedTitle}" preview={<${advanced}${english ? ' english' : ''} />} fileName="basic.tsx">\n\n\`\`\`tsx lineNumbers file="${prefix}/examples/${slug}/basic.tsx"\n\`\`\`\n\n</ComponentExample>\n`;
    }
    if (page === 'guide/control-contracts' && !document)
      document = english
        ? '# Control and popup contracts\n\nA common contract for fields and floating panels.\n'
        : '# 控件与浮层\n\n输入控件与浮层使用一致的状态约定。\n';
    let original = document;
    try {
      if (baselineRef)
        original = execFileSync(
          'git',
          ['show', `${baselineRef}:${path.relative(repository, file).replaceAll(path.sep, '/')}`],
          { cwd: repository, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
        );
    } catch {}
    for (const name of names) {
      const props = schema.get(name);
      if (!props?.size) continue;
      const section = sectionMatch(document, name);
      const old = readApiRows(sectionMatch(original, name)?.match[2] ?? section?.match[2] ?? '');
      const rows = [
        `| ${english ? 'Property | Type | Default | Description' : '属性 | 类型 | 默认值 | 说明'} |`,
        '| --- | --- | --- | --- |',
      ];
      for (const [property, value] of props) {
        const previous = old.get(property);
        const pair =
          specific[`${name}.${property}`] ??
          (contractDescriptions.has(property) || !previous?.description
            ? descriptions[property]
            : undefined);
        const description = (
          property.startsWith('[')
            ? english
              ? 'Reusable CSS custom property.'
              : '可复用的 CSS 自定义属性。'
            : (pair?.[english ? 1 : 0] ??
              previous?.description ??
              (english
                ? `Configure ${property.replace(/([a-z])([A-Z])/gu, '$1 $2').toLowerCase()}.`
                : `设置 ${property}。`))
        ).replace(/^(?:Required\.\s*|必需。)+/u, '');
        rows.push(
          `| ${code(property)} | ${typeCell(value.type, page, english)} | ${value.defaultValue ? code(value.defaultValue) : ((!addition ? previous?.defaultValue : undefined) ?? '—')} | ${!value.optional ? (english ? 'Required. ' : '必需。') : ''}${description} |`,
        );
      }
      for (const [property, value] of old)
        if (
          !props.has(property) &&
          [
            'name',
            'form',
            'required',
            'readOnly',
            'disabled',
            'className',
            'style',
            'ref',
            'href',
            'target',
            'rel',
            'id',
            'aria-label',
          ].includes(property)
        )
          rows.push(
            `| ${code(property)} | ${value.type} | ${value.defaultValue} | ${descriptions[property]?.[english ? 1 : 0] ?? value.description} |`,
          );
      const table = rows.join('\n');
      if (section) {
        document = document.replace(
          section.expression,
          (_all, heading, body) =>
            heading +
            (body.match(/^(?:\|[^\n]*(?:\n|$))+/mu)
              ? body.replace(/^(?:\|[^\n]*(?:\n|$))+/mu, `${table}\n`)
              : `\n${table}\n\n${body}`),
        );
      } else
        document += `\n## ${name.endsWith('Props') ? `${name.replace(/Props$/u, '')} API` : name}\n\n${table}\n`;
    }
    if (addition && !document.includes(english ? '## Types and interaction' : '## 类型与交互'))
      document += `\n## ${english ? 'Types and interaction' : '类型与交互'}\n\n${english ? 'Import the props and data types when creating reusable configuration.' : '组装可复用配置时，可导入对应的属性和数据类型。'}\n\n\`\`\`ts\nimport type { ${names.join(', ')} } from '@sudden3/leaf-ui';\n\`\`\`\n\n${english ? 'Provide accessible labels for icon-only actions. Interactive controls support keyboard navigation and respect ConfigProvider themes and reduced motion.' : '为仅展示图标的操作提供可访问名称。交互控件支持键盘操作，并跟随 ConfigProvider 的主题和减少动画设置。'}\n`;
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, document);
  }
}
console.log('Synced bilingual public APIs from TypeScript declarations.');
