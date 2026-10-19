import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rmdir,
  stat,
  unlink,
  writeFile,
} from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { renderTailwindTheme } from './build-tailwind.mjs';

const require = createRequire(import.meta.url);
const packageRoot = new URL('../', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('package.json', packageRoot), 'utf8'));
const entry = manifest.exports['.'];
function assertPublicExports(api, label) {
  for (const name of Object.keys(api))
    assert.ok(!/Control$|^ModalBase$/u.test(name), `${label}: ${name} must remain internal`);
}
let subpathCount = 0;
for (const [subpath, targets] of Object.entries(manifest.exports)) {
  if (subpath === '.' || subpath === './package.json') continue;
  if (typeof targets === 'string') {
    const file = new URL(targets, packageRoot);
    assert.ok((await stat(file)).isFile(), `${subpath} target exists`);
    if (subpath === './tailwind.css') {
      const { leafTailwindTokens } = await import('../dist/esm/tailwind-tokens.js');
      assert.equal(await readFile(file, 'utf8'), renderTailwindTheme(leafTailwindTokens));
    } else if (subpath.endsWith('.css')) {
      const styles = await readFile(file, 'utf8');
      const shared =
        subpath === './styles.css'
          ? await readFile(new URL('dist/esm/styles/foundation.css', packageRoot), 'utf8')
          : styles;
      assert.ok(shared.includes('--leaf-control-height'), `${subpath} includes shared tokens`);
      assert.ok(!styles.includes('@use'), `${subpath} is compiled CSS`);
    }
    continue;
  }
  for (const format of ['import', 'require']) {
    for (const target of Object.values(targets[format]))
      assert.ok((await stat(new URL(target, packageRoot))).isFile(), `${subpath}: ${target}`);
  }
  const specifier = `@ifhover/leaf-ui${subpath.slice(1)}`;
  const imports = await import(specifier),
    requires = require(specifier);
  assertPublicExports(imports, `${subpath} ESM`);
  assertPublicExports(requires, `${subpath} CommonJS`);
  assert.deepEqual(
    Object.keys(imports).sort(),
    Object.keys(requires)
      .filter((name) => name !== '__esModule')
      .sort(),
    `${subpath} ESM/CJS agree`,
  );
  for (const target of [targets.import.types, targets.require.types]) {
    const code = await readFile(new URL(target, packageRoot), 'utf8');
    assert.ok(!code.includes('.scss'), `${subpath} declarations have no SCSS dependency`);
  }
  subpathCount++;
}
for (const relativePath of [
  entry.import.types,
  entry.import.default,
  entry.require.types,
  entry.require.default,
  manifest.exports['./styles.css'],
]) {
  assert.ok((await stat(new URL(relativePath, packageRoot))).isFile(), relativePath);
}
const esm = await import('@ifhover/leaf-ui');
const cjs = require('@ifhover/leaf-ui');
const tailwindPreset = (await import('@ifhover/leaf-ui/tailwind')).default;
assert.equal(tailwindPreset.theme.extend.spacing['leaf-control'], 'var(--leaf-control-height)');
assert.equal(
  tailwindPreset.theme.extend.colors['leaf-primary'],
  require('@ifhover/leaf-ui/tailwind').default.theme.extend.colors['leaf-primary'],
  'Tailwind preset agrees in ESM and CommonJS',
);
for (const tag of ['en-US', 'zh-CN', 'zh-TW', 'ja-JP', 'ko-KR']) {
  const resource = require(`@ifhover/leaf-ui/locales/${tag}.json`);
  const source = JSON.parse(
    await readFile(new URL(`src/locales/${tag}.json`, packageRoot), 'utf8'),
  );
  assert.deepEqual(resource, source, `${tag}: published JSON matches runtime source`);
}
for (const [format, api] of [
  ['ESM', esm],
  ['CommonJS', cjs],
]) {
  for (const [locale, placeholder, total] of [
    ['ja-JP', '日付を選択', '全 24 件'],
    ['ko-KR', '날짜 선택', '총 24개'],
  ]) {
    const html = renderToStaticMarkup(
      createElement(api.ConfigProvider, { locale }, [
        createElement(api.DatePicker, { key: 'date' }),
        createElement(api.Pagination, { key: 'pages', total: 24, showTotal: true }),
      ]),
    );
    assert.ok(html.includes(placeholder), `${format}: ${locale} built-in date text`);
    assert.ok(html.includes(total), `${format}: ${locale} formatted total`);
  }
}
const localeCheck = execFileSync(
  process.execPath,
  [
    fileURLToPath(new URL(manifest.bin['leaf-ui-check-translations'], packageRoot)),
    fileURLToPath(new URL(manifest.exports['./locales/en-US.json'], packageRoot)),
  ],
  { encoding: 'utf8' },
);
assert.match(localeCheck, /Translation valid/);
assertPublicExports(esm, 'Root ESM');
assertPublicExports(cjs, 'Root CommonJS');
const components = [
  [
    'Table',
    { 'aria-label': 'Records' },
    createElement(
      esm.Table.Body,
      null,
      createElement(esm.Table.Row, null, createElement(esm.Table.Cell, null, 'Alice')),
    ),
    /<table/,
  ],
  ['Typography', {}, 'Text', /leaf-typography/],
  ['Text', {}, 'Text', /leaf-text/],
  ['Title', { level: 2 }, 'Heading', /<h2/],
  ['Paragraph', {}, 'Paragraph', /<p/],
  ['Link', { href: '/guide' }, 'Guide', /<a/],
  ['Statistic', { title: 'Total', value: 1234 }, null, /1,234/],
  ['Countdown', { value: Date.now() + 3600000 }, null, /leaf-statistic/],
  ['Anchor', { items: [{ key: 'intro', title: 'Intro', href: '#intro' }] }, null, /<nav/],
  ['Affix', {}, 'Fixed', /leaf-affix/],
  [
    'Splitter',
    {
      panels: [
        { key: 'left', children: 'Left' },
        { key: 'right', children: 'Right' },
      ],
    },
    null,
    /role="separator"/,
  ],
  ['Carousel', {}, ['A', 'B'], /aria-roledescription="轮播"/],
  ['FloatButton', { label: 'Help' }, null, /<button/],
  ['FloatButtonGroup', {}, 'Actions', /<fieldset/],
  ['Mentions', { options: [{ value: 'alice' }] }, null, /<textarea/],
  ['AppBar', {}, 'Header', /<header/],
  ['Toolbar', {}, 'Actions', /role="toolbar"/],
  ['BottomNavigation', { items: [{ key: 'home', label: 'Home' }] }, null, /<nav/],
  ['Avatar', { alt: 'Leaf' }, 'LF', /leaf-avatar/],
  ['Card', { title: 'Project' }, 'Details', /leaf-card/],
  [
    'Card',
    {
      title: 'Project',
      tabs: { items: [{ key: 'overview', label: 'Overview', children: 'Summary' }] },
    },
    null,
    /role="tabpanel"/,
  ],
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
  ['Message', { open: false, content: 'Saved' }, null, /<span/, false],
  ['MessageProvider', {}, 'Content', /Content/, false],
  ['Layout', {}, 'Content', /leaf-layout/],
  ['LayoutSider', { collapsible: true }, 'Navigation', /leaf-layout__sider/],
  ['Grid', { columns: 3 }, 'Grid content', /leaf-grid/],
  ['Row', {}, 'Row content', /leaf-row/],
  ['Col', { md: 12 }, 'Column', /leaf-col/],
  ['Space', {}, 'Actions', /leaf-space/],
  ['Flex', { gap: 'sm', wrap: true }, 'Actions', /leaf-flex/],
  ['ScrollArea', { height: 100 }, 'Content', /leaf-scroll-area/],
  ['Scrollbar', { height: 100 }, 'Content', /leaf-scrollbar/],
  ['Masonry', {}, 'Cards', /leaf-masonry/],
  ['Menu', { items: [{ key: 'home', label: 'Home' }] }, null, /role="menu"/],
  ['MenuGroup', { title: 'Workspace' }, 'Custom content', /role="group"/],
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
  ['FileList', { items: [{ url: '/report.pdf' }] }, null, /leaf-file-list/],
  ['Upload', {}, null, /leaf-upload/],
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
    'colorContrast',
    'useBreakpoint',
    'useSystemAppearance',
    'useFormValidation',
    'mapCascaderOptions',
    'parseGradient',
    'gradientString',
    'useConfirm',
    'useMessage',
    'useNotification',
    'useLoadingBar',
    'moveTreeNode',
  ])
    assert.equal(typeof api[name], 'function', `${format} must export ${name}`);
  assert.equal(typeof api.Tour, 'function');
  assert.equal(typeof api.CommandPalette, 'function');
  assert.equal(api.ResizablePanels, api.Splitter);
  assert.equal(api.FAB, api.FloatButton);
  assert.equal(typeof api.ConfirmProvider, 'function', `${format} must export ConfirmProvider`);
  assert.equal(api.Confirm, undefined, `${format} exposes confirmation only through its API`);
  assert.equal(api.Sortable, undefined, `${format} must not export the removed Sortable component`);
  function ManagedFeedback() {
    const confirmation = api.useConfirm();
    const messages = api.useMessage();
    assert.deepEqual(Object.keys(confirmation), ['confirm']);
    assert.deepEqual(Object.keys(messages), ['message']);
    assert.equal(typeof confirmation.confirm, 'function');
    assert.equal(typeof messages.message.success, 'function');
    assert.equal(typeof api.useNotification().open, 'function');
    assert.equal(typeof api.useLoadingBar().start, 'function');
    return createElement('span', null, 'Ready');
  }
  assert.match(
    renderToStaticMarkup(createElement(api.ConfigProvider, null, createElement(ManagedFeedback))),
    /Ready/,
  );
  function ManagedConfirmation() {
    assert.equal(typeof api.useConfirm().confirm, 'function');
    return null;
  }
  assert.equal(
    renderToStaticMarkup(
      createElement(api.ConfirmProvider, null, createElement(ManagedConfirmation)),
    ),
    '',
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
  const configEntry =
    format === 'ESM'
      ? await import('@ifhover/leaf-ui/config-provider')
      : require('@ifhover/leaf-ui/config-provider');
  const theme = {
    tokens: { borderWidth: 2, controlShadow: '2px 2px 0 #222', surfaceShadow: '4px 4px 0 #222' },
    components: { Button: { borderWidth: 2, hover: { background: '#eee' } } },
  };
  const themeSnapshot = JSON.stringify(theme);
  const element = createElement(
    configEntry.ConfigProvider,
    { theme },
    createElement(
      api.ConfigProvider,
      { theme: { components: { Button: { hover: { shadow: 'none' } } } } },
      createElement(api.Button, null, 'Portable theme'),
    ),
  );
  const html = renderToStaticMarkup(element);
  assert.equal(renderToStaticMarkup(element), html, `${format}: deterministic theme SSR`);
  assert.match(html, /--leaf-border-width:2px/);
  assert.match(html, /--leaf-control-shadow:2px 2px 0 #222/);
  assert.match(html, /--leaf-component-button-hover-background:#eee/);
  assert.match(html, /--leaf-component-button-hover-shadow:none/);
  assert.doesNotMatch(html, /<style|\[object Object\]/u);
  assert.equal(JSON.stringify(theme), themeSnapshot, `${format}: theme stays pure`);
  const buttonEntry =
    format === 'ESM' ? await import('@ifhover/leaf-ui/button') : require('@ifhover/leaf-ui/button');
  const defaults = renderToStaticMarkup(
    createElement(
      api.ConfigProvider,
      {
        components: {
          Button: { size: 'lg', variant: 'outline' },
          Input: { size: 'sm', defaultValue: 'Leaf defaults' },
        },
      },
      createElement(buttonEntry.Button, null, 'Subpath defaults'),
      createElement(api.InputSearch, { 'aria-label': 'Search defaults', enterButton: 'Find' }),
    ),
  );
  assert.match(defaults, /leaf-button--outline leaf-button--lg/);
  assert.match(defaults, /leaf-button--solid leaf-button--sm/);
  assert.match(defaults, /value="Leaf defaults"/);
  const resetDefaults = renderToStaticMarkup(
    createElement(
      api.ConfigProvider,
      { components: { Button: { variant: 'outline', disabled: true } } },
      createElement(
        api.ConfigProvider,
        { components: { Button: null } },
        createElement(buttonEntry.Button, null, 'Reset defaults'),
      ),
    ),
  );
  assert.match(resetDefaults, /leaf-button--solid leaf-button--md/);
  assert.doesNotMatch(resetDefaults, /disabled=""/);
  for (const name of ['ButtonControl', 'InputControl', 'SelectControl', 'ModalBase'])
    assert.ok(!(name in api), `${name} must remain internal`);
  const inputEntry =
    format === 'ESM' ? await import('@ifhover/leaf-ui/input') : require('@ifhover/leaf-ui/input');
  const selectEntry =
    format === 'ESM' ? await import('@ifhover/leaf-ui/select') : require('@ifhover/leaf-ui/select');
  assert.ok(
    !('ButtonControl' in buttonEntry),
    'Button subpath must not expose its internal control',
  );
  assert.ok(!('InputControl' in inputEntry), 'Input subpath must not expose its internal control');
  assert.ok(
    !('SelectControl' in selectEntry),
    'Select subpath must not expose its internal control',
  );
}
const defaultPropsModule = await readFile(
  new URL('dist/esm/config-provider/component-defaults.js', packageRoot),
  'utf8',
);
assert.ok(
  !/from\s+["'][.]/u.test(defaultPropsModule),
  'Default props types must not load component implementations at runtime',
);
const esmTypes = await readFile(new URL(entry.import.types, packageRoot), 'utf8');
assert.ok(
  !esmTypes.includes('.css') && !esmTypes.includes('.scss'),
  'Declarations must not reference extracted styles',
);
// Ordinary consumers must not need the optional table engine just to configure UI defaults.
const qualityDirectory = fileURLToPath(new URL('.quality/', packageRoot));
await mkdir(qualityDirectory, { recursive: true });
const consumerDirectory = await mkdtemp(path.join(qualityDirectory, 'defaults-consumer-'));
const consumerPath = path.join(consumerDirectory, 'consumer.tsx');
const consumerConfigPath = path.join(consumerDirectory, 'tsconfig.json');
const consumerSource = `
import { Button, ConfigProvider, type LeafTheme, type LeafComponentStateTokens, type LeafComponentDefaults, type DataTablePresentationProps, type LeafTranslation, type LeafTranslations } from '@ifhover/leaf-ui';
import { type LeafComponentStateTokens as ScopedStateTokens, type LeafTheme as ScopedTheme } from '@ifhover/leaf-ui/config-provider';
import leafPreset from '@ifhover/leaf-ui/tailwind';
const spacing: string = leafPreset.theme.extend.spacing.leaf;
const pack: LeafTranslation = { select: { placeholder: 'Choose' } };
const translations: LeafTranslations = { 'ja-JP': pack };
const languages = ['ja-JP', 'en-US'] as const;
const hover: LeafComponentStateTokens = { borderColor: '#123', shadow: 'none' };
const scopedHover: ScopedStateTokens = hover;
const customTheme: LeafTheme = { tokens: { borderWidth: 2, controlShadow: '2px 2px black', surfaceShadow: '4px 4px black' }, components: { Button: { borderWidth: 2, hover: scopedHover } } };
const scopedTheme: ScopedTheme = customTheme;
const presentation: DataTablePresentationProps = { size: 'sm', selection: 'multiple' };
const components: LeafComponentDefaults = {
  Button: { variant: 'outline' }, DataTable: presentation,
  DataTablePagination: { showSizeChanger: true }, VirtualList: { estimateSize: 36 },
};
export const example = <ConfigProvider components={components} locale={languages} translations={translations} theme={scopedTheme}><ConfigProvider theme={customTheme}><Button>Leaf</Button></ConfigProvider></ConfigProvider>;
`;
try {
  await writeFile(consumerPath, consumerSource);
  await writeFile(
    consumerConfigPath,
    JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'Bundler',
        jsx: 'react-jsx',
        strict: true,
        skipLibCheck: false,
        noEmit: true,
        resolveJsonModule: false,
        types: ['react', 'react-dom'],
        traceResolution: true,
        paths: {
          '@tanstack/react-table': ['./missing-table-peer.d.ts'],
          '@tanstack/table-core': ['./missing-table-peer.d.ts'],
        },
      },
      files: ['./consumer.tsx'],
    }),
  );
  const compiler = path.join(path.dirname(require.resolve('typescript/package.json')), 'bin/tsc');
  const resolution = execFileSync(process.execPath, [compiler, '--project', consumerConfigPath], {
    cwd: fileURLToPath(packageRoot),
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  });
  assert.doesNotMatch(
    resolution,
    /Resolving module ['"]@tanstack\/(?:react-table|table-core)/u,
    'Root declarations must not load the optional table peer',
  );
} finally {
  await unlink(consumerPath).catch(() => {});
  await unlink(consumerConfigPath).catch(() => {});
  await rmdir(consumerDirectory);
}
const baseCss = await readFile(new URL(manifest.exports['./styles.css'], packageRoot), 'utf8');
const foundationCss = await readFile(
  new URL('dist/esm/styles/foundation.css', packageRoot),
  'utf8',
);
assert.match(foundationCss, /--leaf-control-height:\s*36px/);
assert.match(baseCss, /@import ['"]\.\/foundation\.css['"]/);
assert.match(baseCss, /components\/message\.css/);
assert.match(baseCss, /components\/modal\.css/);
assert.ok(!baseCss.includes('.leaf-table'), 'Base styles do not include ordinary component styles');
const css = await readFile(new URL(manifest.exports['./styles/all.css'], packageRoot), 'utf8');
assert.match(css, /--leaf-control-height:\s*36px/);
assert.match(css, /--leaf-color-danger/);
assert.doesNotMatch(css, /\.leaf-org-chart|\.leaf-list[\s.{:_-]|\.leaf-segmented/);
for (const name of ['List', 'ListItem', 'OrgChart', 'Segmented']) {
  assert.ok(!(name in esm), `${name} is no longer exported from ESM`);
  assert.ok(!(name in cjs), `${name} is no longer exported from CommonJS`);
}
assert.equal(manifest.exports['./segmented'], undefined);
assert.equal(manifest.exports['./segmented/style.css'], undefined);
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
  'flex',
  'scroll-area',
  'scrollbar',
  'masonry',
  'menu',
  'back-top',
  'descriptions',
  'table',
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
  'file-list',
  'upload',
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
assert.equal(manifest.peerDependenciesMeta['@tanstack/react-table'].optional, true);
assert.equal(
  esm.DataTable,
  undefined,
  'The optional TanStack adapter must not enter the root barrel',
);
const adapter = await import('@ifhover/leaf-ui/table/tanstack');
const headless = await import('@tanstack/react-table');
function AdapterFixture() {
  const table = headless.useReactTable({
    data: [{ id: 'alice', name: 'Alice' }],
    columns: [{ accessorKey: 'name', header: 'Name' }],
    getRowId: (row) => row.id,
    getCoreRowModel: headless.getCoreRowModel(),
  });
  return createElement(adapter.DataTable, { table, pagination: false, 'aria-label': 'Records' });
}
assert.match(renderToStaticMarkup(createElement(AdapterFixture)), /Alice/);
const adapterCss = await readFile(
  new URL(manifest.exports['./table/tanstack/style.css'], packageRoot),
  'utf8',
);
for (const name of ['table', 'checkbox', 'radio', 'input', 'pagination', 'popover'])
  assert.ok(adapterCss.includes(`.leaf-${name}`), `Adapter CSS includes ${name}`);
assert.ok(!adapterCss.includes('.leaf-color-picker'), 'Adapter styles must remain scoped');
console.log('Package root:', fileURLToPath(packageRoot));
console.log(`Verified ${subpathCount} public JS subpaths and every CSS export.`);

for (const [format, extension] of [
  ['esm', 'js'],
  ['cjs', 'cjs'],
]) {
  const implementation = `dist/${format}/button/button.${extension}`;
  const browserImplementation = `dist/${format}/browser/modules/button/button.${extension}`;
  const originalMap = JSON.parse(
    await readFile(new URL(`${implementation}.map`, packageRoot), 'utf8'),
  );
  const browserMap = JSON.parse(
    await readFile(new URL(`${browserImplementation}.map`, packageRoot), 'utf8'),
  );
  assert.equal(
    browserMap.mappings.split(';').length,
    originalMap.mappings.split(';').length + 2,
    `${format}: source maps account for both automatic CSS imports`,
  );
}

for (const [specifier, expected, excluded] of [
  ['button', ['button', 'dropdown'], ['table', 'modal', 'input']],
  ['table', ['table', 'scrollbar', 'loading'], ['color-picker']],
  ['table/tanstack', ['table', 'checkbox', 'pagination'], ['color-picker']],
  ['date-picker', ['date-picker', 'calendar', 'time-picker'], ['color-picker']],
  ['config-provider', ['message', 'confirm', 'notification', 'loading-bar'], ['table']],
]) {
  const result = await build({
    stdin: {
      contents: `export * from '@ifhover/leaf-ui/${specifier}';`,
      resolveDir: fileURLToPath(packageRoot),
    },
    bundle: true,
    format: 'esm',
    platform: 'browser',
    outfile: 'automatic-styles.js',
    write: false,
    external: ['react', 'react-dom', 'react/*', 'react-dom/*'],
  });
  const styles = result.outputFiles.find((file) => file.path.endsWith('.css'))?.text ?? '';
  assert.match(
    styles,
    /--leaf-control-height:\s*36px/,
    `${specifier} automatically loads theme defaults`,
  );
  for (const name of expected)
    assert.ok(styles.includes(`.leaf-${name}`), `${specifier} automatically loads ${name}`);
  for (const name of excluded)
    assert.ok(!styles.includes(`.leaf-${name}`), `${specifier} excludes ${name}`);
}
const commonJsBrowser = await build({
  stdin: {
    contents: "module.exports = require('@ifhover/leaf-ui/button');",
    resolveDir: fileURLToPath(packageRoot),
  },
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  outfile: 'cjs-browser.js',
  write: false,
  external: ['react', 'react-dom', 'react/*', 'react-dom/*'],
});
assert.ok(
  commonJsBrowser.outputFiles.some(
    (file) =>
      file.path.endsWith('.css') &&
      file.text.includes('.leaf-button') &&
      /--leaf-control-height:\s*36px/.test(file.text),
  ),
);
console.log(
  'Verified automatic browser CSS, scoped visual dependencies and CSS-free Node SSR entries.',
);
