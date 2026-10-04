import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pluginSass } from '@rsbuild/plugin-sass';
import { defineConfig } from '@rspress/core';

const directory = path.dirname(fileURLToPath(import.meta.url));

const guideSidebar = [
  {
    text: '开始使用',
    items: [
      { text: '认识 Leaf UI', link: '/guide/introduction' },
      { text: '安装&快速开始', link: '/guide/getting-started' },
      { text: 'SSR 使用', link: '/guide/ssr' },
    ],
  },
  {
    text: '个性化',
    items: [
      { text: '定制主题', link: '/guide/theming' },
      { text: '使用图标', link: '/guide/icons' },
    ],
  },
];

const componentSidebar = [
  {
    text: '组件',
    items: [{ text: '组件总览', link: '/components/' }],
  },
  {
    text: '通用',
    items: [
      { text: 'Button', tag: '按钮', link: '/components/button' },
      { text: 'Divider', tag: '分割线', link: '/components/divider' },
    ],
  },
  {
    text: '导航',
    items: [
      { text: 'Steps', tag: '步骤条', link: '/components/steps' },
      { text: 'Breadcrumb', tag: '面包屑', link: '/components/breadcrumb' },
      { text: 'Pagination', tag: '分页', link: '/components/pagination' },
      { text: 'Tabs', tag: '标签页', link: '/components/tabs' },
    ],
  },
  {
    text: '数据展示',
    items: [
      { text: 'Tag', tag: '标签', link: '/components/tag' },
      { text: 'Badge', tag: '角标', link: '/components/badge' },
      { text: 'Avatar', tag: '头像', link: '/components/avatar' },
      { text: 'Card', tag: '卡片', link: '/components/card' },
      { text: 'Collapse', tag: '折叠面板', link: '/components/collapse' },
      { text: 'Tree', tag: '树', link: '/components/tree' },
    ],
  },
  {
    text: '数据录入',
    items: [
      { text: 'Input', tag: '输入框', link: '/components/input' },
      { text: 'InputNumber', tag: '数字输入框', link: '/components/input-number' },
      { text: 'Textarea', tag: '文本域', link: '/components/textarea' },
      { text: 'Checkbox', tag: '复选框', link: '/components/checkbox' },
      { text: 'Radio', tag: '单选框', link: '/components/radio' },
      { text: 'Switch', tag: '开关', link: '/components/switch' },
      { text: 'Slider', tag: '滑动输入条', link: '/components/slider' },
      { text: 'Rate', tag: '评分', link: '/components/rate' },
      { text: 'Select', tag: '选择器', link: '/components/select' },
      { text: 'AutoComplete', tag: '自动完成', link: '/components/auto-complete' },
      { text: 'Cascader', tag: '级联选择', link: '/components/cascader' },
      { text: 'TreeSelect', tag: '树选择器', link: '/components/tree-select' },
      { text: 'ColorPicker', tag: '颜色选择器', link: '/components/color-picker' },
      { text: 'Form', tag: '表单', link: '/components/form' },
    ],
  },
  {
    text: '日期与时间',
    items: [
      { text: 'DatePicker', tag: '日期选择器', link: '/components/date-picker' },
      { text: 'TimePicker', tag: '时间选择器', link: '/components/time-picker' },
      { text: 'DateTimePicker', tag: '日期时间选择器', link: '/components/date-time-picker' },
      { text: 'DateRangePicker', tag: '日期区间选择器', link: '/components/date-range-picker' },
      { text: 'Calendar', tag: '日历', link: '/components/calendar' },
    ],
  },
  {
    text: '反馈与交互',
    items: [
      { text: 'Dropdown', tag: '下拉菜单', link: '/components/dropdown' },
      { text: 'Modal', tag: '弹窗', link: '/components/modal' },
      { text: 'Drawer', tag: '抽屉', link: '/components/drawer' },
      { text: 'Confirm', tag: '确认框', link: '/components/confirm' },
      { text: 'Alert', tag: '警告提示', link: '/components/alert' },
      { text: 'Result', tag: '结果', link: '/components/result' },
      { text: 'Message', tag: '消息提示', link: '/components/message' },
      { text: 'Loading', tag: '加载', link: '/components/loading' },
      { text: 'Skeleton', tag: '骨架屏', link: '/components/skeleton' },
      { text: 'Progress', tag: '进度条', link: '/components/progress' },
      { text: 'Tooltip', tag: '文字提示', link: '/components/tooltip' },
      { text: 'Popover', tag: '气泡卡片', link: '/components/popover' },
    ],
  },
  {
    text: '配置',
    items: [{ text: 'ConfigProvider', tag: '全局配置', link: '/components/config-provider' }],
  },
];

const englishLabels: Record<string, string> = {
  开始使用: 'Getting started',
  '认识 Leaf UI': 'Introduction',
  '安装&快速开始': 'Installation & quick start',
  'SSR 使用': 'SSR usage',
  个性化: 'Personalization',
  定制主题: 'Theming',
  使用图标: 'Icons',
  组件: 'Components',
  组件总览: 'Overview',
  通用: 'General',
  导航: 'Navigation',
  数据展示: 'Data display',
  数据录入: 'Data entry',
  日期与时间: 'Date and time',
  反馈与交互: 'Feedback',
  配置: 'Configuration',
};
const englishSidebar = (items: typeof guideSidebar | typeof componentSidebar): typeof items =>
  items.map((item) => ({
    ...item,
    text: englishLabels[item.text] ?? item.text,
    items: item.items.map((child) => ({
      ...child,
      text: englishLabels[child.text] ?? child.text,
      tag: undefined,
    })),
  }));

export default defineConfig({
  base: process.env.LEAF_DOCS_BASE || '/',
  root: path.join(directory, 'docs'),
  themeDir: path.join(directory, 'theme'),
  title: 'Leaf UI',
  description: '轻盈、自然、可定制的 React 组件库。统一的基础组件与表单，让界面自然生长。',
  lang: 'zh',
  locales: [
    { lang: 'zh', label: '简体中文' },
    {
      lang: 'en',
      label: 'English',
      description: 'Lightweight, natural and customizable React components.',
    },
  ],
  icon: '/leaf.svg',
  logo: '/leaf.svg',
  logoText: 'Leaf UI',
  outDir: 'doc_build',
  mediumZoom: { selector: '.rspress-doc img:not([data-no-zoom])' },
  markdown: { link: { checkDeadLinks: true } },
  themeConfig: {
    darkMode: 'light',
    locales: [
      {
        lang: 'zh',
        label: '简体中文',
        sidebar: { '/guide/': guideSidebar, '/components/': componentSidebar },
      },
      {
        lang: 'en',
        label: 'English',
        nav: [
          { text: 'Guide', link: '/guide/introduction', activeMatch: '^/en/guide/' },
          { text: 'Components', link: '/components/', activeMatch: '^/en/components/' },
          { text: 'Changelog', link: '/changelog', activeMatch: '^/en/changelog' },
        ],
        sidebar: {
          '/en/guide/': englishSidebar(guideSidebar),
          '/en/components/': englishSidebar(componentSidebar),
        },
      },
    ],
    nav: [
      { text: '指南', link: '/guide/introduction', activeMatch: '^/guide/' },
      { text: '组件', link: '/components/', activeMatch: '^/components/' },
      { text: '更新记录', link: '/changelog', activeMatch: '^/changelog' },
    ],
    sidebar: { '/guide/': guideSidebar, '/components/': componentSidebar },
    socialLinks: [{ icon: 'github', mode: 'link', content: 'https://github.com/ifhover/leaf-ui' }],
  },
  builderConfig: {
    plugins: [pluginSass()],
    resolve: {
      alias: {
        '@sudden3/leaf-ui$': path.resolve(directory, '../../packages/react/src/index.ts'),
        '@sudden3/leaf-ui/styles.css$': path.resolve(
          directory,
          '../../packages/react/src/styles/index.scss',
        ),
      },
    },
  },
});
