import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
const packageRoot = new URL('../', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('package.json', packageRoot), 'utf8'));
const entry = manifest.exports['.'];
for (const relativePath of [
  entry.import.types,
  entry.import.default,
  entry.require.types,
  entry.require.default,
  manifest.exports['./styles.css'],
]) {
  assert.ok((await stat(new URL(relativePath, packageRoot))).isFile(), relativePath);
}
const esm = await import('@sudden3/leaf-ui');
const cjs = require('@sudden3/leaf-ui');
const components = [
  ['Avatar', { alt: 'Leaf' }, 'LF', /leaf-avatar/],
  ['Card', { title: 'Project' }, 'Details', /leaf-card/],
  [
    'Collapse',
    { items: [{ key: 'first', label: 'First', children: 'Content' }] },
    null,
    /aria-expanded/,
  ],
  ['Divider', {}, null, /role="separator"/],
  ['Empty', {}, null, /leaf-empty/],
  ['Result', { status: 'success' }, null, /leaf-result/],
  ['ColorPicker', { defaultValue: '#20834a' }, null, /leaf-color-picker/],
  ['Tree', { data: [{ key: 'leaf', title: 'Leaf' }] }, null, /role="tree"/],
  ['TreeSelect', { options: [{ value: 'leaf', label: 'Leaf' }] }, null, /role="combobox"/],
  ['Skeleton', { rows: 2 }, null, /role="status"/],
  ['Slider', { defaultValue: 20 }, null, /type="range"/],
  ['Rate', { defaultValue: 3 }, null, /role="radiogroup"/],
  [
    'Popover',
    { title: 'Details', content: 'Info' },
    createElement('button', { type: 'button' }, 'Details'),
    /aria-haspopup="dialog"/,
    false,
  ],
  ['Button', { danger: true }, 'Leaf UI', /<button/],
  ['Input', { name: 'title' }, null, /<input/],
  ['InputNumber', { name: 'count', defaultValue: 2 }, null, /role="spinbutton"/],
  ['Steps', { items: [{ title: 'Create' }, { title: 'Review' }] }, null, /<ol/],
  ['Breadcrumb', { items: [{ title: 'Home', href: '/' }, { title: 'Project' }] }, null, /<nav/],
  ['Pagination', { total: 120 }, null, /<nav/],
  ['Tag', { color: 'success' }, 'Published', /leaf-tag/],
  ['Badge', { count: 5 }, null, /role="status"/],
  ['Loading', { tip: 'Loading' }, null, /role="status"/],
  ['Progress', { percent: 50 }, null, /role="progressbar"/],
  ['Calendar', { defaultValue: new Date(2026, 9, 4) }, null, /leaf-calendar-view/],
  [
    'Tabs',
    { items: [{ key: 'first', label: 'First', children: 'First view' }] },
    null,
    /role="tablist"/,
  ],
  ['Drawer', { open: false, title: 'Details' }, null, /<span/, false],
  [
    'Tooltip',
    { content: 'Save project' },
    createElement('button', { type: 'button' }, 'Save'),
    /<button/,
    false,
  ],
  ['Textarea', { name: 'description' }, null, /<textarea/],
  ['Checkbox', { defaultChecked: true }, 'Updates', /type="checkbox"/],
  ['Radio', { value: 'light' }, 'Light', /type="radio"/],
  [
    'RadioGroup',
    { label: 'Theme', options: [{ value: 'light', label: 'Light' }] },
    null,
    /<fieldset/,
  ],
  ['Switch', { defaultChecked: true }, 'Notifications', /role="switch"/],
  ['Select', { options: [{ value: 'design', label: 'Design' }] }, null, /role="combobox"/],
  ['DatePicker', { defaultValue: new Date(2026, 9, 15) }, null, /role="combobox"/],
  ['TimePicker', { defaultValue: '09:30' }, null, /role="combobox"/],
  ['AutoComplete', { options: [{ value: 'Leaf' }] }, null, /role="combobox"/],
  ['Cascader', { options: [{ value: 'design', label: 'Design' }] }, null, /role="combobox"/],
  ['DateTimePicker', { defaultValue: new Date(2026, 9, 15, 9, 30) }, null, /role="combobox"/],
  [
    'DateRangePicker',
    { defaultValue: [new Date(2026, 9, 15), new Date(2026, 9, 20)] },
    null,
    /role="combobox"/,
  ],
  ['Form', { labelWidth: 120 }, 'Fields', /<form/],
  ['FormField', { label: 'Title' }, null, /<label/],
  [
    'ConfigProvider',
    { locale: 'en-US', theme: { primaryColor: '#427d52' } },
    'Scope',
    /lang="en-US"/,
  ],
  ['Alert', { title: 'Saved' }, null, /role="status"/],
  [
    'Dropdown',
    { items: [{ key: 'edit', label: 'Edit' }] },
    createElement('button', { type: 'button' }, 'Actions'),
    /aria-haspopup="menu"/,
    false,
  ],
  ['Modal', { open: false, title: 'Details' }, null, /<span/, false],
  ['Confirm', { open: false, title: 'Remove' }, null, /<span/, false],
  ['Message', { open: false, content: 'Saved' }, null, /<span/, false],
  ['MessageProvider', {}, 'Content', /Content/, false],
  ['Layout', {}, 'Content', /leaf-layout/],
  ['LayoutSider', { collapsible: true }, 'Navigation', /leaf-layout__sider/],
  ['Grid', { columns: 3 }, 'Grid content', /leaf-grid/],
  ['Row', {}, 'Row content', /leaf-row/],
  ['Col', { md: 12 }, 'Column', /leaf-col/],
  ['Space', {}, 'Actions', /leaf-space/],
  ['ScrollArea', { height: 100 }, 'Content', /leaf-scroll-area/],
  ['Masonry', {}, 'Cards', /leaf-masonry/],
  ['Segmented', { options: ['Daily', 'Monthly'] }, null, /role="radiogroup"/],
  ['Menu', { items: [{ key: 'home', label: 'Home' }] }, null, /role="menu"/],
  ['BackTop', {}, null, /leaf-back-top/],
  ['Descriptions', { items: [{ key: 'name', label: 'Name', children: 'Leaf' }] }, null, /<dl/],
  ['Image', { src: '/test.png', alt: 'Preview' }, null, /leaf-image/],
  [
    'ImagePreview',
    { items: [{ src: '/test.png' }], open: true, onClose: () => {} },
    null,
    /^$/,
    false,
  ],
  ['ImagePreviewGroup', {}, 'Images', /Images/, false],
  ['QRCode', { value: 'https://example.com' }, null, /<svg/],
  ['Timeline', { items: [{ key: 'first', children: 'Created' }] }, null, /<ol/],
  [
    'VirtualList',
    { items: ['A', 'B'], itemKey: (item) => item, renderItem: (item) => item },
    null,
    /leaf-virtual-list/,
  ],
  ['Transfer', { items: [{ key: 'a', label: 'Ada' }] }, null, /leaf-transfer/],
  ['InputOTP', { name: 'otp', defaultValue: '123' }, null, /one-time-code/],
  ['TimeRangePicker', { defaultValue: ['09:00', '18:00'] }, null, /role="combobox"/],
  ['InputMask', { mask: '000-000', defaultValue: '123' }, null, /leaf-input/],
  ['Notification', { title: 'Saved', open: true }, null, /<span/, false],
  ['NotificationProvider', {}, 'Notifications', /Notifications/, false],
  [
    'Popconfirm',
    { title: 'Delete?' },
    createElement('button', { type: 'button' }, 'Delete'),
    /aria-haspopup="dialog"/,
    false,
  ],
  ['ErrorBoundary', {}, 'Stable', /Stable/, false],
  ['LoadingBar', { active: true }, null, /<span/, false],
  ['LoadingBarProvider', {}, 'Progress', /Progress/, false],
  [
    'InfiniteScroll',
    { dataLength: 0, hasMore: true, onLoadMore: async () => {} },
    'Items',
    /leaf-infinite-scroll/,
  ],
  [
    'Sortable',
    { items: ['a', 'b'], itemKey: (item) => item, renderItem: (item) => item, onChange: () => {} },
    null,
    /leaf-sortable/,
  ],
  ['FileList', { items: [{ url: '/report.pdf' }] }, null, /leaf-file-list/],
  ['Upload', {}, null, /leaf-upload/],
  ['ImageCropper', { src: '/image.png' }, null, /leaf-image-cropper/],
  ['SignaturePad', {}, null, /<canvas/],
  ['OrgChart', { data: { key: 'team', label: 'Team' } }, null, /leaf-org-chart/],
  ['ButtonGroup', {}, createElement('button', { type: 'button' }, 'Save'), /<fieldset/],
  ['SplitButton', { items: [{ key: 'copy', label: 'Copy' }] }, 'Save', /leaf-button-group/],
  ['CheckboxGroup', { options: ['A', 'B'] }, null, /leaf-checkbox-group/],
  ['AvatarGroup', {}, 'Team', /leaf-avatar-group/],
  ['TagGroup', { options: [{ value: 'design', label: 'Design' }] }, null, /leaf-tag-group/],
  ['CheckableTag', {}, 'Selected', /aria-pressed/],
  ['InputSearch', {}, null, /leaf-input-search/],
  ['InputGroup', {}, null, /<fieldset/],
  ['FormGroup', { legend: 'Details' }, null, /<fieldset/],
  [
    'FormErrorSummary',
    { errors: [{ fieldId: 'email', message: 'Invalid email' }] },
    null,
    /role="alert"/,
  ],
  [
    'FormList',
    {
      name: 'contacts',
      defaultValue: ['Ada'],
      children: (fields) =>
        fields.map((field) => createElement('span', { key: field.key }, field.value)),
    },
    undefined,
    /leaf-form-list/,
  ],
];
for (const [format, api] of [
  ['ESM', esm],
  ['CommonJS', cjs],
]) {
  for (const [name, props, children, expected, hasClass = true] of components) {
    assert.ok(api[name], `${format} must export ${name}`);
    const markup = renderToStaticMarkup(
      children === undefined
        ? createElement(api[name], props)
        : createElement(api[name], props, children),
    );
    assert.match(markup, expected, `${format}: ${name}`);
    if (hasClass) assert.ok(markup.includes('leaf-'), `${name} must include its component class`);
  }
  for (const name of [
    'useConfirm',
    'useMessage',
    'useNotification',
    'useLoadingBar',
    'moveTreeNode',
  ])
    assert.equal(typeof api[name], 'function', `${format} must export ${name}`);
  function HookHolders() {
    const confirm = api.useConfirm();
    const message = api.useMessage();
    return createElement(Fragment, null, confirm.contextHolder, message.contextHolder);
  }
  assert.equal(renderToStaticMarkup(createElement(HookHolders)), '');
  function ManagedMessage() {
    const { message, contextHolder } = api.useMessage();
    assert.equal(contextHolder, null);
    assert.equal(typeof message.success, 'function');
    return createElement('span', null, 'Ready');
  }
  assert.match(
    renderToStaticMarkup(createElement(api.ConfigProvider, null, createElement(ManagedMessage))),
    /Ready/,
  );
  const themed = renderToStaticMarkup(
    createElement(
      api.ConfigProvider,
      {
        theme: {
          appearance: 'dark',
          primaryColor: '#7654c6',
          borderRadius: 8,
          controlHeight: 38,
          tokens: { controlHeightLg: 48 },
        },
      },
      createElement(api.Button, null, 'Save'),
    ),
  );
  assert.match(themed, /data-leaf-theme="dark"/);
  assert.match(themed, /--leaf-radius:8px/);
  assert.match(themed, /--leaf-control-height:38px/);
  assert.match(themed, /--leaf-control-height-lg:48px/);
}
const esmTypes = await readFile(new URL(entry.import.types, packageRoot), 'utf8');
assert.ok(
  !esmTypes.includes('.css') && !esmTypes.includes('.scss'),
  'Declarations must not reference extracted styles',
);
const css = await readFile(new URL(manifest.exports['./styles.css'], packageRoot), 'utf8');
assert.match(css, /--leaf-control-height:\s*34px/);
assert.match(css, /--leaf-color-danger/);
for (const name of [
  'button',
  'input',
  'textarea',
  'checkbox',
  'radio',
  'switch',
  'select',
  'date-picker',
  'time-picker',
  'autocomplete',
  'cascader',
  'floating',
  'form',
  'modal',
  'confirm',
  'dropdown',
  'alert',
  'message',
  'date-range-picker',
  'steps',
  'breadcrumb',
  'pagination',
  'tag',
  'badge',
  'drawer',
  'loading',
  'progress',
  'tooltip',
  'calendar-view',
  'tabs',
  'input-number',
  'avatar',
  'card',
  'collapse',
  'divider',
  'skeleton',
  'slider',
  'rate',
  'popover',
  'result',
  'tree',
  'tree-select',
  'color-picker',
  'layout',
  'grid',
  'space',
  'scroll-area',
  'masonry',
  'segmented',
  'menu',
  'back-top',
  'descriptions',
  'image',
  'qr-code',
  'timeline',
  'virtual-list',
  'transfer',
  'input-otp',
  'time-range-picker',
  'notification',
  'popconfirm',
  'loading-bar',
  'infinite-scroll',
  'sortable',
  'file-list',
  'upload',
  'image-cropper',
  'signature-pad',
  'org-chart',
]) {
  assert.ok(css.includes(`.leaf-${name}`), `Styles must include ${name}`);
}
assert.ok(!css.includes('@use'), 'Published CSS must be compiled from SCSS');
const esmCode = await readFile(new URL(entry.import.default, packageRoot), 'utf8');
const cjsCode = await readFile(new URL(entry.require.default, packageRoot), 'utf8');
assert.match(esmCode, /^\s*["']use client["'];/, 'ESM must preserve the Next.js client boundary');
assert.match(
  cjsCode,
  /^\s*["']use client["'];/,
  'CommonJS must preserve the Next.js client boundary',
);
async function compiledModules(format) {
  const root = new URL(`dist/${format}/`, packageRoot);
  const files = await readdir(root, { recursive: true });
  return (
    await Promise.all(
      files
        .filter((file) => file.endsWith(format === 'esm' ? '.js' : '.cjs'))
        .map((file) => readFile(new URL(file.replaceAll('\\', '/'), root), 'utf8')),
    )
  ).join('\n');
}
const esmModules = await compiledModules('esm');
const cjsModules = await compiledModules('cjs');
assert.ok(esmModules.includes('from "react"'), 'ESM must keep React external');
assert.ok(cjsModules.includes('require("react")'), 'CommonJS must keep React external');
assert.ok(esmModules.includes('from "lucide-react"'), 'Lucide must remain an external dependency');
assert.ok(cjsModules.includes('require("lucide-react")'), 'CommonJS must keep Lucide external');
for (const dependency of ['react-dom', '@floating-ui/react-dom', 'tabbable']) {
  assert.ok(esmModules.includes(`from "${dependency}"`), `ESM must keep ${dependency} external`);
  assert.ok(
    cjsModules.includes(`require("${dependency}")`),
    `CommonJS must keep ${dependency} external`,
  );
}
console.log(
  'All component exports, ESM/CommonJS rendering, declarations, compiled SCSS and dependencies verified.',
);
console.log('Package root:', fileURLToPath(packageRoot));
