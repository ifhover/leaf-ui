import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  apiDefaultCell,
  apiSectionMatch,
  orderApiSections,
  properties,
  readApiRows,
  removeDuplicateApiSections,
  replaceApiTable,
  typeExpression,
} from './api-model.mjs';
import { orderPrimaryComponentApi, parseComponentDocument } from './component-document.mjs';
import { additions, documentationPage, updatedPages } from './component-metadata.mjs';
import { publicApi } from './export-ai-docs.mjs';

const repository = path.resolve(import.meta.dirname, '../../..');
const selectedPage = process.argv
  .find((argument) => argument.startsWith('--page='))
  ?.slice('--page='.length);
const pageSelected = (page) =>
  !selectedPage || page === selectedPage || page.endsWith(`/${selectedPage}`);
const baselineRef = process.argv
  .find((argument) => argument.startsWith('--from-ref='))
  ?.slice('--from-ref='.length);
const entry = path.join(repository, 'packages/react/src/index.ts');
const exported = await publicApi(repository);
const types = exported.filter((item) => item.kind === 'type');
const byPage = new Map();
for (const item of types) {
  const page = documentationPage(item);
  const list = byPage.get(page) ?? [];
  list.push(item.name);
  byPage.set(page, list);
}
const schema = new Map();
for (const type of types) schema.set(type.name, await properties(type.entry ?? entry, type.name));
const expressions = new Map();
for (const type of types)
  if (!schema.get(type.name)?.size)
    expressions.set(type.name, await typeExpression(type.entry ?? entry, type.name));
const descriptions = {
  persistent: [
    '滚动条常驻并占用独立宽度；默认覆盖内容。',
    'Keep scrollbars visible in reserved gutters; overlay content by default.',
  ],
  showSeconds: [
    '显示并编辑秒，关闭时秒为 0。',
    'Display and edit seconds; otherwise seconds are zero.',
  ],
  use12Hours: ['使用 12 小时制与上午 / 下午。', 'Use a 12-hour clock with AM/PM.'],
  allowOvernight: ['允许时间区间跨越午夜。', 'Allow a time-only range to cross midnight.'],
  status: [
    '显示错误或警告的校验外观，不执行校验。',
    'Show an error or warning appearance without performing validation.',
  ],
  picker: [
    '选择日期、时间、日期时间、周、月、季度或年。',
    'Select a date, time, date-time, week, month, quarter or year.',
  ],
  showToday: [
    '在面板底部显示跳转到今天的操作。',
    'Show the action to jump to today in the panel footer.',
  ],
  todayText: [
    '今天按钮的内容；未指定时使用当前语言。',
    'Content of the today action; defaults to the current locale.',
  ],
  renderExtraFooter: [
    '在日历底部增加自定义内容或快捷操作。',
    'Add content or shortcuts below the calendar.',
  ],
  danger: [
    '使用危险语义颜色，不改变按钮行为。',
    'Use destructive-action colors without changing button behavior.',
  ],
  fullWidth: ['让按钮填满所在容器的宽度。', 'Stretch the button to its container width.'],
  startIcon: [
    '按钮文字前的图标；仅图标按钮还需 aria-label。',
    'Icon before the label; icon-only buttons also need aria-label.',
  ],
  endIcon: ['按钮文字后的图标。', 'Icon after the label.'],
  className: ['添加到组件外层的 CSS 类名。', 'CSS class added to the component root.'],
  mouseEnterDelay: [
    '悬停触发后等待多少毫秒再打开。',
    'Delay in milliseconds before opening on hover.',
  ],
  mouseLeaveDelay: [
    '鼠标离开后等待多少毫秒再关闭。',
    'Delay in milliseconds before closing after pointer leave.',
  ],
  checked: ['受控的菜单项勾选状态。', 'Controlled checked state of the menu item.'],
  closeOnSelect: [
    '选择此项后是否关闭菜单；可覆盖菜单的默认行为。',
    'Whether selecting this item closes the menu; overrides the menu behavior.',
  ],
  onCheckedChange: [
    '点击勾选项时返回下一勾选状态。',
    'Called with the next checked state when the item is activated.',
  ],
  controls: ['显示增减数值的按钮。', 'Show the increment and decrement buttons.'],
  keyboard: [
    '允许通过上下方向键增减数值。',
    'Allow incrementing and decrementing with the arrow keys.',
  ],
  resize: [
    '允许用户拖动文本框的方向；none 禁止拖动。',
    'Allowed textarea resize directions; none disables resizing.',
  ],
  autoSize: [
    '根据文本自动调整高度，可限制最少和最多行数。',
    'Resize height to the text, optionally bounded by minimum and maximum rows.',
  ],
  showCount: [
    '显示字符数；函数可自定义计数内容。',
    'Show the character count or customize it with a function.',
  ],
  minWidth: [
    '表格的最小宽度；超出容器时在表格内横向滚动。',
    'Minimum table width; overflow scrolls inside the table.',
  ],
  error: [
    '请求失败时显示的内容，替代数据行。',
    'Content displayed instead of data rows after a request failure.',
  ],
  onRetry: [
    '点击错误状态中的重试操作时调用。',
    'Called when the retry action in the error state is activated.',
  ],
  selection: [
    '行选择模式；false 关闭，single 单选，multiple 多选。',
    'Row selection mode: false disables it, single selects one row, multiple selects many.',
  ],
  pagination: [
    '显示或配置分页器；快捷数据模式下 false 同时关闭本地切页。',
    'Show or configure pagination; false also disables local slicing in data mode.',
  ],
  tableRef: [
    '获取内部原生 table 元素，用于测量或聚焦。',
    'Ref to the native table element for measurement or focus.',
  ],
  meta: [
    '列的对齐、单元格属性和显示配置。',
    'Column alignment, cell attributes and display configuration.',
  ],
  hour: ['小时，使用 0–23 的整数。', 'Hour as an integer from 0 to 23.'],
  minute: ['分钟，使用 0–59 的整数。', 'Minute as an integer from 0 to 59.'],
  second: ['秒，使用 0–59 的整数。', 'Second as an integer from 0 to 59.'],
  density: [
    '控件、表单、菜单、列表与浮层的区域密度；嵌套继承，显式尺寸优先。',
    'Inherited region density for controls, forms, menus, lists and overlays; explicit sizes take precedence.',
  ],
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
  divided: [
    '用浅分隔线划分标题、内容和底部操作区。',
    'Separate the heading, content and footer with subtle borders.',
  ],
  headerBackground: [
    '标题区域背景；默认继承表面颜色。',
    'Header background; inherits the surface by default.',
  ],
  footerBackground: [
    '底部操作区域背景；分区外观默认使用淡灰辅助面。',
    'Footer background; divided surfaces use the muted surface by default.',
  ],
  dividerColor: [
    '分区分隔线颜色；默认从边框和表面颜色派生。',
    'Section divider color, derived from border and surface colors by default.',
  ],
  borderColor: ['外层边框与分区分隔线颜色。', 'Color of outer borders and section dividers.'],
  children: ['子内容。', 'Child content.'],
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
  panelVariant: [
    '面板外观；card 在柔和画布上以内嵌内容卡呈现。',
    'Panel appearance; card places the content on an inset surface above a muted canvas.',
  ],
  getPopupContainer: [
    '返回浮层的挂载容器，也可返回 ShadowRoot。',
    'Return a popup container, including a ShadowRoot.',
  ],
  maskBlur: [
    '启用 Modal 和 Drawer 等背景遮罩模糊，默认关闭；嵌套时继承，关闭可减少渲染开销。',
    'Enable background mask blur for Modal and Drawer; disabled by default and inherited by nested providers. Disable to reduce rendering cost.',
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
  minuteStep: [
    '分钟段步进与分钟列间隔，保留已有的非步长值。',
    'Minute segment step and column interval, retaining existing off-step values.',
  ],
  secondStep: [
    '秒段步进与秒列间隔，保留已有的非步长值。',
    'Second segment step and column interval, retaining existing off-step values.',
  ],
  minTime: [
    '最早可选时间（含边界），格式为 HH:mm 或 HH:mm:ss。',
    'Earliest selectable time, inclusive, as HH:mm or HH:mm:ss.',
  ],
  maxTime: [
    '最晚可选时间（含边界），格式为 HH:mm 或 HH:mm:ss。',
    'Latest selectable time, inclusive, as HH:mm or HH:mm:ss.',
  ],
  needConfirm: [
    '要求点击确定或按 Enter 提交；开启后失焦放弃草稿。',
    'Require OK or Enter to commit; discard the draft on blur when enabled.',
  ],
  defaultTime: [
    'datetime 模式下新选开始、结束日期使用的时间，格式为 HH:mm[:ss]。',
    'Times applied to newly picked start and end dates in datetime mode, as HH:mm[:ss].',
  ],
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
const choicePopupWidth = [
  '浮层宽度；trigger 与触发控件等宽，auto 按内容定宽（可比控件窄），数字为固定像素值，也支持 CSS 长度。',
  'Popup width; trigger matches the trigger, auto fits content (and may be narrower), numbers specify fixed pixels; CSS lengths are also supported.',
];
const choicePopupMaxWidth = [
  '可选的浮层最大宽度；未设置时不额外限制，仍受可视区域限制。',
  'Optional maximum popup width; no additional limit when unset, still bounded by the viewport.',
];
const tableStripedDescription = [
  '默认从第二行开始展示交替行背景，并隐藏行间分割线；关闭时显示行间细线。',
  'Alternating backgrounds start from the second row and hide row dividers by default. Disable to show fine row dividers.',
];
const tableBleedDescription = [
  '直接嵌入 Card 正文或内嵌标签页面板时，让表格区域左右贴边；工具栏与分页补回相同的横向内边距。额外布局容器内不自动延伸，Card 外无延伸量。',
  'Extend the table to the content edges when placed directly in a Card body or integrated tab panel. Toolbar and pagination restore matching horizontal padding. Additional layout wrappers and standalone tables have no automatic extension.',
];
const tableHeightDescription = [
  '表格视口最大高度，表头始终固定，表体在内部滚动；虚拟模式未指定时使用 400。',
  'Maximum table viewport height. Headers always stay fixed while the body scrolls internally; virtual mode defaults to 400 when omitted.',
];
const localPaginationDescription = [
  '是否让 TanStack 在本地切分当前页数据；关闭时保留分页状态和分页器，但直接展示传入的行。',
  'Whether TanStack slices rows into local pages. Disable it to keep pagination state and controls while rendering all supplied rows.',
];
const paginationReference =
  '<a href="pagination.html#pagination-api" target="_blank" rel="noopener noreferrer">Pagination API</a>';
const tablePaginationDescription = [
  `分页器开关或展示参数，参见 ${paginationReference}；直接传入数据时，false 同时关闭本地切页。`,
  `Pagination visibility or display options; see ${paginationReference}. With direct data input, false also disables local slicing.`,
];
const selectionModeDescription = [
  '单选只保留最近请求的一个 key；多选保留全部已选 key。',
  'Single keeps only the most recently requested key; multiple keeps every selected key.',
];
const selectedRowKeysDescription = [
  '受控的已选业务行 key，数组顺序决定单选模式保留哪一项。',
  'Controlled selected business row keys; array order determines which key single mode retains.',
];
const selectedResultKeysDescription = [
  '当前已选业务行 key；受控时来自 selectedRowKeys，非受控时来自内部状态。',
  'Current selected business row keys; sourced from selectedRowKeys when controlled, otherwise from internal state.',
];
const defaultSelectedRowKeysDescription = [
  '非受控模式的初始已选业务行 key。',
  'Initial selected business row keys for uncontrolled usage.',
];
const onSelectedRowKeysChangeDescription = [
  '选择变化时返回规范化、去重后的字符串 key。',
  'Called with normalized, unique string keys whenever selection changes.',
];
const specificDefaults = {
  'FormFieldProps.controlAlign': ['继承 Form', 'Inherited from Form'],
  'FormFieldProps.settingsControlWidth': ['继承 Form', 'Inherited from Form'],
  'FormProps.settingsControlWidth': ['`clamp(200px, 40%, 280px)`', '`clamp(200px, 40%, 280px)`'],
  'ConfirmOptions.type': "`'info'`",
  'ScrollAreaProps.persistent': '`false`',
  'ScrollAreaProps.scrollbar': "`'auto'`",
  'ScrollAreaProps.verticalOffset': '`0`',
  'ScrollAreaProps.size': "`'md'`",
  'SplitterProps.defaultSizes': ['各面板等分', 'Equal shares'],
  'SplitterPanel.min': '`5`',
  'SplitterPanel.max': '`100`',
  'LeafTheme.headingWeight': '`700`',
  'MessageOptions.duration': ['普通消息 3；loading 为 0', '3 normally; 0 for loading'],
  'MessageProps.duration': ['普通消息 3；loading 为 0', '3 normally; 0 for loading'],
  'MessageOptions.type': "`'info'`",
  'MessageProps.type': "`'info'`",
  'MessageOptions.closable': '`false`',
  'MessageProps.closable': '`false`',
  'NotificationOptions.duration': '`4.5`',
  'NotificationOptions.key': ['自动生成', 'Generated'],
  'NotificationProps.duration': '`4.5`',
  'NotificationOptions.placement': "`'top-right'`",
  'NotificationProps.placement': "`'top-right'`",
  'NotificationOptions.closable': '`true`',
  'NotificationProps.closable': '`true`',
  'TourProps.current': '—',
  'TourStep.placement': "`'bottom'`",
  'CarouselProps.activeIndex': '—',
  'CollapseProps.activeKey': '—',
  'CollapseProps.defaultActiveKey': '`[]`',
  'DateRangePickerProps.value': '—',
  'TimePickerModeProps.value': '—',
  'TimePickerModeProps.size': "`'md'`",
  'TimePickerModeProps.allowClear': '`true`',
  'TimeRangePickerModeProps.value': '—',
  'TimeRangePickerModeProps.size': "`'md'`",
  'TimeRangePickerModeProps.allowClear': '`true`',
  'UploadProps.fileList': '—',
  'FormValidationOptions.focusError': '`true`',
  'FormErrorSummaryProps.title': ['语言默认值', 'Localized default'],
  'ResultProps.title': '—',
  'ResultProps.description': '—',
  'FloatButtonProps.variant': "`'solid'`",
  'TabsProps.activeKey': '—',
  'DatePickerProps.value': '—',
  'DatePickerProps.needConfirm': '`picker === "datetime"`',
  'DatePickerProps.panelVariant': "`'plain'`",
  'SingleDatePickerProps.needConfirm': '`picker === "datetime"`',
  'DateRangePickerProps.needConfirm': '`picker === "datetime"`',
  'DateRangePickerProps.panelVariant': "`'plain'`",
  'CalendarDateRangePickerProps.needConfirm': '`picker === "datetime"`',
  'TimePickerModeProps.panelVariant': "`'plain'`",
  'TimeRangePickerModeProps.panelVariant': "`'plain'`",
  'ScrollbarProps.persistent': '`false`',
  'DateRangePickerProps.defaultTime': "`['00:00:00', '23:59:59']`",
  'InputNumberProps.value': '—',
  'ColorPickerProps.value': '—',
  'TreeProps.selectedKeys': '—',
  'TreeProps.checkedKeys': '—',
  'TreeProps.expandedKeys': '—',
  'LeafThemeTokens.onPrimaryColor': '`#ffffff`',
  'LeafThemeTokens.onSuccessColor': '`#ffffff`',
  'LeafThemeTokens.onDangerColor': '`#ffffff`',
  'LeafThemeTokens.onWarningColor': '`#ffffff`',
  'LeafThemeTokens.onInfoColor': '`#ffffff`',
  'LeafThemeTokens.neutralColor': '`#6c737e`',
  'AutoCompleteProps.value': '—',
  'AutoCompleteProps.defaultOpen': '`false`',
  'AutoCompleteProps.optionHeight': ['由主题和密度计算', 'Theme and density dependent'],
  'AutoCompleteProps.virtual': [
    '过滤后超过 100 项时启用',
    'Enabled above 100 filtered suggestions',
  ],
  'InputMaskProps.value': '—',
  'InputOTPProps.value': '—',
  'CascaderProps.value': '—',
  'CascaderProps.defaultValue': '`[]`',
  'CascaderProps.defaultOpen': '`false`',
  'TransferProps.value': '—',
  'TransferProps.selectedKeys': '—',
  'TreeProps.itemHeight': ['由主题和密度计算', 'Theme and density dependent'],
  'RadioProps.value': '—',
  'RateProps.value': '—',
  'RateProps.color': '—',
  'RateProps.colors': "`['#ef5350', '#f49b23', '#ffc53d']`",
  'SelectProps.value': '—',
  'SelectProps.defaultValue': "`multiple ? [] : ''`",
  'SelectProps.optionHeight': ['由主题和密度计算', 'Theme and density dependent'],
  'SelectProps.defaultOpen': '`false`',
  'TreeSelectProps.value': '—',
  'TreeSelectProps.defaultValue': '`null`',
  'TreeSelectProps.itemHeight': ['由主题和密度计算', 'Theme and density dependent'],
  'TreeSelectProps.maxCount': '`Infinity`',
  'TreeSelectProps.defaultOpen': '`false`',
  'MentionsProps.value': '—',
  'MentionsProps.prefixes': "`['@']`",
  'SliderProps.value': '—',
  'SliderProps.defaultValue': '`range ? [min, max] : min`',
  'DescriptionsProps.columns': '`{ xs: 1, md: 2, lg: 3 }`',
  'DescriptionItem.span': '`1`',
  'BreadcrumbProps.maxItems': '`Infinity`',
  'DropdownProps.open': '—',
  'TooltipProps.open': '—',
  'PopoverProps.open': '—',
  'DataTableProps.table': '—',
  'DataTableProps.data': ['未传 table 时必填', 'Required without table'],
  'DataTableProps.columns': ['未传 table 时必填', 'Required without table'],
  'DataTableProps.rowKey': ['未传 table 时必填', 'Required without table'],
  'DataTablePaginationProps.showSizeChanger': '`true`',
  'DataTablePaginationProps.size': 'DataTable size',
  'UseDataTableSelectionOptions.mode': '`multiple`',
  'UseDataTableSelectionOptions.defaultSelectedRowKeys': '`[]`',
};
function specificDefault(name, property, english) {
  const value = specificDefaults[`${name}.${property}`];
  return Array.isArray(value) ? value[english ? 1 : 0] : value;
}
// Difference-only tables link to the shared API instead of repeating its properties.
const modeProperties = {
  DataTablePaginationProps: ['hasNextPage'],
  SingleDatePickerProps: ['value', 'defaultValue', 'onChange'],
  NumericInputNumberProps: [
    'stringMode',
    'value',
    'defaultValue',
    'onChange',
    'min',
    'max',
    'step',
    'formatter',
    'parser',
  ],
  StringInputNumberProps: [
    'stringMode',
    'value',
    'defaultValue',
    'onChange',
    'min',
    'max',
    'step',
    'formatter',
    'parser',
  ],
};
const removedProperties = new Set([
  'CascaderProps.children',
  'DataTableProps.children',
  'DataTablePresentationProps.children',
]);
const apiSectionOrder = {
  'components/avatar': ['AvatarProps', 'AvatarGroupProps'],
  'components/config-provider': ['ConfigProviderProps', 'LeafTheme'],
  'components/scroll-area': ['ScrollAreaProps'],
  'components/scrollbar': ['ScrollbarProps'],
  'components/virtual-list': ['VirtualListProps', 'VirtualListHandle'],
  'components/infinite-scroll': ['InfiniteScrollProps'],
  'components/masonry': ['MasonryProps'],
  'components/splitter': ['SplitterProps', 'SplitterPanel'],
  'components/layout': ['LayoutProps', 'LayoutSiderProps'],
  'components/back-top': ['BackTopProps'],
  'components/float-button': ['FloatButtonProps', 'FloatButtonGroupProps', 'FloatButtonAction'],
  'components/message': ['MessageApi', 'MessageOptions', 'MessageProps', 'MessageProviderProps'],
  'components/notification': [
    'NotificationApi',
    'NotificationOptions',
    'NotificationProps',
    'NotificationProviderProps',
  ],
  'components/tour': ['TourProps', 'TourStep'],
  'components/carousel': ['CarouselProps', 'CarouselHandle'],
  'components/collapse': ['CollapseProps', 'CollapseItem'],
  'components/timeline': ['TimelineProps', 'TimelineItem'],
  'components/qr-code': ['QRCodeProps'],
  'components/error-boundary': ['ErrorBoundaryProps', 'ErrorBoundaryFallbackProps'],
  'components/image': [
    'ImagePreviewApi',
    'ImagePreviewOptions',
    'ImagePreviewItem',
    'ImagePreviewProviderProps',
  ],
  'components/calendar': ['CalendarProps'],
  'components/date-picker': [
    'DatePickerProps',
    'SingleDatePickerProps',
    'DatePreset',
    'TimePickerModeProps',
    'TimeParts',
  ],
  'components/date-range-picker': ['DateRangePickerProps', 'TimeRangePickerModeProps'],
  'components/form': [
    'FormProps',
    'FormFieldProps',
    'FormGroupProps',
    'FormListProps',
    'FormListField',
    'FormListOperations',
    'FormErrorSummaryProps',
    'FormError',
    'FormValidationApi',
    'FormValidationOptions',
  ],
  'components/upload': [
    'UploadProps',
    'UploadHandle',
    'UploadFile',
    'UploadChangeInfo',
    'UploadRejection',
    'UploadRequest',
    'UploadResult',
  ],
  'components/file-list': ['FileListProps', 'FileItem'],
  'components/modal': ['ModalProps'],
  'components/drawer': ['DrawerProps'],
  'components/confirm': ['ConfirmApi', 'ConfirmOptions', 'ConfirmProviderProps'],
  'components/grid': ['GridProps', 'RowProps', 'ColProps'],
  'components/descriptions': ['DescriptionsProps', 'DescriptionItem'],
  'components/anchor': ['AnchorProps', 'AnchorItem', 'AffixProps'],
  'components/breadcrumb': ['BreadcrumbProps', 'BreadcrumbItem'],
  'components/steps': ['StepsProps', 'StepItem'],
  'components/tabs': ['TabsProps', 'TabItem'],
  'components/dropdown': ['DropdownProps', 'DropdownItem'],
  'components/select': ['SelectProps', 'SelectOption', 'SelectOptionGroup'],
  'components/mentions': ['MentionsProps', 'MentionOption'],
  'components/tree-select': ['TreeSelectProps', 'TreeSelectOption'],
  'components/auto-complete': [
    'AutoCompleteProps',
    'AutoCompleteOption',
    'AutoCompleteOptionGroup',
  ],
  'components/cascader': ['CascaderProps', 'CascaderOption', 'CascaderFieldNames'],
  'components/transfer': ['TransferProps', 'TransferItem', 'TransferChangeInfo'],
  'components/tree': [
    'TreeProps',
    'TreeNode',
    'TreeSelectInfo',
    'TreeCheckInfo',
    'TreeExpandInfo',
    'TreeDropInfo',
  ],
};
const apiPropertyOrder = {
  BadgeProps: ['children', 'count', 'max', 'showZero', 'dot', 'placement', 'color'],
  TagProps: ['children', 'color', 'variant', 'size', 'icon', 'closable', 'onClose'],
  DataTableProps: ['data', 'columns', 'rowKey', 'options', 'localPagination', 'table'],
  ConfigProviderProps: [
    'locale',
    'translations',
    'theme',
    'density',
    'components',
    'direction',
    'weekStartsOn',
    'getPopupContainer',
    'maskBlur',
  ],
  LeafTheme: [
    'primaryColor',
    'appearance',
    'borderRadius',
    'controlHeight',
    'fontSize',
    'fontFamily',
    'motion',
    'spacing',
    'lineHeight',
    'headingWeight',
    'elevation',
    'breakpoints',
    'tokens',
    'components',
  ],
  ScrollAreaProps: [
    'height',
    'maxHeight',
    'orientation',
    'scrollbar',
    'persistent',
    'size',
    'verticalOffset',
    'viewportClassName',
    'viewportStyle',
    'contentClassName',
    'contentStyle',
  ],
  ScrollbarProps: [
    'height',
    'maxHeight',
    'orientation',
    'scrollbar',
    'persistent',
    'size',
    'verticalOffset',
    'viewportClassName',
    'viewportStyle',
    'contentClassName',
    'contentStyle',
  ],
  VirtualListProps: [
    'items',
    'itemKey',
    'renderItem',
    'height',
    'estimateSize',
    'overscan',
    'horizontal',
    'emptyContent',
  ],
  VirtualListHandle: ['element', 'scrollToIndex', 'scrollToOffset'],
  InfiniteScrollProps: [
    'dataLength',
    'hasMore',
    'onLoadMore',
    'target',
    'threshold',
    'loader',
    'endMessage',
    'onError',
  ],
  MasonryProps: ['columns', 'gap'],
  SplitterProps: ['panels', 'sizes', 'defaultSizes', 'onResize', 'onResizeEnd', 'direction'],
  SplitterPanel: ['key', 'children', 'min', 'max', 'collapsible', 'resizable'],
  LayoutSiderProps: [
    'collapsed',
    'defaultCollapsed',
    'onCollapse',
    'width',
    'collapsedWidth',
    'collapsible',
    'trigger',
    'breakpoint',
  ],
  BackTopProps: ['target', 'visibilityHeight', 'behavior'],
  FloatButtonProps: [
    'tooltip',
    'fixed',
    'variant',
    'size',
    'danger',
    'loading',
    'disabled',
    'startIcon',
    'endIcon',
    'fullWidth',
  ],
  FloatButtonGroupProps: [
    'actions',
    'open',
    'defaultOpen',
    'onOpenChange',
    'expandable',
    'fixed',
    'icon',
    'className',
  ],
  FloatButtonAction: ['key', 'label', 'icon', 'onClick', 'disabled'],
  MessageApi: ['open', 'success', 'info', 'warning', 'danger', 'error', 'loading', 'close'],
  MessageOptions: ['content', 'type', 'duration', 'closable', 'key', 'onClose'],
  MessageProps: ['open', 'content', 'type', 'duration', 'closable', 'onClose', 'afterClose'],
  NotificationApi: ['open', 'success', 'info', 'warning', 'danger', 'error', 'close'],
  NotificationOptions: [
    'title',
    'description',
    'type',
    'actions',
    'duration',
    'placement',
    'closable',
    'key',
    'onClose',
    'icon',
  ],
  NotificationProps: [
    'open',
    'title',
    'description',
    'type',
    'actions',
    'duration',
    'placement',
    'closable',
    'onClose',
    'afterClose',
    'icon',
  ],
  TourProps: [
    'open',
    'steps',
    'current',
    'defaultCurrent',
    'onChange',
    'onClose',
    'onFinish',
    'missingTarget',
    'mask',
    'padding',
    'getPopupContainer',
  ],
  TourStep: ['title', 'description', 'target', 'placement', 'key'],
  CarouselProps: [
    'children',
    'activeIndex',
    'defaultActiveIndex',
    'onChange',
    'arrows',
    'dots',
    'infinite',
    'autoplay',
    'pauseOnHover',
  ],
  CollapseProps: [
    'items',
    'activeKey',
    'defaultActiveKey',
    'onChange',
    'accordion',
    'disabled',
    'size',
    'bordered',
    'destroyInactive',
  ],
  CollapseItem: ['key', 'label', 'children', 'disabled', 'extra'],
  TimelineProps: ['items', 'mode', 'pending', 'reverse'],
  TimelineItem: ['key', 'children', 'label', 'color', 'dot'],
  QRCodeProps: [
    'value',
    'size',
    'status',
    'onRefresh',
    'downloadable',
    'fileName',
    'level',
    'logo',
    'logoSize',
    'color',
    'backgroundColor',
  ],
  ErrorBoundaryProps: ['children', 'fallback', 'onReset', 'resetKeys', 'onError'],
  CalendarProps: [
    'value',
    'defaultValue',
    'onChange',
    'mode',
    'fullscreen',
    'minDate',
    'maxDate',
    'disabledDate',
    'visibleDate',
    'onVisibleChange',
    'showToday',
    'cellRender',
    'headerExtra',
  ],
  DatePickerProps: [
    'picker',
    'value',
    'defaultValue',
    'onChange',
    'placeholder',
    'size',
    'status',
    'disabled',
    'readOnly',
    'inputReadOnly',
    'allowClear',
    'minDate',
    'maxDate',
    'disabledDate',
    'minTime',
    'maxTime',
    'disabledTime',
    'needConfirm',
    'showSeconds',
    'use12Hours',
    'minuteStep',
    'secondStep',
    'format',
    'parse',
    'presets',
    'showToday',
    'todayText',
    'renderExtraFooter',
    'panelValue',
    'onPanelChange',
    'cellRender',
    'open',
    'defaultOpen',
    'onOpenChange',
    'panelVariant',
    'name',
    'form',
    'required',
  ],
  DateRangePickerProps: [
    'picker',
    'value',
    'defaultValue',
    'onChange',
    'onCalendarChange',
    'allowEmpty',
    'placeholder',
    'size',
    'status',
    'disabled',
    'readOnly',
    'inputReadOnly',
    'allowClear',
    'minDate',
    'maxDate',
    'disabledDate',
    'minTime',
    'maxTime',
    'disabledTime',
    'allowOvernight',
    'needConfirm',
    'showSeconds',
    'use12Hours',
    'minuteStep',
    'secondStep',
    'defaultTime',
    'format',
    'parse',
    'presets',
    'panelValue',
    'onPanelChange',
    'cellRender',
    'open',
    'defaultOpen',
    'onOpenChange',
    'panelVariant',
    'name',
    'form',
    'required',
  ],
  TimePickerModeProps: [
    'picker',
    'value',
    'defaultValue',
    'onChange',
    'size',
    'status',
    'allowClear',
    'inputReadOnly',
    'minTime',
    'maxTime',
    'disabledTime',
    'needConfirm',
    'showSeconds',
    'use12Hours',
    'minuteStep',
    'secondStep',
    'open',
    'defaultOpen',
    'onOpenChange',
    'panelVariant',
  ],
  TimeRangePickerModeProps: [
    'picker',
    'value',
    'defaultValue',
    'onChange',
    'size',
    'status',
    'allowClear',
    'inputReadOnly',
    'minTime',
    'maxTime',
    'disabledTime',
    'allowOvernight',
    'needConfirm',
    'showSeconds',
    'use12Hours',
    'minuteStep',
    'secondStep',
    'open',
    'defaultOpen',
    'onOpenChange',
    'panelVariant',
  ],
  FormProps: [
    'layout',
    'labelWidth',
    'labelAlign',
    'controlAlign',
    'settingsControlWidth',
    'disabled',
  ],
  FormFieldProps: [
    'label',
    'children',
    'htmlFor',
    'required',
    'help',
    'error',
    'layout',
    'labelWidth',
    'labelAlign',
    'controlAlign',
    'settingsControlWidth',
  ],
  UploadProps: [
    'fileList',
    'defaultFileList',
    'onChange',
    'accept',
    'multiple',
    'maxCount',
    'maxSize',
    'beforeUpload',
    'onReject',
    'disabled',
    'drag',
    'paste',
    'directory',
    'autoUpload',
    'concurrency',
    'action',
    'customRequest',
    'method',
    'headers',
    'data',
    'withCredentials',
    'fieldName',
    'showFileList',
    'listType',
    'onRemove',
    'hint',
    'children',
    'name',
    'form',
    'required',
  ],
  FileListProps: [
    'items',
    'listType',
    'previewable',
    'downloadable',
    'removable',
    'onPreview',
    'onDownload',
    'onRemove',
    'disabled',
    'renderActions',
    'emptyContent',
  ],
  FileItem: ['uid', 'name', 'url', 'size', 'type', 'originFile', 'status', 'percent', 'error'],
  ModalProps: [
    'open',
    'title',
    'description',
    'children',
    'onClose',
    'onConfirm',
    'onCancel',
    'confirmText',
    'cancelText',
    'confirmLoading',
    'confirmButtonProps',
    'cancelButtonProps',
    'footer',
    'icon',
    'divided',
    'width',
    'closable',
    'maskClosable',
    'keyboard',
    'initialFocus',
    'returnFocus',
    'afterClose',
    'destroyOnClose',
    'preserve',
    'forceRender',
    'container',
  ],
  DrawerProps: [
    'open',
    'title',
    'description',
    'children',
    'onClose',
    'placement',
    'width',
    'height',
    'footer',
    'extra',
    'icon',
    'divided',
    'closable',
    'maskClosable',
    'keyboard',
    'initialFocus',
    'returnFocus',
    'resizable',
    'minSize',
    'maxSize',
    'onResize',
    'push',
    'afterClose',
    'destroyOnClose',
    'preserve',
    'forceRender',
    'container',
  ],
  ConfirmOptions: [
    'title',
    'children',
    'onConfirm',
    'onCancel',
    'type',
    'icon',
    'confirmText',
    'cancelText',
    'showCancel',
    'confirmButtonProps',
    'cancelButtonProps',
    'width',
    'closable',
    'maskClosable',
    'keyboard',
    'initialFocus',
    'returnFocus',
    'className',
    'style',
  ],
  CascaderProps: [
    'options',
    'value',
    'defaultValue',
    'onChange',
    'multiple',
    'placeholder',
    'size',
    'status',
    'disabled',
    'readOnly',
    'allowClear',
    'showSearch',
    'changeOnSelect',
    'tagWrap',
    'maxTagCount',
    'displayRender',
    'optionRender',
    'loadData',
    'onLoadError',
    'cacheKey',
    'open',
    'defaultOpen',
    'onOpenChange',
    'popupWidth',
    'popupMaxWidth',
    'name',
    'form',
    'required',
  ],
  TransferProps: [
    'items',
    'value',
    'defaultValue',
    'onChange',
    'selectedKeys',
    'onSelectionChange',
    'titles',
    'disabled',
    'searchable',
    'filterOption',
    'oneWay',
    'renderItem',
    'virtual',
    'height',
    'name',
    'form',
    'required',
  ],
  TreeProps: [
    'data',
    'selectedKeys',
    'defaultSelectedKeys',
    'onSelect',
    'multiple',
    'selectable',
    'checkable',
    'checkStrictly',
    'checkedKeys',
    'defaultCheckedKeys',
    'onCheck',
    'expandedKeys',
    'defaultExpandedKeys',
    'defaultExpandAll',
    'onExpand',
    'disabled',
    'showLine',
    'showIcon',
    'searchValue',
    'filterTreeNode',
    'notFoundContent',
    'loadData',
    'onLoad',
    'onLoadError',
    'cacheKey',
    'nodeRender',
    'draggable',
    'allowDrop',
    'onDrop',
    'virtual',
    'height',
    'itemHeight',
  ],
  InputMaskProps: [
    'mask',
    'value',
    'defaultValue',
    'onChange',
    'onComplete',
    'unmask',
    'lazy',
    'definitions',
    'placeholder',
    'size',
    'status',
    'disabled',
    'allowClear',
  ],
  InputOTPProps: [
    'length',
    'value',
    'defaultValue',
    'onChange',
    'onComplete',
    'mode',
    'mask',
    'separator',
    'size',
    'status',
    'disabled',
  ],
  AutoCompleteProps: [
    'options',
    'value',
    'defaultValue',
    'onChange',
    'onSelect',
    'onSearch',
    'placeholder',
    'size',
    'status',
    'disabled',
    'readOnly',
    'allowClear',
    'filterOption',
    'loading',
    'errorContent',
    'notFoundContent',
    'optionRender',
    'open',
    'defaultOpen',
    'onOpenChange',
    'virtual',
    'listHeight',
    'optionHeight',
    'popupWidth',
    'popupMaxWidth',
  ],
  SelectProps: [
    'options',
    'value',
    'defaultValue',
    'onChange',
    'multiple',
    'placeholder',
    'size',
    'status',
    'disabled',
    'allowClear',
    'showSearch',
    'filterOption',
    'onSearch',
    'loading',
    'notFoundContent',
    'maxCount',
    'maxTagCount',
    'tagWrap',
    'allowCreate',
    'onCreate',
    'labelRender',
    'optionRender',
    'tagRender',
    'open',
    'defaultOpen',
    'onOpenChange',
    'inputReadOnly',
    'virtual',
    'listHeight',
    'optionHeight',
    'popupWidth',
    'popupMaxWidth',
    'onPopupScroll',
  ],
  MentionsProps: [
    'options',
    'value',
    'defaultValue',
    'onChange',
    'onSelect',
    'prefixes',
    'split',
    'onSearch',
    'loading',
    'notFoundContent',
    'popupWidth',
    'popupMaxWidth',
  ],
  TreeSelectProps: [
    'options',
    'value',
    'defaultValue',
    'onChange',
    'multiple',
    'treeCheckable',
    'checkStrictly',
    'showCheckedStrategy',
    'placeholder',
    'size',
    'status',
    'disabled',
    'allowClear',
    'showSearch',
    'onSearch',
    'filterTreeNode',
    'notFoundContent',
    'maxCount',
    'maxTagCount',
    'tagWrap',
    'defaultExpandAll',
    'treeDefaultExpandedKeys',
    'treeExpandedKeys',
    'onExpand',
    'loadData',
    'onLoadError',
    'cacheKey',
    'nodeRender',
    'open',
    'defaultOpen',
    'onOpenChange',
    'inputReadOnly',
    'virtual',
    'listHeight',
    'itemHeight',
    'popupWidth',
    'popupMaxWidth',
  ],
  DropdownProps: [
    'items',
    'children',
    'trigger',
    'disabled',
    'size',
    'open',
    'defaultOpen',
    'onOpenChange',
    'onSelect',
    'placement',
    'popupWidth',
    'popupMaxWidth',
    'itemRender',
    'mouseEnterDelay',
    'mouseLeaveDelay',
  ],
  TooltipProps: [
    'content',
    'children',
    'placement',
    'disabled',
    'open',
    'defaultOpen',
    'onOpenChange',
    'enterDelay',
    'leaveDelay',
    'className',
  ],
  PopoverProps: [
    'title',
    'content',
    'children',
    'trigger',
    'placement',
    'disabled',
    'open',
    'defaultOpen',
    'onOpenChange',
    'autoFocus',
    'aria-label',
    'width',
    'maxWidth',
    'enterDelay',
    'leaveDelay',
    'className',
    'style',
  ],
  PopconfirmProps: [
    'title',
    'description',
    'children',
    'onConfirm',
    'onCancel',
    'onError',
    'type',
    'icon',
    'confirmText',
    'cancelText',
    'showCancel',
    'confirmButtonProps',
    'cancelButtonProps',
    'disabled',
    'open',
    'defaultOpen',
    'onOpenChange',
    'placement',
    'aria-label',
    'width',
    'maxWidth',
    'enterDelay',
    'leaveDelay',
    'className',
    'style',
  ],
};
const specificTypes = {
  'RadioProps.value': 'string | number | readonly string[]',
  'TreeSelectProps.multiple': 'boolean',
  'TreeSelectProps.treeCheckable': 'boolean',
  'TreeSelectProps.onChange':
    '((value: string | null) => void) | ((value: readonly string[]) => void)',
  'ResultProps.status': "'empty' | 'success' | 'info' | 'warning' | 'danger' | 'error'",
  'UseDataTableSelectionOptions.selectedRowKeys': 'readonly DataTableRowSelectionKey[]',
  'UseDataTableSelectionOptions.defaultSelectedRowKeys': 'readonly DataTableRowSelectionKey[]',
};
const specific = {
  'FormProps.layout': [
    '字段默认布局；settings 将标签与描述放在左侧，将控件放在右侧控件列。',
    'Default field layout; settings places labels and descriptions on the left and controls in a right-side control column.',
  ],
  'FormProps.controlAlign': [
    'settings 字段控件在右侧控件列中的对齐方向。',
    'Control alignment within the control column of settings fields.',
  ],
  'FormProps.settingsControlWidth': [
    'settings 右侧控件列宽度；数字按像素处理，字符串接受 CSS 长度、百分比或 clamp() 等函数。',
    'Width of the settings control column; numbers use pixels and strings accept CSS lengths, percentages, or functions such as clamp().',
  ],
  'FormFieldProps.controlAlign': [
    '当前 settings 字段的控件对齐方向。',
    'Override control alignment for this settings field.',
  ],
  'FormFieldProps.settingsControlWidth': [
    '当前 settings 字段的控件列宽度。',
    'Override the control-column width for this settings field.',
  ],
  'FormProps.labelWidth': [
    'horizontal 字段的标签宽度，单位像素；可由 FormField.labelWidth 单独覆盖。',
    'Label width in pixels for horizontal fields; FormField.labelWidth can override individual fields.',
  ],
  'MenuProps.variant': [
    '选中项外观：中性、浮起或主题色。',
    'Selection appearance: neutral, raised or primary.',
  ],
  'MenuGroupProps.children': ['分组中的菜单项。', 'Menu items in this group.'],
  'DividerProps.children': ['显示在分割线中的内容。', 'Content displayed within the divider.'],
  'LoadingProps.children': ['被加载遮罩覆盖的内容。', 'Content covered by the loading overlay.'],
  'LeafTheme.primaryColor': [
    '主题基色，浅深外观共用；交互色自动派生。',
    'Primary base color shared by light and dark appearances; interaction colors are derived automatically.',
  ],
  'ScrollAreaProps.size': [
    '滚动条尺寸；sm 使用较窄轨道。',
    'Scrollbar size; sm uses a narrower track.',
  ],
  'InfiniteScrollProps.dataLength': [
    '已加载数量；数据追加后更新，允许下一次加载。',
    'Loaded item count; update after appending data to allow another load.',
  ],
  'InfiniteScrollProps.hasMore': [
    '是否还有后续数据；false 中止当前任务的 signal 并显示结束内容。',
    'Whether more data remains; false aborts the active task signal and displays the end content.',
  ],
  'InfiniteScrollProps.onLoadMore': [
    '返回加载任务的 Promise；应用追加数据并传递或检查取消信号，拒绝时暂停自动加载并显示重试。',
    'Return the loading Promise; append data and pass on or check the cancellation signal. Rejection pauses automatic loading and shows Retry.',
  ],
  'InfiniteScrollProps.target': [
    '返回滚动容器；省略或返回 null 时查找最近的纵向滚动祖先，否则使用视口。',
    'Return the scroll container; when omitted or null, use the nearest vertically scrollable ancestor, otherwise the viewport.',
  ],
  'InfiniteScrollProps.threshold': [
    '距离末尾多少像素时预加载；负值按 0 处理。',
    'Preload within this pixel distance from the end; negative values are treated as zero.',
  ],
  'InfiniteScrollProps.onError': [
    '加载 Promise 拒绝且任务未取消时调用；不替应用恢复数据。',
    'Called when the loading Promise rejects without cancellation; does not restore application data.',
  ],
  'MasonryProps.columns': [
    '列数或视口断点配置；未指定的断点继承更小断点。',
    'Column count or viewport breakpoint map; omitted breakpoints inherit smaller ones.',
  ],
  'MasonryProps.gap': [
    '列间距与条目纵向间距；数字为 px，也支持 CSS 长度。',
    'Column and vertical item gaps; numbers are pixels and CSS lengths are supported.',
  ],
  'SplitterProps.sizes': [
    '受控的面板比例；有效数组归一为 100，配合 onResize 更新。',
    'Controlled panel proportions; a valid array is normalized to 100. Update with onResize.',
  ],
  'SplitterProps.defaultSizes': [
    '非受控初始比例；省略、数量不匹配或总和无效时等分。',
    'Initial uncontrolled proportions; omitted, mismatched or invalid totals use equal shares.',
  ],
  'SplitterProps.onResize': [
    '拖动、方向键或折叠引起比例变化时返回新比例。',
    'Called with new proportions after dragging, arrow keys or collapsing changes sizes.',
  ],
  'SplitterProps.onResizeEnd': [
    '拖动结束、方向键调整或折叠 / 恢复后调用。',
    'Called after dragging ends, a keyboard adjustment, or collapse/restore.',
  ],
  'SplitterPanel.collapsible': [
    '允许通过本面板后的手柄折叠 / 恢复，与下一面板交换空间；末面板无手柄。',
    "Allow collapse/restore through this panel's following handle, exchanging space with the next panel; the last panel has no handle.",
  ],
  'SplitterPanel.resizable': [
    'false 禁止手柄拖动并将其移出 Tab 顺序。',
    'False disables handle dragging and removes it from the Tab order.',
  ],
  'LayoutSiderProps.collapsed': [
    '受控的手动折叠状态；断点仍可强制折叠。',
    'Controlled manual collapse state; the breakpoint may still force a collapsed presentation.',
  ],
  'LayoutSiderProps.defaultCollapsed': [
    '非受控模式的初始手动折叠状态。',
    'Initial manual collapse state in uncontrolled mode.',
  ],
  'LayoutSiderProps.onCollapse': [
    '手动切换时返回下一状态；响应断点不触发此回调。',
    'Called with the next state on manual toggling; breakpoint changes do not call it.',
  ],
  'LayoutSiderProps.breakpoint': [
    '视口宽度不大于此像素值时折叠并隐藏内置触发器，不修改手动状态。',
    'Collapse and hide the built-in trigger when viewport width is at or below this pixel value, without changing manual state.',
  ],
  'BackTopProps.target': [
    '返回滚动容器；省略或返回 null 时使用 window。',
    'Return the scroll container; omitted or null uses window.',
  ],
  'BackTopProps.visibilityHeight': [
    '滚动距离大于或等于此像素值时显示。',
    'Show when the scroll distance is at or above this pixel value.',
  ],
  'BackTopProps.behavior': [
    '回顶滚动方式；关闭动效或偏好减少动态效果时使用 auto。',
    'Scroll-to-top behavior; auto is used when motion is disabled or reduced motion is preferred.',
  ],
  'BackTopProps.onClick': [
    '点击时调用；event.preventDefault() 阻止内置回顶。',
    'Called on click; event.preventDefault() prevents the built-in scroll-to-top action.',
  ],
  'FloatButtonGroupProps.actions': [
    '按数组顺序排列的操作；点击后调用对应 onClick，可展开的组随后关闭。',
    'Actions in array order; activating one calls its onClick, then closes an expandable group.',
  ],
  'FloatButtonGroupProps.open': [
    '受控的展开状态，配合 onOpenChange 更新。',
    'Controlled expanded state; update with onOpenChange.',
  ],
  'FloatButtonGroupProps.onOpenChange': [
    '触发器、组外点击、Escape 或操作项请求改变展开状态时调用。',
    'Called when the trigger, outside pointer, Escape or an action requests an expanded-state change.',
  ],
  'FloatButtonAction.label': [
    '操作提示；字符串也作为按钮的可访问名称，其他内容使用 key 作为名称。',
    'Action tooltip; strings also label the button accessibly, while other content uses key as the accessible name.',
  ],
  ...Object.fromEntries(
    ['MessageOptions', 'MessageProps'].flatMap((name) => [
      [
        `${name}.duration`,
        [
          '自动关闭的秒数；0 或负数不自动关闭。悬停或焦点进入时暂停，离开后继续剩余时间。',
          'Seconds before automatic closing; zero or negative values keep it open. Hover or focus pauses the remaining time.',
        ],
      ],
      [
        `${name}.onClose`,
        [
          '关闭请求时调用；声明式 Message 须由应用将 open 设为 false。',
          'Called when closing is requested; declarative Message requires the application to set open to false.',
        ],
      ],
    ]),
  ),
  ...Object.fromEntries(
    ['NotificationOptions', 'NotificationProps'].flatMap((name) => [
      [
        `${name}.duration`,
        [
          '自动关闭的秒数；0 或负数不自动关闭。悬停或焦点进入时暂停，离开后继续剩余时间。',
          'Seconds before automatic closing; zero or negative values keep it open. Hover or focus pauses the remaining time.',
        ],
      ],
      [
        `${name}.actions`,
        [
          '通知内的后续操作；应用负责执行业务并按当前 key 关闭通知。',
          'Follow-up actions; the application performs the work and closes this notification by its key.',
        ],
      ],
      [
        `${name}.onClose`,
        [
          '关闭请求时调用；声明式 Notification 须由应用将 open 设为 false。',
          'Called when closing is requested; declarative Notification requires the application to set open to false.',
        ],
      ],
    ]),
  ),
  'MessageOptions.key': [
    '同一 Provider 内的唯一标识；重复 open 会替换该条消息并重启关闭计时，不追加新消息。',
    'Unique key within a Provider; opening the same key replaces that message and restarts its dismissal timer instead of appending.',
  ],
  'NotificationOptions.key': [
    '同一 Provider 内的唯一标识；重复 open 会替换该条通知并重启关闭计时，不追加新通知。',
    'Unique key within a Provider; opening the same key replaces that notification and restarts its dismissal timer instead of appending.',
  ],
  'MessageApi.open': [
    '打开或按 key 替换消息，返回该消息的 key。',
    'Open or replace a message by key, returning its key.',
  ],
  'MessageApi.loading': [
    '显示不自动关闭的加载消息，返回 key；应用负责更新或关闭。',
    'Show a loading message without automatic dismissal and return its key; the application updates or closes it.',
  ],
  'MessageApi.close': [
    '关闭指定 key；不传 key 会关闭同一 Provider 内的全部消息，不限于当前调用组件。',
    "Close a key; omitting it closes every message in the same Provider, not only this caller's messages.",
  ],
  'MessageProps.afterClose': [
    '关闭动画结束、内容卸载后调用，不代替 onClose 更新受控值。',
    'Called after the closing animation and content unmount; does not replace updating controlled state in onClose.',
  ],
  'MessageProviderProps.children': [
    '共享此独立消息队列的内容；ConfigProvider 已提供队列，嵌套 ConfigProvider 复用上层队列。',
    'Contents sharing this independent message queue; ConfigProvider already supplies one, reused by nested ConfigProviders.',
  ],
  'NotificationApi.open': [
    '打开或按 key 替换通知，返回该通知的 key。',
    'Open or replace a notification by key, returning its key.',
  ],
  'NotificationApi.close': [
    '关闭指定 key；不传 key 会关闭同一 Provider 内的全部通知，不限于当前调用组件。',
    "Close a key; omitting it closes every notification in the same Provider, not only this caller's notifications.",
  ],
  'NotificationProps.afterClose': [
    '关闭动画结束、内容卸载后调用，不代替 onClose 更新受控值。',
    'Called after the closing animation and content unmount; does not replace updating controlled state in onClose.',
  ],
  'NotificationProviderProps.maxCount': [
    '此队列的最大同时显示数量；挂载时设置，超过时关闭最早的通知。',
    'Maximum visible notifications in this queue, set on mount; exceeding it closes the oldest notifications.',
  ],
  'NotificationProviderProps.children': [
    '共享此独立通知队列的内容；ConfigProvider 已提供队列，嵌套 ConfigProvider 复用上层队列。',
    'Contents sharing this independent notification queue; ConfigProvider already supplies one, reused by nested ConfigProviders.',
  ],
  'TourProps.current': [
    '受控步骤索引，从 0 开始；应用须在 onChange 中回写，重开时不会自动归零。',
    'Controlled zero-based step index; write onChange results back to it. Reopening does not automatically reset it.',
  ],
  'TourProps.defaultCurrent': [
    '非受控模式的初始步骤索引，从 0 开始。',
    'Initial zero-based step index for uncontrolled usage.',
  ],
  'TourProps.onClose': [
    '关闭请求，包含关闭按钮、Escape、完成及缺失目标策略；应用须将 open 设为 false。',
    'Close request from the close button, Escape, finishing or missing-target policy; the application must set open to false.',
  ],
  'TourProps.onFinish': [
    '最后一步点击完成时调用，随后仍调用 onClose。',
    'Called when Finish is clicked on the last step, followed by onClose.',
  ],
  'TourProps.missingTarget': [
    '进入步骤时找不到目标的处理：center 居中显示，skip 跳过且末步请求关闭，close 直接请求关闭。',
    'When entering a step without a target: center displays it centrally, skip advances or requests closing at the last step, and close requests closing immediately.',
  ],
  'TourProps.mask': [
    '显示遮罩并限制背景交互；false 允许继续操作页面。',
    'Show a mask and restrict background interaction; false keeps the page interactive.',
  ],
  'TourProps.padding': [
    '目标高亮区域与目标元素之间的像素间隔。',
    'Gap in pixels between the target element and its highlighted area.',
  ],
  'TourStep.target': [
    '目标元素的选择器或返回元素的函数；未设置时使用 missingTarget 策略。',
    'Target selector or function returning an element; when omitted, missingTarget policy applies.',
  ],
  'CarouselProps.activeIndex': [
    '受控的当前页索引，从 0 开始，须在 onChange 中回写。',
    'Controlled zero-based slide index; write onChange results back to it.',
  ],
  'CarouselProps.defaultActiveIndex': [
    '非受控模式的初始页索引，从 0 开始。',
    'Initial zero-based index for uncontrolled usage.',
  ],
  'CarouselProps.onChange': [
    '请求切换时返回从 0 开始的索引。',
    'Return the requested zero-based slide index.',
  ],
  'CarouselProps.autoplay': [
    '自动播放；true 使用 4000ms，非零数字设置间隔且至少 500ms。关闭动画或页面隐藏时不前进。',
    'Autoplay; true uses 4000ms, and a nonzero number sets an interval of at least 500ms. Does not advance with motion disabled or the page hidden.',
  ],
  'CarouselProps.pauseOnHover': [
    '悬停时暂停自动播放；焦点进入时始终暂停，不受此参数影响。',
    'Pause autoplay on hover; focus inside always pauses it regardless of this option.',
  ],
  'CarouselHandle.goTo': [
    '切换到从 0 开始的索引；循环模式取模，非循环模式限制在有效范围内。',
    'Navigate to a zero-based index; wraps in infinite mode and clamps to the valid range otherwise.',
  ],
  'CollapseProps.activeKey': [
    '受控展开项；可传字符串或数组，手风琴模式只取第一项。',
    'Controlled open keys as a string or array; accordion mode keeps only the first.',
  ],
  'CollapseProps.defaultActiveKey': [
    '非受控模式的初始展开项。',
    'Initial open keys for uncontrolled usage.',
  ],
  'CollapseProps.onChange': [
    '展开项变化时始终返回字符串数组；全部关闭返回空数组。',
    'Always return a string array of open keys; an empty array means all are closed.',
  ],
  'CollapseProps.destroyInactive': [
    '退出动画后卸载关闭的内容；默认保留访问过的内容，未访问项延迟挂载。',
    'Unmount closed contents after the exit animation; visited contents are preserved by default, with unvisited items mounted lazily.',
  ],
  'CollapseItem.label': ['可展开标题。', 'Expandable item heading.'],
  'CollapseItem.children': ['展开后的内容。', 'Contents shown when expanded.'],
  'CollapseItem.disabled': [
    '禁止通过标题切换展开，不禁用 extra 中的独立操作。',
    'Prevent heading toggles without disabling independent extra actions.',
  ],
  'TimelineProps.reverse': [
    '反转 items 顺序；pending 仍追加在末尾。',
    'Reverse items; pending is still appended at the end.',
  ],
  'TimelineProps.pending': [
    '末尾待办内容；传 null 或 undefined 不显示，false 和空字符串仍保留节点。',
    'Pending content appended at the end; null or undefined omits it, while false and empty strings still retain a node.',
  ],
  'TimelineItem.children': ['事件主体内容。', 'Main event content.'],
  'TimelineItem.label': ['次要说明，通常为时间。', 'Secondary label, typically a timestamp.'],
  'TimelineItem.dot': [
    '装饰性自定义节点；重要状态须在正文中用文字说明。',
    'Decorative custom dot; explain important status in the event text.',
  ],
  'QRCodeProps.value': ['二维码编码的文本或链接。', 'Text or URL encoded in the QR code.'],
  'QRCodeProps.size': [
    '正方形二维码的像素尺寸，最小 64。',
    'Square QR-code size in pixels, with a minimum of 64.',
  ],
  'QRCodeProps.status': [
    '展示正常、加载或过期状态；不自动加载或计算过期时间。',
    'Display active, loading or expired state without loading data or calculating expiration.',
  ],
  'QRCodeProps.onRefresh': [
    '点击过期状态的刷新按钮时调用；应用负责更新 value 和 status。',
    'Called when the expired-state refresh button is clicked; the application updates value and status.',
  ],
  'QRCodeProps.downloadable': [
    '显示下载操作，导出 SVG 文件。',
    'Show the download action, exporting an SVG file.',
  ],
  'QRCodeProps.fileName': [
    '下载文件名，包含扩展名。',
    'Download filename, including its extension.',
  ],
  'ErrorBoundaryProps.fallback': [
    '捕获错误后的替代内容；默认显示错误 Result 和重试按钮。函数形式接收 error 和 reset。',
    'Fallback after a caught error; defaults to an error Result with Retry. The function receives error and reset.',
  ],
  'ErrorBoundaryProps.resetKeys': [
    '发生错误后逐项以 Object.is 浅比较；长度或项目变化会重置边界。',
    'After an error, shallow-compare entries with Object.is; a changed length or entry resets the boundary.',
  ],
  'ErrorBoundaryProps.onReset': [
    '手动或 resetKeys 重置时同步调用；应用须修复致错数据，组件不等待异步结果。',
    'Called synchronously on manual or resetKeys resets; repair the failing data in the application. Async results are not awaited.',
  ],
  'ErrorBoundaryProps.onError': [
    '捕获渲染或生命周期错误后接收 Error 与 React ErrorInfo，可用于上报。',
    'Receive the Error and React ErrorInfo after a render or lifecycle error is caught, for reporting.',
  ],
  'ErrorBoundaryFallbackProps.error': ['捕获到的 Error。', 'Caught Error.'],
  'ErrorBoundaryFallbackProps.reset': [
    '同步调用 onReset 后清除错误并重新渲染子树，不自动重做业务请求。',
    'Call onReset synchronously, clear the error and rerender the subtree without automatically repeating business requests.',
  ],
  'ImagePreviewItem.download': [
    '外层 downloadable 开启时，false 禁用本项下载，字符串替换下载地址，其余使用 src。跨域下载需要 CORS。',
    'With downloadable enabled, false disables this download, a string overrides its URL, otherwise src is used. Cross-origin downloads require CORS.',
  ],
  'ImagePreviewItem.width': [
    '可选的原图像素宽度，用于载入前的尺寸提示；实际以加载后的自然尺寸为准。',
    'Optional original width in pixels for initial layout before loading; natural dimensions take precedence after loading.',
  ],
  'ImagePreviewItem.height': [
    '可选的原图像素高度，用于载入前的尺寸提示；实际以加载后的自然尺寸为准。',
    'Optional original height in pixels for initial layout before loading; natural dimensions take precedence after loading.',
  ],
  'ImagePreviewOptions.onClose': [
    '预览结束时调用，包括用户关闭、返回的关闭函数、同 Provider 替换和调用方卸载。',
    'Called when preview ends, including user closing, the returned close function, replacement in the same Provider and caller unmount.',
  ],
  'ModalProps.title': ['弹窗标题。', 'Dialog title.'],
  'DrawerProps.title': ['抽屉标题。', 'Drawer title.'],
  'ModalProps.onConfirm': [
    '默认确认按钮的操作，可返回 Promise；等待期间阻止重复确认和默认关闭。成功后应用仍须更新 open。',
    'Default confirm-button action, optionally returning a Promise; blocks repeated confirmation and built-in closing while pending. The application must still update open after success.',
  ],
  'ModalProps.onCancel': [
    '取消按钮、关闭按钮、遮罩或 Escape 请求关闭时调用；省略时调用 onClose。',
    'Called when Cancel, the close button, the mask or Escape requests closing; falls back to onClose.',
  ],
  'ModalProps.initialFocus': [
    '指定初始焦点；默认聚焦首个可聚焦元素，可能是关闭按钮。',
    'Specify initial focus; defaults to the first focusable element, which may be the close button.',
  ],
  ...Object.fromEntries(
    ['ModalProps', 'DrawerProps'].flatMap((name) => [
      [
        `${name}.open`,
        ['受控的打开状态，应用负责更新。', 'Controlled open state, updated by the application.'],
      ],
      [
        `${name}.destroyOnClose`,
        [
          '关闭后卸载内容；preserve 优先，forceRender 会保持挂载。',
          'Unmount contents after closing; preserve takes precedence and forceRender keeps contents mounted.',
        ],
      ],
      [
        `${name}.preserve`,
        [
          '指定是否保留内容，优先于 destroyOnClose；不重置组件外的受控状态。',
          'Control content preservation, taking precedence over destroyOnClose; does not reset external controlled state.',
        ],
      ],
      [
        `${name}.container`,
        [
          '指定 Portal 挂载目标，也可返回 ShadowRoot。',
          'Portal mount target; may also return a ShadowRoot.',
        ],
      ],
    ]),
  ),
  'DrawerProps.closable': ['显示关闭按钮。', 'Show the close button.'],
  'DrawerProps.maskClosable': ['点击遮罩时请求关闭。', 'Request closing when the mask is clicked.'],
  'DrawerProps.keyboard': ['允许按 Escape 请求关闭。', 'Allow Escape to request closing.'],
  'DrawerProps.push': [
    '推动最近的父弹层；true 使用 40px，数字指定距离。',
    'Push the nearest parent overlay; true uses 40px and a number specifies the distance.',
  ],
  'DrawerProps.onResize': [
    '用户拖动或键盘调整时返回新尺寸；width 或 height 改变会重置手动尺寸。',
    'Return the new size on pointer or keyboard resizing; changing width or height resets the manual size.',
  ],
  'ConfirmApi.confirm': [
    '等待决定并返回 boolean；确认成功为 true，取消或调用区域卸载为 false，不等待关闭动画。',
    'Resolve to a boolean on decision: true after successful confirmation, false on cancellation or caller unmount, without waiting for the closing animation.',
  ],
  'ConfirmProviderProps.children': [
    '共用此独立确认队列的内容；ConfigProvider 已自动提供队列，嵌套 ConfigProvider 不另建队列。',
    'Contents sharing this independent confirmation queue; ConfigProvider already supplies a queue and nested ConfigProviders reuse it.',
  ],
  'CalendarProps.value': [
    '受控的选中日期，与 visibleDate 独立。',
    'Controlled selected date, independent of visibleDate.',
  ],
  'CalendarProps.defaultValue': [
    '非受控模式的初始选中日期。',
    'Initial selected date for uncontrolled usage.',
  ],
  'CalendarProps.onChange': [
    '选择日期时调用；month 模式返回所选月的第一天。',
    'Called on selection; month mode returns the first day of the selected month.',
  ],
  'CalendarProps.visibleDate': [
    '受控的显示月份，不代表选中日期。',
    'Controlled visible month, not the selected date.',
  ],
  'CalendarProps.onVisibleChange': [
    '显示月份变化时返回新月份的第一天；不触发选择。',
    'Return the first day when the visible month changes, without selecting a date.',
  ],
  'CalendarProps.showToday': [
    '显示回到今天的操作，仅切换显示月份，不改变选中值。',
    'Show navigation to today; changes the visible month without selecting a date.',
  ],
  'CalendarProps.cellRender': [
    '自定义单元格内容；内容位于选择按钮内，不要嵌套交互控件。',
    'Customize cell contents inside the selection button; do not nest interactive controls.',
  ],
  'DateRangePickerProps.value': [
    '受控区间；日期模式使用 Date 元组，allowEmpty 允许空端点；纯时间使用 24 小时制字符串元组。整个空值为 null。',
    'Controlled range: a Date tuple for date modes, with nullable endpoints when allowEmpty is enabled; a 24-hour string tuple for time. The empty range is null.',
  ],
  'DateRangePickerProps.defaultValue': [
    '非受控初始区间，类型由 picker 决定；表单重置时恢复。',
    'Initial uncontrolled range matching picker, restored on native form reset.',
  ],
  'DateRangePickerProps.onCalendarChange': [
    '日期面板草稿、时间或端点清除变化时调用，不代表提交；文本输入和快捷项不保证触发。',
    'Called for date-panel draft, time and endpoint-clear changes, not a commit; text input and presets do not necessarily call it.',
  ],
  'DateRangePickerProps.disabledDate': [
    '限制可选端点，不检查区间内的每一天；position 区分开始与结束。',
    'Restrict endpoints, not every date inside the range; position identifies start or end.',
  ],
  'DateRangePickerProps.disabledTime': [
    '限制端点时间；日期时间模式还接收该端点的 Date。',
    'Restrict endpoint times; datetime mode also receives the endpoint Date.',
  ],
  'SingleDatePickerProps.onChange': [
    '提交选择时返回日期和格式化字符串；清空返回 null 和空字符串。',
    'Return the date and formatted string on commit; clearing returns null and an empty string.',
  ],
  'TimePickerModeProps.value': [
    '受控的 24 小时制 HH:mm 或 HH:mm:ss 字符串；空值为 null。',
    'Controlled 24-hour HH:mm or HH:mm:ss string; null when empty.',
  ],
  'TimePickerModeProps.onChange': [
    '提交时只返回 24 小时制字符串；清空返回 null。',
    'Return only a 24-hour string on commit, or null on clear.',
  ],
  'TimeRangePickerModeProps.value': [
    '受控的 24 小时制字符串元组；整个空值为 null。',
    'Controlled tuple of 24-hour strings; null represents an empty range.',
  ],
  'TimeRangePickerModeProps.onChange': [
    '提交时返回 24 小时制字符串元组；清空返回 null。',
    'Return a tuple of 24-hour strings on commit, or null on clear.',
  ],
  'FormListProps.name': [
    '字段名前缀；将 field.name 用于实际控件，点号名称不自动生成嵌套对象。',
    'Field-name prefix; use field.name on the actual control. Dotted names do not construct nested objects.',
  ],
  'FormListField.value': ['该行当前值。', 'Current value of this row.'],
  'FormErrorSummaryProps.title': [
    '错误汇总标题，默认使用当前语言的提示。',
    'Error-summary heading, localized by default.',
  ],
  'UploadProps.name': [
    '原生 FormData 字段名；每项提交 File 或 URL 字符串，同名多项用 getAll() 读取。',
    'Native FormData field name; entries submit Files or URL strings. Read repeated entries with getAll().',
  ],
  'UploadProps.fieldName': [
    'POST 上传请求中的文件字段名，与原生表单的 name 不同。',
    'File field name in the POST upload request, distinct from native form name.',
  ],
  'UploadProps.required': [
    '要求列表至少有一项，不保证文件已经上传成功。',
    'Require at least one list entry, not a successfully uploaded file.',
  ],
  'UploadProps.multiple': [
    '允许一次选择多个文件；限制列表总数使用 maxCount。',
    'Allow multiple files per selection; use maxCount to limit total entries.',
  ],
  'UploadProps.beforeUpload': [
    '接收前校验或转换文件；false 或异常表示拒绝。返回的替换文件不会重新执行类型和大小检查。',
    'Validate or transform before acceptance; false or rejection refuses the file. Replacement files are not rechecked for type and size.',
  ],
  'UploadProps.customRequest': [
    '自定义上传，优先于 action；成功时 resolve，失败时 reject，并响应 signal 取消请求。',
    'Custom transport taking precedence over action; resolve on success, reject on failure and honor signal cancellation.',
  ],
  'UploadProps.action': [
    '上传地址；未配置 action 和 customRequest 时仅选择文件。',
    'Upload URL; files are only selected when neither action nor customRequest is configured.',
  ],
  'UploadProps.onRemove': [
    '移除前调用；返回 false 或拒绝 Promise 可阻止移除。',
    'Called before removal; false or a rejected Promise prevents removal.',
  ],
  'UploadChangeInfo.file': [
    '本次变化关联的文件；批量添加时为最后一个接收的文件。',
    'File associated with this change; for batch addition, the last accepted file.',
  ],
  'FileListProps.onRemove': [
    '等待移除回调，期间阻止重复点击；应用须更新 items。布尔返回值不控制列表，Promise 拒绝显示行内错误。',
    'Await removal and prevent repeated clicks; the application must update items. Boolean results do not control the list; Promise rejection shows an inline error.',
  ],
  'FileListProps.onPreview': [
    '替换有可用 URL 的图片、视频和音频预览操作；其他文件或无 URL 时不显示预览按钮。',
    'Replace preview for images, video and audio with a usable URL; other files and entries without a URL have no preview button.',
  ],
  'FileListProps.onDownload': [
    '有可用 URL 时替换内置下载操作；无 URL 不显示下载按钮。',
    'Replace built-in download for a usable URL; no download button appears without a URL.',
  ],
  'FileListProps.renderActions': [
    '自定义行操作；应用负责自定义操作的名称与禁用处理。',
    'Customize row actions; provide accessible names and disabled handling for custom actions.',
  ],
  'FileItem.name': [
    '显示文件名；省略时依次取 originFile.name、URL 文件名和 File；data URL 不用于推导名称。',
    'Display name; falls back to originFile.name, the URL filename, then File. Data URLs do not provide a filename.',
  ],
  'FileItem.size': [
    '文件大小，单位字节；缺省时使用 originFile.size，两者都缺省时隐藏。',
    'Size in bytes; falls back to originFile.size and is hidden only when both are absent.',
  ],
  'FileItem.type': [
    '可选 MIME 类型；展示分类还会参考 originFile.type 和扩展名，不回填此字段。',
    'Optional MIME type; display classification also checks originFile.type and the extension without filling this field.',
  ],
  ...Object.fromEntries(
    ['DropdownProps', 'TooltipProps', 'PopoverProps'].flatMap((name) => [
      [`${name}.open`, ['受控的展开状态。', 'Controlled open state.']],
      [
        `${name}.defaultOpen`,
        ['非受控模式的初始展开状态。', 'Initial open state for uncontrolled usage.'],
      ],
    ]),
  ),
  'BreadcrumbItem.target': [
    '链接的打开目标，遵循原生 a 元素的 target。',
    'Link target, following the native anchor target attribute.',
  ],
  'AnchorProps.container': [
    '返回滚动容器；省略时使用 window。',
    'Return the scroll container; defaults to window.',
  ],
  'AffixProps.container': [
    '返回滚动容器；省略时使用 window。',
    'Return the scroll container; defaults to window.',
  ],
  'StepsProps.percent': [
    '当前步骤图标内的进度（0–100）；点状模式不显示。',
    'Progress inside the current step icon (0–100); not displayed in dot mode.',
  ],
  'TabsProps.size': ['标签尺寸。', 'Tab size.'],
  'BreadcrumbProps.maxItems': [
    '超过此项数时折叠中间路径；最小阈值为 3，默认不折叠。',
    'Collapse middle entries above this count; the minimum threshold is 3 and entries do not collapse by default.',
  ],
  'DropdownItem.group': [
    '单选项所属的互斥组标识。',
    'Mutual-exclusion group identifier for radio items.',
  ],
  'DropdownItem.label': ['菜单项文字或分组标题。', 'Item label or group heading.'],
  'DropdownItem.type': [
    '普通项、分隔线、分组、复选项或单选项。',
    'Regular item, divider, group, checkbox or radio item.',
  ],
  'DropdownItem.icon': ['菜单项文字前的图标。', 'Icon before the item label.'],
  'DropdownItem.danger': [
    '危险操作的颜色，不会禁用菜单项。',
    'Destructive-action colors without disabling the item.',
  ],
  'DropdownItem.checked': [
    '受控的勾选状态；省略时由菜单内部保存。',
    'Controlled checked state; stored internally when omitted.',
  ],
  'DropdownItem.closeOnSelect': [
    '选择后是否关闭；默认普通项关闭，单选和复选项保持打开。',
    'Whether selection closes the menu; regular items close by default, radio and checkbox items stay open.',
  ],
  'DropdownProps.onSelect': [
    '激活叶菜单项时返回 key，包括单选和复选项；展开子菜单不触发。',
    'Called with the activated leaf item key, including radio and checkbox items; opening a submenu does not call it.',
  ],
  'DropdownProps.itemRender': [
    '自定义菜单项的标签内容，不替换整行。',
    'Customize the item label content, not the whole row.',
  ],
  'DropdownProps.placement': [
    '菜单位置；popupPlacement 优先。',
    'Menu placement; popupPlacement takes precedence.',
  ],
  'PopoverProps.autoFocus': [
    '点击模式打开后聚焦首个可聚焦元素，没有时聚焦面板；悬停模式不移动焦点。',
    'In click mode, focus the first focusable element or the panel if none exists; hover mode does not move focus.',
  ],
  'PopoverProps.aria-label': [
    '没有可见标题时，提供浮层的可访问名称。',
    'Accessible name for a popover without a visible title.',
  ],
  'PopoverProps.title': ['浮层标题。', 'Popover title.'],
  'PopoverProps.content': [
    '浮层内容；交互内容使用点击模式。',
    'Popover content; use click mode for interactive content.',
  ],
  'PopoverProps.width': ['浮层宽度；数字为像素。', 'Popover width; numbers are pixels.'],
  'PopoverProps.maxWidth': [
    '浮层最大宽度；数字为像素。',
    'Maximum popover width; numbers are pixels.',
  ],
  'PopoverProps.className': ['浮层面板的 CSS 类名。', 'CSS class applied to the popover panel.'],
  'PopoverProps.style': ['浮层面板的内联样式。', 'Inline styles applied to the popover panel.'],
  'TooltipProps.content': [
    '提示内容；为空字符串、null 或 undefined 时不显示。',
    'Tooltip content; empty strings, null and undefined suppress the tooltip.',
  ],
  'TooltipProps.disabled': [
    '禁止显示提示，不禁用触发元素。',
    'Suppress the tooltip without disabling its trigger.',
  ],
  'PopconfirmProps.aria-label': [
    '确认浮层的可访问名称；默认使用字符串标题或当前语言的确认名称。',
    'Accessible name of the confirmation panel; defaults to a string title or the localized confirmation label.',
  ],
  ...Object.fromEntries(
    ['TooltipProps', 'PopoverProps'].flatMap((name) => [
      [
        `${name}.enterDelay`,
        ['悬停后等待多少毫秒再打开。', 'Delay in milliseconds before opening on hover.'],
      ],
      [
        `${name}.leaveDelay`,
        [
          '指针离开后等待多少毫秒再关闭。',
          'Delay in milliseconds before closing after pointer leave.',
        ],
      ],
    ]),
  ),
  'PopconfirmProps.onConfirm': [
    '确认操作，可返回 Promise；成功关闭，失败时保留浮层并显示内置重试提示。',
    'Confirmation action, optionally returning a Promise; success closes the panel, failure keeps it open with built-in retry feedback.',
  ],
  'PopconfirmProps.onError': [
    '确认失败后调用，可补充应用反馈；组件仍显示内置错误提示。',
    'Called after confirmation fails to provide additional application feedback; built-in error feedback remains visible.',
  ],
  'SpaceProps.size': [
    '子元素间距；数字为像素，数组为 [行间距, 列间距]。',
    'Space between children; numbers are pixels and tuples are [row gap, column gap].',
  ],
  'SpaceProps.split': [
    '相邻元素间的装饰性分隔内容，不放交互控件。',
    'Decorative content between items; do not place interactive controls here.',
  ],
  'DescriptionsProps.columns': [
    '列数；响应式配置按视口宽度生效，较大断点继承较小断点。',
    'Column count; responsive settings follow viewport width and inherit smaller breakpoints.',
  ],
  'DescriptionItem.children': ['字段值。', 'Field value.'],
  'DescriptionItem.label': ['字段名称。', 'Field name.'],
  'DescriptionItem.span': [
    '字段占用的列数；最小为 1，最多为当前列数。',
    'Columns occupied by the field, from 1 up to the current column count.',
  ],
  'StatisticProps.value': ['要展示的数值或文字。', 'Number or text to display.'],
  'AvatarProps.src': ['头像图片地址。', 'Avatar image URL.'],
  'AvatarProps.srcSet': ['响应式图片候选。', 'Responsive image candidates.'],
  'AvatarProps.icon': ['没有图片时显示的图标。', 'Icon displayed without an image.'],
  'AvatarProps.children': [
    '没有图片时显示的文字或内容。',
    'Text or content displayed without an image.',
  ],
  'CountdownProps.onChange': [
    '更新时返回剩余毫秒数，完成后返回 0。',
    'Called with remaining milliseconds on each update, or 0 when finished.',
  ],
  'CountdownProps.onFinish': [
    '当前截止时间到达时调用一次；完成提示由应用提供。',
    'Called once for the current deadline; the application provides completion feedback.',
  ],
  'CheckboxProps.checked': ['受控的勾选状态。', 'Controlled checked state.'],
  'CheckboxProps.defaultChecked': [
    '非受控模式的初始勾选状态。',
    'Initial checked state for uncontrolled usage.',
  ],
  'CheckboxOption.value': ['选项值；同一组内应唯一。', 'Option value; unique within the group.'],
  'RadioProps.checked': ['受控的选中状态。', 'Controlled checked state.'],
  'RadioProps.defaultChecked': [
    '非受控模式的初始选中状态。',
    'Initial checked state for uncontrolled usage.',
  ],
  'RadioProps.required': [
    '要求同名的单选框中至少选中一项。',
    'Require a selection among radios with the same name.',
  ],
  'SwitchProps.checked': ['受控的开关状态。', 'Controlled switch state.'],
  'SwitchProps.defaultChecked': [
    '非受控模式的初始开关状态。',
    'Initial switch state for uncontrolled usage.',
  ],
  'SwitchProps.onChange': [
    '从 event.target.checked 读取开关状态。',
    'Read the switch state from event.target.checked.',
  ],
  'SwitchProps.children': ['可点击的文字标签。', 'Clickable text label.'],
  'RateProps.value': ['受控评分。', 'Controlled rating.'],
  'RateProps.defaultValue': ['非受控模式的初始评分。', 'Initial rating for uncontrolled usage.'],
  'RateProps.onChange': [
    '评分变化时返回新值，清空为 0。',
    'Return the new rating, or 0 when cleared.',
  ],
  'RateProps.name': ['原生 FormData 中的字段名。', 'Field name in native FormData.'],
  'RateProps.form': ['关联的原生表单 ID。', 'ID of the associated native form.'],
  'RateProps.required': ['要求评分不为 0。', 'Require a non-zero rating.'],
  'RateProps.readOnly': [
    '禁止修改评分，仍参与表单提交。',
    'Prevent rating changes while retaining form submission.',
  ],
  'RateProps.allowHalf': ['允许按半星选择。', 'Allow half-star ratings.'],
  'RateProps.allowClear': [
    '重复选择当前评分时清空为 0。',
    'Clear to 0 when the current rating is selected again.',
  ],
  'RateProps.color': [
    '固定评分颜色，优先于 colorByValue；均未设置时使用金色。',
    'Fixed rating color, taking precedence over colorByValue; gold when neither is set.',
  ],
  'SkeletonProps.loading': [
    '展示占位；false 时才渲染 children。',
    'Show placeholders; children render only when false.',
  ],
  'SkeletonProps.active': ['启用占位动画。', 'Animate the placeholders.'],
  'SkeletonProps.avatar': ['展示头像占位。', 'Show an avatar placeholder.'],
  'SkeletonProps.round': [
    '标题和正文占位使用胶囊圆角，不影响头像。',
    'Use pill-shaped title and body placeholders; the avatar is unchanged.',
  ],
  'SkeletonProps.children': ['加载完成后展示的内容。', 'Content shown after loading finishes.'],
  'LoadingBarApi.start': [
    '开始任务，返回仅完成该任务的函数；应在 finally 或取消清理时调用。',
    'Start a task and return its completion function; call it in finally or cancellation cleanup.',
  ],
  'LoadingBarApi.finish': [
    '完成最早的一个待完成任务，全部任务完成后收起；优先使用 start 返回的函数。',
    'Complete the oldest pending task and hide once all finish; prefer the function returned by start.',
  ],
  'LoadingBarApi.set': [
    '设置显示进度，范围 0–100；不启动或完成任务。',
    'Set displayed progress from 0 to 100 without starting or completing a task.',
  ],
  'LoadingBarApi.reset': [
    '清空当前 Provider 的全部任务与进度，不取消实际请求。',
    'Clear all tasks and progress in the current provider without cancelling requests.',
  ],
  'LoadingBarProviderProps.children': [
    '共享此加载条任务作用域的子内容。',
    'Children sharing this loading bar task scope.',
  ],
  'ProgressProps.status': [
    '进度状态；非不确定进度达到 100% 时，normal 自动显示为 success。',
    'Progress state; normal becomes success at 100% unless indeterminate.',
  ],
  'AlertProps.onClose': ['点击关闭按钮时触发。', 'Called when the close button is activated.'],
  'ResultProps.title': [
    '结果标题；未设置时按状态和当前语言显示，null 隐藏。',
    'Result title; defaults to the current status and locale. Set null to hide it.',
  ],
  'ResultProps.description': [
    '补充说明；未设置或为 null 时不显示。',
    'Supporting description; omitted when unset or null.',
  ],
  'ResultProps.children': ['补充结果详情。', 'Additional result details.'],
  'EmptyProps.children': ['底部操作内容。', 'Actions below the empty message.'],
  'ImagePreviewOptions.index': [
    '初始图片索引，从 0 开始。',
    'Initial image index, starting at zero.',
  ],
  'ImagePreviewOptions.onIndexChange': [
    '当前图片切换时调用。',
    'Called when the current image changes.',
  ],
  'ImagePreviewOptions.thumbnails': [
    '显示图片组的缩略图导航，默认 true。',
    'Show gallery thumbnails; defaults to true.',
  ],
  'ImagePreviewOptions.downloadable': [
    '显示下载操作，默认 false。',
    'Show the download action; defaults to false.',
  ],
  'ImagePreviewApi.preview': [
    '预览单张或一组图片，可指定初始索引与预览选项；返回幂等关闭函数。',
    'Preview one image or a gallery with an initial index and options; returns an idempotent close function.',
  ],
  'ImagePreviewProviderProps.children': [
    '可调用 useImagePreview 的内容；ConfigProvider 已自动提供此服务。',
    'Content that can call useImagePreview; ConfigProvider already provides this service.',
  ],
  'DatePickerProps.picker': descriptions.picker,
  'DateRangePickerProps.picker': descriptions.picker,
  'TimePickerModeProps.picker': ['纯时间模式，必须传 time。', 'Time-only mode; pass time.'],
  'TimeRangePickerModeProps.picker': [
    '纯时间区间模式，必须传 time。',
    'Time-only range mode; pass time.',
  ],
  'DatePickerProps.minDate': [
    '最早可选日期；datetime 模式按完整时间戳比较，含边界。',
    'Earliest selectable date; datetime compares the complete timestamp, inclusive.',
  ],
  'DatePickerProps.maxDate': [
    '最晚可选日期；datetime 模式按完整时间戳比较，含边界。',
    'Latest selectable date; datetime compares the complete timestamp, inclusive.',
  ],
  'DatePickerProps.onChange': [
    '提交时调用；日期模式返回 Date 和字符串，纯时间只返回 HH:mm[:ss] 或 null。',
    'Called on commit: Date and formatted string for date modes, only HH:mm[:ss] or null for time.',
  ],
  'DateRangePickerProps.onChange': [
    '提交整个区间时调用；日期模式返回 Date 元组和字符串元组，纯时间返回字符串元组，清空为 null。',
    'Called when committing a range: Date and string tuples for date modes, a string tuple for time, null on clear.',
  ],
  'ScrollbarProps.size': [
    '滚动条尺寸；sm 轨道更窄、颜色更淡，适合密集列表。',
    'Scrollbar size; sm uses a narrower, quieter track for dense lists.',
  ],
  'NumericInputNumberProps.stringMode': [
    '数值模式，省略或传 false；值和回调使用 number。',
    'Numeric mode; omit or pass false. Values and callbacks use numbers.',
  ],
  'StringInputNumberProps.stringMode': [
    '高精度字符串模式，必须传 true；值、步长和边界使用字符串。',
    'High-precision string mode; pass true and use strings for values, steps and bounds.',
  ],
  'DatePreset.value': [
    '快捷项的值或同步取值函数；函数应无副作用，允许多次求值。',
    'Preset value or synchronous function; functions must be pure and allow repeated evaluation.',
  ],
  'SliderProps.min': ['最小值，默认 0。', 'Lower bound, 0 by default.'],
  'SliderProps.max': ['最大值，默认 100。', 'Upper bound, 100 by default.'],
  'SliderProps.step': [
    '每次调整的步长；null 时只允许选择 marks 中的值。',
    'Increment per adjustment; null restricts selection to marks.',
  ],
  'FloatButtonProps.variant': ['按钮外观，默认使用实底。', 'Button appearance; solid by default.'],
  'TabsProps.activeKey': [
    '受控的当前标签 key，配合 onChange 更新。',
    'Controlled active tab key; update it with onChange.',
  ],
  'TabsProps.defaultActiveKey': [
    '非受控模式的初始标签 key，后续变化不重置选中项。',
    'Initial tab key in uncontrolled mode; later changes do not reset the selection.',
  ],
  'DatePickerProps.value': [
    '受控值：日期 / 日期时间为 Date，纯时间为 HH:mm[:ss] 字符串；空值为 null。',
    'Controlled value: Date for dates/date-times, HH:mm[:ss] string for time; null when empty.',
  ],
  'DatePickerProps.defaultValue': [
    '非受控初始值，类型由 picker 决定，表单重置时恢复。',
    'Initial uncontrolled value, matching picker, restored on form reset.',
  ],
  'InputNumberProps.value': [
    '受控数值；stringMode 时使用字符串，空值为 null。',
    'Controlled number, or string in stringMode; null represents an empty field.',
  ],
  'InputNumberProps.defaultValue': [
    '非受控初始值；stringMode 时使用字符串，表单重置时恢复。',
    'Initial uncontrolled value, a string in stringMode; restored on form reset.',
  ],
  'TreeProps.showLine': ['显示节点之间的层级连接线。', 'Show hierarchy connector lines.'],
  'TreeProps.showIcon': [
    '显示默认文件夹或文件图标；节点自定义 icon 不受此开关影响。',
    'Show default folder or file icons; custom node icons are displayed regardless.',
  ],
  'TreeProps.height': [
    '虚拟列表的可视高度，仅 virtual 开启时生效。',
    'Visible height of the virtual list; applies only with virtual enabled.',
  ],
  'TreeProps.itemHeight': [
    '虚拟列表的预估行高；默认由主题和密度计算，实际行会被测量。',
    'Estimated virtual row height, calculated from the theme and density by default; actual rows are measured.',
  ],
  'TreeProps.onSelect': [
    '选择变化时返回选中 key 与节点信息；单选再次激活当前节点可取消选择。',
    'Return selected keys and node information on selection changes; activating the current node again clears single selection.',
  ],
  'TreeProps.onCheck': [
    '返回完整勾选 key 与节点信息；半选 key 位于 info.halfCheckedKeys。',
    'Return all checked keys and node information; half-checked keys are in info.halfCheckedKeys.',
  ],
  'TreeProps.onDrop': [
    '返回放置位置和新树数据，应用须将 info.data 写回 data。',
    'Return the drop position and new tree data; the application must write info.data back to data.',
  ],
  'TreeNode.disabled': [
    '禁止选择、勾选和拖动该节点，但仍可展开。',
    'Prevent selection, checking and dragging for this node; it can still expand.',
  ],
  'TreeNode.checkable': [
    'Tree 开启 checkable 时，设为 false 隐藏该节点复选框并阻断联动。',
    'With Tree checkable enabled, false hides this node checkbox and blocks linked checks.',
  ],
  'TreeNode.isLeaf': [
    'true 标记为叶子节点，不请求异步子项；已提供 children 的节点也不请求。',
    'True marks a leaf and prevents loading children; nodes with supplied children are not loaded either.',
  ],
  'TreeProps.checkStrictly': [
    '勾选时不联动父子节点；配合 checkable 使用。',
    'Keep parent and child checks independent; use with checkable.',
  ],
  'ModalProps.closable': ['显示右上角关闭按钮。', 'Show the close button.'],
  'ModalProps.maskClosable': ['点击遮罩时请求关闭。', 'Request closing when the mask is clicked.'],
  'ModalProps.keyboard': ['允许按 Escape 请求关闭。', 'Allow Escape to request closing.'],
  'TreeProps.selectedKeys': ['受控的选中节点 key 列表。', 'Controlled selected node keys.'],
  'TreeProps.defaultSelectedKeys': [
    '非受控模式的初始选中节点 key 列表。',
    'Initial selected node keys in uncontrolled mode.',
  ],
  'TreeProps.checkedKeys': ['受控的勾选节点 key 列表。', 'Controlled checked node keys.'],
  'TreeProps.defaultCheckedKeys': [
    '非受控模式的初始勾选节点 key 列表。',
    'Initial checked node keys in uncontrolled mode.',
  ],
  'TreeProps.expandedKeys': ['受控的展开节点 key 列表。', 'Controlled expanded node keys.'],
  'TreeProps.defaultExpandedKeys': [
    '非受控模式的初始展开节点 key 列表。',
    'Initial expanded node keys in uncontrolled mode.',
  ],
  'AutoCompleteProps.value': [
    '受控文本；省略时使用内部非受控值。',
    'Controlled text; the internal uncontrolled value is used when omitted.',
  ],
  'AutoCompleteProps.defaultValue': [
    '非受控模式的初始文本；支持表单重置。',
    'Initial text for uncontrolled usage; native form reset is supported.',
  ],
  'AutoCompleteProps.onChange': [
    '输入、清除或选择建议后返回完整文本。',
    'Return the full text after editing, clearing or selecting a suggestion.',
  ],
  'AutoCompleteProps.onSelect': [
    '仅选择建议时触发，返回写入的 value 与完整选项。',
    'Called only when a suggestion is selected, with its inserted value and option.',
  ],
  'AutoCompleteProps.onSearch': [
    '用户输入时返回查询文字；清除时返回空字符串，选择建议不触发。',
    'Return the query on user input, or an empty string on clearing; selecting a suggestion does not call it.',
  ],
  'AutoCompleteProps.open': ['受控的展开状态。', 'Controlled open state.'],
  'AutoCompleteProps.defaultOpen': [
    '非受控模式的初始展开状态。',
    'Initial open state for uncontrolled usage.',
  ],
  'AutoCompleteProps.virtual': [
    '仅渲染可见建议；默认在过滤后建议超过 100 项时启用。',
    'Render only visible suggestions; enabled by default above 100 filtered suggestions.',
  ],
  'AutoCompleteProps.optionHeight': [
    '虚拟列表的预估行高；默认由主题和密度计算，实际行会被测量。',
    'Estimated virtual row height, calculated from the theme and density by default; actual rows are measured.',
  ],
  'AutoCompleteProps.listHeight': [
    '建议面板的最大可视高度。',
    'Maximum visible height of the suggestions panel.',
  ],
  'AutoCompleteOption.value': [
    '唯一建议值；选择后写入输入框。',
    'Unique suggestion value; inserted into the input on selection.',
  ],
  'AutoCompleteOption.label': [
    '建议的显示文字；默认也用于本地过滤。',
    'Visible suggestion label, also used by the default local filter.',
  ],
  'AutoCompleteOption.searchLabel': [
    '搜索纯文本；省略时使用字符串 label，其他内容使用 value。',
    'Plain search text; defaults to a string label, otherwise value.',
  ],
  'AutoCompleteOption.disabled': ['禁用该建议。', 'Disable the suggestion.'],
  'AutoCompleteOptionGroup.label': ['建议分组的标题。', 'Suggestion group heading.'],
  'AutoCompleteOptionGroup.options': ['该分组内的建议。', 'Suggestions in this group.'],
  'CascaderProps.value': [
    '受控路径；省略时使用内部非受控值。',
    'Controlled path; the internal uncontrolled value is used when omitted.',
  ],
  'CascaderProps.defaultValue': [
    '非受控模式的初始路径；支持表单重置。',
    'Initial path for uncontrolled usage; native form reset is supported.',
  ],
  'CascaderProps.onChange': [
    '单选返回路径和对应选项，多选返回路径数组和对应选项数组；选择、取消或清除时触发，清除的两参数均为空数组。',
    'Return a path and its options in single mode or path and option arrays in multiple mode; called on selection, removal or clearing, with two empty arrays when cleared.',
  ],
  'CascaderProps.displayRender': [
    '自定义每条已选路径的显示内容，参数为该路径的标签和选项。',
    'Customize each selected path using its labels and options.',
  ],
  'CascaderProps.name': [
    '原生 FormData 的字段名；非空值提交 JSON 路径，空值提交空字符串。',
    'Native FormData field name; nonempty values submit JSON paths and empty values submit an empty string.',
  ],
  'CascaderProps.open': ['受控的展开状态。', 'Controlled open state.'],
  'CascaderProps.defaultOpen': [
    '非受控模式的初始展开状态。',
    'Initial open state for uncontrolled usage.',
  ],
  'CascaderProps.loadData': [
    '展开 isLeaf 为 false 且未提供 children 的节点时请求子项；使用 signal 处理取消。',
    'Load children when expanding a node with isLeaf false and no supplied children; use signal to handle cancellation.',
  ],
  'TransferProps.value': [
    '受控的右栏项目 key；不是待移动的勾选项。',
    'Controlled right-panel item keys, not the checked items pending a move.',
  ],
  'TransferProps.defaultValue': [
    '非受控模式的初始右栏 key，表单重置时恢复；不重置搜索或临时勾选。',
    'Initial right-panel keys for uncontrolled usage, restored on form reset without resetting searches or pending checks.',
  ],
  'TransferProps.selectedKeys': [
    '受控的待移动勾选 key，可包含两栏项目；勾选本身不会移动项目。',
    'Controlled pending checked keys across both panels; checking does not move items.',
  ],
  'TransferProps.onSelectionChange': [
    '勾选变化或移动后移除已移动的勾选项时，返回当前勾选 key。',
    'Return pending checked keys after checks change or moved keys are removed from the checks.',
  ],
  'TransferProps.onChange': [
    '移动后返回右栏 key，info 包含 direction 与 movedKeys。',
    'Return right-panel keys after a move, with direction and movedKeys in info.',
  ],
  'TransferProps.height': [
    '每栏可滚动列表区域的高度，不包含标题和搜索框。',
    'Height of each scrollable list area, excluding the heading and search field.',
  ],
  'TransferProps.oneWay': [
    '隐藏移回左栏的按钮，右栏仍可搜索和勾选。',
    'Hide the move-left button; the right panel remains searchable and checkable.',
  ],
  'TransferProps.name': [
    '原生 FormData 的字段名；非空值提交 JSON 数组，空值提交空字符串。',
    'Native FormData field name; nonempty values submit a JSON array and empty values submit an empty string.',
  ],
  'CascaderOption.value': [
    '选项值；静态数据同层唯一，异步加载的节点须全树唯一以区分缓存。',
    'Option value; unique among siblings for static data and across the tree for lazy nodes to distinguish caches.',
  ],
  'CascaderOption.label': ['选项的显示内容。', 'Visible option content.'],
  'CascaderOption.searchLabel': [
    '复杂 label 的搜索纯文本。',
    'Plain text used to search a rich label.',
  ],
  'CascaderOption.isLeaf': [
    '明确指定是否为叶子节点；配合懒加载使用。',
    'Identify a leaf node explicitly, including in lazy data.',
  ],
  'CascaderOption.disabled': [
    '禁用该选项及其所有子级。',
    'Disable this option and all descendants.',
  ],
  'CascaderOption.children': ['子选项列表。', 'Child options.'],
  'CascaderFieldNames.value': [
    '选项值在业务对象中的字段名。',
    'Business-object field containing the option value.',
  ],
  'CascaderFieldNames.label': [
    '显示文字在业务对象中的字段名。',
    'Business-object field containing the visible label.',
  ],
  'CascaderFieldNames.children': [
    '子节点数组在业务对象中的字段名。',
    'Business-object field containing the child-node array.',
  ],
  'CascaderFieldNames.disabled': [
    '禁用状态在业务对象中的字段名。',
    'Business-object field containing the disabled state.',
  ],
  'CascaderFieldNames.isLeaf': [
    '叶子标记在业务对象中的字段名。',
    'Business-object field containing the leaf marker.',
  ],
  'RadioOption.label': ['选项的显示内容。', 'Visible option content.'],
  'RadioOption.description': ['选项下方的补充说明。', 'Supporting text below the option.'],
  'RadioOption.icon': ['选项前的图标内容。', 'Leading icon content for the option.'],
  'RadioOption.value': ['选项值；同一组内应唯一。', 'Option value; unique within the group.'],
  'RadioOption.disabled': ['禁用该选项。', 'Disable the option.'],
  'RadioProps.value': [
    '该单选框在表单中提交的值，不是选中状态；选中状态使用 checked。',
    'The value submitted by this radio, not its checked state; use checked for selection.',
  ],
  'RadioGroupProps.value': [
    '受控的选中项 value；省略时使用内部非受控值。',
    'Controlled selected value; the internal uncontrolled value is used when omitted.',
  ],
  'RadioGroupProps.defaultValue': [
    '非受控模式的初始选中值；支持表单重置。',
    'Initial selected value for uncontrolled usage; native form reset is supported.',
  ],
  'SelectProps.value': [
    '受控值；省略时使用内部非受控值。',
    'Controlled value; the internal uncontrolled value is used when omitted.',
  ],
  'SelectProps.defaultValue': [
    '非受控初始值；单选默认为空字符串，多选默认为空数组，表单重置时恢复。',
    'Initial uncontrolled value; defaults to an empty string in single mode or an empty array in multiple mode, restored on form reset.',
  ],
  'SelectProps.onChange': [
    "单选返回值和选项，清除时为 '' 和 undefined；多选返回值数组和选项数组，清除时均为空数组。",
    'Single mode returns the value and option, or an empty string and undefined when cleared; multiple mode returns value and option arrays, both empty when cleared.',
  ],
  'SelectProps.optionHeight': [
    '虚拟列表的预估行高；默认由主题和密度计算，实际行会被测量。',
    'Estimated virtual row height, calculated from the theme and density by default; actual rows are measured.',
  ],
  'SelectProps.allowCreate': [
    '允许选择新建项；查询文字与已有 value 或搜索文字完全相同时不出现新建项，同时启用搜索。',
    'Allow selecting a new option unless the query exactly matches an existing value or search text; also enables search.',
  ],
  'SelectProps.onCreate': [
    '选择新建项后返回该选项；组件内部保留它，需要持久保存时由应用更新 options。',
    'Called with a newly selected option; it is kept internally, while the application updates options for persistence.',
  ],
  'TreeSelectProps.value': [
    '受控值；单选使用字符串或 null，多选或 treeCheckable 使用数组。',
    'Controlled value; use a string or null in single mode and an array with multiple or treeCheckable.',
  ],
  'TreeSelectProps.defaultValue': [
    '非受控初始值，表单重置时恢复；未设置时没有选中项。',
    'Initial uncontrolled value, restored on form reset; no option is selected when omitted.',
  ],
  'TreeSelectProps.onChange': [
    '单选返回字符串或 null，多选返回数组；勾选模式的结果受 showCheckedStrategy 影响。清除保留不可移除的禁用项。',
    'Return a string or null in single mode, or an array in multiple mode; checked results follow showCheckedStrategy. Clearing retains disabled entries that cannot be removed.',
  ],
  'TreeSelectProps.showCheckedStrategy': [
    '联动勾选时输出子节点、父节点或全部节点；同时影响标签、回调和表单值，checkStrictly 时不生效。',
    'Output child, parent or all checked nodes in linked mode, affecting tags, callbacks and form values; ignored with checkStrictly.',
  ],
  'TreeSelectProps.maxCount': [
    '最终输出的选择数量上限；一次联动操作超限时整次不提交。',
    'Maximum number of output values; a linked action that exceeds it is rejected as a whole.',
  ],
  'TreeSelectProps.itemHeight': [
    '虚拟列表的预估行高；默认由主题和密度计算。',
    'Estimated virtual row height, calculated from the theme and density by default.',
  ],
  'MentionsProps.value': ['受控的完整文本。', 'Controlled full text.'],
  'MentionsProps.defaultValue': [
    '非受控的初始文本，表单重置时恢复。',
    'Initial uncontrolled text, restored on form reset.',
  ],
  'MentionsProps.onChange': [
    '输入或选择候选项后返回完整文本，不是原生事件。',
    'Return the full text after editing or selecting an option, not a native event.',
  ],
  'MentionsProps.onSearch': [
    '光标前匹配到前缀和查询文字时触发，返回查询文字与前缀。',
    'Called with the query and prefix when a mention is matched before the caret.',
  ],
  'MentionsProps.onSelect': [
    '选择候选项后返回选项与匹配的前缀。',
    'Called with the selected option and matched prefix.',
  ],
  'MentionsProps.loading': [
    '没有匹配候选项时显示加载提示；已有候选项仍可选择。',
    'Show loading feedback when no option matches; existing matches remain selectable.',
  ],
  'MentionOption.value': [
    '选择后插入的文字，前面保留匹配前缀，后面追加 split。',
    'Text inserted after the matched prefix and before split.',
  ],
  'InputMaskProps.value': [
    '受控值；unmask 决定使用原始值还是格式化显示值。',
    'Controlled value; unmask selects an unmasked value or the formatted display value.',
  ],
  'InputMaskProps.defaultValue': [
    '非受控初始值，格式遵循 unmask，表单重置时恢复。',
    'Initial uncontrolled value in the format selected by unmask, restored on form reset.',
  ],
  'InputMaskProps.onChange': [
    '返回组件值与格式化显示值；第一个参数受 unmask 影响，第二个始终是显示值。',
    'Return the component value and formatted display value; unmask affects only the first argument.',
  ],
  'InputMaskProps.onComplete': [
    '用户输入使格式完整时触发，值格式遵循 unmask；不代表通过业务校验。',
    'Called when user input completes the format, using the unmask value format; this is not business validation.',
  ],
  'InputMaskProps.lazy': [
    '隐藏未填写位置的占位字符；false 时始终显示。',
    'Hide placeholders for unfilled positions; false keeps them visible.',
  ],
  'InputMaskProps.unmask': [
    'value、defaultValue 及回调的组件值使用未格式化值，不改变原生表单提交的显示值。',
    'Use unmasked component values for value, defaultValue and callbacks without changing the formatted native form value.',
  ],
  'InputOTPProps.value': ['受控的验证码文本。', 'Controlled verification-code text.'],
  'InputOTPProps.defaultValue': [
    '非受控初始文本，表单重置时恢复。',
    'Initial uncontrolled text, restored on form reset.',
  ],
  'InputOTPProps.length': [
    '验证码长度，取整后限制在 1–32。',
    'Code length, rounded down and constrained to 1–32.',
  ],
  'InputOTPProps.onComplete': [
    '用户输入达到指定长度时触发；服务端仍须验证验证码。',
    'Called when user input reaches the specified length; the server must still verify the code.',
  ],
  'InputOTPProps.onChange': [
    '用户编辑后返回经过字符过滤与长度限制的文本。',
    'Return filtered, length-limited text after user editing.',
  ],
  'InputOTPProps.mask': [
    '隐藏可见格子的字符；true 使用圆点，字符串使用指定字符，不改变输入值或表单提交值。',
    'Hide visible slot characters with dots for true or the specified string; input and submitted values remain unchanged.',
  ],
  'InputOTPProps.separator': [
    '在零起始索引对应的字符后插入分隔内容；最后一个字符后不调用。',
    'Insert separator content after the character at a zero-based index; not called after the last character.',
  ],
  'SelectOption.value': [
    '唯一选项值；不能使用空字符串。',
    'Unique option value; empty strings are reserved.',
  ],
  'SelectOption.label': [
    '选项内容，可以是文字或 React 节点。',
    'Option content, as text or a React node.',
  ],
  'SelectOption.disabled': ['禁用该选项。', 'Disable the option.'],
  'SelectOption.searchLabel': [
    '搜索纯文本；省略时使用字符串或数字 label，其他内容使用 value。',
    'Plain search text; defaults to a string or numeric label, otherwise value.',
  ],
  'SliderMark.value': ['刻度数值。', 'Mark value.'],
  'SliderMark.label': ['刻度显示内容。', 'Visible mark label.'],
  'SliderProps.value': ['受控数值。', 'Controlled value.'],
  'SliderProps.defaultValue': [
    '非受控模式的初始数值；单值默认为 min，区间默认为 [min, max]。',
    'Initial uncontrolled value; defaults to min, or [min, max] in range mode.',
  ],
  'SliderProps.onChangeComplete': [
    '操作结束且数值发生过变化后触发；单值返回数字，区间返回二元数组。',
    'Called after an interaction that changed the value; returns a number or a range tuple.',
  ],
  'UploadProps.fileList': [
    '受控文件列表；省略时使用内部非受控列表。',
    'Controlled file list; the internal uncontrolled list is used when omitted.',
  ],
  'UploadProps.defaultFileList': [
    '非受控模式的初始文件列表；支持表单重置。',
    'Initial file list for uncontrolled usage; native form reset is supported.',
  ],
  'UploadFile.uid': [
    '稳定且唯一的文件标识；上传和取消操作按 uid 定位文件。',
    'Stable, unique file identity used to target upload and cancellation.',
  ],
  'UploadFile.url': ['文件地址；可用于下载或图片预览。', 'File URL for download or image preview.'],
  'UploadFile.name': ['文件名，不是 FormData 字段名。', 'File name, not the FormData field name.'],
  'UploadFile.size': ['文件大小，单位为字节。', 'File size in bytes.'],
  'UploadFile.type': [
    '可选 MIME 类型；展示分类还会参考 originFile.type 和扩展名，不回填此字段。',
    'Optional MIME type; display classification also checks originFile.type and the extension without filling this field.',
  ],
  'UploadFile.status': ['当前上传状态。', 'Current upload status.'],
  'UploadFile.percent': ['上传进度，范围为 0–100。', 'Upload progress from 0 to 100.'],
  'UploadFile.error': ['失败说明。', 'Failure message.'],
  'UploadFile.originFile': [
    '实际上传的 File，可能是 beforeUpload 返回的替换文件。',
    'File used for upload, which may be a replacement returned by beforeUpload.',
  ],
  'UploadFile.response': ['服务端返回的原始数据。', 'Raw server response.'],
  'UploadHandle.upload': [
    '启动带 originFile 的待上传、失败或取消文件；省略 uid 时处理所有符合条件的文件。',
    'Start ready, failed or cancelled files with originFile; omit uid to process all eligible files.',
  ],
  'UploadHandle.abort': [
    '取消指定 uid 的请求并移出队列；省略 uid 时取消全部，不清空文件列表。',
    'Abort the request and dequeue the given uid; omit uid to cancel all without clearing the file list.',
  ],
  'UploadHandle.focus': ['聚焦上传控件。', 'Focus the upload control.'],
  'CardTitleProps.children': ['标题内容。', 'Heading content.'],
  'CardTitleProps.description': ['标题下方的补充说明。', 'Supporting text beneath the heading.'],
  'CardTitleProps.extra': ['标题右侧的附加操作。', 'Trailing heading actions.'],
  'CardTitleProps.containerProps': [
    '标题区域外层容器的原生属性；heading 自身的属性、事件与 ref 仍直接应用于实际标题元素。',
    'Native attributes for the title-region wrapper; heading attributes, events and ref still target the actual heading element.',
  ],
  'CardProps.variant': [
    '卡片外观；layered 将内容卡与外层标题、底部操作分层展示。',
    'Card appearance; layered separates the content surface from the heading and footer on a muted canvas.',
  ],
  'CardProps.description': [
    '标题下方的补充说明，仅默认外观支持；layered 不展示。',
    'Supporting text below the title; only supported by the default appearance, not layered.',
  ],
  'CardProps.footer': [
    '底部内容或操作；layered 展示在内容卡下方的外层区域。',
    'Footer content or actions; layered places them on the canvas below the content card.',
  ],
  'CardProps.selected': [
    '标记选中外观，不提供选择交互；使用按钮或选择控件管理选中状态。',
    'Mark the card as selected; use a button or selection control to manage selection.',
  ],
  'CardProps.loading': [
    '将正文和标签页内容替换为骨架屏；不会禁用标题、标签页或操作。',
    'Replace body and tab-page content with skeletons; headings, tabs and actions remain enabled.',
  ],
  'CardProps.shadow': [
    '显示卡片的静止阴影；分层卡片将其应用于内层内容面。',
    "Show the card's resting shadow; layered cards apply it to the inner content surface.",
  ],
  'CardProps.size': [
    '卡片尺寸；内嵌标签页默认跟随此尺寸，其他子组件独立配置。',
    'Card size; embedded tabs follow it by default, while other children use their own sizes.',
  ],
  'DropdownItem.extra': [
    '条目右侧的附加内容；适合放快捷键、状态标签等非交互信息。',
    'Trailing item content for shortcuts, status labels or other non-interactive information.',
  ],
  ...Object.fromEntries(
    [
      'SelectProps',
      'AutoCompleteProps',
      'TreeSelectProps',
      'MentionsProps',
      'CascaderProps',
    ].flatMap((name) => [
      [`${name}.popupWidth`, choicePopupWidth],
      [`${name}.popupMaxWidth`, choicePopupMaxWidth],
    ]),
  ),
  'CheckboxProps.variant': [
    '普通选项或整块可点击的卡片选项。',
    'Plain choice or a card with a full clickable surface.',
  ],
  'RadioProps.variant': [
    '普通选项或整块可点击的卡片选项。',
    'Plain choice or a card with a full clickable surface.',
  ],
  'CheckboxGroupProps.variant': [
    '普通排列、卡片网格或带分隔线的成组列表。',
    'Plain choices, a card grid or a list with shared borders and dividers.',
  ],
  'RadioGroupProps.variant': [
    '普通排列、卡片网格或带分隔线的成组列表。',
    'Plain choices, a card grid or a list with shared borders and dividers.',
  ],
  'AlertProps.variant': [
    'soft 使用状态底色；neutral 使用中性底色并保留语义图标颜色。',
    'Soft uses a semantic surface; neutral uses a neutral surface with a semantic icon.',
  ],
  'ModalProps.icon': ['标题左侧的装饰图标。', 'Decorative icon to the left of the heading.'],
  'DrawerProps.icon': ['标题左侧的装饰图标。', 'Decorative icon to the left of the heading.'],
  'ConfirmOptions.icon': [
    '标题旁的状态图标；无标题时位于正文旁，传入 null 隐藏。',
    'Semantic icon beside the title, or the explanation when untitled; null hides it.',
  ],
  'ProgressProps.active': [
    '未完成的线形进度默认显示流光；设为 false 关闭，完成、错误或不确定进度时自动停止。',
    'Shimmer inside an unfinished line; false disables it. Completed, failed and indeterminate progress omit it.',
  ],
  'CheckboxProps.onChange': [
    '从 event.target.checked 读取选中状态。',
    'Read the selection from event.target.checked.',
  ],
  'RadioProps.onChange': [
    '从 event.target.value 读取所选值。',
    'Read the selected value from event.target.value.',
  ],
  'CheckboxProps.children': ['可点击的选项标签。', 'Clickable choice label.'],
  'RadioProps.children': ['可点击的选项标签。', 'Clickable choice label.'],
  'CheckboxProps.extra': [
    '补充状态文字或标签；不要放置交互控件。',
    'Supplementary status or tags; avoid interactive controls.',
  ],
  'RadioProps.extra': [
    '补充状态文字或标签；不要放置交互控件。',
    'Supplementary status or tags; avoid interactive controls.',
  ],
  'CheckboxOption.extra': [
    '补充状态文字或标签；不要放置交互控件。',
    'Supplementary status or tags; avoid interactive controls.',
  ],
  'RadioOption.extra': [
    '补充状态文字或标签；不要放置交互控件。',
    'Supplementary status or tags; avoid interactive controls.',
  ],
  'DataTableProps.table': [
    '由 useDataTable 或 useReactTable 创建的实例；与 data、columns、rowKey、options 和 localPagination 互斥。',
    'Instance from useDataTable or useReactTable; mutually exclusive with data, columns, rowKey, options and localPagination.',
  ],
  'DataTableProps.toolbar': [
    '自动布局中的工具栏内容。',
    'Toolbar content in the automatic layout.',
  ],
  'DataTableProps.pagination': tablePaginationDescription,
  'DataTablePresentationProps.pagination': tablePaginationDescription,
  'DataTableProps.localPagination': localPaginationDescription,
  'UseDataTableOptions.localPagination': localPaginationDescription,
  'DataTablePresentationProps.toolbar': [
    '自动布局中的工具栏内容。',
    'Toolbar content in the automatic layout.',
  ],
  'DataTableProps.striped': tableStripedDescription,
  'DataTablePresentationProps.striped': tableStripedDescription,
  'DataTableProps.bleed': tableBleedDescription,
  'DataTablePresentationProps.bleed': tableBleedDescription,
  'DataTableProps.maxHeight': tableHeightDescription,
  'DataTablePresentationProps.maxHeight': tableHeightDescription,
  'DataTableProps.minWidth': [
    '表格内容区域的最小宽度；默认适应容器与列宽。',
    'Minimum content-area width; adapts to the container and column widths by default.',
  ],
  'DataTablePresentationProps.minWidth': [
    '表格内容区域的最小宽度；默认适应容器与列宽。',
    'Minimum content-area width; adapts to the container and column widths by default.',
  ],
  'DataTableColumnMeta.label': [
    '排序和列宽调整使用的纯文字列名。',
    'Plain-text column name for sorting and resize controls.',
  ],
  'DataTableColumnMeta.flex': [
    '分配剩余宽度的正数权重，受 minSize / maxSize 约束；固定列和手动调整宽度的列忽略此项。',
    'Positive weight for sharing available width, bounded by minSize / maxSize; ignored on pinned or manually resized columns.',
  ],
  'DataTablePaginationProps.showSizeChanger': [
    '展示每页条数选择器；DataTable 默认开启，可显式传入 false 关闭。',
    'Show the page-size selector; enabled by default in DataTable and can be disabled with false.',
  ],
  'DataTablePaginationProps.pageSizeOptions': ['可选择的每页条数。', 'Available page sizes.'],
  'DataTablePaginationProps.showQuickJumper': [
    '回车或离开分页区域时跳转。',
    'Commit a quick jump on Enter or when leaving the pagination region.',
  ],
  'DataTablePaginationProps.showTotal': [
    'true 展示默认统计，也可传入函数定制总数及当前范围。',
    'true shows a localized total; pass a function to customize the total and visible range.',
  ],
  'DataTablePaginationProps.variant': [
    '分页按钮样式：描边 / 无边框。',
    'Pagination button appearance: outlined or borderless.',
  ],
  'DataTablePaginationProps.simple': ['使用简洁分页器。', 'Use compact pagination.'],
  'DataTablePaginationProps.hideOnSinglePage': [
    '只有一页时隐藏分页器。',
    'Hide when only one page exists.',
  ],
  'DataTablePaginationProps.size': [
    '默认跟随 DataTable 的尺寸。',
    'Inherit DataTable size by default.',
  ],
  'DataTablePaginationProps.hasNextPage': [
    '未知总数时控制下一页是否可用。',
    'Control next-page availability when the total is unknown.',
  ],
  'DataTableProps.data': [
    '展示的数据，更新时使用新数组。',
    'Data to display; provide a new array when updating.',
  ],
  'DataTableProps.columns': ['TanStack 的原生列定义。', 'Native TanStack column definitions.'],
  'DataTableProps.rowKey': [
    '非可选的字符串或数字标识字段，或返回字符串 / 数字标识的函数。',
    'A required string/number identity field, or a function returning a string/number identity.',
  ],
  'DataTableProps.options': [
    '定制 TanStack 的状态、回调和服务端配置。',
    'Customize TanStack state, callbacks and server configuration.',
  ],
  'UseDataTableOptions.data': [
    '展示的数据，更新时使用新数组。',
    'Data to display; provide a new array when updating.',
  ],
  'UseDataTableOptions.columns': ['TanStack 的原生列定义。', 'Native TanStack column definitions.'],
  'UseDataTableOptions.rowKey': [
    '每行稳定且唯一的字符串或数字标识。',
    'A stable, unique string/number identity for every row.',
  ],
  'UseDataTableOptions.options': [
    '定制 TanStack 的状态、回调、行模型和服务端配置。',
    'Customize native TanStack state, callbacks, row models and server settings.',
  ],
  'DataTableRowProps.selected': ['设置行的选中样式。', 'Apply the selected row appearance.'],
  'DataTableCellProps.align': ['单元格内容对齐。', 'Cell content alignment.'],
  'DataTableSelectionOptions.state': [
    '传给 useDataTable options 的受控 rowSelection 状态。',
    'Controlled rowSelection state for useDataTable options.',
  ],
  'DataTableSelectionOptions.onRowSelectionChange': [
    'TanStack 原生选择变更回调，内部会规范化业务 key。',
    'Native TanStack selection callback; business keys are normalized internally.',
  ],
  'DataTableSelectionOptions.enableMultiRowSelection': [
    '由 mode 决定；单选为 false，多选为 true。',
    'Derived from mode: false for single and true for multiple.',
  ],
  'UseDataTableSelectionOptions.mode': selectionModeDescription,
  'UseDataTableSelectionOptions.selectedRowKeys': selectedRowKeysDescription,
  'UseDataTableSelectionOptions.defaultSelectedRowKeys': defaultSelectedRowKeysDescription,
  'UseDataTableSelectionOptions.onSelectedRowKeysChange': onSelectedRowKeysChangeDescription,
  'UseDataTableSelectionResult.selectedRowKeys': selectedResultKeysDescription,
  'UseDataTableSelectionResult.rowSelection': [
    '由业务 key 派生的 TanStack 原生 rowSelection 映射。',
    'Native TanStack rowSelection map derived from business keys.',
  ],
  'UseDataTableSelectionResult.onRowSelectionChange': [
    '可直接传给 useDataTable 或原生 useReactTable。',
    'Pass directly to useDataTable or native useReactTable.',
  ],
  'UseDataTableSelectionResult.selectionOptions': [
    '可直接展开到 useDataTable options 的完整选择配置。',
    'Complete selection options ready to spread into useDataTable options.',
  ],
  'UseDataTableSelectionResult.clearSelection': [
    '清空受控或非受控选择，并触发变更回调。',
    'Clear controlled or uncontrolled selection and notify the change callback.',
  ],
  'LeafTheme.motion': [
    '启用当前区域的交互动效；系统减少动态效果优先，浮层继承此设置。',
    'Enable interaction motion in this region; reduced-motion preferences take precedence and portals inherit it.',
  ],
  'LeafThemeTokens.motionDuration': [
    '基础过渡时间；数字为 ms，也支持 CSS 时间。motion=false 时为 0。',
    'Base transition duration; numbers are ms and CSS times are accepted. motion=false forces 0.',
  ],
  'LeafThemeTokens.motionEasing': [
    '悬停、内容与普通过渡的曲线。',
    'Easing for hover, content and ordinary transitions.',
  ],
  'LeafThemeTokens.motionSpring': [
    '选择与形状变化的轻微弹性曲线。',
    'A mild spring curve for selection and shape changes.',
  ],
  'LeafThemeTokens.subtleTextColor': [
    '辅助文字；默认与 mutedTextColor 同值，可独立覆盖。',
    'Auxiliary text; shares the muted default and can be overridden separately.',
  ],
  'LeafThemeTokens.mutedSurfaceColor': [
    '次级表面与共享底板，对应 `--leaf-color-surface-muted`。Tabs 轨道、Card layered 与日期面板共用该角色；内层内容仍使用 `surfaceColor`，组件显式覆盖优先。',
    'Supporting surface and shared canvas, exposed as `--leaf-color-surface-muted`. Tabs tracks, layered Card canvases and date panels share this role; inner content keeps `surfaceColor`. Explicit component overrides take precedence.',
  ],
  'LeafThemeTokens.raisedSurfaceColor': [
    '浮层与抬升表面色。',
    'Raised and floating surface color.',
  ],
  'LeafThemeTokens.borderHoverColor': ['悬停时的中性边框色。', 'Neutral border color on hover.'],
  'LeafThemeTokens.shadowXs': ['最轻的表面阴影。', 'The lightest surface shadow.'],
  'LeafThemeTokens.spacingSm': [
    '覆盖小号间距；未指定时使用基础 spacing。',
    'Override small spacing; uses the base spacing when omitted.',
  ],
  'LeafThemeTokens.spacingLg': [
    '覆盖大号间距；未指定时为基础 spacing 的 3 倍。',
    'Override large spacing; uses three times the base spacing when omitted.',
  ],
  'LeafThemeTokens.shadowSm': [
    '小号表面阴影，接受 CSS box-shadow 值。',
    'Small surface shadow as a CSS box-shadow value.',
  ],
  'LeafThemeTokens.shadowMd': [
    '中号浮层阴影，接受 CSS box-shadow 值。',
    'Medium popup shadow as a CSS box-shadow value.',
  ],
  'LeafThemeTokens.shadowLg': [
    '大号阴影，接受 CSS box-shadow 值。',
    'Large shadow as a CSS box-shadow value.',
  ],
  'LeafThemeTokens.borderWidth': [
    '控件、内容表面和浮层的边框宽度；数字为 px。',
    'Border width for controls, content surfaces and popups; numbers are px.',
  ],
  'LeafThemeTokens.controlShadow': [
    '可交互控件的默认阴影。',
    'Default shadow for interactive controls.',
  ],
  'LeafThemeTokens.surfaceShadow': [
    '内容表面与浮层的默认阴影；未设置时保留组件的分层阴影。',
    'Default shadow for content surfaces and popups; component elevation remains the fallback.',
  ],
  'LeafComponentTokens.borderWidth': [
    '此组件的边框宽度；数字为 px。',
    'Border width for this component; numbers are px.',
  ],
  'LeafComponentTokens.hover': [
    '悬停状态覆盖；嵌套区域逐字段合并。',
    'Hover overrides, merged field by field in nested scopes.',
  ],
  'LeafComponentTokens.active': [
    '按下状态覆盖；嵌套区域逐字段合并。',
    'Pressed overrides, merged field by field in nested scopes.',
  ],
  'LeafComponentTokens.focus': [
    '键盘聚焦状态覆盖；保留可见焦点轮廓。',
    'Keyboard focus overrides; the visible focus outline remains.',
  ],
  'LeafComponentTokens.disabled': [
    '禁用状态覆盖；不改变禁用行为。',
    'Disabled appearance overrides; disabled behavior is unchanged.',
  ],
  'LeafThemeTokens.borderColor': [
    '全局外框色；显式设置时统一覆盖实色控件和弱描边外框，组件级覆盖优先。',
    'Global frame color; explicit values also apply to solid actions and muted frames. Component overrides take precedence.',
  ],
  'LeafThemeTokens.onPrimaryColor': [
    '主题实底上的字色；默认白色，可手动设为 #000000。',
    'Text on primary solid fills; defaults to white and can be set to #000000.',
  ],
  'LeafComponentStateTokens.color': ['当前状态的文字颜色。', 'Text color in this state.'],
  'LeafComponentStateTokens.background': ['当前状态的背景。', 'Background in this state.'],
  'LeafComponentStateTokens.borderColor': ['当前状态的边框颜色。', 'Border color in this state.'],
  'LeafComponentStateTokens.shadow': [
    '当前状态的 CSS box-shadow。',
    'CSS box-shadow in this state.',
  ],
  'TourProps.steps': ['引导的步骤列表。', 'Steps in the guided tour.'],
  'FloatButtonGroupProps.direction': [
    '快捷操作横向或纵向排列。',
    'Arrange quick actions horizontally or vertically.',
  ],
  'CommandItem.shortcut': [
    '展示在条目旁的快捷键提示。',
    'Shortcut hint displayed beside the item.',
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
  'ColorPickerProps.value': [
    '受控颜色值；支持 HEX、RGB、HSL、CSS 命名颜色，渐变模式使用 linear-gradient 字符串。',
    'Controlled color; accepts HEX, RGB, HSL and CSS named colors, or a linear-gradient string in gradient mode.',
  ],
  'ColorPickerProps.defaultValue': [
    '非受控模式的初始颜色值；表单重置时恢复此值。',
    'Initial uncontrolled color, restored when the form resets.',
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
  'StatisticProps.animation': ['启用数值变化动画。', 'Animate numeric value changes.'],
  'StatisticProps.initialValue': [
    '首次动画的起始值，后续变化从当前显示值开始。',
    'Starting value for the first animation; later changes start from the current displayed value.',
  ],
  'StatisticProps.duration': [
    '默认动效速度下的动画时长（毫秒），随区域动效时长缩放；0 表示立即更新。',
    'Animation duration in milliseconds at the default motion speed, scaled by the regional motion duration; 0 updates immediately.',
  ],
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
// These types are explained beside their consuming props instead of duplicating their tables.
const inlineApiTypes = new Set([
  'DataTablePresentationProps',
  'UseDataTableOptions',
  'DataTableRowKey',
  'DataTableColumnDef',
  'DataTableRowProps',
  'DataTableCellProps',
]);
const anchors = new Map();
const documentedTypes = new Set();
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
      const section = apiSectionMatch(document, name);
      const canonicalHeading = name.endsWith('Props') ? `${name.replace(/Props$/u, '')} API` : name;
      const canonicalAnchor = canonicalHeading.toLowerCase().replaceAll(' ', '-');
      const hasExplicitAnchor = document.includes(`<a id="${canonicalAnchor}"></a>`);
      if (section || hasExplicitAnchor) documentedTypes.add(`${english}/${name}`);
      anchors.set(
        `${english}/${name}`,
        hasExplicitAnchor
          ? canonicalAnchor
          : (section?.heading ?? canonicalHeading).toLowerCase().replaceAll(' ', '-'),
      );
    }
  }
}
function anchor(name, english) {
  return anchors.get(`${english}/${name}`);
}
function code(value) {
  const fence = value.includes('`') ? '``' : '`';
  return `${fence}${value.includes('`') ? ' ' : ''}${value.replaceAll('|', '\\|')}${value.includes('`') ? ' ' : ''}${fence}`;
}
function typeCell(value, page, english, preserveAliases = false) {
  let text = value.replace(
    /\bPlacement\b/gu,
    "'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end'",
  );
  if (!preserveAliases)
    for (const [name, expression] of expressions)
      if (expression && expression.length < 230 && !expression.includes('{'))
        text = text.replace(new RegExp(`\\b${name}\\b`, 'gu'), expression);
  const pieces = [];
  let position = 0;
  for (const match of text.matchAll(/\b[A-Za-z_]\w*\b/gu)) {
    const type = types.find((item) => item.name === match[0]);
    if (!type || (!schema.get(type.name)?.size && !documentedTypes.has(`${english}/${type.name}`)))
      continue;
    const target = documentationPage(type);
    const url =
      target === page
        ? `#${anchor(type.name, english)}`
        : `${path.posix.relative(path.posix.dirname(page), target)}#${anchor(type.name, english)}`;
    if (match.index > position) pieces.push(code(text.slice(position, match.index)));
    pieces.push(`[${code(match[0])}](${url})`);
    position = match.index + match[0].length;
  }
  if (position < text.length) pieces.push(code(text.slice(position)));
  return pieces.join('') || code(text);
}
const contractDescriptions = new Set([
  'disabled',
  'readOnly',
  'inputReadOnly',
  'minuteStep',
  'secondStep',
  'needConfirm',
  'required',
  'cacheKey',
]);
let matchedSelectedPage = false;
for (const [page, names] of byPage) {
  if (!pageSelected(page)) continue;
  matchedSelectedPage = true;
  const slug = page.split('/').at(-1);
  const addition = additions.find((item) => item[2] === slug);
  if (!selectedPage && !addition && !updatedPages.has(slug) && !updatedPages.has(page)) continue;
  for (const english of [false, true]) {
    const file = path.join(repository, `apps/docs/docs/${english ? 'en/' : ''}${page}.mdx`);
    let document;
    try {
      document = await readFile(file, 'utf8');
    } catch {
      if (!addition) continue;
      document = '';
    }
    const currentDocument = document;
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
    document = removeDuplicateApiSections(document, names);
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
      if (inlineApiTypes.has(name)) {
        if (!documentedTypes.has(`${english}/${name}`))
          throw new Error(`Missing inline API documentation: ${file} (${name})`);
        continue;
      }
      // Card tabs intentionally reuse the standalone Tabs API instead of duplicating its table.
      if (page === 'components/card' && name === 'CardTabsProps') continue;
      const props = schema.get(name);
      if (!props?.size) continue;
      const section = apiSectionMatch(document, name);
      const old = readApiRows(apiSectionMatch(original, name)?.match[2] ?? section?.match[2] ?? '');
      const hasDefault =
        name !== 'UploadHandle' &&
        !/^\| (?:属性 \| 类型 \| 说明|Property \| Type \| Description) \|\r?$/mu.test(
          section?.match[2] ?? '',
        );
      const rows = [
        `| ${name === 'UploadHandle' ? (english ? 'Method' : '方法') : english ? 'Property' : '属性'} | ${english ? 'Type' : '类型'} | ${hasDefault ? `${english ? 'Default' : '默认值'} | ` : ''}${english ? 'Description' : '说明'} |`,
        hasDefault ? '| --- | --- | --- | --- |' : '| --- | --- | --- |',
      ];
      const priority = apiPropertyOrder[name] ?? [];
      const rank = (property) => {
        const index = priority.indexOf(property);
        return index < 0 ? priority.length : index;
      };
      const orderedProps = [...props].sort(([left], [right]) => rank(left) - rank(right));
      for (const [property, value] of orderedProps) {
        if (value.type === 'never') continue;
        if (modeProperties[name] && !modeProperties[name].includes(property)) continue;
        const previous = old.get(property);
        const previousDescription = /^(?:设置 \w+。|Configure [\w ]+\.)$/.test(
          previous?.description ?? '',
        )
          ? undefined
          : previous?.description;
        const pair =
          specific[`${name}.${property}`] ??
          (contractDescriptions.has(property) || !previousDescription
            ? descriptions[property]
            : undefined);
        const resolvedDescription = property.startsWith('[')
          ? english
            ? 'Reusable CSS custom property.'
            : '可复用的 CSS 自定义属性。'
          : name === 'LeafComponentDefaults'
            ? english
              ? `Scoped default props for ${property}.`
              : `${property} 的区域默认参数。`
            : (pair?.[english ? 1 : 0] ?? previousDescription ?? value.description);
        if (!resolvedDescription) throw new Error(`Missing API description: ${name}.${property}`);
        const description = resolvedDescription.replace(/^(?:Required\.\s*|必需。)+/u, '');
        const defaultOverride = specificDefault(name, property, english);
        const typeOverride = specificTypes[`${name}.${property}`];
        const resolvedDefault = apiDefaultCell({
          defaultValue: value.defaultValue ? code(value.defaultValue) : undefined,
          optional: value.optional,
          english,
          override: defaultOverride,
          previousDefault: !addition ? previous?.defaultValue : undefined,
        });
        const requiredPrefix =
          !hasDefault && name !== 'UploadHandle' && !value.optional
            ? english
              ? 'Required. '
              : '必需。'
            : '';
        rows.push(
          `| ${code(property)} | ${typeCell(typeOverride ?? value.type, page, english, Boolean(typeOverride))} | ${hasDefault ? `${resolvedDefault} | ` : ''}${requiredPrefix}${description} |`,
        );
      }
      for (const [property, value] of old)
        if (
          !props.has(property) &&
          !removedProperties.has(`${name}.${property}`) &&
          [
            'name',
            'form',
            'required',
            'readOnly',
            'checked',
            'defaultChecked',
            'defaultValue',
            'value',
            'onChange',
            'children',
            'disabled',
            'type',
            'className',
            'style',
            'ref',
            'href',
            'target',
            'rel',
            'id',
            'aria-label',
          ].includes(property)
        ) {
          const defaultOverride = specificDefault(name, property, english);
          const typeOverride = specificTypes[`${name}.${property}`];
          const resolvedDefault = apiDefaultCell({
            defaultValue: value.defaultValue,
            optional: true,
            english,
            override: defaultOverride,
          });
          const description = (
            specific[`${name}.${property}`]?.[english ? 1 : 0] ??
            descriptions[property]?.[english ? 1 : 0] ??
            value.description
          ).replace(/^(?:Required\.\s*|必需。)+/u, '');
          rows.push(
            `| ${code(property)} | ${typeOverride ? typeCell(typeOverride, page, english, true) : value.type} | ${hasDefault ? `${resolvedDefault} | ` : ''}${description} |`,
          );
        }
      if (priority.length) {
        // Retained native attributes belong in the same ordering as declared props.
        rows.splice(
          2,
          rows.length - 2,
          ...rows
            .slice(2)
            .sort(
              (left, right) =>
                rank(/^\| `([^`]+)`/u.exec(left)?.[1]) - rank(/^\| `([^`]+)`/u.exec(right)?.[1]),
            ),
        );
      }
      const table = rows.join('\n');
      if (section) {
        document = document.replace(section.expression, (_all, heading, body) =>
          replaceApiTable(heading, body, table),
        );
      } else {
        const generatedHeading = name.endsWith('Props')
          ? `${name.replace(/Props$/u, '')} API`
          : name;
        document = `${document.trimEnd()}\n\n## ${generatedHeading}\n\n${table}\n`;
      }
    }
    const typeBoilerplate = `\n## ${english ? 'Types' : '类型'}\n\n\`\`\`ts\nimport type { ${names.join(', ')} } from '@ifhover/leaf-ui';\n\`\`\``;
    document = document.replace(typeBoilerplate, '');
    const sharedReference =
      page === 'components/popconfirm'
        ? [
            'ButtonProps',
            '按钮属性见 [Button API](button#button-api)。',
            'See [Button API](button#button-api) for button properties.',
          ]
        : page === 'components/upload'
          ? [
              'FileItem',
              '文件展示字段见 [FileItem](file-list#fileitem-api)；UploadFile 在其基础上要求 uid，并增加 response。',
              'See [FileItem](file-list#fileitem-api) for display fields; UploadFile requires uid and adds response.',
            ]
          : page === 'components/card'
            ? [
                'CardTabsProps',
                '内嵌标签页的可用属性见 <a href="tabs.html#tabs-api" target="_blank" rel="noopener noreferrer">Tabs API</a>（新标签页打开）。Card 固定使用 `type="line"` 与 `placement="top"`，并为标签页内容接入加载骨架；`tabs.extra` 仍属于标签栏，`items` 为空时恢复普通卡片。\n\n```ts\ntype CardTabsProps = Omit<TabsProps, \'type\' | \'placement\' | \'children\'>;\n```',
                'See the <a href="tabs.html#tabs-api" target="_blank" rel="noopener noreferrer">Tabs API</a> (opens in a new tab) for embedded tab props. Card fixes `type="line"` and `placement="top"`, adds loading skeletons to tab content, and keeps `tabs.extra` on the tab bar; an empty `items` list restores an ordinary card.\n\n```ts\ntype CardTabsProps = Omit<TabsProps, \'type\' | \'placement\' | \'children\'>;\n```',
              ]
            : undefined;
    if (sharedReference) {
      const sharedSection = apiSectionMatch(document, sharedReference[0]);
      if (sharedSection) {
        const reference = sharedReference[english ? 2 : 1];
        document = document.replace(sharedSection.expression, (_all, heading, body) => {
          const prose = body.replace(/^(?:\|[^\n]*(?:\n|$))+/mu, '').trim();
          return `${heading}\n${prose.includes(reference) ? prose : `${reference}${prose ? `\n\n${prose}` : ''}`}\n\n`;
        });
      }
    }
    document = orderApiSections(document, apiSectionOrder[page] ?? []);
    if (document.includes('leafDoc')) {
      document = orderPrimaryComponentApi(document, file);
      parseComponentDocument(document, file);
    }
    const nextDocument = `${document.trimEnd()}\n`;
    if (nextDocument !== currentDocument) {
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, nextDocument);
    }
  }
}
if (selectedPage && !matchedSelectedPage)
  throw new Error(`No component documentation page matched --page=${selectedPage}.`);
console.log('Synced bilingual public APIs from TypeScript declarations.');
