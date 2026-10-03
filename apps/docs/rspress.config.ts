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
      { text: '安装', link: '/guide/installation' },
      { text: '快速开始', link: '/guide/getting-started' },
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
    items: [{ text: 'Button', tag: '按钮', link: '/components/button' }],
  },
  {
    text: '数据录入',
    items: [
      { text: 'Input', tag: '输入框', link: '/components/input' },
      { text: 'Textarea', tag: '文本域', link: '/components/textarea' },
      { text: 'Checkbox', tag: '复选框', link: '/components/checkbox' },
      { text: 'Radio', tag: '单选框', link: '/components/radio' },
      { text: 'Switch', tag: '开关', link: '/components/switch' },
      { text: 'Select', tag: '选择器', link: '/components/select' },
      { text: 'AutoComplete', tag: '自动完成', link: '/components/auto-complete' },
      { text: 'Cascader', tag: '级联选择', link: '/components/cascader' },
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
    ],
  },
  {
    text: '反馈与交互',
    items: [
      { text: 'Dropdown', tag: '下拉菜单', link: '/components/dropdown' },
      { text: 'Modal', tag: '弹窗', link: '/components/modal' },
      { text: 'Confirm', tag: '确认框', link: '/components/confirm' },
      { text: 'Alert', tag: '警告提示', link: '/components/alert' },
      { text: 'Message', tag: '消息提示', link: '/components/message' },
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
  安装: 'Installation',
  快速开始: 'Quick start',
  'SSR 使用': 'SSR usage',
  个性化: 'Personalization',
  定制主题: 'Theming',
  使用图标: 'Icons',
  组件: 'Components',
  组件总览: 'Overview',
  通用: 'General',
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
